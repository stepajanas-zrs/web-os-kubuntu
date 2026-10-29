// ============================================================================
// MICRO-KERNEL WEB OS (ARM V8 OPTIMIZED) - 1. POLOVINA (DÍL A)
// ============================================================================
const APP_REGISTRY = {
  notepad: { title: 'Notepad', w: 540, h: 440 },
  files: { title: 'Files', w: 720, h: 480 },
  calculator: { title: 'KCalc (Kalkulačka)', w: 340, h: 570 },
  textbook: { title: 'Učebnice a slovníky', w: 680, h: 500 },
  games: { title: 'CrazyGames Centrum', w: 850, h: 550 }
};

const LOGIN = { username: 'stepan', password: 'janas' };

// Globální reference na DOM prvky
let desktopIcons, windowsLayer, taskbarApps, startMenu, startButton, clock, loginScreen, loginForm, loginError;

const sys_state = {
  m_windows: new Map(),
  next_pid: 1,
  active_pid: null,
  kernel_ready: false,
  selectedFile: 'Home/Welcome.txt',
  fs: {
    'Home/Welcome.txt': 'System core initialized successfully.\nArchitecture: WebOS ARM-V8 Virtual Kernel.',
    'Documents/Projekt.txt': '1. Virtual DOM Allocation\n2. Hardware Accelerated Layers',
    'Ucebnice/Strana_1_Zakladni_Konverzace.txt': '=== STRANA 1: ZÁKLADNÍ KONVERZACE V RESTAURACI ===\n\n- Good evening. A table for two, please. (Dobrý večer. Stůl pro dva, prosím.)\n- Do you have a reservation? (Máte rezervaci?)\n- Yes, under the name Stepan. (Ano, na jméno Štěpán.)\n- Follow me, please. Here is your table. (Následujte mě, prosím. Zde je váš stůl.)\n- Could we have the menu, please? (Mohli bychom dostat jídelní lístek, prosím?)\n- Are you ready to order? (Máte vybráno? / Jste připraveni objednat?)\n- We need a few more minutes. (Potřebujeme ještě několik minut.)',
    'Ucebnice/Strana_2_Objednavani_Jidla.txt': '=== STRANA 2: OBJEDNÁVÁNÍ JÍDLA (ORDERING FOOD) ===\n\n- What do you recommend? (Co nám doporučíte?)\n- I would like to order the main course. (Chtěl(a) bych si objednat hlavní chod.)\n- I will have the steak with potatoes. (Dám si steak s bramborami.)\n- Soup of the day (Polévka dne)\n- Appetizer / Starter (Předkrm)\n- Main course / Side dish (Hlavní chod / Příloha)\n- Is this dish spicy? (Je toto jídlo pálivé?)\n- I am a vegetarian. (Jsem vegetarián/ka.)',
    'Ucebnice/Strana_3_Napoje_A_Dezerty.txt': '=== STRANA 3: NÁPOJE A DEZERTY (DRINKS & DESSERTS) ===\n\n- What would you like to drink? (Co si dáte k pití?)\n- Still water, please. (Neperlivou vodu, prosím.)\n- Sparkling water (Perlivá voda)\n- Orange/Apple juice (Pomerančový/Jablečný džus)\n- Beer / Wine (Red, White) (Pivo / Víno - červené, bílé)\n- Tea / Coffee (Latte, Espresso) (Čaj / Káva)\n- For dessert, I will have the chocolate cake. (Jako dezert si dám čokoládový dort.)\n- Ice cream (Zmrzlina)',
    'Ucebnice/Strana_4_Placeni_A_Ucet.txt': '=== STRANA 4: PLACENÍ A ÚČET (THE BILL) ===\n\n- Could we have the bill, please? / Check, please? (Mohli bychom dostat účet, prosím?)\n- Together or separately? (Dohromady nebo zvlášť?)\n- Together, please. (Dohromady, prosím.)\n- Can I pay by credit card? (Mohu platit kartou?)\n- We only accept cash. (Přijímáme pouze hotovost.)\n- Keep the change. (Drobné si nechte - spropitné.)\n- Service charge / Tip (Spropitné - standardně 15 % až 20 %)\n- Included / Not included (Zahrnuto / Nezahrnuto v ceně)',
    'Ucebnice/Strana_5_Gastro_Jednotky.txt': '=== STRANA 5: ANGLOSASKÉ GASTRO JEDNOTKY ===\n\n- 1 ounce (oz) = cca 28.3 g (Používá se pro váhu masa a porcí jídla)\n- 1 fluid ounce (fl oz) = cca 30 ml (Jednotka pro objem tekutin a barové recepty)\n- 1 pint (pt) = 473 ml (US) / 568 ml (UK) (Typická míra pro pivo nebo mléko)\n- 1 pound (lb) = cca 454 g (0.45 kg) (Váha surovin při nákupech na trhu)\n- Quarter pounder = Čtvrtlibrák (označení pro 113g porci masa v burgeru)',
    'Ucebnice/Strana_6_Reseni_Problemu.txt': '=== STRANA 6: ŘEŠENÍ PROBLÉMŮ A STÍŽNOSTI ===\n\n- Excuse me, this is not what I ordered. (Promiňte, tohle není to, co jsem si objednal/a.)\n- The food is cold. (To jídlo je studené.)\n- I am missing a fork/knife. (Chybí mi vidlička/nůž.)\n- This glass is dirty. (Tato sklenice je špinavá.)\n- Could I have another napkin, please? (Mohu dostat další ubrousek, prosím?)\n- I have been waiting for a long time. (Čekám už velmi dlouho.)\n- I am sorry for the mistake. (Omlouvám se za tu chybu - personál.)',
    'Ucebnice/Strana_7_Fraze_Pro_Nakup.txt': '=== STRANA 7: FRÁZE PRO NÁKUP POTRAVIN ===\n\n- Where can I find the bakery section? (Kde najdu sekci pekařství?)\n- Is this grocery store open on Sundays? (Má tento obchod s potravinami otevřeno v neděli?)\n- How much does it cost? (Kolik to stojí?)\n- It is on sale. (Je to ve slevě.)\n- Fresh / Expired / Rotten (Čerstvý / Prošlý / Zkažený)\n- Shopping cart / Basket (Nákupní vozík / Košík)\n- Receipt, please. (Účtenku, prosím.)',
    'Ucebnice/Strana_8_Gramatika_A_Casy.txt': '=== STRANA 8: GRAMATIKA PRO RESTAURACE ===\n\nPoužívání zdvořilostních obratů (Modal Verbs):\n- "I want" je neslušné. Vždy používejte "I would like..." (Chtěl/a bych...)\n- Pro žádosti používejte "Can I have..." nebo "Could you bring us..."\n\nBudoucí čas při objednávání:\n- V momentě rozhodnutí u stolu používáme čisté "I will" (Zkráceně: I\'ll):\n  Příklad: "I\'ll have the chicken." (Dám si kuře. - Rozhodl jsem se právě teď).'
  }
};

