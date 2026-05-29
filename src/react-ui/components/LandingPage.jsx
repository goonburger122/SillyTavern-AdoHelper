import React, { useState, useEffect, useCallback, useLayoutEffect, useSyncExternalStore, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Clock, Sparkles, Users, Package, RefreshCw, Compass, Loader2, Trash2, X, MessageSquarePlus } from 'lucide-react';
import { landingPageStyles } from './LandingPageStyles.js';
import { useAdoHelperStore } from '../store/AdoHelperContext';
import { getTopBarHeight } from '../../lib/domUtils.js';
import ConfirmationModal from './shared/ConfirmationModal.jsx';
import { getAdoHelperVersion, getSillyTavernVersion, isPrerelease } from '../../lib/version.js';
import { getRandomJoke, onJokesReady } from '../../lib/jokesService.js';
import LazyImage from './shared/LazyImage';

/* global toastr */

/**
 * Landing Page Component
 *
 * A full-screen glassmorphic landing page displaying recent chats as cards.
 * Hides the default #sheld and creates an immersive Apple-esque experience.
 *
 * Uses CSS-in-JS (injected styles) to prevent stylesheet loading failures.
 */

// Stable selector
const selectLandingPageChatsDisplayed = () => useAdoHelperStore.getState().landingPageChatsDisplayed ?? 12;

/**
 * Format relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(timestamp) {
    if (!timestamp) return 'Unknown';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Get avatar URL for a character or single avatar file
 * @param {Object|string} itemOrAvatar - Character object or avatar filename
 */
async function getAvatarUrl(itemOrAvatar) {
    if (!itemOrAvatar) return '/img/fa-solid-user.svg';

    // If passed a string (avatar filename), resolve directly
    const avatar = typeof itemOrAvatar === 'string' ? itemOrAvatar : itemOrAvatar.avatar;

    // Groups have members array - handle separately
    if (typeof itemOrAvatar === 'object' && (itemOrAvatar.members || itemOrAvatar.is_group)) {
        return itemOrAvatar.avatar_url || '/img/fa-solid-groups.svg';
    }

    // Characters use getThumbnailUrl for optimized thumbnails
    if (avatar) {
        try {
            const { getThumbnailUrl: stGetThumbnailUrl } = await import(/* webpackIgnore: true */ '../../../../../script.js');
            if (stGetThumbnailUrl) {
                return stGetThumbnailUrl('avatar', avatar);
            }
        } catch (err) {
            console.warn('[Ado Helper] Failed to import getThumbnailUrl, using fallback:', err);
        }
        return `/characters/${encodeURIComponent(avatar)}`;
    }

    return '/img/fa-solid-user.svg';
}

/**
 * Group Avatar Stack Component
 * Displays up to 4 member avatars in an overlapping stack
 */
const GroupAvatarStack = React.memo(({ members, groupName }) => {
    const [avatarUrls, setAvatarUrls] = useState([]);
    const [loadedCount, setLoadedCount] = useState(0);
    const totalMembers = (members || []).length;
    
    // For 5+ members, show only 3 avatars + overflow indicator
    const maxAvatars = totalMembers >= 5 ? 3 : 4;
    const membersToShow = (members || []).slice(0, maxAvatars);
    const overflow = totalMembers > maxAvatars ? totalMembers - maxAvatars : 0;
    
    // Determine layout type for CSS
    const getCountAttr = () => {
        if (totalMembers >= 5) return '5+';
        return String(totalMembers);
    };

    useEffect(() => {
        let cancelled = false;
        setLoadedCount(0);
        setAvatarUrls([]);

        Promise.all(
            membersToShow.map(memberFile => getAvatarUrl(memberFile))
        ).then(urls => {
            if (cancelled) return;
            // Preload all images, replacing broken ones with fallback
            const preloaded = urls.map(url => new Promise(resolve => {
                const img = new Image();
                img.onload = () => resolve(url);
                img.onerror = () => resolve('/img/fa-solid-user.svg');
                img.src = url;
            }));
            return Promise.all(preloaded);
        }).then(validUrls => {
            if (!cancelled && validUrls) {
                setAvatarUrls(validUrls);
                setLoadedCount(validUrls.length);
            }
        });

        return () => { cancelled = true; };
    }, [members]);

    const allLoaded = loadedCount >= membersToShow.length && avatarUrls.length > 0;

    return (
        <div className="ado-lp-group-stack">
            <div className="ado-lp-group-stack-loading" style={{ opacity: allLoaded ? 0 : 1 }}>
                <Loader2 className="ado-lp-spin" size={24} />
            </div>
            <div
                className="ado-lp-group-stack-avatars"
                data-count={getCountAttr()}
                style={{ opacity: allLoaded ? 1 : 0 }}
            >
                {avatarUrls.map((url, index) => (
                    <div
                        key={`${membersToShow[index]}-${index}`}
                        className="ado-lp-group-avatar-wrapper"
                        style={{
                            '--stack-index': index,
                            '--stack-total': membersToShow.length,
                            zIndex: maxAvatars - index,
                        }}
                    >
                        <LazyImage
                            src={url}
                            alt={`Group member ${index + 1}`}
                            className="ado-lp-group-avatar-img"
                            spinnerSize={12}
                            draggable={false}
                        />
                    </div>
                ))}
                {overflow > 0 && (
                    <div 
                        className="ado-lp-group-avatar-overflow"
                        style={{
                            '--stack-index': maxAvatars,
                            zIndex: 0,
                        }}
                    >
                        <span>+{overflow}</span>
                    </div>
                )}
            </div>
        </div>
    );
});

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    },
    exit: { opacity: 0 }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            default: { type: "spring", stiffness: 300, damping: 24 },
            opacity: { duration: 0.3, ease: "easeOut" }
        }
    }
};

