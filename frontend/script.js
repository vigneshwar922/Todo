/* ═══════════════════════════════════════════════════════════════════════════
   ZEN TASKS — Full Stack Frontend Logic
   Architecture:
     - API Module      : all fetch() wrappers
     - Auth Module     : login / register / logout
     - Toast Module    : showToast(message, type)
     - Tasks Module    : CRUD + render
     - Date Strip      : Horizontal date navigator
     - Progress Ring   : Today's completion indicator
     - Profile Modal   : View / update user details + avatar
   ══════════════════════════════════════════════════════════════════════════ */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '/api'
    : 'https://todo-2dno.onrender.com/api';

/* ─────────────────────────────────────────────────────────────────────────────
   API MODULE
   ───────────────────────────────────────────────────────────────────────── */

function getToken() { return localStorage.getItem('zenTasksToken'); }

function authHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` };
}

async function apiFetch(endpoint, options = {}) {
    const res  = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
}

/* ─────────────────────────────────────────────────────────────────────────────
   TOAST MODULE
   ───────────────────────────────────────────────────────────────────────── */

const toastContainer = document.getElementById('toast-container');

function showToast(message, type = 'info') {
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info} toast-icon"></i>
        <span class="toast-message">${escapeHTML(message)}</span>`;
    toastContainer.appendChild(toast);
    const dismiss = () => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    };
    setTimeout(dismiss, 3500);
}

/* ─────────────────────────────────────────────────────────────────────────────
   AUTH MODULE
   ───────────────────────────────────────────────────────────────────────── */

const authScreen    = document.getElementById('auth-screen');
const appScreen     = document.getElementById('app-screen');
const loginForm     = document.getElementById('login-form');
const registerForm  = document.getElementById('register-form');
const loginBtn      = document.getElementById('login-btn');
const registerBtn   = document.getElementById('register-btn');
const logoutBtn     = document.getElementById('logout-btn');
const userNameDisplay   = document.getElementById('user-name-display');
const userAvatarEl      = document.getElementById('user-avatar-initials');

// Tab switching
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        loginForm.classList.toggle('hidden', tab.dataset.tab !== 'login');
        registerForm.classList.toggle('hidden', tab.dataset.tab !== 'register');
    });
});

function setButtonLoading(btn, loading) {
    const btnText    = btn.querySelector('.btn-text');
    const btnSpinner = btn.querySelector('.btn-spinner');
    btn.disabled = loading;
    btnText.classList.toggle('hidden', loading);
    btnSpinner.classList.toggle('hidden', !loading);
}

function showAuthScreen() {
    authScreen.classList.remove('hidden');
    appScreen.classList.add('hidden');
}

function getInitials(displayName) {
    return displayName.split(/[\s@_.-]+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'U';
}

function showAppScreen(user) {
    authScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');

    const displayName = user.username || user.email;
    userNameDisplay.textContent = displayName;

    const initials = getInitials(displayName);

    // Check for saved avatar
    const savedAvatar = localStorage.getItem('zenTasksAvatar');
    if (savedAvatar) {
        userAvatarEl.innerHTML     = `<img src="${savedAvatar}" alt="avatar">`;
        userAvatarEl.style.background = 'none';
        userAvatarEl.style.padding    = '0';
    } else {
        userAvatarEl.textContent      = initials;
        userAvatarEl.innerHTML        = initials;
        userAvatarEl.style.background = '';
        userAvatarEl.style.padding    = '';
    }
}

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    setButtonLoading(loginBtn, true);
    try {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        localStorage.setItem('zenTasksToken', data.token);
        localStorage.setItem('zenTasksUser', JSON.stringify(data.user));
        showAppScreen(data.user);
        showToast('Welcome back! 👋', 'success');
        initDateStrip();
        updateDateDisplay();
        loadTasks();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        setButtonLoading(loginBtn, false);
    }
});

// Register
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    setButtonLoading(registerBtn, true);
    try {
        const data = await apiFetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        localStorage.setItem('zenTasksToken', data.token);
        localStorage.setItem('zenTasksUser', JSON.stringify(data.user));
        showAppScreen(data.user);
        showToast('Account created! Welcome to Zen Tasks 🎉', 'success');
        initDateStrip();
        updateDateDisplay();
        loadTasks();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        setButtonLoading(registerBtn, false);
    }
});

function doLogout() {
    localStorage.removeItem('zenTasksToken');
    localStorage.removeItem('zenTasksUser');
    closeProfileModal();
    showAuthScreen();
    showToast('Logged out. See you soon!', 'info');
    tasks = [];
    renderTasks();
}

