// Firebase configuration will be provided externally in a real environment
const firebaseConfig = {
  apiKey: "AIzaSyAWzAYMWmvXL8-wG3thvE6taS4ts2BHlvM",
  authDomain: "frontend-prep-80104.firebaseapp.com",
  projectId: "frontend-prep-80104",
  storageBucket: "frontend-prep-80104.firebasestorage.app",
  messagingSenderId: "312816296390",
  appId: "1:312816296390:web:e64334dd40b59b8b4a52c7",
  measurementId: "G-F92X51S3Z1"
};


// Global data and state
const roadmapData = {
    totalDays: 30,
    sections: [
        {
            id: "internet-web",
            title: "Internet & Web Fundamentals",
            days: "1-3",
            color: "#FF6B6B",
            topics: ["How internet works", "HTTP/HTTPS", "DNS", "Domain names", "Hosting", "Browser basics", "Developer tools"],
        },
        {
            id: "html",
            title: "HTML Mastery", 
            days: "4-7",
            color: "#4ECDC4",
            topics: ["HTML5 semantic elements", "Forms", "Accessibility (a11y)", "SEO basics", "Meta tags"],
        },
        {
            id: "css",
            title: "CSS Expertise",
            days: "8-12", 
            color: "#45B7D1",
            topics: ["CSS Grid", "Flexbox", "Responsive design", "CSS preprocessors", "Animations", "BEM methodology"],
        },
        {
            id: "javascript",
            title: "JavaScript Fundamentals",
            days: "13-18",
            color: "#F9CA24",
            topics: ["ES6+ features", "DOM manipulation", "Event handling", "Async/await", "Promises", "Fetch API", "Error handling"],
        },
        {
            id: "react",
            title: "React Development", 
            days: "19-24",
            color: "#6C5CE7",
            topics: ["Components", "JSX", "Props", "State", "Hooks", "React Router", "Context API", "Testing basics"],
        },
        {
            id: "tools",
            title: "Build Tools & Version Control",
            days: "25-27",
            color: "#A55EEA", 
            topics: ["Git/GitHub", "NPM/Yarn", "Webpack basics", "Package managers", "Module bundlers"],
        },
        {
            id: "dsa-interview",
            title: "DSA & Interview Prep",
            days: "28-30",
            color: "#26DE81",
            topics: ["Arrays", "Objects", "Algorithms", "Problem solving", "Mock interviews", "System design basics"],
        }
    ]
};

const defaultTimeSlots = [
    {"time": "05:30-09:00", "duration": "3.5h", "focus": "Deep Learning", "description": "New concepts and theory"},
    {"time": "10:00-13:00", "duration": "3h", "focus": "Hands-on Practice", "description": "Coding and projects"}, 
    {"time": "14:00-17:00", "duration": "3h", "focus": "Advanced Topics", "description": "Complex concepts and patterns"},
    {"time": "18:30-20:30", "duration": "2h", "focus": "Interview Questions", "description": "Practice problems and review"},
    {"time": "22:00-23:30", "duration": "1.5h", "focus": "Review & Planning", "description": "Consolidation and next day prep"},
    {"time": "23:00-23:30", "duration": "0.5h", "focus": "Daily Reflection", "description": "Journal and habit tracking"}
];

const defaultLearningSources = [
    {"id": "src-1", "name": "Scrimba Pro", "url": "https://scrimba.com", "icon": "🎓"},
    {"id": "src-2", "name": "InstaByte.io", "url": "https://instabyte.io/p/interview-master-100", "icon": "💻"},
    {"id": "src-3", "name": "LeetCode", "url": "https://leetcode.com", "icon": "🧮"},
    {"id": "src-4", "name": "roadmap.sh", "url": "https://roadmap.sh/frontend", "icon": "🗺️"},
    {"id": "src-5", "name": "NotebookLM", "url": "https://notebooklm.google.com", "icon": "📚"},
    {"id": "src-6", "name": "FreeCodeCamp", "url": "https://freecodecamp.org", "icon": "🆓"},
];


// Firebase and App State
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let app, auth, db;
let userId = null;
let dbUnsubscribe = null; // To detach the Firestore listener on logout

