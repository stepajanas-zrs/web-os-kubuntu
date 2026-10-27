// ============================================================================
// MODUL: UČEBNICE, SLOVNÍČEK A TABULKY (ZCELA OSAMOSTATNĚNO A OPRAVENO)
// ============================================================================
window.initTextbookApp = function(winId, wrapperNode) {
  if (!wrapperNode) return;

  // 1. Datový registr pro Anglický slovníček
  const englishVocabulary = [
    { word: 'Water', trans: 'Voda', cat: 'Nápoje' },
    { word: 'Juice', trans: 'Džus / Šťáva', cat: 'Nápoje' },
    { word: 'Milk', trans: 'Mléko', cat: 'Nápoje' },
    { word: 'Tea', trans: 'Čaj', cat: 'Nápoje' },
    { word: 'Coffee', trans: 'Káva', cat: 'Nápoje' },
    { word: 'Fruit', trans: 'Ovoce', cat: 'Jídlo' },
    { word: 'Vegetables', trans: 'Zelenina', cat: 'Jídlo' },
    { word: 'Bread', trans: 'Chléb / Pečivo', cat: 'Jídlo' },
    { word: 'Meat', trans: 'Maso', cat: 'Jídlo' },
    { word: 'Dessert', trans: 'Dezert / Moučník', cat: 'Jídlo' },
    { word: 'Menu', trans: 'Jídelní lístek', cat: 'Konverzace' },
    { word: 'Bill, please', trans: 'Účet, prosím', cat: 'Konverzace' },
    { word: 'I would like...', trans: 'Dal bych si... / Chtěl bych...', cat: 'Konverzace' }
  ];

  // 2. Datový registr pro novou sekci Tabulky (Převody a užitečné jednotky)
  const usefulTables = [
    { unit: '1 ounce (oz)', metric: 'cca 28.3 g', note: 'Váha porcí / jídla' },
    { unit: '1 fluid ounce (fl oz)', metric: 'cca 30 ml', note: 'Objem nápojů' },
    { unit: '1 pint (pt)', metric: 'cca 473 ml (US) / 568 ml (UK)', note: 'Velké pivo / mléko' },
    { unit: '1 pound (lb)', metric: 'cca 454 g', note: 'Větší balení surovin' },
    { unit: 'Tip (Spropitné)', metric: '15% - 20%', note: 'Standardní výše v restauraci' },
    { unit: 'Tax (Daň)', metric: 'Není v ceně menu', note: 'Připočítává se až na účtu' }
  ];

  const viewZone = wrapperNode.querySelector('.textbook-view-zone');

  // Funkce pro vykreslení Slovníčku
  const renderVocabulary = (filterText = '') => {
    const cleanFilter = filterText.toLowerCase().trim();
    let html = `
      <div style="display:flex; flex-direction:column; gap:10px; height:100%;">
        <div style="display:flex; gap:10px; align-items:center; background:rgba(0,0,0,0.25); padding:8px; border-radius:8px;">
          <input type="text" class="vocab-search" placeholder="Vyhledat v angličtině nebo češtině..." value="${filterText}" style="flex:1; padding:8px 12px; background:rgba(0,0,0,0.4); border:1px solid var(--panel-border); border-radius:6px; color:#fff;">
        </div>
        <div style="flex:1; overflow-y:auto; background:rgba(0,0,0,0.15); border-radius:8px; border:1px solid var(--panel-border);">
          <table style="width:100%; border-collapse: collapse; text-align:left; font-size:0.88rem;">
            <thead>
              <tr style="background:rgba(255,255,255,0.04); border-bottom:1px solid var(--panel-border);">
                <th style="padding:10px 12px; color:var(--accent-primary);">Anglicky</th>
                <th style="padding:10px 12px; color:#fff;">Česky</th>
                <th style="padding:10px 12px; color:var(--text-muted);">Kategorie</th>
              </tr>
            </thead>
            <tbody>
    `;

    englishVocabulary.forEach(item => {
      if (cleanFilter && !item.word.toLowerCase().includes(cleanFilter) && !item.trans.toLowerCase().includes(cleanFilter)) return;
      html += `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
          <td style="padding:9px 12px; font-weight:600; color:#fff;">${item.word}</td>
          <td style="padding:9px 12px; color:var(--text-muted);">${item.trans}</td>
          <td style="padding:9px 12px;"><span style="font-size:0.75rem; background:rgba(59,130,246,0.15); color:#60a5fa; padding:2px 8px; border-radius:10px;">${item.cat}</span></td>
        </tr>`;
    });

    html += `</tbody></table></div></div>`;
    if (viewZone) viewZone.innerHTML = html;

    const searchInput = viewZone.querySelector('.vocab-search');
    if (searchInput) {
      searchInput.focus();
      searchInput.addEventListener('input', (e) => renderVocabulary(e.target.value));
    }
  };

  // Funkce pro vykreslení Tabulek
  const renderTablesView = () => {
    let html = `
      <div style="display:flex; flex-direction:column; gap:10px; height:100%;">
        <div style="font-weight:600; font-size:1rem; color:var(--accent-primary); margin-bottom:4px;">📊 Převodní tabulky a gastro jednotky</div>
        <div style="flex:1; overflow-y:auto; background:rgba(0,0,0,0.15); border-radius:8px; border:1px solid var(--panel-border);">
          <table style="width:100%; border-collapse: collapse; text-align:left; font-size:0.88rem;">
            <thead>
              <tr style="background:rgba(255,255,255,0.04); border-bottom:1px solid var(--panel-border);">
                <th style="padding:10px 12px; color:var(--accent-primary);">Označení / Jednotka</th>
                <th style="padding:10px 12px; color:#fff;">Metrický překlad</th>
                <th style="padding:10px 12px; color:var(--text-muted);">Využití v praxi</th>
              </tr>
            </thead>
            <tbody>
    `;

    usefulTables.forEach(item => {
      html += `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
          <td style="padding:10px 12px; font-weight:600; color:#fff;">${item.unit}</td>
          <td style="padding:10px 12px; color:#60a5fa; font-family:monospace; font-size:0.95rem;">${item.metric}</td>
          <td style="padding:10px 12px; color:var(--text-muted); font-size:0.82rem;">${item.note}</td>
        </tr>`;
    });

    html += `</tbody></table></div></div>`;
    if (viewZone) viewZone.innerHTML = html;
  };

  // OPRAVA: Globální delegovaný posluchač kliknutí na záložky (Předchází nefunkčnosti přepínání)
  wrapperNode.addEventListener('click', (e) => {
    const tab = e.target.closest('.subject-tab');
    if (!tab) return;

    wrapperNode.querySelectorAll('.subject-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const target = tab.getAttribute('data-subject');
    if (target === 'en_vocab') {
      renderVocabulary();
    } else if (target === 'useful_tables') {
      renderTablesView();
    }
  });

  // Výchozí zobrazení při otevření okna
  renderVocabulary();
};
