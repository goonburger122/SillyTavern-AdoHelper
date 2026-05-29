import React, { useState } from 'react';
import { ArrowUpCircle, ExternalLink, X, Loader2, Check, AlertCircle, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { useUpdates, useAdoHelperActions, useAdoHelper } from '../store/AdoHelperContext';

/**
 * Update Banner Component
 * Displays a notification banner when extension or preset updates are available.
 * 
 * Design: Warm amber/orange gradient with purple accents to blend with Ado Helper theme.
 * Shows extension updates prominently, with preset updates listed below.
 */
export default function UpdateBanner({ variant = 'full', onDismiss }) {
    const { extensionUpdate, presetUpdates, hasAnyUpdate, hasExtensionUpdate } = useUpdates();
    const isUpdating = useAdoHelper(state => state.ui.isUpdatingExtension);
    const actions = useAdoHelperActions();
    const [updateResult, setUpdateResult] = useState(null);

    const handleUpdateClick = async () => {
        if (isUpdating) return;
        const result = await actions.updateExtension();
        setUpdateResult(result);
        
        // On successful update, clear the extension update notification after a brief delay
        // This gives user time to see the success message
        if (result.success) {
            setTimeout(() => {
                actions.setExtensionUpdate(null);
            }, 5000);
        }
    };

    const handleReload = () => {
        window.location.reload();
    };

    if (!hasAnyUpdate) {
        return null;
    }

    const presetCount = presetUpdates?.length || 0;

    // Compact variant for sidebar toggle area
    if (variant === 'compact') {
        return (
            <div className="ado-update-indicator">
                <ArrowUpCircle size={12} strokeWidth={2.5} />
            </div>
        );
    }

    // Minimal variant for accordion title
    if (variant === 'badge') {
        return (
            <span className="ado-update-badge">New!</span>
        );
    }

    // Full banner for settings panel and sidebar
    return (
        <div className={clsx('ado-update-banner', hasExtensionUpdate && 'has-extension-update')}>
            <div className="ado-update-banner-content">
                <div className="ado-update-banner-icon">
                    <ArrowUpCircle size={20} strokeWidth={2} />
                </div>
                
                <div className="ado-update-banner-text">
                    {hasExtensionUpdate && (
                        <div className="ado-update-banner-main">
                            <strong>Ado Helper {extensionUpdate.latestVersion}</strong> available
                            {!updateResult ? (
                                <button 
                                    className="ado-update-banner-link"
                                    onClick={handleUpdateClick}
                                    disabled={isUpdating}
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        padding: 0, 
                                        font: 'inherit', 
                                        cursor: isUpdating ? 'wait' : 'pointer', 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '4px', 
                                        textDecoration: 'underline' 
                                    }}
                                >
                                    {isUpdating ? 'Updating...' : 'Update now'} 
                                    {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <ExternalLink size={12} />}
                                </button>
                            ) : (
                                <span 
                                    className={clsx("ado-update-result", updateResult.success ? "success" : "error")} 
                                    style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '4px', 
                                        marginLeft: '8px', 
                                        fontSize: '0.9em',
                                        fontWeight: 'normal'
                                    }}
                                >
                                    {updateResult.success ? <Check size={12} /> : <AlertCircle size={12} />}
                                    {updateResult.success ? 'Updated!' : updateResult.message}
                                    {updateResult.success && (
                                        <button
                                            className="ado-update-banner-link"
                                            onClick={handleReload}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                padding: 0,
                                                font: 'inherit',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                textDecoration: 'underline',
                                                marginLeft: '4px',
                                            }}
                                        >
                                            Reload now <RefreshCw size={12} />
                                        </button>
                                    )}
                                </span>
                            )}
                        </div>
                    )}
                    
                    {presetCount > 0 && (
                        <div className="ado-update-banner-presets">
                            {presetCount} preset{presetCount !== 1 ? 's' : ''} {presetCount !== 1 ? 'have' : 'has'} updates: {
                                presetUpdates.slice(0, 3).map(p => p.name).join(', ')
                            }{presetCount > 3 ? `, +${presetCount - 3} more` : ''}
                        </div>
                    )}
                </div>

                {onDismiss && (
                    <button 
                        className="ado-update-banner-dismiss"
                        onClick={onDismiss}
                        title="Dismiss"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}

/**
 * Inline update indicator for sidebar toggle
 * Shows a small pulsing dot when updates are available
 */
export function UpdateDot() {
    const { hasAnyUpdate } = useUpdates();
    
    if (!hasAnyUpdate) {
        return null;
    }

    return <span className="ado-update-dot" />;
}

/**
 * Text badge for accordion title
 */
export function UpdateBadge() {
    const { hasAnyUpdate, hasExtensionUpdate, presetUpdates } = useUpdates();
    
    if (!hasAnyUpdate) {
        return null;
    }

    // Show different badge text based on what has updates
    let badgeText = 'New!';
    if (hasExtensionUpdate && presetUpdates.length > 0) {
        badgeText = 'Updates!';
    } else if (presetUpdates.length > 1) {
        badgeText = `${presetUpdates.length} updates`;
    }

    return <span className="ado-update-badge">{badgeText}</span>;
}
