/**
 * Lumina Lifestyle - Interactive Modals & Bottom Sheets
 */

// Toast feedback system
window.showToast = function (message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none max-w-[90%]';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-secondary text-white' : type === 'error' ? 'bg-tertiary text-white' : 'bg-on-surface text-surface';
  
  toast.className = `${bgClass} px-4 py-2.5 rounded-full shadow-lg text-sm font-semibold flex items-center gap-2 slide-up pointer-events-auto`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-[18px]">${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}</span>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
};

// Adjust quantity in item modal
window.adjustModalQty = function (delta) {
  const input = document.getElementById('item-qty-input');
  if (!input) return;
  const unit = document.getElementById('item-unit-input')?.value || 'unid';
  const step = (unit === 'kg' || unit === 'g' || unit === 'L') ? 0.5 : 1;
  let current = parseFloat(input.value) || 1;
  let next = Math.max(0.1, Math.round((current + delta * step) * 100) / 100);
  input.value = next;
};

// Open New List Modal / Bottom Sheet
window.openNewListModal = function () {
  const store = window.shoppingStore;
  const activeList = store.getActiveList();
  const activeTitle = activeList ? activeList.title : 'Nenhuma lista anterior';
  const activeItemCount = activeList && activeList.items ? activeList.items.length : 0;

  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const capitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);
  const defaultTitle = `Compras • ${capitalizedMonth}`;

  const modalHtml = `
    <div id="modal-backdrop" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center transition-opacity fade-in" onclick="if(event.target === this) window.closeModal()">
      <div class="w-full max-w-[540px] bg-surface-container-lowest rounded-t-3xl p-6 pointer-events-auto shadow-[0px_-10px_40px_rgba(0,0,0,0.15)] relative z-10 slide-up max-h-[90vh] overflow-y-auto">
        <div class="w-12 h-1.5 bg-outline-variant rounded-full mx-auto mb-6"></div>
        
        <div class="flex justify-between items-center mb-6">
          <h2 class="font-headline-md text-headline-md text-on-surface">Criar Nova Lista</h2>
          <button onclick="window.closeModal()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="mb-5">
          <label class="block font-label-caps text-on-surface-variant uppercase text-xs mb-1.5 font-bold">Título da Lista</label>
          <input id="new-list-title-input" type="text" value="${defaultTitle}" class="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-on-surface font-body-lg" placeholder="Ex: Compras • Março 2024">
        </div>

        <div class="space-y-3.5 mb-6">
          <button onclick="window.confirmCreateList(false)" class="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-container hover:bg-surface-variant transition-colors text-left border border-outline-variant/40 group">
            <div class="w-11 h-11 rounded-full bg-primary-fixed-dim/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <span class="material-symbols-outlined text-[24px]">add_shopping_cart</span>
            </div>
            <div class="flex-1">
              <span class="block font-body-lg text-on-surface font-semibold">Criar Lista Vazia</span>
              <span class="block text-xs text-on-surface-variant mt-0.5">Comece do zero adicionando itens manualmente</span>
            </div>
            <span class="material-symbols-outlined text-outline">chevron_right</span>
          </button>

          <button onclick="window.confirmCreateList(true)" class="w-full flex items-center gap-4 p-4 rounded-2xl bg-primary-fixed hover:opacity-95 transition-opacity text-left border border-primary-fixed-dim group shadow-sm">
            <div class="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="material-symbols-outlined text-[24px]">content_copy</span>
            </div>
            <div class="flex-1">
              <span class="block font-body-lg text-on-surface font-semibold">Basear na Lista Anterior</span>
              <span class="block text-xs text-on-surface-variant mt-0.5">${activeTitle} (${activeItemCount} itens com histórico de preços)</span>
            </div>
            <span class="material-symbols-outlined text-primary font-bold">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHtml;
};

window.confirmCreateList = function (baseOnPrevious) {
  const input = document.getElementById('new-list-title-input');
  const title = input ? input.value.trim() : '';
  window.shoppingStore.createNewList(title, baseOnPrevious);
  window.closeModal();
  window.showToast(baseOnPrevious ? 'Lista criada com itens clonados!' : 'Nova lista vazia criada!', 'success');
};

// Open Add or Edit Item Modal
window.openItemModal = function (listId, itemId = null) {
  const store = window.shoppingStore;
  const list = store.getListById(listId) || store.getActiveList();
  if (!list) return;

  const item = itemId && list.items ? list.items.find(i => i.id === itemId) : null;
  const categories = store.state.categories;
  const pantry = store.state.pantry || [];

  const isEdit = !!item;
  const defaultCategory = item ? item.categoryId : (categories[0]?.id || 'mercearia');

  const modalHtml = `
    <div id="modal-backdrop" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center transition-opacity fade-in" onclick="if(event.target === this) window.closeModal()">
      <div class="w-full max-w-[540px] bg-surface-container-lowest rounded-t-3xl p-6 pointer-events-auto shadow-[0px_-10px_40px_rgba(0,0,0,0.15)] relative z-10 slide-up max-h-[90vh] overflow-y-auto">
        <div class="w-12 h-1.5 bg-outline-variant rounded-full mx-auto mb-5"></div>
        
        <div class="flex justify-between items-center mb-5">
          <h2 class="font-headline-md text-headline-md text-on-surface">${isEdit ? 'Editar Item' : 'Adicionar ao Carrinho'}</h2>
          <button onclick="window.closeModal()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        ${!isEdit && pantry.length > 0 ? `
          <!-- Pantry Quick Suggestions -->
          <div class="mb-4">
            <label class="block font-label-caps text-on-surface-variant uppercase text-xs mb-1.5 font-bold">Sugestões Rápidas da Despensa</label>
            <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              ${pantry.map(p => `
                <button type="button" onclick="window.selectPantrySuggestion('${p.name}', '${p.categoryId}', '${p.unit}', ${p.defaultPrice})" class="whitespace-nowrap px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-variant text-xs text-on-surface flex items-center gap-1.5 border border-outline-variant/30 transition-all active:scale-95">
                  <span class="material-symbols-outlined text-[14px]">add</span>
                  ${p.name}
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <form id="item-form" onsubmit="window.saveItem(event, '${list.id}', ${item ? `'${item.id}'` : 'null'})" class="space-y-4">
          <div>
            <label class="block font-label-caps text-on-surface-variant uppercase text-xs mb-1.5 font-bold">Nome do Produto</label>
            <input id="item-name-input" required type="text" value="${item ? item.name : ''}" class="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-on-surface font-body-lg" placeholder="Ex: Queijo Minas, Café, Tomate...">
          </div>

          <div>
            <label class="block font-label-caps text-on-surface-variant uppercase text-xs mb-1.5 font-bold">Categoria</label>
            <div class="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-surface-container/50 rounded-xl border border-outline-variant/30">
              ${categories.map(cat => `
                <label class="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all border ${item && item.categoryId === cat.id ? 'border-primary bg-primary-fixed' : 'border-transparent hover:bg-surface-container'}">
                  <input type="radio" name="itemCategory" value="${cat.id}" ${(!item && cat.id === defaultCategory) || (item && item.categoryId === cat.id) ? 'checked' : ''} class="hidden">
                  <span class="material-symbols-outlined text-[18px]" style="color: ${cat.textColor}">${cat.icon}</span>
                  <span class="text-xs font-semibold text-on-surface truncate">${cat.name}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-label-caps text-on-surface-variant uppercase text-xs mb-1.5 font-bold">Quantidade</label>
              <div class="flex items-center bg-surface-container rounded-xl border border-outline-variant/50 overflow-hidden">
                <button type="button" onclick="window.adjustModalQty(-1)" class="w-11 h-11 flex items-center justify-center hover:bg-surface-variant text-on-surface-variant active:scale-90 transition-transform cursor-pointer">
                  <span class="material-symbols-outlined text-[20px]">remove</span>
                </button>
                <input id="item-qty-input" type="number" step="0.1" min="0.1" value="${item ? item.quantity : 1}" class="w-full text-center bg-transparent border-0 font-body-lg text-on-surface focus:outline-none py-2" required>
                <button type="button" onclick="window.adjustModalQty(1)" class="w-11 h-11 flex items-center justify-center hover:bg-surface-variant text-on-surface-variant active:scale-90 transition-transform cursor-pointer">
                  <span class="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
            </div>

            <div>
              <label class="block font-label-caps text-on-surface-variant uppercase text-xs mb-1.5 font-bold">Unidade</label>
              <select id="item-unit-input" class="w-full px-4 h-11 bg-surface-container rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-on-surface text-sm font-semibold">
                <option value="unid" ${item && item.unit === 'unid' ? 'selected' : ''}>unid (Unidade)</option>
                <option value="kg" ${item && item.unit === 'kg' ? 'selected' : ''}>kg (Quilograma)</option>
                <option value="g" ${item && item.unit === 'g' ? 'selected' : ''}>g (Gramas)</option>
                <option value="L" ${item && item.unit === 'L' ? 'selected' : ''}>L (Litros)</option>
                <option value="pct" ${item && item.unit === 'pct' ? 'selected' : ''}>pct (Pacote)</option>
                <option value="cx" ${item && item.unit === 'cx' ? 'selected' : ''}>cx (Caixa)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-label-caps text-on-surface-variant uppercase text-xs mb-1.5 font-bold">Preço Atual (R$)</label>
              <input id="item-price-input" type="number" step="0.01" min="0" value="${item ? item.currentPrice : ''}" class="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-on-surface font-body-lg" placeholder="0,00">
            </div>

            <div>
              <label class="block font-label-caps text-on-surface-variant uppercase text-xs mb-1.5 font-bold">Preço Anterior (R$)</label>
              <input id="item-prev-price-input" type="number" step="0.01" min="0" value="${item ? item.previousPrice : ''}" class="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-on-surface font-body-lg" placeholder="Opcional">
            </div>
          </div>

          <div class="pt-3 flex gap-3">
            ${isEdit ? `
              <button type="button" onclick="window.confirmDeleteItem('${list.id}', '${item.id}')" class="px-4 py-3.5 rounded-xl bg-error-container text-on-error-container font-semibold flex items-center justify-center hover:opacity-90 transition-opacity">
                <span class="material-symbols-outlined">delete</span>
              </button>
            ` : ''}
            <button type="submit" class="flex-1 py-3.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md">
              <span class="material-symbols-outlined">${isEdit ? 'save' : 'add'}</span>
              ${isEdit ? 'Salvar Alterações' : 'Adicionar ao Carrinho'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHtml;
};

window.selectPantrySuggestion = function (name, categoryId, unit, defaultPrice) {
  document.getElementById('item-name-input').value = name;
  document.getElementById('item-unit-input').value = unit || 'unid';
  document.getElementById('item-price-input').value = defaultPrice || '';
  document.getElementById('item-prev-price-input').value = defaultPrice || '';

  const radio = document.querySelector(`input[name="itemCategory"][value="${categoryId}"]`);
  if (radio) {
    radio.checked = true;
    radio.dispatchEvent(new Event('change'));
  }
};

window.saveItem = function (e, listId, itemId) {
  e.preventDefault();
  const name = document.getElementById('item-name-input').value;
  const categoryRadio = document.querySelector('input[name="itemCategory"]:checked');
  const categoryId = categoryRadio ? categoryRadio.value : 'mercearia';
  const quantity = parseFloat(document.getElementById('item-qty-input').value) || 1;
  const unit = document.getElementById('item-unit-input').value || 'unid';
  const currentPrice = parseFloat(document.getElementById('item-price-input').value) || 0;
  const prevPriceVal = document.getElementById('item-prev-price-input').value;
  const previousPrice = prevPriceVal ? parseFloat(prevPriceVal) : currentPrice;

  if (itemId) {
    window.shoppingStore.updateItemDetails(listId, itemId, {
      name,
      categoryId,
      quantity,
      unit,
      currentPrice,
      previousPrice
    });
    window.showToast('Item atualizado com sucesso!', 'success');
  } else {
    window.shoppingStore.addItemToList(listId, {
      name,
      categoryId,
      quantity,
      unit,
      currentPrice,
      previousPrice
    });
    window.showToast('Item adicionado à lista!', 'success');
  }

  window.closeModal();
};

window.confirmDeleteItem = function (listId, itemId) {
  if (confirm('Deseja realmente remover este item da lista?')) {
    window.shoppingStore.removeItemFromList(listId, itemId);
    window.closeModal();
    window.showToast('Item removido da lista.', 'info');
  }
};

// Checkout Summary Modal
window.openCheckoutSummaryModal = function (listId) {
  const store = window.shoppingStore;
  const list = store.getListById(listId) || store.getActiveList();
  if (!list) return;

  const totals = store.calculateListTotals(list);
  const budget = store.state.monthlyBudget || 600;
  const budgetDiff = budget - totals.currentTotal;
  const isOverBudget = budgetDiff < 0;

  // Breakdown by category
  const catBreakdown = {};
  if (list.items) {
    list.items.forEach(item => {
      const cat = store.getCategoryById(item.categoryId);
      if (!catBreakdown[cat.id]) {
        catBreakdown[cat.id] = { name: cat.name, color: cat.textColor, icon: cat.icon, total: 0, count: 0 };
      }
      catBreakdown[cat.id].total += (Number(item.quantity) || 0) * (Number(item.currentPrice) || 0);
      catBreakdown[cat.id].count += 1;
    });
  }

  const modalHtml = `
    <div id="modal-backdrop" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center transition-opacity fade-in" onclick="if(event.target === this) window.closeModal()">
      <div class="w-full max-w-[540px] bg-surface-container-lowest rounded-t-3xl p-6 pointer-events-auto shadow-[0px_-10px_40px_rgba(0,0,0,0.15)] relative z-10 slide-up max-h-[90vh] overflow-y-auto">
        <div class="w-12 h-1.5 bg-outline-variant rounded-full mx-auto mb-5"></div>
        
        <div class="flex justify-between items-center mb-5">
          <div>
            <h2 class="font-headline-md text-headline-md text-on-surface">Resumo da Lista</h2>
            <p class="text-xs text-on-surface-variant">${list.title}</p>
          </div>
          <button onclick="window.closeModal()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Budget comparison card -->
        <div class="bg-surface-container p-4 rounded-2xl mb-5 border border-outline-variant/40">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-bold text-on-surface-variant uppercase">Orçamento Mensal</span>
            <span class="text-xs font-semibold text-on-surface">${budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
          <div class="w-full bg-outline-variant/30 h-2.5 rounded-full overflow-hidden mb-2">
            <div class="h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-error' : 'bg-primary-container'}" style="width: ${Math.min(100, (totals.currentTotal / budget) * 100)}%"></div>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-on-surface-variant">Gasto total: <strong class="text-on-surface">${totals.currentTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></span>
            <span class="${isOverBudget ? 'text-error font-bold' : 'text-secondary font-bold'}">
              ${isOverBudget ? `Excedeu ${Math.abs(budgetDiff).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : `Resta ${budgetDiff.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
            </span>
          </div>
        </div>

        <!-- Category breakdown -->
        <h3 class="font-label-caps text-on-surface-variant uppercase text-xs mb-3 font-bold">Gastos por Categoria</h3>
        <div class="space-y-2 mb-6">
          ${Object.values(catBreakdown).map(c => `
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface-container/60">
              <div class="flex items-center gap-2.5">
                <span class="material-symbols-outlined text-[18px]" style="color: ${c.color}">${c.icon}</span>
                <span class="text-xs font-semibold text-on-surface">${c.name} (${c.count})</span>
              </div>
              <span class="text-xs font-bold text-on-surface">${c.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          `).join('')}
        </div>

        <div class="space-y-3">
          <button onclick="window.shareWhatsApp('${list.id}')" class="w-full py-3.5 rounded-xl bg-secondary text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[20px]">share</span>
            Compartilhar Lista no WhatsApp
          </button>
          
          ${list.status === 'in_progress' ? `
            <button onclick="window.finishList('${list.id}')" class="w-full py-3.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md">
              <span class="material-symbols-outlined text-[20px]">task_alt</span>
              Finalizar e Arquivar Compra
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHtml;
};

// Share WhatsApp Formatted List
window.shareWhatsApp = function (listId) {
  const store = window.shoppingStore;
  const list = store.getListById(listId) || store.getActiveList();
  if (!list) return;

  const totals = store.calculateListTotals(list);
  let text = `🛒 *${list.title}*\n`;
  text += `📅 ${new Date().toLocaleDateString('pt-BR')}\n`;
  text += `📊 Total: ${totals.currentTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${totals.totalItems} itens)\n\n`;

  if (list.items) {
    // Group by category
    const grouped = {};
    list.items.forEach(i => {
      const cat = store.getCategoryById(i.categoryId);
      if (!grouped[cat.name]) grouped[cat.name] = [];
      grouped[cat.name].push(i);
    });

    for (const [catName, items] of Object.entries(grouped)) {
      text += `*${catName}:*\n`;
      items.forEach(item => {
        const check = item.bought ? '✅' : '◻️';
        const price = item.currentPrice > 0 ? ` (R$ ${item.currentPrice.toFixed(2)})` : '';
        text += `${check} ${item.quantity} ${item.unit} - ${item.name}${price}\n`;
      });
      text += '\n';
    }
  }

  const encoded = encodeURIComponent(text);
  window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
};

window.finishList = function (listId) {
  if (confirm('Deseja finalizar esta lista de compras e arquivá-la no histórico?')) {
    window.shoppingStore.completeActiveList(listId);
    window.closeModal();
    window.showToast('Compra finalizada e salva no histórico!', 'success');
  }
};

// Category Modal
window.openCategoryModal = function (catId = null) {
  const store = window.shoppingStore;
  const cat = catId ? store.getCategoryById(catId) : null;
  const isEdit = !!cat;

  const ICONS = ['shopping_cart', 'eco', 'set_meal', 'water_drop', 'bakery_dining', 'local_bar', 'cleaning_services', 'spa', 'fastfood', 'kitchen', 'icecream', 'pets', 'local_pharmacy'];
  const COLORS = [
    { bg: '#feeadf', text: '#944a00' },
    { bg: '#e8f5e9', text: '#006d37' },
    { bg: '#ffdad6', text: '#b4271d' },
    { bg: '#e3f2fd', text: '#1976d2' },
    { bg: '#fff3e0', text: '#e65100' },
    { bg: '#f3e5f5', text: '#7b1fa2' },
    { bg: '#e0f7fa', text: '#00838f' },
    { bg: '#fce4ec', text: '#c2185b' }
  ];

  const modalHtml = `
    <div id="modal-backdrop" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center transition-opacity fade-in" onclick="if(event.target === this) window.closeModal()">
      <div class="w-full max-w-[540px] bg-surface-container-lowest rounded-t-3xl p-6 pointer-events-auto shadow-[0px_-10px_40px_rgba(0,0,0,0.15)] relative z-10 slide-up max-h-[90vh] overflow-y-auto">
        <div class="w-12 h-1.5 bg-outline-variant rounded-full mx-auto mb-5"></div>
        
        <div class="flex justify-between items-center mb-5">
          <h2 class="font-headline-md text-headline-md text-on-surface">${isEdit ? 'Editar Categoria' : 'Nova Categoria'}</h2>
          <button onclick="window.closeModal()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form id="category-form" onsubmit="window.saveCategory(event, ${cat ? `'${cat.id}'` : 'null'})" class="space-y-4">
          <div>
            <label class="block font-label-caps text-on-surface-variant uppercase text-xs mb-1.5 font-bold">Nome da Categoria</label>
            <input id="cat-name-input" required type="text" value="${cat ? cat.name : ''}" class="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-on-surface font-body-lg" placeholder="Ex: Bebidas, Pet Shop...">
          </div>

          <div>
            <label class="block font-label-caps text-on-surface-variant uppercase text-xs mb-1.5 font-bold">Ícone</label>
            <div class="grid grid-cols-6 gap-2 p-2 bg-surface-container rounded-xl">
              ${ICONS.map(ic => `
                <label class="w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-surface-variant transition-colors">
                  <input type="radio" name="catIcon" value="${ic}" ${(!cat && ic === 'shopping_cart') || (cat && cat.icon === ic) ? 'checked' : ''} class="hidden">
                  <span class="material-symbols-outlined text-[22px] text-on-surface">${ic}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div>
            <label class="block font-label-caps text-on-surface-variant uppercase text-xs mb-1.5 font-bold">Paleta de Cor</label>
            <div class="grid grid-cols-4 gap-2">
              ${COLORS.map(col => `
                <label class="h-10 rounded-xl flex items-center justify-center cursor-pointer border-2 transition-all" style="background-color: ${col.bg}; border-color: ${col.text}">
                  <input type="radio" name="catColor" value="${col.bg}|${col.text}" ${(!cat && col.bg === '#feeadf') || (cat && cat.bgColor === col.bg) ? 'checked' : ''} class="hidden">
                  <span class="material-symbols-outlined text-[18px]" style="color: ${col.text}">check</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="pt-3 flex gap-3">
            ${isEdit ? `
              <button type="button" onclick="window.confirmDeleteCategory('${cat.id}')" class="px-4 py-3.5 rounded-xl bg-error-container text-on-error-container font-semibold flex items-center justify-center hover:opacity-90 transition-opacity">
                <span class="material-symbols-outlined">delete</span>
              </button>
            ` : ''}
            <button type="submit" class="flex-1 py-3.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md">
              <span class="material-symbols-outlined">${isEdit ? 'save' : 'add'}</span>
              ${isEdit ? 'Salvar Categoria' : 'Criar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHtml;
};

window.saveCategory = function (e, catId) {
  e.preventDefault();
  const name = document.getElementById('cat-name-input').value;
  const iconRadio = document.querySelector('input[name="catIcon"]:checked');
  const icon = iconRadio ? iconRadio.value : 'category';
  const colorRadio = document.querySelector('input[name="catColor"]:checked');
  const [bgColor, textColor] = colorRadio ? colorRadio.value.split('|') : ['#feeadf', '#944a00'];

  if (catId) {
    window.shoppingStore.updateCategory(catId, { name, icon, bgColor, textColor });
    window.showToast('Categoria atualizada!', 'success');
  } else {
    window.shoppingStore.addCategory({ name, icon, bgColor, textColor });
    window.showToast('Categoria criada!', 'success');
  }

  window.closeModal();
};

window.confirmDeleteCategory = function (catId) {
  if (confirm('Deseja excluir esta categoria?')) {
    window.shoppingStore.deleteCategory(catId);
    window.closeModal();
    window.showToast('Categoria excluída.', 'info');
  }
};

window.closeModal = function () {
  const container = document.getElementById('modal-container');
  if (container) container.innerHTML = '';
};

// Open Mobile Connect & PWA QR Code Modal
window.openMobileConnectModal = async function () {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  let hostUrl = window.location.origin + window.location.pathname;
  
  // Try fetching the local network IP from our Node server if on localhost
  if (isLocal) {
    try {
      const res = await fetch('/api/network-info');
      if (res.ok) {
        const data = await res.json();
        if (data.fullUrl) {
          hostUrl = data.fullUrl;
        }
      }
    } catch (e) {
      // Fallback to default local Wi-Fi IP format
      hostUrl = `http://192.168.1.2:${window.location.port || 3000}`;
    }
  }

  const qrSvg = window.generateQRCodeSVG ? window.generateQRCodeSVG(hostUrl, 210, '#944a00', '#ffffff') : '';

  const modalHtml = `
    <div id="modal-backdrop" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center transition-opacity fade-in" onclick="if(event.target === this) window.closeModal()">
      <div class="w-full max-w-[540px] bg-surface-container-lowest rounded-t-3xl p-6 pointer-events-auto shadow-[0px_-10px_40px_rgba(0,0,0,0.2)] relative z-10 slide-up max-h-[92vh] overflow-y-auto">
        <div class="w-12 h-1.5 bg-outline-variant rounded-full mx-auto mb-5"></div>
        
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold">
              <span class="material-symbols-outlined text-[22px]">phone_iphone</span>
            </div>
            <div>
              <h2 class="font-headline-md text-headline-md text-on-surface">Abrir no Celular</h2>
              <p class="text-xs text-on-surface-variant">Instale como App (PWA) no seu smartphone</p>
            </div>
          </div>
          <button onclick="window.closeModal()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        ${isLocal ? `
        <!-- Wi-Fi Alert Reminder for Localhost -->
        <div class="p-3 bg-primary-fixed/50 border border-primary-fixed-dim/60 rounded-2xl mb-4 flex items-start gap-2.5">
          <span class="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">wifi</span>
          <p class="text-xs text-on-surface leading-relaxed">
            Certifique-se de que o seu celular está conectado na <strong>mesma rede Wi-Fi</strong> do computador.
          </p>
        </div>
        ` : `
        <!-- Cloud Production Info -->
        <div class="p-3 bg-secondary-fixed/50 border border-secondary-fixed-dim/60 rounded-2xl mb-4 flex items-start gap-2.5">
          <span class="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">cloud_done</span>
          <p class="text-xs text-on-surface leading-relaxed">
            App online na nuvem! Escaneie o QR Code abaixo com a câmera do celular para abrir e instalar diretamente.
          </p>
        </div>
        `}

        <!-- QR Code Card -->
        <div class="flex flex-col items-center justify-center p-5 bg-surface-container rounded-2xl border border-outline-variant/30 mb-5 text-center">
          <div class="qr-container p-3.5 rounded-2xl bg-white border border-primary-fixed-dim/40 shadow-md mb-3">
            ${qrSvg}
          </div>
          <p class="font-bold text-xs text-on-surface">Aponte a câmera do seu celular para escanear</p>
          <span class="text-[11px] text-on-surface-variant mt-0.5">Ou digite o link abaixo no navegador do celular:</span>
          
          <div class="w-full mt-3 flex items-center gap-2 bg-surface rounded-xl p-1.5 border border-outline-variant/40">
            <input id="mobile-connect-url-input" readonly value="${hostUrl}" class="flex-1 bg-transparent px-2.5 text-xs font-mono font-bold text-primary focus:outline-none select-all truncate">
            <button onclick="window.copyConnectUrl('${hostUrl}')" class="px-3 py-1.5 bg-primary-container text-on-primary-container font-bold text-xs rounded-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">content_copy</span>
              Copiar
            </button>
          </div>
        </div>

        <!-- Step-by-step Installation Instructions -->
        <div class="space-y-3 mb-5">
          <h3 class="font-label-caps text-on-surface-variant uppercase text-xs font-bold flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">install_mobile</span>
            Como Instalar na Tela Inicial
          </h3>

          <!-- iOS Card -->
          <div class="p-3.5 bg-surface-container/70 rounded-2xl border border-outline-variant/30 space-y-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[20px]">apple</span>
              <h4 class="text-xs font-bold text-on-surface">No iPhone (Safari):</h4>
            </div>
            <ol class="text-xs text-on-surface-variant space-y-1 pl-4 list-decimal">
              <li>Abra o link acima no <strong>Safari</strong>.</li>
              <li>Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima).</li>
              <li>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.</li>
            </ol>
          </div>

          <!-- Android Card -->
          <div class="p-3.5 bg-surface-container/70 rounded-2xl border border-outline-variant/30 space-y-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary text-[20px]">android</span>
              <h4 class="text-xs font-bold text-on-surface">No Android (Google Chrome):</h4>
            </div>
            <ol class="text-xs text-on-surface-variant space-y-1 pl-4 list-decimal">
              <li>Abra o link acima no <strong>Chrome</strong>.</li>
              <li>Toque no botão <strong>"Instalar aplicativo"</strong> que aparece na tela ou nos <strong>3 pontinhos</strong> do menu.</li>
              <li>Confirme em <strong>"Instalar"</strong>.</li>
            </ol>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-2">
          <button onclick="window.shareConnectLinkWhatsApp('${hostUrl}')" class="w-full py-3 bg-secondary text-white font-bold text-xs rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm">
            <span class="material-symbols-outlined text-[18px]">send_to_mobile</span>
            Enviar Link para meu WhatsApp
          </button>
          
          <button onclick="window.closeModal()" class="w-full py-2.5 text-xs text-on-surface-variant font-semibold hover:text-on-surface">
            Fechar
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHtml;
};

window.copyConnectUrl = function (url) {
  navigator.clipboard.writeText(url).then(() => {
    window.showToast('Link copiado para a área de transferência!', 'success');
  }).catch(() => {
    const input = document.getElementById('mobile-connect-url-input');
    if (input) {
      input.select();
      document.execCommand('copy');
      window.showToast('Link copiado!', 'success');
    }
  });
};

window.shareConnectLinkWhatsApp = function (url) {
  const text = `📱 *Acesse o App Minhas Compras no celular:*\n${url}\n\nConecte no mesmo Wi-Fi para abrir e instalar!`;
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
};

// List Actions Menu (3 Pontinhos)
window.openListActionsMenu = function (listId, e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }

  const store = window.shoppingStore;
  const list = store.getListById(listId);
  if (!list) return;

  const modalHtml = `
    <div id="modal-backdrop" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center transition-opacity fade-in" onclick="if(event.target === this) window.closeModal()">
      <div class="w-full max-w-[540px] bg-surface-container-lowest rounded-t-3xl p-5 pointer-events-auto shadow-[0px_-10px_40px_rgba(0,0,0,0.15)] relative z-10 slide-up">
        <div class="w-12 h-1.5 bg-outline-variant rounded-full mx-auto mb-4"></div>
        
        <div class="px-2 mb-4">
          <span class="text-[11px] font-bold uppercase tracking-wider text-outline">Opções da Lista</span>
          <h3 class="font-headline-md text-base font-bold text-on-surface truncate">${list.title}</h3>
        </div>

        <div class="space-y-2">
          <!-- Rename Option -->
          <button onclick="window.closeModal(); window.openRenameListModal('${list.id}')" 
                  class="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-surface-container hover:bg-surface-variant text-on-surface transition-all text-left font-semibold active:scale-[0.99]">
            <div class="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-[20px]">edit</span>
            </div>
            <div class="flex-1">
              <span class="block text-sm font-bold text-on-surface">Renomear Lista</span>
              <span class="block text-[11px] text-on-surface-variant">Alterar nome e observações</span>
            </div>
            <span class="material-symbols-outlined text-outline text-[20px]">chevron_right</span>
          </button>

          <!-- Delete Option -->
          <button onclick="window.closeModal(); window.confirmDeleteList('${list.id}')" 
                  class="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-error-container/50 hover:bg-error-container text-error transition-all text-left font-semibold active:scale-[0.99] border border-error/20">
            <div class="w-10 h-10 rounded-xl bg-error text-white flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">delete</span>
            </div>
            <div class="flex-1">
              <span class="block text-sm font-bold text-error">Excluir Lista</span>
              <span class="block text-[11px] text-error/80">Remover permanentemente esta lista</span>
            </div>
            <span class="material-symbols-outlined text-error text-[20px]">chevron_right</span>
          </button>
        </div>

        <div class="mt-4 pt-2">
          <button onclick="window.closeModal()" class="w-full py-3 bg-surface-container rounded-xl text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHtml;
};

// Rename List Modal
window.openRenameListModal = function (listId) {
  const store = window.shoppingStore;
  const list = store.getListById(listId);
  if (!list) return;

  const modalHtml = `
    <div id="modal-backdrop" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center transition-opacity fade-in" onclick="if(event.target === this) window.closeModal()">
      <div class="w-full max-w-[540px] bg-surface-container-lowest rounded-t-3xl p-6 pointer-events-auto shadow-[0px_-10px_40px_rgba(0,0,0,0.15)] relative z-10 slide-up max-h-[90vh] overflow-y-auto">
        <div class="w-12 h-1.5 bg-outline-variant rounded-full mx-auto mb-5"></div>
        
        <div class="flex justify-between items-center mb-5">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold">
              <span class="material-symbols-outlined text-[20px]">edit</span>
            </div>
            <h2 class="font-headline-md text-headline-md text-on-surface font-bold">Renomear Lista</h2>
          </div>
          <button onclick="window.closeModal()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form id="rename-list-form" onsubmit="window.saveRenameList(event, '${list.id}')" class="space-y-4">
          <div>
            <label class="block font-label-caps text-on-surface-variant uppercase text-xs mb-1.5 font-bold">Nome da Lista</label>
            <input id="rename-list-title-input" required type="text" value="${list.title.replace(/"/g, '&quot;')}" class="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-on-surface font-body-lg" placeholder="Ex: Compras • Janeiro 2024">
          </div>

          <div>
            <label class="block font-label-caps text-on-surface-variant uppercase text-xs mb-1.5 font-bold">Observações / Detalhes</label>
            <input id="rename-list-notes-input" type="text" value="${(list.notes || '').replace(/"/g, '&quot;')}" class="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-on-surface font-body-lg" placeholder="Ex: Fechamento do mês, Festa, etc.">
          </div>

          <div class="pt-3 flex gap-3">
            <button type="button" onclick="window.closeModal()" class="px-5 py-3.5 rounded-xl bg-surface-container text-on-surface-variant font-bold text-sm hover:bg-surface-variant transition-colors">
              Cancelar
            </button>
            <button type="submit" class="flex-1 py-3.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md">
              <span class="material-symbols-outlined">save</span>
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHtml;
  setTimeout(() => {
    const input = document.getElementById('rename-list-title-input');
    if (input) {
      input.focus();
      input.select();
    }
  }, 100);
};

window.saveRenameList = function (e, listId) {
  e.preventDefault();
  const titleInput = document.getElementById('rename-list-title-input');
  const notesInput = document.getElementById('rename-list-notes-input');

  const title = titleInput ? titleInput.value.trim() : '';
  const notes = notesInput ? notesInput.value.trim() : '';

  if (!title) {
    window.showToast('O título da lista não pode ficar vazio.', 'error');
    return;
  }

  window.shoppingStore.renameList(listId, title, notes);
  window.closeModal();
  window.showToast('Lista renomeada com sucesso!', 'success');
};


