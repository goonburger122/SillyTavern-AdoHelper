import React, { useCallback } from 'react';
import { useAdoHelperActions, useUI, useUpdates } from './store/AdoHelperContext';
import SettingsPanelStub from './components/SettingsPanelStub';
import ModalContainer from './components/ModalContainer';
import PackDetailModal from './components/modals/PackDetailModal';
import LoomPackDetailModal from './components/modals/LoomPackDetailModal';
import UpdateBanner from './components/UpdateBanner';
import { useUpdateChecker } from './hooks/useUpdateChecker';

/* global SillyTavern */

/**
 * Main App component for Ado Helper
 * This serves as the root of the React UI
 */
function App() {
    const actions = useAdoHelperActions();
    const ui = useUI();
    const { extensionUpdate } = useUpdates();

    // Debug: Log when App renders

    // Initialize update checking (runs once at app mount)
    useUpdateChecker();

    const handleDismissUpdate = useCallback(() => {
        if (extensionUpdate?.latestVersion) {
            actions.dismissExtensionUpdate(extensionUpdate.latestVersion);
        }
    }, [actions, extensionUpdate?.latestVersion]);

    return (
        <div className="ado-app">
            {/* Update notification banner */}
            <UpdateBanner variant="full" onDismiss={handleDismissUpdate} />

            <SettingsPanelStub />

            {/* Modal portal - modals render here */}
            <ModalContainer />

            {/* Pack detail modals - portal to document.body */}
            <PackDetailModal />
            <LoomPackDetailModal />

            {/* Loading overlay */}
            {ui.isLoading && (
                <div className="ado-loading-overlay">
                    <div className="ado-spinner" />
                </div>
            )}

            {/* Error toast */}
            {ui.error && (
                <div className="ado-error-toast" onClick={actions.clearError}>
                    <span>{ui.error}</span>
                    <button className="ado-error-dismiss">Dismiss</button>
                </div>
            )}
        </div>
    );
}

export default App;