logoutBtn.addEventListener('click', doLogout);

/* ─────────────────────────────────────────────────────────────────────────────
   PROFILE MODAL MODULE
   ───────────────────────────────────────────────────────────────────────── */

const profileModal        = document.getElementById('profile-modal');
const profileModalClose   = document.getElementById('profile-modal-close');
const userAvatarBtn       = document.getElementById('user-avatar-btn');
const avatarFileInput     = document.getElementById('avatar-file-input');
const profileAvatarDisplay = document.getElementById('profile-avatar-display');
const profileUsernameDisplay = document.getElementById('profile-username-display');
const profileEmailDisplay    = document.getElementById('profile-email-display');
const profileJoinedDisplay   = document.getElementById('profile-joined-display');
const profileUpdateForm   = document.getElementById('profile-update-form');
const profileUpdateBtn    = document.getElementById('profile-update-btn');
const profileLogoutBtn    = document.getElementById('profile-logout-btn');
const profileNewUsername  = document.getElementById('profile-new-username');
const profileNewPassword  = document.getElementById('profile-new-password');

function openProfileModal() {
    const user = JSON.parse(localStorage.getItem('zenTasksUser') || 'null');
    if (!user) return;

    // Populate info
    profileUsernameDisplay.textContent = user.username || '—';
    profileEmailDisplay.textContent    = user.email    || '—';

    // Show member since (stored on first register)
    const joined = localStorage.getItem('zenTasksMemberSince');
    profileJoinedDisplay.textContent = joined
        ? new Date(joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Member';

    // Avatar in modal
    const savedAvatar = localStorage.getItem('zenTasksAvatar');
    if (savedAvatar) {
        profileAvatarDisplay.innerHTML        = `<img src="${savedAvatar}" alt="avatar">`;
        profileAvatarDisplay.style.background = 'none';
    } else {
        profileAvatarDisplay.style.background = '';
        profileAvatarDisplay.innerHTML        = getInitials(user.username || user.email);
    }

    // Pre-fill username field
    profileNewUsername.value = user.username || '';
    profileNewPassword.value = '';

    profileModal.classList.remove('hidden');
    profileNewUsername.focus();
}

function closeProfileModal() {
    profileModal.classList.add('hidden');
}

// Open modal
userAvatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (profileModal.classList.contains('hidden')) {
        openProfileModal();
    } else {
        closeProfileModal();
    }
});

// Close on X button
profileModalClose.addEventListener('click', closeProfileModal);

// Close when clicking outside modal
profileModal.addEventListener('click', (e) => {
    if (e.target === profileModal) closeProfileModal();
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !profileModal.classList.contains('hidden')) closeProfileModal();
});

