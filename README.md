# Онлайн-кабинет — Подробная инструкция (Firebase + GitHub Pages)

Этот README подробно объясняет, как настроить Firebase, сделать рабочий вход через Google, устранить частые ошибки, запустить проект локально и задеплоить на GitHub Pages.

---

## Содержание
1. Быстрый старт
2. Firebase — шаг за шагом
3. Authorized domains и ошибки входа через Google
4. Правила безопасности (Firestore и Storage)
5. Локальная проверка и CORS / OAuth
6. Как пользоваться импортом ZIP
7. Устранение ошибок — чеклист
8. Деплой на GitHub Pages

---

## 1) Быстрый старт
1. Распакуй проект в папку и открой её в VS Code.
2. Открой `firebase-config.js` и вставь свой `firebaseConfig` (см. раздел 2).
3. Открой Firebase Console и включи Authentication → Google.
4. Создай Firestore и Storage.
5. Настрой правила безопасности (раздел 4).
6. Запусти Live Server в VS Code или открой `index.html` через локальный HTTP-сервер.
7. Перейди в `admin.html`, войди через Google и попробуй загрузить файл или ZIP-архив.

---

## 2) Firebase — получение конфигурации
1. Перейди в https://console.firebase.google.com и создай проект (Add project).
2. В проекте → Build → Authentication → Sign-in method → включи **Google**.
3. Build → Firestore Database → Create database (production / тест).
4. Build → Storage → Create bucket.
5. Project settings → Ваши приложения (Web app) → Add App (</>) → Firebase выдаст объект `firebaseConfig`.
   Пример:
```js
export const firebaseConfig = {
  apiKey: "AIza....",
  authDomain: "my-online-notebook.firebaseapp.com",
  projectId: "my-online-notebook",
  storageBucket: "my-online-notebook.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcd1234"
};
```
Скопируй и вставь этот объект в файл `firebase-config.js`.

---

## 3) Authorized domains и ошибка входа через Google
Если при попытке входа появляется ошибка вида **"This domain is not authorized for OAuth operations for your project"** или похожая — значит ты не добавил домен:

**Что нужно добавить в Firebase Console → Authentication → Sign-in method → Authorized domains:**
- `localhost`
- `127.0.0.1`
- `yourusername.github.io` (когда будешь хостить на GitHub Pages)
- `your-custom-domain.com` (если используешь собственный домен)

Если тестируешь локально через `file://` (открывая файл напрямую), Google OAuth **не будет работать**. Всегда используй HTTP (Live Server или простой `python -m http.server`).

---

## 4) Правила безопасности (рекомендации)
Пример, чтобы **все могли читать**, а **писать — только авторизованные**:
**Firestore rules**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Storage rules**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Если хочешь — разреши запись только своему UID (более безопасно):
- Узнать свой UID можно, войдя в `admin.html` → после авторизации UID появится в статусе.
- Подставь UID в правила: `allow write: if request.auth != null && request.auth.uid == 'ВАШ_UID';`

---

## 5) Локальная проверка и OAuth (важно)
- Запускай локальный сервер: `Live Server` в VS Code или `python -m http.server 5500`.
- Адрес в браузере: `http://127.0.0.1:5500` или `http://localhost:5500`.
- В Authentication → Authorized domains обязательно добавь `127.0.0.1` и `localhost`.

---

## 6) Импорт ZIP (как работает)
- В `admin.html` есть поле загрузки. Если ты выбираешь `.zip`, скрипт распакует архив в браузере (JSZip) и загрузит все файлы в Storage, создаст метадокументы в Firestore.
- Структура: вложенные папки в ZIP будут проигнорированы, используются только имена файлов (без путей).
- Большие архивы могут занять время — следи за статусом в админке.

---

## 7) Чеклист устранения ошибок (быстро)
- [ ] Вставил `firebaseConfig` в `firebase-config.js`
- [ ] Включил Google Sign-in
- [ ] Добавил `localhost` и `127.0.0.1` в Authorized domains
- [ ] Запускаю сайт через HTTP (не file://)
- [ ] Включил Firestore и Storage
- [ ] Проверил правила безопасности
- [ ] При проблемах — открыл DevTools → Console и прислал ошибки (я помогу)

---

## 8) Деплой на GitHub Pages
1. Создай репозиторий GitHub и запушь содержимое проекта.
2. В Settings → Pages выбери:
   - Branch: `main`
   - Folder: `/` (root)
3. Сохрани — через минуту сайт будет доступен по `https://USERNAME.github.io/REPO`.
4. Добавь этот домен в Authorized domains в Firebase (USERNAME.github.io).

---

Если хочешь — могу:
- Автоматически подставить твой UID в правила (ты даёшь UID).
- Добавить пример GitHub Actions для автоматического деплоя из ветки `main`.
- Подключить Algolia / Cloud Function для полнотекстового поиска.

---

Хочешь, чтобы я прямо сейчас обновил ZIP и положил туда новую README + обновлённый styles + админ с импортером? Если да — скажи "да" и я соберу архив и дам ссылку.