let appState = {
    currentDay: 1,
    tasks: [],
    completedTopics: new Set(),
    dailyProgress: {},
    streakData: [],
    reflections: {},
    learningSources: [],
    scheduleData: {}
};
let editingTaskId = null;
let editingScheduleSlot = null;
let justCompletedTopicId = null;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        setupGlobalEventListeners();
        handleAuthentication();
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        showNotification("Could not initialize the application. Please refresh the page.", "Fatal Error");
    }
});

// Authentication Handling
function handleAuthentication() {
    document.getElementById('loadingIndicator').classList.add('active');
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userId = user.uid;
            document.getElementById('userIdDisplay').textContent = user.email || user.uid;
            document.getElementById('userInfo').classList.remove('hidden');
            document.getElementById('authContainer').classList.remove('active');
            document.getElementById('appContainer').style.display = 'flex';
            listenToDataChanges();
        } else {
            userId = null;
            if (dbUnsubscribe) dbUnsubscribe();
            document.getElementById('appContainer').style.display = 'none';
            document.getElementById('authContainer').classList.add('active');
            document.getElementById('userInfo').classList.add('hidden');
            setupLoginForm();
        }
        document.getElementById('loadingIndicator').classList.remove('active');
    });
    document.getElementById('logoutButton').addEventListener('click', () => {
        signOut(auth).catch(error => {
            console.error("Sign out error", error);
            showNotification("Error signing out. Please try again.", "Sign Out Error");
        });
    });
}

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const loginBtn = document.getElementById('loginButton');
        if (loginBtn) {
            loginBtn.onclick = async (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                try {
                    await signInWithEmailAndPassword(auth, email, password);
                } catch (err) {
                    let errorMessage = 'Login failed. Please try again.';
                    if (err.code === 'auth/wrong-password') {
                        errorMessage = 'Incorrect password. Please try again.';
                    } else if (err.code === 'auth/user-not-found') {
                        errorMessage = 'No user found with this email address.';
                    } else if (err.code === 'auth/invalid-credential') {
                         errorMessage = 'Invalid email or password.';
                    }
                    console.error("Login Error:", err.code);
                    showNotification(errorMessage, 'Login Error');
                }
            };
        }
    }
}

// Firestore Data Handling
async function listenToDataChanges() {
    if (dbUnsubscribe) dbUnsubscribe();
    if (!userId) return;
    try {
        const userDoc = doc(db, 'dashboards', userId);
        dbUnsubscribe = onSnapshot(userDoc, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                data.completedTopics = new Set(data.completedTopics || []);
                appState = { ...appState, ...data };
            } else {
                initializeAppStateForNewUser();
                saveDataToFirestore(appState);
            }
            renderAllComponents();
            document.getElementById('loadingIndicator').classList.remove('active');
        }, (error) => {
            console.error("Firestore snapshot error:", error);
            showNotification('Could not load real-time data. The app may be out of sync.', 'Connection Error');
            document.getElementById('loadingIndicator').classList.remove('active');
        });
    } catch (error) {
        console.error("Failed to listen to data changes:", error);
        showNotification("Could not establish a connection to the database.", "Fatal Error");
    }
}

function initializeAppStateForNewUser() {
    appState = {
        currentDay: 1,
        tasks: [],
        completedTopics: new Set(),
        dailyProgress: {},
        streakData: [],
        reflections: {},
        learningSources: defaultLearningSources,
        scheduleData: {},
        lastVisit: new Date().toISOString()
    };
}

async function saveDataToFirestore(dataToSave) {
    if (!userId) return;
    const userDoc = doc(db, 'dashboards', userId);
    const savableState = { ...dataToSave };
    if (savableState.completedTopics instanceof Set) {
        savableState.completedTopics = Array.from(savableState.completedTopics);
    }
    try {
        await setDoc(userDoc, savableState, { merge: true });
    } catch (error) {
        console.error("Failed to save data to Firestore:", error);
        showNotification("Could not save your progress. Please check your internet connection.", "Save Error");
    }
}

// Renders all UI components based on the current appState
function renderAllComponents() {
    updateCurrentDate();
    updateCurrentDay();
    updateStreakDisplay();
    renderRoadmapSections();
    showCurrentSection();
    renderSourceLinks();
    renderTimeSlots();
    populateSourceDropdowns();
    renderTaskTable();
    updateProgress();
    initializeCharts();
}

