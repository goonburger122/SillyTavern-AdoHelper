import React, { useState, useCallback, useMemo, useRef, useEffect, useLayoutEffect, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';
import {
    Search, X, User, UsersRound, Star, ChevronDown, ArrowUpDown,
    Grid3x3, List, Tag, FolderOpen, Loader2, Pencil, ChevronRight, Check, CheckSquare,
    GripVertical, RotateCcw, Maximize2, Plus, UserPlus, FileUp, Globe, Upload, Trash2,
} from 'lucide-react';
import {
    DndContext, closestCenter, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    arrayMove, SortableContext, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useCharacterBrowser from '../../hooks/useCharacterBrowser';
import useIsMobile from '../../hooks/useIsMobile';
import LazyImage from '../shared/LazyImage';
import CharacterCardEditor from './CharacterCardEditor';
import { useAdoHelperStore, useAdoHelperActions } from '../../store/AdoHelperContext';
import { IMPORT_ACCEPTED_TYPES } from '../../../lib/characterBrowserService';
import ConfirmationModal from '../shared/ConfirmationModal';

const store = useAdoHelperStore;

// ─── Search Input ──────────────────────────────────────────────
function SearchInput({ value, onChange, placeholder }) {
    return (
        <div className="ado-cb-search">
            <span className="ado-cb-search-icon">
                <Search size={16} strokeWidth={1.5} />
            </span>
            <input
                type="text"
                className="ado-cb-search-input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {value && (
                <button
                    className="ado-cb-search-clear"
                    onClick={() => onChange('')}
                    type="button"
                >
                    <X size={14} strokeWidth={2} />
                </button>
            )}
        </div>
    );
}

// ─── Filter Tabs ───────────────────────────────────────────────
const FILTER_OPTIONS = [
    { id: 'all', label: 'All' },
    { id: 'characters', label: 'Chars' },
    { id: 'groups', label: 'Groups' },
    { id: 'favorites', label: 'Favs' },
];

function FilterTabs({ activeFilter, onFilterChange }) {
    return (
        <div className="ado-cb-filters">
            {FILTER_OPTIONS.map((f) => (
                <button
                    key={f.id}
                    className={clsx('ado-cb-filter-btn', activeFilter === f.id && 'ado-cb-filter-btn--active')}
                    onClick={() => onFilterChange(f.id)}
                    type="button"
                >
                    {f.label}
                </button>
            ))}
        </div>
    );
}

// ─── Sort Dropdown ─────────────────────────────────────────────
const SORT_OPTIONS = [
    { id: 'name', label: 'Name' },
    { id: 'recent', label: 'Recent' },
    { id: 'added', label: 'Added' },
    { id: 'size', label: 'Size' },
];