function getAuthState() { return localStorage.getItem('web-os-auth') === 'true'; }
function setAuthState(value) { localStorage.setItem('web-os-auth', value ? 'true' : 'false'); }
function updateClock() { if (clock) clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function escapeHtml(text) { return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function initLogin() {
  loginScreen = document.getElementById('login-screen');
  loginForm = document.getElementById('login-form');
  loginError = document.getElementById('login-error');
  const shouldShowLogin = !getAuthState();
  document.querySelectorAll('.hidden-on-login').forEach(el => el.style.setProperty('display', shouldShowLogin ? 'none' : 'block'));
  if (shouldShowLogin) {
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('username').value.trim().toLowerCase();
        const p = document.getElementById('password').value.trim().toLowerCase();
        if (u === LOGIN.username && p === LOGIN.password) {
          setAuthState(true); if (loginScreen) loginScreen.classList.add('hidden'); bootDesktop();
        } else {
          if (loginError) loginError.textContent = 'Neplatné uživatelské jméno nebo heslo!';
        }
      });
    }
    return;
  }
  if (loginScreen) loginScreen.classList.add('hidden'); bootDesktop();
}
// ============================================================================
// MICRO-KERNEL WEB OS (ARM V8 OPTIMIZED) - ČÁST B1: ENGINE MECHANISMUS
// ============================================================================
function requestPid(app_type) {
  if (!windowsLayer) return;
  for (let [pid, win] of sys_state.m_windows) {
    if (win.type === app_type) { 
      if (win.minimized) { win.node.style.display = 'flex'; win.minimized = false; } 
      switchFocus(pid); return; 
    }
  }
  const meta = APP_REGISTRY[app_type]; if (!meta) return;
  const pid = `pid-${sys_state.next_pid++}`;
  const win_obj = { 
    id: pid, type: app_type, title: meta.title, 
    x: 120 + (sys_state.m_windows.size * 30), y: 90 + (sys_state.m_windows.size * 25), 
    w: app_type === 'calculator' ? 440 : (app_type === 'textbook' ? 700 : meta.w), 
    h: app_type === 'calculator' ? 570 : (app_type === 'textbook' ? 520 : meta.h), 
    minimized: false 
  };
  allocateRenderLayer(win_obj);
}

