/* ═══════════════════════════════════════════════════════════════════════════
   ZEN TASKS — Full Stack Frontend Logic
   Architecture:
     - API Module      : all fetch() wrappers
     - Auth Module     : login / register / logout
     - Toast Module    : showToast(message, type)
     - Tasks Module    : CRUD + render
   ══════════════════════════════════════════════════════════════════════════ */

const API_BASE = '/api';

/* ─────────────────────────────────────────────────────────────────────────────
   API MODULE
   ───────────────────────────────────────────────────────────────────────── */

function getToken() {
    return localStorage.getItem('zenTasksToken');
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}

/**
 * Central fetch wrapper — handles errors and returns parsed JSON.
 * Throws an Error with the server's error message on non-2xx responses.
 */
async function apiFetch(endpoint, options = {}) {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
    }
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
        <span class="toast-message">${escapeHTML(message)}</span>
    `;
    toastContainer.appendChild(toast);

    // Auto-dismiss after 3.5s
    const dismiss = () => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    };
    setTimeout(dismiss, 3500);
}

/* ─────────────────────────────────────────────────────────────────────────────
   AUTH MODULE
   ───────────────────────────────────────────────────────────────────────── */

const authScreen = document.getElementById('auth-screen');
const appScreen  = document.getElementById('app-screen');

const loginForm     = document.getElementById('login-form');
const registerForm  = document.getElementById('register-form');
const loginBtn      = document.getElementById('login-btn');
const registerBtn   = document.getElementById('register-btn');
const logoutBtn     = document.getElementById('logout-btn');
const userNameDisplay = document.getElementById('user-name-display');

// ── Tab switching
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        if (tab.dataset.tab === 'login') {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        } else {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        }
    });
});

// ── Helpers for button loading state
function setButtonLoading(btn, loading) {
    const btnText   = btn.querySelector('.btn-text');
    const btnSpinner = btn.querySelector('.btn-spinner');
    btn.disabled = loading;
    if (loading) {
        btnText.classList.add('hidden');
        btnSpinner.classList.remove('hidden');
    } else {
        btnText.classList.remove('hidden');
        btnSpinner.classList.add('hidden');
    }
}

// ── Show / Hide screens
function showAuthScreen() {
    authScreen.classList.remove('hidden');
    appScreen.classList.add('hidden');
}

function showAppScreen(user) {
    authScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    userNameDisplay.textContent = user.username || user.email;
}

// ── Login
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
        loadTasks();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        setButtonLoading(loginBtn, false);
    }
});

// ── Register
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
        loadTasks();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        setButtonLoading(registerBtn, false);
    }
});

// ── Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('zenTasksToken');
    localStorage.removeItem('zenTasksUser');
    showAuthScreen();
    showToast('Logged out. See you soon!', 'info');
    // Reset app state
    tasks = [];
    renderTasks();
});

/* ─────────────────────────────────────────────────────────────────────────────
   TASK MODULE — State
   ───────────────────────────────────────────────────────────────────────── */

let tasks = [];
let currentFilter = 'all';
let searchDebounceTimer = null;

// ── Date helpers
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

let selectedDate = formatDate(new Date());

// ── DOM refs
const form          = document.getElementById('todo-form');
const input         = document.getElementById('todo-input');
const priorityInput = document.getElementById('todo-priority');
const tagInput      = document.getElementById('todo-tag');
const todoList      = document.getElementById('todo-list');
const emptyState    = document.getElementById('empty-state');
const dateDisplay   = document.getElementById('date-display');
const datePicker    = document.getElementById('date-picker');
const prevDayBtn    = document.getElementById('prev-day');
const nextDayBtn    = document.getElementById('next-day');
const filterBtns    = document.querySelectorAll('.filter-btn');
const tasksCount    = document.getElementById('tasks-count');
const clearCompleted = document.getElementById('clear-completed');
const searchInput   = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const sortSelect    = document.getElementById('sort-select');
const tasksLoading  = document.getElementById('tasks-loading');
const addBtn        = document.getElementById('add-btn');

// ── Date display
function updateDateDisplay() {
    const todayStr = formatDate(new Date());
    const parts    = selectedDate.split('-');
    const d        = new Date(+parts[0], +parts[1] - 1, +parts[2]);

    const tomorrow  = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);

    if (selectedDate === todayStr) {
        dateDisplay.textContent = 'Today';
    } else if (selectedDate === formatDate(tomorrow)) {
        dateDisplay.textContent = 'Tomorrow';
    } else if (selectedDate === formatDate(yesterday)) {
        dateDisplay.textContent = 'Yesterday';
    } else {
        dateDisplay.textContent = d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
    }
    datePicker.value = selectedDate;
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

    const params = new URLSearchParams({
        date:   selectedDate,
        filter: currentFilter,
        sort
    });

    if (search) params.append('search', search);

    try {
        const data = await apiFetch(`/tasks?${params}`, {
            headers: authHeaders()
        });
        tasks = data.tasks;
        renderTasks();
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

    // Show spinner on add button
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
        input.value         = '';
        priorityInput.value = 'low';
        tagInput.value      = '';

        if (currentFilter === 'completed') {
            currentFilter = 'all';
            filterBtns.forEach(b => b.classList.remove('active'));
            document.querySelector('[data-filter="all"]').classList.add('active');
        }

        renderTasks();
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

    // Optimistic UI update
    task.is_completed = !task.is_completed;
    renderTasks();

    // Mark item as saving
    const li = todoList.querySelector(`[data-id="${id}"]`);
    if (li) li.classList.add('is-saving');

    try {
        const data = await apiFetch(`/tasks/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ is_completed: task.is_completed })
        });
        // Sync with server response
        const idx = tasks.findIndex(t => t.id === id);
        if (idx !== -1) tasks[idx] = data.task;
    } catch (err) {
        // Revert optimistic update
        task.is_completed = !task.is_completed;
        showToast(`Couldn't update task: ${err.message}`, 'error');
    } finally {
        renderTasks();
    }
}

