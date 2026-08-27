/**
 * Lumina Lifestyle - Cart View (Lista de Compras & Comparador de Preços)
 * Replicates and enhances the Stitch 'lista_de_compras_pre_os_anteriores' screen.
 */

window.renderCartView = function () {
  const store = window.shoppingStore;
  const list = store.getActiveList();
  const showPreviousPrices = store.state.showPreviousPrices;
  const searchQuery = (store.state.searchQuery || '').toLowerCase();

  if (!list) {
    return `
      <div class="pb-28">
        <!-- TopAppBar -->
        <header class="bg-background flex justify-between items-center w-full px-5 py-3.5 sticky top-0 z-30">
          <div class="flex items-center gap-2.5">
            <button onclick="window.shoppingStore.setActiveTab('home')" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface active:scale-95 transition-all" title="Voltar ao início">
              <span class="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
            <div>
              <h1 class="font-headline-xl-mobile text-xl font-bold text-on-surface leading-tight">Carrinho</h1>
              <span class="text-on-surface-variant text-xs font-medium">0 itens</span>
            </div>
          </div>
        </header>

        <!-- Empty State Canvas -->
        <main class="px-5 pt-8 text-center flex flex-col items-center justify-center">
          <div class="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-outline mb-4">
            <span class="material-symbols-outlined text-4xl">shopping_cart_off</span>
          </div>
          <h2 class="font-headline-md text-lg font-bold text-on-surface">Nenhuma lista ativa</h2>
          <p class="text-xs text-on-surface-variant mt-1 mb-6 max-w-xs leading-relaxed">
            Você ainda não possui nenhuma lista de compras criada. Crie uma nova lista para começar a adicionar itens ao carrinho.
          </p>
          <div class="flex flex-col gap-2.5 w-full max-w-xs">
            <button onclick="window.openNewListModal()" class="w-full py-3.5 bg-primary-container text-on-primary-container rounded-xl font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[20px]">add_shopping_cart</span>
              Criar Nova Lista
            </button>
            <button onclick="window.shoppingStore.setActiveTab('home')" class="w-full py-2.5 bg-surface-container text-on-surface rounded-xl font-semibold text-xs hover:bg-surface-variant transition-colors">
              Voltar ao Início
            </button>
          </div>
        </main>
      </div>
    `;
  }

  const totals = store.calculateListTotals(list);
  const items = list.items || [];

  // Filter items by search query only
  const filteredItems = items.filter(item => {
    return !searchQuery || item.name.toLowerCase().includes(searchQuery);
  });

  // Group filtered items by category
  const categoriesMap = {};
  store.state.categories.forEach(cat => {
    categoriesMap[cat.id] = {
      ...cat,
      items: []
    };
  });

  filteredItems.forEach(item => {
    if (!categoriesMap[item.categoryId]) {
      categoriesMap[item.categoryId] = {
        id: item.categoryId,
        name: 'Outros',
        icon: 'category',
        bgColor: '#feeadf',
        textColor: '#944a00',
        borderColor: '#f2dfd4',
        items: []
      };
    }
    categoriesMap[item.categoryId].items.push(item);
  });

  // Render categories HTML
  let categoriesHtml = '';
  const activeCategories = Object.values(categoriesMap).filter(cat => cat.items.length > 0);

  if (activeCategories.length === 0) {
    categoriesHtml = `
      <div class="py-12 text-center bg-surface-container/50 rounded-2xl border border-dashed border-outline-variant p-6">
        <span class="material-symbols-outlined text-4xl text-outline mb-2">search_off</span>
        <h3 class="font-body-lg font-bold text-on-surface">Nenhum item encontrado</h3>
        <p class="text-xs text-on-surface-variant mt-1 mb-4">
          ${searchQuery ? `Nenhum resultado para "${searchQuery}"` : 'Esta lista ainda não possui itens.'}
        </p>
        <button onclick="window.openItemModal('${list.id}')" class="px-4 py-2 bg-primary-container text-on-primary-container rounded-xl font-semibold text-xs inline-flex items-center gap-1.5 shadow-sm">
          <span class="material-symbols-outlined text-[16px]">add</span>
          Adicionar Item
        </button>
      </div>
    `;
  } else {
    categoriesHtml = activeCategories.map(category => {
      const itemsHtml = category.items.map(item => {
        const curPrice = Number(item.currentPrice) || 0;
        const prevPrice = Number(item.previousPrice) || curPrice;
        const qty = Number(item.quantity) || 1;
        const subtotal = qty * curPrice;

        // Price comparison badge
        let priceDiffHtml = '';
        if (showPreviousPrices && prevPrice > 0) {
          const diff = curPrice - prevPrice;
          if (diff > 0) {
            priceDiffHtml = `
              <div class="text-[10px] font-bold text-error flex items-center justify-end gap-0.5 mt-0.5">
                <span class="material-symbols-outlined text-[12px]">arrow_upward</span>
                +${(diff * qty).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (+${Math.round((diff/prevPrice)*100)}%)
              </div>
            `;
          } else if (diff < 0) {
            priceDiffHtml = `
              <div class="text-[10px] font-bold text-secondary flex items-center justify-end gap-0.5 mt-0.5">
                <span class="material-symbols-outlined text-[12px]">arrow_downward</span>
                -${(Math.abs(diff) * qty).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${Math.round((diff/prevPrice)*100)}%)
              </div>
            `;
          }
        }

        return `
          <div class="rounded-2xl p-3.5 flex justify-between items-center transition-all border shadow-sm" 
               style="background-color: ${category.bgColor}; border-color: ${category.borderColor || 'transparent'}">
            <!-- Left Column: Name & Stepper -->
            <div class="flex flex-col gap-2 flex-1 min-w-0 pr-2">
              <h3 onclick="window.openItemModal('${list.id}', '${item.id}')" 
                  class="font-body-lg text-sm font-bold text-on-surface truncate cursor-pointer hover:underline" 
                  title="${item.name}">
                ${item.name}
              </h3>

              <!-- Quantity Stepper -->
              <div class="flex items-center bg-white/70 backdrop-blur-sm rounded-full w-fit px-1 py-0.5 shadow-sm border border-black/5">
                <button onclick="window.shoppingStore.updateItemQuantity('${list.id}', '${item.id}', -1)" 
                        class="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-90 transition-transform cursor-pointer">
                  <span class="material-symbols-outlined text-sm">remove</span>
                </button>
                <span class="px-2 text-center font-body-lg text-xs font-bold text-on-surface min-w-[28px]">
                  ${item.quantity} <span class="text-[10px] font-normal text-on-surface-variant">${item.unit}</span>
                </span>
                <button onclick="window.shoppingStore.updateItemQuantity('${list.id}', '${item.id}', 1)" 
                        class="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-90 transition-transform cursor-pointer">
                  <span class="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>

            <!-- Right Column: Price Display, More Menu -->
            <div class="flex flex-col items-end gap-1 ml-2">
              <button onclick="window.openItemModal('${list.id}', '${item.id}')" class="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-black/5" title="Opções">
                <span class="material-symbols-outlined text-[18px]">more_vert</span>
              </button>

              ${showPreviousPrices ? `
                <div class="text-right">
                  <div class="flex items-baseline justify-end gap-1.5">
                    ${prevPrice > 0 ? `
                      <span class="text-xs font-normal text-on-surface-variant/60 line-through tracking-tight">
                        ${prevPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    ` : ''}
                    <span class="font-price-display text-sm font-bold text-on-surface">
                      ${curPrice > 0 ? `${curPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}<span class="text-xs font-normal text-on-surface-variant">/${item.unit}</span>` : 'R$ --,--'}
                    </span>
                  </div>
                  <div class="text-[11px] text-on-surface-variant font-medium mt-0.5">
                    Total: <strong class="text-on-surface font-semibold">${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  </div>
                  ${priceDiffHtml}
                </div>
              ` : `
                <div class="text-right">
                  <div class="font-price-display text-sm font-bold text-on-surface">
                    ${curPrice > 0 ? `${curPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}<span class="text-xs font-normal text-on-surface-variant">/${item.unit}</span>` : 'R$ --,--'}
                  </div>
                  <div class="text-[11px] text-on-surface-variant font-medium mt-0.5">
                    ${curPrice > 0 ? `Total: <strong class="text-on-surface font-semibold">${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>` : 'Toque para editar'}
                  </div>
                </div>
              `}
            </div>
          </div>
        `;
      }).join('');

      return `
        <section class="space-y-2.5">
          <div class="flex items-center justify-between px-1">
            <div class="flex items-center gap-2" style="color: ${category.textColor}">
              <span class="material-symbols-outlined text-base">${category.icon}</span>
              <h2 class="font-label-caps text-xs font-bold uppercase tracking-wider">${category.name}</h2>
            </div>
            <span class="text-xs text-on-surface-variant font-medium">${category.items.length} ${category.items.length === 1 ? 'item' : 'itens'}</span>
          </div>
          <div class="space-y-2">
            ${itemsHtml}
          </div>
        </section>
      `;
    }).join('');
  }

  return `
    <div class="pb-[calc(12rem+env(safe-area-inset-bottom,0px))]">
      <!-- TopAppBar -->
      <header class="bg-background flex justify-between items-center w-full px-5 py-3.5 sticky top-0 z-30">
        <div class="flex items-center gap-2.5">
          <button onclick="window.shoppingStore.setActiveTab('home')" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface active:scale-95 transition-all">
            <span class="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div>
            <h1 class="font-headline-xl-mobile text-xl font-bold text-on-surface leading-tight">Carrinho</h1>
            <span class="text-on-surface-variant text-xs font-medium">${totals.totalItems} ${totals.totalItems === 1 ? 'item' : 'itens'}</span>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <button onclick="window.shareWhatsApp('${list.id}')" title="Compartilhar lista" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface">
            <span class="material-symbols-outlined text-[20px]">share</span>
          </button>
          <button onclick="window.openCheckoutSummaryModal('${list.id}')" title="Resumo e fechamento" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-variant text-primary">
            <span class="material-symbols-outlined text-[22px]">receipt_long</span>
          </button>
        </div>
      </header>

      <!-- Main Content Canvas -->
      <main class="px-5 pt-1 space-y-4">
        <!-- List Selector Dropdown / Context Card -->
        <div class="bg-surface-container rounded-2xl p-3.5 flex justify-between items-center border border-outline-variant/40">
          <div class="flex items-center gap-2.5 text-on-surface font-body-lg">
            <div class="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-[18px]">calendar_today</span>
            </div>
            <div>
              <span class="font-bold text-sm text-on-surface block">${list.title}</span>
              <span class="text-[11px] text-on-surface-variant">${list.status === 'in_progress' ? 'Lista ativa de compras' : 'Lista arquivada'}</span>
            </div>
          </div>
          
          <select onchange="window.shoppingStore.setActiveList(this.value)" class="bg-surface-variant text-on-surface text-xs font-bold py-1.5 px-3 rounded-xl border-none focus:outline-none cursor-pointer">
            ${store.state.lists.map(l => `
              <option value="${l.id}" ${l.id === list.id ? 'selected' : ''}>${l.title}</option>
            `).join('')}
          </select>
        </div>

        <!-- Search Bar -->
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">search</span>
          <input type="text" 
                 value="${store.state.searchQuery || ''}" 
                 oninput="window.shoppingStore.setSearchQuery(this.value)" 
                 placeholder="Buscar itens no carrinho..." 
                 class="w-full pl-10 pr-9 py-2.5 bg-surface-container rounded-xl border border-outline-variant/40 focus:border-primary focus:outline-none text-xs text-on-surface placeholder:text-outline">
          ${store.state.searchQuery ? `
            <button onclick="window.shoppingStore.setSearchQuery('')" class="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface">
              <span class="material-symbols-outlined text-[16px]">close</span>
            </button>
          ` : ''}
        </div>

        <!-- Toggle Previous Prices Card -->
        <div class="flex items-center justify-between bg-surface-container-high p-3.5 rounded-2xl border border-outline-variant/30 shadow-sm">
          <label class="font-body-lg text-xs font-bold text-on-surface flex items-center gap-2 cursor-pointer" for="price-toggle">
            <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-[18px]">history</span>
            </div>
            <span>Ver preços do mês anterior</span>
          </label>
          <label class="switch">
            <input id="price-toggle" type="checkbox" ${showPreviousPrices ? 'checked' : ''} onchange="window.shoppingStore.togglePreviousPrices(this.checked)">
            <span class="slider"></span>
          </label>
        </div>

        <!-- Categories & Item Cards -->
        <div class="space-y-6 pt-1">
          ${categoriesHtml}
        </div>
      </main>

      <!-- Total Bar & Attached FAB (Permanentemente fixos na base da tela) -->
      ${window.renderTotalBar(list, showPreviousPrices)}
    </div>
  `;
};
