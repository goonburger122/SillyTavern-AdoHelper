import React from 'react';
import { useLoomSelections } from '../../store/AdoHelperContext';
import { SelectionButton, Icons, Panel } from '../shared/settingsHelpers';

export default function LoomConfigView() {
    const loomSelections = useLoomSelections();

    return (
        <div className="ado-settings-view">
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
        </div>
    );
}
