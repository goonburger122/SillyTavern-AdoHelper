/**
 * PersonaManager CSS-in-JS styles
 *
 * Glassmorphic identity wardrobe — avatar-first cards with translucent surfaces.
 * All colors via var(--ado-*). Scoped via .ado-pm-* prefix.
 */

export const personaManagerStyles = /* css */`
/* ─── Root ──────────────────────────────────────────────── */
.ado-pm-root {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    gap: 0;
}

/* ─── Toolbar ───────────────────────────────────────────── */
.ado-pm-toolbar {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 14px 10px;
    flex-shrink: 0;
}

.ado-pm-toolbar-row {
    display: flex;
    align-items: center;
    gap: 6px;
}

.ado-pm-search {
    position: relative;
    flex: 1;
    min-width: 0;
}

.ado-pm-search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ado-text-dim);
    pointer-events: none;
    display: flex;
}

.ado-pm-search-input {
    width: 100%;
    padding: 7px 30px 7px 32px;
    background: var(--ado-fill-subtle, rgba(0,0,0,0.15));
    border: 1px solid var(--ado-border);
    border-radius: 8px;
    color: var(--ado-text);
    font-size: 12.5px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.ado-pm-search-input:focus {
    border-color: var(--ado-primary);
    box-shadow: 0 0 0 2px var(--ado-primary-010, rgba(var(--ado-primary-rgb, 139,92,246), 0.1));
}

.ado-pm-search-input::placeholder {
    color: var(--ado-text-dim);
}

.ado-pm-search-clear {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--ado-text-dim);
    cursor: pointer;
    padding: 4px;
    display: flex;
    border-radius: 4px;
}

.ado-pm-search-clear:hover {
    color: var(--ado-text);
    background: var(--ado-fill-subtle, rgba(0,0,0,0.1));
}

/* ─── Filter Pills ──────────────────────────────────────── */
.ado-pm-filters {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}

.ado-pm-filter-btn {
    padding: 4px 10px;
    border: 1px solid var(--ado-border);
    border-radius: 14px;
    background: transparent;
    color: var(--ado-text-muted);
    font-size: 11px;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
}

.ado-pm-filter-btn:hover {
    border-color: var(--ado-text-dim);
    color: var(--ado-text);
}

.ado-pm-filter-btn--active {
    background: var(--ado-primary-010, rgba(var(--ado-primary-rgb, 139,92,246), 0.12));
    border-color: var(--ado-primary);
    color: var(--ado-primary);
}

/* ─── Toolbar Buttons ───────────────────────────────────── */
.ado-pm-icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: 1px solid var(--ado-border);
    border-radius: 8px;
    background: transparent;
    color: var(--ado-text-muted);
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s ease;
}

.ado-pm-icon-btn:hover {
    background: var(--ado-fill-subtle, rgba(0,0,0,0.1));
    color: var(--ado-text);
    border-color: var(--ado-text-dim);
}

.ado-pm-icon-btn--primary {
    background: var(--ado-primary-010, rgba(var(--ado-primary-rgb, 139,92,246), 0.12));
    border-color: var(--ado-primary);
    color: var(--ado-primary);
}

.ado-pm-icon-btn--primary:hover {
    background: var(--ado-primary-020, rgba(var(--ado-primary-rgb, 139,92,246), 0.2));
}

/* ─── Sort Dropdown ─────────────────────────────────────── */
.ado-pm-sort {
    position: relative;
}

.ado-pm-sort-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 8px;
    border: 1px solid var(--ado-border);
    border-radius: 8px;
    background: transparent;
    color: var(--ado-text-muted);
    font-size: 11px;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s ease;
}

.ado-pm-sort-btn:hover {
    color: var(--ado-text);
    border-color: var(--ado-text-dim);
}

.ado-pm-sort-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 120px;
    padding: 4px;
    background: var(--ado-bg-elevated, rgba(30,30,40,0.95));
    border: 1px solid var(--ado-border);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    z-index: 20;
    backdrop-filter: blur(12px);
}

.ado-pm-sort-option {
    display: block;
    width: 100%;
    padding: 6px 10px;
    border: none;
    border-radius: 5px;
    background: transparent;
    color: var(--ado-text-muted);
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    text-align: left;
    transition: background 0.1s ease;
}

.ado-pm-sort-option:hover {
    background: var(--ado-fill-subtle, rgba(0,0,0,0.15));
    color: var(--ado-text);
}

.ado-pm-sort-option--active {
    color: var(--ado-primary);
}

.ado-pm-sort-divider {
    height: 1px;
    background: var(--ado-border);
    margin: 4px 6px;
}

/* ─── Persona Count ─────────────────────────────────────── */
.ado-pm-count {
    font-size: 11px;
    color: var(--ado-text-dim);
    padding: 0 2px;
    white-space: nowrap;
}

/* ─── Scrollable Content ────────────────────────────────── */
.ado-pm-content {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 6px 14px 14px;
}

/* ─── Grid View ─────────────────────────────────────────── */
.ado-pm-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
}

/* ─── Grid: Inline Editor Span ─────────────────────────── */
.ado-pm-grid > .ado-pm-editor {
    grid-column: 1 / -1;
}

/* ─── List View ─────────────────────────────────────────── */
.ado-pm-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

/* ─── Persona Card (Grid) ───────────────────────────────── */
.ado-pm-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 6px 8px;
    border-radius: 10px;
    background: var(--ado-fill-subtle, rgba(0,0,0,0.12));
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.15s ease;
    overflow: hidden;
}

.ado-pm-card:hover {
    background: var(--ado-fill-light, rgba(0,0,0,0.18));
    border-color: var(--ado-border);
}

.ado-pm-card--selected {
    background: var(--ado-primary-010, rgba(var(--ado-primary-rgb, 139,92,246), 0.1));
    border-color: var(--ado-primary);
    box-shadow: 0 0 0 1px var(--ado-primary-010, rgba(var(--ado-primary-rgb, 139,92,246), 0.1));
}

.ado-pm-card--active {
    box-shadow: 0 0 8px var(--ado-primary-020, rgba(var(--ado-primary-rgb, 139,92,246), 0.25));
}

.ado-pm-card-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--ado-fill-medium, rgba(0,0,0,0.2));
    flex-shrink: 0;
    margin-bottom: 6px;
}

.ado-pm-card-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.ado-pm-card-avatar--placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ado-text-dim);
}

.ado-pm-card-name {
    font-size: 11.5px;
    font-weight: 500;
    color: var(--ado-text);
    text-align: center;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.3;
}

/* ─── Lock Badges ───────────────────────────────────────── */
.ado-pm-badges {
    position: absolute;
    top: 4px;
    right: 4px;
    display: flex;
    gap: 2px;
}

.ado-pm-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 9px;
    font-size: 10px;
}

.ado-pm-badge--default {
    background: var(--ado-warning-010, rgba(250,204,21,0.15));
    color: var(--ado-warning, #facc15);
}

.ado-pm-badge--locked {
    background: var(--ado-primary-010, rgba(var(--ado-primary-rgb, 139,92,246), 0.15));
    color: var(--ado-primary);
}

.ado-pm-badge--connected {
    background: var(--ado-success-010, rgba(34,197,94,0.15));
    color: var(--ado-success, #22c55e);
}

/* ─── Persona Card (List) ───────────────────────────────── */
.ado-pm-list-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 8px;
    background: var(--ado-fill-subtle, rgba(0,0,0,0.1));
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.15s ease;
}

.ado-pm-list-card:hover {
    background: var(--ado-fill-light, rgba(0,0,0,0.16));
    border-color: var(--ado-border);
}

.ado-pm-list-card--selected {
    background: var(--ado-primary-010, rgba(var(--ado-primary-rgb, 139,92,246), 0.1));
    border-color: var(--ado-primary);
}

.ado-pm-list-card--active {
    box-shadow: 0 0 6px var(--ado-primary-020, rgba(var(--ado-primary-rgb, 139,92,246), 0.2));
}

.ado-pm-list-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--ado-fill-medium, rgba(0,0,0,0.2));
    flex-shrink: 0;
}

.ado-pm-list-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.ado-pm-list-info {
    flex: 1;
    min-width: 0;
}

.ado-pm-list-name {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--ado-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ado-pm-list-title {
    font-size: 11px;
    color: var(--ado-text-dim);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 1px;
}

.ado-pm-list-badges {
    display: flex;
    gap: 3px;
    flex-shrink: 0;
}

/* ─── Create Form ───────────────────────────────────────── */
.ado-pm-create {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: var(--ado-fill-subtle, rgba(0,0,0,0.1));
    border-bottom: 1px solid var(--ado-border);
    flex-shrink: 0;
}

.ado-pm-create-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px dashed var(--ado-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ado-text-dim);
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s ease;
    overflow: hidden;
    background: var(--ado-fill-subtle, rgba(0,0,0,0.1));
}

.ado-pm-create-avatar:hover {
    border-color: var(--ado-primary);
    color: var(--ado-primary);
}

.ado-pm-create-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.ado-pm-create-input {
    flex: 1;
    min-width: 0;
    padding: 7px 10px;
    background: var(--ado-fill-subtle, rgba(0,0,0,0.12));
    border: 1px solid var(--ado-border);
    border-radius: 8px;
    color: var(--ado-text);
    font-size: 12.5px;
    font-family: inherit;
    outline: none;
}

.ado-pm-create-input:focus {
    border-color: var(--ado-primary);
}

.ado-pm-create-input::placeholder {
    color: var(--ado-text-dim);
}

.ado-pm-create-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
}

/* ─── Editor Panel ──────────────────────────────────────── */
.ado-pm-editor {
    background: var(--ado-fill-subtle, rgba(0,0,0,0.08));
    border: 1px solid var(--ado-border);
    border-radius: 10px;
    margin: 8px 0;
    overflow: hidden;
    animation: lumiversePmSlideDown 0.2s ease;
}

@keyframes lumiversePmSlideDown {
    from { opacity: 0; max-height: 0; }
    to { opacity: 1; max-height: 2000px; }
}

.ado-pm-editor-inner {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

/* ─── Editor: Avatar Drop Zone ──────────────────────────── */
.ado-pm-avatar-zone {
    display: flex;
    align-items: center;
    gap: 12px;
}

.ado-pm-avatar-preview {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--ado-fill-medium, rgba(0,0,0,0.2));
    flex-shrink: 0;
    position: relative;
    cursor: pointer;
}

.ado-pm-avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.ado-pm-avatar-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    opacity: 0;
    transition: opacity 0.15s ease;
    border-radius: 50%;
}

.ado-pm-avatar-preview:hover .ado-pm-avatar-overlay {
    opacity: 1;
}

.ado-pm-avatar-fields {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

/* ─── Editor: Section Headers ───────────────────────────── */
.ado-pm-section-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--ado-text-dim);
    margin-bottom: 6px;
}

/* ─── Editor: Description Controls ──────────────────────── */
.ado-pm-desc-controls {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.ado-pm-desc-select {
    padding: 5px 8px;
    background: var(--ado-fill-subtle, rgba(0,0,0,0.12));
    border: 1px solid var(--ado-border);
    border-radius: 6px;
    color: var(--ado-text);
    font-size: 11.5px;
    font-family: inherit;
    cursor: pointer;
    appearance: none;
    min-width: 0;
}

.ado-pm-desc-select:focus {
    border-color: var(--ado-primary);
    outline: none;
}

/* ─── Editor: Action Buttons ────────────────────────────── */
.ado-pm-actions {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    padding-top: 10px;
    border-top: 1px solid var(--ado-border);
}

.ado-pm-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border-radius: 7px;
    font-size: 12px;
    font-family: inherit;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid var(--ado-border);
    background: transparent;
    color: var(--ado-text-muted);
    transition: all 0.15s ease;
    white-space: nowrap;
}

.ado-pm-btn:hover {
    background: var(--ado-fill-subtle, rgba(0,0,0,0.1));
    color: var(--ado-text);
    border-color: var(--ado-text-dim);
}

.ado-pm-btn--primary {
    background: var(--ado-primary-010, rgba(var(--ado-primary-rgb, 139,92,246), 0.12));
    border-color: var(--ado-primary);
    color: var(--ado-primary);
}

.ado-pm-btn--primary:hover {
    background: var(--ado-primary-020, rgba(var(--ado-primary-rgb, 139,92,246), 0.2));
}

.ado-pm-btn--danger {
    color: var(--ado-danger, #ef4444);
}

.ado-pm-btn--danger:hover {
    background: rgba(239,68,68,0.1);
    border-color: var(--ado-danger, #ef4444);
    color: var(--ado-danger, #ef4444);
}

/* ─── Empty State ───────────────────────────────────────── */
.ado-pm-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
    color: var(--ado-text-dim);
    gap: 10px;
}

.ado-pm-empty-icon {
    opacity: 0.4;
}

.ado-pm-empty-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--ado-text-muted);
}

.ado-pm-empty-subtitle {
    font-size: 12px;
    line-height: 1.4;
}

/* ─── Textarea ──────────────────────────────────────────── */
.ado-pm-textarea {
    width: 100%;
    padding: 8px 10px;
    background: var(--ado-fill-subtle, rgba(0,0,0,0.12));
    border: 1px solid var(--ado-border);
    border-radius: 8px;
    color: var(--ado-text);
    font-size: 12.5px;
    font-family: inherit;
    line-height: 1.5;
    resize: vertical;
    min-height: 60px;
    outline: none;
    transition: border-color 0.15s ease;
}

.ado-pm-textarea:focus {
    border-color: var(--ado-primary);
}

/* ─── Input ─────────────────────────────────────────────── */
.ado-pm-input {
    width: 100%;
    padding: 7px 10px;
    background: var(--ado-fill-subtle, rgba(0,0,0,0.12));
    border: 1px solid var(--ado-border);
    border-radius: 8px;
    color: var(--ado-text);
    font-size: 12.5px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s ease;
}

.ado-pm-input:focus {
    border-color: var(--ado-primary);
}

/* ─── Connections List ──────────────────────────────────── */
.ado-pm-connections {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.ado-pm-connection {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 8px;
    border-radius: 6px;
    background: var(--ado-fill-subtle, rgba(0,0,0,0.08));
    font-size: 12px;
    color: var(--ado-text-muted);
}

.ado-pm-connection-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ado-pm-connection-remove {
    background: none;
    border: none;
    color: var(--ado-text-dim);
    cursor: pointer;
    padding: 2px;
    display: flex;
    border-radius: 4px;
}

.ado-pm-connection-remove:hover {
    color: var(--ado-danger, #ef4444);
}

/* ─── Toggle Switches ───────────────────────────────────── */
.ado-pm-toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 0;
}

.ado-pm-toggle-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    color: var(--ado-text-muted);
}

.ado-pm-toggle {
    position: relative;
    width: 36px;
    height: 20px;
    border-radius: 10px;
    background: var(--ado-fill-medium, rgba(0,0,0,0.25));
    border: 1px solid var(--ado-border);
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.ado-pm-toggle--on {
    background: var(--ado-primary);
    border-color: var(--ado-primary);
}

.ado-pm-toggle-knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: white;
    transition: transform 0.2s ease;
}

.ado-pm-toggle--on .ado-pm-toggle-knob {
    transform: translateX(16px);
}

/* ─── Confirmation Overlay ──────────────────────────────── */
.ado-pm-confirm {
    padding: 12px;
    background: var(--ado-fill-medium, rgba(0,0,0,0.2));
    border-radius: 8px;
    text-align: center;
}

.ado-pm-confirm-text {
    font-size: 12.5px;
    color: var(--ado-text);
    margin-bottom: 10px;
}

.ado-pm-confirm-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
}

/* ─── Mobile (2-column grid) ────────────────────────────── */
@media (max-width: 600px) {
    .ado-pm-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
`;
