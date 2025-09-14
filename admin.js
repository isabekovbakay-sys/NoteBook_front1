const app = null; // firebase removed
const db = null;
const storage = null;
const auth = null;


// Using api_adapter to replace Firebase functionality
// Include this file or ensure API is available globally: api_adapter.js
// admin.js — загрузка файлов в Firebase Storage и запись метаданных в Firestore
// firebase import removed
// firebase import removed
// firebase import removed
// firebase import removed
// firebase import removed

const app = // firebase initialize removedconst auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const authStatus = document.getElementById('authStatus');
const uploader = document.getElementById('uploader');
const fileInput = document.getElementById('fileInput');
const metaTitle = document.getElementById('metaTitle');
const metaTopic = document.getElementById('metaTopic');
const metaChapter = document.getElementById('metaChapter');
const metaTags = document.getElementById('metaTags');
const extractPdfText = document.getElementById('extractPdfText');
const uploadBtn = document.getElementById('uploadBtn');
const adminStatus = document.getElementById('adminStatus');

const provider = new GoogleAuthProvider();

signInBtn.addEventListener('click', async () => {
  try { await signInWithPopup(auth, provider); } catch(e){ alert('Ошибка входа: '+ e.message); console.error(e); }
});
signOutBtn.addEventListener('click', async ()=> { await signOut(auth); });

onAuthStateChanged(auth, user => {
  if(user){
    authStatus.innerText = `Вошёл: ${user.displayName || user.email} (UID: ${user.uid})`;
    signInBtn.style.display = 'none';
    signOutBtn.style.display = 'inline-block';
    uploader.style.display = 'block';
  } else {
    authStatus.innerText = 'Не авторизован';
    signInBtn.style.display = 'inline-block';
    signOutBtn.style.display = 'none';
    uploader.style.display = 'none';
  }
});

async function uploadBlobAsFile(blob, filename, extraMeta = {}) {
  const path = `files/${Date.now()}_${filename.replace(/\s+/g,'_')}`;
  const sRef = storageRef(storage, path);
  await /* replaced uploadBytes -> API.uploadFileToServer */
API.uploadFileToServer(blob);
  const downloadURL = await /* getDownloadURL replaced by using returned url from API */ '/uploads/<filename>';
  const doc = {
    name: filename,
    title: extraMeta.title || filename,
    topic: extraMeta.topic || '',
    chapter: extraMeta.chapter || '',
    tags: extraMeta.tags || [],
    mime: blob.type || '',
    size: blob.size || 0,
    storagePath: path,
    downloadURL,
    createdAt: serverTimestamp()
  };
  if(extraMeta.fullText) doc.fullText = extraMeta.fullText;
  await /* replaced addDoc -> API.postEvent */
API.postEvent(doc);
  return downloadURL;
}

uploadBtn.addEventListener('click', async () => {
  adminStatus.innerText = '';
  const user = auth.currentUser;
  if(!user){ adminStatus.innerText = 'Войдите через Google чтобы загрузить.'; return; }
  if(!fileInput.files || fileInput.files.length === 0){ adminStatus.innerText = 'Выберите файл.'; return; }
  const file = fileInput.files[0];

  const title = metaTitle.value.trim() || file.name;
  const topic = metaTopic.value.trim();
  const chapter = metaChapter.value.trim();
  const tags = (metaTags.value || '').split(',').map(t=>t.trim()).filter(Boolean);

  adminStatus.innerText = 'Подготовка...';

  try {
    if(file.name.toLowerCase().endsWith('.zip')) {
      // handle zip import
      adminStatus.innerText = 'Обнаружен ZIP — распаковываю и загружаю...';
      const zip = await JSZip.loadAsync(file);
      const entries = [];
      zip.forEach((relativePath, zipEntry) => {
        if(!zipEntry.dir) entries.push(zipEntry);
      });
      if(entries.length === 0) {
        adminStatus.innerText = 'ZIP пустой.';
        return;
      }
      let uploaded = 0;
      for(const e of entries){
        const blob = await e.async('blob');
        const fname = e.name.split('/').pop();
        adminStatus.innerText = `Загружаю ${fname} (${uploaded+1}/${entries.length})...`;
        try {
          await uploadBlobAsFile(blob, fname, { title: fname, topic, chapter, tags });
          uploaded++;
        } catch(err){
          console.error('Ошибка загрузки из ZIP для', fname, err);
        }
      }
      adminStatus.innerText = `Готово — загружено ${uploaded} файлов из ZIP.`;
      fileInput.value = '';
      return;
    }

    // normal single file upload
    adminStatus.innerText = 'Если PDF и включен экстракт — пытаюсь извлечь текст...';
    let fullText = '';
    if(extractPdfText.checked && file.type.includes('pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
        for(let p=1;p<=pdf.numPages;p++){
          const page = await pdf.getPage(p);
          const txtContent = await page.getTextContent();
          fullText += txtContent.items.map(i=>i.str).join(' ') + '\n';
          if(fullText.length > 800000) { fullText = fullText.slice(0, 800000); adminStatus.innerText = 'Текст усечён (слишком большой)'; break; }
        }
      } catch(e){ console.warn('PDF text extraction failed', e); }
    }

    adminStatus.innerText = 'Загружаю файл в Storage...';
    const downloadURL = await uploadBlobAsFile(file, file.name, { title, topic, chapter, tags, fullText });
    adminStatus.innerText = 'Готово — файл загружен: ' + downloadURL;
    fileInput.value = '';
    metaTitle.value = metaTopic.value = metaChapter.value = metaTags.value = '';
  } catch(e){
    adminStatus.innerText = 'Ошибка: ' + (e.message || e);
    console.error(e);
  }
});