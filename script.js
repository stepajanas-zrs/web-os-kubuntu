// ==========================================
// 1. GLOBÁLNÍ METADATA A STAV SYSTÉMU KUBUNTU
// ==========================================
const APP_META = {
  dolphin: { title: 'Dolphin (Správce souborů)', width: 720, height: 460 },
  kate: { title: 'Kate (Textový editor)', width: 550, height: 440 },
  falkon: { title: 'Falkon (Webový prohlížeč)', width: 780, height: 520 },
  konsole: { title: 'Konsole (Terminál)', width: 640, height: 420 },
  kcalc: { title: 'KCalc (Kalkulačka)', width: 360, height: 440 },
  discover: { title: 'Discover (Centrum softwaru)', width: 800, height: 550 },
  steam: { title: 'Steam', width: 780, height: 520, isInstalledApp: true, url: 'https://steampowered.com' },
  discord: { title: 'Discord', width: 780, height: 520, isInstalledApp: true, url: 'https://discord.com' },
  spotify: { title: 'Spotify', width: 780, height: 520, isInstalledApp: true, url: 'https://spotify.com' },
  vscode: { title: 'Visual Studio Code', width: 780, height: 520, isInstalledApp: true, url: 'https://visualstudio.com' },
  gimp: { title: 'GIMP (Grafický editor)', width: 700, height: 480, isInstalledApp: true, isGimp: true },
  vlc: { title: 'VLC Media Player', width: 500, height: 350, isInstalledApp: true, isVlc: true }
};

const LOGIN = {
  username: 'stepan',
  password: 'janas'
};

const DISCOVER_APPS = [
  { id: 'steam', name: 'Steam', category: 'Hry', icon: '🎮', desc: 'Platforma pro digitální distribuci her a hraní.' },
  { id: 'discord', name: 'Discord', category: 'Internet', icon: '💬', desc: 'Chatovací platforma pro komunity a hráče.' },
  { id: 'spotify', name: 'Spotify', category: 'Multimédia', icon: '🎵', desc: 'Streamovací služba pro hudbu a podcasty.' },
  { id: 'vscode', name: 'VS Code', category: 'Vývoj', icon: '💻', desc: 'Pokročilý editor zdrojového kódu od Microsoftu.' },
  { id: 'gimp', name: 'GIMP', category: 'Grafika', icon: '🎨', desc: 'GNU Image Manipulation Program pro úpravu fotografií.' },
  { id: 'vlc', name: 'VLC Player', category: 'Multimédia', icon: '🟠', desc: 'Univerzální přehrávač video a audio souborů.' }
];

const state = {
  windows: [],
  nextId: 1,
  activeApp: null,
  browserUrl: 'https://example.com',
  installedApps: ['steam'],
  fileSystem: {
    'Home/Vítejte.txt': 'Vítejte v systému Kubuntu OS (KDE Plasma)!\n\nToto prostředí simuluje moderní Linux desktop.\n\n- Dolphin: Správce souborů\n- Kate: Pokročilý textový editor\n- Konsole: Linux terminál\n- Discover: Instalace aplikací z PC\n\nNainstalujte si další software přes centrum Discover!',
    'Documents/Linux_Poznámky.txt': 'Základní příkazy pro Konsole:\n1. help - zobrazí nápovědu\n2. ls - vypíše soubory\n3. whoami - aktuální uživatel\n4. clear - vyčistí obrazovku',
    'Pictures/Pozadí_Koncept.txt': 'KDE Plasma Wallpaper Concept\n- Breeze Dark téma\n- Neonově modré akcenty\n- Elegantní spodní panel'
  },
  selectedFile: 'Home/Vítejte.txt',
  desktopReady: false,
  loggedIn: false
};

let desktopIcons;
let windowsLayer;
let taskbarApps;
let startMenu;
let startButton;
let clock;
let loginScreen;
let loginForm;
let loginError;
// ==========================================
// 2. MANAGEMENT PŘIHLÁŠENÍ A SDDM RELAY
// ==========================================
function getAuthState() {
  return localStorage.getItem('web-os-auth') === 'true';
}

