/**
 * Lumina Lifestyle - Store & State Management
 * Persistent localStorage state with reactive subscriber pattern.
 */

const STORAGE_KEY = 'stitch_smart_shopping_manager_v1';

// Pre-defined Lumina Lifestyle Categories
const DEFAULT_CATEGORIES = [
  {
    id: 'acougue',
    name: 'Açougue',
    icon: 'set_meal',
    bgColor: '#ffdad6', // error-container
    textColor: '#b4271d', // tertiary
    borderColor: '#ffb4a9'
  },
  {
    id: 'hortifruti',
    name: 'Hortifruti',
    icon: 'eco',
    bgColor: '#e8f5e9', // soft green pastel
    textColor: '#006d37', // secondary
    borderColor: '#a3e9b8'
  },
  {
    id: 'mercearia',
    name: 'Mercearia',
    icon: 'shopping_cart',
    bgColor: '#feeadf', // surface-container
    textColor: '#944a00', // primary
    borderColor: '#f2dfd4'
  },
  {
    id: 'laticinios',
    name: 'Laticínios',
    icon: 'water_drop',
    bgColor: '#e3f2fd', // soft blue pastel
    textColor: '#1976d2',
    borderColor: '#bbdefb'
  },
  {
    id: 'padaria',
    name: 'Padaria & Confeitaria',
    icon: 'bakery_dining',
    bgColor: '#fff3e0',
    textColor: '#e65100',
    borderColor: '#ffe0b2'
  },
  {
    id: 'bebidas',
    name: 'Bebidas',
    icon: 'local_bar',
    bgColor: '#f3e5f5',
    textColor: '#7b1fa2',
    borderColor: '#e1bee7'
  },
  {
    id: 'limpeza',
    name: 'Limpeza',
    icon: 'cleaning_services',
    bgColor: '#e0f7fa',
    textColor: '#00838f',
    borderColor: '#b2ebf2'
  },
  {
    id: 'higiene',
    name: 'Higiene & Cuidados',
    icon: 'spa',
    bgColor: '#fce4ec',
    textColor: '#c2185b',
    borderColor: '#f8bbd0'
  }
];

// Initial pantry items for quick addition
const DEFAULT_PANTRY = [
  { id: 'p1', name: 'Arroz Branco 5kg', categoryId: 'mercearia', unit: 'unid', defaultPrice: 28.90 },
  { id: 'p2', name: 'Feijão Carioca 1kg', categoryId: 'mercearia', unit: 'unid', defaultPrice: 8.50 },
  { id: 'p3', name: 'Óleo de Soja 900ml', categoryId: 'mercearia', unit: 'unid', defaultPrice: 6.80 },
  { id: 'p4', name: 'Leite Integral 1L', categoryId: 'laticinios', unit: 'unid', defaultPrice: 4.89 },
  { id: 'p5', name: 'Café Torrado 500g', categoryId: 'mercearia', unit: 'unid', defaultPrice: 17.90 },
  { id: 'p6', name: 'Detergente Líquido', categoryId: 'limpeza', unit: 'unid', defaultPrice: 2.39 },
  { id: 'p7', name: 'Papel Higiênico 12un', categoryId: 'higiene', unit: 'pct', defaultPrice: 19.90 },
  { id: 'p8', name: 'Pão de Forma', categoryId: 'padaria', unit: 'unid', defaultPrice: 7.90 },
  { id: 'p9', name: 'Ovos Brancos 30un', categoryId: 'hortifruti', unit: 'unid', defaultPrice: 18.00 }
];

