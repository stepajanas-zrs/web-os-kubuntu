// ============================================================================
// MICRO-KERNEL WEB OS - ČÁST 1 ZE 2 (KONFIGURACE A PŘIHLÁŠENÍ)
// ============================================================================
const APP_REGISTRY = {
  notepad: { title: 'Notepad', w: 540, h: 440 },
  files: { title: 'Files', w: 720, h: 480 },
  calculator: { title: 'KCalc (Kalkulačka)', w: 340, h: 570 },
  textbook: { title: 'Učebnice a slovníky', w: 680, h: 500 },
  games: { title: 'CrazyGames Centrum', w: 850, h: 550 },
  pygame: { title: 'Pygame Herní Složka', w: 820, h: 620 }
};

// SEZNAM VAŠICH HER ZE SLOŽKY "pygame_hry"
const PYGAME_LIST = [
  { name: 'Moje Hra 1', path: 'pygame_hry/hra1/index.html' },
  { name: 'Moje Hra 2', path: 'pygame_hry/hra2/index.html' }
];

const LOGIN = { username: 'stepan', password: 'janas' };
let desktopIcons, windowsLayer, taskbarApps, startMenu, startButton, clock, loginScreen, loginForm, loginError;

const sys_state = {
  m_windows: new Map(), next_pid: 1, active_pid: null, kernel_ready: false, selectedFile: 'Home/Welcome.txt',
  fs: {
    'Home/Welcome.txt': 'Vítejte ve Web OS na Vercelu!',
    'pygame_hry/NAVOD.txt': '1. Zkompilujte hru: pygbag hra.py\n2. Vložte složku build/web do pygame_hry/hra1/\n3. Nahrajte na Vercel.',
    'Ucebnice/Strana_1_Konverzace.txt': '=== STRANA 1: KONVERZACE ===\n- Good evening. A table for two, please.\n- Could we have the menu, please?',
    'Ucebnice/Strana_2_Jidlo.txt': '=== STRANA 2: JÍDLO ===\n- What do you recommend?\n- I will have the steak with potatoes.'
  }
};

function getAuthState() { return localStorage.getItem('web-os-auth') === 'true'; }
function setAuthState(val) { localStorage.setItem('web-os-auth', val ? 'true' : 'false'); }
function updateClock() { if (clock) clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

function initLogin() {
  loginScreen = document.getElementById('login-screen');
  loginForm = document.getElementById('login-form');
  loginError = document.getElementById('login-error');
  const showLogin = !getAuthState();
  
  document.querySelectorAll('.hidden-on-login').forEach(el => el.style.display = showLogin ? 'none' : '');

  if (showLogin) {
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('username').value.trim().toLowerCase();
        const p = document.getElementById('password').value.trim().toLowerCase();
        if (u === LOGIN.username && p === LOGIN.password) {
          setAuthState(true); loginScreen.classList.add('hidden'); bootDesktop();
        } else if (loginError) {
          loginError.textContent = 'Neplatné jméno nebo heslo!';
        }
      });
    }
    return;
  }
  if (loginScreen) loginScreen.classList.add('hidden');
  bootDesktop();
}

function bootDesktop() {
  if (sys_state.kernel_ready || !getAuthState()) return;
  sys_state.kernel_ready = true;
  desktopIcons = document.getElementById('desktop-icons'); windowsLayer = document.getElementById('windows-layer');
  taskbarApps = document.getElementById('taskbar-apps'); startMenu = document.getElementById('start-menu');
  startButton = document.getElementById('start-button'); clock = document.getElementById('clock');
  
  document.querySelectorAll('.hidden-on-login').forEach(el => el.style.display = '');
  buildDesktopIcons(); renderTaskbar();

  if (startButton) startButton.addEventListener('click', (e) => { e.stopPropagation(); startMenu?.classList.toggle('hidden'); });
  document.addEventListener('click', (e) => { if (startMenu && !e.target.closest('#start-button') && !e.target.closest('#start-menu')) startMenu.classList.add('hidden'); });
  if (startMenu) {
    startMenu.querySelectorAll('.menu-item').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.action === 'logout') { setAuthState(false); location.reload(); return; }
        requestPid(btn.dataset.app); startMenu.classList.add('hidden');
      });
    });
  }
  updateClock(); setInterval(updateClock, 1000);
}
// ============================================================================
// MICRO-KERNEL WEB OS - ČÁST 2 ZE 2 (OKNA, IKONY A APLIKACE)
// ============================================================================
function requestPid(app_type) {
  if (!windowsLayer) return;
  for (let [pid, win] of sys_state.m_windows) {
    if (win.type === app_type) { if (win.minimized) { win.node.style.display = 'flex'; win.minimized = false; } switchFocus(pid); return; }
  }
  const meta = APP_REGISTRY[app_type]; if (!meta) return;
  const pid = `pid-${sys_state.next_pid++}`;
  const win = { id: pid, type: app_type, title: meta.title, x: 100 + (sys_state.m_windows.size * 25), y: 80 + (sys_state.m_windows.size * 20), w: meta.w, h: meta.h, minimized: false };
  allocateRenderLayer(win);
}