// Avatar file upload
avatarFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be under 5 MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
        const base64 = evt.target.result;

        // Save to localStorage
        localStorage.setItem('zenTasksAvatar', base64);

        // Update modal display
        profileAvatarDisplay.innerHTML        = `<img src="${base64}" alt="avatar">`;
        profileAvatarDisplay.style.background = 'none';

        // Update nav avatar
        userAvatarEl.innerHTML        = `<img src="${base64}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        userAvatarEl.style.background = 'none';
        userAvatarEl.style.padding    = '0';

        showToast('Profile photo updated!', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset input
});

// Update profile (username / password)
profileUpdateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newUsername = profileNewUsername.value.trim();
    const newPassword = profileNewPassword.value;

    if (!newUsername && !newPassword) {
        showToast('Enter a new username or password.', 'info');
        return;
    }

    setButtonLoading(profileUpdateBtn, true);
    try {
        const body = {};
        if (newUsername) body.username = newUsername;
        if (newPassword) body.password = newPassword;

        const data = await apiFetch('/auth/profile', {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(body)
        });

        // Update stored user
        const updatedUser = data.user;
        localStorage.setItem('zenTasksUser', JSON.stringify(updatedUser));
        showAppScreen(updatedUser);

        // Refresh modal info
        profileUsernameDisplay.textContent = updatedUser.username;
        profileNewPassword.value = '';

        showToast('Profile updated successfully! ✅', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        setButtonLoading(profileUpdateBtn, false);
    }
});

// Logout from modal
profileLogoutBtn.addEventListener('click', doLogout);

/* ─────────────────────────────────────────────────────────────────────────────
   TASK MODULE — State
   ───────────────────────────────────────────────────────────────────────── */

let tasks = [];
let currentFilter = 'all';
let searchDebounceTimer = null;

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

let selectedDate = formatDate(new Date());

const form          = document.getElementById('todo-form');
const input         = document.getElementById('todo-input');
const priorityInput = document.getElementById('todo-priority');
const tagInput      = document.getElementById('todo-tag');
const todoList      = document.getElementById('todo-list');
const emptyState    = document.getElementById('empty-state');
const dateDisplay   = document.getElementById('date-display');
const dateSub       = document.getElementById('date-sub');
const datePicker    = document.getElementById('date-picker');
const filterBtns    = document.querySelectorAll('.filter-btn');
const tasksCount    = document.getElementById('tasks-count');
const clearCompleted = document.getElementById('clear-completed');
const searchInput   = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const sortSelect    = document.getElementById('sort-select');
const tasksLoading  = document.getElementById('tasks-loading');
const addBtn        = document.getElementById('add-btn');

// Progress ring
const progressRingBar    = document.getElementById('progress-ring-bar');
const progressPctEl      = document.getElementById('progress-pct');
const progressCountEl    = document.getElementById('progress-count');
const RING_CIRCUMFERENCE = 2 * Math.PI * 14; // r=14 → 87.96

/* ─────────────────────────────────────────────────────────────────────────────
   DATE STRIP MODULE
   ───────────────────────────────────────────────────────────────────────── */

const dateStrip    = document.getElementById('date-strip');
const stripPrevBtn = document.getElementById('date-strip-prev');
const stripNextBtn = document.getElementById('date-strip-next');

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS   = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseDateStr(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function generateDateRange() {
    const dates = [];
    const today = new Date();
    for (let i = -30; i <= 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(formatDate(d));
    }
    return dates;
}

function initDateStrip() {
    const todayStr = formatDate(new Date());
    const dates    = generateDateRange();

    dateStrip.innerHTML = dates.map(dateStr => {
        const d        = parseDateStr(dateStr);
        const isToday  = dateStr === todayStr;
        const isActive = dateStr === selectedDate;
        return `
        <div class="date-card${isActive ? ' active' : ''}${isToday ? ' today' : ''}"
             data-date="${dateStr}" role="button" tabindex="0"
             aria-label="${d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}">
            <span class="date-card-weekday">${WEEKDAYS[d.getDay()]}</span>
            <span class="date-card-day">${d.getDate()}</span>
            <span class="date-card-month">${MONTHS[d.getMonth()]}</span>
        </div>`;
    }).join('');

    dateStrip.addEventListener('click', (e) => {
        const card = e.target.closest('.date-card');
        if (card) selectDate(card.dataset.date);
    });

    dateStrip.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            const card = e.target.closest('.date-card');
            if (card) { e.preventDefault(); selectDate(card.dataset.date); }
        }
    });

    scrollToActiveCard();
}

function selectDate(dateStr) {
    selectedDate = dateStr;
    updateActiveCard();
    updateDateDisplay();
    loadTasks();
}

function updateActiveCard() {
    document.querySelectorAll('.date-card').forEach(c => c.classList.toggle('active', c.dataset.date === selectedDate));
    scrollToActiveCard();
}

function scrollToActiveCard() {
    const active = dateStrip.querySelector('.date-card.active');
    if (!active) return;
    const stripRect = dateStrip.getBoundingClientRect();
    const cardRect  = active.getBoundingClientRect();
    const offset    = cardRect.left - stripRect.left - (stripRect.width / 2) + (cardRect.width / 2);
    dateStrip.scrollBy({ left: offset, behavior: 'smooth' });
}

stripPrevBtn.addEventListener('click', () => dateStrip.scrollBy({ left: -200, behavior: 'smooth' }));
stripNextBtn.addEventListener('click', () => dateStrip.scrollBy({ left: 200, behavior: 'smooth' }));

/* ─────────────────────────────────────────────────────────────────────────────
   DATE DISPLAY
   ───────────────────────────────────────────────────────────────────────── */

function updateDateDisplay() {
    const todayStr  = formatDate(new Date());
    const d         = parseDateStr(selectedDate);
    const tomorrow  = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const longDate  = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    if (selectedDate === todayStr) {
        dateDisplay.textContent = 'Today';
        dateSub.textContent     = longDate;
    } else if (selectedDate === formatDate(tomorrow)) {
        dateDisplay.textContent = 'Tomorrow';
        dateSub.textContent     = longDate;
    } else if (selectedDate === formatDate(yesterday)) {
        dateDisplay.textContent = 'Yesterday';
        dateSub.textContent     = longDate;
    } else {
        dateDisplay.textContent = longDate;
        dateSub.textContent     = '';
    }
    datePicker.value = selectedDate;
}

/* ─────────────────────────────────────────────────────────────────────────────
   PROGRESS RING
   ───────────────────────────────────────────────────────────────────────── */

function updateProgressRing() {
    const todayStr = formatDate(new Date());
    const dayTasks = tasks.filter(t => t.date === todayStr);
    const total    = dayTasks.length;
    const done     = dayTasks.filter(t => t.is_completed).length;
    const pct      = total === 0 ? 0 : Math.round((done / total) * 100);

    // strokeDashoffset: full circle = RING_CIRCUMFERENCE (~87.96), filled = offset toward 0
    const offset = RING_CIRCUMFERENCE - (pct / 100) * RING_CIRCUMFERENCE;
    progressRingBar.setAttribute('stroke-dashoffset', offset.toFixed(2));
    progressPctEl.textContent    = `${pct}%`;
    progressCountEl.textContent  = `${done} / ${total} tasks`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   TASK MODULE — API Calls
   ───────────────────────────────────────────────────────────────────────── */

async function loadTasks() {
    tasksLoading.classList.remove('hidden');
    todoList.innerHTML = '';
    emptyState.classList.add('hidden');

    const search = searchInput.value.trim();
    const sort   = sortSelect.value;
    const params = new URLSearchParams({ date: selectedDate, filter: currentFilter, sort });
    if (search) params.append('search', search);

    try {
        const data = await apiFetch(`/tasks?${params}`, { headers: authHeaders() });
        tasks = data.tasks;
        renderTasks();
        updateProgressRing();
    } catch (err) {
        showToast(`Failed to load tasks: ${err.message}`, 'error');
        tasks = [];
        renderTasks();
    } finally {
        tasksLoading.classList.add('hidden');
    }
}

async function addTask(e) {
    e.preventDefault();
    const text     = input.value.trim();
    const priority = priorityInput.value;
    const tag      = tagInput.value.trim();
    if (!text) return;

    addBtn.disabled = true;
    addBtn.querySelector('.btn-icon').classList.add('hidden');
    addBtn.querySelector('.btn-spinner-sm').classList.remove('hidden');

    try {
        const data = await apiFetch('/tasks', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ title: text, priority, tag, date: selectedDate })
        });
        tasks.unshift(data.task);
        input.value = ''; priorityInput.value = 'low'; tagInput.value = '';

        if (currentFilter === 'completed') {
            currentFilter = 'all';
            filterBtns.forEach(b => b.classList.remove('active'));
            document.querySelector('[data-filter="all"]').classList.add('active');
        }
        renderTasks();
        updateProgressRing();
        showToast('Task added!', 'success');
    } catch (err) {
        showToast(`Couldn't add task: ${err.message}`, 'error');
    } finally {
        addBtn.disabled = false;
        addBtn.querySelector('.btn-icon').classList.remove('hidden');
        addBtn.querySelector('.btn-spinner-sm').classList.add('hidden');
    }
}