// Initial lists matching Stitch mockup
const DEFAULT_LISTS = [
  {
    id: 'list-current',
    title: 'Compras • Fevereiro 2024',
    subtitle: 'Fevereiro 2024',
    status: 'in_progress', // 'in_progress' | 'completed'
    createdAt: '2024-02-01T10:00:00.000Z',
    completedAt: null,
    notes: 'Compras mensais essenciais',
    items: [
      {
        id: 'item-1',
        name: 'Coxão mole',
        categoryId: 'acougue',
        quantity: 1,
        unit: 'kg',
        currentPrice: 32.50,
        previousPrice: 28.90,
        bought: false
      },
      {
        id: 'item-2',
        name: 'Frango passarinho',
        categoryId: 'acougue',
        quantity: 2,
        unit: 'kg',
        currentPrice: 14.90,
        previousPrice: 15.50,
        bought: false
      },
      {
        id: 'item-3',
        name: 'Banana prata',
        categoryId: 'hortifruti',
        quantity: 6,
        unit: 'kg',
        currentPrice: 1.60,
        previousPrice: 1.50,
        bought: true
      },
      {
        id: 'item-4',
        name: 'Maçã fuji',
        categoryId: 'hortifruti',
        quantity: 4,
        unit: 'kg',
        currentPrice: 8.99,
        previousPrice: 8.99,
        bought: false
      },
      {
        id: 'item-5',
        name: 'Biscoito cream cracker',
        categoryId: 'mercearia',
        quantity: 1,
        unit: 'unid',
        currentPrice: 3.49,
        previousPrice: 3.49,
        bought: false
      },
      {
        id: 'item-6',
        name: 'Coconut snack crunch',
        categoryId: 'mercearia',
        quantity: 2,
        unit: 'unid',
        currentPrice: 2.20,
        previousPrice: 2.00,
        bought: false
      },
      {
        id: 'item-7',
        name: 'Leite Semi-desnatado',
        categoryId: 'laticinios',
        quantity: 3,
        unit: 'L',
        currentPrice: 4.79,
        previousPrice: 4.99,
        bought: true
      },
      {
        id: 'item-8',
        name: 'Queijo Mussarela',
        categoryId: 'laticinios',
        quantity: 0.5,
        unit: 'kg',
        currentPrice: 44.00,
        previousPrice: 42.00,
        bought: false
      }
    ]
  },
  {
    id: 'list-jan-2024',
    title: 'Janeiro 2024',
    subtitle: 'Janeiro 2024',
    status: 'completed',
    createdAt: '2024-01-05T09:00:00.000Z',
    completedAt: '2024-01-28T18:30:00.000Z',
    notes: 'Fechamento do mês de Janeiro',
    itemsCount: 45,
    totalSpent: 450.20,
    items: []
  },
  {
    id: 'list-dez-2023',
    title: 'Dezembro 2023',
    subtitle: 'Dezembro 2023',
    status: 'completed',
    createdAt: '2023-12-02T11:00:00.000Z',
    completedAt: '2023-12-23T20:00:00.000Z',
    notes: 'Festa de fim de ano',
    itemsCount: 62,
    totalSpent: 890.50,
    items: []
  },
  {
    id: 'list-nov-2023',
    title: 'Novembro 2023',
    subtitle: 'Novembro 2023',
    status: 'completed',
    createdAt: '2023-11-04T10:00:00.000Z',
    completedAt: '2023-11-27T17:00:00.000Z',
    notes: 'Compras normais',
    itemsCount: 38,
    totalSpent: 380.00,
    items: []
  }
];

class ShoppingStore {
  constructor() {
    this.subscribers = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading state from localStorage', e);
    }

