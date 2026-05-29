/**
 * Ado Helper - Main Entry Point
 * UI enhancement and quality of life extension for SillyTavern.
 */

import { getContext, getEventSource, getEventTypes, getSlashCommand, getSlashCommandParser, getSaveSettingsDebounced } from "./stContext.js";
import { getSafeLandingPageZIndex } from "./lib/domUtils.js";
import { landingPageStyles } from "./react-ui/components/LandingPageStyles.js";
import { MODULE_NAME, getSettings, loadSettings } from "./lib/settingsManager.js";
import { refreshUIDisplay, setRefreshUICallback } from "./lib/uiModals.js";
import { initializeReactUI, registerCallback as registerReactCallback, notifyReactOfSettingsChange } from "./lib/reactBridge.js";
import { initPresetBindingService } from "./lib/presetBindingService.js";
import { applyGuidesToGeneration } from "./lib/guidedGenerationService.js";
import { initPersonaListener } from "./lib/personaService.js";
import { initCharacterBrowser } from "./lib/characterBrowserService.js";
import { initPersonaManager } from "./lib/personaManagerService.js";
import { applySceneBackground } from "./lib/imageGenService.js";
import { isLandingPageEnabled } from "./lib/landingPageService.js";
import AdoHelperUIModule from "./react-ui/index.jsx";
// Import React UI - bundles it and exposes window.AdoHelperUI
import "./react-ui/index.jsx";
import { activateChatSheld, deactivateChatSheld, isChatSheldEnabled, isChatSheldActive, syncTailChat, resetStreamingState, setChatSheldStoreRef, loadLoomBreakdowns } from "./lib/chatSheldService.js";