function switchFocus(pid) {
  let index = 0;
  for (let [id, win] of sys_state.m_windows) {
    const is_target = id === pid; win.node.classList.toggle('focused', is_target);
    win.node.style.setProperty('z-index', is_target ? '5000' : String(100 + index));
    if (is_target) sys_state.active_pid = pid; index++;
  }
  renderTaskbar();
}

function bindHardwareDrag(element, win) {
  const header = element.querySelector('.window-header'); if (!header) return;
  let ox = 0, oy = 0;
  header.addEventListener('pointerdown', (e) => {
    if (e.target.matches('button')) return; ox = e.clientX - win.x; oy = e.clientY - win.y;
    element.setPointerCapture(e.pointerId);
    const drag = (ev) => { win.x = ev.clientX - ox; win.y = ev.clientY - oy; element.style.setProperty('transform', `translate3d(${win.x}px, ${win.y}px, 0px)`); };
    const stop = () => { element.removeEventListener('pointermove', drag); element.removeEventListener('pointerup', stop); };
    element.addEventListener('pointermove', drag); element.addEventListener('pointerup', stop);
  });
}

function registerAndSpawn(node, win) {
  win.node = node; sys_state.m_windows.set(win.id, win);
  node.addEventListener('pointerdown', () => switchFocus(win.id));
  node.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); const target_pid = btn.dataset.pid;
      if (btn.dataset.action === 'close') { document.getElementById(target_pid)?.remove(); sys_state.m_windows.delete(target_pid); }
      else { const w_data = sys_state.m_windows.get(target_pid); if (w_data) { w_data.node.style.display = 'none'; w_data.minimized = true; } }
      renderTaskbar();
    });
  });
  bindHardwareDrag(node, win); windowsLayer.appendChild(node);
  if (win.type === 'calculator' && window.initScientificCalculator) window.initScientificCalculator(win.id, node);
  if (win.type === 'textbook' && window.initTextbookApp) window.initTextbookApp(win.id, node);
  setTimeout(() => node.classList.add('window-open'), 10); renderTaskbar(); switchFocus(win.id);
}
// ============================================================================
// MICRO-KERNEL WEB OS (ARM V8 OPTIMIZED) - ČÁST B2: GRAPHICS SHADERS & BOOT
// ============================================================================
function renderTaskbar() {
  if (!taskbarApps) return; taskbarApps.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (let [id, win] of sys_state.m_windows) {
    const btn = document.createElement('button'); btn.className = `taskbar-item ${sys_state.active_pid === id ? 'active' : ''}`;
    btn.textContent = win.title; btn.addEventListener('click', () => { if (win.minimized) { win.node.style.display = 'flex'; win.minimized = false; } switchFocus(id); });
    frag.appendChild(btn);
  }
  taskbarApps.appendChild(frag);
}

