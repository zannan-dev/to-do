const splashScreen = document.getElementById("splashScreen");
const topbar = document.getElementById("topbar");
const topDepthMask = document.getElementById("topDepthMask");
const taskList = document.getElementById("taskList");
const taskModal = document.getElementById("taskModal");
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");

const todayChip = document.getElementById("todayChip");
const tomorrowChip = document.getElementById("tomorrowChip");
const clearDateChip = document.getElementById("clearDateChip");

const dateTrigger = document.getElementById("dateTrigger");
const timeTrigger = document.getElementById("timeTrigger");
const dateDisplay = document.getElementById("dateDisplay");
const timeDisplay = document.getElementById("timeDisplay");

const calendarPanel = document.getElementById("calendarPanel");
const calendarMonthLabel = document.getElementById("calendarMonthLabel");
const calendarDays = document.getElementById("calendarDays");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");

const timePanel = document.getElementById("timePanel");
const hourVal = document.getElementById("hourVal");
const minVal = document.getElementById("minVal");
const hourUp = document.getElementById("hourUp");
const hourDown = document.getElementById("hourDown");
const minUp = document.getElementById("minUp");
const minDown = document.getElementById("minDown");
const amBtn = document.getElementById("amBtn");
const pmBtn = document.getElementById("pmBtn");
const clearTimeBtn = document.getElementById("clearTimeBtn");
const doneTimeBtn = document.getElementById("doneTimeBtn");

const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

let pendingDeleteId = null;
let selectedDate = "";
let selectedTime = "";
let viewMonth = new Date();

// Custom time picker state
let pickerHour = 9;
let pickerMinute = 0;
let pickerAmPm = "AM";

function renderTimeStepper() {
  hourVal.textContent = String(pickerHour).padStart(2, "0");
  minVal.textContent = String(pickerMinute).padStart(2, "0");
  amBtn.classList.toggle("active", pickerAmPm === "AM");
  pmBtn.classList.toggle("active", pickerAmPm === "PM");
}

hourUp.addEventListener("click", () => {
  pickerHour = pickerHour === 12 ? 1 : pickerHour + 1;
  renderTimeStepper();
});

hourDown.addEventListener("click", () => {
  pickerHour = pickerHour === 1 ? 12 : pickerHour - 1;
  renderTimeStepper();
});

minUp.addEventListener("click", () => {
  pickerMinute = (pickerMinute + 5) % 60;
  renderTimeStepper();
});

minDown.addEventListener("click", () => {
  pickerMinute = (pickerMinute - 5 + 60) % 60;
  renderTimeStepper();
});

amBtn.addEventListener("click", () => {
  pickerAmPm = "AM";
  renderTimeStepper();
});

pmBtn.addEventListener("click", () => {
  pickerAmPm = "PM";
  renderTimeStepper();
});

// Hide splash screen after 800ms
window.addEventListener("load", () => {
  setTimeout(() => {
    splashScreen.classList.add("hide");
  }, 800);
});

// Toggle top depth effect on scroll
window.addEventListener("scroll", () => {
  const isScrolled = window.scrollY > 6;
  topbar.classList.toggle("scrolled", isScrolled);
  topDepthMask.classList.toggle("scrolled", isScrolled);
}, { passive: true });

let tasks = [];

try {
  tasks = JSON.parse(localStorage.getItem("dayflowTasks")) || [];
  if (!Array.isArray(tasks)) tasks = [];
} catch {
  tasks = [];
}

function saveTasks() {
  localStorage.setItem("dayflowTasks", JSON.stringify(tasks));
}

function getLocalDateString(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatShortDate(dateStr) {
  if (!dateStr) return "None";
  const todayStr = getLocalDateString(0);
  const tomorrowStr = getLocalDateString(1);
  if (dateStr === todayStr) return "Today";
  if (dateStr === tomorrowStr) return "Tomorrow";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en", {
    day: "numeric",
    month: "short"
  });
}

