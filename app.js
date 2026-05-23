document.addEventListener('DOMContentLoaded', () => {

  const inputs = {
    companyName: document.getElementById('input-company-name'),
    companyAddress: document.getElementById('input-company-address'),
    clientName: document.getElementById('input-client-name'),
    clientAddress: document.getElementById('input-client-address'),
    invoiceNo: document.getElementById('input-invoice-no'),
    invoiceDate: document.getElementById('input-invoice-date'),
    currency: document.getElementById('input-currency'),
    status: document.getElementById('input-status'),
    discountVal: document.getElementById('input-discount-val'),
    discountType: document.getElementById('input-discount-type'),
    notes: document.getElementById('input-notes')
  };

  const preview = {
    companyName: document.getElementById('preview-company-name'),
    companyAddress: document.getElementById('preview-company-address'),
    clientName: document.getElementById('preview-client-name'),
    clientAddress: document.getElementById('preview-client-address'),
    invoiceNo: document.getElementById('preview-invoice-no'),
    invoiceDate: document.getElementById('preview-invoice-date'),
    statusBadge: document.getElementById('preview-status'),
    notes: document.getElementById('preview-notes'),
    subtotal: document.getElementById('preview-subtotal'),
    discountRow: document.getElementById('preview-discount-row'),
    discount: document.getElementById('preview-discount'),
    total: document.getElementById('preview-total'),
    tbody: document.getElementById('preview-items-tbody')
  };

  const editorItemsContainer = document.getElementById('editor-items');
  const addItemBtn = document.getElementById('add-item-btn');
  const printBtn = document.getElementById('print-btn');

  inputs.invoiceDate.valueAsDate = new Date();

  let items = [
    { id: generateId(), desc: 'Web Design Services', qty: 1, price: 1500 },
    { id: generateId(), desc: 'Hosting Setup', qty: 1, price: 250 }
  ];

  function generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  function formatCurrency(num) {
    const symbol = inputs.currency ? inputs.currency.value : '$';
    return symbol + parseFloat(num).toFixed(2);
  }

  function syncField(inputEl, previewEl) {
    const update = () => {
      previewEl.textContent = inputEl.value;
    };
    inputEl.addEventListener('input', update);
    update(); // Initial sync
  }

  syncField(inputs.companyName, preview.companyName);
  syncField(inputs.companyAddress, preview.companyAddress);
  syncField(inputs.clientName, preview.clientName);
  syncField(inputs.clientAddress, preview.clientAddress);
  syncField(inputs.invoiceNo, preview.invoiceNo);
  syncField(inputs.invoiceDate, preview.invoiceDate);
  syncField(inputs.notes, preview.notes);

  function syncStatus() {
    const val = inputs.status.value;
    preview.statusBadge.textContent = val;
    if (val === 'paid') {
      preview.statusBadge.className = 'status-badge status-paid';
    } else {
      preview.statusBadge.className = 'status-badge status-pending';
    }
  }

  inputs.status.addEventListener('change', syncStatus);
  syncStatus(); // initial sync

  function createEditorRow(item) {
    const div = document.createElement('div');
    div.className = 'editor-item';
    div.dataset.id = item.id;
    div.innerHTML = `
      <input type="text" class="ed-desc" placeholder="Item Description" value="${item.desc}">
      <div class="row-2">
        <input type="number" class="ed-qty" placeholder="Qty" min="1" value="${item.qty}">
        <input type="number" class="ed-price" placeholder="Price" min="0" step="any" value="${item.price}">
        <button class="btn btn-danger-sm rm-btn" title="Remove Item">Remove</button>
      </div>
    `;

    div.querySelector('.ed-desc').addEventListener('input', e => {
      item.desc = e.target.value;
      updatePreviewRow(item.id);
    });
    
    div.querySelector('.ed-qty').addEventListener('input', e => {
      item.qty = parseFloat(e.target.value) || 0;
      updatePreviewRow(item.id);
      calculateTotals();
    });
    
    div.querySelector('.ed-price').addEventListener('input', e => {
      item.price = parseFloat(e.target.value) || 0;
      updatePreviewRow(item.id);
      calculateTotals();
    });
    
    div.querySelector('.rm-btn').addEventListener('click', () => {
      items = items.filter(i => i.id !== item.id);
      div.remove();
      const ptr = document.getElementById(`prev-${item.id}`);
      if(ptr) ptr.remove();
      calculateTotals();
    });

    return div;
  }

  function createPreviewRow(item) {
    const tr = document.createElement('tr');
    tr.id = `prev-${item.id}`;
    tr.innerHTML = `
      <td class="col-desc">${item.desc}</td>
      <td class="col-qty">${item.qty}</td>
      <td class="col-price">${formatCurrency(item.price)}</td>
      <td class="col-total">${formatCurrency(item.qty * item.price)}</td>
    `;
    return tr;
  }

  function updatePreviewRow(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const tr = document.getElementById(`prev-${id}`);
    if (tr) {
      tr.querySelector('.col-desc').textContent = item.desc;
      tr.querySelector('.col-qty').textContent = item.qty;
      tr.querySelector('.col-price').textContent = formatCurrency(item.price);
      tr.querySelector('.col-total').textContent = formatCurrency(item.qty * item.price);
    }
  }

  function renderAllItems() {
    editorItemsContainer.innerHTML = '';
    preview.tbody.innerHTML = '';
    items.forEach(item => {
      editorItemsContainer.appendChild(createEditorRow(item));
      preview.tbody.appendChild(createPreviewRow(item));
    });
    calculateTotals();
  }

  function calculateTotals() {
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    preview.subtotal.textContent = formatCurrency(subtotal);

    const discountVal = parseFloat(inputs.discountVal.value) || 0;
    const isPercent = inputs.discountType.value === 'percent';
    
    let discountAmount = 0;
    if (isPercent) {
      discountAmount = subtotal * (discountVal / 100);
    } else {
      discountAmount = discountVal;
    }

    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    const finalPrice = subtotal - discountAmount;
    preview.total.textContent = formatCurrency(finalPrice);

    if (discountAmount > 0) {
      preview.discountRow.style.display = 'flex';
      preview.discount.textContent = '-' + formatCurrency(discountAmount) + (isPercent ? ` (${discountVal}%)` : '');
    } else {
      preview.discountRow.style.display = 'none';
    }
  }

  inputs.discountVal.addEventListener('input', calculateTotals);
  inputs.discountType.addEventListener('change', calculateTotals);
  inputs.currency.addEventListener('change', renderAllItems);

  addItemBtn.addEventListener('click', () => {
    const newItem = { id: generateId(), desc: '', qty: 1, price: 0 };
    items.push(newItem);
    editorItemsContainer.appendChild(createEditorRow(newItem));
    preview.tbody.appendChild(createPreviewRow(newItem));
    calculateTotals();

    const edPane = document.querySelector('.editor-pane');
    edPane.scrollTop = edPane.scrollHeight;
  });

  printBtn.addEventListener('click', () => {
    window.print();
  });

  renderAllItems();

  const ev = new Event('input');
  Object.values(inputs).forEach(input => {
    if(input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
        input.dispatchEvent(ev);
    }
  });
});
