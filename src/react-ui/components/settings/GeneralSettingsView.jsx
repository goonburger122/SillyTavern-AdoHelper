import React, { useCallback, useSyncExternalStore } from 'react';
import clsx from 'clsx';
import { Minimize2, Sparkles, MessageCircle } from 'lucide-react';
import { useAdoHelperStore, saveToExtension } from '../../store/AdoHelperContext';

const store = useAdoHelperStore;

const DEFAULT_DRAWER_SETTINGS = { side: 'right', verticalPosition: 15, tabSize: 'large', panelWidthMode: 'default', customPanelWidth: 35 };
const selectShowDrawer = () => store.getState().showAdoHelperDrawer ?? true;
const selectDrawerSettings = () => store.getState().drawerSettings ?? DEFAULT_DRAWER_SETTINGS;
const selectEnableLandingPage = () => store.getState().enableLandingPage ?? true;
const selectLandingPageChatsDisplayed = () => store.getState().landingPageChatsDisplayed ?? 12;
const selectEnableChatSheld = () => store.getState().enableChatSheld ?? false;
const selectChatSheldDisplayMode = () => store.getState().chatSheldDisplayMode || 'minimal';
const selectChatSheldPageSize = () => store.getState().chatSheldPageSize ?? 50;
const selectChatSheldEnterToSend = () => store.getState().chatSheldEnterToSend ?? true;
const selectSidePortraitEnabled = () => store.getState().sidePortraitEnabled || false;
const selectSidePortraitSide = () => store.getState().sidePortraitSide || 'left';
const selectEnableResortableTagFolders = () => store.getState().enableResortableTagFolders ?? false;
const selectEnableCharacterBrowser = () => store.getState().enableCharacterBrowser ?? true;
const selectEnablePersonaManager = () => store.getState().enablePersonaManager ?? true;
const selectEnableWorldBookEditor = () => store.getState().enableWorldBookEditor ?? true;

