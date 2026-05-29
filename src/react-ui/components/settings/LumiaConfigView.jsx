import React, { useCallback, useSyncExternalStore } from 'react';
import clsx from 'clsx';
import { Trash2 } from 'lucide-react';
import { useSelections, useAdoHelperActions, useAdoHelperStore, saveToExtension } from '../../store/AdoHelperContext';
import { ModeIcons, ModeToggle, SelectionButton, QuickActionsSection, ToolButton, Icons } from '../shared/settingsHelpers';

/* global toastr */

const store = useAdoHelperStore;
const EMPTY_ARRAY = [];
const selectChimeraMode = () => store.getState().chimeraMode || false;
const selectCouncilMode = () => store.getState().councilMode || false;
const selectCouncilMembers = () => store.getState().councilMembers || EMPTY_ARRAY;
const selectSelectedDefinitions = () => store.getState().selectedDefinitions || EMPTY_ARRAY;

export default function LumiaConfigView() {
    const selections = useSelections();
    const actions = useAdoHelperActions();

    const chimeraMode = useSyncExternalStore(store.subscribe, selectChimeraMode, selectChimeraMode);
    const councilMode = useSyncExternalStore(store.subscribe, selectCouncilMode, selectCouncilMode);
    const councilMembers = useSyncExternalStore(store.subscribe, selectCouncilMembers, selectCouncilMembers);
    const selectedDefinitions = useSyncExternalStore(store.subscribe, selectSelectedDefinitions, selectSelectedDefinitions);

    const isCouncilActive = councilMode && councilMembers.length > 0;

    const handleChimeraModeChange = useCallback((enabled) => {
        actions.setChimeraMode(enabled);
        saveToExtension();
    }, [actions]);

    const handleCouncilModeChange = useCallback((enabled) => {
        actions.setCouncilMode(enabled);
        saveToExtension();
    }, [actions]);

    const handleClearAll = useCallback(() => {
        actions.clearSelections();
        saveToExtension();
        if (typeof toastr !== 'undefined') {
            toastr.info('All Lumia selections cleared');
        }
    }, [actions]);

    return (
        <div className="ado-settings-view">
            <div className="ado-panel">
                <div className="ado-panel-header">
                    <span className="ado-panel-icon">{Icons.settings}</span>
                    <span className="ado-panel-title">Lumia Configuration</span>
                    <span className="ado-panel-action" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="ado-clear-all-btn"
                            onClick={handleClearAll}
                            title="Clear all Lumia selections"
                            type="button"
                        >
                            <Trash2 size={14} strokeWidth={1.5} />
                            Clear All
                        </button>
                    </span>
                </div>
                <div className="ado-panel-content">
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
                </div>
            </div>

            {/* Tools that open overlay modals */}
            <div className="ado-panel" style={{ marginTop: '12px' }}>
                <div className="ado-panel-header">
                    <span className="ado-panel-icon">{Icons.tools}</span>
                    <span className="ado-panel-title">Tools</span>
                </div>
                <div className="ado-panel-content">
                    <div className="ado-tools-row">
                        <ToolButton
                            icon={Icons.plus}
                            label="Lumia Editor"
                            onClick={() => actions.openModal('packSelector')}
                            accent
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