/**
 * Character/Group Card Component
 */
const ChatCard = React.memo(({ item, presetName, onClick, onDelete, index }) => {
    const isGroup = item._type === 'group' || item.is_group || (Array.isArray(item.members) && item.members.length > 0);
    const [avatarUrl, setAvatarUrl] = useState('/img/fa-solid-user.svg');
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const confirmTimeoutRef = useRef(null);
    const cardRef = useRef(null);
    const shouldReduceMotion = useReducedMotion();

    // Clear timeout on unmount
    useEffect(() => {
        return () => {
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
        };
    }, []);

    // Handle delete button click with two-click confirmation
    const handleDeleteClick = useCallback((e) => {
        e.stopPropagation(); // Prevent card click
        
        if (isConfirmingDelete) {
            // Second click - execute delete
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
            setIsConfirmingDelete(false);
            onDelete?.(item);
        } else {
            // First click - enter confirmation mode
            setIsConfirmingDelete(true);
            // Auto-cancel after 3 seconds
            confirmTimeoutRef.current = setTimeout(() => {
                setIsConfirmingDelete(false);
            }, 3000);
        }
    }, [isConfirmingDelete, item, onDelete]);

    // Track mouse position for parallax shine
    const handleMouseMove = useCallback((e) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--shine-x', `${x}%`);
        card.style.setProperty('--shine-y', `${y}%`);
    }, []);

    // Reset confirmation when mouse leaves
    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        if (isConfirmingDelete) {
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
            setIsConfirmingDelete(false);
        }
    }, [isConfirmingDelete]);

    // Derive stable keys for effect dependency to prevent unnecessary loading state resets
    // This prevents the spinner from flashing when the parent re-fetches identical data
    const stableAvatarKey = item.avatar || item.avatar_url;
    const stableIsGroup = !!(item.members || item.is_group);

    useEffect(() => {
        let cancelled = false;
        setImageLoaded(false);

        getAvatarUrl(item).then(url => {
            if (cancelled) return;
            // Preload image off-screen to avoid broken icon flash
            const img = new Image();
            img.onload = () => {
                if (!cancelled) {
                    setAvatarUrl(url);
                    setImageLoaded(true);
                }
            };
            img.onerror = () => {
                if (!cancelled) {
                    setAvatarUrl('/img/fa-solid-user.svg');
                    setImageLoaded(true);
                }
            };
            img.src = url;
        });

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stableAvatarKey, stableIsGroup]);

    return (
        <motion.div
            ref={cardRef}
            className="ado-lp-card"
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            variants={cardVariants}
            whileHover={shouldReduceMotion ? {} : { y: -8, transition: { duration: 0.2 } }}
            whileTap={shouldReduceMotion ? {} : { y: -2, transition: { duration: 0.1 } }}
            layout={false} // Explicitly disable layout animations to prevent thrashing
        >
            {/* Glass shimmer effect */}
            {!shouldReduceMotion && (
                <motion.div
                    className="ado-lp-card-shimmer"
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                />
            )}

            {/* Delete button - top-right corner of card, appears on hover */}
            {onDelete && (isHovered || isConfirmingDelete) && (
                <button
                    className={`ado-lp-card-delete-btn ${isConfirmingDelete ? 'ado-lp-card-delete-btn--confirming' : ''}`}
                    onClick={handleDeleteClick}
                    title={isConfirmingDelete ? 'Click again to confirm deletion' : 'Delete this chat'}
                    type="button"
                    style={{ position: 'absolute', top: 10, right: 10, zIndex: 20 }}
                >
                    {isConfirmingDelete ? <X size={16} strokeWidth={2.5} /> : <Trash2 size={16} strokeWidth={2} />}
                </button>
            )}

            {/* Avatar Container */}
            <div className={`ado-lp-card-image-container ${isGroup ? 'ado-lp-card-image-group' : ''}`}>
                {isGroup ? (
                    <GroupAvatarStack 
                        members={item.members} 
                        groupName={item.name}
                    />
                ) : (
                    <>
                        <div
                            className="ado-lp-card-avatar-spinner"
                            style={{ opacity: imageLoaded ? 0 : 1 }}
                        >
                            <Loader2 className="ado-lp-spin" size={24} color="rgba(255,255,255,0.5)" />
                        </div>
                        <img
                            src={avatarUrl}
                            alt={item.name}
                            className="ado-lp-card-avatar"
                            draggable={false}
                            style={{ opacity: imageLoaded ? 1 : 0 }}
                        />
                    </>
                )}

                {/* Time badge */}
                <div className="ado-lp-card-time-badge">
                    <Clock size={10} strokeWidth={2} />
                    <span>{formatRelativeTime(item.date_last_chat)}</span>
                </div>
            </div>

            {/* Content */}
            <div className="ado-lp-card-content">
                <h3 className="ado-lp-card-name">{item.name || 'Unnamed'}</h3>

                <div className="ado-lp-card-meta">
                    {presetName && (
                        <span className="ado-lp-card-badge ado-lp-card-badge-preset">
                            <Sparkles size={10} strokeWidth={2} />
                            {presetName}
                        </span>
                    )}
                    {isGroup && (
                        <span className="ado-lp-card-badge ado-lp-card-badge-group">
                            <Users size={10} strokeWidth={2} />
                            {(item.members?.length || 0)} Members
                        </span>
                    )}
                </div>
            </div>

            {/* Hover indicator */}
            {!shouldReduceMotion && (
                <motion.div
                    className="ado-lp-card-indicator"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                />
            )}
        </motion.div>
    );
});