// Global Event Listeners
function setupGlobalEventListeners() {
    document.getElementById('addSourceBtn').addEventListener('click', addSource);
    document.getElementById('addNewTaskBtn').addEventListener('click', addNewTask);
    document.getElementById('exportWeeklyCSVBtn').addEventListener('click', exportWeeklyCSV);
    document.getElementById('statusFilter').addEventListener('change', filterTasks);
    document.getElementById('sourceFilter').addEventListener('change', filterTasks);

    // Modals
    document.getElementById('closeTaskModalBtn').addEventListener('click', closeTaskModal);
    document.getElementById('taskModal').addEventListener('click', (e) => { if (e.target.id === 'taskModal') closeTaskModal(); });
    document.getElementById('saveTaskBtn').addEventListener('click', saveTask);

    document.getElementById('closeScheduleModalBtn').addEventListener('click', closeModal);
    document.getElementById('scheduleModal').addEventListener('click', (e) => { if (e.target.id === 'scheduleModal') closeModal(); });
    document.getElementById('saveScheduleBtn').addEventListener('click', saveModalChanges);
    
    document.getElementById('closeConceptsModalBtn').addEventListener('click', closeConceptsModal);
    document.getElementById('saveConceptsBtn').addEventListener('click', closeConceptsModal);

    document.getElementById('genericModalCloseBtn').addEventListener('click', closeGenericModal);
    document.getElementById('genericModal').addEventListener('click', (e) => { if (e.target.id === 'genericModal') closeGenericModal(); });

    // Reflections
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            updateStarRating(parseInt(this.dataset.rating));
        });
    });
    document.getElementById('saveReflectionBtn').addEventListener('click', saveReflection);
    document.getElementById('markDayCompleteBtn').addEventListener('click', markDayComplete);

    // Gemini Features
    document.getElementById('suggestGoalsBtn').addEventListener('click', handleSuggestGoals);
}

// --- GEMINI API INTEGRATION ---
async function callGemini(prompt) {
    const spinner = document.getElementById('ai-spinner');
    const messageEl = document.getElementById('genericModalMessage');
    
    showNotification("", "✨ AI is thinking...");
    messageEl.style.display = 'none';
    spinner.style.display = 'block';

    const apiKey = ""; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
            return result.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Invalid response structure from API.");
        }
    } catch (error) {
        console.error("Gemini API call error:", error);
        showNotification("Sorry, there was an error communicating with the AI. Please try again later.", "AI Error");
        return null;
    } finally {
        spinner.style.display = 'none';
        messageEl.style.display = 'block';
    }
}

async function handleSuggestGoals() {
    const learning = document.getElementById('todayLearning').value.trim();
    const challenges = document.getElementById('todayChallenges').value.trim();

    if (!learning && !challenges) {
        showNotification("Please fill in what you learned or the challenges you faced first.", "Info Needed");
        return;
    }

    const prompt = `Based on my study session, suggest 3 actionable goals for tomorrow.
    What I learned today: "${learning}"
    Challenges I faced: "${challenges}"
    
    Provide only the list of 3 goals, each on a new line starting with a dash.`;

    const goals = await callGemini(prompt);

    if (goals) {
        document.getElementById('tomorrowGoals').value = goals;
        showNotification("Your new goals have been generated and added below!", "Goals Suggested!");
        saveReflection();
    }
}

async function handleExplainTopic(topic) {
    const prompt = `Explain the frontend development concept: "${topic}". Keep it concise (2-3 paragraphs) and easy for a beginner to understand. Use markdown for formatting.`;
    const explanation = await callGemini(prompt);
    if (explanation) {
        showNotification(explanation, `Explanation: ${topic}`);
    }
}


// --- MODAL AND NOTIFICATION ---
function showNotification(message, title = 'Notification') {
    document.getElementById('genericModalTitle').textContent = title;
    document.getElementById('genericModalMessage').innerHTML = message.replace(/\n/g, '<br>');
    
    const footer = document.getElementById('genericModalFooter');
    footer.innerHTML = '';
    const okButton = document.createElement('button');
    okButton.className = 'btn btn--primary';
    okButton.textContent = 'OK';
    okButton.onclick = closeGenericModal;
    footer.appendChild(okButton);

    document.getElementById('genericModal').classList.add('active');
}