async function deleteTask(id) {
    const li = todoList.querySelector(`[data-id="${id}"]`);
    if (li) li.classList.add('fadeOut');

    setTimeout(async () => {
        try {
            await apiFetch(`/tasks/${id}`, {
                method: 'DELETE',
                headers: authHeaders()
            });
            tasks = tasks.filter(t => t.id !== id);
            renderTasks();
        } catch (err) {
            // Re-render (remove fade-out artifact)
            renderTasks();
            showToast(`Couldn't delete task: ${err.message}`, 'error');
        }
    }, 280);
}

async function clearCompletedTasks() {
    const completedIds = tasks
        .filter(t => t.is_completed && t.date === selectedDate)
        .map(t => t.id);

    if (completedIds.length === 0) return;

    try {
        await Promise.all(
            completedIds.map(id =>
                apiFetch(`/tasks/${id}`, {
                    method: 'DELETE',
                    headers: authHeaders()
                })
            )
        );
        tasks = tasks.filter(t => !(t.is_completed && t.date === selectedDate));
        renderTasks();
        showToast(`${completedIds.length} task${completedIds.length > 1 ? 's' : ''} cleared.`, 'info');
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

    if (currentDayTasks.length === 0) {
        todoList.innerHTML = '';
        emptyState.classList.remove('hidden');

        const p    = emptyState.querySelector('p');
        const span = emptyState.querySelector('span');
        const icon = emptyState.querySelector('.empty-icon i');

        const searchVal = searchInput.value.trim();
        if (searchVal) {
            p.textContent    = 'No tasks match your search.';
            span.textContent = 'Try a different keyword.';
            icon.className   = 'fas fa-magnifying-glass';
        } else if (currentFilter === 'active') {
            p.textContent    = 'No active tasks.';
            span.textContent = 'Great job!';
            icon.className   = 'fas fa-leaf';
        } else if (currentFilter === 'completed') {
            p.textContent    = 'No completed tasks yet.';
            span.textContent = 'Time to get things done!';
            icon.className   = 'fas fa-clock';
        } else {
            p.textContent    = 'No tasks for this day.';
            span.textContent = 'Enjoy your time!';
            icon.className   = 'fas fa-calendar-check';
        }
    } else {
        emptyState.classList.add('hidden');
        todoList.innerHTML = currentDayTasks.map(task => {
            const priorityLabels = { high: '🔴 High', medium: '🟡 Medium', low: '🟢 Low' };
            const priorityIcons  = { high: 'fa-fire', medium: 'fa-arrow-up', low: 'fa-arrow-down' };
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
    const dayTasks       = tasks.filter(t => t.date === selectedDate);
    const activeCount    = dayTasks.filter(t => !t.is_completed).length;
    const hasCompleted   = dayTasks.some(t => t.is_completed);

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

    if (e.target.closest('[data-action="delete"]')) {
        deleteTask(id);
    } else if (e.target.closest('.todo-content')) {
        toggleTask(id);
    }
});

clearCompleted.addEventListener('click', clearCompletedTasks);

// Date navigation
prevDayBtn.addEventListener('click', () => {
    const parts = selectedDate.split('-');
    const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    d.setDate(d.getDate() - 1);
    selectedDate = formatDate(d);
    updateDateDisplay();
    loadTasks();
});

nextDayBtn.addEventListener('click', () => {
    const parts = selectedDate.split('-');
    const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    d.setDate(d.getDate() + 1);
    selectedDate = formatDate(d);
    updateDateDisplay();
    loadTasks();
});

datePicker.addEventListener('change', (e) => {
    if (e.target.value) {
        selectedDate = e.target.value;
        updateDateDisplay();
        loadTasks();
    }
});

// Filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        loadTasks();
    });
});

// Search — debounced
searchInput.addEventListener('input', () => {
    const val = searchInput.value.trim();
    clearSearchBtn.classList.toggle('hidden', !val);

    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(loadTasks, 400);
});

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    loadTasks();
});

// Sort
sortSelect.addEventListener('change', loadTasks);

/* ─────────────────────────────────────────────────────────────────────────────
   SECURITY UTILITY
   ───────────────────────────────────────────────────────────────────────── */

function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ─────────────────────────────────────────────────────────────────────────────
   INIT — Check for existing session
   ───────────────────────────────────────────────────────────────────────── */

(function init() {
    const token = getToken();
    const user  = JSON.parse(localStorage.getItem('zenTasksUser') || 'null');

    if (token && user) {
        showAppScreen(user);
        updateDateDisplay();
        loadTasks();
    } else {
        showAuthScreen();
    }
})();