function setAuthState(value) {
  localStorage.setItem('web-os-auth', value ? 'true' : 'false');
  state.loggedIn = value;
}

function initLogin() {
  loginScreen = document.getElementById('login-screen');
  loginForm = document.getElementById('login-form');
  loginError = document.getElementById('login-error');

  const shouldShowLogin = !getAuthState();
  const desktopElems = document.querySelectorAll('.hidden-on-login');
  desktopElems.forEach((el) => {
    el.style.display = shouldShowLogin ? 'none' : '';
  });

  if (shouldShowLogin) {
    if (loginScreen) loginScreen.classList.remove('hidden');
    
    const usernameInput = document.getElementById('username');
    if (usernameInput) usernameInput.value = LOGIN.username;

    if (loginForm) {
      loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (username === LOGIN.username && password === LOGIN.password) {
          setAuthState(true);
          if (loginScreen) loginScreen.classList.add('hidden');
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
// ==========================================
// 3. INICIALIZACE DESKTOPU A KDE PANELU
// ==========================================
function initDesktop() {
  if (state.desktopReady) return;
  if (!getAuthState()) return;

  state.desktopReady = true;
  state.loggedIn = true;

  desktopIcons = document.getElementById('desktop-icons');
  windowsLayer = document.getElementById('windows-layer');
  taskbarApps = document.getElementById('taskbar-apps');
  startMenu = document.getElementById('start-menu');
  startButton = document.getElementById('start-button');
  clock = document.getElementById('clock');

  const desktopElems = document.querySelectorAll('.hidden-on-login');
  desktopElems.forEach((el) => {
    el.classList.remove('hidden');
    el.style.display = '';
  });

  buildDesktopIcons();
  renderTaskbar();
  openApp('dolphin');

  if (startButton) {
    startButton.addEventListener('click', () => {
      if (startMenu) {
        startMenu.classList.toggle('hidden');
        if (!startMenu.classList.contains('hidden')) {
          renderStartMenuContent();
        }
      }
    });
  }

  document.addEventListener('click', (event) => {
    if (!event.target.closest('#start-button') && !event.target.closest('#start-menu')) {
      if (startMenu) startMenu.classList.add('hidden');
    }
  });

  const savedNote = localStorage.getItem('web-os-note');
  if (savedNote) {
    state.fileSystem['Home/Vítejte.txt'] = savedNote;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

function renderStartMenuContent() {
  if (!startMenu) return;
  
  let menuHtml = `
    <div class="start-menu-header">
      <div class="start-menu-user">👤 ${LOGIN.username} (Kubuntu User)</div>
    </div>
    <div class="start-menu-content">
      <div style="font-size:0.75rem; color:var(--muted); padding:4px 12px; font-weight:bold;">SYSTÉM</div>
      <button class="menu-item" data-app="dolphin">📁 Dolphin (Správce souborů)</button>
      <button class="menu-item" data-app="kate">✎ Kate (Textový editor)</button>
      <button class="menu-item" data-app="falkon">🌐 Falkon (Prohlížeč)</button>
      <button class="menu-item" data-app="konsole">⌨ Konsole (Terminál)</button>
      <button class="menu-item" data-app="kcalc">🧮 KCalc (Kalkulačka)</button>
      <button class="menu-item" data-app="discover">🛍 Discover (Centrum softwaru)</button>
  `;

  if (state.installedApps.length > 0) {
    menuHtml += `<div style="font-size:0.75rem; color:var(--muted); padding:8px 12px 4px 12px; font-weight:bold;">NAINSTALOVANÉ (PC)</div>`;
    state.installedApps.forEach(appId => {
      const meta = APP_META[appId];
      if (meta) {
        const discoverItem = DISCOVER_APPS.find(d => d.id === appId);
        const icon = discoverItem ? discoverItem.icon : '🚀';
        menuHtml += `<button class="menu-item" data-app="${appId}">${icon} ${meta.title}</button>`;
      }
    });
  }

  menuHtml += `
      <div style="border-top:1px solid rgba(0,0,0,0.2); margin-top:6px; padding-top:4px;">
        <button class="menu-item" data-action="logout" style="color:var(--danger);">🚪 Odhlásit se</button>
      </div>
    </div>
  `;

  startMenu.innerHTML = menuHtml;

  startMenu.querySelectorAll('.menu-item').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (action === 'logout') {
        setAuthState(false);
        state.desktopReady = false;
        state.windows = [];
        if (windowsLayer) windowsLayer.innerHTML = '';
        if (taskbarApps) taskbarApps.innerHTML = '';
        if (startMenu) startMenu.classList.add('hidden');
        if (loginScreen) {
          loginScreen.classList.remove('hidden');
          const passEl = document.getElementById('password');
          if (passEl) passEl.value = '';
          if (loginError) loginError.textContent = '';
        }
        initLogin();
        return;
      }
      openApp(button.dataset.app);
      startMenu.classList.add('hidden');
    });
  });
}
// ==========================================
// 4. MANIPULACE S OKNY (BREEZE DESIGN)
// ==========================================
function openApp(app) {
  if (!windowsLayer) return;

  const existing = state.windows.find((win) => win.type === app);
  if (existing) {
    const element = document.getElementById(existing.id);
    if (element && existing.minimized) {
      element.style.display = 'flex';
      existing.minimized = false;
    }
    focusWindow(existing.id);
    return;
  }

  const meta = APP_META[app];
  if (!meta) return;

  const id = `window-${state.nextId++}`;
  const win = {
    id,
    type: app,
    title: meta.title,
    x: 80 + (state.windows.length * 28),
    y: 60 + (state.windows.length * 22),
    width: meta.width,
    height: meta.height,
    z: state.windows.length + 10,
    minimized: false,
    maximized: false
  };

  state.windows.push(win);
  renderWindow(win);
  renderTaskbar();
  focusWindow(id);
}

function maximizeWindow(id) {
  const win = state.windows.find((item) => item.id === id);
  if (!win) return;
  win.maximized = !win.maximized;
  const element = document.getElementById(id);
  if (!element) return;

  if (win.maximized) {
    win.previousX = win.x;
    win.previousY = win.y;
    win.previousWidth = win.width;
    win.previousHeight = win.height;
    element.style.left = '0px';
    element.style.top = '0px';
    element.style.width = '100vw';
    element.style.height = 'calc(100vh - 46px)';
  } else {
    element.style.left = `${win.previousX || win.x}px`;
    element.style.top = `${win.previousY || win.y}px`;
    element.style.width = `${win.previousWidth || win.width}px`;
    element.style.height = `${win.previousHeight || win.height}px`;
  }
}

function minimizeWindow(id) {
  const element = document.getElementById(id);
  if (!element) return;
  element.style.display = 'none';
  const app = state.windows.find((win) => win.id === id);
  if (app) app.minimized = true;
  renderTaskbar();
}

function closeWindow(id) {
  const idx = state.windows.findIndex((win) => win.id === id);
  if (idx >= 0) {
    state.windows.splice(idx, 1);
    const element = document.getElementById(id);
    if (element) element.remove();
  }
  renderTaskbar();
}

function focusWindow(id) {
  state.windows.forEach((win) => {
    const element = document.getElementById(win.id);
    if (!element) return;
    const active = win.id === id;
    element.classList.toggle('focused', active);
    if (active) {
      element.style.zIndex = String(100 + state.windows.indexOf(win));
      state.activeApp = id;
    } else {
      element.style.zIndex = String(10 + state.windows.indexOf(win));
    }
  });
  renderTaskbar();
}

function enableWindowDrag(element, win) {
  const header = element.querySelector('.window-header');
  if (!header) return;
  let offsetX = 0;
  let offsetY = 0;

  header.addEventListener('pointerdown', (event) => {
    if (event.target.matches('button')) return;
    offsetX = event.clientX - element.offsetLeft;
    offsetY = event.clientY - element.offsetTop;
    element.setPointerCapture(event.pointerId);
    element.addEventListener('pointermove', onDrag);
    element.addEventListener('pointerup', stopDrag);
  });

  function onDrag(event) {
    if (win.maximized) return;
    win.x = Math.max(0, Math.min(event.clientX - offsetX, window.innerWidth - win.width));
    win.y = Math.max(0, Math.min(event.clientY - offsetY, window.innerHeight - win.height - 46));
    element.style.left = `${win.x}px`;
    element.style.top = `${win.y}px`;
  }

  function stopDrag() {
    element.removeEventListener('pointermove', onDrag);
    element.removeEventListener('pointerup', stopDrag);
  }
}

// ==========================================
// 5. VYKRESLOVÁNÍ SYSTÉMOVÝCH APLIKACÍ KUBUNTU
// ==========================================
function renderWindow(win) {
  const wrapper = document.createElement('div');
  wrapper.className = 'window';
  wrapper.id = win.id;
  wrapper.style.width = `${win.width}px`;
  wrapper.style.height = `${win.height}px`;
  wrapper.style.left = `${win.x}px`;
  wrapper.style.top = `${win.y}px`;
  wrapper.style.zIndex = win.z;

  wrapper.innerHTML = `
    <div class="window-header">
      <div class="window-title">${win.title}</div>
      <div class="window-controls">
        <button class="control-btn minimize" data-action="minimize" data-id="${win.id}">−</button>
        <button class="control-btn maximize" data-action="maximize" data-id="${win.id}">⬜</button>
        <button class="control-btn close" data-action="close" data-id="${win.id}">×</button>
      </div>
    </div>
    <div class="window-content"></div>
  `;

  const meta = APP_META[win.type];
  const content = wrapper.querySelector('.window-content');

  if (win.type === 'discover') {
    let listHtml = `
      <div class="app-content" style="display:flex; flex-direction:column; height:100%; padding:0;">
        <div style="background:#2a2e32; padding:12px; font-weight:bold; border-bottom:1px solid rgba(0,0,0,0.2); font-size:1.1rem; color:var(--accent);">🛍 Discover Software Center</div>
        <div style="flex:1; overflow:auto; padding:14px; display:flex; flex-direction:column; gap:10px;">
    `;

    DISCOVER_APPS.forEach(app => {
      const isInstalled = state.installedApps.includes(app.id);
      listHtml += `
        <div style="background:#232629; border:1px solid rgba(255,255,255,0.05); padding:12px; border-radius:4px; display:flex; align-items:center; justify-content:space-between; gap:14px;">
          <div style="font-size:2rem; background:#1b1e20; width:50px; height:50px; display:grid; place-items:center; border-radius:4px;">${app.icon}</div>
          <div style="flex:1;">
            <div style="font-weight:bold; font-size:0.95rem;">${app.name} <span style="font-size:0.75rem; color:var(--accent); background:rgba(61,174,233,0.1); padding:2px 6px; border-radius:10px; margin-left:4px;">${app.category}</span></div>
            <div style="font-size:0.8rem; color:var(--muted); margin-top:2px;">${app.desc}</div>
          </div>
          <div>
            <button class="primary-btn discover-btn" data-app-id="${app.id}" style="background:${isInstalled ? 'var(--danger)' : 'var(--accent)'}; width:100px;">
              ${isInstalled ? 'Odinstalovat' : 'Instalovat'}
            </button>
          </div>
        </div>
      `;
    });

    listHtml += `</div></div>`;
    content.innerHTML = listHtml;

    content.querySelectorAll('.discover-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const appId = btn.dataset.appId;
        if (state.installedApps.includes(appId)) {
          state.installedApps = state.installedApps.filter(id => id !== appId);
          showToast(`Aplikace ${APP_META[appId].title} byla odstraněna.`);
        } else {
          state.installedApps.push(appId);
          showToast(`Aplikace ${APP_META[appId].title} byla úspěšně nainstalována!`);
        }
        buildDesktopIcons();
        renderWindow(win);
      });
    });
  }

  else if (win.type === 'kate') {
    content.innerHTML = `
      <div class="app-content notepad-content">
        <textarea id="note-${win.id}" class="notepad-editor">${state.fileSystem['Home/Vítejte.txt'] || ''}</textarea>
        <div class="secondary-bar">
          <button class="secondary-btn" type="button" data-save="${win.id}">Uložit soubor (Ctrl+S)</button>
        </div>
      </div>
    `;
    const textarea = document.getElementById(`note-${win.id}`);
    if (textarea) {
      textarea.addEventListener('input', () => {
        state.fileSystem['Home/Vítejte.txt'] = textarea.value;
      });
    }
    const saveButton = content.querySelector(`[data-save="${win.id}"]`);
    if (saveButton && textarea) {
      saveButton.addEventListener('click', () => {
        localStorage.setItem('web-os-note', textarea.value);
        showToast('Soubor uložen do Home/');
      });
    }
  }

  else if (win.type === 'dolphin') {
    content.innerHTML = `
      <div class="app-content files-content">
        <div class="files-layout">
          <div class="file-list">
            <div style="font-size:0.75rem; color:var(--muted); font-weight:bold; margin-bottom:6px; padding-left:6px;">MÍSTA</div>
            <ul id="file-list-${win.id}"></ul>
          </div>
          <div class="file-preview">
            <h4 id="file-name-${win.id}" style="margin:0 0 10px 0; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:6px; color:var(--accent);"></h4>
            <pre id="file-content-${win.id}" style="margin:0; font-size:0.85rem; line-height:1.5; white-space:pre-wrap;"></pre>
          </div>
        </div>
      </div>
    `;
    renderFileExplorer(win.id);
  }
  else if (meta && (win.type === 'falkon' || meta.isInstalledApp)) {
    const initialUrl = meta.url || state.browserUrl;
    
    let internalPageHtml = ``;
    if (meta.isGimp) {
      internalPageHtml = `<div style="text-align:center; padding-top:40px;"><h2>🎨 GIMP GNU Image Manipulation</h2><p style="color:var(--muted)">Grafické plátno připraveno k úpravám.</p><div style="border:2px dashed rgba(255,255,255,0.1); width:80%; height:180px; margin:20px auto; display:grid; place-items:center; color:var(--muted)">[ Sem přetáhněte obrázek z PC ]</div></div>`;
    } else if (meta.isVlc) {
      internalPageHtml = `<div style="text-align:center; padding-top:30px;"><h2>🟠 VLC Media Player</h2><div style="background:black; width:90%; height:160px; margin:14px auto; display:grid; place-items:center; color:var(--muted)">▶ Žádné médium nebylo načteno</div><p style="font-size:0.8rem;">Otevřít stream nebo lokální disk...</p></div>`;
    } else {
      internalPageHtml = `<div id="browser-page-${win.id}" class="browser-page"><h2>Vítejte ve Falkon Browseru</h2><p>Bezpečný prohlížeč pro prostředí KDE Plasma.</p></div>`;
    }

    content.innerHTML = `
      <div class="app-content browser-content">
        <div class="browser-bar">
          <input id="browser-url-${win.id}" value="${initialUrl}" ${meta.isInstalledApp ? 'disabled' : ''} />
          <button class="primary-btn" type="button" data-browser-go="${win.id}" ${meta.isInstalledApp ? 'disabled' : ''}>Přejít</button>
        </div>
        <div style="flex:1; background:#232629; overflow:auto; border:1px solid rgba(255,255,255,0.05); border-radius:4px;" id="browser-viewport-${win.id}">
          ${internalPageHtml}
        </div>
      </div>
    `;

    const input = document.getElementById(`browser-url-${win.id}`);
    const viewport = document.getElementById(`browser-viewport-${win.id}`);
    const go = wrapper.querySelector('[data-browser-go]');

    if (go && input && viewport && !meta.isInstalledApp) {
      go.addEventListener('click', () => {
        const url = input.value.trim();
        if (!url) return;
        state.browserUrl = url;
        const target = url.startsWith('http') ? url : `https://${url}`;
        viewport.innerHTML = `<div style="padding:14px;"><h2>${target}</h2><p>Načítání obsahu skrze Linux proxy...</p></div>`;
        fetch(`https://jina.ai{target.replace(/^https?:\/\//, '')}`)
          .then((res) => res.text())
          .then((text) => { viewport.innerHTML = `<div style="padding:14px;"><h2>${target}</h2><pre style="white-space:pre-wrap; font-size:0.85rem;">${escapeHtml(text.slice(0, 4000))}</pre></div>`; })
          .catch(() => { viewport.innerHTML = `<div style="padding:14px;"><h2>${target}</h2><p>Sandbox prohlížeče běží, ale vzdálený server odmítl připojení (CORS restriction).</p></div>`; });
      });
    }
  }

  else if (win.type === 'konsole') {
    content.innerHTML = `
      <div class="app-content terminal-content">
        <div class="terminal-output" id="terminal-output-${win.id}">kubuntu@kde-plasma:~$ welcome\nSystem Linux core built successfully. Type 'help' for commands.</div>
        <div class="terminal-input">
          <span style="color:#3daee9; font-weight:bold; padding-left:4px;">kubuntu$:</span>
          <input id="terminal-input-${win.id}" autofocus />
          <button class="primary-btn" type="button" data-terminal-run="${win.id}">Run</button>
        </div>
      </div>
    `;
    const input = document.getElementById(`terminal-input-${win.id}`);
    const output = document.getElementById(`terminal-output-${win.id}`);
    const runBtn = wrapper.querySelector('[data-terminal-run]');
    const runCommand = () => {
      if (!input || !output) return;
      const command = input.value.trim();
      if (!command) return;
      output.textContent += `\nkubuntu@kde-plasma:~$ ${command}`;
      input.value = '';
      const result = handleTerminalCommand(command, win.id);
      if (result) output.textContent += `\n${result}`;
      output.scrollTop = output.scrollHeight;
    };
    if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') runCommand(); });
    if (runBtn) runBtn.addEventListener('click', runCommand);
  }

  else if (win.type === 'kcalc') {
    content.innerHTML = `
      <div class="app-content calculator-content">
        <div class="calc-screen" id="calc-screen-${win.id}">0</div>
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
          <button class="calc-key" data-value="0" style="grid-column: span 3;">0</button>
          <button class="calc-key" data-value=".">.</button>
        </div>
      </div>
    `;
    const screen = document.getElementById(`calc-screen-${win.id}`);
    let expr = ''; let disp = '0';
    wrapper.querySelectorAll('.calc-key').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.value;
        if (!val) return;
        if (val === 'C') { expr = ''; disp = '0'; }
        else if (val === 'DEL') { expr = expr.slice(0, -1); disp = expr || '0'; }
        else if (val === '=') {
          try { disp = String(Function(`"use strict"; return (${expr || '0'})`)()); expr = disp; }
          catch { disp = 'Error'; expr = ''; }
        } else {
          if (expr === '0' && val !== '.') { expr = val; }
          else { expr += val; }
          disp = expr;
        }
        if (screen) screen.textContent = disp;
      });
    });
  }

  wrapper.addEventListener('pointerdown', () => focusWindow(win.id));
  wrapper.querySelectorAll('[data-action]').forEach((b) => {
    b.addEventListener('click', () => {
      const act = b.dataset.action;
      if (act === 'close') closeWindow(win.id);
      if (act === 'minimize') minimizeWindow(win.id);
      if (act === 'maximize') maximizeWindow(win.id);
    });
  });
  enableWindowDrag(wrapper, win);
  if (windowsLayer) windowsLayer.appendChild(wrapper);
}
// ==========================================
// 6. SYSTÉMOVÉ UTILITY, HODINY A DISK-LOADER
// ==========================================
function updateClock() {
  if (!clock) return;
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast visible';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 220);
  }, 2200);
}