function showConfirmation(message, onConfirm, title = 'Confirm') {
    document.getElementById('genericModalTitle').textContent = title;
    document.getElementById('genericModalMessage').textContent = message;

    const footer = document.getElementById('genericModalFooter');
    footer.innerHTML = '';

    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn--secondary';
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = closeGenericModal;

    const confirmButton = document.createElement('button');
    confirmButton.className = 'btn btn--primary';
    confirmButton.textContent = 'Confirm';
    confirmButton.onclick = () => {
        closeGenericModal();
        if (onConfirm) onConfirm();
    };

    footer.appendChild(cancelButton);
    footer.appendChild(confirmButton);

    document.getElementById('genericModal').classList.add('active');
}

function closeGenericModal() {
    document.getElementById('genericModal').classList.remove('active');
}


function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
}

function updateCurrentDay() {
    document.getElementById('currentDay').textContent = appState.currentDay;
    document.getElementById('todayDay').textContent = appState.currentDay;
}

function getCurrentSection() {
    for (const section of roadmapData.sections) {
        const [start, end] = section.days.split('-').map(Number);
        if (appState.currentDay >= start && appState.currentDay <= end) {
            return section;
        }
    }
    return roadmapData.sections[0];
}

function showCurrentSection() {
    const section = getCurrentSection();
    document.getElementById('sectionTitle').textContent = section.title;
    
    const topicsContainer = document.getElementById('sectionTopics');
    topicsContainer.innerHTML = '';
    
    section.topics.forEach((topic) => {
        const topicId = `${section.id}-${topic.replace(/\s+/g, '-')}`;
        const topicElement = document.createElement('div');
        topicElement.className = 'topic-item';
        const isCompleted = appState.completedTopics.has(topicId);
        if (isCompleted) topicElement.classList.add('completed');
        
        topicElement.innerHTML = `
            <input type="checkbox" id="topic-${topicId}" data-topic-id="${topicId}" ${isCompleted ? 'checked' : ''}>
            <label for="topic-${topicId}">${topic}</label>
            <div class="topic-actions">
                <button class="btn-explain" data-topic-name="${topic}">✨ Explain</button>
                <a href="https://www.google.com/search?q=frontend+development+${encodeURIComponent(topic)}" target="_blank" title="Search for resource">🔗</a>
            </div>
        `;
        topicElement.querySelector('input[type="checkbox"]').addEventListener('change', (e) => toggleTopic(topicId, e.target.checked));
        topicElement.querySelector('.btn-explain').addEventListener('click', (e) => handleExplainTopic(e.target.dataset.topicName));
        topicsContainer.appendChild(topicElement);
    });

    updateSectionProgress();
}

function toggleTopic(topicId, isChecked) {
    if (isChecked) {
        appState.completedTopics.add(topicId);
        justCompletedTopicId = topicId; 
        setTimeout(() => {
            openConceptsModalForDay();
        }, 200);
    } else {
        appState.completedTopics.delete(topicId);
    }
    updateProgress();
    saveDataToFirestore(appState);
    showCurrentSection(); 
}

function openConceptsModalForDay() {
    const container = document.getElementById('roadmapConceptsList');
    container.innerHTML = '';
    roadmapData.sections.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.style.marginBottom = '8px';
        const sectionTitle = document.createElement('h5');
        sectionTitle.textContent = section.title;
        sectionDiv.appendChild(sectionTitle);

        section.topics.forEach((topic) => {
            const topicId = `${section.id}-${topic.replace(/\s+/g, '-')}`;
            const isChecked = appState.completedTopics.has(topicId);
            const item = document.createElement('div');
            item.className = 'topic-item';
            if (isChecked) item.classList.add('completed');
            item.innerHTML = `
                <input type="checkbox" id="modal-topic-${topicId}" data-topic-id="${topicId}" ${isChecked ? 'checked' : ''}>
                <label for="modal-topic-${topicId}">${topic}</label>
            `;
            item.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
                toggleTopicInModal(topicId, e.target.checked);
            });
            sectionDiv.appendChild(item);
        });
        container.appendChild(sectionDiv);
    });
    document.getElementById('roadmapConceptsModal').classList.add('active');
}

function toggleTopicInModal(topicId, isChecked) {
     if (isChecked) {
        appState.completedTopics.add(topicId);
    } else {
        appState.completedTopics.delete(topicId);
    }
}


function closeConceptsModal() {
    document.getElementById('roadmapConceptsModal').classList.remove('active');
    saveDataToFirestore(appState);
    showCurrentSection();
    updateProgress();
    justCompletedTopicId = null;
}

