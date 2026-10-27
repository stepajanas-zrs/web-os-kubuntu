// ============================================================================
// PROFESIONÁLNÍ WEB OS - ČÁST 1 (KONFIGURACE, LOGIN A INICIALIZACE PLOCHY)
// ============================================================================
const APP_META = {
  notepad: { title: 'Notepad', width: 540, height: 440 },
  files: { title: 'Files', width: 720, height: 480 },
  browser: { title: 'Browser', width: 780, height: 520 },
  terminal: { title: 'Terminal', width: 640, height: 420 },
  calculator: { title: 'KCalc (Kalkulačka)', width: 340, height: 440 }
};

const LOGIN = { username: 'stepan', password: 'janas' };

const state = {
  windows: [], nextId: 1, activeApp: null, browserUrl: 'https://example.com',
  fileSystem: {
    'Home/Welcome.txt': 'Vítejte ve Web OS!\n\nToto je zjednodušený online desktopový pracovní prostor.',
    'Documents/Projekt.txt': 'Návrh Web OS\n\n1. UI desktopu\n2. Plocha pro aplikace\n3. Start menu',
    'Documents/Idea.md': '# Idea\n\nVytvořit jednoduchý online počítač pro práci v prohlížeči.'
  },
  selectedFile: 'Home/Welcome.txt', desktopReady: false, loggedIn: false
};

let desktopIcons, windowsLayer, taskbarApps, startMenu, startButton, clock, loginScreen, loginForm, loginError;

function getAuthState() { return localStorage.getItem('web-os-auth') === 'true'; }
function setAuthState(value) { localStorage.setItem('web-os-auth', value ? 'true' : 'false'); state.loggedIn = value; }

function initLogin() {
  loginScreen = document.getElementById('login-screen');
  loginForm = document.getElementById('login-form');
  loginError = document.getElementById('login-error');
  const shouldShowLogin = !getAuthState();
  
  document.querySelectorAll('.hidden-on-login').forEach(el => el.style.display = shouldShowLogin ? 'none' : '');

  if (shouldShowLogin) {
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('username').value.trim();
        const p = document.getElementById('password').value;
        if (u === LOGIN.username && p === LOGIN.password) {
          setAuthState(true);
          loginScreen.classList.add('hidden');
          initDesktop();
        } else {
          if (loginError) loginError.textContent = 'Neplatné přihlašovací údaje';
        }
      });
    }
    return;
  }
  if (loginScreen) loginScreen.classList.add('hidden');
  initDesktop();
}

function initDesktop() {
  if (state.desktopReady || !getAuthState()) return;
  state.desktopReady = true; state.loggedIn = true;

  desktopIcons = document.getElementById('desktop-icons');
  windowsLayer = document.getElementById('windows-layer');
  taskbarApps = document.getElementById('taskbar-apps');
  startMenu = document.getElementById('start-menu');
  startButton = document.getElementById('start-button');
  clock = document.getElementById('clock');

  document.querySelectorAll('.hidden-on-login').forEach(el => el.style.display = '');

  buildDesktopIcons(); renderTaskbar();
  openApp('calculator');

  if (startButton) {
    startButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (startMenu) startMenu.classList.toggle('hidden');
    });
  }

  document.addEventListener('click', (e) => {
    if (startMenu && !e.target.closest('#start-button') && !e.target.closest('#start-menu')) {
      startMenu.classList.add('hidden');
    }
  });

  if (startMenu) {
    startMenu.querySelectorAll('.menu-item').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.action === 'logout') {
          setAuthState(false); state.desktopReady = false; state.windows = [];
          if (windowsLayer) windowsLayer.innerHTML = '';
          if (taskbarApps) taskbarApps.innerHTML = '';
          startMenu.classList.add('hidden');
          loginScreen.classList.remove('hidden');
          return;
        }
        openApp(btn.dataset.app); startMenu.classList.add('hidden');
      });
    });
  }
  updateClock(); setInterval(updateClock, 1000);
}
// ============================================================================
// PROFESIONÁLNÍ WEB OS - ČÁST 2 (SPRÁVA OKEN, KALKULAČKA A UTILITY)
// ============================================================================
function openApp(app) {
  if (!windowsLayer) return;
  const existing = state.windows.find(w => w.type === app);
  if (existing) {
    const el = document.getElementById(existing.id);
    if (el && existing.minimized) { el.style.display = 'flex'; existing.minimized = false; }
    focusWindow(existing.id); return;
  }
  const meta = APP_META[app]; if (!meta) return;
  const id = `window-${state.nextId++}`;
  const win = { id, type: app, title: meta.title, x: 120 + (state.windows.length * 30), y: 90 + (state.windows.length * 25), width: meta.width, height: meta.height, z: 10, minimized: false, maximized: false };
  state.windows.push(win);
  renderWindow(win);
}

