import React, { useState, useMemo, useCallback, useSyncExternalStore } from 'react';
import { useSettings, useSelections, useLoomSelections, useAdoHelperActions, usePacks, saveToExtension, useAdoHelperStore } from '../store/AdoHelperContext';
import { exportPack } from './modals/PackEditorModal';
import { CollapsibleContent } from './Collapsible';
import { ChatPresetsPanel } from './panels/ChatPresets';
import { PresetBindingsPanel } from './panels/PresetBindings';
import clsx from 'clsx';
import { Eye, AlertTriangle, Download, Palette } from 'lucide-react';
import ConfirmationModal from './shared/ConfirmationModal';
import ThemePanel from './panels/ThemePanel';
import {
    Icons, ModeIcons,
    Panel, CollapsiblePanel, SelectionButton, ToolButton,
    ModeToggle, MacroItem, QuickActionsSection,
    LumiaPackItem, LoomPackItem, getLoomItemsFromPack,
} from './shared/settingsHelpers';

/* global AdoHelperBridge, toastr */

// Get the store for direct access
const store = useAdoHelperStore;

// Stable fallback constants for useSyncExternalStore
// CRITICAL: These must be defined outside components to prevent infinite loops
// Using inline `|| []` or `|| {}` creates new references each render
const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};
const DEFAULT_DRAWER_SETTINGS = { side: 'right', verticalPosition: 15, tabSize: 'large', panelWidthMode: 'default', customPanelWidth: 35 };

// Stable selector functions for useSyncExternalStore
const selectPresets = () => store.getState().presets || EMPTY_OBJECT;
const selectActivePresetName = () => store.getState().activePresetName;
const selectChimeraMode = () => store.getState().chimeraMode || false;
const selectCouncilMode = () => store.getState().councilMode || false;
const selectCouncilMembers = () => store.getState().councilMembers || EMPTY_ARRAY;
const selectSelectedDefinitions = () => store.getState().selectedDefinitions || EMPTY_ARRAY;
const selectShowDrawer = () => store.getState().showAdoHelperDrawer ?? true;
const selectDrawerSettings = () => store.getState().drawerSettings ?? DEFAULT_DRAWER_SETTINGS;
const selectEnableLandingPage = () => store.getState().enableLandingPage ?? true;
const selectLandingPageChatsDisplayed = () => store.getState().landingPageChatsDisplayed ?? 12;

/**
 * Main Settings Panel component - matching old HTML structure exactly
 */
