import React, { useCallback, useSyncExternalStore } from 'react';
import { useAdoHelperActions, saveToExtension, useAdoHelperStore } from '../store/AdoHelperContext';
import { Settings } from 'lucide-react';
import clsx from 'clsx';

const store = useAdoHelperStore;

// Stable selectors (must be defined outside the component)
const selectShowDrawer = () => store.getState().showAdoHelperDrawer ?? true;

/**
 * Minimal stub that replaces the full SettingsPanel inside
 * the SillyTavern #extensions_settings accordion.
 *
 * Provides:
 *  - Drawer visibility toggle (useful inline)
 *  - "Open Ado Helper Settings" button → opens the settings modal
 */
export default function SettingsPanelStub() {
    const actions = useAdoHelperActions();
    const showDrawer = useSyncExternalStore(store.subscribe, selectShowDrawer);

    const handleDrawerToggle = useCallback((checked) => {
        store.setState({ showAdoHelperDrawer: checked });
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

            {/* Open full settings modal */}
            <button
                className="ado-btn ado-btn-primary ado-btn-full"
                onClick={() => actions.openSettingsModal()}
                type="button"
                style={{ marginTop: '12px' }}
            >
                <Settings size={16} strokeWidth={1.5} />
                Open Ado Helper Settings
            </button>
        </div>
    );
}