function renderWindow(win) {
  const wrapper = document.createElement('div');
  wrapper.className = 'window'; wrapper.id = win.id;
  wrapper.style.width = `${win.width}px`; wrapper.style.height = `${win.height}px`;
  wrapper.style.left = `${win.x}px`; wrapper.style.top = `${win.y}px`;

  wrapper.innerHTML = `
    <div class="window-header">
      <div class="window-title">${win.title}</div>
      <div class="window-controls">
        <button class="control-btn minimize" data-action="minimize"></button>
        <button class="control-btn maximize" data-action="maximize"></button>
        <button class="control-btn close" data-action="close"></button>
      </div>
    </div>
    <div class="window-content"></div>
  `;

  if (win.type === 'notepad') {
    wrapper.querySelector('.window-content').innerHTML = `
      <div class="app-content calculator-content">
        <textarea id="note-${win.id}" class="notepad-editor">${state.fileSystem['Home/Welcome.txt']}</textarea>
        <div class="secondary-bar"><button class="primary-btn" id="save-${win.id}">Uložit</button></div>
      </div>`;
  }

  if (win.type === 'files') {
    wrapper.querySelector('.window-content').innerHTML = `
      <div class="app-content"><div class="files-layout">
        <div class="file-list"><ul id="fl-${win.id}"></ul></div>
        <div class="file-preview"><pre id="fp-${win.id}"></pre></div>
      </div></div>`;
  }

  if (win.type === 'calculator') {
    wrapper.querySelector('.window-content').innerHTML = `
      <div class="app-content calculator-content">
        <div class="calc-screen" id="cs-${win.id}">0</div>
        <div class="calculator-grid">
          <button class="calc-key operator" data-value="C">C</button>
          <button class="calc-key operator" data-value="/">/</button>
          <button class="calc-key operator" data-value="*">×</button>
          <button class="calc-key operator" data-value="DEL">DEL</button>
          <button class="calc-key" data-value="7">7</button><button class="calc-key" data-value="8">8</button><button class="calc-key" data-value="9">9</button>
          <button class="calc-key operator" data-value="-">−</button>
          <button class="calc-key" data-value="4">4</button><button class="calc-key" data-value="5">5</button><button class="calc-key" data-value="6">6</button>
          <button class="calc-key operator" data-value="+">+</button>
          <button class="calc-key" data-value="1">1</button><button class="calc-key" data-value="2">2</button><button class="calc-key" data-value="3">3</button>
          <button class="calc-key equals" data-value="=">=</button>
          <button class="calc-key" data-value="0" style="grid-column: span 3;">0</button><button class="calc-key" data-value=".">.</button>
        </div>
      </div>`;
    const screen = document.getElementById(`cs-${win.id}`); let expr = '';
    wrapper.addEventListener('click', (e) => {
      const btn = e.target.closest('.calc-key'); if (!btn) return;
      const val = btn.dataset.value;
      if (val === 'C') expr = '';
      else if (val === 'DEL') expr = expr.slice(0, -1);
      else if (val === '=') { try { expr = String(Function(`"use strict"; return (${expr || '0'})`)()); } catch { expr = 'Error'; } }
      else expr += val;
      if (screen) screen.textContent = expr || '0';
    });
  }

  wrapper.addEventListener('pointerdown', () => focusWindow(win.id));
  wrapper.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); const act = btn.dataset.action;
      if (act === 'close') { wrapper.remove(); state.windows = state.windows.filter(w => w.id !== win.id); renderTaskbar(); }
      if (act === 'minimize') { wrapper.style.display = 'none'; win.minimized = true; renderTaskbar(); }
    });
  });

  enableWindowDrag(wrapper, win);
  if (windowsLayer) windowsLayer.appendChild(wrapper);
  setTimeout(() => wrapper.classList.add('window-open'), 10);
  renderTaskbar(); focusWindow(win.id);
}

function focusWindow(id) {
  state.windows.forEach((win, index) => {
    const el = document.getElementById(win.id); if (!el) return;
    const isFocused = win.id === id; el.classList.toggle('focused', isFocused);
    el.style.zIndex = isFocused ? '1000' : String(100 + index);
    if (isFocused) state.activeApp = id;
  });
  renderTaskbar();
}

function enableWindowDrag(element, win) {
  const header = element.querySelector('.window-header'); if (!header) return;
  let ox = 0, oy = 0;
  header.addEventListener('pointerdown', (e) => {
    if (e.target.matches('button')) return;
    ox = e.clientX - element.offsetLeft; oy = e.clientY - element.offsetTop;
    element.setPointerCapture(e.pointerId);
    const drag = (ev) => { win.x = ev.clientX - ox; win.y = ev.clientY - oy; element.style.left = `${win.x}px`; element.style.top = `${win.y}px`; };
    const stop = () => { element.removeEventListener('pointermove', drag); element.removeEventListener('pointerup', stop); };
    element.addEventListener('pointermove', drag); element.addEventListener('pointerup', stop);
  });
}

function updateClock() { if (clock) clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function buildDesktopIcons() {
  if (!desktopIcons) return; desktopIcons.innerHTML = '';
  [['Notepad', 'notepad', '✎'], ['Files', 'files', '📁'], ['Calculator', 'calculator', '🧮']].forEach(([name, app, em]) => {
    const btn = document.createElement('button'); btn.className = 'desktop-icon';
    btn.innerHTML = `<div class="icon">${em}</div><div class="label">${name}</div>`;
    btn.addEventListener('click', () => openApp(app)); desktopIcons.appendChild(btn);
  });
}
function renderTaskbar() {
  if (!taskbarApps) return; taskbarApps.innerHTML = '';
  state.windows.forEach(win => {
    const btn = document.createElement('button'); btn.className = `taskbar-item ${state.activeApp === win.id ? 'active' : ''}`;
    btn.textContent = win.title; btn.addEventListener('click', () => openApp(win.type));
    taskbarApps.appendChild(btn);
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initLogin); else initLogin();