function desktopIcon(name, app, emoji) {
  if (!desktopIcons) return;
  const el = document.createElement('button');
  el.className = 'desktop-icon';
  el.type = 'button';
  el.innerHTML = `<div class="icon">${emoji}</div><div class="label">${name}</div>`;
  el.addEventListener('click', () => openApp(app));
  desktopIcons.appendChild(el);
}

function buildDesktopIcons() {
  if (!desktopIcons) return;
  desktopIcons.innerHTML = '';
  
  desktopIcon('Dolphin', 'dolphin', '📁');
  desktopIcon('Kate Editor', 'kate', '📝');
  desktopIcon('Discover', 'discover', '🛍');
  
  state.installedApps.forEach(appId => {
    const meta = APP_META[appId];
    const discoverItem = DISCOVER_APPS.find(d => d.id === appId);
    if (meta && discoverItem) {
      desktopIcon(meta.title, appId, discoverItem.icon);
    }
  });
}

function renderTaskbar() {
  if (!taskbarApps) return;
  taskbarApps.innerHTML = '';
  state.windows.forEach((win) => {
    const btn = document.createElement('button');
    btn.className = `taskbar-item ${state.activeApp === win.id ? 'active' : ''}`;
    btn.textContent = win.title.split(' ');
    btn.addEventListener('click', () => {
      const el = document.getElementById(win.id);
      if (el && win.minimized) { el.style.display = 'flex'; win.minimized = false; }
      focusWindow(win.id);
    });
    taskbarApps.appendChild(btn);
  });
}