function renderRoadmapSections() {
    const container = document.getElementById('roadmapSections');
    container.innerHTML = '';
    
    roadmapData.sections.forEach(section => {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'roadmap-section';
        sectionElement.style.borderLeftColor = section.color;
        
        const [start, end] = section.days.split('-').map(Number);
        if (appState.currentDay >= start && appState.currentDay <= end) {
            sectionElement.classList.add('active');
        }
        
        sectionElement.innerHTML = `
            <div class="section-info">
                <div class="section-name">${section.title}</div>
                <div class="section-days">Days ${section.days}</div>
            </div>
            <div class="section-progress-mini">
                <div class="progress-fill" style="width: ${getSectionProgress(section)}%; background: ${section.color}"></div>
            </div>
        `;
        
        sectionElement.addEventListener('click', () => jumpToSection(section));
        container.appendChild(sectionElement);
    });
}

function getSectionProgress(section) {
    const sectionTopics = section.topics.length;
    if (sectionTopics === 0) return 0;

    let completed = 0;
    section.topics.forEach((topic) => {
        const topicId = `${section.id}-${topic.replace(/\s+/g, '-')}`;
        if (appState.completedTopics.has(topicId)) {
            completed++;
        }
    });
    
    return Math.round((completed / sectionTopics) * 100);
}

function jumpToSection(section) {
    const [start] = section.days.split('-').map(Number);
    appState.currentDay = start;
    updateCurrentDay();
    showCurrentSection();
    updateProgress();
    renderRoadmapSections();
    saveDataToFirestore(appState);
}


function renderSourceLinks() {
    const container = document.getElementById('sourceLinks');
    container.innerHTML = '';
    
    (appState.learningSources || []).forEach(source => {
        const sourceElement = document.createElement('div');
        sourceElement.className = 'source-link';
        sourceElement.innerHTML = `
            <a href="${source.url}" target="_blank" class="source-link-anchor">
                <span class="source-icon">${source.icon || '🔗'}</span>
                <span class="source-name">${source.name}</span>
            </a>
            <div class="source-actions">
                <button class="source-action-btn delete-source-btn" data-source-id="${source.id}" title="Delete Source">✖</button>
            </div>
        `;
        container.appendChild(sourceElement);
    });

    container.querySelectorAll('.delete-source-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
             const sourceId = e.currentTarget.dataset.sourceId;
             deleteSource(sourceId);
        });
    });
}

function addSource() {
    const nameInput = document.getElementById('newSourceName');
    const urlInput = document.getElementById('newSourceUrl');
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();

    if (!name || !url) {
        showNotification("Please provide both a name and a URL for the new source.", "Input Error");
        return;
    }

    const newSource = {
        id: generateId(),
        name: name,
        url: url,
        icon: '🔗'
    };

    if (!appState.learningSources) appState.learningSources = [];
    appState.learningSources.push(newSource);
    saveDataToFirestore(appState);
    renderSourceLinks();
    populateSourceDropdowns();
    nameInput.value = '';
    urlInput.value = '';
}

function deleteSource(id) {
    showConfirmation('Are you sure you want to delete this source?', () => {
        appState.learningSources = appState.learningSources.filter(s => s.id !== id);
        saveDataToFirestore(appState);
        renderSourceLinks();
        populateSourceDropdowns();
    });
}

function renderTimeSlots() {
    const container = document.getElementById('timeSlots');
    container.innerHTML = '';
    defaultTimeSlots.forEach((slot, index) => {
        const slotData = appState.scheduleData[index] || {};
        const displayTime = slotData.time || slot.time;
        const [start, end] = displayTime.split('-');

        const slotElement = document.createElement('div');
        slotElement.className = 'time-slot';
        slotElement.dataset.slotIndex = index;
        
        slotElement.innerHTML = `
            <div class="slot-header">
                <div class="slot-time">${start}-${end}</div>
                <button class="edit-slot-btn" data-index="${index}">Edit</button>
            </div>
            <div class="slot-duration">${slot.duration}</div>
            <div class="slot-focus">${slot.focus}</div>
            <div class="slot-description">${slot.description}</div>
            ${slotData.note ? `<div class="slot-note">${slotData.note}</div>` : ''}
        `;

        slotElement.querySelector('.edit-slot-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            openModal(index);
        });
        container.appendChild(slotElement);
    });
}