export default function GeneralSettingsView() {
    const showDrawer = useSyncExternalStore(store.subscribe, selectShowDrawer, selectShowDrawer);
    const drawerSettings = useSyncExternalStore(store.subscribe, selectDrawerSettings, selectDrawerSettings);
    const enableLandingPage = useSyncExternalStore(store.subscribe, selectEnableLandingPage, selectEnableLandingPage);
    const landingPageChatsDisplayed = useSyncExternalStore(store.subscribe, selectLandingPageChatsDisplayed, selectLandingPageChatsDisplayed);
    const enableChatSheld = useSyncExternalStore(store.subscribe, selectEnableChatSheld, selectEnableChatSheld);
    const chatSheldDisplayMode = useSyncExternalStore(store.subscribe, selectChatSheldDisplayMode, selectChatSheldDisplayMode);
    const chatSheldPageSize = useSyncExternalStore(store.subscribe, selectChatSheldPageSize, selectChatSheldPageSize);
    const chatSheldEnterToSend = useSyncExternalStore(store.subscribe, selectChatSheldEnterToSend, selectChatSheldEnterToSend);
    const sidePortraitEnabled = useSyncExternalStore(store.subscribe, selectSidePortraitEnabled, selectSidePortraitEnabled);
    const sidePortraitSide = useSyncExternalStore(store.subscribe, selectSidePortraitSide, selectSidePortraitSide);
    const enableResortableTagFolders = useSyncExternalStore(store.subscribe, selectEnableResortableTagFolders, selectEnableResortableTagFolders);
    const enableCharacterBrowser = useSyncExternalStore(store.subscribe, selectEnableCharacterBrowser, selectEnableCharacterBrowser);
    const enablePersonaManager = useSyncExternalStore(store.subscribe, selectEnablePersonaManager, selectEnablePersonaManager);
    const enableWorldBookEditor = useSyncExternalStore(store.subscribe, selectEnableWorldBookEditor, selectEnableWorldBookEditor);

    const handleDrawerToggle = useCallback((enabled) => {
        store.setState({ showAdoHelperDrawer: enabled });
        saveToExtension();
    }, []);

    const handleDrawerSideChange = useCallback((side) => {
        store.setState({ drawerSettings: { ...store.getState().drawerSettings, side } });
        saveToExtension();
    }, []);

    const handleVerticalPositionChange = useCallback((value) => {
        const verticalPosition = Math.max(0, Math.min(100, parseInt(value, 10) || 0));
        store.setState({ drawerSettings: { ...store.getState().drawerSettings, verticalPosition } });
        saveToExtension();
    }, []);

    const handleTabSizeChange = useCallback((tabSize) => {
        store.setState({ drawerSettings: { ...store.getState().drawerSettings, tabSize } });
        saveToExtension();
    }, []);

    const handlePanelWidthModeChange = useCallback((panelWidthMode) => {
        store.setState({ drawerSettings: { ...store.getState().drawerSettings, panelWidthMode } });
        saveToExtension();
    }, []);

    const handleCustomPanelWidthChange = useCallback((value) => {
        const customPanelWidth = Math.max(25, Math.min(60, parseInt(value, 10) || 35));
        store.setState({ drawerSettings: { ...store.getState().drawerSettings, customPanelWidth } });
        saveToExtension();
    }, []);

    const handleLandingPageToggle = useCallback((enabled) => {
        store.setState({ enableLandingPage: enabled });
        saveToExtension();
    }, []);

    const handleChatsDisplayedChange = useCallback((value) => {
        store.setState({ landingPageChatsDisplayed: parseInt(value, 10) || 12 });
        saveToExtension();
    }, []);

    const handleChatSheldToggle = useCallback((enabled) => {
        store.setState({ enableChatSheld: enabled });
        saveToExtension();
    }, []);

    const handleDisplayModeChange = useCallback((mode) => {
        store.setState({ chatSheldDisplayMode: mode });
        saveToExtension();
    }, []);

    const handlePageSizeChange = useCallback((value) => {
        const size = Math.max(10, Math.min(100, parseInt(value, 10) || 50));
        store.setState({ chatSheldPageSize: size });
        saveToExtension();
    }, []);

    const handleEnterToSendToggle = useCallback((enabled) => {
        store.setState({ chatSheldEnterToSend: enabled });
        saveToExtension();
    }, []);

    const handleSidePortraitToggle = useCallback((enabled) => {
        store.setState({ sidePortraitEnabled: enabled });
        saveToExtension();
    }, []);

    const handleSidePortraitSideChange = useCallback((side) => {
        store.setState({ sidePortraitSide: side });
        saveToExtension();
    }, []);

    const handleResortableTagFoldersToggle = useCallback((enabled) => {
        store.setState({ enableResortableTagFolders: enabled, ...(!enabled ? { tagFolderOrder: [] } : {}) });
        saveToExtension();
    }, []);

    const handleCharacterBrowserToggle = useCallback((enabled) => {
        store.setState({ enableCharacterBrowser: enabled });
        saveToExtension();
    }, []);

    const handlePersonaManagerToggle = useCallback((enabled) => {
        store.setState({ enablePersonaManager: enabled });
        saveToExtension();
    }, []);

    const handleWorldBookEditorToggle = useCallback((enabled) => {
        store.setState({ enableWorldBookEditor: enabled });
        saveToExtension();
    }, []);

    return (
        <div className="ado-settings-view">
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

            {/* Drawer Position Settings */}
            {showDrawer && (
                <div className="ado-drawer-settings-container">
                    <div className="ado-drawer-settings-row">
                        <div className="ado-drawer-setting">
                            <label className="ado-drawer-setting-label">Drawer Side</label>
                            <div className="ado-drawer-side-toggle">
                                <button
                                    type="button"
                                    className={clsx('ado-side-btn', drawerSettings.side === 'left' && 'ado-side-btn--active')}
                                    onClick={() => handleDrawerSideChange('left')}
                                >
                                    Left
                                </button>
                                <button
                                    type="button"
                                    className={clsx('ado-side-btn', drawerSettings.side === 'right' && 'ado-side-btn--active')}
                                    onClick={() => handleDrawerSideChange('right')}
                                >
                                    Right
                                </button>
                            </div>
                        </div>
                        <div className="ado-drawer-setting">
                            <label htmlFor="ado-drawer-vpos-settings" className="ado-drawer-setting-label">
                                Tab Position
                            </label>
                            <div className="ado-drawer-vpos-input">
                                <input
                                    type="range"
                                    id="ado-drawer-vpos-settings"
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
                                    className={clsx('ado-side-btn', drawerSettings.tabSize === 'large' && 'ado-side-btn--active')}
                                    onClick={() => handleTabSizeChange('large')}
                                >
                                    Large
                                </button>
                                <button
                                    type="button"
                                    className={clsx('ado-side-btn', drawerSettings.tabSize === 'compact' && 'ado-side-btn--active')}
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
                                    className={clsx('ado-side-btn', (drawerSettings.panelWidthMode || 'default') === 'default' && 'ado-side-btn--active')}
                                    onClick={() => handlePanelWidthModeChange('default')}
                                >
                                    Default
                                </button>
                                <button
                                    type="button"
                                    className={clsx('ado-side-btn', drawerSettings.panelWidthMode === 'stChat' && 'ado-side-btn--active')}
                                    onClick={() => handlePanelWidthModeChange('stChat')}
                                    title="Match SillyTavern's chat column width"
                                >
                                    ST Chat
                                </button>
                                <button
                                    type="button"
                                    className={clsx('ado-side-btn', drawerSettings.panelWidthMode === 'custom' && 'ado-side-btn--active')}
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
                                <label htmlFor="ado-drawer-panel-width-settings" className="ado-drawer-setting-label">
                                    Custom Width
                                </label>
                                <div className="ado-drawer-vpos-input">
                                    <input
                                        type="range"
                                        id="ado-drawer-panel-width-settings"
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

            {/* Chat Sheld Toggle */}
            <div className="ado-drawer-toggle-container">
                <label className="ado-toggle-wrapper">
                    <div className="ado-toggle-text">
                        <span className="ado-toggle-label">Glassmorphic Chat</span>
                        <span className="ado-toggle-description">
                            Replace the default chat display with a glassmorphic React-based interface (experimental)
                        </span>
                    </div>
                    <div className={clsx('ado-toggle', enableChatSheld && 'ado-toggle--on')}>
                        <input
                            type="checkbox"
                            className="ado-toggle-input"
                            checked={enableChatSheld}
                            onChange={(e) => handleChatSheldToggle(e.target.checked)}
                        />
                        <span className="ado-toggle-slider"></span>
                    </div>
                </label>
                {enableChatSheld && (
                    <div className="ado-mode-selector">
                        <span className="ado-mode-selector-label">Chat Style</span>
                        <div className="ado-mode-selector-btns">
                            <button
                                type="button"
                                className={clsx('ado-mode-btn', chatSheldDisplayMode === 'minimal' && 'ado-mode-btn--active')}
                                onClick={() => handleDisplayModeChange('minimal')}
                                title="Minimal"
                            >
                                <Minimize2 size={14} />
                                <span>Minimal</span>
                            </button>
                            <button
                                type="button"
                                className={clsx('ado-mode-btn', chatSheldDisplayMode === 'immersive' && 'ado-mode-btn--active')}
                                onClick={() => handleDisplayModeChange('immersive')}
                                title="Immersive"
                            >
                                <Sparkles size={14} />
                                <span>Immersive</span>
                            </button>
                            <button
                                type="button"
                                className={clsx('ado-mode-btn', chatSheldDisplayMode === 'bubble' && 'ado-mode-btn--active')}
                                onClick={() => handleDisplayModeChange('bubble')}
                                title="Bubble"
                            >
                                <MessageCircle size={14} />
                                <span>Bubble</span>
                            </button>
                        </div>
                    </div>
                )}
                {enableChatSheld && (
                    <div className="ado-drawer-settings-container" style={{ marginTop: '10px' }}>
                        <div className="ado-drawer-setting" style={{ flex: 1 }}>
                            <label htmlFor="ado-chat-page-size" className="ado-drawer-setting-label">
                                Messages per Page
                            </label>
                            <span className="ado-toggle-description" style={{ fontSize: '0.82em', marginBottom: '6px', display: 'block' }}>
                                Controls how many messages load at once. Lower values improve performance on slower devices.
                            </span>
                            <div className="ado-drawer-vpos-input">
                                <input
                                    type="range"
                                    id="ado-chat-page-size"
                                    className="ado-slider"
                                    value={chatSheldPageSize}
                                    onChange={(e) => handlePageSizeChange(e.target.value)}
                                    min="10"
                                    max="100"
                                    step="10"
                                />
                                <span className="ado-drawer-vpos-value">{chatSheldPageSize}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enter to Send */}
                {enableChatSheld && (
                    <div style={{ marginTop: '10px' }}>
                        <label className="ado-toggle-wrapper">
                            <div className="ado-toggle-text">
                                <span className="ado-toggle-label">Enter to Send</span>
                                <span className="ado-toggle-description">
                                    {chatSheldEnterToSend
                                        ? 'Enter sends message, Shift+Enter for new line'
                                        : 'Enter adds new line, Ctrl/Cmd+Enter sends message'}
                                </span>
                            </div>
                            <div className={clsx('ado-toggle', chatSheldEnterToSend && 'ado-toggle--on')}>
                                <input
                                    type="checkbox"
                                    className="ado-toggle-input"
                                    checked={chatSheldEnterToSend}
                                    onChange={(e) => handleEnterToSendToggle(e.target.checked)}
                                />
                                <span className="ado-toggle-slider"></span>
                            </div>
                        </label>
                    </div>
                )}

                {/* Side Portrait Settings */}
                {enableChatSheld && (
                    <div style={{ marginTop: '10px' }}>
                        <label className="ado-toggle-wrapper">
                            <div className="ado-toggle-text">
                                <span className="ado-toggle-label">Side Portrait</span>
                                <span className="ado-toggle-description">
                                    Pin the character avatar to a side panel (desktop only)
                                </span>
                            </div>
                            <div className={clsx('ado-toggle', sidePortraitEnabled && 'ado-toggle--on')}>
                                <input
                                    type="checkbox"
                                    className="ado-toggle-input"
                                    checked={sidePortraitEnabled}
                                    onChange={(e) => handleSidePortraitToggle(e.target.checked)}
                                />
                                <span className="ado-toggle-slider"></span>
                            </div>
                        </label>
                        {sidePortraitEnabled && (
                            <div className="ado-drawer-settings-container" style={{ marginTop: '8px' }}>
                                <div className="ado-drawer-setting">
                                    <label className="ado-drawer-setting-label">Portrait Side</label>
                                    <div className="ado-drawer-side-toggle">
                                        <button
                                            type="button"
                                            className={clsx('ado-side-btn', sidePortraitSide === 'left' && 'ado-side-btn--active')}
                                            onClick={() => handleSidePortraitSideChange('left')}
                                        >
                                            Left
                                        </button>
                                        <button
                                            type="button"
                                            className={clsx('ado-side-btn', sidePortraitSide === 'right' && 'ado-side-btn--active')}
                                            onClick={() => handleSidePortraitSideChange('right')}
                                        >
                                            Right
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Character Gallery */}
            <div className="ado-drawer-toggle-container">
                <label className="ado-toggle-wrapper">
                    <div className="ado-toggle-text">
                        <span className="ado-toggle-label">Resortable Tag Folders</span>
                        <span className="ado-toggle-description">
                            Drag and drop to reorder tag folders in the Character Browser
                        </span>
                    </div>
                    <div className={clsx('ado-toggle', enableResortableTagFolders && 'ado-toggle--on')}>
                        <input
                            type="checkbox"
                            className="ado-toggle-input"
                            checked={enableResortableTagFolders}
                            onChange={(e) => handleResortableTagFoldersToggle(e.target.checked)}
                        />
                        <span className="ado-toggle-slider"></span>
                    </div>
                </label>
            </div>

            {/* New Experiences */}
            <div className="ado-drawer-toggle-container">
                <div className="ado-toggle-text" style={{ marginBottom: '10px' }}>
                    <span className="ado-toggle-label">New Experiences</span>
                    <span className="ado-toggle-description">
                        Disable any of these to restore SillyTavern's native UI for that feature
                    </span>
                </div>

                <label className="ado-toggle-wrapper">
                    <div className="ado-toggle-text">
                        <span className="ado-toggle-label">Character Browser</span>
                        <span className="ado-toggle-description">
                            Replace ST's character panel with the Ado Helper Character Browser
                        </span>
                    </div>
                    <div className={clsx('ado-toggle', enableCharacterBrowser && 'ado-toggle--on')}>
                        <input
                            type="checkbox"
                            className="ado-toggle-input"
                            checked={enableCharacterBrowser}
                            onChange={(e) => handleCharacterBrowserToggle(e.target.checked)}
                        />
                        <span className="ado-toggle-slider"></span>
                    </div>
                </label>

                <label className="ado-toggle-wrapper">
                    <div className="ado-toggle-text">
                        <span className="ado-toggle-label">Persona Manager</span>
                        <span className="ado-toggle-description">
                            Replace ST's persona management with the Ado Helper Persona Manager
                        </span>
                    </div>
                    <div className={clsx('ado-toggle', enablePersonaManager && 'ado-toggle--on')}>
                        <input
                            type="checkbox"
                            className="ado-toggle-input"
                            checked={enablePersonaManager}
                            onChange={(e) => handlePersonaManagerToggle(e.target.checked)}
                        />
                        <span className="ado-toggle-slider"></span>
                    </div>
                </label>

                <label className="ado-toggle-wrapper">
                    <div className="ado-toggle-text">
                        <span className="ado-toggle-label">World Book Editor</span>
                        <span className="ado-toggle-description">
                            Replace ST's World Info panel with the Ado Helper World Book Editor
                        </span>
                    </div>
                    <div className={clsx('ado-toggle', enableWorldBookEditor && 'ado-toggle--on')}>
                        <input
                            type="checkbox"
                            className="ado-toggle-input"
                            checked={enableWorldBookEditor}
                            onChange={(e) => handleWorldBookEditorToggle(e.target.checked)}
                        />
                        <span className="ado-toggle-slider"></span>
                    </div>
                </label>
            </div>
        </div>
    );
}
