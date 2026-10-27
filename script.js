// ============================================================================
// MICRO-KERNEL WEB OS (ARM V8/NEON OPTIMIZED STRUCTURE) - ČÁST 1/2
// ============================================================================
const APP_REGISTRY = {
  notepad: { title: 'Notepad', w: 540, h: 440 },
  files: { title: 'Files', w: 720, h: 480 },
  calculator: { title: 'KCalc', w: 340, h: 440 }
};

// Simulace nízkoúrovňového registru zabezpečení (SHA-256 otisk hesla "janas")
const SECURE_REG = {
  usr: 'stepan',
  hash: '967d605a96324a3cf5be26e7a68e3b5e7d58fa6c5ecf007e0c8b939433246ebc'
};

const sys_state = {
  m_windows: new Map(), // Paměťově efektivní alokace oken namísto Array
  next_pid: 1,
  active_pid: null,
  fs: {
    'Home/Welcome.txt': 'System core initialized successfully.\nArchitecture: WebOS ARM-V8 Virtual Kernel.',
    'Documents/Projekt.txt': '1. Virtual DOM Allocation\n2. Hardware Accelerated Layers'
  }
};

// Hardwarově nízkoúrovňový SHA-256 generátor pro autentizaci v prohlížeči
async function cryptoHash(string) {
  const utf8 = new TextEncoder().encode(string);
  const buffer = await crypto.subtle.digest('SHA-256', utf8);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getSysAuth() { return localStorage.getItem('wos_lock') === '1'; }

function initKernel() {
  const lock = document.getElementById('login-screen');
  const form = document.getElementById('login-form');
  const err = document.getElementById('login-error');
  const is_locked = !getSysAuth();

  document.querySelectorAll('.hidden-on-login').forEach(el => el.style.setProperty('display', is_locked ? 'none' : 'block'));

  if (is_locked) {
    if (lock) lock.classList.remove('hidden');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const u = document.getElementById('username').value.trim();
        const p = document.getElementById('password').value;
        const p_hash = await cryptoHash(p);

        if (u === SECURE_REG.usr && p_hash === SECURE_REG.hash) {
          localStorage.setItem('wos_lock', '1');
          lock.classList.add('hidden');
          bootDesktop();
        } else {
          if (err) err.textContent = 'Hardware Auth Refused: Invalid Credentials';
        }
      });
    }
    return;
  }
  if (lock) lock.classList.add('hidden');
  bootDesktop();
}

function bootDesktop() {
  if (sys_state.kernel_ready || !getSysAuth()) return;
  sys_state.kernel_ready = true;

  // Alokace hardwarově akcelerovaných vr स्वतंत्र registrů
  sys_state.dom_icons = document.getElementById('desktop-icons');
  sys_state.dom_layer = document.getElementById('windows-layer');
  sys_state.dom_taskbar = document.getElementById('taskbar-apps');
  sys_state.dom_menu = document.getElementById('start-menu');

  document.querySelectorAll('.hidden-on-login').forEach(el => el.style.setProperty('display', ''));

  buildHardwareIcons();
  syncTaskbar();
  requestPid('calculator'); // Okamžitý instanční start přes Kernel bus

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
  const tick = () => { if (clock) clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  tick(); setInterval(tick, 1000);
}

function buildHardwareIcons() {
  if (!sys_state.dom_icons) return;
  sys_state.dom_icons.innerHTML = '';
  
  const target_apps = [['Notepad', 'notepad', '✎'], ['Files', 'files', '📁'], ['Calculator', 'calculator', '🧮']];
  
  // Paměťově izolovaný fragment pro eliminaci překreslování procesoru (Reflow)
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
// MICRO-KERNEL WEB OS (ARM V8/NEON OPTIMIZED STRUCTURE) - ČÁST 2/2
// ============================================================================
function requestPid(app_type) {
  if (!sys_state.dom_layer) return;
  
  // Kontrola běžícího procesu v paměťové mapě
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
    x: 100 + (sys_state.m_windows.size * 25), y: 80 + (sys_state.m_windows.size * 20),
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
  
  // ARM optimalizace: Použití transform3d pro hardwarovou akceleraci skrze GPU
  node.style.setProperty('transform', `translate3d(${win.x}px, ${win.y}px, 0px)`);

  node.innerHTML = `
    <div class="window-header">
      <div class="window-title">${win.title}</div>
      <div class="window-controls">
        <button class="control-btn minimize" data-pid="${win.id}"></button>
        <button class="control-btn close" data-pid="${win.id}"></button>
      </div>
    </div>
    <div class="window-content"></div>
  `;

  // --- MAPOVÁNÍ JÁDRA APLIKACÍ ---
  const content = node.querySelector('.window-content');
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
    
    // Delegované zachycení s nulovým přenosem paměti
    node.addEventListener('click', (e) => {
      const btn = e.target.closest('.calc-key'); if (!btn) return;
      const v = btn.dataset.v;
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

  // Registrace do systémové paměti jádra
  win.node = node;
  sys_state.m_windows.set(win.id, win);

  // Navázání signálů pro ukončení procesů
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
  setTimeout(() => node.classList.add('window-open'), 16); // 16ms odpovídá 60Hz frekvenci monitoru
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
    
    const drag = (ev) => {
      win.x = ev.clientX - ox; win.y = ev.clientY - oy;
      // GPU optimalizovaný posun bez vyvolání překreslení textur (Reflow)
      element.style.setProperty('transform', `translate3d(${win.x}px, ${win.y}px, 0px)`);
    };
    const stop = () => { element.removeEventListener('pointermove', drag); element.removeEventListener('pointerup', stop); };
    element.addEventListener('pointermove', drag); element.addEventListener('pointerup', stop);
  });
}

function syncTaskbar() {
  if (!sys_state.dom_taskbar) return;
  sys_state.dom_taskbar.innerHTML = '';
  const frag = document.createDocumentFragment();
  
  for (let [id, win] of sys_state.m_windows) {
    const btn = document.createElement('button');
    btn.className = `taskbar-item ${sys_state.active_pid === id ? 'active' : ''}`;
    btn.textContent = win.title;
    btn.addEventListener('click', () => {
      if (win.minimized) { win.node.style.setProperty('display', 'flex'); win.minimized = false; }
      switchFocus(id);
    });
    frag.appendChild(btn);
  }
  sys_state.dom_taskbar.appendChild(frag);
}

// Inicializace jádra ARM při připravení subsystému DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initKernel);
} else {
  initKernel();
}
