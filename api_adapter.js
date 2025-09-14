const BASE_URL = "https://YOUR-BACKEND-URL.onrender.com/api";

// api_adapter.js - lightweight adapter to replace Firebase in this project
// Provides: API.loadFilesFromServer(), API.uploadFileToServer(file, name),
//           API.postEvent({title, body, date}), API.saveProfile(user, data)
const API = {
  async loadFilesFromServer() {
    const res = await fetch('/api/files');
    if(!res.ok) throw new Error('Failed to load files: ' + res.status);
    const items = await res.json();
    return items.map(it => ({ ...it, url: '/uploads/' + it.filename }));
  },
  async uploadFileToServer(file, name) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('name', name || file.name);
    const res = await fetch('/api/files', { method: 'POST', body: fd });
    if(!res.ok) throw new Error('Upload failed ' + res.status);
    return await res.json();
  },
  async postEvent(obj) {
    const res = await fetch('/api/events', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(obj) });
    if(!res.ok) throw new Error('postEvent failed ' + res.status);
    return await res.json();
  },
  async saveProfile(user, data) {
    const res = await fetch('/api/profile', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ user, data }) });
    if(!res.ok) throw new Error('saveProfile failed ' + res.status);
    return await res.json();
  }
};
// export for module environments
try { if(typeof module !== 'undefined') module.exports = API; } catch(e){}

// expose to browsers
try{ if(typeof window !== 'undefined') window.API = API; }catch(e){}
try{ if(typeof module !== 'undefined') module.exports = API; }catch(e){}
