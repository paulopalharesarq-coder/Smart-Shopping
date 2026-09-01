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

// Initial pantry items (empty by default)
const DEFAULT_PANTRY = [];

// Initial lists (empty by default)
const DEFAULT_LISTS = [];

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

    // Default clean state
    return {
      activeTab: 'home', // 'home' | 'cart' | 'categories' | 'history' | 'settings'
      activeListId: null,
      showPreviousPrices: false,
      searchQuery: '',
      selectedCategoryFilter: 'all',
      monthlyBudget: 0.00,
      userName: 'Usuário',
      categories: DEFAULT_CATEGORIES,
      pantry: [],
      lists: []
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
    if (!this.state.lists || this.state.lists.length === 0) return null;
    const list = this.state.lists.find(l => l.id === this.state.activeListId);
    if (list) return list;
    return this.state.lists.find(l => l.status === 'in_progress') || this.state.lists[0] || null;
  }

  getListById(id) {
    return this.state.lists.find(l => l.id === id);
  }

  getCategoryById(id) {
    if (!id || id === 'sem-categoria') {
      return {
        id: null,
        name: 'Sem categoria',
        icon: 'folder_open',
        bgColor: '#f2dfd4',
        textColor: '#564337',
        borderColor: '#dcc1b1'
      };
    }
    return this.state.categories.find(c => c.id === id) || {
      id: id,
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

    const rawCategory = itemData.categoryId;
    const cleanCategory = (rawCategory && typeof rawCategory === 'string' && rawCategory.trim() !== '' && rawCategory !== 'sem-categoria') ? rawCategory.trim() : null;

    const newItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: itemData.name.trim(),
      categoryId: cleanCategory,
      quantity: Number(itemData.quantity) || 1,
      unit: itemData.unit || 'unid',
      currentPrice: Number(itemData.currentPrice) || 0,
      previousPrice: Number(itemData.previousPrice) || Number(itemData.currentPrice) || 0,
      bought: true // Requirement 7: Every new product enters cart automatically
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

    if (updated.categoryId !== undefined) {
      const rawCat = updated.categoryId;
      updated.categoryId = (rawCat && typeof rawCat === 'string' && rawCat.trim() !== '' && rawCat !== 'sem-categoria') ? rawCat.trim() : null;
    }

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
        categoryId: item.categoryId || null,
        quantity: item.quantity,
        unit: item.unit,
        currentPrice: item.currentPrice,
        previousPrice: item.currentPrice || item.previousPrice,
        bought: true // Requirement 7: Cloned items start in cart
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

  reorderCategories(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.state.categories.length) return;
    if (toIndex < 0 || toIndex >= this.state.categories.length) return;
    if (fromIndex === toIndex) return;

    const [movedCat] = this.state.categories.splice(fromIndex, 1);
    this.state.categories.splice(toIndex, 0, movedCat);
    this.saveState();
  }

  moveCategory(id, direction) {
    const currentIndex = this.state.categories.findIndex(c => c.id === id);
    if (currentIndex === -1) return;

    const targetIndex = currentIndex + direction;
    if (targetIndex >= 0 && targetIndex < this.state.categories.length) {
      this.reorderCategories(currentIndex, targetIndex);
    }
  }

  setCategories(newCategories) {
    if (Array.isArray(newCategories)) {
      this.state.categories = newCategories;
      this.saveState();
    }
  }

  // Pantry Management
  addPantryItem(item) {
    const rawCat = item.categoryId;
    const cleanCategory = (rawCat && typeof rawCat === 'string' && rawCat.trim() !== '' && rawCat !== 'sem-categoria') ? rawCat.trim() : null;

    this.state.pantry.push({
      id: 'p-' + Date.now(),
      name: item.name.trim(),
      categoryId: cleanCategory,
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
