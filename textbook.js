// ============================================================================
// MODUL: INTELIGENTNÍ 8-STRÁNKOVÁ ČTEČKA UČEBNICE (ARM CORE ACCELERATED)
// ============================================================================
window.initTextbookApp = function(winId, wrapperNode) {
  if (!wrapperNode) return;

  const viewZone = wrapperNode.querySelector('.textbook-view-zone');
  const subjectTabs = wrapperNode.querySelectorAll('.subject-tab');

  // Funkce pro bezpečné vykreslení konkrétní stránky ze systémového FS registru
  const displayPage = (pageKey, searchWord = '') => {
    // Načtení dat z centrálního state systému
    let pageContent = sys_state.fs[pageKey] || 'Obsah stránky nebyl nalezen v registru.';
    const cleanWord = searchWord.toLowerCase().trim();

    // Pokud uživatel vyhledává, zvýrazníme text nebo zfiltrujeme řádky
    if (cleanWord) {
      const lines = pageContent.split('\n');
      const filteredLines = lines.filter(line => line.toLowerCase().includes(cleanWord) || line.startsWith('==='));
      pageContent = filteredLines.join('\n');
      if (filteredLines.length <= 1) pageContent += '\n\n(V této kapitole nebyly nalezeny žádné shody)';
    }

    viewZone.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; height:100%;">
        <!-- Vyhledávací lišta integrovaná nad každou stranu -->
        <div style="display:flex; background:rgba(0,0,0,0.25); padding:6px 10px; border-radius:8px; border:1px solid var(--panel-border);">
          <input type="text" class="page-text-search" placeholder="🔍 Vyhledat slovo nebo překlad na této stránce..." value="${searchWord}" style="flex:1; padding:6px 10px; background:rgba(0,0,0,0.3); border:none; color:#fff; font-size:0.85rem;">
        </div>
        <!-- Plocha textu A4 -->
        <div style="flex:1; overflow-y:auto; background:rgba(7, 12, 20, 0.4); border:1px solid var(--panel-border); border-radius:10px; padding:16px; line-height:1.6; font-size:0.9rem; color:var(--text-main);">
          <pre style="white-space:pre-wrap; font-family:inherit; color:#e2e8f0;">${pageContent}</pre>
        </div>
      </div>
    `;

    // Navázání okamžitého reaktivního vyhledávání bez lagování procesoru
    const input = viewZone.querySelector('.page-text-search');
    if (input) {
      input.focus();
      input.setSelectionRange(searchWord.length, searchWord.length);
      input.addEventListener('input', (e) => {
        displayPage(pageKey, e.target.value);
      });
    }
  };

  // Delegování události na klikání v menu stran
  wrapperNode.addEventListener('click', (event) => {
    const tab = event.target.closest('.subject-tab');
    if (!tab) return;

    wrapperNode.querySelectorAll('.subject-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const pageTarget = tab.getAttribute('data-page');
    displayPage(pageTarget);
  });

  // Výchozí akce: Po spuštění aplikace automaticky otevřeme Stranu 1
  displayPage('Ucebnice/Strana_1_Zakladni_Konverzace.txt');
};