jQuery(async () => {
  const eventSource = getEventSource();
  const event_types = getEventTypes();

  loadSettings();
  const reactContainer = document.getElementById("extensions_settings");
  if (reactContainer) {
    await initializeReactUI(reactContainer);
  }
  refreshUIDisplay();
  setRefreshUICallback(refreshUIDisplay);
  notifyReactOfSettingsChange();
  initPresetBindingService();
  initPersonaListener();

  if (eventSource && event_types) {

    eventSource.on(event_types.CHAT_CHANGED, () => {
      if (getSettings().imageGeneration?.enabled) {
        applySceneBackground().catch(() => {});
      }
    });

    if (event_types.CHAT_COMPLETION_SETTINGS_READY) {
      eventSource.on(event_types.CHAT_COMPLETION_SETTINGS_READY, (generateData) => {
        try {
          applyGuidesToGeneration(generateData);
        } catch (err) {
          console.error(`[${MODULE_NAME}] Guided Generations failed:`, err);
        }
      });
    }

    // --- LANDING PAGE ---
    let adoLandingContainer = null;
    let originalBodyOverflow = '';

    function restoreSheld() {
      const sheld = document.querySelector('#sheld');
      if (sheld) { sheld.style.opacity = ''; sheld.style.pointerEvents = ''; }
    }

    function removeLandingPage() {
      if (adoLandingContainer) {
        adoLandingContainer.remove();
        adoLandingContainer = null;
        document.body.style.overflow = originalBodyOverflow || '';
        originalBodyOverflow = '';
      }
    }

    function renderCustomLanding() {
      if (!isLandingPageEnabled()) { restoreSheld(); return; }
      const ctx = getContext();
      const hasChatId = ctx?.chatId !== undefined && ctx?.chatId !== null && ctx?.chatId !== '';
      const isTempChat = ctx?.characterId === undefined && ctx?.name2 && ctx?.name2 === ctx?.neutralCharacterName;
      if (hasChatId || isTempChat) { restoreSheld(); removeLandingPage(); return; }

      if (!originalBodyOverflow) originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const sheld = document.querySelector('#sheld');
      if (sheld) { sheld.style.opacity = '0'; sheld.style.pointerEvents = 'none'; }

      if (adoLandingContainer) { window.dispatchEvent(new Event('ado:landing-refresh')); return; }

      adoLandingContainer = document.createElement('div');
      adoLandingContainer.id = 'ado-landing-page-container';
      adoLandingContainer.style.cssText = `position:fixed;inset:0;width:100%;height:100dvh;z-index:${getSafeLandingPageZIndex()};pointer-events:none;`;
      document.body.appendChild(adoLandingContainer);

      if (window.AdoHelperUI?.renderLandingPage) {
        window.AdoHelperUI.renderLandingPage(adoLandingContainer);
      } else {
        renderSimpleLandingPage(adoLandingContainer);
      }
    }

    async function renderSimpleLandingPage(container) {
      try {
        const styleId = 'ado-landing-styles';
        if (!document.getElementById(styleId)) {
          const el = document.createElement('style');
          el.id = styleId;
          el.textContent = landingPageStyles;
          document.head.appendChild(el);
        }

        const { characters, selectCharacterById, getThumbnailUrl } = await import(/* webpackIgnore: true */ '../../../../../script.js');
        const { groups, openGroupById } = await import(/* webpackIgnore: true */ '../../../../group-chats.js');

        const allItems = [
          ...(characters || []).map((c, i) => ({ ...c, _type: 'character', _index: i, _sortDate: c.date_last_chat || 0 })),
          ...(groups || []).map(g => ({ ...g, _type: 'group', _sortDate: g.date_last_chat || 0 })),
        ].filter(i => i._sortDate > 0).sort((a, b) => b._sortDate - a._sortDate).slice(0, 12);

        const fmt = (ts) => {
          const d = Math.floor((Date.now() - ts) / 60000);
          if (d < 1) return 'Just now';
          if (d < 60) return `${d}m ago`;
          if (d < 1440) return `${Math.floor(d/60)}h ago`;
          if (d < 10080) return `${Math.floor(d/1440)}d ago`;
          return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        };

        let html = `<div class="ado-lp-container"><div class="ado-lp-bg"><div class="ado-lp-bg-glow ado-lp-bg-glow-1"></div><div class="ado-lp-bg-glow ado-lp-bg-glow-2"></div><div class="ado-lp-bg-glow ado-lp-bg-glow-3"></div></div><div class="ado-lp-grid"></div><div class="ado-lp-content"><header class="ado-lp-header"><div class="ado-lp-logo"><div class="ado-lp-logo-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg></div><div class="ado-lp-logo-text"><h1>Ado Helper</h1><span>Continue your story</span></div></div><button class="ado-lp-btn ado-lp-btn-toggle" id="ado-lp-toggle" type="button"><span>Show Sheld</span></button></header><main class="ado-lp-main">`;

        if (allItems.length === 0) {
          html += `<div class="ado-lp-empty"><h3>Begin Your Journey</h3><p>No recent conversations found.</p></div>`;
        } else {
          html += '<div class="ado-lp-grid-cards">';
          allItems.forEach((item, i) => {
            const isGroup = item._type === 'group';
            let av = isGroup ? (item.avatar_url || '/img/fa-solid-groups.svg') : item.avatar && getThumbnailUrl ? getThumbnailUrl('avatar', item.avatar) : item.avatar ? `/characters/${encodeURIComponent(item.avatar)}` : '/img/fa-solid-user.svg';
            html += `<div class="ado-lp-card" data-type="${item._type}" data-id="${isGroup ? item.id : item._index}" style="animation-delay:${i*60}ms"><div class="ado-lp-card-shimmer"></div><div class="ado-lp-card-image-container"><div class="ado-lp-card-glow"></div>${isGroup ? '<div class="ado-lp-card-avatar-group"></div>' : `<img src="${av}" alt="${item.name}" class="ado-lp-card-avatar" loading="lazy" onerror="this.src='/img/fa-solid-user.svg'">`}<div class="ado-lp-card-time-badge"><span>${fmt(item._sortDate)}</span></div></div><div class="ado-lp-card-content"><h3 class="ado-lp-card-name">${item.name||'Unnamed'}</h3>${isGroup?'<span class="ado-lp-card-badge">Group</span>':''}</div></div>`;
          });
          html += '</div>';
        }

        html += `</main><footer class="ado-lp-footer"><p>Select a character to continue</p></footer></div></div>`;
        container.innerHTML = html;

        container.querySelectorAll('.ado-lp-card').forEach(card => {
          card.addEventListener('click', async () => {
            try {
              if (card.dataset.type === 'group') { if (openGroupById) await openGroupById(card.dataset.id); }
              else { if (selectCharacterById) await selectCharacterById(String(card.dataset.id)); }
            } catch (e) { console.error(`[${MODULE_NAME}]`, e); }
          });
        });

        const toggleBtn = container.querySelector('#ado-lp-toggle');
        if (toggleBtn) {
          let vis = false;
          toggleBtn.addEventListener('click', () => {
            const s = document.querySelector('#sheld');
            if (s) { vis = !vis; s.style.opacity = vis ? '' : '0'; s.style.pointerEvents = vis ? '' : 'none'; toggleBtn.querySelector('span').textContent = vis ? 'Show Landing' : 'Show Sheld'; }
          });
        }
      } catch (err) {
        console.error(`[${MODULE_NAME}] Landing page error:`, err);
      }
    }

    eventSource.on(event_types.APP_READY, renderCustomLanding);
    eventSource.on(event_types.CHAT_CHANGED, renderCustomLanding);
    renderCustomLanding();

    // --- CHAT SHELD ---
    if (window.AdoHelperUI?.getStore) setChatSheldStoreRef(window.AdoHelperUI.getStore());
    let chatSheldCleanup = null;

    function manageChatSheld() {
      if (!isChatSheldEnabled()) {
        if (isChatSheldActive()) { deactivateChatSheld(); if (chatSheldCleanup) { chatSheldCleanup(); chatSheldCleanup = null; } }
        return;
      }
      const ctx = getContext();
      const isChatOpen = (ctx?.chatId !== undefined && ctx?.chatId !== null && ctx?.chatId !== '') || (ctx?.characterId === undefined && ctx?.name2 && ctx?.name2 === ctx?.neutralCharacterName);
      if (isChatOpen) {
        if (!isChatSheldActive()) {
          const c = activateChatSheld();
          if (c && window.AdoHelperUI?.mountChatSheld) chatSheldCleanup = window.AdoHelperUI.mountChatSheld(c);
          loadLoomBreakdowns();
        } else { resetStreamingState(); syncTailChat(); loadLoomBreakdowns(); }
      } else {
        if (isChatSheldActive()) { deactivateChatSheld(); if (chatSheldCleanup) { chatSheldCleanup(); chatSheldCleanup = null; } }
      }
    }

    eventSource.on(event_types.CHAT_CHANGED, manageChatSheld);
    eventSource.on(event_types.APP_READY, manageChatSheld);
  }

  if (window.AdoHelperUI?.getStore) {
    initCharacterBrowser(window.AdoHelperUI.getStore());
    initPersonaManager(window.AdoHelperUI.getStore());
  }

  const SlashCommandParser = getSlashCommandParser();
  const SlashCommand = getSlashCommand();
  if (SlashCommandParser && SlashCommand) {
    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
      name: "ado-settings",
      callback: async (_args, value) => {
        const store = window.AdoHelperUI?.getStore?.();
        if (!store) { toastr.warning("Ado Helper UI not loaded."); return "Not available."; }
        const view = (value || '').trim() || 'general';
        const ui = store.getState().ui || {};
        store.setState({ ui: { ...ui, settingsModal: { isOpen: true, activeView: view } } });
        return `Opened Ado Helper settings (${view}).`;
      },
      aliases: ["ado-helper", "ado"],
      helpString: "Open the Ado Helper settings modal.",
    }));
  }

  window.addEventListener('beforeunload', async () => {
    try { const { flushPendingSaves } = await import('./lib/settingsManager.js'); await flushPendingSaves(); } catch (e) {}
  });

});