function format12Hour(timeStr) {
  if (!timeStr) return "None";
  const [h, m] = timeStr.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function syncPickerUI() {
  const todayStr = getLocalDateString(0);
  const tomorrowStr = getLocalDateString(1);

  dateDisplay.textContent = formatShortDate(selectedDate);
  timeDisplay.textContent = format12Hour(selectedTime);

  todayChip.classList.toggle("active", selectedDate === todayStr);
  tomorrowChip.classList.toggle("active", selectedDate === tomorrowStr);
  clearDateChip.classList.toggle("active", !selectedDate && !selectedTime);
}

function renderCalendar() {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const todayStr = getLocalDateString(0);

  calendarMonthLabel.textContent = viewMonth.toLocaleDateString("en", {
    month: "long",
    year: "numeric"
  });

  calendarDays.innerHTML = "";

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstWeekday; i++) {
    calendarDays.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cal-day";
    btn.textContent = day;

    if (dateStr === todayStr) btn.classList.add("today");
    if (dateStr === selectedDate) btn.classList.add("selected");
    if (dateStr < todayStr) btn.disabled = true;

    btn.addEventListener("click", () => {
      selectedDate = dateStr;
      syncPickerUI();
      renderCalendar();
      calendarPanel.classList.remove("show");
      dateTrigger.classList.remove("open");
    });

    calendarDays.appendChild(btn);
  }
}

prevMonthBtn.addEventListener("click", () => {
  const now = new Date();
  const minMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const prev = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1);
  if (prev >= minMonth) {
    viewMonth = prev;
    renderCalendar();
  }
});

nextMonthBtn.addEventListener("click", () => {
  viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
  renderCalendar();
});

dateTrigger.addEventListener("click", () => {
  const willOpen = !calendarPanel.classList.contains("show");
  timePanel.classList.remove("show");
  timeTrigger.classList.remove("open");
  calendarPanel.classList.toggle("show", willOpen);
  dateTrigger.classList.toggle("open", willOpen);
  if (willOpen) renderCalendar();
});

timeTrigger.addEventListener("click", () => {
  const willOpen = !timePanel.classList.contains("show");
  calendarPanel.classList.remove("show");
  dateTrigger.classList.remove("open");
  timePanel.classList.toggle("show", willOpen);
  timeTrigger.classList.toggle("open", willOpen);
  if (willOpen) renderTimeStepper();
});

doneTimeBtn.addEventListener("click", () => {
  let hour24 = pickerHour;
  if (pickerAmPm === "PM" && hour24 < 12) hour24 += 12;
  if (pickerAmPm === "AM" && hour24 === 12) hour24 = 0;

  selectedTime = `${String(hour24).padStart(2, "0")}:${String(pickerMinute).padStart(2, "0")}`;
  if (!selectedDate) {
    selectedDate = getLocalDateString(0);
  }

  syncPickerUI();
  timePanel.classList.remove("show");
  timeTrigger.classList.remove("open");
});

clearTimeBtn.addEventListener("click", () => {
  selectedTime = "";
  syncPickerUI();
  timePanel.classList.remove("show");
  timeTrigger.classList.remove("open");
});

todayChip.addEventListener("click", () => {
  selectedDate = getLocalDateString(0);
  viewMonth = new Date();
  syncPickerUI();
  renderCalendar();
});

tomorrowChip.addEventListener("click", () => {
  selectedDate = getLocalDateString(1);
  const tmr = new Date();
  tmr.setDate(tmr.getDate() + 1);
  viewMonth = new Date(tmr.getFullYear(), tmr.getMonth(), 1);
  syncPickerUI();
  renderCalendar();
});

clearDateChip.addEventListener("click", () => {
  selectedDate = "";
  selectedTime = "";
  calendarPanel.classList.remove("show");
  timePanel.classList.remove("show");
  dateTrigger.classList.remove("open");
  timeTrigger.classList.remove("open");
  syncPickerUI();
});

