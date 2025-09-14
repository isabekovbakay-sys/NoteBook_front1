const app = null; // firebase removed
const db = null;
const storage = null;
const auth = null;


// Using api_adapter to replace Firebase functionality
// Include this file or ensure API is available globally: api_adapter.js
// schedule.js — простое расписание в Firestore collection 'events'
// firebase import removed
// firebase import removed
// firebase import removed
// firebase import removed

const app = // firebase initialize removedconst auth = getAuth(app);
const db = getFirestore(app);

const eventTitle = document.getElementById('eventTitle');
const eventDate = document.getElementById('eventDate');
const eventTime = document.getElementById('eventTime');
const eventTopic = document.getElementById('eventTopic');
const eventLink = document.getElementById('eventLink');
const addEventBtn = document.getElementById('addEvent');
const eventsList = document.getElementById('eventsList');

let currentUser = null;

onAuthStateChanged(auth, user => {
  currentUser = user;
  if(user){
    initEventsListener();
  } else {
    if(eventsList) eventsList.innerHTML = '<div class="empty">Войдите чтобы видеть и добавлять события.</div>';
  }
});

function initEventsListener(){
  const eventsCol = collection(db, 'events');
  const q = query(eventsCol, orderBy('date','asc'));
  onSnapshot(q, snapshot=>{
    const docs = snapshot.docs.map(d=>({ id: d.id, ...d.data() }));
    renderEvents(docs);
  }, err=>{
    if(eventsList) eventsList.innerHTML = `<div class="error">Ошибка: ${err.message}</div>`;
  });
}

function renderEvents(items){
  if(!eventsList) return;
  if(items.length === 0){ eventsList.innerHTML = '<div class="empty">Нет событий.</div>'; return; }
  eventsList.innerHTML = items.map(e=>`<div class="event"><b>${escapeHtml(e.title)}</b> — ${escapeHtml(e.date)} ${escapeHtml(e.time||'')}<div>${escapeHtml(e.topic||'')}</div>${e.link?`<a href="${escapeHtml(e.link)}" target="_blank">Материал</a>`:''}</div>`).join('');
}

function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }

if(addEventBtn) addEventBtn.addEventListener('click', async ()=>{
  if(!currentUser){ alert('Войдите через Google чтобы добавить событие.'); return; }
  const title = eventTitle.value.trim();
  const date = eventDate.value;
  if(!title || !date) return alert('Заполни название и дату.');
  try {
    await /* replaced addDoc -> API.postEvent */
API.postEvent({
      uid: currentUser.uid,
      title,
      date,
      time: eventTime.value || '',
      topic: eventTopic.value || '',
      link: eventLink.value || '',
      createdAt: serverTimestamp()
    });
    eventTitle.value = eventDate.value = eventTime.value = eventTopic.value = eventLink.value = '';
  } catch(e){
    alert('Ошибка: '+e.message);
  }
});