const app = null; // firebase removed
const db = null;
const storage = null;
const auth = null;


// Using api_adapter to replace Firebase functionality
// Include this file or ensure API is available globally: api_adapter.js
// diary.js — заметки сохраняются в Firestore under collection 'notes'
// firebase import removed
// firebase import removed
// firebase import removed
// firebase import removed

const app = // firebase initialize removedconst auth = getAuth(app);
const db = getFirestore(app);

const noteTitle = document.getElementById('noteTitle');
const noteInput = document.getElementById('noteInput');
const notePrivate = document.getElementById('notePrivate');
const saveNoteBtn = document.getElementById('saveNote');
const notesList = document.getElementById('notesList');

let currentUser = null;

onAuthStateChanged(auth, user => {
  currentUser = user;
  if(user){
    initNotesListener(user.uid);
  } else {
    if(notesList) notesList.innerHTML = '<div class="empty">Войдите чтобы видеть свои заметки.</div>';
  }
});

async function initNotesListener(uid){
  const notesCol = collection(db, 'notes');
  const q = query(notesCol, orderBy('createdAt','desc'));
  onSnapshot(q, snapshot=>{
    const docs = snapshot.docs.map(d=>({ id: d.id, ...d.data() }));
    const filtered = docs.filter(n => n.private ? n.uid === uid : true);
    renderNotes(filtered);
  }, err=>{
    if(notesList) notesList.innerHTML = `<div class="error">Ошибка: ${err.message}</div>`;
  });
}

function renderNotes(items){
  if(!notesList) return;
  if(items.length === 0){ notesList.innerHTML = '<div class="empty">Нет заметок.</div>'; return; }
  notesList.innerHTML = items.map(n=>`<article class="note"><h4>${escapeHtml(n.title||'Без названия')}</h4><div class="note-meta">${n.createdAt?.toDate?.()?.toLocaleString?.()||''}</div><p>${escapeHtml(n.text)}</p></article>`).join('');
}

function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

if(saveNoteBtn) saveNoteBtn.addEventListener('click', async ()=>{
  if(!currentUser){ alert('Войдите через Google чтобы сохранить заметку.'); return; }
  const title = noteTitle.value.trim();
  const text = noteInput.value.trim();
  const priv = notePrivate.checked;
  if(!text) return alert('Введите текст заметки.');
  try {
    await /* replaced addDoc -> API.postEvent */
API.postEvent({
      uid: currentUser.uid,
      title,
      text,
      private: priv,
      createdAt: serverTimestamp()
    });
    noteTitle.value = noteInput.value = '';
  } catch(e){
    alert('Ошибка сохранения: '+e.message);
  }
});