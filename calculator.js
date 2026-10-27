// ============================================================================
// SUBSYSTÉM VĚDECKO-FYZIKÁLNÍ KALKULAČKY (ISOLATED COMPONENT - OPRAVENO)
// ============================================================================
window.initScientificCalculator = function(winId, wrapperNode) {
  const scr = document.getElementById(`sc-${winId}`);
  let buffer = '';

  if (!wrapperNode || !scr) return;

  // Izolované zachycení kliknutí výhradně uvnitř okna kalkulačky
  wrapperNode.addEventListener('click', (e) => {
    const btn = e.target.closest('.calc-key');
    if (!btn) return;

    const v = btn.getAttribute('data-v');
    const sci = btn.getAttribute('data-sci');

    if (v) {
      if (v === 'C') {
        buffer = '';
      } else if (v === 'DEL') {
        buffer = buffer.slice(0, -1);
      } else if (v === '=') {
        try {
          // Vyhodnocení matematického řetězce z displeje
          buffer = String(Function(`"use strict"; return (${buffer || '0'})`)());
        } catch {
          buffer = 'Error';
        }
      } else {
        if (buffer === '0' && v !== '.') buffer = v;
        else buffer += v;
      }
    } else if (sci) {
      try {
        let cur = parseFloat(buffer) || 0;
        if (sci === 'sqrt') buffer = String(Math.sqrt(cur));
        if (sci === 'sq2') buffer = String(Math.pow(cur, 2));
        if (sci === 'sq3') buffer = String(Math.pow(cur, 3));
        if (sci === 'log') buffer = String(Math.log10(cur));
        if (sci === 'ln') buffer = String(Math.log(cur));
        if (sci === 'sin') buffer = String(Math.sin(cur * Math.PI / 180)); // Úhly ve stupních
        if (sci === 'cos') buffer = String(Math.cos(cur * Math.PI / 180)); // OPRAVA: změněno ze stroke na buffer
        if (sci === 'tan') buffer = String(Math.tan(cur * Math.PI / 180));
      } catch {
        buffer = 'Error';
      }
    }

    // Okamžitý zápis na displej konkrétního okna
    scr.textContent = buffer || '0';
  });
};
