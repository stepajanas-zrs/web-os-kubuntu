// ============================================================================
// MICRO-KERNEL WEB OS (ARM V8 OPTIMIZED) - ČÁST 1 ze 2
// ============================================================================
const APP_REGISTRY = {
  notepad: { title: 'Notepad', w: 540, h: 440 },
  files: { title: 'Files', w: 720, h: 480 },
  calculator: { title: 'KCalc (Kalkulačka)', w: 340, h: 440 }
};

// Autentizační registr
const SECURE_REG = {
  usr: 'stepan',
  pwd: 'janas'
};

const sys_state = {
  m_windows: new Map(), // Paměťově efektivní alokace oken namísto Array
  next_pid: 1,
  active_pid: null,
  kernel_ready: false,
  fs: {
    'Home/Welcome.txt': 'System core initialized successfully.\nArchitecture: WebOS ARM-V8 Virtual Kernel.',
    'Documents/Projekt.txt': '1. Virtual DOM Allocation\n2. Hardware Accelerated Layers'
  }
};

function getSysAuth() { 
  return localStorage.getItem('wos_lock') === '1'; 
}

function initLogin() {
  loginScreen = document.getElementById('login-screen');
  loginForm = document.getElementById('login-form');
  loginError = document.getElementById('login-error');
  const is_locked = !getSysAuth();

  document.querySelectorAll('.hidden-on-login').forEach(el => {
    el.style.setProperty('display', is_locked ? 'none' : 'block');
  });

  if (is_locked) {
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // OPRAVA: Oříznutí mezer a převod na malá písmena pro 100% spolehlivost přihlášení
        const u = document.getElementById('username').value.trim().toLowerCase();
        const p = document.getElementById('password').value.trim().toLowerCase();

        if (u === SECURE_REG.usr && p === SECURE_REG.pwd) {
          localStorage.setItem('wos_lock', '1');
          if (loginScreen) loginScreen.classList.add('hidden');
          bootDesktop();
        } else {
          if (loginError) loginError.textContent = 'Hardware Auth Refused: Invalid Credentials';
        }
      });
    }
    return;
  }
  if (loginScreen) loginScreen.classList.add('hidden');
  bootDesktop();
}

function bootDesktop() {
  if (sys_state.kernel_ready || !getSysAuth()) return;
  sys_state.kernel_ready = true;

  // Alokace hardwarově akcelerovaných vrstev registru
  sys_state.dom_icons = document.getElementById('desktop-icons');
  sys_state.dom_layer = document.getElementById('windows-layer');
  sys_state.dom_taskbar = document.getElementById('taskbar-apps');
  sys_state.dom_menu = document.getElementById('start-menu');

  document.querySelectorAll('.hidden-on-login').forEach(el => {
    el.style.setProperty('display', '');
  });

  buildHardwareIcons();
  syncTaskbar();
  requestPid('calculator'); // Okamžitý instanční start kalkulačky

  const start_btn = document.getElementById('start-button');
  if (start_btn) {
    start_btn.addEventListener('click', (e) => {
      e.stopPropagation();
      sys_state.dom_menu?.classList.toggle('hidden');
    });
  }

  document.addEventListener('click', () => sys_state.dom_menu?.classList.add('hidden'));

  sys_state.dom_menu?.querySelectorAll('.menu-item').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.action === 'logout') {
        localStorage.removeItem('wos_lock');
        location.reload(); // Hard reset paměťových registrů
        return;
      }
      requestPid(btn.dataset.app);
    });
  });

  const clock = document.getElementById('clock');
  const tick = () => { 
    if (clock) clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); 
  };
  tick(); 
  setInterval(tick, 1000);
}

function buildHardwareIcons() {
  if (!sys_state.dom_icons) return;
  sys_state.dom_icons.innerHTML = '';
  
  const target_apps = [['Notepad', 'notepad', '✎'], ['Files', 'files', '📁'], ['Calculator', 'calculator', '🧮']];
  const fragment = document.createDocumentFragment();
  
  target_apps.forEach(([name, app, emoji]) => {
    const btn = document.createElement('button');
    btn.className = 'desktop-icon';
    btn.innerHTML = `<div class="icon">${emoji}</div><div class="label">${name}</div>`;
    btn.addEventListener('click', () => requestPid(app));
    fragment.appendChild(btn);
  });
  sys_state.dom_icons.appendChild(fragment);
}

// ============================================================================
// MICRO-KERNEL WEB OS (ARM V8 OPTIMIZED) - ČÁST 2 ze 2 (OPRAVENO PRO START)
// ============================================================================
function requestPid(app_type) {
  if (!sys_state.dom_layer) return;
  
  // Kontrola, zda již aplikace neběží v paměti
  for (let [pid, win] of sys_state.m_windows) {
    if (win.type === app_type) {
      if (win.minimized) {
        win.node.style.setProperty('display', 'flex');
        win.minimized = false;
      }
      switchFocus(pid);
      return;
    }
  }

  const meta = APP_REGISTRY[app_type];
  if (!meta) return;

  const pid = `pid-${sys_state.next_pid++}`;
  const win_obj = {
    id: pid, type: app_type, title: meta.title,
    x: 120 + (sys_state.m_windows.size * 30), y: 90 + (sys_state.m_windows.size * 25),
    w: meta.w, h: meta.h, minimized: false
  };

  allocateRenderLayer(win_obj);
}

