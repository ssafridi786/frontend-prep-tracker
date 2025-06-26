// Interactive Source List
const sourceList = document.getElementById('sourceList');
function addSource() {
  const input = document.getElementById('newSource');
  if (input.value.trim()) {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${input.value}" target="_blank">${input.value}</a>`;
    sourceList.appendChild(li);
    input.value = '';
  }
}

// Daily Schedule
const schedule = ["9am - HTML", "10am - CSS", "11am - JavaScript"];
const scheduleList = document.getElementById('scheduleList');
schedule.forEach((item, idx) => {
  const li = document.createElement('li');
  li.textContent = item;
  li.onclick = () => openModal(idx, item);
  scheduleList.appendChild(li);
});

let currentScheduleIndex;
function openModal(index, content) {
  currentScheduleIndex = index;
  document.getElementById('modalTime').textContent = content;
  document.getElementById('modalNotes').value = '';
  document.getElementById('modalTimeChange').value = '';
  document.getElementById('scheduleModal').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('scheduleModal').classList.add('hidden');
}
function saveModalChanges() {
  const note = document.getElementById('modalNotes').value;
  const timeChange = document.getElementById('modalTimeChange').value;
  if (timeChange) {
    schedule[currentScheduleIndex] = timeChange + ' - ' + note;
    scheduleList.children[currentScheduleIndex].textContent = schedule[currentScheduleIndex];
  }
  closeModal();
}

// Today's Focus
const focusList = document.getElementById('focusList');
function addFocusConcept() {
  const input = document.getElementById('focusConcept');
  if (input.value.trim()) {
    const slug = input.value.toLowerCase().replace(/\s+/g, '-');
    const url = `https://roadmap.sh/frontend/${slug}`;
    const li = document.createElement('li');
    li.innerHTML = `<input type='checkbox' onchange='this.nextElementSibling.style.textDecoration = this.checked ? "line-through" : "none"'><a href="${url}" target="_blank"> ${input.value}</a>`;
    focusList.appendChild(li);
    input.value = '';
  }
}

// Task Manager
const taskList = document.getElementById('taskList');
function addTask() {
  const task = document.getElementById('newTask').value;
  const link = document.getElementById('taskLink').value;
  if (task.trim()) {
    const li = document.createElement('li');
    li.innerHTML = link ? `${task} - <a href="${link}" target="_blank">Source</a>` : task;
    taskList.appendChild(li);
    document.getElementById('newTask').value = '';
    document.getElementById('taskLink').value = '';
  }
}
