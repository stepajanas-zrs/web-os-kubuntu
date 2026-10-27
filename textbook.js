// ============================================================================
// EXTENDED TEXTBOOK & VOCABULARY ENGINE (CORE BUS STORAGE)
// ============================================================================
window.initTextbookApp = function(winId, wrapperNode) {
  if (!wrapperNode) return;

  // Kompletní datový registr (odpovídající celému rozsahu vašich stran A4)
  const masterDatabase = [
    // --- SEKCIE: RESTAURACE & KONVERZACE ---
    { word: 'Menu / Wine list', trans: 'Jídelní lístek / Vinný lístek', cat: 'Restaurace' },
    { word: 'Bill, please / Check, please', trans: 'Účet, prosím', cat: 'Restaurace' },
    { word: 'I would like to order...', trans: 'Chtěl(a) bych si objednat...', cat: 'Restaurace' },
    { word: 'Is this table free?', trans: 'Je tento stůl volný?', cat: 'Restaurace' },
    { word: 'Enjoy your meal!', trans: 'Dobrou chuť!', cat: 'Restaurace' },
    { word: 'Keep the change', trans: 'Drobné si nechte (Spropitné)', cat: 'Restaurace' },
    { word: 'Are you ready to order?', trans: 'Máte vybráno? / Jste připraveni objednat?', cat: 'Restaurace' },
    { word: 'Excuse me, waiter!', trans: 'Promiňte, pane číšníku!', cat: 'Restaurace' },
    { word: 'Can I pay by card?', trans: 'Mohu platit kartou?', cat: 'Restaurace' },
    { word: 'In cash, please', trans: 'Hotově, prosím', cat: 'Restaurace' },

    // --- SEKCIE: JÍDLO (FOOD) ---
    { word: 'Fruit / Vegetables', trans: 'Ovoce / Zelenina', cat: 'Jídlo' },
    { word: 'Bread / Roll', trans: 'Chléb / Rohlík (Pečivo)', cat: 'Jídlo' },
    { word: 'Meat / Poultry / Fish', trans: 'Maso / Drůbež / Ryby', cat: 'Jídlo' },
    { word: 'Dessert / Cake / Ice cream', trans: 'Dezert / Dort / Zmrzlina', cat: 'Jídlo' },
    { word: 'Soup of the day', trans: 'Polévka dne', cat: 'Jídlo' },
    { word: 'Main course / Appetizer', trans: 'Hlavní chod / Předkrm', cat: 'Jídlo' },
    { word: 'Side dish / Rice / Potatoes', trans: 'Příloha / Rýže / Brambory', cat: 'Jídlo' },
    { word: 'Cheese / Butter / Egg', trans: 'Sýr / Máslo / Vejce', cat: 'Jídlo' },
    { word: 'Sugar / Salt / Pepper', trans: 'Cukr / Sůl / Pepř', cat: 'Jídlo' },

    // --- SEKCIE: NÁPOJE (DRINKS) ---
    { word: 'Still water / Sparkling water', trans: 'Neperlivá voda / Perlivá voda', cat: 'Nápoje' },
    { word: 'Juice (Orange, Apple)', trans: 'Džus (Pomerančový, Jablečný)', cat: 'Nápoje' },
    { word: 'Milk / Milkshake', trans: 'Mléko / Mléčný koktejl', cat: 'Nápoje' },
    { word: 'Tea (Black, Green, Herbal)', trans: 'Čaj (Černý, Zelený, Bylinkový)', cat: 'Nápoje' },
    { word: 'Coffee (Espresso, Latte)', trans: 'Káva (Espresso, Latté)', cat: 'Nápoje' },
    { word: 'Beer / Wine (Red, White)', trans: 'Pivo / Víno (Červené, Bílé)', cat: 'Nápoje' },
    { word: 'Soft drink / Soda', trans: 'Nealkoholický nápoj / Sodovka', cat: 'Nápoje' },

    // --- SEKCIE: PŘEVODNÍ TABULKY & UKAZATELE ---
    { word: '1 ounce (oz)', trans: 'cca 28.3 gramů (váhová jednotka porcí)', cat: 'Tabulky' },
    { word: '1 fluid ounce (fl oz)', trans: 'cca 30 mililitrů (objemová jednotka)', cat: 'Tabulky' },
    { word: '1 pint (pt)', trans: 'cca 0.5 litru (473 ml US / 568 ml UK)', cat: 'Tabulky' },
    { word: '1 pound (lb)', trans: 'cca 454 gramů (0.45 kg)', cat: 'Tabulky' },
    { word: 'Service charge / Tip', trans: 'Spropitné (standardně 15 % - 20 %)', cat: 'Tabulky' },
    { word: 'VAT / Tax', trans: 'Daň z přidané hodnoty (DPH)', cat: 'Tabulky' }
  ];

  const viewZone = wrapperNode.querySelector('.textbook-view-zone');

  // Master renderovací jádro (Generuje tabulky dynamicky z registru)
  const drawModuleContent = (category, searchFilter = '') => {
    const filter = searchFilter.toLowerCase().trim();
    
    let html = `
      <div style="display:flex; flex-direction:column; gap:12px; height:100%;">
        <div style="display:flex; gap:10px; align-items:center; background:rgba(0,0,0,0.2); padding:10px; border-radius:10px;">
          <input type="text" class="tx-search" placeholder="Hledat v této kapitole..." value="${searchFilter}" style="flex:1; padding:8px 14px; background:rgba(0,0,0,0.4); border:1px solid var(--panel-border); border-radius:8px; color:#fff;">
        </div>
        <div style="flex:1; overflow-y:auto; background:rgba(0,0,0,0.15); border-radius:12px; border:1px solid var(--panel-border);">
          <table style="width:100%; border-collapse: collapse; text-align:left; font-size:0.88rem;">
            <thead>
              <tr style="background:rgba(255,255,255,0.04); border-bottom:1px solid var(--panel-border);">
                <th style="padding:12px; color:var(--accent-primary); width:45%;">Anglický výraz</th>
                <th style="padding:12px; color:#fff; width:55%;">Český překlad / Význam</th>
              </tr>
            </thead>
            <tbody>
    `;

    masterDatabase.forEach(item => {
      // Filtrování podle aktivní záložky v menu
      if (category !== 'all' && item.cat !== category) return;
      // Filtrování podle textového vyhledávání
      if (filter && !item.word.toLowerCase().includes(filter) && !item.trans.toLowerCase().includes(filter)) return;

      html += `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.03); transition: background 0.1s;">
          <td style="padding:10px 12px; font-weight:600; color:#fff;">${item.word}</td>
          <td style="padding:10px 12px; color:var(--text-muted);">${item.trans}</td>
        </tr>`;
    });

    html += `</tbody></table></div></div>`;
    if (viewZone) viewZone.innerHTML = html;

    // Automatický focus vyhledávače pro okamžité psaní
    const input = viewZone.querySelector('.tx-search');
    if (input) {
      input.focus();
      input.setSelectionRange(searchFilter.length, searchFilter.length);
      input.addEventListener('input', (e) => drawModuleContent(category, e.target.value));
    }
  };

  // Navázání interakce na postranní panel předmětů
  wrapperNode.addEventListener('click', (event) => {
    const tab = event.target.closest('.subject-tab');
    if (!tab) return;

    wrapperNode.querySelectorAll('.subject-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const targetCategory = tab.getAttribute('data-subject');
    if (targetCategory === 'en_vocab') drawModuleContent('Restaurace');
    else if (targetCategory === 'useful_tables') drawModuleContent('Tabulky');
  });

  // První spuštění - zobrazí kapitolu Restaurace
  drawModuleContent('Restaurace');
};