function SortDropdown({ sortBy, onSortChange, sortDirection, onToggleDirection, isOpen, onToggle }) {
    const ref = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onToggle(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen, onToggle]);

    return (
        <div className="ado-cb-sort" ref={ref}>
            <button
                className="ado-cb-sort-btn"
                onClick={() => onToggle(!isOpen)}
                type="button"
                title="Sort by"
            >
                <ArrowUpDown size={14} strokeWidth={1.5} />
                <span className="ado-cb-sort-label">{SORT_OPTIONS.find(s => s.id === sortBy)?.label}</span>
                <ChevronDown size={12} strokeWidth={2} className={clsx('ado-cb-sort-chevron', isOpen && 'ado-cb-sort-chevron--open')} />
            </button>
            {isOpen && (
                <div className="ado-cb-sort-dropdown">
                    {SORT_OPTIONS.map((opt) => (
                        <button
                            key={opt.id}
                            className={clsx('ado-cb-sort-option', sortBy === opt.id && 'ado-cb-sort-option--active')}
                            onClick={() => { onSortChange(opt.id); onToggle(false); }}
                            type="button"
                        >
                            {opt.label}
                        </button>
                    ))}
                    <div className="ado-cb-sort-divider" />
                    <button
                        className="ado-cb-sort-option"
                        onClick={() => { onToggleDirection(); onToggle(false); }}
                        type="button"
                    >
                        {sortDirection === 'asc' ? 'Descending' : 'Ascending'}
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── View Toggle ───────────────────────────────────────────────
function ViewToggle({ viewMode, onToggle }) {
    return (
        <button
            className="ado-cb-view-toggle"
            onClick={() => onToggle(viewMode === 'grid' ? 'list' : 'grid')}
            type="button"
            title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
        >
            {viewMode === 'grid' ? <List size={15} strokeWidth={1.5} /> : <Grid3x3 size={15} strokeWidth={1.5} />}
        </button>
    );
}

// ─── Add (Import) Menu ──────────────────────────────────────────
function AddMenu({ isOpen, onToggle, onCreateNew, onImportFile, onImportUrl }) {
    const ref = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onToggle(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen, onToggle]);

    return (
        <div className="ado-cb-add" ref={ref}>
            <button
                className="ado-cb-add-btn"
                onClick={() => onToggle(!isOpen)}
                type="button"
                title="Add character"
            >
                <Plus size={15} strokeWidth={2} />
            </button>
            {isOpen && (
                <div className="ado-cb-add-dropdown">
                    <button
                        className="ado-cb-add-option"
                        onClick={() => { onCreateNew(); onToggle(false); }}
                        type="button"
                    >
                        <UserPlus size={14} strokeWidth={1.5} />
                        <span>Create New</span>
                    </button>
                    <button
                        className="ado-cb-add-option"
                        onClick={() => { onImportFile(); onToggle(false); }}
                        type="button"
                    >
                        <FileUp size={14} strokeWidth={1.5} />
                        <span>Import File</span>
                    </button>
                    <button
                        className="ado-cb-add-option"
                        onClick={() => { onImportUrl(); onToggle(false); }}
                        type="button"
                    >
                        <Globe size={14} strokeWidth={1.5} />
                        <span>Import URL</span>
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Tag Multi-Select Dropdown ─────────────────────────────────
function TagMultiSelect({ tags, selectedTags, onToggleTag, onClear, isOpen, onToggle }) {
    const ref = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onToggle(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen, onToggle]);

    if (tags.length === 0) return null;

    const count = selectedTags.size;

    return (
        <div className="ado-cb-tag-select" ref={ref}>
            <button
                className={clsx('ado-cb-tag-select-btn', count > 0 && 'ado-cb-tag-select-btn--active')}
                onClick={() => onToggle(!isOpen)}
                type="button"
                title="Filter by tags"
            >
                <Tag size={14} strokeWidth={1.5} />
                <span className="ado-cb-tag-select-label">Tags</span>
                {count > 0 && <span className="ado-cb-tag-select-badge">{count}</span>}
                <ChevronDown size={12} strokeWidth={2} className={clsx('ado-cb-sort-chevron', isOpen && 'ado-cb-sort-chevron--open')} />
            </button>
            {isOpen && (
                <div className="ado-cb-tag-select-dropdown">
                    {count > 0 && (
                        <>
                            <button
                                className="ado-cb-tag-select-item ado-cb-tag-select-clear"
                                onClick={() => { onClear(); onToggle(false); }}
                                type="button"
                            >
                                <X size={12} strokeWidth={2} />
                                <span>Clear all</span>
                            </button>
                            <div className="ado-cb-sort-divider" />
                        </>
                    )}
                    <div className="ado-cb-tag-select-list">
                        {tags.map((tag) => {
                            const isSelected = selectedTags.has(tag.id);
                            return (
                                <button
                                    key={tag.id}
                                    className={clsx('ado-cb-tag-select-item', isSelected && 'ado-cb-tag-select-item--active')}
                                    onClick={() => onToggleTag(tag.id)}
                                    type="button"
                                >
                                    {tag.bg ? (
                                        <span className="ado-cb-tag-select-dot" style={{ background: tag.bg }} />
                                    ) : (
                                        <span className="ado-cb-tag-select-dot ado-cb-tag-select-dot--neutral" />
                                    )}
                                    <span className="ado-cb-tag-select-name">{tag.name}</span>
                                    {isSelected && <Check size={13} strokeWidth={2.5} className="ado-cb-tag-select-check" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Favorites Slider ──────────────────────────────────────────
function FavoritesSlider({ items, activeCharacterId, onSelect }) {
    if (!items || items.length === 0) return null;
    return (
        <div className="ado-cb-favorites">
            <div className="ado-cb-favorites-scroll">
                {items.map((item) => (
                    <button
                        key={item.id}
                        className={clsx('ado-cb-fav-item', item.id === activeCharacterId && 'ado-cb-fav-item--active')}
                        onClick={() => onSelect(item)}
                        type="button"
                        title={item.name}
                    >
                        <div className="ado-cb-fav-avatar">
                            <LazyImage
                                src={item.avatarUrl}
                                alt=""
                                spinnerSize={12}
                                fallback={<User size={20} strokeWidth={1.5} />}
                            />
                        </div>
                        <span className="ado-cb-fav-name">{item.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Group Avatar Stack ────────────────────────────────────────
// Mirrors the Landing Page's GroupAvatarStack layout: 2/3/4/5+ member grids
function GroupAvatarStack({ members }) {
    const totalMembers = (members || []).length;
    if (totalMembers === 0) return <UsersRound size={28} strokeWidth={1} />;

    const maxAvatars = totalMembers >= 5 ? 3 : 4;
    const shown = members.slice(0, maxAvatars);
    const overflow = totalMembers > maxAvatars ? totalMembers - maxAvatars : 0;
    const countAttr = totalMembers >= 5 ? '5+' : String(totalMembers);

    return (
        <div className="ado-cb-group-stack" data-count={countAttr}>
            {shown.map((m, i) => (
                <div
                    key={`${m.avatar || i}`}
                    className="ado-cb-group-avatar"
                    style={{ zIndex: maxAvatars - i }}
                >
                    <LazyImage
                        src={m.avatarUrl}
                        alt=""
                        spinnerSize={10}
                        fallback={<User size={14} strokeWidth={1.5} />}
                    />
                </div>
            ))}
            {overflow > 0 && (
                <div className="ado-cb-group-overflow">
                    <span>+{overflow}</span>
                </div>
            )}
        </div>
    );
}

// ─── Character Card (Grid) ─────────────────────────────────────
const CharacterCardGrid = memo(function CharacterCardGrid({
    item, isActive, onSelect, onToggleFavorite, onEdit, onDelete, isBatchMode, isSelected,
}) {
    const showGroupStack = item.isGroup && item.members?.length > 0;
    return (
        <div
            className={clsx(
                'ado-cb-card',
                isActive && 'ado-cb-card--active',
                isSelected && 'ado-cb-card--selected',
            )}
            onClick={() => onSelect(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(item); } }}
        >
            {/* Batch selection check overlay */}
            {isBatchMode && !item.isGroup && (
                <div className={clsx('ado-cb-card-check', isSelected && 'ado-cb-card-check--active')}>
                    <Check size={16} strokeWidth={3} />
                </div>
            )}
            <div className="ado-cb-card-avatar">
                {showGroupStack ? (
                    <GroupAvatarStack members={item.members} />
                ) : item.avatarUrl ? (
                    <LazyImage src={item.avatarUrl} alt={item.name} />
                ) : (
                    <div className="ado-cb-card-placeholder">
                        {item.isGroup ? <UsersRound size={28} strokeWidth={1} /> : <User size={28} strokeWidth={1} />}
                    </div>
                )}
                {item.isGroup && (
                    <span className="ado-cb-card-group-badge" title="Group">
                        <UsersRound size={10} strokeWidth={2} />
                        <span>{item.memberCount}</span>
                    </span>
                )}
            </div>
            <div className="ado-cb-card-info">
                <span className="ado-cb-card-name" title={item.name}>{item.name}</span>
                {item.creator && <span className="ado-cb-card-creator">{item.creator}</span>}
                {item.tagNames.length > 0 && (
                    <div className="ado-cb-card-tags">
                        {item.tagNames.slice(0, 2).map((tag, i) => {
                            const tc = item.tagColors?.[i];
                            const pillStyle = tc?.bg ? { background: tc.bg, color: tc.fg || '#fff', borderColor: 'transparent' } : undefined;
                            return (
                                <span key={i} className="ado-cb-card-tag-pill" style={pillStyle}>{tag}</span>
                            );
                        })}
                        {item.tagNames.length > 2 && (
                            <span className="ado-cb-card-tag-pill ado-cb-card-tag-more">+{item.tagNames.length - 2}</span>
                        )}
                    </div>
                )}
            </div>
            {!isBatchMode && onEdit && !item.isGroup && (
                <button
                    className="ado-cb-card-edit"
                    onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                    type="button"
                    title="Edit character card"
                >
                    <Pencil size={14} strokeWidth={1.5} />
                </button>
            )}
            {!isBatchMode && onDelete && !item.isGroup && (
                <button
                    className="ado-cb-card-delete"
                    onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                    type="button"
                    title="Delete character"
                >
                    <Trash2 size={14} strokeWidth={1.5} />
                </button>
            )}
            {!isBatchMode && (
                <button
                    className={clsx('ado-cb-card-star', item.isFavorite && 'ado-cb-card-star--active')}
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id); }}
                    type="button"
                    title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                    <Star size={15} strokeWidth={item.isFavorite ? 0 : 1.5} fill={item.isFavorite ? 'currentColor' : 'none'} />
                </button>
            )}
        </div>
    );
}, areCardPropsEqual);

// ─── Character Card (List) ─────────────────────────────────────
const CharacterCardList = memo(function CharacterCardList({
    item, isActive, onSelect, onToggleFavorite, onEdit, onDelete, isBatchMode, isSelected,
}) {
    return (
        <div
            className={clsx(
                'ado-cb-list-row',
                isActive && 'ado-cb-list-row--active',
                isSelected && 'ado-cb-list-row--selected',
            )}
            onClick={() => onSelect(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(item); } }}
        >
            {isBatchMode && !item.isGroup && (
                <div className={clsx('ado-cb-list-check', isSelected && 'ado-cb-list-check--active')}>
                    <Check size={14} strokeWidth={3} />
                </div>
            )}
            <div className="ado-cb-list-avatar">
                <LazyImage
                    src={item.avatarUrl}
                    alt=""
                    spinnerSize={12}
                    fallback={item.isGroup ? <UsersRound size={18} strokeWidth={1.5} /> : <User size={18} strokeWidth={1.5} />}
                />
            </div>
            <span className="ado-cb-list-name" title={item.name}>{item.name}</span>
            {item.creator && <span className="ado-cb-list-creator">{item.creator}</span>}
            {item.tagNames.length > 0 && (
                <span className="ado-cb-list-tags" title={item.tagNames.join(', ')}>
                    <Tag size={10} strokeWidth={1.5} />
                    {item.tagNames.length}
                </span>
            )}
            {!isBatchMode && onEdit && !item.isGroup && (
                <button
                    className="ado-cb-card-edit"
                    onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                    type="button"
                    title="Edit character card"
                >
                    <Pencil size={14} strokeWidth={1.5} />
                </button>
            )}
            {!isBatchMode && onDelete && !item.isGroup && (
                <button
                    className="ado-cb-card-delete"
                    onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                    type="button"
                    title="Delete character"
                >
                    <Trash2 size={14} strokeWidth={1.5} />
                </button>
            )}
            {!isBatchMode && (
                <button
                    className={clsx('ado-cb-card-star', item.isFavorite && 'ado-cb-card-star--active')}
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id); }}
                    type="button"
                    title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                    <Star size={14} strokeWidth={item.isFavorite ? 0 : 1.5} fill={item.isFavorite ? 'currentColor' : 'none'} />
                </button>
            )}
        </div>
    );
}, areCardPropsEqual);

/** Custom memo comparator for character cards */
function areCardPropsEqual(prev, next) {
    return (
        prev.item.id === next.item.id &&
        prev.item.name === next.item.name &&
        prev.item.avatarUrl === next.item.avatarUrl &&
        prev.item.isFavorite === next.item.isFavorite &&
        prev.item.isGroup === next.item.isGroup &&
        prev.item.memberCount === next.item.memberCount &&
        prev.item.creator === next.item.creator &&
        prev.item.tagNames === next.item.tagNames &&
        prev.item.tagColors === next.item.tagColors &&
        prev.isActive === next.isActive &&
        prev.isBatchMode === next.isBatchMode &&
        prev.isSelected === next.isSelected &&
        prev.onSelect === next.onSelect &&
        prev.onToggleFavorite === next.onToggleFavorite &&
        prev.onEdit === next.onEdit &&
        prev.onDelete === next.onDelete
    );
}

// ─── Folder Header Button (shared between static and sortable) ──
function FolderHeaderButton({ folder, effectiveOpen, onToggle }) {
    return (
        <button
            className="ado-cb-folder-header"
            onClick={onToggle}
            type="button"
        >
            <ChevronDown
                size={14}
                strokeWidth={2}
                className={clsx('ado-cb-folder-chevron', effectiveOpen && 'ado-cb-folder-chevron--open')}
            />
            <FolderOpen size={14} strokeWidth={1.5} />
            <span className="ado-cb-folder-name">{folder.name}</span>
            <span className="ado-cb-folder-count">{folder.count}</span>
        </button>
    );
}

// ─── Folder Section (static, no DnD) ───────────────────────────
function FolderSection({ folder, expandedFolders, onToggle, items, renderContent }) {
    const handleToggle = useCallback(() => {
        onToggle(folder.defaultOpen ? `__closed_${folder.id}` : folder.id);
    }, [folder, onToggle]);

    const effectiveOpen = folder.defaultOpen
        ? !expandedFolders.has(`__closed_${folder.id}`)
        : expandedFolders.has(folder.id);

    return (
        <div className="ado-cb-folder">
            <FolderHeaderButton folder={folder} effectiveOpen={effectiveOpen} onToggle={handleToggle} />
            {effectiveOpen && (
                <div className="ado-cb-folder-content">
                    {renderContent(items)}
                </div>
            )}
        </div>
    );
}

// ─── Sortable Folder Section (DnD-enabled) ─────────────────────
function SortableFolderSection({ folder, expandedFolders, onToggle, items, renderContent }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: folder.id });

    const handleToggle = useCallback(() => {
        onToggle(folder.defaultOpen ? `__closed_${folder.id}` : folder.id);
    }, [folder, onToggle]);

    const effectiveOpen = folder.defaultOpen
        ? !expandedFolders.has(`__closed_${folder.id}`)
        : expandedFolders.has(folder.id);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : undefined,
    };

    return (
        <div className="ado-cb-folder" ref={setNodeRef} style={style} {...attributes}>
            <div className="ado-cb-folder-header-row">
                <span className="ado-cb-folder-drag-handle" {...listeners}>
                    <GripVertical size={14} strokeWidth={1.5} />
                </span>
                <FolderHeaderButton folder={folder} effectiveOpen={effectiveOpen} onToggle={handleToggle} />
            </div>
            {effectiveOpen && (
                <div className="ado-cb-folder-content">
                    {renderContent(items)}
                </div>
            )}
        </div>
    );
}

// ─── Active Character Bar ─────────────────────────────────────
function ActiveCharacterBar({ item, onClick }) {
    if (!item) return null;
    return (
        <button
            className="ado-cb-active-bar"
            onClick={() => onClick(item)}
            type="button"
        >
            <div className="ado-cb-active-bar-avatar">
                <LazyImage
                    src={item.avatarUrl}
                    alt=""
                    spinnerSize={10}
                    fallback={<User size={14} strokeWidth={1.5} />}
                />
            </div>
            <span className="ado-cb-active-bar-name">{item.name}</span>
            <span className="ado-cb-active-bar-action">
                <Pencil size={11} strokeWidth={2} />
                <span>Edit</span>
                <ChevronRight size={12} strokeWidth={2} />
            </span>
        </button>
    );
}

// ─── Virtualized Character List ────────────────────────────────
function VirtualizedGrid({ items, activeCharacterId, onSelect, onToggleFavorite, onEdit, onDelete, containerRef, isBatchMode, batchSelected }) {
    const isMobile = useIsMobile();
    const [cols, setCols] = useState(isMobile ? 2 : 3);

    // Compute columns from container width
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new ResizeObserver((entries) => {
            const w = entries[0].contentRect.width;
            const minCard = isMobile ? 120 : 140;
            setCols(Math.max(2, Math.floor(w / minCard)));
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [containerRef, isMobile]);

    const rows = useMemo(() => {
        const result = [];
        for (let i = 0; i < items.length; i += cols) {
            result.push(items.slice(i, i + cols));
        }
        return result;
    }, [items, cols]);

    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => containerRef.current,
        estimateSize: () => 240,
        overscan: 5,
        measureElement: (el) => el?.getBoundingClientRect().height ?? 240,
    });

    return (
        <div
            style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}
        >
            {virtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                    <div
                        key={virtualRow.key}
                        ref={virtualizer.measureElement}
                        data-index={virtualRow.index}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${virtualRow.start}px)`,
                        }}
                    >
                        <div className="ado-cb-grid-row" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                            {row.map((item) => (
                                <CharacterCardGrid
                                    key={item.id}
                                    item={item}
                                    isActive={item.id === activeCharacterId}
                                    onSelect={onSelect}
                                    onToggleFavorite={onToggleFavorite}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    isBatchMode={isBatchMode}
                                    isSelected={batchSelected?.has(item.id)}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function VirtualizedList({ items, activeCharacterId, onSelect, onToggleFavorite, onEdit, onDelete, containerRef, isBatchMode, batchSelected }) {
    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => containerRef.current,
        estimateSize: () => 48,
        overscan: 10,
    });

    return (
        <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
                const item = items[virtualRow.index];
                return (
                    <div
                        key={virtualRow.key}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                        }}
                    >
                        <CharacterCardList
                            item={item}
                            isActive={item.id === activeCharacterId}
                            onSelect={onSelect}
                            onToggleFavorite={onToggleFavorite}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            isBatchMode={isBatchMode}
                            isSelected={batchSelected?.has(item.id)}
                        />
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main Character Browser Panel ──────────────────────────────
function CharacterBrowser({ wideMode = false, onDismiss, onBatchStateChange } = {}) {
    const {
        characters, favoriteItems, tags, folderGroups, activeCharacterId, totalCount,
        searchQuery, setSearchQuery,
        sortBy, setSortBy, sortDirection, toggleSortDirection,
        filterType, setFilterType,
        selectedTags, toggleTag, clearTags,
        viewMode, setViewMode,
        expandedFolders, toggleFolder,
        selectCharacter: handleSelect, toggleFavorite,
        enableResortableTagFolders, tagFolderOrder, setTagFolderOrder, resetTagFolderOrder,
        importState, handleImportFiles, handleCreateCharacter,
        deleteTarget, setDeleteTarget, confirmDelete, isDeleting,
        batchMode, toggleBatchMode, batchSelected, toggleBatchItem, clearBatchSelection,
        batchProgress, batchConfirmOpen, setBatchConfirmOpen, executeBatchDelete,
    } = useCharacterBrowser();

    const isMobile = useIsMobile();
    const actions = useAdoHelperActions();

    // Sync batch state to parent (for modal footer rendering)
    useEffect(() => {
        onBatchStateChange?.({
            batchMode, batchSelected, batchProgress, batchConfirmOpen,
            setBatchConfirmOpen, executeBatchDelete, clearBatchSelection,
        });
    }, [batchMode, batchSelected, batchProgress, batchConfirmOpen, onBatchStateChange, setBatchConfirmOpen, executeBatchDelete, clearBatchSelection]);

    // DnD sensors (only instantiated when feature is enabled)
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
        useSensor(KeyboardSensor),
    );

    const handleFolderDragEnd = useCallback((event) => {
        const { active, over } = event;
        if (!over || active.id === over.id || !folderGroups) return;
        const oldIndex = folderGroups.findIndex(f => f.id === active.id);
        const newIndex = folderGroups.findIndex(f => f.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;
        const reordered = arrayMove(folderGroups, oldIndex, newIndex);
        setTagFolderOrder(reordered.map(f => f.id));
    }, [folderGroups, setTagFolderOrder]);
    const scrollRef = useRef(null);
    const [isNavigating, setIsNavigating] = useState(false);

    // ─── Dropdown coordination (only one open at a time) ──
    const [openDropdown, setOpenDropdown] = useState(null); // 'sort' | 'tags' | 'add' | null
    const toggleSortDropdown = useCallback((open) => setOpenDropdown(open ? 'sort' : null), []);
    const toggleTagDropdown = useCallback((open) => setOpenDropdown(open ? 'tags' : null), []);
    const toggleAddDropdown = useCallback((open) => setOpenDropdown(open ? 'add' : null), []);

    // ─── Auto-sort after import ─────────────────────────────
    // When a character import succeeds, switch to "Created" descending so the
    // newly imported card(s) appear at the top of the list.
    const prevImportResult = useRef(null);
    useEffect(() => {
        const result = importState?.lastImportResult;
        if (result?.success && result !== prevImportResult.current) {
            setSortBy('added');
            if (sortDirection !== 'desc') toggleSortDirection();
        }
        prevImportResult.current = result;
    }, [importState?.lastImportResult, setSortBy, sortDirection, toggleSortDirection]);

    // ─── File Import ─────────────────────────────────────────
    const fileInputRef = useRef(null);
    const handleFileInputChange = useCallback((e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleImportFiles(files);
        }
        // Reset input so the same file can be selected again
        e.target.value = '';
    }, [handleImportFiles]);

    const triggerFileInput = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    // ─── Drag and Drop ──────────────────────────────────────
    const [isDragOver, setIsDragOver] = useState(false);
    const dragCounterRef = useRef(0);

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current++;
        if (e.dataTransfer?.types?.includes('Files')) {
            setIsDragOver(true);
        }
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current--;
        if (dragCounterRef.current <= 0) {
            dragCounterRef.current = 0;
            setIsDragOver(false);
        }
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current = 0;
        setIsDragOver(false);
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            handleImportFiles(files);
        }
    }, [handleImportFiles]);

    // ─── Editor View State ────────────────────────────────
    const [editorItem, setEditorItem] = useState(null);
    const savedScrollRef = useRef(0);

    // ─── Create New Character ────────────────────────────
    const handleCreateNew = useCallback(() => {
        if (scrollRef.current) {
            savedScrollRef.current = scrollRef.current.scrollTop;
        }
        setEditorItem({
            id: '__new__',
            isNew: true,
            name: '',
            avatar: '',
            avatarUrl: '',
        });
    }, []);

    // Restore scroll position when returning from editor
    useLayoutEffect(() => {
        if (!editorItem && scrollRef.current && savedScrollRef.current > 0) {
            scrollRef.current.scrollTop = savedScrollRef.current;
            savedScrollRef.current = 0;
        }
    }, [editorItem]);

    // Card click:
    //   - Groups → navigate to chat, stay on gallery
    //   - Characters (active) → open editor immediately
    //   - Characters (not active) → navigate to chat, then open editor
    const handleCardSelect = useCallback(async (item) => {
        if (!item.isGroup && item.id === activeCharacterId) {
            // Already in this character's chat — open editor directly
            if (scrollRef.current) {
                savedScrollRef.current = scrollRef.current.scrollTop;
            }
            setEditorItem(item);
            return;
        }

        if (isNavigating) return;
        setIsNavigating(true);
        try {
            await handleSelect(item);
            // Re-assert panel visibility — ST may close panels during navigation
            store.setState({ _ensureTab: 'characters' });
            // For characters, transition to editor after navigation
            if (!item.isGroup) {
                if (scrollRef.current) {
                    savedScrollRef.current = scrollRef.current.scrollTop;
                }
                setEditorItem(item);
            }
        } finally {
            setIsNavigating(false);
        }
    }, [handleSelect, isNavigating, activeCharacterId]);

    // Wide mode: navigate to chat + dismiss modal (no editor)
    const handleCardSelectWide = useCallback(async (item) => {
        // In batch mode, toggle selection instead of navigating (skip groups)
        if (batchMode && !item.isGroup) {
            toggleBatchItem(item.id);
            return;
        }
        if (isNavigating) return;
        setIsNavigating(true);
        try {
            await handleSelect(item);
            onDismiss?.();
        } finally {
            setIsNavigating(false);
        }
    }, [handleSelect, isNavigating, onDismiss, batchMode, toggleBatchItem]);

    const cardSelectHandler = wideMode ? handleCardSelectWide : handleCardSelect;

    // Direct edit — open editor without switching chat
    const handleDirectEdit = useCallback((item) => {
        if (scrollRef.current) {
            savedScrollRef.current = scrollRef.current.scrollTop;
        }
        setEditorItem(item);
    }, []);

    // Open chat from editor
    const handleOpenChat = useCallback(async () => {
        if (!editorItem || isNavigating) return;
        setIsNavigating(true);
        try {
            await handleSelect(editorItem);
        } finally {
            setIsNavigating(false);
            setEditorItem(null);
        }
    }, [editorItem, handleSelect, isNavigating]);

    // Delete handler — opens confirmation modal
    const handleDeleteRequest = useCallback((item) => {
        setDeleteTarget(item);
    }, [setDeleteTarget]);

    // Render folder-grouped content
    const editHandler = handleDirectEdit;
    const deleteHandler = handleDeleteRequest;
    const renderFolderContent = useCallback((folderItems) => {
        if (viewMode === 'grid') {
            const minCard = wideMode ? 200 : isMobile ? 120 : 140;
            return (
                <div className="ado-cb-grid" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${minCard}px, 1fr))` }}>
                    {folderItems.map((item) => (
                        <CharacterCardGrid
                            key={item.id}
                            item={item}
                            isActive={item.id === activeCharacterId}
                            onSelect={cardSelectHandler}
                            onToggleFavorite={toggleFavorite}
                            onEdit={editHandler}
                            onDelete={deleteHandler}
                            isBatchMode={batchMode && wideMode}
                            isSelected={batchSelected.has(item.id)}
                        />
                    ))}
                </div>
            );
        }
        return folderItems.map((item) => (
            <CharacterCardList
                key={item.id}
                item={item}
                isActive={item.id === activeCharacterId}
                onSelect={cardSelectHandler}
                onToggleFavorite={toggleFavorite}
                onEdit={editHandler}
                onDelete={deleteHandler}
                isBatchMode={batchMode && wideMode}
                isSelected={batchSelected.has(item.id)}
            />
        ));
    }, [viewMode, wideMode, isMobile, activeCharacterId, cardSelectHandler, toggleFavorite, editHandler, deleteHandler, batchMode, batchSelected]);

    const hasCharacters = totalCount > 0;

    // Resolve the active character item for the "Edit" bar
    const activeCharItem = useMemo(() => {
        if (!activeCharacterId || activeCharacterId.startsWith('group:')) return null;
        return characters.find((c) => c.id === activeCharacterId)
            || favoriteItems.find((c) => c.id === activeCharacterId)
            || null;
    }, [activeCharacterId, characters, favoriteItems]);

    // Open editor for the active character
    const handleEditActive = useCallback((item) => {
        if (scrollRef.current) {
            savedScrollRef.current = scrollRef.current.scrollTop;
        }
        setEditorItem(item);
    }, []);

    // Editor view — rendered instead of gallery when a character is selected
    if (editorItem) {
        return (
            <CharacterCardEditor
                item={editorItem}
                onBack={() => setEditorItem(null)}
                onOpenChat={wideMode ? undefined : handleOpenChat}
                wideMode={wideMode}
            />
        );
    }

    return (
        <div className={clsx('ado-cb-panel', wideMode && 'ado-cb-panel--wide')}>
            {/* Active Character Edit Bar */}
            {!wideMode && <ActiveCharacterBar item={activeCharItem} onClick={handleEditActive} />}

            {/* Favorites Slider */}
            <FavoritesSlider
                items={favoriteItems}
                activeCharacterId={activeCharacterId}
                onSelect={cardSelectHandler}
            />

            {/* Hidden file input for import */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={IMPORT_ACCEPTED_TYPES}
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
            />

            {/* Toolbar */}
            <div className="ado-cb-toolbar">
                <div className="ado-cb-search-row">
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search characters..."
                    />
                    <AddMenu
                        isOpen={openDropdown === 'add'}
                        onToggle={toggleAddDropdown}
                        onCreateNew={handleCreateNew}
                        onImportFile={triggerFileInput}
                        onImportUrl={() => actions.openModal('importUrl')}
                    />
                </div>
                <FilterTabs activeFilter={filterType} onFilterChange={setFilterType} />
                <div className="ado-cb-toolbar-actions">
                    <TagMultiSelect
                        tags={tags}
                        selectedTags={selectedTags}
                        onToggleTag={toggleTag}
                        onClear={clearTags}
                        isOpen={openDropdown === 'tags'}
                        onToggle={toggleTagDropdown}
                    />
                    <SortDropdown
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        sortDirection={sortDirection}
                        onToggleDirection={toggleSortDirection}
                        isOpen={openDropdown === 'sort'}
                        onToggle={toggleSortDropdown}
                    />
                    <ViewToggle viewMode={viewMode} onToggle={setViewMode} />
                    {wideMode && (
                        <button
                            className={clsx('ado-cb-batch-toggle', batchMode && 'ado-cb-batch-toggle--active')}
                            onClick={toggleBatchMode}
                            type="button"
                            title={batchMode ? 'Exit selection mode' : 'Select multiple characters'}
                        >
                            <CheckSquare size={15} strokeWidth={1.5} />
                        </button>
                    )}
                    {!isMobile && !wideMode && (
                        <button
                            className="ado-cb-expand-btn"
                            onClick={() => {
                                store.setState({ _closeDrawer: Date.now() });
                                actions.openModal('characterGallery');
                            }}
                            type="button"
                            title="Open wide gallery view"
                        >
                            <Maximize2 size={15} strokeWidth={1.5} />
                        </button>
                    )}
                </div>
            </div>

            {/* Character List */}
            <div
                className="ado-cb-list-container"
                ref={scrollRef}
                style={batchMode && wideMode ? { paddingBottom: 72 } : undefined}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {!hasCharacters ? (
                    <div className="ado-cb-empty">
                        <User size={32} strokeWidth={1} />
                        <span>No characters found</span>
                        <span className="ado-cb-empty-sub">Characters will appear here once SillyTavern loads</span>
                    </div>
                ) : characters.length === 0 ? (
                    <div className="ado-cb-empty">
                        <Search size={24} strokeWidth={1} />
                        <span>No matches</span>
                        <span className="ado-cb-empty-sub">Try adjusting your search or filters</span>
                    </div>
                ) : folderGroups && enableResortableTagFolders && !wideMode ? (
                    // Sortable folder view with DnD (sidebar only)
                    <>
                        {tagFolderOrder.length > 0 && (
                            <div className="ado-cb-folder-reset-row">
                                <button
                                    className="ado-cb-folder-reset-btn"
                                    onClick={resetTagFolderOrder}
                                    type="button"
                                    title="Reset to default folder order"
                                >
                                    <RotateCcw size={11} strokeWidth={2} />
                                    <span>Reset Order</span>
                                </button>
                            </div>
                        )}
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFolderDragEnd}>
                            <SortableContext items={folderGroups.map(f => f.id)} strategy={verticalListSortingStrategy}>
                                {folderGroups.map((folder) => (
                                    <SortableFolderSection
                                        key={folder.id}
                                        folder={folder}
                                        expandedFolders={expandedFolders}
                                        onToggle={toggleFolder}
                                        items={folder.items}
                                        renderContent={renderFolderContent}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </>
                ) : folderGroups ? (
                    // Static folder view (no DnD overhead)
                    folderGroups.map((folder) => (
                        <FolderSection
                            key={folder.id}
                            folder={folder}
                            expandedFolders={expandedFolders}
                            onToggle={toggleFolder}
                            items={folder.items}
                            renderContent={renderFolderContent}
                        />
                    ))
                ) : viewMode === 'grid' ? (
                    <VirtualizedGrid
                        items={characters}
                        activeCharacterId={activeCharacterId}
                        onSelect={cardSelectHandler}
                        onToggleFavorite={toggleFavorite}
                        onEdit={editHandler}
                        onDelete={deleteHandler}
                        containerRef={scrollRef}
                        isBatchMode={batchMode && wideMode}
                        batchSelected={batchSelected}
                    />
                ) : (
                    <VirtualizedList
                        items={characters}
                        activeCharacterId={activeCharacterId}
                        onSelect={cardSelectHandler}
                        onToggleFavorite={toggleFavorite}
                        onEdit={editHandler}
                        onDelete={deleteHandler}
                        containerRef={scrollRef}
                        isBatchMode={batchMode && wideMode}
                        batchSelected={batchSelected}
                    />
                )}

                {/* Drag-and-drop overlay */}
                {isDragOver && (
                    <div className="ado-cb-drop-overlay">
                        <Upload size={28} strokeWidth={1.5} />
                        <span>Drop to import</span>
                    </div>
                )}
            </div>

            {/* Status bar */}
            <div className="ado-cb-status">
                <span>{characters.length} of {totalCount}</span>
            </div>

            {/* Loading overlay — navigation */}
            {isNavigating && (
                <div className="ado-cb-loading-overlay">
                    <Loader2 size={24} strokeWidth={1.5} className="ado-cb-spinner" />
                    <span>Loading chat&hellip;</span>
                </div>
            )}

            {/* Loading overlay — import */}
            {importState.isImporting && (
                <div className="ado-cb-loading-overlay">
                    <Loader2 size={24} strokeWidth={1.5} className="ado-cb-spinner" />
                    <span>Importing&hellip;</span>
                </div>
            )}

            {/* Batch delete progress overlay */}
            {batchProgress && (
                <div className="ado-cb-loading-overlay">
                    <Loader2 size={28} strokeWidth={1.5} className="ado-cb-spinner" />
                    <span>Deleting {batchProgress.current} of {batchProgress.total}&hellip;</span>
                    {batchProgress.name && (
                        <span className="ado-cb-batch-progress-name">{batchProgress.name}</span>
                    )}
                    <div className="ado-cb-batch-progress-bar">
                        <div
                            className="ado-cb-batch-progress-fill"
                            style={{ width: `${batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Delete confirmation modal (single) */}
            <ConfirmationModal
                isOpen={!!deleteTarget}
                variant="danger"
                title="Delete Character"
                message={deleteTarget ? (
                    <>
                        <strong>{deleteTarget.name}</strong> will be permanently deleted.
                        <br /><br />
                        Choose whether to also delete all associated chat history, or keep the chat files.
                    </>
                ) : ''}
                confirmText={isDeleting ? 'Deleting...' : 'Delete Everything'}
                secondaryText="Keep Chats"
                secondaryVariant="warning"
                cancelText="Cancel"
                onConfirm={() => confirmDelete(true)}
                onSecondary={() => confirmDelete(false)}
                onCancel={() => setDeleteTarget(null)}
            />

        </div>
    );
}

export default CharacterBrowser;