function switchFocus(pid) {
  let idx = 0;
  for (let [id, win] of sys_state.m_windows) {
    const active = id === pid; win.node.classList.toggle('focused', active);
    win.node.style.zIndex = active ? '5000' : String(100 + idx++);
    if (active) sys_state.active_pid = pid;
  }
  renderTaskbar();
}

function renderTaskbar() {
  if (!taskbarApps) return; taskbarApps.innerHTML = '';
  for (let [id, win] of sys_state.m_windows) {
    const btn = document.createElement('button'); btn.className = `taskbar-item ${sys_state.active_pid === id ? 'active' : ''}`;
    btn.textContent = win.title; btn.addEventListener('click', () => { if (win.minimized) { win.node.style.display = 'flex'; win.minimized = false; } switchFocus(id); });
    taskbarApps.appendChild(btn);
  }
}

function buildDesktopIcons() {
  if (!desktopIcons) return; desktopIcons.innerHTML = '';
  const apps = [
    ['Notepad', 'notepad', '✎'], ['Files', 'files', '📁'], ['Calculator', 'calculator', '🧮'], 
    ['Učebnice', 'textbook', '📚'], ['Web Hry', 'games', '🎮'], ['Pygame Hry', 'pygame', '🐍']
  ];
  apps.forEach(([name, app, em]) => {
    const btn = document.createElement('button'); btn.className = 'desktop-icon';
    btn.innerHTML = `<div class="icon">${em}</div><div class="label">${name}</div>`;
    btn.addEventListener('click', () => requestPid(app)); desktopIcons.appendChild(btn);
  });
}