function allocateRenderLayer(win) {
  const node = document.createElement('div');
  node.className = 'window';
  node.id = win.id;
  node.style.setProperty('width', `${win.w}px`);
  node.style.setProperty('height', `${win.h}px`);
  
  // Hardwarová akcelerace pozice okna skrze grafickou kartu
  node.style.setProperty('transform', `translate3d(${win.x}px, ${win.y}px, 0px)`);

  node.innerHTML = `
    <div class="window-header">
      <div class="window-title">${win.title}</div>
      <div class="window-controls">
        <button class="control-btn minimize" data-pid="${win.id}" aria-label="Minimalizovat"></button>
        <button class="control-btn close" data-pid="${win.id}" aria-label="Zavřít"></button>
      </div>
    </div>
    <div class="window-content"></div>
  `;

  const content = node.querySelector('.window-content');
  
  // Vykreslení obsahu: Vědecká kalkulačka KCalc
  if (win.type === 'calculator') {
    content.innerHTML = `
      <div class="app-content calculator-content">
        <div class="calc-screen" id="sc-${win.id}">0</div>
        <div class="calculator-grid">
          <button class="calc-key operator" data-v="C">C</button>
          <button class="calc-key operator" data-v="/">/</button>
          <button class="calc-key operator" data-v="*">×</button>
          <button class="calc-key operator" data-v="DEL">DEL</button>
          <button class="calc-key" data-v="7">7</button><button class="calc-key" data-v="8">8</button><button class="calc-key" data-v="9">9</button>
          <button class="calc-key operator" data-v="-">−</button>
          <button class="calc-key" data-v="4">4</button><button class="calc-key" data-v="5">5</button><button class="calc-key" data-v="6">6</button>
          <button class="calc-key operator" data-v="+">+</button>
          <button class="calc-key" data-v="1">1</button><button class="calc-key" data-v="2">2</button><button class="calc-key" data-v="3">3</button>
          <button class="calc-key equals" data-v="=">=</button>
          <button class="calc-key" data-v="0" style="grid-column: span 3;">0</button><button class="calc-key" data-v=".">.</button>
        </div>
      </div>`;
      
    const scr = document.getElementById(`sc-${win.id}`);
    let buffer = '';
    
    node.addEventListener('click', (e) => {
      const btn = e.target.closest('.calc-key'); if (!btn) return;
      const v = btn.dataset.v; if (!v) return;
      if (v === 'C') buffer = '';
      else if (v === 'DEL') buffer = buffer.slice(0, -1);
      else if (v === '=') { try { buffer = String(Function(`"use strict"; return (${buffer || '0'})`)()); } catch { buffer = 'Error'; } }
      else buffer += v;
      if (scr) scr.textContent = buffer || '0';
    });
  }

  if (win.type === 'notepad') {
    content.innerHTML = `<div class="app-content"><textarea class="notepad-editor" style="width:100%;height:100%;"></textarea></div>`;
  }

  if (win.type === 'files') {
    content.innerHTML = `<div class="app-content"><div class="files-layout"><div class="file-list"><ul><li class="active">Welcome.txt</li></ul></div><div class="file-preview"><pre>${sys_state.fs['Home/Welcome.txt']}</pre></div></div></div>`;
  }

  win.node = node;
  sys_state.m_windows.set(win.id, win);

  node.addEventListener('pointerdown', () => switchFocus(win.id));
  node.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const target_pid = btn.dataset.pid;
      if (btn.classList.contains('close')) {
        document.getElementById(target_pid)?.remove();
        sys_state.m_windows.delete(target_pid);
      } else {
        const w_data = sys_state.m_windows.get(target_pid);
        if (w_data) { w_data.node.style.setProperty('display', 'none'); w_data.minimized = true; }
      }
      syncTaskbar();
    });
  });

  bindHardwareDrag(node, win);
  sys_state.dom_layer.appendChild(node);
  setTimeout(() => node.classList.add('window-open'), 10);
  switchFocus(win.id);
}

function switchFocus(pid) {
  let index = 0;
  for (let [id, win] of sys_state.m_windows) {
    const is_target = id === pid;
    win.node.classList.toggle('focused', is_target);
    win.node.style.setProperty('z-index', is_target ? '5000' : String(100 + index));
    if (is_target) sys_state.active_pid = pid;
    index++;
  }
  syncTaskbar();
}

function bindHardwareDrag(element, win) {
  const header = element.querySelector('.window-header'); if (!header) return;
  let ox = 0, oy = 0;
  header.addEventListener('pointerdown', (e) => {
    if (e.target.matches('button')) return;
    ox = e.clientX - win.x; oy = e.clientY - win.y;
    element.setPointerCapture(e.pointerId);
    const drag = (ev) => { win.x = ev.clientX - ox; win.y = ev.clientY - oy; element.style.setProperty('transform', `translate3d(${win.x}px, ${win.y}px, 0px)`); };
    const stop = () => { element.removeEventListener('pointermove', drag); element.removeEventListener('pointerup', stop); };
    element.addEventListener('pointermove', drag); element.addEventListener('pointerup', stop);
  });
}

function syncTaskbar() {
  if (!sys_state.dom_taskbar) return; sys_state.dom_taskbar.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (let [id, win] of sys_state.m_windows) {
    const btn = document.createElement('button'); btn.className = `taskbar-item ${sys_state.active_pid === id ? 'active' : ''}`;
    btn.textContent = win.title; btn.addEventListener('click', () => { if (win.minimized) { win.node.style.setProperty('display', 'flex'); win.minimized = false; } switchFocus(id); });
    frag.appendChild(btn);
  }
  sys_state.dom_taskbar.appendChild(frag);
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initLogin); } else { initLogin(); }