function openModal(index) {
    editingScheduleSlot = index;
    const slotDefaults = defaultTimeSlots[index];
    const slotData = appState.scheduleData[index] || {};

    const displayTime = slotData.time || slotDefaults.time;
    const [start, end] = displayTime.split('-');

    document.getElementById('scheduleModalTitle').textContent = `Edit: ${slotDefaults.focus}`;
    document.getElementById('scheduleStartTime').value = start;
    document.getElementById('scheduleEndTime').value = end;
    document.getElementById('scheduleNotes').value = slotData.note || '';

    document.getElementById('scheduleModal').classList.add('active');
}

function closeModal() {
    document.getElementById('scheduleModal').classList.remove('active');
    editingScheduleSlot = null;
}

function saveModalChanges() {
    if (editingScheduleSlot === null) return;
    const index = editingScheduleSlot;
    const startTime = document.getElementById('scheduleStartTime').value;
    const endTime = document.getElementById('scheduleEndTime').value;
    const note = document.getElementById('scheduleNotes').value.trim();

    if (!appState.scheduleData[index]) {
        appState.scheduleData[index] = {};
    }

    appState.scheduleData[index] = {
        time: `${startTime}-${endTime}`,
        note: note
    };

    saveDataToFirestore(appState);
    renderTimeSlots();
    closeModal();
}

function populateSourceDropdowns() {
    const sources = appState.learningSources || [];
    const taskSource = document.getElementById('taskSource');
    const sourceFilter = document.getElementById('sourceFilter');
    
    const currentTaskVal = taskSource.value;
    const currentFilterVal = sourceFilter.value;
    
    taskSource.innerHTML = '<option value="">Select source</option>';
    sourceFilter.innerHTML = '<option value="all">All Sources</option>';

    sources.forEach(source => {
        const option1 = document.createElement('option');
        option1.value = source.name;
        option1.textContent = source.name;
        taskSource.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = source.name;
        option2.textContent = source.name;
        sourceFilter.appendChild(option2);
    });

    taskSource.value = currentTaskVal;
    sourceFilter.value = currentFilterVal;
}

