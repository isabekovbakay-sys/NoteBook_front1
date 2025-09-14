
// Using api_adapter to replace Firebase functionality
// Include this file or ensure API is available globally: api_adapter.js
// profile.js — вход через Google и показ инфы профиля
// firebase import removed
// firebase import removed
// firebase import removed

const app = // firebase initialize removedconst auth = getAuth(app);
const provider = new GoogleAuthProvider();

const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const userUid = document.getElementById('userUid');
const userPhoto = document.getElementById('userPhoto');

if(signInBtn) signInBtn.addEventListener('click', async ()=>{ try{ await signInWithPopup(auth, provider); }catch(e){ alert('Ошибка: '+e.message);} });
if(signOutBtn) signOutBtn.addEventListener('click', async ()=>{ await signOut(auth); });

onAuthStateChanged(auth, user=>{
  if(user){
    if(userName) userName.innerText = user.displayName || '-';
    if(userEmail) userEmail.innerText = user.email || '-';
    if(userUid) userUid.innerText = user.uid || '-';
    if(userPhoto) userPhoto.src = user.photoURL || '';
    if(signInBtn) signInBtn.style.display = 'none';
    if(signOutBtn) signOutBtn.style.display = 'inline-block';
  } else {
    if(userName) userName.innerText = '-';
    if(userEmail) userEmail.innerText = '-';
    if(userUid) userUid.innerText = '-';
    if(userPhoto) userPhoto.src = '';
    if(signInBtn) signInBtn.style.display = 'inline-block';
    if(signOutBtn) signOutBtn.style.display = 'none';
  }
});