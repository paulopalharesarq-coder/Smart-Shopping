/**
 * Lumina Lifestyle - Settings & Profile View
 * Budget customization, backup/restore, design system tokens and reset options.
 */

window.renderSettingsView = function () {
  const store = window.shoppingStore;
  const budget = Number(store.state.monthlyBudget) || 0;

  return `
    <div class="pb-28">
      <!-- TopAppBar -->
      <header class="bg-background flex justify-between items-center w-full px-5 py-3.5 sticky top-0 z-30">
        <div class="flex items-center gap-2.5">
          <button onclick="window.shoppingStore.setActiveTab('home')" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface active:scale-95 transition-all" title="Voltar">
            <span class="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <h1 class="font-headline-xl-mobile text-xl font-bold text-on-surface">Perfil & Ajustes</h1>
        </div>
      </header>

      <main class="px-5 py-2 space-y-6">
        <!-- User Profile Card -->
        <div class="bg-primary-fixed rounded-2xl p-4 flex items-center gap-4 border border-primary-fixed-dim/50 shadow-sm">
          <div class="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl shadow-inner">
            <span class="material-symbols-outlined text-[28px]">person</span>
          </div>
          <div class="flex-1">
            <h2 class="font-headline-md text-base font-bold text-on-surface">Minhas Compras Mensais</h2>
            <p class="text-xs text-on-surface-variant mt-0.5">Gerenciador Inteligente de Compras</p>
            <span class="inline-flex items-center gap-1 text-[11px] font-bold text-primary mt-1">
              <span class="material-symbols-outlined text-[13px]">palette</span>
              Design: Lumina Lifestyle
            </span>
          </div>
        </div>

        <!-- Mobile Connect & PWA Card -->
        <section class="bg-primary-fixed/60 rounded-2xl p-4 border border-primary-fixed-dim/70 space-y-3 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5 text-primary font-bold">
              <span class="material-symbols-outlined text-[22px]">phone_iphone</span>
              <h3 class="font-headline-md text-sm text-on-surface">Acessar & Instalar no Celular</h3>
            </div>
            <span class="px-2 py-0.5 bg-secondary text-white text-[10px] font-bold rounded-full uppercase tracking-wider">PWA</span>
          </div>
          <p class="text-xs text-on-surface-variant">
            Abra a câmera do smartphone para escanear o QR Code e instalar este app direto na tela inicial.
          </p>
          <div>
            <button onclick="window.openMobileConnectModal()" class="w-full py-2.5 px-4 bg-primary text-white hover:opacity-95 active:scale-95 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all">
              <span class="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              Ver QR Code & Instruções
            </button>
          </div>
        </section>

        <!-- Monthly Budget Setting -->
        <section class="bg-surface-container rounded-2xl p-4 border border-outline-variant/40 space-y-3">
          <div class="flex items-center gap-2.5 text-primary font-bold">
            <span class="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            <h3 class="font-headline-md text-sm text-on-surface">Meta de Orçamento Mensal</h3>
          </div>
          <p class="text-xs text-on-surface-variant">
            Defina o teto de gastos para alertar visualmente quando o carrinho atingir o limite.
          </p>
          <div class="flex gap-2">
            <div class="relative flex-1">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs font-bold">R$</span>
              <input id="settings-budget-input" type="number" step="10" min="0" value="${budget}" 
                     class="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-on-surface font-bold text-sm" placeholder="0,00">
            </div>
            <button onclick="window.saveBudgetSetting()" class="px-4 py-2.5 bg-primary-container text-on-primary-container font-bold text-xs rounded-xl hover:opacity-90 active:scale-95 shadow-sm">
              Salvar
            </button>
          </div>
        </section>

        <!-- Data Management / Backup -->
        <section class="bg-surface-container rounded-2xl p-4 border border-outline-variant/40 space-y-3">
          <div class="flex items-center gap-2.5 text-secondary font-bold">
            <span class="material-symbols-outlined text-[20px]">cloud_sync</span>
            <h3 class="font-headline-md text-sm text-on-surface">Backup & Dados Locais</h3>
          </div>
          <p class="text-xs text-on-surface-variant">
            Seus dados são salvos com segurança no navegador. Exporte o arquivo JSON para backup ou troque de dispositivo.
          </p>
          <div class="flex flex-col gap-2 pt-1">
            <button onclick="window.downloadBackupJSON()" class="w-full py-2.5 px-4 bg-surface-container-high hover:bg-surface-variant rounded-xl text-xs font-bold text-on-surface flex items-center justify-center gap-2 border border-outline-variant/30 transition-colors">
              <span class="material-symbols-outlined text-[16px]">download</span>
              Exportar Backup (JSON)
            </button>

            <label class="w-full py-2.5 px-4 bg-surface-container-high hover:bg-surface-variant rounded-xl text-xs font-bold text-on-surface flex items-center justify-center gap-2 border border-outline-variant/30 cursor-pointer transition-colors">
              <span class="material-symbols-outlined text-[16px]">upload</span>
              Restaurar Backup (JSON)
              <input type="file" accept=".json" onchange="window.handleRestoreJSON(event)" class="hidden">
            </label>
          </div>
        </section>

        <!-- Reset to Default Data -->
        <section class="p-4 bg-error-container/40 rounded-2xl border border-error/20 space-y-2">
          <h4 class="font-label-caps text-xs font-bold text-tertiary uppercase flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">restart_alt</span>
            Redefinir Dados do App
          </h4>
          <p class="text-xs text-on-surface-variant">
            Limpa todas as listas e despensa, restaurando as categorias padrão.
          </p>
          <button onclick="window.confirmResetData()" class="px-4 py-2 bg-error-container text-on-error-container hover:bg-error/20 rounded-xl font-bold text-xs transition-colors">
            Redefinir Tudo
          </button>
        </section>
      </main>
    </div>
  `;
};

window.saveBudgetSetting = function () {
  const input = document.getElementById('settings-budget-input');
  if (input) {
    const val = parseFloat(input.value) || 0;
    window.shoppingStore.setMonthlyBudget(val);
    window.showToast('Orçamento atualizado!', 'success');
  }
};

window.downloadBackupJSON = function () {
  const jsonStr = window.shoppingStore.exportDataAsJSON();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `smart_shopping_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  window.showToast('Backup exportado com sucesso!', 'success');
};

window.handleRestoreJSON = function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const success = window.shoppingStore.importDataFromJSON(event.target.result);
    if (success) {
      window.showToast('Dados restaurados com sucesso!', 'success');
    } else {
      window.showToast('Erro ao importar JSON. Verifique o formato.', 'error');
    }
  };
  reader.readAsText(file);
};

window.confirmResetData = function () {
  if (confirm('Tem certeza que deseja redefinir para os dados originais?')) {
    window.shoppingStore.resetToDefault();
    window.showToast('Dados redefinidos com sucesso!', 'info');
  }
};
