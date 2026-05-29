import React, { useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

/* global AdoHelperBridge, toastr */

export default function DangerZoneView() {
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
                console.error('[DangerZoneView] resetAllSettings not available on bridge');
                if (typeof toastr !== 'undefined') {
                    toastr.error('Reset function not available. Please reload the page.');
                }
            }
        }
    }, []);

    return (
        <div className="ado-settings-view">
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
        </div>
    );
}
