const app = null; // firebase removed
const db = null;
const storage = null;
const auth = null;


// Using api_adapter to replace Firebase functionality
// Include this file or ensure API is available globally: api_adapter.js
// app.js — общая логика для просмотра файлов (модуль)
// firebase import removed
// firebase import removed
// firebase import removed
// firebase import removed
// firebase import removed

const app = // firebase initialize removedconst db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

const listEl = document.getElementById('list');
const searchInput = document.getElementById('search');
const filterType = document.getElementById('filterType');
const refreshBtn = document.getElementById('refreshBtn');

const viewerModal = document.getElementById('viewerModal');
const viewerBody = document.getElementById('viewerBody');
const closeBtn = document.getElementById('closeModal');
if (closeBtn) closeBtn.addEventListener('click', () => { viewerModal.classList.add('hidden'); viewerBody.innerHTML = ''; });

let allFiles = [];

// realtime listener: collection "files", ordered by createdAt desc
const filesCol = collection(db, 'files');
const q = query(filesCol, orderBy('createdAt', 'desc'));

/* replaced onSnapshot realtime listener with API.loadFilesFromServer */
API.loadFilesFromServer().then(renderList).catch(e=>console.error(e));
{
  allFiles = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  renderList(allFiles);
}, err => {
  if(listEl) listEl.innerHTML = `<div class="error">Не удалось получить список файлов: ${err.message}</div>`;
  console.error(err);
});

function renderList(items) {
  const filtered = applySearchAndFilter(items);
  if(!listEl) return;
  if(filtered.length === 0){
    listEl.innerHTML = '<div class="empty">Нет файлов (или не совпадает поиск).</div>';
    return;
  }
  listEl.innerHTML = filtered.map(f => renderCard(f)).join('');
  // attach handlers
  document.querySelectorAll('.open-btn').forEach(btn=>{
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const file = allFiles.find(x => x.id === id);
      if(!file){ alert('Файл не найден'); return; }
      openViewer(file);
    });
  });
}

function renderCard(f){
  const icon = chooseIcon(f.mime || '');
  const tagsHtml = (f.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join(' ');
  return `
    <article class="file-card">
      <div class="meta">
        <div class="icon">${icon}</div>
        <div class="info">
          <div class="title">${escapeHtml(f.title || f.name || '')}</div>
          <div class="sub">${escapeHtml(f.name || '')} · ${formatBytes(f.size || 0)} · ${escapeHtml(f.topic||'')}</div>
          <div class="tags">${tagsHtml}</div>
        </div>
      </div>
      <div class="actions">
        <button class="open-btn" data-id="${escapeHtml(f.id)}">Открыть</button>
        <a class="rawlink" href="${escapeHtml(f.downloadURL || '')}" target="_blank" rel="noopener">Открыть в новой</a>
      </div>
    </article>
  `;
}

function chooseIcon(mime){
  if(!mime) return '📄';
  if(mime.includes('pdf')) return '📕';
  if(mime.startsWith('image')) return '🖼️';
  if(mime.startsWith('text')) return '📄';
  return '📁';
}

function escapeHtml(s){
  return String(s || '').replace(/[&<>"']/g, function (m) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
  });
}
function formatBytes(bytes){ bytes = Number(bytes)||0; if(bytes<1024) return bytes + ' B'; const units = ['KB','MB','GB']; let i=0; while(bytes>=1024 && i<units.length-1){ bytes/=1024; i++; } return bytes.toFixed(1)+' '+units[i]; }

function applySearchAndFilter(items){
  const qv = (searchInput && searchInput.value || '').trim().toLowerCase();
  const tp = (filterType && filterType.value) || '';
  return items.filter(f=>{
    if(tp){
      if(tp === 'pdf' && !(f.mime && f.mime.includes('pdf'))) return false;
      if(tp === 'image' && !(f.mime && f.mime.startsWith('image'))) return false;
      if(tp === 'text' && !(f.mime && f.mime.startsWith('text'))) return false;
      if(tp === 'other' && (f.mime && (f.mime.includes('pdf') || f.mime.startsWith('image') || f.mime.startsWith('text')))) return false;
    }
    if(!qv) return true;
    const hay = ((f.title||'') + ' ' + (f.name||'') + ' ' + (f.topic||'') + ' ' + (f.chapter||'') + ' ' + (f.tags||[]).join(' ') + ' ' + (f.fullText||'')).toLowerCase();
    return hay.includes(qv);
  });
}

if (searchInput) searchInput.addEventListener('input', () => renderList(allFiles));
if (filterType) filterType.addEventListener('change', () => renderList(allFiles));
if (refreshBtn) refreshBtn.addEventListener('click', () => renderList(allFiles));

async function openViewer(file){
  if(!viewerBody || !viewerModal) return;
  if(!file.downloadURL){
    viewerBody.innerHTML = '<div class="error">Нет ссылки на файл.</div>';
    viewerModal.classList.remove('hidden');
    return;
  }
  const url = file.downloadURL;
  viewerBody.innerHTML = '<div class="loading">Загружаю...</div>';
  viewerModal.classList.remove('hidden');

  try {
    if((file.mime && file.mime.includes('pdf')) || url.toLowerCase().endsWith('.pdf')){
      const pdf = await pdfjsLib.getDocument(url).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width; canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
      viewerBody.innerHTML = '';
      const info = document.createElement('div'); info.className='viewer-top';
      info.innerHTML = `<div>PDF: ${escapeHtml(file.title || file.name)}</div><a href="${escapeHtml(url)}" target="_blank" rel="noopener">Открыть в новой вкладке</a>`;
      viewerBody.appendChild(info);
      viewerBody.appendChild(canvas);
      return;
    }

    if(file.mime && file.mime.startsWith('image') || url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)){
      viewerBody.innerHTML = `<div class="viewer-top"><div>${escapeHtml(file.title||file.name)}</div><a href="${escapeHtml(url)}" target="_blank" rel="noopener">Открыть в новой вкладке</a></div>`;
      const img = document.createElement('img'); img.className='viewer-image'; img.src = url; img.alt = file.name || '';
      viewerBody.appendChild(img);
      return;
    }

    const resp = await fetch(url);
    if(!resp.ok) throw new Error('Ошибка загрузки файла');
    const ct = resp.headers.get('content-type') || '';
    if(ct.includes('text') || url.match(/\.(txt|md|json|csv)$/i)){
      const txt = await resp.text();
      viewerBody.innerHTML = `<div class="viewer-top"><div>${escapeHtml(file.title || file.name)}</div><a href="${escapeHtml(url)}" target="_blank" rel="noopener">Открыть в новой вкладке</a></div><pre class="textview">${escapeHtml(txt)}</pre>`;
      return;
    }

    viewerBody.innerHTML = `<div class="viewer-top"><div>Не удаётся отобразить файл (тип ${escapeHtml(file.mime||'неизвестен')}).</div><a href="${escapeHtml(url)}" target="_blank" rel="noopener">Открыть / Скачать</a></div>`;
  } catch(e){
    viewerBody.innerHTML = `<div class="error">Ошибка просмотра: ${escapeHtml(e.message || e.toString())}. Откройте в новой вкладке.</div>`;
    console.error(e);
  }
}