function formatDueLabel(dateStr, timeStr) {
  if (!dateStr && !timeStr) return "";
  const parts = [];
  if (dateStr) parts.push(formatShortDate(dateStr));
  if (timeStr) parts.push(format12Hour(timeStr));
  return parts.join(" • ");
}

function isTaskOverdue(task) {
  if (task.completed || !task.date) return false;
  const now = new Date();
  const due = task.time
    ? new Date(`${task.date}T${task.time}:00`)
    : new Date(`${task.date}T23:59:59`);
  return due < now;
}

// Delete alert handlers
function openDeleteAlert(taskId) {
  pendingDeleteId = taskId;
  deleteModal.classList.add("show");
}

function closeDeleteAlert() {
  pendingDeleteId = null;
  deleteModal.classList.remove("show");
}

function updateTaskCount() {
  const remaining = tasks.filter(t => !t.completed).length;
  document.getElementById("taskCount").textContent =
    `${remaining} ${remaining === 1 ? "task" : "tasks"} remaining`;
}

confirmDeleteBtn.addEventListener("click", () => {
  if (pendingDeleteId !== null) {
    tasks = tasks.filter(t => t.id !== pendingDeleteId);
    saveTasks();
    renderTasks();
  }
  closeDeleteAlert();
});

cancelDeleteBtn.addEventListener("click", closeDeleteAlert);

deleteModal.addEventListener("click", event => {
  if (event.target === deleteModal) closeDeleteAlert();
});

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach(task => {
    const item = document.createElement("div");
    item.className = "task-item" + (task.completed ? " completed" : "");

    const check = document.createElement("button");
    check.className = "check-button";
    check.textContent = task.completed ? "✓" : "";
    check.setAttribute(
      "aria-label",
      task.completed ? "Mark incomplete" : "Complete task"
    );

    check.addEventListener("click", () => {
      task.completed = !task.completed;
      saveTasks();
      item.classList.toggle("completed", task.completed);
      check.textContent = task.completed ? "✓" : "";
      check.setAttribute(
        "aria-label",
        task.completed ? "Mark incomplete" : "Complete task"
      );
      updateTaskCount();
    });

    const content = document.createElement("div");
    content.className = "task-content";

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;
    content.appendChild(title);

    const dueLabel = formatDueLabel(task.date, task.time);
    if (dueLabel) {
      const meta = document.createElement("span");
      meta.className = "task-meta" + (isTaskOverdue(task) ? " overdue" : "");
      meta.textContent = dueLabel;
      content.appendChild(meta);
    }

    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "Delete task");

    remove.addEventListener("click", () => {
      openDeleteAlert(task.id);
    });

    item.append(check, content, remove);
    taskList.appendChild(item);
  });

  document.getElementById("emptyState")
    .classList.toggle("show", tasks.length === 0);

  updateTaskCount();
}

// Add modal controls
document.getElementById("addButton").addEventListener("click", () => {
  selectedDate = getLocalDateString(0);
  selectedTime = "";
  viewMonth = new Date();
  pickerHour = 9;
  pickerMinute = 0;
  pickerAmPm = "AM";
  renderTimeStepper();
  calendarPanel.classList.remove("show");
  timePanel.classList.remove("show");
  dateTrigger.classList.remove("open");
  timeTrigger.classList.remove("open");
  syncPickerUI();
  taskModal.classList.add("show");
  taskTitle.focus();
});

function closeModal() {
  taskModal.classList.remove("show");
}

document.getElementById("closeModal").addEventListener("click", closeModal);

taskModal.addEventListener("click", event => {
  if (event.target === taskModal) closeModal();
});

// Add task
taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = taskTitle.value.trim();
  if (!title) return;

  tasks.unshift({
    id: Date.now() + Math.random(),
    title,
    date: selectedDate,
    time: selectedTime,
    completed: false
  });

  saveTasks();
  taskForm.reset();
  closeModal();
  renderTasks();
});

renderTasks();

