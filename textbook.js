// ============================================================================
// SUBSYSTÉM APLIKACE UČEBNICE A INTERAKTIVNÍHO SLOVNÍČKU
// ============================================================================
window.initTextbookApp = function(winId, wrapperNode) {
  if (!wrapperNode) return;

  // Datový registr slovníčku načtený přímo z přiloženého souboru
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

  const subjectTabs = wrapperNode.querySelectorAll('.subject-tab');
  const viewZone = wrapperNode.querySelector('.textbook-view-zone');

  // Funkce pro vygenerování tabulky slovníčku s filtrem
  const renderVocabularyTable = (filterText = '') => {
    const cleanFilter = filterText.toLowerCase().trim();
    let html = `
      <div style="display:flex; flex-direction:column; gap:10px; height:100%;">
        <div style="display:flex; gap:10px; align-items:center; background:rgba(0,0,0,0.2); padding:8px; border-radius:6px;">
          <input type="text" class="vocab-search" placeholder="Vyhledat slovíčko nebo překlad..." value="${filterText}" style="flex:1; padding:6px 10px; background:rgba(0,0,0,0.4); border:1px solid var(--panel-border); border-radius:6px; color:#fff;">
          <span style="font-size:0.75rem; color:var(--text-muted)">Celkem: ${englishVocabulary.length}</span>
        </div>
        <div style="flex:1; overflow-y:auto; background:rgba(0,0,0,0.15); border-radius:8px; border:1px solid var(--panel-border);">
          <table style="width:100%; border-collapse: collapse; text-align:left; font-size:0.88rem;">
            <thead>
              <tr style="background:rgba(255,255,255,0.04); border-bottom:1px solid var(--panel-border);">
                <th style="padding:10px 12px; color:var(--accent-primary);">Anglicky</th>
                <th style="padding:10px 12px; color:var(--text-main);">Česky</th>
                <th style="padding:10px 12px; color:var(--text-muted);">Kategorie</th>
              </tr>
            </thead>
            <tbody>
    `;

    englishVocabulary.forEach(item => {
      if (cleanFilter && !item.word.toLowerCase().includes(cleanFilter) && !item.trans.toLowerCase().includes(cleanFilter)) {
        return; // Přeskočit slovíčka neodpovídající filtru
      }
      html += `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.03); transition:background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
          <td style="padding:8px 12px; font-weight:600; color:#fff;">${item.word}</td>
          <td style="padding:8px 12px; color:var(--text-muted);">${item.trans}</td>
          <td style="padding:8px 12px;"><span style="font-size:0.75rem; background:rgba(59,130,246,0.15); color:#60a5fa; padding:2px 8px; border-radius:10px;">${item.cat}</span></td>
        </tr>
      `;
    });

    html += `</tbody></table></div></div>`;
    if (viewZone) viewZone.innerHTML = html;

    // Navázání vyhledávacího inputu
    const searchInput = viewZone.querySelector('.vocab-search');
    if (searchInput) {
      searchInput.focus();
      searchInput.addEventListener('input', (e) => {
        renderVocabularyTable(e.target.value);
      });
    }
  };

  // Přepínání předmětů v postranním panelu učebnice
  subjectTabs.forEach(tab => {
    btn = tab.closest('button') || tab;
    btn.addEventListener('click', () => {
      subjectTabs.forEach(t => (t.closest('button') || t).classList.remove('active'));
      btn.classList.add('active');

      const targetSubject = btn.dataset.subject;
      if (targetSubject === 'en_vocab') {
        renderVocabularyTable();
      } else if (targetSubject === 'math') {
        if (viewZone) viewZone.innerHTML = `<h3>Matematika</h3><p style="color:var(--text-muted); margin-top:10px;">Modul učebnice matematiky je připraven k nahrání vzorců.</p>`;
      } else {
        if (viewZone) viewZone.innerHTML = `<h3>Přehled učebnic</h3><p style="color:var(--text-muted); margin-top:10px;">Zvolte předmět z levého menu pro zobrazení studijních materiálů.</p>`;
      }
    });
  });

  // Výchozí zobrazení po načtení - rovnou otevřeme anglický slovníček
  const defaultTab = wrapperNode.querySelector('[data-subject="en_vocab"]');
  if (defaultTab) defaultTab.click();
};
