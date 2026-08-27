/**
 * Lumina Lifestyle - Categories & Pantry View
 * Replicates and enhances the Stitch 'gerenciar_categorias_pt' screen.
 */

window.renderCategoriesView = function () {
  const store = window.shoppingStore;
  const categories = store.state.categories;
  const pantry = store.state.pantry || [];
  const activeList = store.getActiveList();

  const categoriesListHtml = categories.map(cat => {
    return `
      <div class="w-full flex items-center justify-between p-4 rounded-2xl transition-all border border-outline-variant/30 hover:opacity-95 shadow-sm" 
           style="background-color: ${cat.bgColor}; border-color: ${cat.borderColor || 'transparent'}">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-white/70 backdrop-blur-sm shadow-sm" style="color: ${cat.textColor}">
            <span class="material-symbols-outlined text-[24px]">${cat.icon}</span>
          </div>
          <div>
            <h3 class="font-headline-md text-base font-bold text-on-surface">${cat.name}</h3>
            <span class="text-xs text-on-surface-variant">${store.state.lists.reduce((acc, l) => acc + (l.items?.filter(i => i.categoryId === cat.id).length || 0), 0)} itens no total</span>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <button onclick="window.openCategoryModal('${cat.id}')" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-on-surface-variant" title="Editar">
            <span class="material-symbols-outlined text-[20px]">edit</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  const pantryListHtml = pantry.map(p => {
    const cat = store.getCategoryById(p.categoryId);
    return `
      <div class="flex items-center justify-between p-3 bg-surface-container rounded-xl border border-outline-variant/30 hover:bg-surface-variant transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: ${cat.bgColor}; color: ${cat.textColor}">
            <span class="material-symbols-outlined text-[18px]">${cat.icon}</span>
          </div>
          <div>
            <h4 class="font-body-lg text-xs font-bold text-on-surface">${p.name}</h4>
            <span class="text-[11px] text-on-surface-variant">${cat.name} • ${p.defaultPrice > 0 ? `R$ ${p.defaultPrice.toFixed(2)}/${p.unit}` : p.unit}</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          ${activeList ? `
            <button onclick="window.addPantryItemToList('${activeList.id}', '${p.id}')" class="px-2.5 py-1 bg-primary-container text-on-primary-container rounded-lg text-xs font-bold flex items-center gap-1 hover:opacity-90 active:scale-95 shadow-sm">
              <span class="material-symbols-outlined text-[14px]">add_shopping_cart</span>
              Adicionar
            </button>
          ` : ''}
          <button onclick="window.deletePantryItem('${p.id}')" class="text-outline hover:text-error transition-colors p-1" title="Remover da despensa">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="pb-28">
      <!-- TopAppBar -->
      <header class="bg-background flex justify-between items-center w-full px-5 py-3.5 sticky top-0 z-30">
        <div class="flex items-center gap-2.5">
          <button onclick="window.shoppingStore.setActiveTab('home')" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface active:scale-95 transition-all">
            <span class="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <h1 class="font-headline-xl-mobile text-xl font-bold text-on-surface">Categorias</h1>
        </div>

        <button onclick="window.openCategoryModal()" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-variant text-primary" title="Nova Categoria">
          <span class="material-symbols-outlined text-[24px]">add_circle</span>
        </button>
      </header>

      <!-- Main Content -->
      <main class="px-5 py-2 space-y-6">
        <!-- Section: Categories -->
        <section>
          <div class="flex justify-between items-center mb-3">
            <h2 class="font-label-caps text-label-caps text-primary uppercase font-bold flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">category</span>
              Categorias Cadastradas
            </h2>
            <button onclick="window.openCategoryModal()" class="text-xs text-primary font-bold hover:underline flex items-center gap-0.5">
              <span class="material-symbols-outlined text-[14px]">add</span>
              Nova
            </button>
          </div>
          <div class="space-y-3">
            ${categoriesListHtml}
          </div>
        </section>

        <!-- Section: Despensa / Frequent Items -->
        <section>
          <div class="flex justify-between items-center mb-3">
            <div>
              <h2 class="font-label-caps text-label-caps text-outline uppercase font-bold flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">inventory_2</span>
                Itens Frequentes da Despensa
              </h2>
              <p class="text-[11px] text-on-surface-variant">Adicione à lista ativa com 1 toque</p>
            </div>
            <button onclick="window.openNewPantryModal()" class="text-xs text-primary font-bold hover:underline flex items-center gap-0.5">
              <span class="material-symbols-outlined text-[14px]">add</span>
              Item
            </button>
          </div>
          <div class="space-y-2">
            ${pantryListHtml}
          </div>
        </section>
      </main>
    </div>
  `;
};

window.addPantryItemToList = function (listId, pantryId) {
  const store = window.shoppingStore;
  const p = store.state.pantry.find(item => item.id === pantryId);
  if (!p) return;

  store.addItemToList(listId, {
    name: p.name,
    categoryId: p.categoryId,
    quantity: 1,
    unit: p.unit,
    currentPrice: p.defaultPrice,
    previousPrice: p.defaultPrice
  });

  window.showToast(`"${p.name}" adicionado à lista!`, 'success');
};

window.deletePantryItem = function (pantryId) {
  window.shoppingStore.deletePantryItem(pantryId);
  window.showToast('Item removido da despensa.', 'info');
};

window.openNewPantryModal = function () {
  const store = window.shoppingStore;
  const categories = store.state.categories;

  const modalHtml = `
    <div id="modal-backdrop" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center transition-opacity fade-in" onclick="if(event.target === this) window.closeModal()">
      <div class="w-full max-w-[540px] bg-surface-container-lowest rounded-t-3xl p-6 pointer-events-auto shadow-[0px_-10px_40px_rgba(0,0,0,0.15)] relative z-10 slide-up max-h-[90vh] overflow-y-auto">
        <div class="w-12 h-1.5 bg-outline-variant rounded-full mx-auto mb-5"></div>
        
        <div class="flex justify-between items-center mb-5">
          <h2 class="font-headline-md text-headline-md text-on-surface">Novo Item na Despensa</h2>
          <button onclick="window.closeModal()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form id="pantry-form" onsubmit="window.savePantryItem(event)" class="space-y-4">
          <div>
            <label class="block font-label-caps text-on-surface-variant uppercase text-xs mb-1.5 font-bold">Nome do Produto</label>
            <input id="pantry-name-input" required type="text" class="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-on-surface font-body-lg" placeholder="Ex: Arroz 5kg, Azeite...">
          </div>

          <div>
            <label class="block font-label-caps text-on-surface-variant uppercase text-xs mb-1.5 font-bold">Categoria</label>
            <select id="pantry-cat-input" class="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-on-surface text-sm font-semibold">
              ${categories.map(c => `
                <option value="${c.id}">${c.name}</option>
              `).join('')}
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-label-caps text-on-surface-variant uppercase text-xs mb-1.5 font-bold">Unidade</label>
              <select id="pantry-unit-input" class="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-on-surface text-sm font-semibold">
                <option value="unid">unid (Unidade)</option>
                <option value="kg">kg (Quilograma)</option>
                <option value="g">g (Gramas)</option>
                <option value="L">L (Litros)</option>
                <option value="pct">pct (Pacote)</option>
                <option value="cx">cx (Caixa)</option>
              </select>
            </div>

            <div>
              <label class="block font-label-caps text-on-surface-variant uppercase text-xs mb-1.5 font-bold">Preço Padrão (R$)</label>
              <input id="pantry-price-input" type="number" step="0.01" min="0" class="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-on-surface font-body-lg" placeholder="0,00">
            </div>
          </div>

          <button type="submit" class="w-full py-3.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md mt-2">
            <span class="material-symbols-outlined">add</span>
            Salvar na Despensa
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHtml;
};

window.savePantryItem = function (e) {
  e.preventDefault();
  const name = document.getElementById('pantry-name-input').value;
  const categoryId = document.getElementById('pantry-cat-input').value;
  const unit = document.getElementById('pantry-unit-input').value;
  const defaultPrice = parseFloat(document.getElementById('pantry-price-input').value) || 0;

  window.shoppingStore.addPantryItem({ name, categoryId, unit, defaultPrice });
  window.closeModal();
  window.showToast('Item adicionado à despensa!', 'success');
};