function renderFileExplorer(id) {
  const list = document.getElementById(`file-list-${id}`);
  const fileName = document.getElementById(`file-name-${id}`);
  const content = document.getElementById(`file-content-${id}`);
  if (!list) return;
  list.innerHTML = '';
  Object.keys(state.fileSystem).forEach((path) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = "📄 " + path.split('/'); btn.type = 'button';
    if (path === state.selectedFile) btn.classList.add('active');
    btn.addEventListener('click', () => { state.selectedFile = path; renderFileExplorer(id); });
    li.appendChild(btn); list.appendChild(li);
  });
  if (fileName) fileName.textContent = "Dolphin :: " + state.selectedFile;
  if (content) content.textContent = state.fileSystem[state.selectedFile] || '';
}

function handleTerminalCommand(command, id) {
  const lower = command.toLowerCase().trim();
  if (lower === 'help') return 'Dostupné Linux příkazy: help, ls, open [dolphin/kate/discover/kcalc], neofetch, clear, whoami, clock';
  if (lower === 'ls') return Object.keys(state.fileSystem).join('\n');
  if (lower === 'neofetch') {
    return `   ./o.o\\.     OS: Kubuntu Web-OS 2026\n  /eeeeee\\    Kernel: Javascript DOM-Engine\n /eeeeeeee\\   Uptime: ${Math.round(performance.now()/1000)}s\n \\eeeeeeee/   Shell: Bash simulation\n  \\eeeeee/    DE: KDE Plasma 6.0\n   \`\\o.o/\`     WM: KWin`;
  }
  if (lower.startsWith('open ')) {
    const app = lower.replace('open ', '').trim();
    if (APP_META[app]) { openApp(app); return `Aplikace ${app} byla spuštěna.`; }
    return 'Balíček nenalezen. Zkuste ho nainstalovat v Discoveru.';
  }
  if (lower === 'clear') {
    const out = document.getElementById(`terminal-output-${id}`);
    if (out) out.textContent = 'kubuntu@kde-plasma:~$ Vyčištěno.';
    return '';
  }
  if (lower === 'whoami') return state.loggedIn ? LOGIN.username : 'guest';
  if (lower === 'clock') return new Date().toLocaleTimeString();
  return `bash: ${command}: příkaz nenalezen. Seznam získáte napsáním 'help'.`;
}

function escapeHtml(text) { return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLogin);
} else {
  initLogin();
}
