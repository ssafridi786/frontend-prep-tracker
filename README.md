# Frontend Interview Prep Dashboard

A modern, interactive 30-day study dashboard for frontend interview preparation. Built with HTML, CSS, and JavaScript, and powered by Firebase for real-time data sync, authentication, and persistent cloud storage.

---

## Features

- **30-Day Master Plan:** Track your daily progress, focus topics, and schedule.
- **Task Manager:** Add, edit, filter, and export tasks for each day.
- **Daily Schedule:** Editable time slots for planning and reflection.
- **Today's Focus:** Interactive checklist with progress bar, resource links, and custom items.
- **Progress Analytics:** Visual charts for overall and daily progress (Chart.js).
- **Daily Reflection:** Log learnings, challenges, goals, and productivity rating.
- **Learning Sources:** Add and manage resource links.
- **User Authentication:** Secure login/logout with Firebase Auth (email/password).
- **Cloud Sync:** All data is stored in Firestore under your user account, accessible from any device.
- **Responsive & Accessible:** Modern, mobile-friendly UI with dark mode support.

---

## Getting Started

### 1. **Clone the Repository**
```bash
git clone <your-repo-url>
cd Frontend-prep
```

### 2. **Firebase Setup**
- Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
- Enable **Firestore Database** and **Authentication (Email/Password)**.
- In your project settings, add a new web app and copy the Firebase config.
- Replace the `firebaseConfig` in `public/app.js` with your own.

### 3. **Project Structure**
```
Frontend-prep/
├── public/
│   ├── index.html        # Main dashboard UI
│   ├── app.js            # Main JS logic (modular Firebase)
│   ├── style.css         # Modern CSS styles
│   └── ...
├── firebase.json         # Firebase Hosting config
├── ...
```

### 4. **Local Development**
You can open `public/index.html` directly in your browser for local testing (Firestore/Auth will still work if config is correct).

---

## Deployment

### **Firebase Hosting**
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Login and initialize (if not done):
   ```bash
   firebase login
   firebase init hosting
   ```
3. Deploy:
   ```bash
   firebase deploy --only hosting
   ```
4. Visit the URL provided by Firebase CLI after deploy.

---

## Usage
- **Sign In:** Use your email/password to log in. (Create a user in Firebase Console if you don't have a sign-up form.)
- **Dashboard:** Track your daily progress, add tasks, edit schedule, and reflect on your learning.
- **All changes are saved to Firestore and synced in real time.**

---

## Customization
- **Add/Remove Focus Topics:** Use the UI to add custom focus items or mark all as done.
- **Edit Schedule:** Click the edit button on any time slot.
- **Add Learning Sources:** Use the sidebar to add resource links.
- **Dark Mode:** Follows system preference or can be toggled via browser tools.

---

## Troubleshooting
- **Sign In Issues:**
  - Make sure Email/Password Auth is enabled in Firebase Console.
  - User must exist (create in Firebase Console if needed).
- **Blank Page:**
  - Check browser console for JS errors.
  - Ensure `public/index.html` is deployed, not a default Firebase page.
- **Data Not Saving:**
  - Check Firestore rules and config.
  - Make sure you are logged in.

---

## Credits
- UI/UX: Custom CSS, inspired by modern dashboard design.
- Charts: [Chart.js](https://www.chartjs.org/)
- Backend: [Firebase](https://firebase.google.com/)

---

## License
MIT License. See `LICENSE` file for details.
