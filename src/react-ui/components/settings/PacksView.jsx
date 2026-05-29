import React, { useState, useMemo, useCallback } from 'react';
import clsx from 'clsx';
import { Eye, Sparkles, Wrench, Layers, Trash2 } from 'lucide-react';
import { useAdoHelperActions, usePacks, saveToExtension } from '../../store/AdoHelperContext';
import { CollapsibleContent } from '../Collapsible';
import { exportPack } from '../modals/PackEditorModal';
import ConfirmationModal from '../shared/ConfirmationModal';
import {
    Icons, Panel, LumiaPackItem, LoomPackItem, getLoomItemsFromPack,
} from '../shared/settingsHelpers';
import LazyImage from '../shared/LazyImage';

/* global AdoHelperBridge, toastr */

export default function PacksView() {
    const actions = useAdoHelperActions();
    const { packs, customPacks, allPacks } = usePacks();

    const [expandedPackId, setExpandedPackId] = useState(null);
    const [sectionsCollapsed, setSectionsCollapsed] = useState({
        customPacks: false,
        downloadedPacks: false,
        loomPacks: false,
    });

    const [loomDeleteConfirm, setLoomDeleteConfirm] = useState({
        isOpen: false, packName: null, item: null, itemName: null,
    });
    const [lumiaDeleteConfirm, setLumiaDeleteConfirm] = useState({
        isOpen: false, packName: null, item: null, itemName: null,
    });

    const toggleSection = useCallback((section) => {
        setSectionsCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
    }, []);

    const togglePackExpansion = useCallback((packId) => {
        setExpandedPackId(prev => prev === packId ? null : packId);
    }, []);

    // Stats
    const totalPacks = allPacks.length;
    const totalItems = useMemo(() => {
        return allPacks.reduce((sum, pack) => {
            const lumiaCount = pack.lumiaItems?.length || 0;
            const loomCount = pack.loomItems?.length || 0;
            const legacyCount = pack.items?.length || 0;
            return sum + (lumiaCount + loomCount > 0 ? lumiaCount + loomCount : legacyCount);
        }, 0);
    }, [allPacks]);

    const loomPacks = useMemo(() => {
        return packs.filter(pack => {
            if (pack.loomItems?.length > 0) return true;
            if (pack.loomStyles?.length > 0) return true;
            if (pack.loomUtils?.length > 0) return true;
            if (pack.loomRetrofits?.length > 0) return true;
            if (pack.items?.some(item => item.loomCategory)) return true;
            return false;
        });
    }, [packs]);

    const callExtensionCallback = useCallback((name, ...args) => {
        if (typeof AdoHelperBridge !== 'undefined') {
            const callbacks = AdoHelperBridge.getCallbacks();
            if (callbacks && callbacks[name]) {
                callbacks[name](...args);
            }
        }
    }, []);

    const handleFileUpload = useCallback((event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (typeof AdoHelperBridge !== 'undefined') {
                    const callbacks = AdoHelperBridge.getCallbacks();
                    if (callbacks && callbacks.handleNewBook) {
                        await callbacks.handleNewBook(data, file.name, false);
                        if (callbacks.refreshUIDisplay) {
                            callbacks.refreshUIDisplay();
                        }
                    } else {
                        if (typeof toastr !== 'undefined') {
                            toastr.error('Import function not available. Please reload the page.');
                        }
                    }
                }
            } catch (error) {
                if (typeof toastr !== 'undefined') {
                    toastr.error('Failed to parse JSON: ' + error.message);
                }
            }
        };
        reader.onerror = () => {
            if (typeof toastr !== 'undefined') {
                toastr.error('Failed to read file');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }, []);

    const handleDeletePack = useCallback((packName) => {
        if (!confirm(`Are you sure you want to delete "${packName}"?`)) return;
        actions.removePack(packName);
        saveToExtension();
        if (typeof toastr !== 'undefined') {
            toastr.success(`Pack "${packName}" deleted`);
        }
    }, [actions]);

    // Loom delete handlers
    const openLoomDeleteConfirm = useCallback((packName, item, itemName) => {
        setLoomDeleteConfirm({ isOpen: true, packName, item, itemName });
    }, []);

    const handleDeleteLoomItem = useCallback(() => {
        const { packName, item, itemName } = loomDeleteConfirm;
        if (!packName || !item) return;

        const packIndex = allPacks.findIndex(p => (p.name || p.packName) === packName);
        if (packIndex === -1) {
            setLoomDeleteConfirm({ isOpen: false, packName: null, item: null, itemName: null });
            return;
        }

        const pack = allPacks[packIndex];
        const loomItemName = item.loomName || item.itemName || item.name;

        if (pack.loomItems && Array.isArray(pack.loomItems)) {
            const newLoomItems = pack.loomItems.filter(li =>
                (li.loomName || li.itemName || li.name) !== loomItemName
            );
            actions.updatePackLoomItems(packName, newLoomItems);
        }

        ['loomStyles', 'loomUtils', 'loomRetrofits'].forEach(field => {
            if (pack[field] && Array.isArray(pack[field])) {
                const filtered = pack[field].filter(li =>
                    (li.loomName || li.itemName || li.name) !== loomItemName
                );
                if (filtered.length !== pack[field].length) {
                    actions.updatePackField(packName, field, filtered);
                }
            }
        });

        if (pack.items && Array.isArray(pack.items)) {
            const filtered = pack.items.filter(li => {
                if (!li.loomCategory && !li.category) return true;
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
        setLoomDeleteConfirm({ isOpen: false, packName: null, item: null, itemName: null });
    }, [loomDeleteConfirm, allPacks, actions]);

    // Lumia delete handlers
    const openLumiaDeleteConfirm = useCallback((packName, item, itemName) => {
        setLumiaDeleteConfirm({ isOpen: true, packName, item, itemName });
    }, []);

    const handleDeleteLumiaItem = useCallback(() => {
        const { packName, item, itemName } = lumiaDeleteConfirm;
        if (!packName || !item) return;

        const packIndex = allPacks.findIndex(p => (p.name || p.packName) === packName);
        if (packIndex === -1) {
            setLumiaDeleteConfirm({ isOpen: false, packName: null, item: null, itemName: null });
            return;
        }

        const pack = allPacks[packIndex];
        const lumiaItemName = item.lumiaName || item.lumiaDefName;

        if (pack.lumiaItems && Array.isArray(pack.lumiaItems)) {
            const newLumiaItems = pack.lumiaItems.filter(li =>
                (li.lumiaName || li.lumiaDefName) !== lumiaItemName
            );
            actions.updatePackField(packName, 'lumiaItems', newLumiaItems);
        }

        if (pack.items && Array.isArray(pack.items)) {
            const filtered = pack.items.filter(li => {
                if (!li.lumiaDefName && !li.lumiaName) return true;
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
        setLumiaDeleteConfirm({ isOpen: false, packName: null, item: null, itemName: null });
    }, [lumiaDeleteConfirm, allPacks, actions]);

    return (
        <div className="ado-settings-view">
            {/* DLC Packs */}
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
                        id="ado-url-input-settings"
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
                        onClick={() => document.getElementById('ado-file-input-settings')?.click()}
                        type="button"
                    >
                        {Icons.upload}
                        Upload JSON File
                    </button>
                    <input
                        type="file"
                        id="ado-file-input-settings"
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

            {/* Custom Packs */}
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
                            const packKey = pack.id || pack.name;
                            const isExpanded = expandedPackId === packKey;
                            const lumiaItems = pack.lumiaItems?.length > 0
                                ? pack.lumiaItems
                                : (pack.items?.filter(item => item.lumiaDefName) || []);
                            const loomItems = getLoomItemsFromPack(pack);
                            const hasAnyItems = lumiaItems.length > 0 || loomItems.length > 0;

                            return (
                                <div
                                    key={packKey}
                                    className={clsx('ado-pack-item-container', isExpanded && 'ado-pack-item-container--expanded')}
                                >
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

                                    <CollapsibleContent isOpen={isExpanded && lumiaItems.length > 0} className="ado-pack-items-list" duration={200}>
                                        <div className="ado-pack-section-header">Lumia Characters</div>
                                        {lumiaItems.map((item, index) => (
                                            <LumiaPackItem
                                                key={item.lumiaDefName || item.lumiaName || index}
                                                item={item}
                                                packName={pack.name}
                                                onEdit={(pn, it) => actions.openModal('lumiaEditor', { packName: pn, editingItem: it })}
                                                onDelete={openLumiaDeleteConfirm}
                                                editIcon={Icons.edit}
                                            />
                                        ))}
                                    </CollapsibleContent>

                                    <CollapsibleContent isOpen={isExpanded && loomItems.length > 0} className="ado-pack-items-list" duration={200}>
                                        <div className="ado-pack-section-header">Loom Items</div>
                                        {loomItems.map((item, index) => (
                                            <LoomPackItem
                                                key={item.loomName || item.itemName || item.name || index}
                                                item={item}
                                                packName={pack.name}
                                                onEdit={(pn, it) => actions.openModal('loomEditor', { packName: pn, editingItem: it })}
                                                onDelete={openLoomDeleteConfirm}
                                                editIcon={Icons.edit}
                                            />
                                        ))}
                                    </CollapsibleContent>

                                    <CollapsibleContent isOpen={isExpanded && !hasAnyItems} className="ado-pack-items-empty" duration={200}>
                                        <span>No items in this pack yet</span>
                                    </CollapsibleContent>
                                </div>
                            );
                        })}
                    </div>
                </Panel>
            )}

            {/* Downloaded Packs */}
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
                            const lumiaItems = pack.lumiaItems?.length > 0
                                ? pack.lumiaItems
                                : (pack.items?.filter(item => item.lumiaDefName && item.lumiaDef) || []);
                            const coverUrl = pack.coverUrl || pack.packCover;

                            return (
                                <div key={packName} className="ado-downloaded-pack-item">
                                    {coverUrl ? (
                                        <LazyImage src={coverUrl} alt={packName} containerClassName="ado-downloaded-pack-cover" spinnerSize={14} fallback={<div className="ado-downloaded-pack-cover-placeholder">{Icons.package}</div>} />
                                    ) : (
                                        <div className="ado-downloaded-pack-cover-placeholder">{Icons.package}</div>
                                    )}
                                    <div className="ado-downloaded-pack-info">
                                        <span className="ado-downloaded-pack-name">{packName}</span>
                                        <span className="ado-downloaded-pack-count">
                                            {lumiaItems.length} Lumia{lumiaItems.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="ado-downloaded-pack-actions">
                                        <button className="ado-btn ado-btn-icon" onClick={() => actions.openPackDetail(packName)} title="View pack contents" type="button">
                                            <Eye size={16} strokeWidth={1.5} />
                                        </button>
                                        <button className="ado-btn ado-btn-icon ado-btn-icon-danger" onClick={() => handleDeletePack(packName)} title="Delete pack" type="button">
                                            <Trash2 size={16} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Panel>
            )}

            {/* Loom Packs */}
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
                            let styles = pack.loomStyles?.length || 0;
                            let utilities = pack.loomUtils?.length || 0;
                            let retrofits = pack.loomRetrofits?.length || 0;

                            const countByCategory = (item) => {
                                const cat = item.loomCategory || item.category;
                                if (cat === 'Narrative Style' || cat === 'loomStyles') styles++;
                                else if (cat === 'Loom Utilities' || cat === 'loomUtils') utilities++;
                                else if (cat === 'Retrofits' || cat === 'loomRetrofits') retrofits++;
                            };

                            if (pack.loomItems) pack.loomItems.forEach(countByCategory);
                            if (pack.items) pack.items.forEach(item => { if (item.loomCategory || item.category) countByCategory(item); });

                            return (
                                <div key={packName} className="ado-loom-pack-item">
                                    {pack.packCover ? (
                                        <LazyImage src={pack.packCover} alt={packName} containerClassName="ado-loom-pack-cover" spinnerSize={14} fallback={<div className="ado-loom-pack-cover-placeholder">{Icons.layers}</div>} />
                                    ) : (
                                        <div className="ado-loom-pack-cover-placeholder">{Icons.layers}</div>
                                    )}
                                    <div className="ado-loom-pack-info">
                                        <span className="ado-loom-pack-name">{packName}</span>
                                        <div className="ado-loom-pack-stats">
                                            {styles > 0 && <span><Sparkles size={10} /> {styles}</span>}
                                            {utilities > 0 && <span><Wrench size={10} /> {utilities}</span>}
                                            {retrofits > 0 && <span><Layers size={10} /> {retrofits}</span>}
                                        </div>
                                    </div>
                                    <div className="ado-loom-pack-actions">
                                        <button className="ado-btn ado-btn-icon" onClick={() => actions.openLoomPackDetail(packName)} title="View loom contents" type="button">
                                            <Eye size={16} strokeWidth={1.5} />
                                        </button>
                                        <button className="ado-btn ado-btn-icon ado-btn-icon-danger" onClick={() => handleDeletePack(packName)} title="Delete pack" type="button">
                                            <Trash2 size={16} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Panel>
            )}

            {/* Confirmation Modals */}
            <ConfirmationModal
                isOpen={loomDeleteConfirm.isOpen}
                onConfirm={handleDeleteLoomItem}
                onCancel={() => setLoomDeleteConfirm({ isOpen: false, packName: null, item: null, itemName: null })}
                title="Delete Loom Item"
                message={`Are you sure you want to delete "${loomDeleteConfirm.itemName}"? This action cannot be undone.`}
                variant="danger"
                confirmText="Delete"
                cancelText="Cancel"
            />
            <ConfirmationModal
                isOpen={lumiaDeleteConfirm.isOpen}
                onConfirm={handleDeleteLumiaItem}
                onCancel={() => setLumiaDeleteConfirm({ isOpen: false, packName: null, item: null, itemName: null })}
                title="Delete Lumia Character"
                message={`Are you sure you want to delete "${lumiaDeleteConfirm.itemName}"? This action cannot be undone.`}
                variant="danger"
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
}