function allocateRenderLayer(win) {
  const node = document.createElement('div'); node.className = 'window'; node.id = win.id;
  node.style.width = `${win.w}px`; node.style.height = `${win.h}px`; node.style.transform = `translate3d(${win.x}px, ${win.y}px, 0px)`;
  node.innerHTML = `<div class="window-header"><div class="window-title">${win.title}</div><div class="window-controls"><button class="control-btn minimize" data-action="minimize" data-pid="${win.id}"></button><button class="control-btn close" data-action="close" data-pid="${win.id}"></button></div></div><div class="window-content"></div>`;
  const content = node.querySelector('.window-content');

  if (win.type === 'pygame') {
    const buttonsHtml = PYGAME_LIST.map(g => `<button class="subject-tab pg-btn" data-path="${g.path}">🐍 ${g.name}</button>`).join('');
    content.innerHTML = `<div class="app-content" style="display:flex;padding:0;height:100%;"><div class="file-list" style="width:200px;padding:10px;border-right:1px solid var(--panel-border);display:flex;flex-direction:column;gap:6px;"><div style="font-size:0.75rem;color:var(--text-muted);font-weight:bold;">SLOŽKA PYGAME_HRY</div>${buttonsHtml}</div><div class="pg-screen" style="flex:1;background:#0a0f1d;display:flex;align-items:center;justify-content:center;padding:20px;text-align:center;"><p style="color:var(--text-muted);">Vyberte hru ze seznamu vlevo.</p></div></div>`;
    content.querySelectorAll('.pg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        content.querySelectorAll('.pg-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active');
        content.querySelector('.pg-screen').innerHTML = `<iframe src="${btn.dataset.path}" style="width:100%;height:100%;border:none;" allow="autoplay;fullscreen"></iframe>`;
      });
    });
  } else if (win.type === 'calculator') {
    content.innerHTML = `<div class="app-content calculator-content"><div class="calc-screen" id="sc-${win.id}">0</div><div class="calculator-grid"><button class="calc-key operator" data-v="C">C</button><button class="calc-key operator" data-v="/">/</button><button class="calc-key operator" data-v="*">×</button><button class="calc-key operator" data-v="DEL">⌫</button><button class="calc-key" data-v="7">7</button><button class="calc-key" data-v="8">8</button><button class="calc-key" data-v="9">9</button><button class="calc-key operator" data-v="-">−</button><button class="calc-key" data-v="4">4</button><button class="calc-key" data-v="5">5</button><button class="calc-key" data-v="6">6</button><button class="calc-key operator" data-v="+">+</button><button class="calc-key" data-v="1">1</button><button class="calc-key" data-v="2">2</button><button class="calc-key" data-v="3">3</button><button class="calc-key equals" data-v="=" style="grid-row:span 2">=</button><button class="calc-key" data-v="0" style="grid-column:span 2">0</button><button class="calc-key" data-v=".">.</button></div></div>`;
  } else if (win.type === 'notepad') {
    content.innerHTML = `<div class="app-content"><textarea class="notepad-editor" id="txt-${win.id}" style="width:100%;height:calc(100% - 40px)">${sys_state.fs['Home/Welcome.txt']}</textarea><button class="primary-btn" id="save-${win.id}">Uložit</button></div>`;
    document.getElementById(`save-${win.id}`)?.addEventListener('click', () => { sys_state.fs['Home/Welcome.txt'] = document.getElementById(`txt-${win.id}`).value; });
  } else if (win.type === 'files') {
    content.innerHTML = `<div class="app-content"><pre>${Object.entries(sys_state.fs).map(([k, v]) => `--- ${k} ---\n${v}`).join('\n\n')}</pre></div>`;
  } else if (win.type === 'textbook') {
    content.innerHTML = `<div class="app-content" style="display:flex;gap:10px;height:100%"><div class="file-list" style="width:180px"><button class="subject-tab active" data-page="Ucebnice/Strana_1_Konverzace.txt">Strana 1</button><button class="subject-tab" data-page="Ucebnice/Strana_2_Jidlo.txt">Strana 2</button></div><div class="textbook-view-zone" style="flex:1"></div></div>`;
  } else if (win.type === 'games') {
    content.innerHTML = `<div class="app-content" style="padding:0;height:100%"><iframe src="https://crazygames.com" style="width:100%;height:100%;border:none" allow="autoplay;gamepad;fullscreen"></iframe></div>`;
  }

  win.node = node; sys_state.m_windows.set(win.id, win);
  node.addEventListener('pointerdown', () => switchFocus(win.id));
  node.querySelectorAll('.control-btn').forEach(btn => btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (btn.dataset.action === 'close') { node.remove(); sys_state.m_windows.delete(win.id); }
    else { node.style.display = 'none'; win.minimized = true; }
    renderTaskbar();
  }));

  const header = node.querySelector('.window-header');
  header?.addEventListener('pointerdown', (e) => {
    if (e.target.matches('button')) return;
    let ox = e.clientX - win.x, oy = e.clientY - win.y;
    const drag = (ev) => { win.x = ev.clientX - ox; win.y = ev.clientY - oy; node.style.transform = `translate3d(${win.x}px, ${win.y}px, 0px)`; };
    const stop = () => { document.removeEventListener('pointermove', drag); document.removeEventListener('pointerup', stop); };
    document.addEventListener('pointermove', drag); document.addEventListener('pointerup', stop);
  });

  windowsLayer.appendChild(node);
  if (win.type === 'calculator' && window.initScientificCalculator) window.initScientificCalculator(win.id, node);
  if (win.type === 'textbook' && window.initTextbookApp) window.initTextbookApp(win.id, node);
  setTimeout(() => node.classList.add('window-open'), 10); renderTaskbar(); switchFocus(win.id);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initLogin); else initLogin();