async function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    task.is_completed = !task.is_completed;
    renderTasks();
    updateProgressRing();
    const li = todoList.querySelector(`[data-id="${id}"]`);
    if (li) li.classList.add('is-saving');
    try {
        const data = await apiFetch(`/tasks/${id}`, {
            method: 'PUT', headers: authHeaders(),
            body: JSON.stringify({ is_completed: task.is_completed })
        });
        const idx = tasks.findIndex(t => t.id === id);
        if (idx !== -1) tasks[idx] = data.task;
    } catch (err) {
        task.is_completed = !task.is_completed;
        showToast(`Couldn't update task: ${err.message}`, 'error');
    } finally {
        renderTasks();
        updateProgressRing();
    }
}

async function deleteTask(id) {
    const li = todoList.querySelector(`[data-id="${id}"]`);
    if (li) li.classList.add('fadeOut');
    setTimeout(async () => {
        try {
            await apiFetch(`/tasks/${id}`, { method: 'DELETE', headers: authHeaders() });
            tasks = tasks.filter(t => t.id !== id);
            renderTasks(); updateProgressRing();
        } catch (err) {
            renderTasks();
            showToast(`Couldn't delete task: ${err.message}`, 'error');
        }
    }, 280);
}

async function clearCompletedTasks() {
    const ids = tasks.filter(t => t.is_completed && t.date === selectedDate).map(t => t.id);
    if (!ids.length) return;
    try {
        await Promise.all(ids.map(id => apiFetch(`/tasks/${id}`, { method: 'DELETE', headers: authHeaders() })));
        tasks = tasks.filter(t => !(t.is_completed && t.date === selectedDate));
        renderTasks(); updateProgressRing();
        showToast(`${ids.length} task${ids.length > 1 ? 's' : ''} cleared.`, 'info');
    } catch (err) {
        showToast(`Couldn't clear completed: ${err.message}`, 'error');
        await loadTasks();
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   TASK MODULE — Render
   ───────────────────────────────────────────────────────────────────────── */

function renderTasks() {
    const currentDayTasks = tasks.filter(t => t.date === selectedDate);

    if (!currentDayTasks.length) {
        todoList.innerHTML = '';
        emptyState.classList.remove('hidden');
        const p    = emptyState.querySelector('p');
        const span = emptyState.querySelector('span');
        const icon = emptyState.querySelector('.empty-icon i');
        const searchVal = searchInput.value.trim();
        if (searchVal) {
            p.textContent = 'No tasks match your search.'; span.textContent = 'Try a different keyword.';
            icon.className = 'fas fa-magnifying-glass';
        } else if (currentFilter === 'active') {
            p.textContent = 'No active tasks.'; span.textContent = 'Great job!';
            icon.className = 'fas fa-leaf';
        } else if (currentFilter === 'completed') {
            p.textContent = 'No completed tasks yet.'; span.textContent = 'Time to get things done!';
            icon.className = 'fas fa-clock';
        } else {
            p.textContent = 'No tasks for this day.'; span.textContent = 'Enjoy your time!';
            icon.className = 'fas fa-calendar-check';
        }
    } else {
        emptyState.classList.add('hidden');
        const priorityLabels = { high: '🔴 High', medium: '🟡 Medium', low: '🟢 Low' };
        const priorityIcons  = { high: 'fa-fire', medium: 'fa-arrow-up', low: 'fa-arrow-down' };
        todoList.innerHTML = currentDayTasks.map(task => {
            const tagHtml = task.tag
                ? `<span class="tag-badge"><i class="fas fa-tag"></i>${escapeHTML(task.tag)}</span>`
                : '';
            return `
            <li class="todo-item ${task.is_completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="todo-content">
                    <div class="checkbox"></div>
                    <div style="flex:1;min-width:0">
                        <span class="todo-text">${escapeHTML(task.title)}</span>
                        <div class="todo-meta">
                            <span class="priority-indicator priority-${task.priority}">
                                <i class="fas ${priorityIcons[task.priority]}"></i>
                                ${priorityLabels[task.priority] || task.priority}
                            </span>
                            ${tagHtml}
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="delete-btn" aria-label="Delete task" data-action="delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </li>`;
        }).join('');
    }
    updateFooter();
}

function updateFooter() {
    const dayTasks     = tasks.filter(t => t.date === selectedDate);
    const activeCount  = dayTasks.filter(t => !t.is_completed).length;
    const hasCompleted = dayTasks.some(t => t.is_completed);
    tasksCount.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
    hasCompleted ? clearCompleted.classList.remove('hidden') : clearCompleted.classList.add('hidden');
}

/* ─────────────────────────────────────────────────────────────────────────────
   EVENT LISTENERS
   ───────────────────────────────────────────────────────────────────────── */

form.addEventListener('submit', addTask);

todoList.addEventListener('click', (e) => {
    const item = e.target.closest('.todo-item');
    if (!item) return;
    const id = Number(item.dataset.id);
    if (e.target.closest('[data-action="delete"]')) deleteTask(id);
    else if (e.target.closest('.todo-content')) toggleTask(id);
});

clearCompleted.addEventListener('click', clearCompletedTasks);

datePicker.addEventListener('change', (e) => { if (e.target.value) selectDate(e.target.value); });

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        loadTasks();
    });
});

searchInput.addEventListener('input', () => {
    clearSearchBtn.classList.toggle('hidden', !searchInput.value.trim());
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(loadTasks, 400);
});

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    loadTasks();
});

sortSelect.addEventListener('change', loadTasks);

/* ─────────────────────────────────────────────────────────────────────────────
   SECURITY UTILITY
   ───────────────────────────────────────────────────────────────────────── */

function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/* ─────────────────────────────────────────────────────────────────────────────
   INIT
   ───────────────────────────────────────────────────────────────────────── */

(function init() {
    const token = getToken();
    const user  = JSON.parse(localStorage.getItem('zenTasksUser') || 'null');

    // Set member since on first ever login (approximate)
    if (!localStorage.getItem('zenTasksMemberSince')) {
        localStorage.setItem('zenTasksMemberSince', new Date().toISOString());
    }

    if (token && user) {
        showAppScreen(user);
        initDateStrip();
        updateDateDisplay();
        loadTasks();
    } else {
        showAuthScreen();
    }
})();
