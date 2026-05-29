/**
 * ChatSheld — Root Component for Glassmorphic Chat Override
 *
 * Renders as a light DOM child inside #sheld, scoped via .ado-app CSS class.
 * Orchestrates the message list, input area, and all sub-components.
 *
 * Layout with side portrait:
 *   <container row>
 *     [SidePortrait left?]
 *     <main-column>
 *       <scroll-container>
 *         <MessageList />
 *       </scroll-container>
 *       <ScrollToBottom />
 *       <InputArea />
 *     </main-column>
 *     [SidePortrait right?]
 *     <AvatarLightbox />
 *     <AuthorsNotePortal />
 *   </container>
 */

import React, { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useAdoHelperStore } from '../store/AdoHelperContext';
import { generateThemeCSSForChatSheld } from '../../lib/themeManager.js';
import { chatSheldStyles } from './ChatSheldStyles.js';
import MessageList from './chat/MessageList';
import InputArea from './chat/InputArea';
import ScrollToBottom from './chat/ScrollToBottom';
import AvatarLightbox from './chat/AvatarLightbox';
import AuthorsNotePortal from './chat/AuthorsNotePortal';
import SidePortrait from './chat/SidePortrait';
import useIsMobile from '../hooks/useIsMobile';

const store = useAdoHelperStore;

const selectMessages = () => store.getState().chatSheld?.messages || [];
const selectIsStreaming = () => store.getState().chatSheld?.isStreaming || false;
const selectStreamingContent = () => store.getState().chatSheld?.streamingContent || '';
const selectDisplayMode = () => store.getState().chatSheldDisplayMode || 'minimal';
const selectSidePortraitEnabled = () => store.getState().sidePortraitEnabled || false;
const selectSidePortraitSide = () => store.getState().sidePortraitSide || 'left';

