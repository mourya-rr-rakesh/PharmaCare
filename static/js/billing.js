(() => {
  const $ = id => document.getElementById(id);
  const chatArea = $('chatArea');
  const chatInput = $('chatInput');
  const chatSend = $('chatSend');
  const medListEl = $('medList');
  const quickMed = $('quickMed');
  const quickQty = $('quickQty');
  const quickAddBtn = $('quickAddBtn');
  const quickSuggestions = $('quickSuggestions');
  const quickMrp = $('quickMrp');
  const cartListEl = $('cartList');
  const cartTotalEl = $('cartTotal');
  const invoicePreview = $('invoicePreview');
  const printBtn = $('printBtn');
  const createInvoiceBtn = $('createInvoiceBtn');
  const adminControls = $('adminControls');
  const markupInput = $('markupInput');
  const setMarkupBtn = $('setMarkupBtn');
  const currentMarkupEl = $('currentMarkup');

  let medicines = [];
  let cart = [];
  let markup = 0;
  let userRole = 'user';
  let profileUser = null;

  function addChat(message, who = 'bot') {
    if (!chatArea) return;
    const div = document.createElement('div');
    div.className = `chat-bubble ${who === 'user' ? 'user' : ''}`;
    div.textContent = message;
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function formatMoney(v) { return `₹${Number(v || 0).toFixed(2)}`; }

  async function fetchProfile() {
    try {
      const res = await fetch('/profile', { credentials: 'include' });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user || null;
    } catch (e) {
      console.error('Profile fetch failed', e);
      return null;
    }
  }

  async function loadMarkup() {
    try {
      const res = await fetch('/billing/markup', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      markup = Number(data.markup) || 0;
      if (currentMarkupEl) currentMarkupEl.textContent = markup;
      if (markupInput) markupInput.value = markup;
    } catch (e) { console.error('Failed loading markup', e); }
  }

  async function loadMedicines() {
    try {
      const res = await fetch('/billing/medicines', { credentials: 'include' });
      if (!res.ok) { addChat('Failed to load medicines.'); return; }
      const data = await res.json();
      medicines = data.medicines || [];
      renderMedList();
      setupQuickAdd();
    } catch (e) { console.error(e); addChat('Error loading medicines.'); }
  }

  // --- Quick-add / autocomplete helpers ---
  let selectedQuickMed = null;

  function clearSuggestions() {
    if (!quickSuggestions) return;
    quickSuggestions.innerHTML = '';
    quickSuggestions.classList.add('hidden');
  }

  function populateSuggestions(list) {
    if (!quickSuggestions) return;
    quickSuggestions.innerHTML = '';
    if (!list || list.length === 0) { quickSuggestions.classList.add('hidden'); return; }
    list.forEach(m => {
      const li = document.createElement('li');
      li.className = 'p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer';
      li.textContent = `${m.name} — ${formatMoney(m.mrp)}`;
      li.addEventListener('click', () => selectSuggestion(m));
      quickSuggestions.appendChild(li);
    });
    quickSuggestions.classList.remove('hidden');
  }

  function selectSuggestion(m) {
    if (!quickMed || !quickMrp) return;
    selectedQuickMed = m;
    quickMed.value = m.name;
    quickMrp.textContent = formatMoney(m.mrp);
    quickSuggestions.classList.add('hidden');
    quickQty.focus();
  }

  function setupQuickAdd() {
    if (!quickMed) return;
    quickMed.addEventListener('input', (e) => {
      const v = (e.target.value || '').toLowerCase().trim();
      selectedQuickMed = null;
      quickMrp.textContent = formatMoney(0);
      if (!v) { clearSuggestions(); return; }
      const matches = medicines.filter(m => (m.name || '').toLowerCase().includes(v)).slice(0, 10);
      populateSuggestions(matches);
    });

    // handle enter to add first matching or exact
    quickMed.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        // if suggestion was selected use it, else try to pick best match
        let m = selectedQuickMed;
        if (!m) {
          const v = (quickMed.value || '').toLowerCase().trim();
          m = medicines.find(x => (x.name || '').toLowerCase() === v) || medicines.find(x => (x.name || '').toLowerCase().includes(v));
        }
        const qty = Number(quickQty.value) || 1;
        if (m) { addToCart(m._id, m.name, m.mrp); quickQty.value = 1; quickMed.value = ''; quickMrp.textContent = formatMoney(0); clearSuggestions(); }
      }
    });

    if (quickAddBtn) quickAddBtn.addEventListener('click', () => {
      let m = selectedQuickMed;
      if (!m) {
        const v = (quickMed.value || '').toLowerCase().trim();
        m = medicines.find(x => (x.name || '').toLowerCase() === v) || medicines.find(x => (x.name || '').toLowerCase().includes(v));
      }
      const qty = Number(quickQty.value) || 1;
      if (!m) { alert('Medicine not found'); return; }
      for (let i=0;i<qty;i++) addToCart(m._id, m.name, m.mrp);
      quickQty.value = 1; quickMed.value = ''; quickMrp.textContent = formatMoney(0); clearSuggestions();
    });

    // click outside to close suggestions
    document.addEventListener('click', (ev) => {
      if (!quickSuggestions) return;
      const target = ev.target;
      if (target === quickMed || quickSuggestions.contains(target)) return;
      clearSuggestions();
    });
  }

  function renderMedList() {
    if (!medListEl) return;
    medListEl.innerHTML = '';
    medicines.forEach(m => {
      const row = document.createElement('div');
      row.className = 'p-2 border rounded';

      const top = document.createElement('div');
      top.className = 'flex justify-between items-start';

      const left = document.createElement('div');
      left.innerHTML = `<div class="font-medium">${m.name}</div><div class="text-sm text-gray-500">${m.type || ''}</div>`;

      const right = document.createElement('div');
      right.className = 'flex items-center gap-2';

      const priceDiv = document.createElement('div');
      priceDiv.className = 'text-sm text-gray-700 dark:text-gray-200';
      priceDiv.textContent = formatMoney(m.mrp);

      const pctInput = document.createElement('input');
      pctInput.type = 'number';
      pctInput.min = '0';
      pctInput.step = '0.1';
      pctInput.placeholder = '+%';
      pctInput.value = '0';
      pctInput.className = 'w-20 p-1 rounded border text-sm';

      const addBtn = document.createElement('button');
      addBtn.className = 'px-3 py-1 bg-green-500 text-white rounded';
      addBtn.textContent = 'Add';
      addBtn.addEventListener('click', () => {
        const perPct = Number(pctInput.value) || 0;
        addToCart(m._id, m.name, m.mrp, perPct, 1);
      });

      right.appendChild(priceDiv);
      right.appendChild(pctInput);
      right.appendChild(addBtn);

      top.appendChild(left);
      top.appendChild(right);

      row.appendChild(top);
      medListEl.appendChild(row);
    });
  }

  function addToCart(id, name, mrp, perItemMarkup = 0, qty = 1) {
    const existing = cart.find(c => c.medicineId === id && Number(c.perItemMarkup || 0) === Number(perItemMarkup));
    if (existing) { existing.qty += qty; }
    else cart.push({ medicineId: id, name, baseMrp: Number(mrp), qty: qty, perItemMarkup: Number(perItemMarkup || 0) });
    renderCart();
    addChat(`Added ${name} x${qty} to cart`, 'user');
  }

  function renderCart() {
    if (!cartListEl || !cartTotalEl) return;
    cartListEl.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
      const perPct = Number(item.perItemMarkup || 0);
      const adjusted = item.baseMrp * (1 + (markup + perPct) / 100);
      const line = adjusted * item.qty;
      total += line;
      const row = document.createElement('div');
      row.className = 'flex justify-between items-center';
      row.innerHTML = `<div>${item.name} <small class="text-gray-500">(${item.qty})</small></div><div>${formatMoney(line)}</div>`;
      cartListEl.appendChild(row);
    });
    cartTotalEl.textContent = formatMoney(total);
    renderInvoicePreview();
  }

  function renderInvoicePreview() {
    if (!invoicePreview) return;
    invoicePreview.innerHTML = '';
    if (cart.length === 0) { invoicePreview.textContent = 'Cart is empty'; return; }

    // Organization header
    if (profileUser && profileUser.org) {
      const org = document.createElement('div');
      org.className = 'text-center text-green-700 dark:text-green-400 text-xl font-bold mb-2';
      org.textContent = profileUser.org;
      invoicePreview.appendChild(org);
    }

    // Logo
    const logo = document.createElement('img');
    logo.src = '/logo.png';
    logo.className = 'mx-auto mb-2';
    logo.style.maxWidth = '100px';
    invoicePreview.appendChild(logo);

    const table = document.createElement('div');
    table.className = 'space-y-1';

    let totalWithMarkup = 0;
    let totalBaseMrp = 0;
    let totalItems = 0;

    cart.forEach(item => {
      const perPct = Number(item.perItemMarkup || 0);
      const totalMarkup = (markup || 0) + perPct;
      const adjusted = item.baseMrp * (1 + totalMarkup / 100);
      const lineWithMarkup = adjusted * item.qty;
      const lineBase = item.baseMrp * item.qty;
      totalWithMarkup += lineWithMarkup;
      totalBaseMrp += lineBase;
      totalItems += item.qty;

      const nameLine = document.createElement('div');
      nameLine.textContent = `${item.name} x ${item.qty}`;
      nameLine.className = 'font-medium';
      const priceLine = document.createElement('div');
      priceLine.textContent = formatMoney(item.baseMrp);
      priceLine.className = 'text-right';
      table.appendChild(nameLine);
      table.appendChild(priceLine);
    });

    invoicePreview.appendChild(table);

    // Totals: label then value lines
    const totalsDiv = document.createElement('div');
    totalsDiv.className = 'mt-3';

    const itemsLabel = document.createElement('div');
    itemsLabel.textContent = 'Items';
    const itemsValue = document.createElement('div');
    itemsValue.textContent = totalItems;
    itemsValue.className = 'font-semibold';

    const totalLabel = document.createElement('div');
    totalLabel.textContent = 'Total (MRP)';
    const totalValue = document.createElement('div');
    totalValue.textContent = formatMoney(totalBaseMrp);
    totalValue.className = 'font-semibold';

    const markupLabel = document.createElement('div');
    markupLabel.textContent = 'Total (with markup)';
    const markupValue = document.createElement('div');
    markupValue.textContent = formatMoney(totalWithMarkup);
    markupValue.className = 'font-semibold';

    totalsDiv.appendChild(itemsLabel);
    totalsDiv.appendChild(itemsValue);
    totalsDiv.appendChild(totalLabel);
    totalsDiv.appendChild(totalValue);
    totalsDiv.appendChild(markupLabel);
    totalsDiv.appendChild(markupValue);

    invoicePreview.appendChild(totalsDiv);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'text-center mt-4 text-gray-600 dark:text-gray-400';
    footer.textContent = 'Thank you for your business!';
    invoicePreview.appendChild(footer);
  }

  async function createInvoice() {
    if (cart.length === 0) { alert('Cart empty'); return; }
    // include per-item markup in the payload so server can compute adjusted prices
    const items = cart.map(c => ({ medicineId: c.medicineId, qty: c.qty, perItemMarkup: Number(c.perItemMarkup || 0) }));
    const customerName = prompt('Customer name (optional):', '');
    try {
      const res = await fetch('/billing/invoice', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customerName })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Failed to create invoice: ' + (err.error || res.statusText));
        return;
      }
      const data = await res.json();
      addChat('Invoice created successfully. Invoice ID: ' + (data.invoice && data.invoice._id), 'bot');
      // Show printable invoice
      showPrintableInvoice(data.invoice || null);
      cart = [];
      renderCart();
    } catch (e) { console.error(e); alert('Error creating invoice'); }
  }

  function showPrintableInvoice(inv) {
    if (!inv) return;
    const div = document.createElement('div');

    // Org name centered
    if (profileUser && profileUser.org) {
      const orgDiv = document.createElement('div');
      orgDiv.className = 'text-center text-green-700 dark:text-green-400 text-xl font-bold mb-2';
      orgDiv.textContent = profileUser.org;
      div.appendChild(orgDiv);
    }

    // Logo
    const logo = document.createElement('img');
    logo.src = '/logo.png';
    logo.className = 'mx-auto mb-2';
    logo.style.maxWidth = '100px';
    div.appendChild(logo);

    const header = document.createElement('div');
    header.innerHTML = `<div>Invoice: ${inv._id}</div><div>Customer: ${inv.customerName || '—'}</div><div>Markup: ${inv.markup}%</div><hr/>`;
    div.appendChild(header);

    let totalWithMarkup = 0;
    let totalBaseMrp = 0;
    let totalItems = 0;

    (inv.items || []).forEach(it => {
      const perBase = it.base != null ? it.base : (it.adjusted != null ? it.adjusted : 0);
      totalWithMarkup += it.lineTotal || 0;
      totalBaseMrp += perBase * (it.qty || 0);
      totalItems += it.qty || 0;

      const nameLine = document.createElement('div');
      nameLine.textContent = `${it.name} x ${it.qty}`;
      nameLine.className = 'font-medium';
      const priceLine = document.createElement('div');
      priceLine.textContent = formatMoney(perBase);
      priceLine.className = 'text-right';
      div.appendChild(nameLine);
      div.appendChild(priceLine);
    });

    const totalsWrap = document.createElement('div');
    totalsWrap.className = 'mt-2';

    const itemsLabel = document.createElement('div');
    itemsLabel.textContent = 'Items';
    const itemsValue = document.createElement('div');
    itemsValue.textContent = totalItems;
    itemsValue.className = 'font-semibold';

    const totalLabel = document.createElement('div');
    totalLabel.textContent = 'Total (MRP)';
    const totalValue = document.createElement('div');
    totalValue.textContent = formatMoney(totalBaseMrp);
    totalValue.className = 'font-semibold';

    const markupLabel = document.createElement('div');
    markupLabel.textContent = 'Total (with markup)';
    const markupValue = document.createElement('div');
    markupValue.textContent = formatMoney(totalWithMarkup);
    markupValue.className = 'font-semibold';

    totalsWrap.appendChild(itemsLabel);
    totalsWrap.appendChild(itemsValue);
    totalsWrap.appendChild(totalLabel);
    totalsWrap.appendChild(totalValue);
    totalsWrap.appendChild(markupLabel);
    totalsWrap.appendChild(markupValue);

    div.appendChild(totalsWrap);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'text-center mt-4 text-gray-600 dark:text-gray-400';
    footer.textContent = 'Thank you for your business!';
    div.appendChild(footer);

    invoicePreview.innerHTML = '';
    invoicePreview.appendChild(div);
  }

  function printInvoice() {
    if (!invoicePreview) return;
    const content = invoicePreview.innerHTML;
    const win = window.open('', '_blank');
    // Minimal print HTML with basic styles so layout matches
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Invoice</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:20px;} .text-center{ text-align:center;} .font-medium{font-weight:500;} .font-semibold{font-weight:600;} .text-right{text-align:right;}</style></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  }

  async function setMarkup() {
    const val = Number(markupInput.value);
    if (Number.isNaN(val) || val < 0) { alert('Invalid markup'); return; }
    try {
      const res = await fetch('/billing/markup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markup: val })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Failed to set markup: ' + (err.error || res.statusText));
        return;
      }
      const data = await res.json();
      markup = Number(data.markup) || markup;
      if (currentMarkupEl) currentMarkupEl.textContent = markup;
      addChat(`Runtime markup set to ${markup}%`, 'bot');
      renderCart();
    } catch (e) { console.error(e); alert('Error setting markup'); }
  }

  function handleChatMessage(text) {
    if (!text) return;
    addChat(text, 'user');
    const t = text.toLowerCase();
    // Simple intents: "price of <name>", "add <name> <qty>"
    const priceMatch = t.match(/price of (.+)/i);
    const addMatch = t.match(/add (.+?)(?: (\d+))?$/i);

    if (priceMatch) {
      const name = priceMatch[1].trim();
      const found = medicines.find(m => (m.name || '').toLowerCase().includes(name));
      if (found) {
        const adjusted = (Number(found.mrp) || 0) * (1 + markup / 100);
        addChat(`${found.name} - MRP ${formatMoney(found.mrp)}, Price with markup ${formatMoney(adjusted)}`);
      } else addChat('Medicine not found');
      return;
    }

    if (addMatch) {
      const name = addMatch[1].trim();
      const qty = Number(addMatch[2]) || 1;
      const found = medicines.find(m => (m.name || '').toLowerCase().includes(name));
      if (found) {
        for (let i=0;i<qty;i++) addToCart(found._id, found.name, found.mrp);
        addChat(`Added ${found.name} x${qty} to cart`);
      } else addChat('Medicine not found');
      return;
    }

    // fallback: search by name
    const found = medicines.find(m => (m.name || '').toLowerCase().includes(t));
    if (found) {
      const adjusted = (Number(found.mrp) || 0) * (1 + markup / 100);
      addChat(`${found.name} - MRP ${formatMoney(found.mrp)}, Price with markup ${formatMoney(adjusted)}`);
      return;
    }

    addChat('Sorry, I did not understand. Try "price of Paracetamol" or "add Paracetamol 2"');
  }

  if (chatSend) chatSend.addEventListener('click', () => {
    const v = chatInput.value.trim();
    handleChatMessage(v);
    chatInput.value = '';
  });

  if (chatInput) chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { if (chatSend) chatSend.click(); }
  });

  if (printBtn) printBtn.addEventListener('click', printInvoice);
  if (createInvoiceBtn) createInvoiceBtn.addEventListener('click', createInvoice);
  if (setMarkupBtn) setMarkupBtn.addEventListener('click', setMarkup);

  // init
  document.addEventListener('DOMContentLoaded', async () => {
    const profile = await fetchProfile();
    profileUser = profile;
    if (profile && profile.role === 'admin') {
      if (adminControls) adminControls.classList.remove('hidden');
      userRole = 'admin';
    }
    await loadMarkup();
    await loadMedicines();
  });
})();