function SettingsPanel() {
    const settings = useSettings();
    const selections = useSelections();
    const loomSelections = useLoomSelections();
    const actions = useAdoHelperActions();
    const { packs, customPacks, allPacks } = usePacks();

    // Track which custom pack is expanded to show Lumia items
    const [expandedPackId, setExpandedPackId] = useState(null);

    // Track collapsed state for pack sections (start expanded)
    const [sectionsCollapsed, setSectionsCollapsed] = useState({
        customPacks: false,
        downloadedPacks: false,
        loomPacks: false,
    });

    // State for Loom item delete confirmation modal
    const [loomDeleteConfirm, setLoomDeleteConfirm] = useState({
        isOpen: false,
        packName: null,
        item: null,
        itemName: null,
    });

    // State for Lumia item delete confirmation modal
    const [lumiaDeleteConfirm, setLumiaDeleteConfirm] = useState({
        isOpen: false,
        packName: null,
        item: null,
        itemName: null,
    });

    const toggleSection = useCallback((section) => {
        setSectionsCollapsed(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    }, []);

    // Subscribe to Chimera and Council mode state
    const chimeraMode = useSyncExternalStore(
        store.subscribe,
        selectChimeraMode,
        selectChimeraMode
    );
    const councilMode = useSyncExternalStore(
        store.subscribe,
        selectCouncilMode,
        selectCouncilMode
    );
    const councilMembers = useSyncExternalStore(
        store.subscribe,
        selectCouncilMembers,
        selectCouncilMembers
    );
    const selectedDefinitions = useSyncExternalStore(
        store.subscribe,
        selectSelectedDefinitions,
        selectSelectedDefinitions
    );

    // Check if council mode is active with members
    const isCouncilActive = councilMode && councilMembers.length > 0;

    // Handle mode toggles
    const handleChimeraModeChange = useCallback((enabled) => {
        actions.setChimeraMode(enabled);
        saveToExtension();
    }, [actions]);

    const handleCouncilModeChange = useCallback((enabled) => {
        actions.setCouncilMode(enabled);
        saveToExtension();
    }, [actions]);

    // Handle Clear All selections
    const handleClearAll = useCallback(() => {
        actions.clearSelections();
        saveToExtension();
        if (typeof toastr !== 'undefined') {
            toastr.info('All Lumia selections cleared');
        }
    }, [actions]);

    // Handle pack deletion
    const handleDeletePack = useCallback((packName) => {
        if (!confirm(`Are you sure you want to delete "${packName}"?`)) {
            return;
        }
        actions.removePack(packName);
        saveToExtension();
        if (typeof toastr !== 'undefined') {
            toastr.success(`Pack "${packName}" deleted`);
        }
    }, [actions]);

    // Open Loom item delete confirmation
    const openLoomDeleteConfirm = useCallback((packName, item, itemName) => {
        setLoomDeleteConfirm({
            isOpen: true,
            packName,
            item,
            itemName,
        });
    }, []);

    // Handle Loom item deletion after confirmation
    const handleDeleteLoomItem = useCallback(() => {
        const { packName, item, itemName } = loomDeleteConfirm;
        if (!packName || !item) return;

        // Find the pack and remove the item
        const packIndex = allPacks.findIndex(p => (p.name || p.packName) === packName);
        if (packIndex === -1) {
            console.error('[SettingsPanel] Pack not found:', packName);
            setLoomDeleteConfirm({ isOpen: false, packName: null, item: null, itemName: null });
            return;
        }

        const pack = allPacks[packIndex];
        const loomItemName = item.loomName || item.itemName || item.name;

        // Remove from loomItems array (v2 schema)
        if (pack.loomItems && Array.isArray(pack.loomItems)) {
            const newLoomItems = pack.loomItems.filter(li => 
                (li.loomName || li.itemName || li.name) !== loomItemName
            );
            actions.updatePackLoomItems(packName, newLoomItems);
        }

        // Also remove from legacy arrays if present
        if (pack.loomStyles && Array.isArray(pack.loomStyles)) {
            const filtered = pack.loomStyles.filter(li => 
                (li.loomName || li.itemName || li.name) !== loomItemName
            );
            if (filtered.length !== pack.loomStyles.length) {
                actions.updatePackField(packName, 'loomStyles', filtered);
            }
        }
        if (pack.loomUtils && Array.isArray(pack.loomUtils)) {
            const filtered = pack.loomUtils.filter(li => 
                (li.loomName || li.itemName || li.name) !== loomItemName
            );
            if (filtered.length !== pack.loomUtils.length) {
                actions.updatePackField(packName, 'loomUtils', filtered);
            }
        }
        if (pack.loomRetrofits && Array.isArray(pack.loomRetrofits)) {
            const filtered = pack.loomRetrofits.filter(li => 
                (li.loomName || li.itemName || li.name) !== loomItemName
            );
            if (filtered.length !== pack.loomRetrofits.length) {
                actions.updatePackField(packName, 'loomRetrofits', filtered);
            }
        }

        // Remove from legacy mixed items array
        if (pack.items && Array.isArray(pack.items)) {
            const filtered = pack.items.filter(li => {
                if (!li.loomCategory && !li.category) return true; // Keep non-loom items
                return (li.loomName || li.itemName || li.name) !== loomItemName;
            });
            if (filtered.length !== pack.items.length) {
                actions.updatePackField(packName, 'items', filtered);
            }
        }

        saveToExtension();
        if (typeof toastr !== 'undefined') {
            toastr.success(`Deleted "${itemName}"`);
        }

        // Close the modal
        setLoomDeleteConfirm({ isOpen: false, packName: null, item: null, itemName: null });
    }, [loomDeleteConfirm, allPacks, actions]);

    // Cancel Loom item deletion
    const cancelLoomDelete = useCallback(() => {
        setLoomDeleteConfirm({ isOpen: false, packName: null, item: null, itemName: null });
    }, []);

    // Open Lumia item delete confirmation
    const openLumiaDeleteConfirm = useCallback((packName, item, itemName) => {
        setLumiaDeleteConfirm({
            isOpen: true,
            packName,
            item,
            itemName,
        });
    }, []);

    // Handle Lumia item deletion after confirmation
    const handleDeleteLumiaItem = useCallback(() => {
        const { packName, item, itemName } = lumiaDeleteConfirm;
        if (!packName || !item) return;

        // Find the pack and remove the item
        const packIndex = allPacks.findIndex(p => (p.name || p.packName) === packName);
        if (packIndex === -1) {
            console.error('[SettingsPanel] Pack not found:', packName);
            setLumiaDeleteConfirm({ isOpen: false, packName: null, item: null, itemName: null });
            return;
        }

        const pack = allPacks[packIndex];
        const lumiaItemName = item.lumiaName || item.lumiaDefName;

        // Remove from lumiaItems array (v2 schema)
        if (pack.lumiaItems && Array.isArray(pack.lumiaItems)) {
            const newLumiaItems = pack.lumiaItems.filter(li => 
                (li.lumiaName || li.lumiaDefName) !== lumiaItemName
            );
            actions.updatePackField(packName, 'lumiaItems', newLumiaItems);
        }

        // Also remove from legacy items array if present
        if (pack.items && Array.isArray(pack.items)) {
            const filtered = pack.items.filter(li => {
                // Only filter out lumia items (those with lumiaDefName), not loom items
                if (!li.lumiaDefName && !li.lumiaName) return true; // Keep non-lumia items
                return (li.lumiaName || li.lumiaDefName) !== lumiaItemName;
            });
            if (filtered.length !== pack.items.length) {
                actions.updatePackField(packName, 'items', filtered);
            }
        }

        saveToExtension();
        if (typeof toastr !== 'undefined') {
            toastr.success(`Deleted "${itemName}"`);
        }

        // Close the modal
        setLumiaDeleteConfirm({ isOpen: false, packName: null, item: null, itemName: null });
    }, [lumiaDeleteConfirm, allPacks, actions]);

    // Cancel Lumia item deletion
    const cancelLumiaDelete = useCallback(() => {
        setLumiaDeleteConfirm({ isOpen: false, packName: null, item: null, itemName: null });
    }, []);

    // Toggle pack expansion
    const togglePackExpansion = useCallback((packId) => {
        setExpandedPackId(prev => prev === packId ? null : packId);
    }, []);

    // Calculate stats
    const totalPacks = allPacks.length;
    const totalItems = useMemo(() => {
        return allPacks.reduce((sum, pack) => {
            // New format: lumiaItems + loomItems
            const lumiaCount = pack.lumiaItems?.length || 0;
            const loomCount = pack.loomItems?.length || 0;
            // Legacy format: items array
            const legacyCount = pack.items?.length || 0;
            // Use new format counts if available, otherwise legacy
            return sum + (lumiaCount + loomCount > 0 ? lumiaCount + loomCount : legacyCount);
        }, 0);
    }, [allPacks]);

    // Memoize loom packs filter to avoid IIFE in render
    const loomPacks = useMemo(() => {
        return packs.filter(pack => {
            // New format: loomItems array
            if (pack.loomItems?.length > 0) return true;
            // Check legacy structure
            if (pack.loomStyles?.length > 0) return true;
            if (pack.loomUtils?.length > 0) return true;
            if (pack.loomRetrofits?.length > 0) return true;
            // Check items array with loomCategory
            if (pack.items?.some(item => item.loomCategory)) return true;
            return false;
        });
    }, [packs]);

    // Call extension callbacks if available
    const callExtensionCallback = useCallback((name, ...args) => {
        if (typeof AdoHelperBridge !== 'undefined') {
            const callbacks = AdoHelperBridge.getCallbacks();
            if (callbacks && callbacks[name]) {
                callbacks[name](...args);
            }
        }
    }, []);

    // Handle JSON file upload
    const handleFileUpload = useCallback((event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Call the extension's handleNewBook callback
                if (typeof AdoHelperBridge !== 'undefined') {
                    const callbacks = AdoHelperBridge.getCallbacks();

                    if (callbacks && callbacks.handleNewBook) {
                        // MUST await since handleNewBook is async - ensures pack is in cache before continuing
                        await callbacks.handleNewBook(data, file.name, false);
                        // Refresh the UI after import is fully complete
                        if (callbacks.refreshUIDisplay) {
                            callbacks.refreshUIDisplay();
                        }
                    } else {
                        console.error('[SettingsPanel] handleNewBook callback not registered');
                        if (typeof toastr !== 'undefined') {
                            toastr.error('Import function not available. Please reload the page.');
                        }
                    }
                } else {
                    console.error('[SettingsPanel] AdoHelperBridge not available');
                    if (typeof toastr !== 'undefined') {
                        toastr.error('Bridge not available. Please reload the page.');
                    }
                }
            } catch (error) {
                console.error('[SettingsPanel] Failed to parse JSON:', error);
                if (typeof toastr !== 'undefined') {
                    toastr.error('Failed to parse JSON: ' + error.message);
                }
            }
        };
        reader.onerror = () => {
            console.error('[SettingsPanel] Failed to read file');
            if (typeof toastr !== 'undefined') {
                toastr.error('Failed to read file');
            }
        };
        reader.readAsText(file);

        // Reset the input so the same file can be selected again
        event.target.value = '';
    }, []);

    // Get drawer visibility setting from store
    const showDrawer = useSyncExternalStore(
        store.subscribe,
        selectShowDrawer,
        selectShowDrawer
    );

    // Get drawer settings from store
    const drawerSettings = useSyncExternalStore(
        store.subscribe,
        selectDrawerSettings,
        selectDrawerSettings
    );

    // Get landing page setting from store
    const enableLandingPage = useSyncExternalStore(
        store.subscribe,
        selectEnableLandingPage,
        selectEnableLandingPage
    );
    const landingPageChatsDisplayed = useSyncExternalStore(
        store.subscribe,
        selectLandingPageChatsDisplayed,
        selectLandingPageChatsDisplayed
    );

    // Handle drawer toggle
    const handleDrawerToggle = useCallback((enabled) => {
        store.setState({ showAdoHelperDrawer: enabled });
        saveToExtension();
    }, []);

    // Handle landing page toggle
    const handleLandingPageToggle = useCallback((enabled) => {
        store.setState({ enableLandingPage: enabled });
        saveToExtension();
    }, []);

    const handleChatsDisplayedChange = useCallback((value) => {
        store.setState({ landingPageChatsDisplayed: parseInt(value, 10) || 12 });
        saveToExtension();
    }, []);

    // Handle nuclear reset - wipe all settings and reload
    const handleNuclearReset = useCallback(() => {
        const confirmed = window.confirm(
            'WARNING: This will completely reset ALL Ado Helper settings to defaults.\n\n' +
            'This includes:\n' +
            '- All downloaded packs\n' +
            '- All custom packs\n' +
            '- All Lumia and Loom selections\n' +
            '- All presets\n' +
            '- All advanced settings\n\n' +
            'The page will reload after reset.\n\n' +
            'Are you sure you want to continue?'
        );

        if (confirmed) {
            if (typeof AdoHelperBridge !== 'undefined' && AdoHelperBridge.resetAllSettings) {
                if (typeof toastr !== 'undefined') {
                    toastr.warning('Resetting all settings...');
                }
                AdoHelperBridge.resetAllSettings();
            } else {
                console.error('[SettingsPanel] resetAllSettings not available on bridge');
                if (typeof toastr !== 'undefined') {
                    toastr.error('Reset function not available. Please reload the page.');
                }
            }
        }
    }, []);

    // Handle drawer side change
    const handleDrawerSideChange = useCallback((side) => {
        store.setState({
            drawerSettings: {
                ...store.getState().drawerSettings,
                side,
            }
        });
        saveToExtension();
    }, []);

    // Handle vertical position change
    const handleVerticalPositionChange = useCallback((value) => {
        const verticalPosition = Math.max(0, Math.min(100, parseInt(value, 10) || 0));
        store.setState({
            drawerSettings: {
                ...store.getState().drawerSettings,
                verticalPosition,
            }
        });
        saveToExtension();
    }, []);

    // Handle tab size change
    const handleTabSizeChange = useCallback((tabSize) => {
        store.setState({
            drawerSettings: {
                ...store.getState().drawerSettings,
                tabSize,
            }
        });
        saveToExtension();
    }, []);

    // Handle panel width mode change
    const handlePanelWidthModeChange = useCallback((panelWidthMode) => {
        store.setState({
            drawerSettings: {
                ...store.getState().drawerSettings,
                panelWidthMode,
            }
        });
        saveToExtension();
    }, []);

    // Handle custom panel width change
    const handleCustomPanelWidthChange = useCallback((value) => {
        const customPanelWidth = Math.max(25, Math.min(60, parseInt(value, 10) || 35));
        store.setState({
            drawerSettings: {
                ...store.getState().drawerSettings,
                customPanelWidth,
            }
        });
        saveToExtension();
    }, []);

    return (
        <div className="ado-helper-settings">
            {/* Drawer Toggle */}
            <div className="ado-drawer-toggle-container">
                <label className="ado-toggle-wrapper">
                    <div className="ado-toggle-text">
                        <span className="ado-toggle-label">Show Ado Helper Drawer</span>
                        <span className="ado-toggle-description">
                            Access quick settings from a slide-out panel
                        </span>
                    </div>
                    <div className={clsx('ado-toggle', showDrawer && 'ado-toggle--on')}>
                        <input
                            type="checkbox"
                            className="ado-toggle-input"
                            checked={showDrawer}
                            onChange={(e) => handleDrawerToggle(e.target.checked)}
                        />
                        <span className="ado-toggle-slider"></span>
                    </div>
                </label>
            </div>

            {/* Drawer Position Settings - only show when drawer is enabled */}
            {showDrawer && (
                <div className="ado-drawer-settings-container">
                    <div className="ado-drawer-settings-row">
                        <div className="ado-drawer-setting">
                            <label className="ado-drawer-setting-label">Drawer Side</label>
                            <div className="ado-drawer-side-toggle">
                                <button
                                    type="button"
                                    className={clsx(
                                        'ado-side-btn',
                                        drawerSettings.side === 'left' && 'ado-side-btn--active'
                                    )}
                                    onClick={() => handleDrawerSideChange('left')}
                                >
                                    Left
                                </button>
                                <button
                                    type="button"
                                    className={clsx(
                                        'ado-side-btn',
                                        drawerSettings.side === 'right' && 'ado-side-btn--active'
                                    )}
                                    onClick={() => handleDrawerSideChange('right')}
                                >
                                    Right
                                </button>
                            </div>
                        </div>
                        <div className="ado-drawer-setting">
                            <label htmlFor="ado-drawer-vpos" className="ado-drawer-setting-label">
                                Tab Position
                            </label>
                            <div className="ado-drawer-vpos-input">
                                <input
                                    type="range"
                                    id="ado-drawer-vpos"
                                    className="ado-slider"
                                    value={drawerSettings.verticalPosition}
                                    onChange={(e) => handleVerticalPositionChange(e.target.value)}
                                    min="8"
                                    max="85"
                                />
                                <span className="ado-drawer-vpos-value">{drawerSettings.verticalPosition}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="ado-drawer-settings-row">
                        <div className="ado-drawer-setting">
                            <label className="ado-drawer-setting-label">Tab Size</label>
                            <div className="ado-drawer-side-toggle">
                                <button
                                    type="button"
                                    className={clsx(
                                        'ado-side-btn',
                                        drawerSettings.tabSize === 'large' && 'ado-side-btn--active'
                                    )}
                                    onClick={() => handleTabSizeChange('large')}
                                >
                                    Large
                                </button>
                                <button
                                    type="button"
                                    className={clsx(
                                        'ado-side-btn',
                                        drawerSettings.tabSize === 'compact' && 'ado-side-btn--active'
                                    )}
                                    onClick={() => handleTabSizeChange('compact')}
                                >
                                    Compact
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="ado-drawer-settings-row">
                        <div className="ado-drawer-setting" style={{ flex: 1 }}>
                            <label className="ado-drawer-setting-label">Panel Width</label>
                            <div className="ado-drawer-side-toggle">
                                <button
                                    type="button"
                                    className={clsx(
                                        'ado-side-btn',
                                        (drawerSettings.panelWidthMode || 'default') === 'default' && 'ado-side-btn--active'
                                    )}
                                    onClick={() => handlePanelWidthModeChange('default')}
                                >
                                    Default
                                </button>
                                <button
                                    type="button"
                                    className={clsx(
                                        'ado-side-btn',
                                        drawerSettings.panelWidthMode === 'stChat' && 'ado-side-btn--active'
                                    )}
                                    onClick={() => handlePanelWidthModeChange('stChat')}
                                    title="Match SillyTavern's chat column width"
                                >
                                    ST Chat
                                </button>
                                <button
                                    type="button"
                                    className={clsx(
                                        'ado-side-btn',
                                        drawerSettings.panelWidthMode === 'custom' && 'ado-side-btn--active'
                                    )}
                                    onClick={() => handlePanelWidthModeChange('custom')}
                                >
                                    Custom
                                </button>
                            </div>
                        </div>
                    </div>
                    {drawerSettings.panelWidthMode === 'custom' && (
                        <div className="ado-drawer-settings-row">
                            <div className="ado-drawer-setting" style={{ flex: 1 }}>
                                <label htmlFor="ado-drawer-panel-width" className="ado-drawer-setting-label">
                                    Custom Width
                                </label>
                                <div className="ado-drawer-vpos-input">
                                    <input
                                        type="range"
                                        id="ado-drawer-panel-width"
                                        className="ado-slider"
                                        value={drawerSettings.customPanelWidth || 35}
                                        onChange={(e) => handleCustomPanelWidthChange(e.target.value)}
                                        min="25"
                                        max="60"
                                    />
                                    <span className="ado-drawer-vpos-value">{drawerSettings.customPanelWidth || 35}%</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Landing Page Toggle */}
            <div className="ado-drawer-toggle-container">
                <label className="ado-toggle-wrapper">
                    <div className="ado-toggle-text">
                        <span className="ado-toggle-label">Custom Landing Page</span>
                        <span className="ado-toggle-description">
                            Show Ado Helper recent chats on the home screen
                        </span>
                    </div>
                    <div className={clsx('ado-toggle', enableLandingPage && 'ado-toggle--on')}>
                        <input
                            type="checkbox"
                            className="ado-toggle-input"
                            checked={enableLandingPage}
                            onChange={(e) => handleLandingPageToggle(e.target.checked)}
                        />
                        <span className="ado-toggle-slider"></span>
                    </div>
                </label>
                {enableLandingPage && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '4px' }}>
                        <span style={{ fontSize: '0.9em', opacity: 0.8 }}>Chats Displayed:</span>
                        <input
                            type="number"
                            className="ado-input ado-input-sm"
                            style={{ width: '60px' }}
                            value={landingPageChatsDisplayed}
                            onChange={(e) => handleChatsDisplayedChange(e.target.value)}
                            min="1"
                            max="50"
                        />
                    </div>
                )}
            </div>

            {/* Theme Customization */}
            <Panel title="Theme" icon={<Palette size={16} strokeWidth={1.5} />} collapsible>
                <ThemePanel />
            </Panel>

            {/* Lumia DLC Packs Section */}
            <Panel title="Lumia DLC Packs" icon={Icons.book}>
                <div className="ado-status-badge">
                    {totalPacks > 0
                        ? `${totalPacks} pack${totalPacks !== 1 ? 's' : ''} loaded (${totalItems} items)`
                        : 'No packs loaded'}
                </div>

                <div className="ado-input-row">
                    <input
                        type="text"
                        className="ado-input"
                        placeholder="Enter Lumia DLC Pack URL (JSON)"
                        id="ado-url-input-react"
                    />
                    <button
                        className="ado-btn ado-btn-primary"
                        onClick={() => callExtensionCallback('fetchWorldBook')}
                        type="button"
                    >
                        Fetch
                    </button>
                </div>

                <div className="ado-source-actions">
                    <div className="ado-divider-text">or</div>

                    <button
                        className="ado-btn ado-btn-secondary ado-btn-full"
                        onClick={() => document.getElementById('ado-file-input-react')?.click()}
                        type="button"
                    >
                        {Icons.upload}
                        Upload JSON File
                    </button>
                    <input
                        type="file"
                        id="ado-file-input-react"
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />

                    <div className="ado-divider-text">or</div>

                    <button
                        className="ado-btn ado-btn-primary ado-btn-full"
                        onClick={() => actions.openModal('lucidCards')}
                        type="button"
                    >
                        {Icons.box}
                        Browse Lucid Cards
                    </button>
                </div>
            </Panel>

            {/* Chat Presets - Download from Lucid.cards */}
            <Panel title="Chat Presets" icon={<Download size={16} strokeWidth={1.5} />}>
                <ChatPresetsPanel />
            </Panel>

            {/* Preset Bindings - Auto-switch presets per character/chat */}
            <Panel title="Preset Bindings" icon={Icons.layers}>
                <PresetBindingsPanel />
            </Panel>

            {/* Lumia Configuration Section */}
            <Panel
                title="Lumia Configuration"
                icon={Icons.settings}
                action={
                    <button
                        className="ado-clear-all-btn"
                        onClick={handleClearAll}
                        title="Clear all Lumia selections"
                        type="button"
                    >
                        <Trash2 size={14} strokeWidth={1.5} />
                        Clear All
                    </button>
                }
            >
                {/* Mode Toggles */}
                <div className="ado-mode-toggles">
                    <ModeToggle
                        icon={ModeIcons.chimera}
                        label="Chimera Mode"
                        description="Fuse multiple physical definitions"
                        checked={chimeraMode}
                        onChange={handleChimeraModeChange}
                        disabled={councilMode}
                    />
                    <ModeToggle
                        icon={ModeIcons.council}
                        label="Council Mode"
                        description="Multiple independent Lumias"
                        checked={councilMode}
                        onChange={handleCouncilModeChange}
                        disabled={chimeraMode}
                    />
                </div>

                {/* Quick Actions: Council Config + Preset Management */}
                <QuickActionsSection
                    councilMode={councilMode}
                    councilMembers={councilMembers}
                    onOpenCouncil={() => actions.openModal('councilSelect')}
                    actions={actions}
                />

                <div className={clsx('ado-selector-group', isCouncilActive && 'ado-selector-group--disabled')}>
                    <SelectionButton
                        label={chimeraMode ? "Chimera Definitions" : "Definition"}
                        hint={chimeraMode ? "Select Multiple" : "Select One"}
                        selections={chimeraMode ? selectedDefinitions : (selections.definition ? [selections.definition] : [])}
                        modalName="definitions"
                    />

                    <SelectionButton
                        label="Behaviors"
                        hint="Select Multiple"
                        selections={selections.behaviors}
                        dominant={selections.dominantBehavior}
                        modalName="behaviors"
                    />

                    <SelectionButton
                        label="Personalities"
                        hint="Select Multiple"
                        selections={selections.personalities}
                        dominant={selections.dominantPersonality}
                        modalName="personalities"
                    />
                </div>
            </Panel>

            {/* Loom Configuration Section */}
            <Panel title="Loom Configuration" icon={Icons.layers}>
                <div className="ado-selector-group">
                    <SelectionButton
                        label="Narrative Style"
                        hint="Select Multiple"
                        selections={loomSelections.styles}
                        modalName="loomStyles"
                    />

                    <SelectionButton
                        label="Loom Utilities"
                        hint="Select Multiple"
                        selections={loomSelections.utilities}
                        modalName="loomUtilities"
                    />

                    <SelectionButton
                        label="Retrofits"
                        hint="Select Multiple"
                        selections={loomSelections.retrofits}
                        modalName="loomRetrofits"
                    />
                </div>
            </Panel>

            {/* Tools Section */}
            <Panel title="Tools" icon={Icons.tools}>
                <div className="ado-tools-row">
                    <ToolButton
                        icon={Icons.dots}
                        label="OOC Settings"
                        onClick={() => actions.openSettingsModal('ooc')}
                    />
                    <ToolButton
                        icon={Icons.lines}
                        label="Summarization"
                        onClick={() => actions.openSettingsModal('summarization')}
                    />
                    <ToolButton
                        icon={Icons.edit}
                        label="Prompt Settings"
                        onClick={() => actions.openSettingsModal('promptSettings')}
                    />
                </div>
            </Panel>

            {/* Macro Reference (Collapsible) */}
            <CollapsiblePanel title="Macro Reference" icon={Icons.terminal}>
                <div className="ado-macro-group">
                    <div className="ado-macro-group-title">Lumia Content</div>
                    <div className="ado-macro-list">
                        <MacroItem code="{{lumiaDef}}" description="Physical Definition" />
                        <MacroItem code="{{lumiaBehavior}}" description="Behavior(s)" />
                        <MacroItem code="{{lumiaPersonality}}" description="Personality(s)" />
                        <MacroItem code="{{lumiaCouncilModeActive}}" description="Yes/No status indicator, (conditional ready)" />
                    </div>
                </div>

                <div className="ado-macro-group">
                    <div className="ado-macro-group-title">Loom Content</div>
                    <div className="ado-macro-list">
                        <MacroItem code="{{loomStyle}}" description="Narrative Style" />
                        <MacroItem code="{{loomUtils}}" description="Loom Utilities" />
                        <MacroItem code="{{loomRetrofits}}" description="Retrofits" />
                    </div>
                </div>

                <div className="ado-macro-group">
                    <div className="ado-macro-group-title">Random Lumia</div>
                    <div className="ado-macro-list">
                        <MacroItem code="{{randomLumia}}" description="Random definition" />
                        <MacroItem code="{{randomLumia.pers}}" description="Random personality" />
                        <MacroItem code="{{randomLumia.behav}}" description="Random behavior" />
                        <MacroItem code="{{randomLumia.name}}" description="Random name" />
                    </div>
                </div>

                <div className="ado-macro-group">
                    <div className="ado-macro-group-title">Tracking & OOC</div>
                    <div className="ado-macro-list">
                        <MacroItem code="{{lumiaMessageCount}}" description="Message count" />
                        <MacroItem code="{{lumiaOOCTrigger}}" description="OOC trigger/countdown" />
                    </div>
                </div>

                <div className="ado-macro-group">
                    <div className="ado-macro-group-title">Summarization</div>
                    <div className="ado-macro-list">
                        <MacroItem code="{{loomSummary}}" description="Stored summary" />
                        <MacroItem code="{{loomSummaryPrompt}}" description="Summary directive" />
                        <MacroItem code="/loom-summarize" description="Manual trigger" />
                    </div>
                </div>

                <div className="ado-macro-group">
                    <div className="ado-macro-group-title">Message History</div>
                    <div className="ado-macro-list">
                        <MacroItem code="{{loomLastUserMessage}}" description="Last user message content" />
                        <MacroItem code="{{loomLastCharMessage}}" description="Last character message content" />
                        <MacroItem code="{{lastMessageName}}" description="Name of whoever sent the last message" />
                    </div>
                </div>

                <div className="ado-macro-group">
                    <div className="ado-macro-group-title">Sovereign Hand</div>
                    <div className="ado-macro-list">
                        <MacroItem code="{{loomSovHand}}" description="Full Sovereign Hand prompt (with user message)" />
                        <MacroItem code="{{loomSovHandActive}}" description="Yes/No status indicator (conditional ready)" />
                        <MacroItem code="{{loomContinuePrompt}}" description="Continue-scene prompt when character spoke last" />
                    </div>
                </div>
            </CollapsiblePanel>

            {/* Custom Packs Section (only if custom packs exist) */}
            {customPacks.length > 0 && (
                <Panel
                    title="Custom Packs"
                    icon={Icons.package}
                    collapsible
                    collapsed={sectionsCollapsed.customPacks}
                    onToggle={() => toggleSection('customPacks')}
                >
                    <div className="ado-custom-packs">
                        {customPacks.map((pack) => {
                            // Use pack.name as fallback if pack.id is undefined
                            const packKey = pack.id || pack.name;
                            const isExpanded = expandedPackId === packKey;
                            // Support both new format (lumiaItems) and legacy format (items)
                            const lumiaItems = pack.lumiaItems?.length > 0
                                ? pack.lumiaItems
                                : (pack.items?.filter(item => item.lumiaDefName) || []);
                            // Get Loom items using the helper function
                            const loomItems = getLoomItemsFromPack(pack);
                            const hasAnyItems = lumiaItems.length > 0 || loomItems.length > 0;

                            return (
                                <motion.div
                                    key={packKey}
                                    className={clsx('ado-pack-item-container', isExpanded && 'ado-pack-item-container--expanded')}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {/* Pack header row */}
                                    <div className="ado-pack-item">
                                        <button
                                            className="ado-pack-expand-btn"
                                            onClick={() => togglePackExpansion(packKey)}
                                            type="button"
                                            title={isExpanded ? 'Collapse' : 'Expand to see items'}
                                        >
                                            <span className={clsx('ado-pack-chevron', isExpanded && 'ado-pack-chevron--expanded')}>
                                                {Icons.chevronDown}
                                            </span>
                                        </button>
                                        <span
                                            className="ado-pack-name"
                                            onClick={() => togglePackExpansion(packKey)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {pack.name}
                                        </span>
                                        <div className="ado-pack-counts">
                                            <span className="ado-pack-count">
                                                {lumiaItems.length} Lumia{lumiaItems.length !== 1 ? 's' : ''}
                                            </span>
                                            {loomItems.length > 0 && (
                                                <span className="ado-pack-count ado-pack-count-loom">
                                                    <Layers size={12} strokeWidth={1.5} />
                                                    {loomItems.length} Loom
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            className="ado-btn ado-btn-icon"
                                            onClick={() => exportPack(pack)}
                                            title="Export as Ado Helper Pack"
                                            type="button"
                                        >
                                            {Icons.download}
                                        </button>
                                        <button
                                            className="ado-btn ado-btn-icon"
                                            onClick={() => actions.openModal('packEditor', { packId: packKey })}
                                            title="Edit pack"
                                            type="button"
                                        >
                                            {Icons.edit}
                                        </button>
                                    </div>

                                    {/* Expanded Lumia items list */}
                                    <CollapsibleContent
                                        isOpen={isExpanded && lumiaItems.length > 0}
                                        className="ado-pack-items-list"
                                        duration={200}
                                    >
                                        <div className="ado-pack-section-header">Lumia Characters</div>
                                        {lumiaItems.map((item, index) => (
                                            <LumiaPackItem
                                                key={item.lumiaDefName || item.lumiaName || index}
                                                item={item}
                                                packName={pack.name}
                                                onEdit={(pn, it) => actions.openModal('lumiaEditor', {
                                                    packName: pn,
                                                    editingItem: it
                                                })}
                                                onDelete={openLumiaDeleteConfirm}
                                                editIcon={Icons.edit}
                                            />
                                        ))}
                                    </CollapsibleContent>

                                    {/* Expanded Loom items list */}
                                    <CollapsibleContent
                                        isOpen={isExpanded && loomItems.length > 0}
                                        className="ado-pack-items-list"
                                        duration={200}
                                    >
                                        <div className="ado-pack-section-header">Loom Items</div>
                                        {loomItems.map((item, index) => (
                                            <LoomPackItem
                                                key={item.loomName || item.itemName || item.name || index}
                                                item={item}
                                                packName={pack.name}
                                                onEdit={(pn, it) => actions.openModal('loomEditor', {
                                                    packName: pn,
                                                    editingItem: it
                                                })}
                                                onDelete={openLoomDeleteConfirm}
                                                editIcon={Icons.edit}
                                            />
                                        ))}
                                    </CollapsibleContent>

                                    {/* Empty state when no items at all */}
                                    <CollapsibleContent
                                        isOpen={isExpanded && !hasAnyItems}
                                        className="ado-pack-items-empty"
                                        duration={200}
                                    >
                                        <span>No items in this pack yet</span>
                                    </CollapsibleContent>
                                </motion.div>
                            );
                        })}
                    </div>
                </Panel>
            )}

            {/* Downloaded Packs Section (non-custom packs) */}
            {packs.length > 0 && (
                <Panel
                    title="Downloaded Packs"
                    icon={Icons.box}
                    collapsible
                    collapsed={sectionsCollapsed.downloadedPacks}
                    onToggle={() => toggleSection('downloadedPacks')}
                >
                    <div className="ado-downloaded-packs">
                        {packs.map((pack) => {
                            const packName = pack.name || pack.packName || 'Unknown Pack';
                            // Support both new format (lumiaItems) and legacy format (items)
                            const lumiaItems = pack.lumiaItems?.length > 0
                                ? pack.lumiaItems
                                : (pack.items?.filter(item => item.lumiaDefName && item.lumiaDef) || []);
                            const coverUrl = pack.coverUrl || pack.packCover;

                            return (
                                <div key={packName} className="ado-downloaded-pack-item">
                                    {coverUrl ? (
                                        <img
                                            src={coverUrl}
                                            alt={packName}
                                            className="ado-downloaded-pack-cover"
                                        />
                                    ) : (
                                        <div className="ado-downloaded-pack-cover-placeholder">
                                            {Icons.package}
                                        </div>
                                    )}
                                    <div className="ado-downloaded-pack-info">
                                        <span className="ado-downloaded-pack-name">{packName}</span>
                                        <span className="ado-downloaded-pack-count">
                                            {lumiaItems.length} Lumia{lumiaItems.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="ado-downloaded-pack-actions">
                                        <button
                                            className="ado-btn ado-btn-icon"
                                            onClick={() => actions.openPackDetail(packName)}
                                            title="View pack contents"
                                            type="button"
                                        >
                                            <Eye size={16} strokeWidth={1.5} />
                                        </button>
                                        <button
                                            className="ado-btn ado-btn-icon ado-btn-icon-danger"
                                            onClick={() => handleDeletePack(packName)}
                                            title="Delete pack"
                                            type="button"
                                        >
                                            <Trash2 size={16} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Panel>
            )}

            {/* Loom Packs Section (packs with Loom items) */}
            {loomPacks.length > 0 && (
                <Panel
                    title="Loom Packs"
                    icon={Icons.layers}
                    collapsible
                    collapsed={sectionsCollapsed.loomPacks}
                    onToggle={() => toggleSection('loomPacks')}
                >
                    <div className="ado-loom-packs">
                        {loomPacks.map((pack) => {
                            const packName = pack.name || pack.packName || 'Unknown Pack';

                            // Count loom items by category
                            let styles = pack.loomStyles?.length || 0;
                            let utilities = pack.loomUtils?.length || 0;
                            let retrofits = pack.loomRetrofits?.length || 0;

                            // Helper to count by category
                            const countByCategory = (item) => {
                                const cat = item.loomCategory || item.category;
                                if (cat === 'Narrative Style' || cat === 'loomStyles') styles++;
                                else if (cat === 'Loom Utilities' || cat === 'loomUtils') utilities++;
                                else if (cat === 'Retrofits' || cat === 'loomRetrofits') retrofits++;
                            };

                            // v2 schema: loomItems array
                            if (pack.loomItems) {
                                pack.loomItems.forEach(countByCategory);
                            }

                            // Legacy: mixed items array with loomCategory
                            if (pack.items) {
                                pack.items.forEach(item => {
                                    if (item.loomCategory || item.category) {
                                        countByCategory(item);
                                    }
                                });
                            }

                            return (
                                <div key={packName} className="ado-loom-pack-item">
                                    {pack.packCover ? (
                                        <img
                                            src={pack.packCover}
                                            alt={packName}
                                            className="ado-loom-pack-cover"
                                        />
                                    ) : (
                                        <div className="ado-loom-pack-cover-placeholder">
                                            {Icons.layers}
                                        </div>
                                    )}
                                    <div className="ado-loom-pack-info">
                                        <span className="ado-loom-pack-name">{packName}</span>
                                        <div className="ado-loom-pack-stats">
                                            {styles > 0 && (
                                                <span><Sparkles size={10} /> {styles}</span>
                                            )}
                                            {utilities > 0 && (
                                                <span><Wrench size={10} /> {utilities}</span>
                                            )}
                                            {retrofits > 0 && (
                                                <span><Layers size={10} /> {retrofits}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="ado-loom-pack-actions">
                                        <button
                                            className="ado-btn ado-btn-icon"
                                            onClick={() => actions.openLoomPackDetail(packName)}
                                            title="View loom contents"
                                            type="button"
                                        >
                                            <Eye size={16} strokeWidth={1.5} />
                                        </button>
                                        <button
                                            className="ado-btn ado-btn-icon ado-btn-icon-danger"
                                            onClick={() => handleDeletePack(packName)}
                                            title="Delete pack"
                                            type="button"
                                        >
                                            <Trash2 size={16} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Panel>
            )}

            {/* Danger Zone - Reset Settings */}
            <CollapsiblePanel
                title="Danger Zone"
                icon={<AlertTriangle size={16} strokeWidth={1.5} />}
            >
                <div className="ado-danger-zone">
                    <p className="ado-danger-zone-description">
                        If you're experiencing issues with the extension, you can reset all settings to their defaults.
                        This will remove all packs, selections, and configurations.
                    </p>
                    <button
                        className="ado-btn ado-btn-danger ado-btn-full"
                        onClick={handleNuclearReset}
                        type="button"
                    >
                        <AlertTriangle size={16} strokeWidth={1.5} />
                        Reset All Settings
                    </button>
                </div>
            </CollapsiblePanel>

            {/* Loom Item Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={loomDeleteConfirm.isOpen}
                onConfirm={handleDeleteLoomItem}
                onCancel={cancelLoomDelete}
                title="Delete Loom Item"
                message={`Are you sure you want to delete "${loomDeleteConfirm.itemName}"? This action cannot be undone.`}
                variant="danger"
                confirmText="Delete"
                cancelText="Cancel"
            />

            {/* Lumia Item Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={lumiaDeleteConfirm.isOpen}
                onConfirm={handleDeleteLumiaItem}
                onCancel={cancelLumiaDelete}
                title="Delete Lumia Character"
                message={`Are you sure you want to delete "${lumiaDeleteConfirm.itemName}"? This action cannot be undone.`}
                variant="danger"
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
}

export default SettingsPanel;