function allocateRenderLayer(win) {
  const node = document.createElement('div'); node.className = 'window'; node.id = win.id;
  node.style.setProperty('width', `${win.w}px`); node.style.setProperty('height', `${win.h}px`);
  node.style.setProperty('transform', `translate3d(${win.x}px, ${win.y}px, 0px)`);
  node.innerHTML = `<div class="window-header"><div class="window-title">${win.title}</div><div class="window-controls"><button class="control-btn minimize" data-action="minimize" data-pid="${win.id}"></button><button class="control-btn close" data-action="close" data-pid="${win.id}"></button></div></div><div class="window-content"></div>`;
  const content = node.querySelector('.window-content');
  
  if (win.type === 'calculator') {
    content.innerHTML = `<div class="app-content calculator-content" style="gap:6px; overflow-y:auto;"><div class="calc-screen" id="sc-${win.id}">0</div><div class="calculator-grid" style="grid-template-rows: repeat(5, 38px); flex:none; margin-bottom:4px;"><button class="calc-key operator" data-v="C">C</button><button class="calc-key operator" data-v="/">/</button><button class="calc-key operator" data-v="*">×</button><button class="calc-key operator" data-v="DEL">⌫</button><button class="calc-key" data-v="7">7</button><button class="calc-key" data-v="8">8</button><button class="calc-key" data-v="9">9</button><button class="calc-key operator" data-v="-">−</button><button class="calc-key" data-v="4">4</button><button class="calc-key" data-v="5">5</button><button class="calc-key" data-v="6">6</button><button class="calc-key operator" data-v="+">+</button><button class="calc-key" data-v="1">1</button><button class="calc-key" data-v="2">2</button><button class="calc-key" data-v="3">3</button><button class="calc-key equals" data-v="=" style="grid-row: span 2; height:100%;">=</button><button class="calc-key" data-v="0" style="grid-column: span 2;">0</button><button class="calc-key" data-v=".">.</button></div><div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; margin:2px 0;">🔬 Vědecké funkce</div><div class="calculator-grid" style="grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(2, 34px); flex:none; gap:5px; margin-bottom:4px;"><button class="calc-key operator" data-v="(">(</button><button class="calc-key operator" data-v=")">)</button><button class="calc-key operator" data-sci="sqrt">√</button><button class="calc-key operator" data-sci="sq2">x²</button><button class="calc-key operator" data-sci="sq3">x³</button><button class="calc-key operator" data-sci="sin">sin</button><button class="calc-key operator" data-sci="cos">cos</button><button class="calc-key operator" data-sci="tan">tan</button><button class="calc-key operator" data-sci="log">log</button><button class="calc-key operator" data-sci="ln">ln</button></div><div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; margin:2px 0;">🌌 Fyzikální konstanty</div><div class="calculator-grid" style="grid-template-columns: repeat(4, 1fr); grid-template-rows: 34px; flex:none; gap:5px;"><button class="calc-key operator" data-v="3.14159265">π</button><button class="calc-key operator" data-v="2.71828182">e</button><button class="calc-key operator" data-v="9.81">g</button><button class="calc-key operator" data-v="299792458">c</button></div></div>`;
  }
  if (win.type === 'notepad') {
    content.innerHTML = `<div class="app-content calculator-content"><textarea class="notepad-editor" id="txt-${win.id}" style="width:100%;height:calc(100% - 40px);">${sys_state.fs['Home/Welcome.txt']}</textarea><div class="secondary-bar"><button class="primary-btn" id="save-${win.id}">Uložit soubor</button></div></div>`;
    const area = document.getElementById(`txt-${win.id}`); const sBtn = document.getElementById(`save-${win.id}`);
    if (sBtn && area) { sBtn.addEventListener('click', () => { sys_state.fs['Home/Welcome.txt'] = area.value; localStorage.setItem('web-os-note', area.value); }); }
  }
  if (win.type === 'files') {
    content.innerHTML = `<div class="app-content"><div class="files-layout"><div class="file-list"><ul id="ul-${win.id}"></ul></div><div class="file-preview"><pre id="pre-${win.id}"></pre></div></div></div>`;
    const renderExplorer = () => {
      const ul = document.getElementById(`ul-${win.id}`); const pre = document.getElementById(`pre-${win.id}`); if (!ul || !pre) return; ul.innerHTML = '';
      Object.keys(sys_state.fs).forEach(path => {
        const li = document.createElement('li'); const btn = document.createElement('button'); btn.textContent = path; if (path === sys_state.selectedFile) btn.className = 'active';
        btn.addEventListener('click', () => { sys_state.selectedFile = path; renderExplorer(); }); li.appendChild(btn); ul.appendChild(li);
      });
      pre.textContent = sys_state.fs[sys_state.selectedFile] || '';
    };
    renderExplorer();
  }
  if (win.type === 'textbook') {
    content.innerHTML = `<div class="app-content" style="padding:0; height:100%;"><div class="files-layout" style="grid-template-columns: 210px 1fr; height:100%; gap:0;"><div class="file-list" style="border-radius:0; border:none; border-right:1px solid var(--panel-border); padding:12px; display:flex; flex-direction:column; gap:4px; overflow-y:auto;"><div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); margin-bottom:4px; letter-spacing:0.5px;">KATEGORIE</div><button class="subject-tab active" data-page="Ucebnice/Strana_1_Zakladni_Konverzace.txt">📄 Strana 1: Konverzace</button><button class="subject-tab" data-page="Ucebnice/Strana_2_Objednavani_Jidla.txt">📄 Strana 2: Jídlo</button><button class="subject-tab" data-page="Ucebnice/Strana_3_Napoje_A_Dezerty.txt">📄 Strana 3: Nápoje</button><button class="subject-tab" data-page="Ucebnice/Strana_4_Placeni_A_Ucet.txt">📄 Strana 4: Placení</button><button class="subject-tab" data-page="Ucebnice/Strana_5_Gastro_Jednotky.txt">📄 Strana 5: Jednotky</button><button class="subject-tab" data-page="Ucebnice/Strana_6_Reseni_Problemu.txt">📄 Strana 6: Reklamace</button><button class="subject-tab" data-page="Ucebnice/Strana_7_Fraze_Pro_Nakup.txt">📄 Strana 7: Nákupy</button><button class="subject-tab" data-page="Ucebnice/Strana_8_Gramatika_A_Casy.txt">📄 Strana 8: Gramatika</button></div><div class="textbook-view-zone" style="padding:16px; height:100%; overflow:hidden;"><p style="color:var(--text-muted);">Načítám knihovnu...</p></div></div></div>`;
  }
  if (win.type === 'games') {
    content.innerHTML = `<div class="app-content" style="padding:0; height:100%; background:#111522; overflow:hidden;"><iframe src="https://crazygames.com" style="width:100%; height:100%; border:none; background:#111522;" allow="autoplay; gamepad; fullscreen" sandbox="allow-scripts allow-same-origin allow-popups allow-pointer-lock"></iframe></div>`;
  }
  registerAndSpawn(node, win);
}

function buildDesktopIcons() {
  if (!desktopIcons) return; desktopIcons.innerHTML = '';
  [['Notepad', 'notepad', '✎'], ['Files', 'files', '📁'], ['Calculator', 'calculator', '🧮'], ['Učebnice', 'textbook', '📚'], ['Hry', 'games', '🎮']].forEach(([name, app, em]) => {
    const btn = document.createElement('button'); btn.className = 'desktop-icon';
    btn.innerHTML = `<div class="icon">${em}</div><div class="label">${name}</div>`;
    btn.addEventListener('click', () => requestPid(app)); desktopIcons.appendChild(btn);
  });
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initLogin); } else { initLogin(); }