    // Default state
    return {
      activeTab: 'home', // 'home' | 'cart' | 'categories' | 'history' | 'settings'
      activeListId: 'list-current',
      showPreviousPrices: false,
      searchQuery: '',
      selectedCategoryFilter: 'all',
      monthlyBudget: 600.00,
      userName: 'Usuário',
      categories: DEFAULT_CATEGORIES,
      pantry: DEFAULT_PANTRY,
      lists: DEFAULT_LISTS
    };
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notify();
    } catch (e) {
      console.error('Error saving state to localStorage', e);
    }
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.subscribers.forEach(cb => cb(this.state));
  }

  // Navigation
  setActiveTab(tab) {
    this.state.activeTab = tab;
    this.saveState();
  }

  setActiveList(listId) {
    this.state.activeListId = listId;
    this.saveState();
  }

  togglePreviousPrices(show) {
    this.state.showPreviousPrices = typeof show === 'boolean' ? show : !this.state.showPreviousPrices;
    this.saveState();
  }

  setSearchQuery(q) {
    this.state.searchQuery = q || '';
    this.saveState();
  }

  setCategoryFilter(catId) {
    this.state.selectedCategoryFilter = catId || 'all';
    this.saveState();
  }

  // Getters
  getActiveList() {
    const list = this.state.lists.find(l => l.id === this.state.activeListId);
    if (list) return list;
    return this.state.lists.find(l => l.status === 'in_progress') || this.state.lists[0];
  }

  getListById(id) {
    return this.state.lists.find(l => l.id === id);
  }

  getCategoryById(id) {
    return this.state.categories.find(c => c.id === id) || {
      id: 'outros',
      name: 'Outros',
      icon: 'category',
      bgColor: '#feeadf',
      textColor: '#944a00',
      borderColor: '#f2dfd4'
    };
  }

  // Calculations
  calculateListTotals(list) {
    if (!list) return { currentTotal: 0, previousTotal: 0, boughtTotal: 0, totalItems: 0, boughtItems: 0 };

    if (list.items && list.items.length > 0) {
      let currentTotal = 0;
      let previousTotal = 0;
      let boughtTotal = 0;
      let boughtItems = 0;

      list.items.forEach(item => {
        const qty = Number(item.quantity) || 0;
        const curPrice = Number(item.currentPrice) || 0;
        const prevPrice = Number(item.previousPrice) || curPrice;

        currentTotal += qty * curPrice;
        previousTotal += qty * prevPrice;

        if (item.bought) {
          boughtTotal += qty * curPrice;
          boughtItems += 1;
        }
      });

      return {
        currentTotal,
        previousTotal,
        boughtTotal,
        totalItems: list.items.length,
        boughtItems
      };
    }

    return {
      currentTotal: list.totalSpent || 0,
      previousTotal: list.totalSpent || 0,
      boughtTotal: list.totalSpent || 0,
      totalItems: list.itemsCount || 0,
      boughtItems: list.itemsCount || 0
    };
  }

  // Item Actions
  addItemToList(listId, itemData) {
    const list = this.getListById(listId);
    if (!list) return;

    if (!list.items) list.items = [];

    const newItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: itemData.name.trim(),
      categoryId: itemData.categoryId || 'mercearia',
      quantity: Number(itemData.quantity) || 1,
      unit: itemData.unit || 'unid',
      currentPrice: Number(itemData.currentPrice) || 0,
      previousPrice: Number(itemData.previousPrice) || Number(itemData.currentPrice) || 0,
      bought: false
    };

    list.items.push(newItem);
    this.saveState();
  }

  updateItemQuantity(listId, itemId, delta) {
    const list = this.getListById(listId);
    if (!list || !list.items) return;

    const item = list.items.find(i => i.id === itemId);
    if (!item) return;

    const step = item.unit === 'kg' ? 0.5 : 1;
    let newQty = (Number(item.quantity) || 1) + (delta * step);
    if (newQty <= 0) {
      this.removeItemFromList(listId, itemId);
      return;
    }
    item.quantity = Math.round(newQty * 100) / 100;
    this.saveState();
  }

  updateItemPrice(listId, itemId, newPrice) {
    const list = this.getListById(listId);
    if (!list || !list.items) return;

    const item = list.items.find(i => i.id === itemId);
    if (!item) return;

    item.currentPrice = Math.max(0, Number(newPrice) || 0);
    this.saveState();
  }

  toggleItemBought(listId, itemId) {
    const list = this.getListById(listId);
    if (!list || !list.items) return;

    const item = list.items.find(i => i.id === itemId);
    if (!item) return;

    item.bought = !item.bought;
    this.saveState();
  }

  removeItemFromList(listId, itemId) {
    const list = this.getListById(listId);
    if (!list || !list.items) return;

    list.items = list.items.filter(i => i.id !== itemId);
    this.saveState();
  }

  updateItemDetails(listId, itemId, updated) {
    const list = this.getListById(listId);
    if (!list || !list.items) return;

    const item = list.items.find(i => i.id === itemId);
    if (!item) return;

    Object.assign(item, updated);
    this.saveState();
  }

  // List Management
  createNewList(title, baseOnPrevious = false) {
    const activeList = this.getActiveList();
    const id = 'list-' + Date.now();
    let items = [];

    if (baseOnPrevious && activeList && activeList.items) {
      // Clone items from active list and set previous prices to the current prices of that list
      items = activeList.items.map(item => ({
        id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        name: item.name,
        categoryId: item.categoryId,
        quantity: item.quantity,
        unit: item.unit,
        currentPrice: item.currentPrice,
        previousPrice: item.currentPrice || item.previousPrice,
        bought: false
      }));
    }

    const newList = {
      id,
      title: title || `Compras • ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
      subtitle: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      completedAt: null,
      notes: baseOnPrevious ? 'Baseada no mês anterior' : 'Nova lista',
      items
    };

    this.state.lists.unshift(newList);
    this.state.activeListId = id;
    this.state.activeTab = 'cart';
    this.saveState();
  }

  completeActiveList(listId) {
    const list = this.getListById(listId);
    if (!list) return;

    const totals = this.calculateListTotals(list);
    list.status = 'completed';
    list.completedAt = new Date().toISOString();
    list.totalSpent = totals.currentTotal;
    list.itemsCount = totals.totalItems;

    this.saveState();
  }

  deleteList(listId) {
    this.state.lists = this.state.lists.filter(l => l.id !== listId);
    if (this.state.activeListId === listId) {
      const remaining = this.state.lists[0];
      this.state.activeListId = remaining ? remaining.id : null;
    }
    this.saveState();
  }

  renameList(listId, newTitle, newNotes) {
    const list = this.getListById(listId);
    if (!list) return;
    if (newTitle !== undefined && newTitle.trim()) {
      list.title = newTitle.trim();
    }
    if (newNotes !== undefined) {
      list.notes = newNotes.trim();
    }
    this.saveState();
  }

  updateList(listId, updates) {
    const list = this.getListById(listId);
    if (!list) return;
    Object.assign(list, updates);
    this.saveState();
  }

  // Category Management
  addCategory(category) {
    const id = 'cat-' + Date.now();
    this.state.categories.push({
      id,
      name: category.name.trim(),
      icon: category.icon || 'category',
      bgColor: category.bgColor || '#feeadf',
      textColor: category.textColor || '#944a00',
      borderColor: category.borderColor || '#f2dfd4'
    });
    this.saveState();
  }

  updateCategory(id, updated) {
    const cat = this.state.categories.find(c => c.id === id);
    if (cat) {
      Object.assign(cat, updated);
      this.saveState();
    }
  }

  deleteCategory(id) {
    this.state.categories = this.state.categories.filter(c => c.id !== id);
    this.saveState();
  }

  // Pantry Management
  addPantryItem(item) {
    this.state.pantry.push({
      id: 'p-' + Date.now(),
      name: item.name.trim(),
      categoryId: item.categoryId || 'mercearia',
      unit: item.unit || 'unid',
      defaultPrice: Number(item.defaultPrice) || 0
    });
    this.saveState();
  }

  deletePantryItem(id) {
    this.state.pantry = this.state.pantry.filter(p => p.id !== id);
    this.saveState();
  }

  // Settings
  setMonthlyBudget(budget) {
    this.state.monthlyBudget = Number(budget) || 0;
    this.saveState();
  }

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = this.loadState();
    this.notify();
  }

  exportDataAsJSON() {
    return JSON.stringify(this.state, null, 2);
  }

  importDataFromJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.lists && parsed.categories) {
        this.state = parsed;
        this.saveState();
        return true;
      }
    } catch (e) {
      console.error('Failed to import JSON', e);
    }
    return false;
  }
}

// Global Store Instance
window.shoppingStore = new ShoppingStore();