// Task management
function renderTaskTable() {
    const tbody = document.getElementById('taskTableBody');
    tbody.innerHTML = '';
    
    const filteredTasks = getFilteredTasks();
    
    filteredTasks.forEach(task => {
        const row = document.createElement('tr');
        const source = (appState.learningSources || []).find(s => s.name === task.source);
        const sourceCell = source 
            ? `<td><a href="${source.url}" target="_blank">${task.source}</a></td>`
            : `<td>${task.source}</td>`;

        row.innerHTML = `
            <td>${task.name}</td>
            ${sourceCell}
            <td>${task.dueDate}</td>
            <td><span class="task-priority ${task.priority}">${task.priority}</span></td>
            <td><span class="task-status ${task.status}">${task.status.replace('-', ' ')}</span></td>
            <td class="task-actions">
                <button class="btn btn--outline btn--sm" onclick="editTask('${task.id}')">Edit</button>
                <button class="btn btn--outline btn--sm" onclick="deleteTask('${task.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if (filteredTasks.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align: center; color: var(--color-text-secondary);">No tasks found</td>';
        tbody.appendChild(row);
    }
}

function getFilteredTasks() {
    const statusFilter = document.getElementById('statusFilter').value;
    const sourceFilter = document.getElementById('sourceFilter').value;
    
    return (appState.tasks || []).filter(task => {
        const statusMatch = statusFilter === 'all' || task.status === statusFilter;
        const sourceMatch = sourceFilter === 'all' || task.source === sourceFilter;
        return statusMatch && sourceMatch;
    });
}

function filterTasks() {
    renderTaskTable();
}

function addNewTask() {
    editingTaskId = null;
    document.getElementById('modalTitle').textContent = 'Add New Task';
    document.getElementById('saveTaskBtn').textContent = 'Save Task';
    
    document.getElementById('taskForm').reset();
    
    document.getElementById('taskModal').classList.add('active');
}

function editTask(taskId) {
    const task = (appState.tasks || []).find(t => t.id === taskId);
    if (!task) return;
    
    editingTaskId = taskId;
    document.getElementById('modalTitle').textContent = 'Edit Task';
    document.getElementById('saveTaskBtn').textContent = 'Update Task';
    
    document.getElementById('taskName').value = task.name;
    document.getElementById('taskSource').value = task.source;
    document.getElementById('taskDueDate').value = task.dueDate;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskStatus').value = task.status;
    
    document.getElementById('taskModal').classList.add('active');
}

function deleteTask(taskId) {
    showConfirmation('Are you sure you want to delete this task?', () => {
        appState.tasks = (appState.tasks || []).filter(t => t.id !== taskId);
        renderTaskTable();
        updateProgress();
        saveDataToFirestore(appState);
    });
}

function saveTask() {
    const name = document.getElementById('taskName').value.trim();
    const source = document.getElementById('taskSource').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const priority = document.getElementById('taskPriority').value;
    const status = document.getElementById('taskStatus').value;
    
    if (!name || !source || !dueDate) {
        showNotification('Please fill in Name, Source, and Due Date fields', 'Input Error');
        return;
    }
    
    const task = {
        id: editingTaskId || generateId(),
        name,
        source,
        dueDate,
        priority,
        status,
        createdAt: editingTaskId ? (appState.tasks || []).find(t => t.id === editingTaskId).createdAt : new Date().toISOString()
    };
    
    if (editingTaskId) {
        const index = (appState.tasks || []).findIndex(t => t.id === editingTaskId);
        if (index > -1) {
            appState.tasks[index] = task;
        }
    } else {
        if (!appState.tasks) appState.tasks = [];
        appState.tasks.push(task);
    }
    
    closeTaskModal();
    renderTaskTable();
    updateProgress();
    saveDataToFirestore(appState);
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.remove('active');
    editingTaskId = null;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Progress tracking
function updateProgress() {
    const totalTopics = roadmapData.sections.reduce((sum, section) => sum + section.topics.length, 0);
    const completedCount = appState.completedTopics.size;
    const overallPercentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
    
    document.getElementById('overallProgress').style.width = `${overallPercentage}%`;
    document.getElementById('progressPercentage').textContent = `${overallPercentage}%`;
    
    updateSectionProgress();
    
    if (!appState.dailyProgress) appState.dailyProgress = {};
    appState.dailyProgress[appState.currentDay] = {
        topicsCompleted: Array.from(appState.completedTopics).length,
        tasksCompleted: (appState.tasks || []).filter(t => t.status === 'completed').length,
        totalTasks: (appState.tasks || []).length,
        date: new Date().toISOString()
    };
    
    updateCharts();
}

function updateSectionProgress() {
    const currentSection = getCurrentSection();
    const sectionPercentage = getSectionProgress(currentSection);
    const sectionProgressElement = document.getElementById('sectionProgress');
    if (sectionProgressElement) {
        sectionProgressElement.style.width = `${sectionPercentage}%`;
    }
}

// Streak management
function updateStreakDisplay() {
    const streakCount = calculateCurrentStreak();
    document.getElementById('streakCount').textContent = streakCount;
    
    const chainContainer = document.getElementById('streakChain');
    chainContainer.innerHTML = '';
    
    const streakData = appState.streakData || [];
    for (let i = 0; i < 14; i++) {
        const dayIndex = streakData.length - 14 + i;
        if (dayIndex < 0) continue;

        const link = document.createElement('div');
        link.className = 'chain-link';
        if (streakData[dayIndex]) {
            // Day was completed
        } else {
            link.classList.add('missed');
        }
        chainContainer.appendChild(link);
    }
}

function calculateCurrentStreak() {
    let streak = 0;
    const streakData = appState.streakData || [];
    for (let i = streakData.length - 1; i >= 0; i--) {
        if (streakData[i]) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

function markDayComplete() {
    const currentReflection = (appState.reflections || {})[appState.currentDay];
    if (!currentReflection || (!currentReflection.learning && !currentReflection.challenges && !currentReflection.goals)) {
        showNotification('Please complete your daily reflection first!', 'Reflection Needed');
        return;
    }
    
    if (!appState.streakData) appState.streakData = [];
    // Fill any missed days up to the current day
    while (appState.streakData.length < appState.currentDay -1) {
        appState.streakData.push(false);
    }
    
    appState.streakData[appState.currentDay - 1] = true;
    
    if (appState.currentDay < 30) {
        appState.currentDay++;
    }
    
    saveDataToFirestore(appState).then(() => {
        showNotification('Day marked as complete! Great job! 🎉', 'Progress Saved');
        updateStreakDisplay();
        updateCurrentDay();
        showCurrentSection();
        renderRoadmapSections();
    });
}

function updateStarRating(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}

function saveReflection() {
    const learning = document.getElementById('todayLearning').value.trim();
    const challenges = document.getElementById('todayChallenges').value.trim();
    const goals = document.getElementById('tomorrowGoals').value.trim();
    const rating = document.querySelectorAll('.star.active').length;
    
    if (!learning && !challenges && !goals) {
        showNotification('Please fill in at least one reflection field', 'Incomplete Reflection');
        return;
    }
    
    if (!appState.reflections) appState.reflections = {};
    appState.reflections[appState.currentDay] = {
        learning,
        challenges,
        goals,
        rating,
        date: new Date().toISOString()
    };
    
    saveDataToFirestore(appState);
    showNotification('Reflection saved successfully! 💭', 'Reflection Saved');
}

// Chart functionality
let progressChart = null;
let dailyChart = null;

function initializeCharts() {
    if (typeof Chart === 'undefined') return;
    const progressCtx = document.getElementById('progressChart').getContext('2d');
    const dailyCtx = document.getElementById('dailyChart').getContext('2d');
    
    if (progressChart) progressChart.destroy();
    progressChart = new Chart(progressCtx, {
        type: 'doughnut',
        data: {
            labels: roadmapData.sections.map(s => s.title),
            datasets: [{
                data: roadmapData.sections.map(s => getSectionProgress(s)),
                backgroundColor: roadmapData.sections.map(s => s.color),
                borderWidth: 2,
                borderColor: 'var(--color-surface)'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Progress by Section' }, legend: { position: 'bottom' } } }
    });
    
    if (dailyChart) dailyChart.destroy();
    const dailyData = Array.from({length: 30}, (_, i) => {
        const day = i + 1;
        const progress = (appState.dailyProgress || {})[day];
        return progress ? (progress.topicsCompleted || 0) : 0;
    });
    
    dailyChart = new Chart(dailyCtx, {
        type: 'line',
        data: {
            labels: Array.from({length: 30}, (_, i) => `Day ${i + 1}`),
            datasets: [{
                label: 'Topics Completed',
                data: dailyData,
                borderColor: 'var(--color-primary)',
                backgroundColor: 'rgba(33, 128, 141, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Daily Progress Trend' } }, scales: { y: { beginAtZero: true } } }
    });
}

function updateCharts() {
    if (!progressChart || !dailyChart) {
        initializeCharts();
        return;
    }
    
    progressChart.data.datasets[0].data = roadmapData.sections.map(s => getSectionProgress(s));
    progressChart.update();
    
    const dailyData = Array.from({length: 30}, (_, i) => {
        const day = i + 1;
        const progress = (appState.dailyProgress || {})[day];
        return progress ? (progress.topicsCompleted || 0) : 0;
    });
    dailyChart.data.datasets[0].data = dailyData;
    dailyChart.update();
}

function exportWeeklyCSV() {
    const currentWeekStart = Math.floor((appState.currentDay - 1) / 7) * 7 + 1;
    const currentWeekEnd = Math.min(currentWeekStart + 6, 30);
    
    const csvContent = generateWeeklyCSV(currentWeekStart, currentWeekEnd);
    downloadCSV(csvContent, `week-${Math.ceil(appState.currentDay / 7)}-progress.csv`);
}

function generateWeeklyCSV(startDay, endDay) {
    let csv = 'Day,Section,Topics Completed,Tasks Completed,Productivity Rating,Learning Notes\n';
    
    for (let day = startDay; day <= endDay; day++) {
        const section = roadmapData.sections.find(s => {
            const [start, end] = s.days.split('-').map(Number);
            return day >= start && day <= end;
        });
        
        const progress = (appState.dailyProgress || {})[day] || {};
        const reflection = (appState.reflections || {})[day] || {};
        
        const learningNotes = (reflection.learning || '').replace(/"/g, '""');
        csv += `Day ${day},"${section?.title || 'N/A'}",${progress.topicsCompleted || 0},${progress.tasksCompleted || 0},${reflection.rating || 0},"${learningNotes}"\n`;
    }
    
    return csv;
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