/**
 * Empty State Component
 */
function EmptyState() {
    return (
        <motion.div
            className="ado-lp-empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <div className="ado-lp-empty-icon">
                <Compass size={64} strokeWidth={1} />
            </div>
            <h3>Begin Your Journey</h3>
            <p>No recent conversations found. Select a character to start a new adventure.</p>
        </motion.div>
    );
}

/**
 * Version Info Component
 * Displays Ado Helper and SillyTavern versions in the bottom-right corner
 * Click to copy version info to clipboard
 */
function VersionInfo() {
    const [stVersionInfo, setStVersionInfo] = useState(null);
    const [copied, setCopied] = useState(false);
    const lumiverseVersion = getAdoHelperVersion();
    const isBeta = isPrerelease(lumiverseVersion);

    useEffect(() => {
        getSillyTavernVersion().then(info => {
            if (info) {
                setStVersionInfo(info);
            }
        });
    }, []);

    // Build the version text for clipboard
    const getVersionText = useCallback(() => {
        let text = `Ado Helper: v${lumiverseVersion}`;
        if (stVersionInfo) {
            text += `\nSillyTavern: v${stVersionInfo.pkgVersion}`;
            if (stVersionInfo.gitBranch) {
                text += ` (${stVersionInfo.gitBranch}`;
                if (stVersionInfo.gitRevision) {
                    text += ` @${stVersionInfo.gitRevision}`;
                }
                text += ')';
            }
        }
        return text;
    }, [lumiverseVersion, stVersionInfo]);

    // Handle click to copy
    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(getVersionText());
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error('[Ado Helper] Failed to copy version info:', err);
        }
    }, [getVersionText]);

    return (
        <motion.div
            className={`ado-lp-version-info ${copied ? 'ado-lp-version-info--copied' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            onClick={handleCopy}
            title="Click to copy version info"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCopy(); }}
        >
            <div className="ado-lp-version-row">
                <span className="ado-lp-version-label">Ado Helper</span>
                <span className={`ado-lp-version-value ${isBeta ? 'ado-lp-version-beta' : ''}`}>
                    v{lumiverseVersion}
                </span>
            </div>
            {stVersionInfo && (
                <div className="ado-lp-version-row">
                    <span className="ado-lp-version-label">SillyTavern</span>
                    <span className="ado-lp-version-value">
                        v{stVersionInfo.pkgVersion}
                        {stVersionInfo.gitBranch && (
                            <span className="ado-lp-version-git">
                                {stVersionInfo.gitBranch}
                                {stVersionInfo.gitRevision && (
                                    <span className="ado-lp-version-commit">
                                        @{stVersionInfo.gitRevision}
                                    </span>
                                )}
                            </span>
                        )}
                    </span>
                </div>
            )}
            {/* Copied feedback indicator */}
            <AnimatePresence>
                {copied && (
                    <motion.div
                        className="ado-lp-version-copied"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                    >
                        Copied!
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/**
 * InsideJoke — Subtle easter egg text shown during loading states.
 * Tries synchronously first; if the cache hasn't loaded yet,
 * subscribes via onJokesReady and retries once available.
 */
function InsideJoke() {
    const [joke, setJoke] = useState(() => getRandomJoke());

    useEffect(() => {
        if (joke) return;
        return onJokesReady(() => {
            const j = getRandomJoke();
            if (j) setJoke(j);
        });
    }, [joke]);

    if (!joke) return null;
    return <span className="ado-lp-joke">{joke}</span>;
}

/**
 * Loading Skeleton Card
 */
function SkeletonCard({ index }) {
    return (
        <motion.div
            className="ado-lp-card ado-lp-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
        >
            <div className="ado-lp-skeleton-image" />
            <div className="ado-lp-skeleton-content">
                <div className="ado-lp-skeleton-line ado-lp-skeleton-title" />
                <div className="ado-lp-skeleton-line ado-lp-skeleton-meta" />
            </div>
        </motion.div>
    );
}

/**
 * Main Landing Page Component
 */
function LandingPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [presetBindings, setPresetBindings] = useState({});
    const [paddingTop, setPaddingTop] = useState(25);
    const [isAppReady, setIsAppReady] = useState(!!window.lumiverseAppReady);
    const mountTimeRef = React.useRef(Date.now());
    const scrollContainerRef = useRef(null);
    const scrollTimerRef = useRef(null);

    // Delete confirmation modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [pendingDeleteItem, setPendingDeleteItem] = useState(null);

    // Get setting from store

    // Get setting from store
    const chatsDisplayed = useSyncExternalStore(
        useAdoHelperStore.subscribe,
        selectLandingPageChatsDisplayed,
        selectLandingPageChatsDisplayed
    );

    // Inject styles and set padding, handle resize
    useLayoutEffect(() => {
        const updatePadding = () => {
            setPaddingTop(Math.round(getTopBarHeight() / 2));
        };

        const updateGrid = () => {
            // Target ALL grid instances (loading or active) to ensure variables are set
            const grids = document.querySelectorAll('.ado-lp-grid-cards');
            if (!grids.length) return;

            grids.forEach(grid => {
                // Use clientWidth to exclude scrollbar
                const containerWidth = grid.parentElement?.clientWidth || window.innerWidth;
                const gap = 20; // 20px gap from CSS
                
                // Dynamic sizing logic:
                // We want to maintain density on desktop.
                // Fixed minimum width ensures we just add more columns as space grows,
                // rather than making cards awkwardly large.
                const minCardWidth = 220;

                // Calculate exact width for perfect alignment
                // container = cols * width + (cols - 1) * gap
                // maxCols = floor((container + gap) / (minWidth + gap))
                const maxCols = Math.floor((containerWidth + gap) / (minCardWidth + gap));
                const cols = Math.max(1, maxCols); // At least 1 column
                
                // width = (container - (cols - 1) * gap) / cols
                const exactWidth = (containerWidth - (gap * (cols - 1))) / cols;
                
                // Subtract a tiny fraction (0.5px) to handle sub-pixel rounding errors in browsers
                grid.style.setProperty('--ado-card-width', `${exactWidth - 0.5}px`);
            });
        };
        
        // Initial set
        updatePadding();
        
        // Listen for resizing
        const handleResize = () => {
            updatePadding();
            updateGrid();
        };

        window.addEventListener('resize', handleResize);
        
        // Use ResizeObserver for more robust container tracking
        const mainContent = document.querySelector('.ado-lp-main');
        let observer = null;
        if (mainContent) {
            observer = new ResizeObserver(() => {
                updateGrid();
            });
            observer.observe(mainContent);
        }
        
        // Initial grid update (delayed slightly to ensure DOM is ready)
        setTimeout(updateGrid, 0);
        setTimeout(updateGrid, 100); // Secondary check for slow renders
        
        const styleId = 'ado-landing-styles';
        if (!document.getElementById(styleId)) {
            const styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.textContent = landingPageStyles;
            document.head.appendChild(styleEl);
        }
        
        return () => {
            window.removeEventListener('resize', handleResize);
            if (observer) observer.disconnect();
        };
    }, []);

    // Defer card hover effects during active scroll to avoid GPU spikes
    // from incidental hovers. Toggles a CSS class via DOM ref (zero re-renders).
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        // Also toggle on the root container so CSS can reach sibling elements (bg glows)
        const rootContainer = container.closest('.ado-lp-container');

        const onScroll = () => {
            if (!container.classList.contains('ado-lp-scrolling')) {
                container.classList.add('ado-lp-scrolling');
                if (rootContainer) rootContainer.classList.add('ado-lp-scrolling');
            }
            clearTimeout(scrollTimerRef.current);
            scrollTimerRef.current = setTimeout(() => {
                container.classList.remove('ado-lp-scrolling');
                if (rootContainer) rootContainer.classList.remove('ado-lp-scrolling');
            }, 150);
        };

        container.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            container.removeEventListener('scroll', onScroll);
            clearTimeout(scrollTimerRef.current);
        };
    }, []);

    // Re-run grid update when items change (to ensure grid exists)
    const itemCount = items.length;
    useEffect(() => {
        if (itemCount === 0) return;
        // Run updateGrid logic after render when cards are in the DOM
        const updateGrid = () => {
            const grids = document.querySelectorAll('.ado-lp-grid-cards');
            if (grids.length) {
                window.dispatchEvent(new Event('resize'));
            }
        };

        updateGrid();
        // Also retry after a frame to catch layout settle
        requestAnimationFrame(updateGrid);
    }, [itemCount]);

    // Fetch recent chats
    const fetchChats = useCallback(async (retryCount = 0) => {
        // Only set loading true on the very first attempt of a sequence
        if (retryCount === 0) setLoading(true);
        setError(null);

        try {
            const { characters } = await import(/* webpackIgnore: true */ '../../../../../script.js');
            const { groups } = await import(/* webpackIgnore: true */ '../../../../group-chats.js');

            const mappedChars = (characters || []).map((char, index) => ({
                ...char,
                _type: 'character',
                _index: index,
                _sortDate: char.date_last_chat || 0,
            }));

            const mappedGroups = (groups || []).map(group => ({
                ...group,
                members: group.members,
                _type: 'group',
                is_group: true,
                _sortDate: group.date_last_chat || 0,
            }));

            // Combine and filter
            const allItems = [...mappedChars, ...mappedGroups]
                .filter(item => item._sortDate > 0);

            const sortedItems = allItems
                .sort((a, b) => b._sortDate - a._sortDate)
                .slice(0, chatsDisplayed);

            // SMART RETRY LOGIC:
            // If we found no chats, and we are within the first 4 seconds of mounting,
            // assume ST might still be lazy-loading and retry.
            // Keep loading=true — do NOT fall through to setLoading(false).
            if (sortedItems.length === 0 && (Date.now() - mountTimeRef.current < 4000) && retryCount < 8) {
                setTimeout(() => fetchChats(retryCount + 1), 500);
                return; // Exit early — loading stays true, finally is skipped via early return guard below
            }

            setItems(sortedItems);
            setLoading(false);
        } catch (err) {
            console.error('[Ado Helper] Error fetching chats:', err);
            setError(err.message);
            setLoading(false);
        }
    }, [chatsDisplayed]);

    // Fetch preset bindings
    const fetchPresetBindings = useCallback(async () => {
        try {
            const { getCachedIndex } = await import('../../lib/packCache.js');
            const index = getCachedIndex();
            if (index?.presetBindings) {
                setPresetBindings(index.presetBindings);
            }
        } catch (err) {
            console.warn('[Ado Helper] Could not fetch preset bindings:', err);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchChats();
        fetchPresetBindings();

        // Listen for external refresh triggers (e.g., from index.js on APP_READY)
        const handleRefresh = () => {
            setIsAppReady(true);
            // Re-fetch from scratch (retryCount=0), replacing any in-progress retries
            fetchChats(0);
        };
        window.addEventListener('lumiverse:landing-refresh', handleRefresh);

        // Fallback: If APP_READY never fires (or we missed it), force ready state after a timeout
        const fallbackTimer = setTimeout(() => {
            if (!window.lumiverseAppReady) {
                setIsAppReady(true);
            }
        }, 4000);

        // Hide the sheld initially
        const sheld = document.querySelector('#sheld');
        if (sheld) {
            sheld.style.opacity = '0';
            sheld.style.pointerEvents = 'none';
        }

        return () => {
            clearTimeout(fallbackTimer);
            window.removeEventListener('lumiverse:landing-refresh', handleRefresh);
            
            // Restore sheld on unmount
            const sheld = document.querySelector('#sheld');
            if (sheld) {
                sheld.style.opacity = '';
                sheld.style.pointerEvents = '';
            }
        };
    }, [fetchChats, fetchPresetBindings]);

    // Get preset name
    const getCharacterPreset = useCallback((characterName) => {
        if (!characterName || !presetBindings) return null;
        const binding = presetBindings[characterName];
        return binding?.presetName || null;
    }, [presetBindings]);

    // Handle item click — shows loading feedback immediately, then yields
    // to the browser before starting ST's heavy chat-loading work.
    // Without the yield, selectCharacterById blocks the main thread for
    // 1-2s (loading chat, rendering #chat DOM) and nothing paints until done.
    const [isNavigating, setIsNavigating] = useState(false);
    const handleItemClick = useCallback(async (item) => {
        if (isNavigating) return; // Prevent double-click
        setIsNavigating(true);

        // Double-rAF yield: React re-renders with loading overlay → browser
        // paints it → THEN we start the heavy synchronous ST work.
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

        try {
            if (item._type === 'group' || item.members) {
                const { openGroupById } = await import(/* webpackIgnore: true */ '../../../../group-chats.js');
                if (openGroupById && item.id) {
                    await openGroupById(item.id);
                }
            } else {
                const { selectCharacterById } = await import(/* webpackIgnore: true */ '../../../../../script.js');
                if (selectCharacterById && item._index !== undefined) {
                    await selectCharacterById(String(item._index));
                }
            }
        } catch (err) {
            console.error('[Ado Helper] Error opening chat:', err);
            toastr?.error('Failed to open chat');
            setIsNavigating(false);
        }
    }, [isNavigating]);

    // Handle delete button click - opens confirmation modal
    const handleDeleteChat = useCallback((item) => {
        setPendingDeleteItem(item);
        setDeleteModalOpen(true);
    }, []);

    // Cancel delete - closes modal
    const cancelDeleteChat = useCallback(() => {
        setDeleteModalOpen(false);
        setPendingDeleteItem(null);
    }, []);

    // Confirm delete - performs the actual deletion
    const confirmDeleteChat = useCallback(async () => {
        const item = pendingDeleteItem;
        if (!item) return;
        
        // Close modal immediately
        setDeleteModalOpen(false);
        setPendingDeleteItem(null);
        
        try {
            if (item._type === 'group' || item.members) {
                // Group chat deletion
                const { deleteGroupChatByName, groups } = await import(/* webpackIgnore: true */ '../../../../group-chats.js');
                
                // Find the group to get the current chat name
                const group = groups.find(g => g.id === item.id);
                if (!group) {
                    toastr?.error('Group not found');
                    return;
                }
                
                // Get the current/most recent chat file name (without .jsonl extension)
                const chatFileName = group.chat_id || (group.chats && group.chats[group.chats.length - 1]);
                if (!chatFileName) {
                    toastr?.error('No chat file found for this group');
                    return;
                }
                
                await deleteGroupChatByName(item.id, chatFileName);
                toastr?.success(`Chat deleted successfully`);
            } else {
                // Character chat deletion
                const { characters, deleteCharacterChatByName } = await import(/* webpackIgnore: true */ '../../../../../script.js');
                
                // Get character ID (index in characters array)
                const characterId = item._index !== undefined 
                    ? item._index 
                    : characters.findIndex(c => c.avatar === item.avatar);
                    
                if (characterId === -1) {
                    toastr?.error('Character not found');
                    return;
                }
                
                // Get the current chat file name from the character (without .jsonl extension)
                const character = characters[characterId];
                const chatFileName = character?.chat;
                if (!chatFileName) {
                    toastr?.error('No chat file found for this character');
                    return;
                }
                
                await deleteCharacterChatByName(String(characterId), chatFileName);
                toastr?.success(`Chat deleted successfully`);
            }
            
            // Refresh the landing page
            fetchChats();
            
        } catch (err) {
            console.error('[Ado Helper] Error deleting chat:', err);
            toastr?.error('Failed to delete chat');
        }
    }, [pendingDeleteItem, fetchChats]);

    // Handle starting a temporary chat (scratchpad mode)
    const handleTemporaryChat = useCallback(async () => {
        // Defensive check: ensure system messages are loaded (APP_READY has fired)
        // See: developer_guides/12_troubleshoot_temp_chat.md - Race Condition section
        if (!window.lumiverseAppReady) {
            toastr?.warning('Please wait for the app to finish loading');
            return;
        }
        
        try {
            const { newAssistantChat, chat } = await import(/* webpackIgnore: true */ '../../../../../script.js');
            const { callGenericPopup, POPUP_TYPE } = await import(/* webpackIgnore: true */ '../../../../popup.js');
            
            // If there's an existing chat, confirm before clearing
            if (chat && chat.length > 0) {
                const confirmed = await callGenericPopup(
                    'Start a new temporary chat? Any unsaved conversation will be cleared.',
                    POPUP_TYPE.CONFIRM
                );
                if (!confirmed) return;
            }
            
            // Start the temporary chat using ST's built-in function
            await newAssistantChat({ temporary: true });
            
        } catch (err) {
            console.error('[Ado Helper] Error starting temporary chat:', err);
            toastr?.error('Failed to start temporary chat');
        }
    }, []);

    return (
        <div className="ado-lp-container" style={{ paddingTop: `${paddingTop}px`, pointerEvents: 'none' }}>
            {/* Navigation loading overlay — shown immediately on chat click,
                before ST's heavy selectCharacterById blocks the main thread */}
            {isNavigating && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 99999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--ado-page-bg, var(--ado-bg, rgba(10,8,20,0.97)))',
                    pointerEvents: 'all',
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', opacity: 0.7 }}>
                        <div className="ado-lp-spinner" />
                        <span style={{ fontSize: '13px', color: 'var(--ado-text, #ccc)' }}>Loading chat&hellip;</span>
                    </div>
                    <InsideJoke />
                </div>
            )}
            {/* Ambient background effects */}
            <div className="ado-lp-bg" style={{ top: `${paddingTop}px`, pointerEvents: 'auto' }}>
                <div className="ado-lp-bg-glow ado-lp-bg-glow-1" />
                <div className="ado-lp-bg-glow ado-lp-bg-glow-2" />
                <div className="ado-lp-bg-glow ado-lp-bg-glow-3" />
            </div>

            {/* Grid pattern overlay */}
            <div className="ado-lp-grid" style={{ top: `${paddingTop}px`, pointerEvents: 'none' }} />

            {/* Main content */}
            <motion.div
                className="ado-lp-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{ pointerEvents: 'auto' }}
            >
                {/* Header */}
                <motion.header
                    className="ado-lp-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="ado-lp-header-left">
                        <div className="ado-lp-logo">
                            <div className="ado-lp-logo-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="28" height="28" className="ado-spool-icon">
                                    <g transform="rotate(-12, 32, 32)">
                                        <ellipse cx="32" cy="12" rx="18" ry="6" fill="#8B5A2B"/>
                                        <ellipse cx="32" cy="12" rx="14" ry="4" fill="#A0522D"/>
                                        <rect x="14" y="12" width="36" height="40" fill="#8B5FC7"/>
                                        <line x1="14" y1="18" x2="50" y2="18" stroke="#7A4EB8" strokeWidth="1.5"/>
                                        <line x1="14" y1="24" x2="50" y2="24" stroke="#7A4EB8" strokeWidth="1.5"/>
                                        <line x1="14" y1="30" x2="50" y2="30" stroke="#7A4EB8" strokeWidth="1.5"/>
                                        <line x1="14" y1="36" x2="50" y2="36" stroke="#7A4EB8" strokeWidth="1.5"/>
                                        <line x1="14" y1="42" x2="50" y2="42" stroke="#7A4EB8" strokeWidth="1.5"/>
                                        <line x1="14" y1="48" x2="50" y2="48" stroke="#7A4EB8" strokeWidth="1.5"/>
                                        <rect x="14" y="12" width="8" height="40" fill="#A78BD4" opacity="0.5"/>
                                        <ellipse cx="32" cy="52" rx="18" ry="6" fill="#8B5A2B"/>
                                        <rect x="14" y="48" width="36" height="4" fill="#8B5FC7"/>
                                        <ellipse cx="32" cy="52" rx="14" ry="4" fill="#A0522D"/>
                                        <ellipse cx="32" cy="52" rx="5" ry="2" fill="#5D3A1A"/>
                                        <path d="M 48 35 Q 55 38 52 45 Q 49 52 56 58" fill="none" stroke="#8B5FC7" strokeWidth="2" strokeLinecap="round"/>
                                    </g>
                                </svg>
                            </div>
                            <div className="ado-lp-logo-text">
                                <h1>Ado Helper</h1>
                                <span>Continue your story</span>
                            </div>
                        </div>
                    </div>

                    <div className="ado-lp-header-right">
                        <motion.button
                            className="ado-lp-btn ado-lp-btn-temp-chat"
                            onClick={handleTemporaryChat}
                            disabled={!isAppReady}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            title={isAppReady ? "Start a temporary chat (scratchpad)" : "Waiting for app to initialize..."}
                        >
                            <MessageSquarePlus size={16} strokeWidth={1.5} />
                        </motion.button>
                        <motion.button
                            className="ado-lp-btn ado-lp-btn-refresh"
                            onClick={fetchChats}
                            disabled={loading}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                        >
                            <RefreshCw size={16} strokeWidth={1.5} className={loading ? 'ado-lp-spin' : ''} />
                        </motion.button>
                    </div>
                </motion.header>

                {/* Main grid */}
                <main className="ado-lp-main" ref={scrollContainerRef}>
                    <AnimatePresence mode="wait">
                        {(() => {
                            // Show loading skeletons if:
                            // 1. Actually fetching data (loading = true)
                            // 2. OR we have no items AND app isn't ready yet (prevent premature empty state)
                            const showLoading = loading || (!isAppReady && items.length === 0);

                            if (showLoading) {
                                return (
                                    <motion.div
                                        key="loading"
                                        className="ado-lp-grid-cards"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        style={{ position: 'relative' }}
                                    >
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <SkeletonCard key={i} index={i} />
                                        ))}
                                        <InsideJoke />
                                    </motion.div>
                                );
                            }
                            if (error) {
                                return (
                                    <motion.div
                                        key="error"
                                        className="ado-lp-error"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <p>Failed to load chats</p>
                                        <button onClick={fetchChats} className="ado-lp-btn ado-lp-btn-primary" type="button">
                                            Try Again
                                        </button>
                                    </motion.div>
                                );
                            }
                            if (items.length === 0) {
                                return <EmptyState />;
                            }
                            return (
                                <motion.div
                                    key="chats"
                                    className="ado-lp-grid-cards"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    {items.map((item, index) => (
                                        <ChatCard
                                            key={`${item._type}-${item.id ?? item._index}-${index}`}
                                            item={item}
                                            presetName={item._type === 'character' ? getCharacterPreset(item.name) : null}
                                            onClick={() => handleItemClick(item)}
                                            onDelete={handleDeleteChat}
                                            index={index}
                                        />
                                    ))}
                                </motion.div>
                            );
                        })()}
                    </AnimatePresence>
                </main>

                {/* Footer */}
                <motion.footer
                    className="ado-lp-footer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <p>Select a character to continue your journey</p>
                </motion.footer>
            </motion.div>

            {/* Version Info - Bottom Right Corner */}
            <VersionInfo />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onConfirm={confirmDeleteChat}
                onCancel={cancelDeleteChat}
                title="Delete Chat"
                message={
                    pendingDeleteItem ? (
                        <>
                            Are you sure you want to delete the most recent chat with <strong>"{pendingDeleteItem.name || 'this character'}"</strong>?
                            <br /><br />
                            <span style={{ fontSize: '12px', opacity: 0.7 }}>
                                This action cannot be undone.
                            </span>
                        </>
                    ) : 'Are you sure you want to delete this chat?'
                }
                variant="danger"
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
}

export default LandingPage;