export default function ChatSheld() {
    const scrollContainerRef = useRef(null);

    const messages = useSyncExternalStore(store.subscribe, selectMessages, selectMessages);
    const isStreaming = useSyncExternalStore(store.subscribe, selectIsStreaming, selectIsStreaming);
    const streamingContent = useSyncExternalStore(store.subscribe, selectStreamingContent, selectStreamingContent);
    const displayMode = useSyncExternalStore(store.subscribe, selectDisplayMode, selectDisplayMode);
    const sidePortraitEnabled = useSyncExternalStore(store.subscribe, selectSidePortraitEnabled, selectSidePortraitEnabled);
    const sidePortraitSide = useSyncExternalStore(store.subscribe, selectSidePortraitSide, selectSidePortraitSide);

    const isMobile = useIsMobile();
    const showSidePortrait = sidePortraitEnabled && !isMobile;

    // Styles and swap — idempotent. The service layer eagerly injects styles
    // and shows the container with a loading skeleton before React mounts.
    // This useLayoutEffect covers hot-reload / re-mount edge cases and
    // removes the skeleton now that real content is ready to paint.
    useLayoutEffect(() => {
        // Styles — already injected by service layer on first activation,
        // but create if missing (covers hot-reload / re-mount edge cases)
        if (!document.getElementById('ado-chat-sheld-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'ado-chat-sheld-styles';
            styleEl.textContent = chatSheldStyles;
            document.head.appendChild(styleEl);
        }
        if (!document.getElementById('ado-chat-sheld-theme')) {
            const themeEl = document.createElement('style');
            themeEl.id = 'ado-chat-sheld-theme';
            const themeCSS = generateThemeCSSForChatSheld();
            if (themeCSS) themeEl.textContent = themeCSS;
            document.head.appendChild(themeEl);
        }

        // Idempotent swap (service layer does this eagerly on first activation;
        // this covers chat-switch re-renders and edge cases)
        const stChat = document.querySelector('#chat');
        const stForm = document.querySelector('#form_sheld');
        if (stChat) stChat.style.display = 'none';
        if (stForm) stForm.style.display = 'none';
        const root = document.getElementById('ado-chat-root');
        if (root) {
            root.style.visibility = 'visible';
            root.style.position = '';
            root.style.inset = '';
        }

        // Remove loading skeleton (service layer placed it for instant visual feedback)
        document.getElementById('ado-loading-skeleton')?.remove();

        return () => {
            document.getElementById('ado-chat-sheld-styles')?.remove();
            document.getElementById('ado-chat-sheld-theme')?.remove();
        };
    }, []);

    // Listen for theme changes and update styles
    useEffect(() => {
        const handleThemeChange = () => {
            const themeEl = document.getElementById('ado-chat-sheld-theme');
            if (themeEl) {
                const themeCSS = generateThemeCSSForChatSheld();
                themeEl.textContent = themeCSS || '';
            }
        };

        window.addEventListener('lumiverse:theme-changed', handleThemeChange);
        return () => window.removeEventListener('lumiverse:theme-changed', handleThemeChange);
    }, []);

    // ── Deferred backdrop-filter re-enable ──
    // When streaming ends, isStreaming flips to false. If we immediately remove
    // .ado-container--streaming, backdrop-filter re-enables on ALL cards at once,
    // causing a massive GPU compositing rebuild that shifts scrollHeight. The
    // scrollSnapTrigger from GENERATION_ENDED then fires against an unstable
    // layout, landing at the wrong position. Fix: keep the class for 3 frames
    // after streaming ends so the scroll snap executes on stable (blur-free)
    // layout first, then re-enable blur once the user is at the right position.
    const [backdropDisabled, setBackdropDisabled] = useState(false);
    const backdropTimerRef = useRef(null);

    useEffect(() => {
        if (isStreaming) {
            // Streaming started — disable backdrop immediately
            if (backdropTimerRef.current) {
                cancelAnimationFrame(backdropTimerRef.current);
                backdropTimerRef.current = null;
            }
            setBackdropDisabled(true);
        } else if (backdropDisabled) {
            // Streaming ended — wait 3 frames for scroll snap to settle,
            // then re-enable backdrop-filter
            let frame = 0;
            const deferReEnable = () => {
                frame++;
                if (frame >= 3) {
                    setBackdropDisabled(false);
                    backdropTimerRef.current = null;
                } else {
                    backdropTimerRef.current = requestAnimationFrame(deferReEnable);
                }
            };
            backdropTimerRef.current = requestAnimationFrame(deferReEnable);
        }
        return () => {
            if (backdropTimerRef.current) {
                cancelAnimationFrame(backdropTimerRef.current);
                backdropTimerRef.current = null;
            }
        };
    }, [isStreaming]);

    const modeClass = displayMode === 'immersive' ? ' ado-immersive' : displayMode === 'bubble' ? ' ado-bubble' : '';
    const streamingClass = backdropDisabled ? ' ado-container--streaming' : '';
    const portraitClass = showSidePortrait ? ' ado-side-portrait-active' : '';
    const containerClass = `ado-container${modeClass}${streamingClass}${portraitClass}`;

    // ── Dynamic safe zone for floating input bar ──
    // ResizeObserver measures the input area and sets --ado-input-safe-zone
    // on the main column so the scroll container's bottom padding stays in sync.
    const mainColumnRef = useRef(null);

    useEffect(() => {
        const mainCol = mainColumnRef.current;
        if (!mainCol) return;
        const inputEl = mainCol.querySelector('.ado-input-area');
        if (!inputEl) return;

        const update = () => {
            const h = inputEl.offsetHeight;
            mainCol.style.setProperty('--ado-input-safe-zone', `${h + 12}px`);
        };

        const ro = new ResizeObserver(update);
        ro.observe(inputEl);
        update();
        return () => ro.disconnect();
    }, []);

    return (
        <div className={containerClass}>
            {showSidePortrait && sidePortraitSide === 'left' && <SidePortrait />}
            <div className="ado-main-column" ref={mainColumnRef}>
                <div className="ado-scroll-container" ref={scrollContainerRef}>
                    <MessageList
                        messages={messages}
                        isStreaming={isStreaming}
                        streamingContent={streamingContent}
                        scrollContainerRef={scrollContainerRef}
                    />
                </div>
                <ScrollToBottom scrollContainerRef={scrollContainerRef} />
                <InputArea />
            </div>
            {showSidePortrait && sidePortraitSide === 'right' && <SidePortrait />}
            <AvatarLightbox />
            <AuthorsNotePortal />
        </div>
    );
}
