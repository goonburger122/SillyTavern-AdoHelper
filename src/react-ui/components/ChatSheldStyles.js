/**
 * ChatSheldStyles — Glassmorphic Chat Override Stylesheet
 *
 * Scoped via `.ado-app` selector for style isolation without Shadow DOM.
 * Uses Ado Helper theme CSS custom properties with dark/light mode awareness.
 *
 * Design direction: Frosted crystalline — every surface feels like looking
 * through tinted, lightly frosted glass. Depth is conveyed through layered
 * translucency rather than drop-shadows. Accent bars glow softly as if
 * backlit by neon behind the glass pane.
 */

export const chatSheldStyles = `
/* ═══════════════════════════════════════════════════════════════════════
   RESET & HOST
   ═══════════════════════════════════════════════════════════════════════ */

.ado-app {
  --ado-radius: 14px;
  --ado-radius-sm: 8px;
  --ado-radius-xs: 5px;
  --ado-gap: 10px;
  --ado-accent-width: 3px;
  --ado-transition: 220ms cubic-bezier(0.4, 0, 0.2, 1);
  --ado-transition-fast: 120ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Glass surface defaults (dark mode) — overridden contextually for light */
  --ado-glass-bg: rgba(18, 16, 28, 0.55);
  --ado-glass-bg-hover: rgba(24, 22, 36, 0.65);
  --ado-glass-border: rgba(255, 255, 255, 0.06);
  --ado-glass-border-hover: rgba(255, 255, 255, 0.1);
  --ado-glass-blur: 14px;
  --ado-glass-char-tint: rgba(100, 120, 255, 0.03);
  --ado-glass-user-tint: rgba(255, 180, 100, 0.03);

  /* Scrollbar */
  --ado-scrollbar-w: 5px;
  --ado-scrollbar-track: transparent;
  --ado-scrollbar-thumb: var(--ado-fill, rgba(255,255,255,0.08));
  --ado-scrollbar-thumb-hover: var(--ado-fill-hover, rgba(255,255,255,0.15));

  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  min-height: 0;
  background: transparent;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  font-size: 15px;
  line-height: 1.55;
  color: var(--ado-text, rgba(230, 230, 240, 0.92));
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Universal reset — exclude OOC factory DOM AND message-content descendants
   so LLM-generated HTML retains browser defaults and authored styles.
   :where() wrapper keeps specificity at 0,1,0 so component-level selectors
   like .ado-textarea can override padding/margin normally. */
.ado-app *:where(:not([data-ado-ooc], [data-ado-ooc] *, [data-ado-irc], [data-ado-irc] *, .ado-message-content, .ado-message-content *)),
.ado-app *:where(:not([data-ado-ooc], [data-ado-ooc] *, [data-ado-irc], [data-ado-irc] *, .ado-message-content, .ado-message-content *))::before,
.ado-app *:where(:not([data-ado-ooc], [data-ado-ooc] *, [data-ado-irc], [data-ado-irc] *, .ado-message-content, .ado-message-content *))::after {
  box-sizing: border-box; margin: 0; padding: 0;
}

/* Lightweight reset for message content — box-sizing only, at :where() specificity
   so authored styles easily override. Browser defaults for margin/padding preserved. */
.ado-message-content :where(*) {
  box-sizing: border-box;
}

/* Lucide icons: inherit color, flex-friendly sizing */
svg.lucide {
  flex-shrink: 0;
  color: inherit;
  fill: none;
  stroke: currentColor;
}

/* ═══════════════════════════════════════════════════════════════════════
   CONTAINER
   ═══════════════════════════════════════════════════════════════════════ */

.ado-container {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: clip;
}

/* ═══════════════════════════════════════════════════════════════════════
   SCROLL CONTAINER
   ═══════════════════════════════════════════════════════════════════════ */

.ado-scroll-container {
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  padding: 8px 12px;
  padding-bottom: var(--ado-input-safe-zone, 80px);
  overscroll-behavior-y: contain;
}

/* Custom scrollbar */
.ado-scroll-container::-webkit-scrollbar {
  width: var(--ado-scrollbar-w);
}
.ado-scroll-container::-webkit-scrollbar-track {
  background: var(--ado-scrollbar-track);
}
.ado-scroll-container::-webkit-scrollbar-thumb {
  background: var(--ado-scrollbar-thumb);
  border-radius: 10px;
  transition: background 0.2s;
}
.ado-scroll-container::-webkit-scrollbar-thumb:hover {
  background: var(--ado-scrollbar-thumb-hover);
}

/* Firefox */
.ado-scroll-container {
  scrollbar-width: thin;
  scrollbar-color: var(--ado-scrollbar-thumb) var(--ado-scrollbar-track);
}

/* ═══════════════════════════════════════════════════════════════════════
   MESSAGE LIST
   ═══════════════════════════════════════════════════════════════════════ */

.ado-message-list {
  display: flex;
  flex-direction: column;
  gap: var(--ado-gap);
}

/* ═══════════════════════════════════════════════════════════════════════
   MESSAGE CARD — Base
   ═══════════════════════════════════════════════════════════════════════ */

.ado-message {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  border-radius: var(--ado-radius);
  background: var(--ado-glass-bg);
  border: 1px solid var(--ado-glass-border);
  transition:
    background var(--ado-transition),
    border-color var(--ado-transition),
    box-shadow var(--ado-transition),
    transform var(--ado-transition);
  overflow: hidden;
}

.ado-message:hover {
  background: var(--ado-glass-bg-hover);
  border-color: var(--ado-glass-border-hover);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.12);
}

/* During streaming, the main thread freezes for 170-600ms (assembleMessages,
   syncFullChat, council tools). If the user scrolls during this freeze, the GPU
   compositor shifts stale backdrop-filter textures — when the thread unblocks,
   those textures aren't repainted and render as a black void.
   Fix: disable backdrop-filter on ALL cards while any card is streaming. The
   parent .ado-app gets a class and we use it to bypass the expensive blur.
   The opaque fallback background is visually close enough that the transition
   is imperceptible. will-change on the streaming card keeps its own layer
   stable during rapid height changes from incoming tokens. */
.ado-container--streaming .ado-message {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
.ado-container--streaming .ado-message.ado-in-viewport {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
.ado-message--streaming {
  will-change: transform, contents;
}

/* ── Accent bars ── */
.ado-message::before {
  content: '';
  position: absolute;
  top: 8px;
  bottom: auto;
  height: calc(100% - 16px);
  width: var(--ado-accent-width);
  border-radius: 2px;
  opacity: 0.85;
  transition: opacity var(--ado-transition), box-shadow var(--ado-transition), height 180ms ease-out;
}

.ado-message:hover::before {
  opacity: 1;
}

/* ── Character variant ── */
.ado-message--character {
  background:
    linear-gradient(135deg, var(--ado-glass-char-tint) 0%, transparent 60%),
    var(--ado-glass-bg);
}
.ado-message--character::before {
  left: 0;
  background: linear-gradient(
    180deg,
    var(--ado-primary, rgba(140, 130, 255, 0.9)) 0%,
    var(--ado-primary-060, rgba(140, 130, 255, 0.6)) 100%
  );
  box-shadow: 0 0 8px var(--ado-primary-025, rgba(140, 130, 255, 0.25));
}
.ado-message--character:hover::before {
  box-shadow: 0 0 14px var(--ado-primary-040, rgba(140, 130, 255, 0.4));
}

/* ── User variant ── */
.ado-message--user {
  background:
    linear-gradient(225deg, var(--ado-glass-user-tint) 0%, transparent 60%),
    var(--ado-glass-bg);
}
.ado-message--user::before {
  right: 0;
  left: auto;
  background: linear-gradient(
    180deg,
    var(--ado-secondary-080, rgba(255, 180, 100, 0.8)) 0%,
    var(--ado-secondary-045, rgba(255, 180, 100, 0.45)) 100%
  );
  box-shadow: 0 0 8px var(--ado-secondary-020, rgba(255, 180, 100, 0.2));
}
.ado-message--user:hover::before {
  box-shadow: 0 0 14px var(--ado-secondary-035, rgba(255, 180, 100, 0.35));
}

/* ── System variant ── */
.ado-message--system {
  text-align: center;
  padding: 8px 16px;
  font-size: 0.88em;
  color: var(--ado-text-muted, rgba(230,230,240,0.6));
  background: var(--ado-fill-subtle, rgba(255,255,255,0.03));
  border-color: transparent;
}
.ado-message--system::before { display: none; }
.ado-message--system:hover {
  background: var(--ado-fill, rgba(255,255,255,0.06));
}

/* ═══════════════════════════════════════════════════════════════════════
   MESSAGE HEADER (avatar + name + timestamp)
   ═══════════════════════════════════════════════════════════════════════ */

.ado-message-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.ado-message--character .ado-message-header {
  padding-left: 8px;
}
.ado-message--user .ado-message-header {
  flex-direction: row-reverse;
  padding-right: 8px;
}

.ado-message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 1.5px solid var(--ado-border, rgba(255,255,255,0.08));
  background: var(--ado-fill-subtle, rgba(255,255,255,0.04));
}

.ado-message-avatar--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--ado-text-muted, rgba(230,230,240,0.6));
  background: var(--ado-fill, rgba(255,255,255,0.06));
}

.ado-message-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.ado-message--user .ado-message-meta {
  align-items: flex-end;
}

.ado-message-name {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.015em;
  color: var(--ado-text, rgba(230,230,240,0.92));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ado-message--character .ado-message-name {
  color: var(--ado-primary-text, rgba(160, 150, 255, 0.95));
}

.ado-message-timestamp {
  font-size: 10.5px;
  color: var(--ado-text-dim, rgba(230,230,240,0.35));
  letter-spacing: 0.03em;
  font-variant-numeric: tabular-nums;
}

/* ═══════════════════════════════════════════════════════════════════════
   MESSAGE CONTENT — Prose
   ═══════════════════════════════════════════════════════════════════════ */

.ado-message-content {
  padding: 0 4px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  min-height: 1.55em;
  /* Explicit resets — prevent ST global styles from leaking in */
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  text-indent: 0;
  text-transform: none;
  letter-spacing: normal;
  text-shadow: none;
}

.ado-message--character .ado-message-content {
  padding-left: 8px;
}
.ado-message--user .ado-message-content {
  padding-right: 8px;
}

/* ── Suppress browser/ST-generated quotation marks ──
   ST's messageFormatting wraps speech in <q> tags. Browsers add curly quotes
   via ::before/::after, doubling up with the straight quotes already in text. */
.ado-message-content :where(q) {
  quotes: none;
}
.ado-message-content :where(q::before, q::after) {
  content: none;
}

/* ── Content element defaults ──
   Low-specificity defaults for Marked output. :where() wraps the element
   selectors so any authored styles (class-based or inline) from
   LLM-generated HTML easily override these.
   Elements inside [data-ado-ooc] are excluded so the DOM factory
   templates from oocComments.js can use their own style.css classes. */

.ado-message-content :where(p:not([data-ado-ooc] *, [data-ado-ooc]),
                             span:not([data-ado-ooc] *, [data-ado-ooc]),
                             div:not([data-ado-ooc] *, [data-ado-ooc])) {
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  text-indent: 0;
  text-transform: none;
  letter-spacing: normal;
  text-decoration: none;
  text-shadow: none;
}

.ado-message-content :where(p:not([data-ado-ooc] *, [data-ado-ooc])) { margin: 0 0 0.6em; }
.ado-message-content :where(p:not([data-ado-ooc] *, [data-ado-ooc]):last-child) { margin-bottom: 0; }

/* ── Themed prose colors ──
   Dialogue, italics, and bold use theme-derived colors for visual
   distinction between spoken words, thoughts, and emphasis. */

.ado-message-content :where(em:not([data-ado-ooc] *, [data-ado-ooc])),
.ado-message-content .ado-prose-italic:not([data-ado-ooc] *, [data-ado-ooc]) {
  font-style: italic;
  color: var(--ado-prose-italic, var(--ado-text-muted, rgba(230,230,240,0.7)));
  text-decoration: none;
  background: none;
}

.ado-message-content :where(strong:not([data-ado-ooc] *, [data-ado-ooc])),
.ado-message-content .ado-prose-bold:not([data-ado-ooc] *, [data-ado-ooc]) {
  font-weight: 600;
  color: var(--ado-prose-bold, inherit);
  text-decoration: none;
  background: none;
}

/* Dialogue span — uses our class so specificity (0-2-0) exceeds the
   :where()-wrapped content defaults (0-1-0) without needing tricks. */
.ado-message-content span.ado-prose-dialogue {
  color: var(--ado-prose-dialogue, var(--ado-text, inherit));
}

/* Inside <font color="..."> tags, dialogue/italic/bold all defer to the
   font's explicit color rather than applying theme prose colors. */
.ado-message-content :where(font) span.ado-prose-dialogue,
.ado-message-content :where(font em),
.ado-message-content :where(font) .ado-prose-italic,
.ado-message-content :where(font strong),
.ado-message-content :where(font) .ado-prose-bold {
  color: inherit;
}

/* Inside dialogue spans (without font ancestor), italic/bold inherit
   the dialogue color for visual consistency. */
.ado-message-content .ado-prose-dialogue :where(em),
.ado-message-content .ado-prose-dialogue .ado-prose-italic,
.ado-message-content .ado-prose-dialogue :where(strong),
.ado-message-content .ado-prose-dialogue .ado-prose-bold {
  color: inherit;
}

.ado-message-content :where(a) {
  color: var(--ado-primary-text, rgba(160, 150, 255, 0.95));
  text-decoration: none;
  border-bottom: 1px solid var(--ado-primary-025, rgba(140, 130, 255, 0.25));
  background: none;
  transition: border-color var(--ado-transition-fast);
}
.ado-message-content :where(a:hover) {
  border-color: var(--ado-primary-060, rgba(140, 130, 255, 0.6));
  text-decoration: none;
}

/* Code (inline) */
.ado-message-content :where(code) {
  font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, Consolas, monospace;
  font-size: 0.88em;
  padding: 1.5px 5px;
  border-radius: var(--ado-radius-xs);
  background: var(--ado-fill, rgba(255,255,255,0.06));
  border: 1px solid var(--ado-border, rgba(255,255,255,0.06));
  color: var(--ado-primary-text, rgba(160, 150, 255, 0.95));
  text-decoration: none;
  text-shadow: none;
  letter-spacing: normal;
}

/* Code block */
.ado-message-content :where(pre) {
  margin: 8px 0;
  padding: 12px 14px;
  border-radius: var(--ado-radius-sm);
  background: var(--ado-bg-deep, rgba(10, 8, 18, 0.9));
  border: 1px solid var(--ado-border, rgba(255,255,255,0.06));
  overflow-x: auto;
  font-size: 0.88em;
  line-height: 1.5;
  text-indent: 0;
  text-shadow: none;
}
.ado-message-content :where(pre code) {
  padding: 0;
  border: none;
  background: none;
  color: var(--ado-text, rgba(230,230,240,0.92));
  font-size: inherit;
}

/* Blockquote */
.ado-message-content :where(blockquote) {
  margin: 6px 0;
  padding: 6px 14px;
  border: none;
  border-left: 2px solid var(--ado-primary-030, rgba(140, 130, 255, 0.3));
  background: var(--ado-fill-subtle, rgba(255,255,255,0.02));
  border-radius: 0 var(--ado-radius-xs) var(--ado-radius-xs) 0;
  color: var(--ado-prose-blockquote, var(--ado-text-muted, rgba(230,230,240,0.7)));
  font-style: italic;
  font-size: inherit;
  line-height: inherit;
  text-indent: 0;
  text-shadow: none;
}

/* Lists */
.ado-message-content :where(ul), .ado-message-content :where(ol) {
  padding-left: 1.4em;
  margin: 4px 0;
  list-style-position: outside;
  background: none;
}
.ado-message-content :where(ul) { list-style-type: disc; }
.ado-message-content :where(ol) { list-style-type: decimal; }
.ado-message-content :where(li) {
  margin-bottom: 2px;
  padding: 0;
  border: none;
  background: none;
  text-indent: 0;
}

/* Headings */
.ado-message-content :where(h1, h2, h3, h4, h5, h6) {
  margin: 0.7em 0 0.35em;
  padding: 0;
  border: none;
  background: none;
  font-weight: 600;
  font-family: inherit;
  line-height: 1.3;
  color: var(--ado-text, rgba(230,230,240,0.92));
  white-space: normal;
  text-indent: 0;
  text-transform: none;
  text-decoration: none;
  text-shadow: none;
  letter-spacing: normal;
}
.ado-message-content :where(h1) { font-size: 1.35em; }
.ado-message-content :where(h2) { font-size: 1.2em; }
.ado-message-content :where(h3) { font-size: 1.1em; }
.ado-message-content :where(h4) { font-size: 1.02em; }
.ado-message-content :where(h5) { font-size: 0.95em; }
.ado-message-content :where(h6) { font-size: 0.9em; color: var(--ado-text-muted, rgba(230,230,240,0.7)); }
.ado-message-content :where(h1:first-child, h2:first-child, h3:first-child) { margin-top: 0; }

/* Horizontal rule */
.ado-message-content :where(hr) {
  border: none;
  height: 1px;
  background: var(--ado-border, rgba(255,255,255,0.06));
  margin: 12px 0;
  padding: 0;
}

/* Images */
.ado-message-content :where(img) {
  max-width: 100%;
  border-radius: var(--ado-radius-sm);
  margin: 6px 0;
  border: none;
}

/* ═══════════════════════════════════════════════════════════════════════
   MESSAGE ACTIONS — Hover Reveal
   ═══════════════════════════════════════════════════════════════════════ */

.ado-message-actions {
  position: absolute;
  top: 8px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transform: translateY(-2px);
  pointer-events: none;
  transition:
    opacity var(--ado-transition),
    transform var(--ado-transition);
  z-index: 5;
}

.ado-message--user .ado-message-actions {
  right: auto;
  left: 12px;
}

.ado-message:hover .ado-message-actions {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.ado-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--ado-radius-xs);
  background: var(--ado-bg-elevated, rgba(28, 26, 40, 0.85));
  color: var(--ado-text-muted, rgba(230,230,240,0.6));
  cursor: pointer;
  transition:
    color var(--ado-transition-fast),
    background var(--ado-transition-fast);
  font-size: 13px;
  line-height: 1;
  padding: 0;
}

.ado-action-btn:hover {
  color: var(--ado-text, rgba(230,230,240,0.92));
  background: var(--ado-fill-hover, rgba(255,255,255,0.12));
}

.ado-action-btn--danger:hover {
  color: var(--ado-danger, #ef4444);
  background: var(--ado-danger-010, rgba(239, 68, 68, 0.1));
}

/* ═══════════════════════════════════════════════════════════════════════
   SWIPE CONTROLS
   ═══════════════════════════════════════════════════════════════════════ */

.ado-swipe {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 4px 0 0;
  margin-top: 4px;
}

.ado-swipe-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px solid var(--ado-glass-border);
  border-radius: 50%;
  background: var(--ado-fill-subtle, rgba(255,255,255,0.04));
  color: var(--ado-text-muted, rgba(230,230,240,0.55));
  cursor: pointer;
  transition:
    color var(--ado-transition-fast),
    background var(--ado-transition-fast),
    border-color var(--ado-transition-fast);
  font-size: 12px;
  padding: 0;
}

.ado-swipe-btn:hover {
  color: var(--ado-text, rgba(230,230,240,0.92));
  background: var(--ado-fill-hover, rgba(255,255,255,0.1));
  border-color: var(--ado-glass-border-hover);
}

.ado-swipe-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.ado-swipe-counter {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--ado-text-dim, rgba(230,230,240,0.4));
  min-width: 36px;
  text-align: center;
  user-select: none;
}

/* ═══════════════════════════════════════════════════════════════════════
   INPUT AREA
   ═══════════════════════════════════════════════════════════════════════ */

.ado-input-area {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 14px 10px;
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  z-index: 20;
  background: color-mix(in srgb, var(--ado-page-bg, #0a0a0c) 92%, var(--ado-text, white) 8%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--ado-glass-border);
  border-radius: var(--ado-radius);
  box-shadow:
    0 -6px 28px rgba(0,0,0,0.12),
    0 4px 24px rgba(0,0,0,0.14),
    inset 0 0.5px 0 rgba(255,255,255,0.06);
  transition: background var(--ado-transition), border-color var(--ado-transition), box-shadow var(--ado-transition);
}

/* ── Action Bar (regenerate, continue, impersonate, close) ── */

.ado-action-bar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 2px;
}

.ado-action-bar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 26px;
  border: none;
  border-radius: var(--ado-radius-xs);
  background: transparent;
  color: var(--ado-text-dim, rgba(230,230,240,0.4));
  cursor: pointer;
  transition:
    color var(--ado-transition-fast),
    background var(--ado-transition-fast);
  padding: 0;
}

.ado-action-bar-btn:hover {
  color: var(--ado-text, rgba(230,230,240,0.92));
  background: var(--ado-fill, rgba(255,255,255,0.06));
}

.ado-action-bar-btn--stop {
  color: var(--ado-danger, #ef4444);
}
.ado-action-bar-btn--stop:hover {
  color: #fff;
  background: var(--ado-danger, #ef4444);
}

.ado-action-bar-btn--close {
  margin-left: auto;
}
.ado-action-bar-btn--close:hover {
  color: var(--ado-danger, #ef4444);
  background: var(--ado-danger-010, rgba(239, 68, 68, 0.1));
}

/* ── Input Row (textarea + send) ── */

.ado-input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.ado-input-wrapper {
  flex: 1;
  display: flex;
  align-items: flex-end;
  min-height: 40px;
  max-height: 180px;
  border-radius: var(--ado-radius);
  border: 1px solid var(--ado-border, rgba(255,255,255,0.08));
  background: var(--ado-fill-subtle, rgba(255,255,255,0.04));
  transition:
    border-color var(--ado-transition),
    background var(--ado-transition),
    box-shadow var(--ado-transition);
  overflow: hidden;
}

.ado-input-wrapper:focus-within {
  border-color: var(--ado-primary-040, rgba(140, 130, 255, 0.4));
  background: var(--ado-fill, rgba(255,255,255,0.06));
  box-shadow: 0 0 0 2px var(--ado-primary-010, rgba(140, 130, 255, 0.1));
}

.ado-textarea {
  flex: 1;
  resize: none;
  border: none;
  outline: none;
  background: transparent;
  color: var(--ado-text, rgba(230,230,240,0.92));
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  padding: 9px 14px;
  min-height: 40px;
  max-height: 180px;
  overflow-y: auto;
}

.ado-textarea::placeholder {
  color: var(--ado-text-dim, rgba(230,230,240,0.3));
}

.ado-textarea::-webkit-scrollbar { width: 3px; }
.ado-textarea::-webkit-scrollbar-thumb {
  background: var(--ado-scrollbar-thumb);
  border-radius: 4px;
}

.ado-send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--ado-radius);
  background: var(--ado-primary, rgba(140, 130, 255, 0.9));
  color: #fff;
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background var(--ado-transition-fast),
    transform var(--ado-transition-fast),
    opacity var(--ado-transition-fast);
  font-size: 16px;
  padding: 0;
}

.ado-send-btn:hover {
  background: var(--ado-primary-hover, rgba(160, 150, 255, 0.95));
  transform: scale(1.04);
}

.ado-send-btn:active {
  transform: scale(0.96);
}

.ado-send-btn:disabled {
  opacity: 0.35;
  cursor: default;
  transform: none;
}

.ado-send-btn--stop {
  background: var(--ado-danger, #ef4444);
}
.ado-send-btn--stop:hover {
  background: var(--ado-danger-hover, #dc2626);
}

/* ═══════════════════════════════════════════════════════════════════════
   STREAMING INDICATOR
   ═══════════════════════════════════════════════════════════════════════ */

.ado-streaming {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 0 2px;
}

.ado-streaming-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--ado-primary, rgba(140, 130, 255, 0.9));
  animation: ado-bounce 1.2s ease-in-out infinite;
}

.ado-streaming-dot:nth-child(2) { animation-delay: 0.15s; }
.ado-streaming-dot:nth-child(3) { animation-delay: 0.3s; }

@keyframes ado-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-5px); opacity: 1; }
}

/* ═══════════════════════════════════════════════════════════════════════
   SCROLL-TO-BOTTOM FAB
   ═══════════════════════════════════════════════════════════════════════ */

.ado-scroll-fab {
  position: absolute;
  bottom: calc(var(--ado-input-safe-zone, 80px) + 24px);
  right: 18px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--ado-glass-border);
  background: var(--ado-bg-elevated, rgba(28, 26, 40, 0.85));
  color: var(--ado-text-muted, rgba(230,230,240,0.6));
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 15;
  box-shadow: var(--ado-shadow-md, 0 8px 24px rgba(0,0,0,0.2));
  transition:
    opacity var(--ado-transition),
    transform var(--ado-transition),
    color var(--ado-transition-fast),
    background var(--ado-transition-fast);
  font-size: 16px;
  padding: 0;
}

.ado-scroll-fab:hover {
  color: var(--ado-text, rgba(230,230,240,0.92));
  background: var(--ado-fill-hover, rgba(255,255,255,0.12));
  transform: scale(1.06);
}

.ado-scroll-fab--hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateY(8px) scale(0.9);
}

/* ═══════════════════════════════════════════════════════════════════════
   REASONING BLOCK (collapsible thinking)
   ═══════════════════════════════════════════════════════════════════════ */

.ado-reasoning {
  margin: 6px 0 4px;
  border-radius: var(--ado-radius-sm);
  border: 1px solid var(--ado-border, rgba(255,255,255,0.06));
  overflow: hidden;
  font-size: 0.88em;
}

.ado-reasoning-toggle {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding: 7px 12px;
  border: none;
  background: var(--ado-fill-subtle, rgba(255,255,255,0.03));
  color: var(--ado-text-muted, rgba(230,230,240,0.6));
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-align: left;
  font-family: inherit;
  transition:
    background var(--ado-transition-fast),
    color var(--ado-transition-fast);
}

.ado-reasoning-toggle:hover {
  background: var(--ado-fill, rgba(255,255,255,0.06));
  color: var(--ado-text, rgba(230,230,240,0.9));
}

.ado-reasoning-chevron {
  transition: transform var(--ado-transition);
  flex-shrink: 0;
}

.ado-reasoning-chevron--open {
  transform: rotate(90deg);
}

.ado-reasoning-body {
  padding: 10px 12px;
  color: var(--ado-text-muted, rgba(230,230,240,0.65));
  line-height: 1.55;
  border-top: 1px solid var(--ado-border, rgba(255,255,255,0.04));
  background: var(--ado-fill-subtle, rgba(255,255,255,0.015));
  max-height: 400px;
  overflow-y: auto;
}

/* Markdown prose inside reasoning body */
.ado-reasoning-body p { margin: 0 0 0.5em; }
.ado-reasoning-body p:last-child { margin-bottom: 0; }
.ado-reasoning-body strong { font-weight: 600; color: var(--ado-text, rgba(230,230,240,0.85)); }
.ado-reasoning-body em { font-style: italic; }
.ado-reasoning-body code {
  font-family: 'SF Mono', 'Fira Code', Menlo, Consolas, monospace;
  font-size: 0.88em;
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--ado-fill, rgba(255,255,255,0.06));
  border: 1px solid var(--ado-border, rgba(255,255,255,0.06));
}
.ado-reasoning-body pre {
  margin: 6px 0;
  padding: 10px 12px;
  border-radius: var(--ado-radius-xs);
  background: var(--ado-bg-deep, rgba(10, 8, 18, 0.9));
  border: 1px solid var(--ado-border, rgba(255,255,255,0.06));
  overflow-x: auto;
  font-size: 0.88em;
  line-height: 1.5;
  white-space: pre;
}
.ado-reasoning-body pre code {
  padding: 0;
  border: none;
  background: none;
  color: var(--ado-text, rgba(230,230,240,0.8));
}
.ado-reasoning-body ul {
  padding-left: 1.5em;
  margin: 4px 0;
  list-style-position: outside;
  list-style-type: disc;
}
.ado-reasoning-body ol {
  padding-left: 1.8em;
  margin: 4px 0;
  list-style-position: inside;
  list-style-type: decimal;
}
.ado-reasoning-body li { margin-bottom: 2px; }
.ado-reasoning-body blockquote {
  margin: 4px 0;
  padding: 4px 12px;
  border-left: 2px solid var(--ado-primary-030, rgba(140, 130, 255, 0.3));
  color: var(--ado-text-dim, rgba(230,230,240,0.5));
  font-style: italic;
}
.ado-reasoning-body h1, .ado-reasoning-body h2, .ado-reasoning-body h3,
.ado-reasoning-body h4, .ado-reasoning-body h5, .ado-reasoning-body h6 {
  margin: 0.65em 0 0.3em;
  color: var(--ado-text, rgba(230,230,240,0.92));
  font-weight: 600;
  line-height: 1.3;
  white-space: normal;
}
.ado-reasoning-body h1:first-child, .ado-reasoning-body h2:first-child,
.ado-reasoning-body h3:first-child { margin-top: 0; }
.ado-reasoning-body h1 { font-size: 1.4em; }
.ado-reasoning-body h2 { font-size: 1.25em; }
.ado-reasoning-body h3 { font-size: 1.15em; }
.ado-reasoning-body h4 { font-size: 1.05em; }
.ado-reasoning-body h5 { font-size: 0.95em; }
.ado-reasoning-body h6 { font-size: 0.9em; color: var(--ado-text-muted, rgba(230,230,240,0.7)); }

/* Animated expand/collapse wrapper (CSS grid row trick) */
.ado-reasoning-body-wrap {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.ado-reasoning-body-wrap--open {
  grid-template-rows: 1fr;
  opacity: 1;
}
.ado-reasoning-body-overflow {
  overflow: hidden;
}

/* ═══════════════════════════════════════════════════════════════════════
   LOAD MORE SENTINEL
   ═══════════════════════════════════════════════════════════════════════ */

.ado-load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  min-height: 42px;
}

.ado-load-more-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--ado-fill, rgba(255,255,255,0.06));
  border-top-color: var(--ado-primary-050, rgba(140, 130, 255, 0.5));
  border-radius: 50%;
  animation: ado-spin 0.75s linear infinite;
}

@keyframes ado-spin {
  to { transform: rotate(360deg); }
}

/* ═══════════════════════════════════════════════════════════════════════
   LOADING SKELETON (shown by service layer before React mounts)
   ═══════════════════════════════════════════════════════════════════════ */

#ado-loading-skeleton {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  height: 100%;
  position: relative;
}

#ado-loading-skeleton .ado-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ado-skeleton-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--ado-fill, rgba(255,255,255,0.06));
  border-top-color: var(--ado-primary-050, rgba(140, 130, 255, 0.5));
  border-radius: 50%;
  animation: ado-spin 0.75s linear infinite;
}

.ado-skeleton-label {
  margin-top: 14px;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  color: var(--ado-text-050, rgba(255,255,255,0.5));
  font-family: var(--ado-font, inherit);
}

.ado-skeleton-joke {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  font-style: italic;
  color: var(--ado-text, rgba(255,255,255,0.7));
  max-width: 80%;
  text-align: center;
  pointer-events: none;
  line-height: 1.4;
  opacity: 0.75;
}

.ado-skeleton-joke:empty {
  display: none;
}

/* ═══════════════════════════════════════════════════════════════════════
   BOOKMARK INDICATOR
   ═══════════════════════════════════════════════════════════════════════ */

.ado-bookmark {
  position: absolute;
  top: 0;
  right: 16px;
  font-size: 14px;
  color: var(--ado-warning-060, rgba(245, 158, 11, 0.6));
  pointer-events: none;
}

.ado-message--user .ado-bookmark {
  right: auto;
  left: 16px;
}

/* ═══════════════════════════════════════════════════════════════════════
   SUMMARY MARKERS
   ═══════════════════════════════════════════════════════════════════════ */

.ado-summary-marker {
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  vertical-align: middle;
}

.ado-summary-icon {
  width: 11px;
  height: 11px;
  flex-shrink: 0;
}

.ado-summary-marker--complete {
  color: var(--ado-primary-text, rgba(160, 150, 255, 0.95));
  opacity: 0.7;
}
.ado-summary-marker--complete:hover { opacity: 1; }

.ado-summary-marker--error {
  color: var(--ado-danger, #ef4444);
  opacity: 0.7;
}

.ado-summary-marker--loading {
  color: var(--ado-primary, rgba(140, 130, 255, 0.9));
}

.ado-summary-spinner {
  animation: ado-spin 0.75s linear infinite;
}

/* ═══════════════════════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════════════════════ */

.ado-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 10px;
  padding: 40px 20px;
  color: var(--ado-text-dim, rgba(230,230,240,0.35));
  text-align: center;
}

.ado-empty-icon {
  font-size: 32px;
  opacity: 0.4;
  margin-bottom: 4px;
}

.ado-empty-text {
  font-size: 14px;
  max-width: 260px;
  line-height: 1.5;
}

/* ═══════════════════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════════════════ */

@media (max-width: 768px) {
  .ado-app {
    font-size: 14px;
  }

  .ado-app .ado-header {
    padding: 8px 12px !important;
    min-height: 46px !important;
  }

  .ado-scroll-container {
    padding: 6px 8px;
    padding-bottom: var(--ado-input-safe-zone, 80px);
  }

  .ado-message {
    padding: 10px 12px;
    border-radius: 10px;
  }

  .ado-message-avatar {
    width: 30px;
    height: 30px;
  }

  .ado-message-name { font-size: 12px; }
  .ado-message-timestamp { font-size: 10px; }

  /* ── Mobile input area — larger touch targets ── */
  .ado-input-area {
    padding: 10px 12px 14px;
    gap: 8px;
    bottom: 8px;
    left: 8px;
    right: 8px;
  }

  .ado-action-bar {
    gap: 4px;
  }

  .ado-action-bar-btn {
    width: 38px;
    height: 34px;
    border-radius: 8px;
  }

  .ado-input-wrapper {
    min-height: 46px;
  }

  .ado-textarea {
    font-size: 16px; /* Prevents iOS zoom on focus */
    min-height: 46px;
    padding: 12px 14px;
  }

  .ado-send-btn {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    font-size: 18px;
  }

  .ado-batch-bar {
    padding: 10px 12px;
    gap: 10px;
  }

  .ado-batch-bar-text {
    font-size: 13px;
  }

  .ado-scroll-fab {
    bottom: calc(var(--ado-input-safe-zone, 80px) + 28px);
    right: 12px;
    width: 38px;
    height: 38px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .ado-message-header { gap: 7px; }
  .ado-message { padding: 8px 10px; }
  .ado-message--character .ado-message-content,
  .ado-message--character .ado-message-header {
    padding-left: 6px;
  }
  .ado-message--user .ado-message-content,
  .ado-message--user .ado-message-header {
    padding-right: 6px;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   REDUCED MOTION
   ═══════════════════════════════════════════════════════════════════════ */

@media (prefers-reduced-motion: reduce) {
  .ado-app {
    --ado-transition: 0ms;
    --ado-transition-fast: 0ms;
  }

  .ado-streaming-dot,
  .ado-load-more-spinner,
  .ado-header-status--streaming {
    animation: none;
  }

  .ado-streaming-dot { opacity: 0.7; }
  .ado-load-more-spinner { border-top-color: var(--ado-primary, rgba(140, 130, 255, 0.9)); }
}

/* ═══════════════════════════════════════════════════════════════════════
   TOKEN BADGE
   ═══════════════════════════════════════════════════════════════════════ */

.ado-token-badge {
  display: inline-block;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--ado-text-dim, rgba(230,230,240,0.3));
  padding: 1px 4px;
  border-radius: 3px;
  background: transparent;
  margin-left: 6px;
  cursor: pointer;
  transition: color var(--ado-transition-fast), background var(--ado-transition-fast);
  user-select: none;
}

.ado-token-badge:hover {
  color: var(--ado-text-muted, rgba(230,230,240,0.55));
  background: var(--ado-fill-subtle, rgba(255,255,255,0.04));
}

/* ═══════════════════════════════════════════════════════════════════════
   TOOLS MENU DROPDOWN
   ═══════════════════════════════════════════════════════════════════════ */

.ado-tools-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 14px;
  min-width: 200px;
  padding: 5px;
  border-radius: var(--ado-radius);
  background: var(--ado-bg-deepest, rgb(16, 13, 24));
  border: 1px solid var(--ado-glass-border-hover, rgba(255,255,255,0.1));
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px var(--ado-border, rgba(255,255,255,0.06));
  z-index: 30;
  animation: ado-tools-enter 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes ado-tools-enter {
  from { opacity: 0; transform: translateY(4px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.ado-tools-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: var(--ado-radius-sm);
  background: transparent;
  color: var(--ado-text-muted, rgba(230,230,240,0.7));
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: background var(--ado-transition-fast), color var(--ado-transition-fast);
  text-align: left;
}

.ado-tools-menu-item:hover {
  color: var(--ado-text, rgba(230,230,240,0.92));
  background: var(--ado-fill, rgba(255,255,255,0.06));
}

.ado-tools-menu-item--danger:hover {
  color: var(--ado-danger, #ef4444);
  background: var(--ado-danger-010, rgba(239, 68, 68, 0.1));
}

.ado-tools-menu-divider {
  height: 1px;
  margin: 4px 8px;
  background: var(--ado-border, rgba(255,255,255,0.06));
}

/* ═══════════════════════════════════════════════════════════════════════
   BATCH DELETE MODE
   ═══════════════════════════════════════════════════════════════════════ */

.ado-batch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--ado-radius-sm);
  background: var(--ado-danger-010, rgba(239, 68, 68, 0.08));
  border: 1px solid var(--ado-danger-020, rgba(239, 68, 68, 0.2));
  flex-wrap: wrap;
  min-height: 36px;
}

.ado-batch-bar-text {
  font-size: 12px;
  color: var(--ado-text-muted, rgba(230,230,240,0.7));
  padding: 2px 4px;
  flex: 1 1 auto;
  min-width: 0;
}

.ado-batch-bar-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.ado-action-bar-btn--delete {
  color: var(--ado-danger, #ef4444);
  min-width: fit-content;
}
.ado-action-bar-btn--delete:hover {
  color: #fff;
  background: var(--ado-danger, #ef4444);
}
.ado-action-bar-btn--delete:disabled {
  opacity: 0.35;
  cursor: default;
}

.ado-message--batch-marked {
  border-color: var(--ado-danger-030, rgba(239, 68, 68, 0.3)) !important;
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.06) 0%,
    transparent 60%
  ), var(--ado-glass-bg) !important;
}

.ado-message--batch-cutpoint {
  border-color: var(--ado-danger-050, rgba(239, 68, 68, 0.5)) !important;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.15) !important;
}

.ado-message--batch-marked::before {
  background: var(--ado-danger, #ef4444) !important;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.3) !important;
  opacity: 0.7 !important;
}

.ado-message--batch-cutpoint::before {
  opacity: 1 !important;
  box-shadow: 0 0 14px rgba(239, 68, 68, 0.5) !important;
}

/* ═══════════════════════════════════════════════════════════════════════
   DRAFT HIDDEN — Collapsed Indicator Card
   User messages hidden from AI context (is_user && is_system).
   Renders as a thin dashed-border strip with content preview.
   ═══════════════════════════════════════════════════════════════════════ */

.ado-message--draft-hidden {
  height: 28px;
  min-height: 28px;
  max-height: 28px;
  padding: 0 12px;
  border: 1px dashed var(--ado-border-neutral, rgba(128,128,128,0.25));
  background: var(--ado-fill-subtle, rgba(255,255,255,0.03));
  opacity: 0.65;
  overflow: hidden;
  transition:
    opacity var(--ado-transition),
    border-color var(--ado-transition),
    background var(--ado-transition);
}

.ado-message--draft-hidden::before {
  display: none;
}

.ado-message--draft-hidden:hover {
  opacity: 0.9;
  border-color: var(--ado-secondary-045, rgba(255, 180, 100, 0.45));
  background: var(--ado-fill, rgba(255,255,255,0.06));
}

/* Streaming compat: disable backdrop-filter */
.ado-container--streaming .ado-message--draft-hidden {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

/* Batch delete compat */
.ado-message--draft-hidden.ado-message--batch-marked {
  border-color: var(--ado-danger-030, rgba(239, 68, 68, 0.3)) !important;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, transparent 60%),
    var(--ado-fill-subtle, rgba(255,255,255,0.03)) !important;
  opacity: 0.8;
}
.ado-message--draft-hidden.ado-message--batch-cutpoint {
  border-color: var(--ado-danger-050, rgba(239, 68, 68, 0.5)) !important;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.15) !important;
  opacity: 0.9;
}

/* ── Inner layout ── */
.ado-draft-hidden-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
  font-size: 11.5px;
  color: var(--ado-text-dim, rgba(230,230,240,0.35));
  white-space: nowrap;
  overflow: hidden;
}

.ado-draft-hidden-id {
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  color: var(--ado-text-dim, rgba(230,230,240,0.3));
}

.ado-draft-hidden-label {
  flex-shrink: 0;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  font-size: 10px;
  color: var(--ado-secondary-060, rgba(255, 180, 100, 0.6));
}

.ado-draft-hidden-preview {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--ado-text-dim, rgba(230,230,240,0.35));
}

.ado-draft-hidden-unhide {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border: none;
  border-radius: var(--ado-radius-xs);
  background: transparent;
  color: var(--ado-text-dim, rgba(230,230,240,0.35));
  cursor: pointer;
  transition: color var(--ado-transition-fast), background var(--ado-transition-fast);
}

.ado-draft-hidden-unhide:hover {
  color: var(--ado-secondary, rgba(255, 180, 100, 0.9));
  background: var(--ado-fill, rgba(255,255,255,0.06));
}

/* ── Draft count badge (InputArea action bar) ── */
.ado-draft-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px 2px 5px;
  border-radius: 10px;
  font-size: 10.5px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--ado-secondary-080, rgba(255, 180, 100, 0.8));
  background: var(--ado-secondary-010, rgba(255, 180, 100, 0.1));
  border: 1px solid var(--ado-secondary-020, rgba(255, 180, 100, 0.2));
  line-height: 1;
  vertical-align: middle;
  margin-left: 4px;
  pointer-events: none;
  user-select: none;
}

/* ── Immersive mode: suppress avatar backgrounds on draft cards ── */
.ado-immersive .ado-message--draft-hidden .ado-immersive-avatar-bg,
.ado-immersive .ado-message--draft-hidden .ado-immersive-depth,
.ado-immersive .ado-message--draft-hidden .ado-immersive-mesid {
  display: none;
}

/* ── Bubble mode: suppress avatar backgrounds on draft cards ── */
.ado-bubble .ado-message--draft-hidden .ado-bubble-avatar-bg,
.ado-bubble .ado-message--draft-hidden .ado-bubble-header {
  display: none;
}

/* ═══════════════════════════════════════════════════════════════════════
   STREAMING — Per-Chunk Text Fade-In
   New tokens fade in as they arrive, zero DOM overhead when streaming ends.
   ═══════════════════════════════════════════════════════════════════════ */

@keyframes ado-chunk-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ado-chunk-fade {
  animation: ado-chunk-fade 180ms ease-out both;
}

/* ═══════════════════════════════════════════════════════════════════════
   IMMERSIVE MODE — Large Blended Avatars & Depth
   ═══════════════════════════════════════════════════════════════════════ */

.ado-immersive .ado-message {
  position: relative;
  overflow: hidden;
}

/* ── Large Avatar Background ───────────────────────────────────────── */
.ado-immersive-avatar-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.ado-immersive-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  mask-image: linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 100%);
  filter: saturate(0.8);
  opacity: 0.48;
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.ado-immersive .ado-message:hover .ado-immersive-avatar-img {
  opacity: 0.54;
}

/* User messages: avatar on right, subtler mask */
.ado-immersive .ado-message--user .ado-immersive-avatar-bg {
  left: auto;
  right: 0;
}
.ado-immersive .ado-message--user .ado-immersive-avatar-img {
  mask-image: linear-gradient(to left, rgba(0,0,0,0.55) 0%, transparent 100%);
  -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,0.55) 0%, transparent 100%);
  opacity: 0.52;
}

/* ── Content Repositioning ──────────────────────────────────────────── */
.ado-immersive .ado-message-header,
.ado-immersive .ado-message-content,
.ado-immersive .ado-message-actions,
.ado-immersive .ado-swipe-controls,
.ado-immersive .ado-reasoning,
.ado-immersive .ado-bookmark,
.ado-immersive .ado-token-badge {
  position: relative;
  z-index: 1;
}

/* Hide small header avatar in immersive mode — the large bg avatar replaces it */
.ado-immersive .ado-message-avatar {
  display: none;
}

/* Immersive: larger character name */
.ado-immersive .ado-message-name {
  font-size: 15px;
  font-weight: 700;
}

/* Immersive: transparent action buttons */
.ado-immersive .ado-action-btn {
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
.ado-immersive .ado-action-btn:hover {
  background: var(--ado-fill, rgba(255,255,255,0.08));
}

/* Immersive: frosted glass reasoning accordion */
.ado-immersive .ado-reasoning {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
}
.ado-immersive .ado-reasoning-toggle {
  background: transparent;
  font-size: 12.5px;
}
.ado-immersive .ado-reasoning-body {
  background: rgba(255,255,255,0.02);
  border-top-color: rgba(255,255,255,0.06);
}

/* Immersive: message number badge — top-right corner */
.ado-immersive-mesid {
  position: absolute;
  top: 8px;
  right: 10px;
  z-index: 2;
  font-size: 11px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--ado-text-muted, rgba(230,230,240,0.35));
  pointer-events: none;
  letter-spacing: 0.02em;
  opacity: 0.6;
  transition: opacity var(--ado-transition-fast);
}
.ado-immersive .ado-message:hover .ado-immersive-mesid {
  opacity: 1;
}

/* Immersive: hide accent bars — tinted card backgrounds provide differentiation */
.ado-immersive .ado-message::before {
  display: none;
}

/* ── Floating Depth Elements (assistant only) ──────────────────────── */
.ado-immersive-depth {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

/* Soft radial gradient orb */
.ado-immersive-depth::before {
  content: '';
  position: absolute;
  top: 10%;
  left: 5%;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--ado-primary-010, rgba(140, 130, 255, 0.06)) 0%, transparent 70%);
  animation: ado-float-orb 8s ease-in-out infinite alternate;
  will-change: transform;
}

/* Faint geometric border shape */
.ado-immersive-depth::after {
  content: '';
  position: absolute;
  bottom: 15%;
  right: 8%;
  width: 50px;
  height: 50px;
  border: 1px solid var(--ado-primary-010, rgba(140, 130, 255, 0.04));
  border-radius: 6px;
  transform: rotate(15deg);
  animation: ado-float-geo 10s ease-in-out infinite alternate-reverse;
  will-change: transform;
}

@keyframes ado-float-orb {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(12px, -8px) scale(1.1); }
}

@keyframes ado-float-geo {
  0% { transform: rotate(15deg) translate(0, 0); }
  100% { transform: rotate(25deg) translate(-6px, 6px); }
}

/* ── System Message Pass-Through ───────────────────────────────────── */
.ado-immersive .ado-message--system .ado-immersive-avatar-bg,
.ado-immersive .ado-message--system .ado-immersive-depth {
  display: none;
}

/* ── Reduced Motion for Immersive ──────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .ado-chunk-fade {
    animation: none;
  }
  .ado-immersive-depth::before,
  .ado-immersive-depth::after {
    animation: none;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   BUBBLE MODE — Cinematic Chat Bubbles
   Signature: dissolving avatar backgrounds, squircle thumbnails,
   glassmorphic meta pills, wider cards with generous padding.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Card Overrides ───────────────────────────────────────────────── */
.ado-bubble .ado-message {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  padding: 0;
  border: none;
  background:
    linear-gradient(145deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.007) 40%, rgba(255,255,255,0.013) 100%),
    var(--ado-glass-bg);
  box-shadow:
    0 0 0 0.5px var(--ado-glass-border),
    0 1px 2px rgba(0,0,0,0.25),
    0 4px 12px rgba(0,0,0,0.18),
    0 16px 48px rgba(0,0,0,0.10),
    inset 0 0.5px 0 rgba(255,255,255,0.04);
}

.ado-bubble .ado-message:hover {
  box-shadow:
    0 0 0 0.5px var(--ado-glass-border-hover),
    0 1px 2px rgba(0,0,0,0.28),
    0 4px 16px rgba(0,0,0,0.22),
    0 20px 56px rgba(0,0,0,0.12),
    inset 0 0.5px 0 rgba(255,255,255,0.06);
  background:
    linear-gradient(145deg, rgba(255,255,255,0.028) 0%, rgba(255,255,255,0.01) 40%, rgba(255,255,255,0.018) 100%),
    var(--ado-glass-bg-hover);
}

/* Viewport-gated blur — IntersectionObserver adds .ado-in-viewport to cards
   in the visible area (+ 200px buffer). Off-screen cards skip the expensive
   GPU compositing layer entirely. ~5-8 blurred cards at any time instead of
   the full chat history. */
.ado-bubble .ado-message.ado-in-viewport {
  backdrop-filter: blur(40px) saturate(1.2);
  -webkit-backdrop-filter: blur(40px) saturate(1.2);
}

/* Bottom specular highlight */
.ado-bubble .ado-message::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 12%;
  right: 12%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
  pointer-events: none;
  z-index: 2;
}

/* Hide accent bars — the bubble itself is the visual anchor */
.ado-bubble .ado-message::before {
  display: none;
}

/* ── Character variant tint ── */
.ado-bubble .ado-message--character {
  background:
    linear-gradient(145deg, var(--ado-glass-char-tint) 0%, transparent 40%),
    linear-gradient(145deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.007) 40%, rgba(255,255,255,0.013) 100%),
    var(--ado-glass-bg);
}

/* ── User variant tint ── */
.ado-bubble .ado-message--user {
  background:
    linear-gradient(225deg, var(--ado-glass-user-tint) 0%, transparent 40%),
    linear-gradient(145deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.007) 40%, rgba(255,255,255,0.013) 100%),
    var(--ado-glass-bg);
}

/* System stays compact */
.ado-bubble .ado-message--system {
  border-radius: var(--ado-radius);
  padding: 8px 16px;
  background: var(--ado-fill-subtle, rgba(255,255,255,0.03));
  box-shadow: none;
  border: 1px solid transparent;
}
.ado-bubble .ado-message--system::after { display: none; }

/* ── Content wrapper zone — z-index above avatar bg ──
   NOTE: .ado-message-actions is EXCLUDED — it must keep base
   position: absolute for top-right hover reveal. */
.ado-bubble .ado-message-header,
.ado-bubble .ado-message-content,
.ado-bubble .ado-swipe,
.ado-bubble .ado-reasoning,
.ado-bubble .ado-bookmark {
  position: relative;
  z-index: 1;
}

/* ── Dissolving Avatar Background ─────────────────────────────────── */
.ado-bubble-avatar-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  mask-image:
    linear-gradient(to right, black 0%, black 25%, transparent 90%),
    linear-gradient(to bottom, black 0%, black 55%, transparent 100%),
    linear-gradient(to top, black 0%, black 85%, transparent 100%);
  mask-composite: intersect;
  -webkit-mask-image:
    linear-gradient(to right, black 0%, black 25%, transparent 90%),
    linear-gradient(to bottom, black 0%, black 55%, transparent 100%),
    linear-gradient(to top, black 0%, black 85%, transparent 100%);
  -webkit-mask-composite: source-in;
}

/* User messages: dissolve from right */
.ado-bubble .ado-message--user .ado-bubble-avatar-bg {
  left: auto;
  right: 0;
  mask-image:
    linear-gradient(to left, black 0%, black 25%, transparent 90%),
    linear-gradient(to bottom, black 0%, black 55%, transparent 100%),
    linear-gradient(to top, black 0%, black 85%, transparent 100%);
  -webkit-mask-image:
    linear-gradient(to left, black 0%, black 25%, transparent 90%),
    linear-gradient(to bottom, black 0%, black 55%, transparent 100%),
    linear-gradient(to top, black 0%, black 85%, transparent 100%);
}

.ado-bubble-avatar-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  opacity: 0.38;
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.ado-bubble .ado-message:hover .ado-bubble-avatar-img {
  opacity: 0.44;
}

/* Inner scrim for text readability */
.ado-bubble-avatar-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    var(--ado-page-bg, #0a0a0c) 0%,
    color-mix(in srgb, var(--ado-page-bg, #0a0a0c) 50%, transparent) 60%,
    color-mix(in srgb, var(--ado-page-bg, #0a0a0c) 70%, transparent) 100%
  );
  pointer-events: none;
}

.ado-bubble .ado-message--user .ado-bubble-avatar-scrim {
  background: linear-gradient(
    to left,
    var(--ado-page-bg, #0a0a0c) 0%,
    color-mix(in srgb, var(--ado-page-bg, #0a0a0c) 50%, transparent) 60%,
    color-mix(in srgb, var(--ado-page-bg, #0a0a0c) 70%, transparent) 100%
  );
}

/* ── Bubble Header ─────────────────────────────────────────────────── */
.ado-bubble-header {
  display: flex !important;
  align-items: flex-start !important;
  justify-content: space-between;
  padding: 20px 24px 0 !important;
  gap: 12px;
  margin-bottom: 0 !important;
}

.ado-bubble-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

/* ── Squircle Avatar ───────────────────────────────────────────────── */
.ado-bubble .ado-message-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  flex-shrink: 0;
  background: rgba(255,255,255,0.05);
  box-shadow:
    0 0 0 0.5px rgba(255,255,255,0.08),
    0 2px 8px rgba(0,0,0,0.3);
  border: none;
}

.ado-bubble .ado-message-avatar--placeholder {
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
}

/* ── Name Styling ──────────────────────────────────────────────────── */
.ado-bubble .ado-message-name {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.015em;
  line-height: 1.2;
  color: var(--ado-text, #ffffff);
}

.ado-bubble .ado-message--character .ado-message-name {
  color: var(--ado-text, #ffffff);
}

/* Prevent flex column from stretching inline-flex pill to full width */
.ado-bubble .ado-message-meta {
  align-items: flex-start;
}

/* ── Meta Pill ─────────────────────────────────────────────────────── */
.ado-bubble-meta-pill {
  display: inline-flex;
  align-items: center;
  margin-top: 5px;
  padding: 3px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-family: ui-monospace, 'SF Mono', SFMono-Regular, 'Cascadia Code', Menlo, Consolas, monospace;
  color: var(--ado-text-dim, rgba(255,255,255,0.5));
  letter-spacing: 0.02em;
  flex-wrap: wrap;
  gap: 0;
  background: rgba(0,0,0,0.45);
  border: 1px solid rgba(255,255,255,0.05);
  line-height: 1;
}

.ado-bubble-meta-dot {
  margin: 0 6px;
  opacity: 0.35;
}

/* ── Message Content Padding ───────────────────────────────────────── */
.ado-bubble .ado-message-content {
  padding: 16px 24px 22px !important;
}

.ado-bubble .ado-message--system .ado-message-content {
  padding: 0 4px !important;
}

/* ── Actions — Glassmorphic Utility Bar (top-right on hover) ───────── */
/* The container IS the glassmorphic pill; buttons inside are transparent. */
.ado-bubble .ado-message-actions {
  position: absolute;
  top: 20px;
  right: 24px;
  z-index: 5;
  gap: 1px;
  padding: 2px 3px;
  background: rgba(0,0,0,0.45);
  border-radius: 9px;
  border: 1px solid rgba(255,255,255,0.05);
}

.ado-bubble .ado-message--user .ado-message-actions {
  left: 24px;
  right: auto;
}

.ado-bubble .ado-action-btn {
  width: 26px;
  height: 26px;
  background: transparent;
  border: none;
  border-radius: 6px;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  color: rgba(255,255,255,0.4);
}

.ado-bubble .ado-action-btn:hover {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.7);
  border: none;
}

/* ── Reasoning — Compact Glassmorphic Pill ─────────────────────────── */
/* Outer wrapper is bare — the toggle and body each get their own glass surface */
.ado-bubble .ado-reasoning {
  margin: 14px 24px 0;
  border: none;
  background: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  overflow: visible;
  border-radius: 0;
}

.ado-bubble .ado-reasoning-toggle {
  width: auto;
  display: inline-flex;
  padding: 4px 11px;
  background: rgba(0,0,0,0.45);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  font-family: ui-monospace, 'SF Mono', SFMono-Regular, 'Cascadia Code', Menlo, Consolas, monospace;
  font-size: 11.5px;
  letter-spacing: 0.02em;
  color: var(--ado-text-dim, rgba(255,255,255,0.5));
  line-height: 1;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.ado-bubble .ado-reasoning-toggle:hover {
  background: rgba(0,0,0,0.15);
  border-color: rgba(255,255,255,0.1);
}

.ado-bubble .ado-reasoning-body {
  margin-top: 10px;
  padding: 10px 14px;
  background: rgba(0,0,0,0.45);
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.05);
  border-top: 1px solid rgba(255,255,255,0.05);
  font-family: ui-monospace, 'SF Mono', SFMono-Regular, 'Cascadia Code', Menlo, Consolas, monospace;
  font-size: 12.5px;
  color: var(--ado-text-dim, rgba(255,255,255,0.45));
}

/* ── Swipe Controls — Glassmorphic Footer Pill ─────────────────────── */
/* align-self: flex-end right-aligns within the column flex parent (.ado-message).
   The pill auto-sizes to content width. */
.ado-bubble .ado-swipe {
  align-self: flex-end;
  margin: 0 24px 18px 0;
  padding: 2px 4px;
  gap: 2px;
  border-radius: 16px;
  background: rgba(0,0,0,0.45);
  border: 1px solid rgba(255,255,255,0.05);
  font-family: ui-monospace, 'SF Mono', SFMono-Regular, 'Cascadia Code', Menlo, Consolas, monospace;
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.04em;
}

.ado-bubble .ado-swipe-btn {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: rgba(255,255,255,0.5);
}

.ado-bubble .ado-swipe-btn:hover {
  background: rgba(255,255,255,0.08);
}

.ado-bubble .ado-swipe-btn:disabled {
  color: rgba(255,255,255,0.15);
}

.ado-bubble .ado-swipe-counter {
  min-width: 32px;
  text-align: center;
  user-select: none;
  font-size: inherit;
  color: inherit;
  letter-spacing: inherit;
}

/* ── Bookmark ──────────────────────────────────────────────────────── */
.ado-bubble .ado-bookmark {
  top: 4px;
  right: 20px;
}
.ado-bubble .ado-message--user .ado-bookmark {
  left: 20px;
  right: auto;
}

/* ── User Header Direction ─────────────────────────────────────────── */
.ado-bubble .ado-message--user .ado-bubble-header {
  flex-direction: row-reverse;
}
.ado-bubble .ado-message--user .ado-bubble-header-left {
  flex-direction: row-reverse;
}
.ado-bubble .ado-message--user .ado-message-meta {
  align-items: flex-end;
}
.ado-bubble .ado-message--user .ado-message-content {
  text-align: right;
}

/* ── Responsive ────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .ado-bubble .ado-message {
    border-radius: 14px;
  }

  .ado-bubble-header {
    padding: 16px 16px 0 !important;
  }

  .ado-bubble .ado-message-content {
    padding: 12px 16px 16px !important;
  }

  .ado-bubble .ado-message-avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  .ado-bubble .ado-message-name {
    font-size: 17px;
  }

  .ado-bubble .ado-swipe {
    margin: 0 16px 14px 0;
  }

  .ado-bubble .ado-message-actions {
    top: 16px;
    right: 16px;
  }
  .ado-bubble .ado-message--user .ado-message-actions {
    left: 16px;
  }

  .ado-bubble .ado-reasoning {
    margin: 10px 16px 0;
  }

  .ado-bubble .ado-reasoning {
    margin: 0 16px 0;
  }
}

@media (max-width: 480px) {
  .ado-bubble-header {
    padding: 12px 12px 0 !important;
  }
  .ado-bubble .ado-message-content {
    padding: 10px 12px 14px !important;
  }
  .ado-bubble .ado-message-name {
    font-size: 15px;
  }
  .ado-bubble .ado-reasoning {
    margin: 8px 12px 0;
  }
  .ado-bubble .ado-swipe {
    margin: 0 12px 14px 0;
  }
}

/* ── Reduced Motion for Bubble ─────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .ado-bubble-avatar-img {
    transition: none;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   EDIT MODE
   Inline editing UI — glassmorphic textareas with save/cancel actions
   ═══════════════════════════════════════════════════════════════════════ */

.ado-edit-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px 14px;
  margin: 0;
  position: relative;
  z-index: 2;
}

.ado-edit-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ado-text-dim, rgba(255,255,255,0.45));
  margin: 0 0 2px 2px;
}

.ado-edit-textarea {
  width: 100%;
  min-height: 60px;
  max-height: 45em;
  padding: 10px 12px;
  border-radius: var(--ado-radius-sm, 8px);
  border: 1px solid var(--ado-glass-border, rgba(255,255,255,0.06));
  background: var(--ado-glass-bg, rgba(18,16,28,0.55));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--ado-text, rgba(255,255,255,0.92));
  font-family: inherit;
  font-size: 14px;
  line-height: 1.55;
  resize: none;
  overflow-y: auto;
  outline: none;
  transition: border-color var(--ado-transition-fast, 120ms);
  box-sizing: border-box;
}

.ado-edit-textarea:focus {
  border-color: var(--ado-primary, rgba(100,120,255,0.5));
}

.ado-edit-textarea--reasoning {
  font-family: ui-monospace, 'SF Mono', SFMono-Regular, 'Cascadia Code', Menlo, Consolas, monospace;
  font-size: 12.5px;
  color: var(--ado-text-dim, rgba(255,255,255,0.6));
}

.ado-edit-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.ado-edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 14px;
  border-radius: var(--ado-radius-xs, 5px);
  border: 1px solid var(--ado-glass-border, rgba(255,255,255,0.06));
  background: var(--ado-glass-bg, rgba(18,16,28,0.55));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--ado-text-dim, rgba(255,255,255,0.6));
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--ado-transition-fast, 120ms);
  line-height: 1;
}

.ado-edit-btn:hover {
  border-color: var(--ado-glass-border-hover, rgba(255,255,255,0.1));
  color: var(--ado-text, rgba(255,255,255,0.92));
}

.ado-edit-btn--save {
  background: var(--ado-primary, rgba(100,120,255,0.25));
  border-color: var(--ado-primary, rgba(100,120,255,0.35));
  color: var(--ado-text, rgba(255,255,255,0.92));
}

.ado-edit-btn--save:hover {
  background: var(--ado-primary-hover, rgba(100,120,255,0.35));
  border-color: var(--ado-primary, rgba(100,120,255,0.5));
}

.ado-edit-btn--cancel:hover {
  background: rgba(255,60,60,0.12);
  border-color: rgba(255,60,60,0.25);
  color: var(--ado-danger, rgba(255,100,100,0.9));
}

/* ═══════════════════════════════════════════════════════════════════════
   AVATAR LIGHTBOX
   Full-screen image overlay for character/persona avatars.
   Triggered by clicking avatars in immersive/bubble mode.
   ═══════════════════════════════════════════════════════════════════════ */

.ado-avatar-lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  animation: ado-lightbox-fade-in 200ms ease-out both;
  cursor: pointer;
}

@keyframes ado-lightbox-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ado-avatar-lightbox-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: default;
}

.ado-avatar-lightbox-img {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  touch-action: none;
  transform-origin: center center;
  will-change: transform;
  user-select: none;
  -webkit-user-select: none;
  animation: ado-lightbox-scale-in 250ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes ado-lightbox-scale-in {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.ado-avatar-lightbox-name {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.02em;
}

/* ═══════════════════════════════════════════════════════════════════════
   QUICK REPLY POPOVER
   Glassmorphic QR selector anchored above the input action bar.
   ═══════════════════════════════════════════════════════════════════════ */

.ado-qr-popover {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  width: min(100%, 520px);
  max-height: min(55vh, 400px);
  overflow-y: auto;
  z-index: 30;
  background: var(--ado-bg-deepest, rgb(16, 13, 24));
  border: 1px solid var(--ado-glass-border, rgba(255,255,255,0.06));
  border-radius: var(--ado-radius, 14px);
  box-shadow:
    0 8px 32px rgba(0,0,0,0.35),
    0 0 0 0.5px rgba(255,255,255,0.04) inset;
  padding: 6px;
  animation: ado-tools-enter 180ms cubic-bezier(0.16, 1, 0.3, 1) both;

  /* Thin scrollbar */
  scrollbar-width: thin;
  scrollbar-color: var(--ado-scrollbar-thumb, rgba(255,255,255,0.08)) transparent;
}

.ado-qr-popover::-webkit-scrollbar {
  width: var(--ado-scrollbar-w, 5px);
}
.ado-qr-popover::-webkit-scrollbar-track {
  background: transparent;
}
.ado-qr-popover::-webkit-scrollbar-thumb {
  background: var(--ado-scrollbar-thumb, rgba(255,255,255,0.08));
  border-radius: 4px;
}
.ado-qr-popover::-webkit-scrollbar-thumb:hover {
  background: var(--ado-scrollbar-thumb-hover, rgba(255,255,255,0.15));
}

/* ── Set Group ──────────────────────────────────────────────────────── */

.ado-qr-set-group {
  margin-bottom: 2px;
}

.ado-qr-set-group:last-child {
  margin-bottom: 0;
}

.ado-qr-set-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px 5px;
  border-left: 3px solid var(--ado-primary, rgba(100,120,255,0.5));
  margin: 2px 4px 2px 2px;
}

.ado-qr-set-name {
  font-size: 11.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ado-text-dim, rgba(255,255,255,0.5));
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ado-qr-set-badges {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.ado-qr-badge {
  font-size: 9.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 1px 6px;
  border-radius: 4px;
  line-height: 1.4;
}

.ado-qr-badge--global {
  background: rgba(100,120,255,0.12);
  color: var(--ado-primary, rgba(130,150,255,0.8));
}

.ado-qr-badge--chat {
  background: rgba(100,220,160,0.12);
  color: var(--ado-success, rgba(100,220,160,0.8));
}

/* ── Entry Row ──────────────────────────────────────────────────────── */

.ado-qr-entry {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: var(--ado-radius-sm, 8px);
  cursor: default;
  transition: background var(--ado-transition-fast, 120ms);
}

.ado-qr-entry:hover {
  background: var(--ado-fill-subtle, rgba(255,255,255,0.04));
}

.ado-qr-entry-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  color: var(--ado-text-dim, rgba(255,255,255,0.45));
  font-size: 13px;
}

.ado-qr-entry-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ado-qr-entry-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--ado-text, rgba(255,255,255,0.92));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ado-qr-entry-preview {
  font-size: 11.5px;
  color: var(--ado-text-dim, rgba(255,255,255,0.38));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.ado-qr-entry-send {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border: 1px solid var(--ado-primary, rgba(100,120,255,0.3));
  border-radius: var(--ado-radius-xs, 5px);
  background: var(--ado-primary, rgba(100,120,255,0.1));
  color: var(--ado-text, rgba(255,255,255,0.85));
  cursor: pointer;
  transition: all var(--ado-transition-fast, 120ms);
}

.ado-qr-entry-send:hover {
  background: var(--ado-primary-hover, rgba(100,120,255,0.25));
  border-color: var(--ado-primary, rgba(100,120,255,0.5));
}

.ado-qr-entry-send:disabled {
  opacity: 0.4;
  cursor: default;
}

/* ── Empty State ────────────────────────────────────────────────────── */

.ado-qr-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 16px;
  color: var(--ado-text-dim, rgba(255,255,255,0.35));
  font-size: 13px;
  text-align: center;
}

/* ── Responsive ─────────────────────────────────────────────────────── */

@media (max-width: 480px) {
  .ado-qr-popover {
    width: 100%;
    max-height: min(50vh, 360px);
    padding: 4px;
  }
  .ado-qr-entry {
    padding: 6px 8px;
    gap: 8px;
  }
  .ado-qr-entry-label {
    font-size: 12.5px;
  }
  .ado-qr-entry-preview {
    font-size: 11px;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   AUTHOR'S NOTE SIDE PANEL
   Slides in from left or right within .ado-container.
   ═══════════════════════════════════════════════════════════════════════ */

/* Portal mount element is created in AuthorsNotePortal.jsx with inline styles
   (position:fixed, z-index:1050, etc.) for reliable mobile positioning.
   CSS-class-based fixed positioning breaks on mobile due to ST's
   -webkit-transform:translateZ(0) on <html> creating a containing block. */

.ado-an-panel {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 340px;
  max-width: 85vw;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  background: color-mix(in srgb, var(--ado-page-bg, #0d0b14) 92%, white 8%);
  border: 1px solid var(--ado-glass-border, rgba(255,255,255,0.06));
  box-shadow:
    0 8px 32px rgba(0,0,0,0.35),
    0 0 0 0.5px rgba(255,255,255,0.04) inset;
  transition: transform var(--ado-transition, 220ms cubic-bezier(0.4, 0, 0.2, 1));
  pointer-events: auto;
}

.ado-an-panel--right {
  right: 0;
  border-right: none;
  border-radius: var(--ado-radius, 14px) 0 0 var(--ado-radius, 14px);
  transform: translateX(100%);
}

.ado-an-panel--left {
  left: 0;
  border-left: none;
  border-radius: 0 var(--ado-radius, 14px) var(--ado-radius, 14px) 0;
  transform: translateX(-100%);
}

.ado-an-panel--open {
  transform: translateX(0);
}

/* ── Header ── */
.ado-an-panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 14px 10px;
  border-bottom: 1px solid var(--ado-glass-border, rgba(255,255,255,0.06));
  flex-shrink: 0;
}

.ado-an-title {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ado-text-muted, rgba(230,230,240,0.6));
  text-align: center;
}

.ado-an-header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--ado-radius-xs, 5px);
  border: 1px solid var(--ado-glass-border, rgba(255,255,255,0.06));
  background: transparent;
  color: var(--ado-text-dim, rgba(255,255,255,0.45));
  cursor: pointer;
  transition: all var(--ado-transition-fast, 120ms);
}

.ado-an-header-btn:hover {
  background: var(--ado-fill-subtle, rgba(255,255,255,0.04));
  border-color: var(--ado-glass-border-hover, rgba(255,255,255,0.1));
  color: var(--ado-text, rgba(255,255,255,0.92));
}

/* ── Body ── */
.ado-an-panel-body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  scrollbar-width: thin;
  scrollbar-color: var(--ado-scrollbar-thumb, rgba(255,255,255,0.08)) transparent;
}

.ado-an-panel-body::-webkit-scrollbar {
  width: var(--ado-scrollbar-w, 5px);
}
.ado-an-panel-body::-webkit-scrollbar-track {
  background: transparent;
}
.ado-an-panel-body::-webkit-scrollbar-thumb {
  background: var(--ado-scrollbar-thumb, rgba(255,255,255,0.08));
  border-radius: 4px;
}

/* ── Field group ── */
.ado-an-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ── Label ── */
.ado-an-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ado-text-dim, rgba(255,255,255,0.45));
}

/* ── Textarea ── */
.ado-an-textarea {
  width: 100%;
  min-height: 100px;
  padding: 10px 12px;
  border-radius: var(--ado-radius-sm, 8px);
  border: 1px solid var(--ado-glass-border, rgba(255,255,255,0.06));
  background: var(--ado-glass-bg, rgba(18,16,28,0.55));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--ado-text, rgba(255,255,255,0.92));
  font-family: inherit;
  font-size: 13.5px;
  line-height: 1.55;
  resize: vertical;
  outline: none;
  transition: border-color var(--ado-transition-fast, 120ms);
  box-sizing: border-box;
}

.ado-an-textarea:focus {
  border-color: var(--ado-primary, rgba(100,120,255,0.5));
}

.ado-an-textarea::placeholder {
  color: var(--ado-text-dim, rgba(255,255,255,0.25));
}

/* ── Token count ── */
.ado-an-token-count {
  font-size: 11px;
  color: var(--ado-text-dim, rgba(255,255,255,0.35));
  text-align: right;
  min-height: 15px;
  font-variant-numeric: tabular-nums;
}

/* ── Input (number) ── */
.ado-an-input {
  width: 100%;
  padding: 7px 10px;
  border-radius: var(--ado-radius-xs, 5px);
  border: 1px solid var(--ado-glass-border, rgba(255,255,255,0.06));
  background: var(--ado-glass-bg, rgba(18,16,28,0.55));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--ado-text, rgba(255,255,255,0.92));
  font-family: inherit;
  font-size: 13px;
  outline: none;
  transition: border-color var(--ado-transition-fast, 120ms);
  box-sizing: border-box;
  -moz-appearance: textfield;
}

.ado-an-input::-webkit-inner-spin-button,
.ado-an-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.ado-an-input:focus {
  border-color: var(--ado-primary, rgba(100,120,255,0.5));
}

/* ── Select ── */
.ado-an-select {
  width: 100%;
  padding: 7px 10px;
  border-radius: var(--ado-radius-xs, 5px);
  border: 1px solid var(--ado-glass-border, rgba(255,255,255,0.06));
  background: var(--ado-glass-bg, rgba(18,16,28,0.55));
  color: var(--ado-text, rgba(255,255,255,0.92));
  font-family: inherit;
  font-size: 13px;
  outline: none;
  cursor: pointer;
  transition: border-color var(--ado-transition-fast, 120ms);
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 28px;
}

.ado-an-select option {
  background: #1a1825;
  color: rgba(255,255,255,0.92);
}

.ado-an-select:focus {
  border-color: var(--ado-primary, rgba(100,120,255,0.5));
}

/* ── Radio group ── */
.ado-an-radio-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ado-an-radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--ado-text, rgba(255,255,255,0.85));
  cursor: pointer;
  padding: 4px 0;
}

.ado-an-radio {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 1.5px solid var(--ado-text-dim, rgba(255,255,255,0.3));
  background: transparent;
  flex-shrink: 0;
  cursor: pointer;
  transition: all var(--ado-transition-fast, 120ms);
  position: relative;
}

.ado-an-radio:checked {
  border-color: var(--ado-primary, rgba(100,120,255,0.8));
}

.ado-an-radio:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ado-primary, rgba(100,120,255,0.9));
}

.ado-an-radio:focus-visible {
  outline: 2px solid var(--ado-primary, rgba(100,120,255,0.5));
  outline-offset: 2px;
}

/* ── Helper text ── */
.ado-an-helper {
  font-size: 11px;
  font-style: italic;
  color: var(--ado-text-dim, rgba(255,255,255,0.3));
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .ado-an-panel {
    width: 100%;
    max-width: 100%;
    border-radius: 0;
  }
}

/* ── Author's Note Modal (mobile) ── */
.ado-an-modal-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
}

.ado-an-modal-content .ado-an-panel-header {
  flex-shrink: 0;
}

.ado-an-modal-content .ado-an-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* ═══════════════════════════════════════════════════════════════════════
   GREETINGS INDICATOR & MODAL
   Pill-shaped trigger with prismatic hover glow. Modal cards use layered
   translucent glass with accent-lit left border on the active greeting.
   ═══════════════════════════════════════════════════════════════════════ */

.ado-greetings-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border: 1px solid var(--ado-glass-border, rgba(255,255,255,0.06));
  border-radius: 20px;
  background: var(--ado-fill-subtle, rgba(255,255,255,0.04));
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: var(--ado-text-muted, rgba(230,230,240,0.6));
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
  transition:
    color var(--ado-transition),
    background var(--ado-transition),
    border-color var(--ado-transition),
    box-shadow var(--ado-transition);
}

.ado-greetings-indicator:hover {
  color: var(--ado-primary-text, rgba(160, 150, 255, 0.95));
  background: var(--ado-primary-008, rgba(140, 130, 255, 0.08));
  border-color: var(--ado-primary-025, rgba(140, 130, 255, 0.25));
  box-shadow: 0 0 12px var(--ado-primary-010, rgba(140, 130, 255, 0.1));
}

.ado-greetings-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--ado-primary-015, rgba(140, 130, 255, 0.15));
  color: var(--ado-primary-text, rgba(160, 150, 255, 0.95));
  font-size: 10px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

/* ── Greetings Modal ── */
.ado-greetings-modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px 24px;
  max-height: 70vh;
}

.ado-greetings-header {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--ado-text, rgba(230,230,240,0.92));
  padding-bottom: 4px;
  border-bottom: 1px solid var(--ado-border, rgba(255,255,255,0.06));
}
.ado-greetings-header h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.01em;
}
.ado-greetings-count {
  margin-left: auto;
  font-size: 11.5px;
  color: var(--ado-text-dim, rgba(230,230,240,0.35));
  font-variant-numeric: tabular-nums;
  padding: 2px 8px;
  border-radius: 8px;
  background: var(--ado-fill-subtle, rgba(255,255,255,0.04));
}

.ado-greetings-empty {
  text-align: center;
  color: var(--ado-text-muted, rgba(230,230,240,0.5));
  padding: 32px 24px;
  font-size: 14px;
}

.ado-greetings-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  max-height: 55vh;
  padding-right: 4px;
  scrollbar-width: thin;
  scrollbar-color: var(--ado-scrollbar-thumb, rgba(255,255,255,0.08)) transparent;
}
.ado-greetings-list::-webkit-scrollbar { width: 4px; }
.ado-greetings-list::-webkit-scrollbar-track { background: transparent; }
.ado-greetings-list::-webkit-scrollbar-thumb {
  background: var(--ado-scrollbar-thumb, rgba(255,255,255,0.08));
  border-radius: 4px;
}

.ado-greeting-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 13px 16px 13px 18px;
  border-radius: var(--ado-radius-sm, 8px);
  border: 1px solid var(--ado-glass-border, rgba(255,255,255,0.06));
  background: var(--ado-fill-subtle, rgba(255,255,255,0.03));
  cursor: pointer;
  text-align: left;
  color: inherit;
  font: inherit;
  transition:
    background var(--ado-transition),
    border-color var(--ado-transition),
    box-shadow var(--ado-transition),
    transform var(--ado-transition);
}

/* Left accent bar — mirrors message card pattern */
.ado-greeting-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 2px;
  background: var(--ado-fill, rgba(255,255,255,0.06));
  transition: background var(--ado-transition), box-shadow var(--ado-transition);
}

.ado-greeting-card:hover {
  background: var(--ado-fill, rgba(255,255,255,0.06));
  border-color: var(--ado-glass-border-hover, rgba(255,255,255,0.1));
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  transform: translateX(2px);
}
.ado-greeting-card:hover::before {
  background: var(--ado-text-dim, rgba(230,230,240,0.3));
}

.ado-greeting-card:active {
  transform: translateX(2px) scale(0.995);
}

/* Active greeting — accent-lit border and glow */
.ado-greeting-card--active {
  border-color: var(--ado-primary-040, rgba(140, 130, 255, 0.4));
  background:
    linear-gradient(135deg, var(--ado-primary-005, rgba(140,130,255,0.05)) 0%, transparent 50%),
    var(--ado-primary-008, rgba(140, 130, 255, 0.08));
  box-shadow:
    0 0 0 0.5px var(--ado-primary-025, rgba(140, 130, 255, 0.25)),
    inset 0 0.5px 0 rgba(255,255,255,0.04);
}
.ado-greeting-card--active::before {
  background: linear-gradient(
    180deg,
    var(--ado-primary, rgba(140, 130, 255, 0.9)) 0%,
    var(--ado-primary-060, rgba(140, 130, 255, 0.6)) 100%
  );
  box-shadow: 0 0 8px var(--ado-primary-025, rgba(140, 130, 255, 0.25));
}
.ado-greeting-card--active:hover {
  border-color: var(--ado-primary-060, rgba(140, 130, 255, 0.6));
}
.ado-greeting-card--active:hover::before {
  box-shadow: 0 0 12px var(--ado-primary-040, rgba(140, 130, 255, 0.4));
}

.ado-greeting-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ado-greeting-label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ado-text, rgba(230,230,240,0.92));
  letter-spacing: 0.01em;
}

.ado-greeting-active-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 9px;
  border-radius: 10px;
  background: var(--ado-primary-015, rgba(140, 130, 255, 0.15));
  color: var(--ado-primary-text, rgba(160, 150, 255, 0.95));
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.ado-greeting-preview {
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--ado-text-dim, rgba(230,230,240,0.42));
  margin: 2px 0 0;
  font-style: italic;
  word-break: break-word;
}

/* Staggered card entrance */
.ado-greeting-card {
  animation: ado-greeting-enter 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
.ado-greeting-card:nth-child(1) { animation-delay: 0ms; }
.ado-greeting-card:nth-child(2) { animation-delay: 40ms; }
.ado-greeting-card:nth-child(3) { animation-delay: 80ms; }
.ado-greeting-card:nth-child(4) { animation-delay: 120ms; }
.ado-greeting-card:nth-child(5) { animation-delay: 160ms; }
.ado-greeting-card:nth-child(n+6) { animation-delay: 200ms; }

@keyframes ado-greeting-enter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ═══════════════════════════════════════════════════════════════════════
   SIDE PORTRAIT LAYOUT
   Container becomes flex-row when side portrait is active.
   ═══════════════════════════════════════════════════════════════════════ */

.ado-container.ado-side-portrait-active {
  flex-direction: row;
}

.ado-main-column {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  height: 100%;
  position: relative;
}

/* When portrait is on the left (portrait comes first in DOM),
   main column needs right margin to match the container edge spacing */
.ado-side-portrait + .ado-main-column {
  margin: 8px 8px 8px 0;
}

/* When portrait is on the right (main column is first child),
   main column needs left margin for symmetry */
.ado-side-portrait-active > .ado-main-column:first-child {
  margin: 8px 0 8px 8px;
}

/* ═══════════════════════════════════════════════════════════════════════
   SIDE PORTRAIT PANEL
   Frosted crystalline sidebar — the avatar frame uses a double-border
   technique (inner inset glow + outer border) for depth. A subtle
   radial gradient behind the frame creates a soft ambient backlight.
   ═══════════════════════════════════════════════════════════════════════ */

.ado-side-portrait {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 220px;
  min-width: 220px;
  padding: 18px 12px 14px;
  overflow-y: auto;
  overflow-x: hidden;
  background:
    linear-gradient(180deg, var(--ado-glass-char-tint, rgba(100,120,255,0.03)) 0%, transparent 40%),
    var(--ado-glass-bg, rgba(18, 16, 28, 0.55));
  backdrop-filter: blur(var(--ado-glass-blur, 14px));
  -webkit-backdrop-filter: blur(var(--ado-glass-blur, 14px));
  border: 1px solid var(--ado-glass-border, rgba(255,255,255,0.06));
  border-radius: var(--ado-radius, 14px);
  margin: 8px 0 8px 8px;
  box-shadow:
    inset 0 0.5px 0 rgba(255,255,255,0.06),
    0 4px 24px rgba(0,0,0,0.08);
  scrollbar-width: thin;
  scrollbar-color: var(--ado-scrollbar-thumb, rgba(255,255,255,0.08)) transparent;
  animation: ado-portrait-enter 350ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes ado-portrait-enter {
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Right-side portrait enters from the right */
.ado-side-portrait-active .ado-main-column + .ado-side-portrait {
  margin: 8px 8px 8px 0;
  animation-name: ado-portrait-enter-right;
}

@keyframes ado-portrait-enter-right {
  from { opacity: 0; transform: translateX(12px); }
  to { opacity: 1; transform: translateX(0); }
}

.ado-side-portrait::-webkit-scrollbar { width: var(--ado-scrollbar-w, 5px); }
.ado-side-portrait::-webkit-scrollbar-track { background: transparent; }
.ado-side-portrait::-webkit-scrollbar-thumb {
  background: var(--ado-scrollbar-thumb, rgba(255,255,255,0.08));
  border-radius: 10px;
}

.ado-side-portrait-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 20px;
}

/* ── Avatar frame — double-border glass with ambient backlight ── */
.ado-side-portrait-frame {
  position: relative;
  width: 186px;
  max-height: 380px;
  border-radius: var(--ado-radius, 14px);
  overflow: hidden;
  cursor: pointer;
  border: 1.5px solid var(--ado-glass-border, rgba(255,255,255,0.06));
  box-shadow:
    0 6px 28px rgba(0,0,0,0.18),
    0 0 0 1px rgba(255,255,255,0.03),
    inset 0 0.5px 0 rgba(255,255,255,0.08);
  transition:
    border-color var(--ado-transition),
    box-shadow var(--ado-transition),
    transform var(--ado-transition);
  flex-shrink: 0;
}

/* Ambient backlight glow behind the frame */
.ado-side-portrait-frame::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: radial-gradient(
    ellipse at 50% 100%,
    var(--ado-primary-010, rgba(140, 130, 255, 0.1)) 0%,
    transparent 70%
  );
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--ado-transition);
  z-index: 1;
}

.ado-side-portrait-frame:hover {
  border-color: var(--ado-primary-040, rgba(140, 130, 255, 0.4));
  box-shadow:
    0 8px 32px rgba(0,0,0,0.22),
    0 0 20px var(--ado-primary-010, rgba(140, 130, 255, 0.1)),
    0 0 0 1px var(--ado-primary-015, rgba(140, 130, 255, 0.15)),
    inset 0 0.5px 0 rgba(255,255,255,0.1);
  transform: scale(1.015);
}
.ado-side-portrait-frame:hover::after {
  opacity: 1;
}

.ado-side-portrait-img {
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
  transition: transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
}
.ado-side-portrait-frame:hover .ado-side-portrait-img {
  transform: scale(1.03);
}

.ado-side-portrait-placeholder {
  width: 186px;
  height: 186px;
  border-radius: var(--ado-radius, 14px);
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 50% 60%, var(--ado-fill, rgba(255,255,255,0.06)) 0%, transparent 70%),
    var(--ado-fill-subtle, rgba(255,255,255,0.03));
  color: var(--ado-text-dim, rgba(230,230,240,0.2));
  font-size: 48px;
  font-weight: 600;
}

.ado-side-portrait-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--ado-primary-text, rgba(160, 150, 255, 0.95));
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.01em;
  text-shadow: 0 1px 6px var(--ado-primary-010, rgba(140,130,255,0.1));
}

.ado-side-portrait-gallery-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border: 1px solid var(--ado-glass-border, rgba(255,255,255,0.06));
  border-radius: 20px;
  background: var(--ado-fill-subtle, rgba(255,255,255,0.04));
  color: var(--ado-text-muted, rgba(230,230,240,0.55));
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition:
    color var(--ado-transition),
    background var(--ado-transition),
    border-color var(--ado-transition),
    box-shadow var(--ado-transition);
}

.ado-side-portrait-gallery-btn:hover {
  color: var(--ado-text, rgba(230,230,240,0.92));
  background: var(--ado-fill, rgba(255,255,255,0.06));
  border-color: var(--ado-glass-border-hover, rgba(255,255,255,0.1));
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}
.ado-side-portrait-gallery-btn:active {
  transform: scale(0.97);
}

/* ═══════════════════════════════════════════════════════════════════════
   GALLERY MOSAIC
   Staggered reveal grid with glass-frosted thumbnails. Each cell
   has a subtle border-glow on hover that matches the primary accent.
   ═══════════════════════════════════════════════════════════════════════ */

.ado-gallery-mosaic {
  width: 100%;
  padding-top: 6px;
  animation: ado-gallery-reveal 300ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes ado-gallery-reveal {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.ado-gallery-mosaic--loading,
.ado-gallery-mosaic--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 8px;
  color: var(--ado-text-dim, rgba(230,230,240,0.3));
  font-size: 12px;
}

.ado-gallery-spinner {
  animation: ado-spin 0.9s linear infinite;
  color: var(--ado-primary-060, rgba(140, 130, 255, 0.6));
}

@keyframes ado-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ado-gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
}

.ado-gallery-thumb {
  aspect-ratio: 1;
  position: relative;
  border: 1px solid var(--ado-glass-border, rgba(255,255,255,0.06));
  border-radius: var(--ado-radius-xs, 5px);
  overflow: hidden;
  cursor: pointer;
  background: var(--ado-fill-subtle, rgba(255,255,255,0.03));
  padding: 0;
  transition:
    border-color var(--ado-transition),
    transform 280ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow var(--ado-transition);
  /* Stagger reveal per cell */
  animation: ado-thumb-enter 250ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
.ado-gallery-thumb:nth-child(1) { animation-delay: 0ms; }
.ado-gallery-thumb:nth-child(2) { animation-delay: 30ms; }
.ado-gallery-thumb:nth-child(3) { animation-delay: 60ms; }
.ado-gallery-thumb:nth-child(4) { animation-delay: 90ms; }
.ado-gallery-thumb:nth-child(5) { animation-delay: 120ms; }
.ado-gallery-thumb:nth-child(6) { animation-delay: 150ms; }
.ado-gallery-thumb:nth-child(n+7) { animation-delay: 180ms; }

@keyframes ado-thumb-enter {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

.ado-gallery-thumb:hover {
  border-color: var(--ado-primary-040, rgba(140, 130, 255, 0.4));
  transform: scale(1.06);
  box-shadow:
    0 4px 14px rgba(0,0,0,0.25),
    0 0 8px var(--ado-primary-010, rgba(140, 130, 255, 0.1));
  z-index: 1;
}

.ado-gallery-thumb:active {
  transform: scale(0.98);
}

.ado-gallery-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
}
.ado-gallery-thumb:hover .ado-gallery-thumb-img {
  transform: scale(1.06);
}

/* ═══════════════════════════════════════════════════════════════════════
   LIGHTBOX NAVIGATION (Gallery Mode)
   Glassmorphic circular nav buttons with inset highlights. Nav buttons
   use a frosted pill with luminous hover states and smooth transitions.
   Counter gets a glass pill treatment below the image.
   ═══════════════════════════════════════════════════════════════════════ */

.ado-avatar-lightbox-content {
  position: relative;
}

.ado-lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(8, 6, 16, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  padding: 0;
  box-shadow:
    0 4px 16px rgba(0,0,0,0.3),
    inset 0 0.5px 0 rgba(255,255,255,0.1);
  transition:
    background 200ms ease,
    border-color 200ms ease,
    box-shadow 200ms ease,
    color 200ms ease,
    opacity 200ms ease,
    transform 200ms ease;
}

.ado-lightbox-nav:hover {
  background: rgba(8, 6, 16, 0.7);
  border-color: rgba(255,255,255,0.2);
  color: #fff;
  box-shadow:
    0 6px 20px rgba(0,0,0,0.4),
    0 0 12px var(--ado-primary-010, rgba(140, 130, 255, 0.1)),
    inset 0 0.5px 0 rgba(255,255,255,0.12);
  transform: translateY(-50%) scale(1.06);
}

.ado-lightbox-nav:active {
  transform: translateY(-50%) scale(0.94);
}

.ado-lightbox-nav:disabled {
  opacity: 0.2;
  cursor: default;
  transform: translateY(-50%);
}
.ado-lightbox-nav:disabled:hover {
  transform: translateY(-50%);
  background: rgba(8, 6, 16, 0.5);
  border-color: rgba(255,255,255,0.12);
  box-shadow: 0 4px 16px rgba(0,0,0,0.3), inset 0 0.5px 0 rgba(255,255,255,0.1);
}

.ado-lightbox-nav--prev {
  left: -58px;
}

.ado-lightbox-nav--next {
  right: -58px;
}

/* Glass pill counter */
.ado-lightbox-counter {
  display: inline-block;
  text-align: center;
  font-size: 12.5px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.08em;
  padding: 3px 14px;
  border-radius: 12px;
  background: rgba(8, 6, 16, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.08);
}

/* ═══════════════════════════════════════════════════════════════════════
   SIDE PORTRAIT RESPONSIVE
   ═══════════════════════════════════════════════════════════════════════ */

@media (max-width: 600px) {
  .ado-side-portrait {
    display: none !important;
  }
  .ado-container.ado-side-portrait-active {
    flex-direction: column;
  }
}

@media (min-width: 601px) and (max-width: 900px) {
  .ado-side-portrait {
    width: 164px;
    min-width: 164px;
    padding: 14px 8px 10px;
  }
  .ado-side-portrait-frame {
    width: 144px;
    max-height: 300px;
  }
  .ado-side-portrait-placeholder {
    width: 144px;
    height: 144px;
    font-size: 36px;
  }
  .ado-gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .ado-side-portrait-gallery-btn {
    font-size: 11px;
    padding: 5px 12px;
  }
}

/* Lightbox nav responsive — move arrows inside on narrow screens */
@media (max-width: 900px) {
  .ado-lightbox-nav--prev { left: 12px; }
  .ado-lightbox-nav--next { right: 12px; }
}

/* ═══════════════════════════════════════════════════════════════════════
   PERSONA POPOVER
   Glass popover for switching the active user persona.
   ═══════════════════════════════════════════════════════════════════════ */

.ado-persona-popover {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 14px;
  width: min(340px, calc(100% - 28px));
  max-height: 320px;
  overflow-y: auto;
  padding: 5px;
  background: var(--ado-bg-deepest, rgb(16, 13, 24));
  border: 1px solid var(--ado-glass-border-hover, rgba(255,255,255,0.1));
  border-radius: var(--ado-radius, 14px);
  box-shadow:
    0 8px 32px rgba(0,0,0,0.3),
    0 0 0 1px var(--ado-border, rgba(255,255,255,0.06));
  z-index: 30;
  animation: ado-tools-enter 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.ado-persona-popover::-webkit-scrollbar { width: var(--ado-scrollbar-w, 5px); }
.ado-persona-popover::-webkit-scrollbar-track { background: transparent; }
.ado-persona-popover::-webkit-scrollbar-thumb {
  background: var(--ado-scrollbar-thumb, rgba(255,255,255,0.08));
  border-radius: 4px;
}

.ado-persona-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 12px;
  color: var(--ado-text-muted, rgba(230,230,240,0.45));
  font-size: 13px;
}

.ado-persona-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ado-persona-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  transition: background var(--ado-transition), border-color var(--ado-transition);
  text-align: left;
  width: 100%;
  color: inherit;
  font: inherit;
}
.ado-persona-item:hover {
  background: var(--ado-fill-subtle, rgba(255,255,255,0.04));
}
.ado-persona-item.ado-persona-active {
  border-color: var(--ado-primary-040, rgba(140,130,255,0.4));
  background: var(--ado-primary-015, rgba(140,130,255,0.15));
}
.ado-persona-item.ado-persona-active .ado-persona-name {
  color: var(--ado-primary-text, rgba(160,150,255,0.95));
}
.ado-persona-item.ado-persona-active .ado-persona-avatar {
  box-shadow: 0 0 0 2px var(--ado-primary-060, rgba(140,130,255,0.6));
}

.ado-persona-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--ado-fill-subtle, rgba(255,255,255,0.04));
}

.ado-persona-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}

.ado-persona-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ado-text, rgba(230,230,240,0.92));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ado-persona-title {
  font-size: 11px;
  color: var(--ado-text-muted, rgba(230,230,240,0.45));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ado-persona-check {
  flex-shrink: 0;
  font-size: 13px;
  color: var(--ado-primary-text, rgba(160,150,255,0.95));
}

/* ═══════════════════════════════════════════════════════════════════════
   FORCE REPLY POPOVER
   Glass popover for selecting a group member to speak next.
   ═══════════════════════════════════════════════════════════════════════ */

.ado-force-reply-popover {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 14px;
  width: min(300px, calc(100% - 28px));
  max-height: 320px;
  overflow-y: auto;
  padding: 5px;
  background: var(--ado-bg-deepest, rgb(16, 13, 24));
  border: 1px solid var(--ado-glass-border-hover, rgba(255,255,255,0.1));
  border-radius: var(--ado-radius, 14px);
  box-shadow:
    0 8px 32px rgba(0,0,0,0.3),
    0 0 0 1px var(--ado-border, rgba(255,255,255,0.06));
  z-index: 30;
  animation: ado-tools-enter 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.ado-force-reply-popover::-webkit-scrollbar { width: var(--ado-scrollbar-w, 5px); }
.ado-force-reply-popover::-webkit-scrollbar-track { background: transparent; }
.ado-force-reply-popover::-webkit-scrollbar-thumb {
  background: var(--ado-scrollbar-thumb, rgba(255,255,255,0.08));
  border-radius: 4px;
}

.ado-force-reply-header {
  padding: 6px 10px 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ado-text-muted, rgba(230,230,240,0.45));
}

.ado-force-reply-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ado-force-reply-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: none;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  transition: background var(--ado-transition);
  text-align: left;
  width: 100%;
  color: inherit;
  font: inherit;
}
.ado-force-reply-item:hover {
  background: var(--ado-fill-subtle, rgba(255,255,255,0.04));
}
.ado-force-reply-item--disabled {
  opacity: 0.35;
  pointer-events: none;
}

.ado-force-reply-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--ado-fill-subtle, rgba(255,255,255,0.04));
}

.ado-force-reply-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--ado-text, rgba(230,230,240,0.92));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ado-force-reply-disabled-label {
  margin-left: auto;
  font-size: 10px;
  color: var(--ado-text-muted, rgba(230,230,240,0.35));
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

/* ═══════════════════════════════════════════════════════════════════════
   GUIDED GENERATIONS
   Popover, pills, modal, and badges for guided generation prompts.
   ═══════════════════════════════════════════════════════════════════════ */

.ado-guide-popover {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 14px;
  width: min(380px, calc(100% - 28px));
  max-height: 380px;
  overflow-y: auto;
  padding: 5px;
  background: var(--ado-bg-deepest, rgb(16, 13, 24));
  border: 1px solid var(--ado-glass-border-hover, rgba(255,255,255,0.1));
  border-radius: var(--ado-radius, 14px);
  box-shadow:
    0 8px 32px rgba(0,0,0,0.3),
    0 0 0 1px var(--ado-border, rgba(255,255,255,0.06));
  z-index: 30;
  animation: ado-tools-enter 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.ado-guide-popover::-webkit-scrollbar { width: var(--ado-scrollbar-w, 5px); }
.ado-guide-popover::-webkit-scrollbar-track { background: transparent; }
.ado-guide-popover::-webkit-scrollbar-thumb {
  background: var(--ado-scrollbar-thumb, rgba(255,255,255,0.08));
  border-radius: 4px;
}

.ado-guide-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  color: var(--ado-text-muted, rgba(230,230,240,0.45));
  font-size: 13px;
}

.ado-guide-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ado-guide-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  transition: background var(--ado-transition);
}
.ado-guide-item:hover {
  background: var(--ado-fill-subtle, rgba(255,255,255,0.04));
}

.ado-guide-item-color {
  width: 4px;
  height: 28px;
  border-radius: 2px;
  flex-shrink: 0;
}

.ado-guide-item-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}

.ado-guide-item-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ado-text, rgba(230,230,240,0.92));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ado-guide-item-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ado-guide-mode-badge {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--ado-fill-subtle, rgba(255,255,255,0.04));
  color: var(--ado-text-muted, rgba(230,230,240,0.45));
}
.ado-guide-mode-badge--persistent {
  color: var(--ado-primary-text, rgba(160,150,255,0.95));
  background: var(--ado-primary-008, rgba(140,130,255,0.08));
}

.ado-guide-position-badge {
  font-size: 10px;
  color: var(--ado-text-muted, rgba(230,230,240,0.35));
}

.ado-guide-item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.ado-guide-toggle,
.ado-guide-fire-btn,
.ado-guide-edit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--ado-text-muted, rgba(230,230,240,0.45));
  cursor: pointer;
  transition: background var(--ado-transition), color var(--ado-transition);
}
.ado-guide-toggle:hover,
.ado-guide-fire-btn:hover,
.ado-guide-edit-btn:hover {
  background: var(--ado-fill-subtle, rgba(255,255,255,0.06));
  color: var(--ado-text, rgba(230,230,240,0.92));
}

.ado-guide-toggle--active {
  color: var(--ado-primary-text, rgba(160,150,255,0.95));
}

.ado-guide-new-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  margin-top: 4px;
  border: 1px dashed var(--ado-border, rgba(255,255,255,0.08));
  border-radius: 10px;
  background: transparent;
  color: var(--ado-text-muted, rgba(230,230,240,0.45));
  font-size: 12px;
  cursor: pointer;
  width: 100%;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.ado-guide-new-btn:hover {
  background: var(--ado-fill-subtle, rgba(255,255,255,0.04));
  color: var(--ado-text, rgba(230,230,240,0.92));
  border-color: var(--ado-border-hover, rgba(255,255,255,0.12));
}

/* Active guide pills shown above the input */
.ado-guide-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 0 4px 4px;
}

.ado-guide-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  background: var(--ado-primary-008, rgba(140,130,255,0.08));
  color: var(--ado-primary-text, rgba(160,150,255,0.95));
  border: 1px solid var(--ado-primary-020, rgba(140,130,255,0.2));
}

.ado-guide-pill-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.ado-guide-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 14px;
  height: 14px;
  border-radius: 7px;
  background: var(--ado-primary, rgba(140,130,255,0.9));
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  line-height: 1;
}

/* Guided gen modal form — renders inside ModalContainer, uses standard lumiverse vars */
.ado-guide-modal-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px;
}

.ado-guide-modal-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ado-guide-modal-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--ado-text-muted, rgba(230,230,240,0.55));
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.ado-guide-modal-input {
  padding: 8px 12px;
  border: 1px solid var(--ado-border, rgba(255,255,255,0.08));
  border-radius: 10px;
  background: var(--ado-fill-subtle, rgba(255,255,255,0.03));
  color: var(--ado-text, rgba(230,230,240,0.92));
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s ease;
}
.ado-guide-modal-input:focus {
  border-color: var(--ado-primary-040, rgba(140,130,255,0.4));
}

.ado-guide-modal-textarea {
  min-height: 120px;
  resize: vertical;
}

.ado-guide-modal-hint {
  font-size: 11px;
  color: var(--ado-text-muted, rgba(230,230,240,0.35));
}

.ado-guide-modal-row {
  display: flex;
  gap: 12px;
}

.ado-guide-modal-select {
  padding: 8px 12px;
  border: 1px solid var(--ado-border, rgba(255,255,255,0.08));
  border-radius: 10px;
  background: var(--ado-fill-subtle, rgba(255,255,255,0.03));
  color: var(--ado-text, rgba(230,230,240,0.92));
  font-size: 13px;
  font-family: inherit;
  outline: none;
  cursor: pointer;
}
.ado-guide-modal-select option {
  background: var(--ado-bg, #1a1828);
  color: var(--ado-text, rgba(230,230,240,0.92));
}

.ado-guide-modal-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--ado-text, rgba(230,230,240,0.92));
}

.ado-guide-modal-toggle-track {
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: var(--ado-fill, rgba(255,255,255,0.08));
  position: relative;
  transition: background 0.15s ease;
  flex-shrink: 0;
}
.ado-guide-modal-toggle-track--active {
  background: var(--ado-primary-040, rgba(140,130,255,0.4));
}
.ado-guide-modal-toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--ado-text, rgba(230,230,240,0.92));
  transition: transform 0.15s ease;
}
.ado-guide-modal-toggle-track--active .ado-guide-modal-toggle-thumb {
  transform: translateX(16px);
}

.ado-guide-modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid var(--ado-border, rgba(255,255,255,0.06));
}

.ado-guide-modal-btn {
  padding: 8px 20px;
  border: 1px solid var(--ado-border, rgba(255,255,255,0.08));
  border-radius: 10px;
  background: var(--ado-fill-subtle, rgba(255,255,255,0.04));
  color: var(--ado-text, rgba(230,230,240,0.92));
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.ado-guide-modal-btn:hover {
  background: var(--ado-fill, rgba(255,255,255,0.06));
  border-color: var(--ado-border-hover, rgba(255,255,255,0.12));
}
.ado-guide-modal-btn--primary {
  background: var(--ado-primary-020, rgba(140,130,255,0.2));
  border-color: var(--ado-primary-040, rgba(140,130,255,0.4));
  color: var(--ado-primary-text, rgba(160,150,255,0.95));
}
.ado-guide-modal-btn--primary:hover {
  background: var(--ado-primary-030, rgba(140,130,255,0.3));
}
.ado-guide-modal-btn--danger {
  color: var(--ado-danger, rgba(255,100,100,0.9));
  border-color: rgba(255,100,100,0.2);
}
.ado-guide-modal-btn--danger:hover {
  background: rgba(255,100,100,0.08);
  border-color: rgba(255,100,100,0.3);
}

/* ═══════════════════════════════════════════════════════════════════════
   SIDE PORTRAIT GROUP NAVIGATION
   Navigation arrows and member dots for group chat portrait panel.
   ═══════════════════════════════════════════════════════════════════════ */

.ado-portrait-member-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px 4px;
}

.ado-portrait-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px solid var(--ado-glass-border, rgba(255,255,255,0.06));
  border-radius: 50%;
  background: var(--ado-fill-subtle, rgba(255,255,255,0.03));
  color: var(--ado-text-muted, rgba(230,230,240,0.45));
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--ado-transition), color var(--ado-transition), border-color var(--ado-transition);
}
.ado-portrait-nav-btn:hover {
  background: var(--ado-fill, rgba(255,255,255,0.06));
  color: var(--ado-text, rgba(230,230,240,0.92));
  border-color: var(--ado-glass-border-hover, rgba(255,255,255,0.1));
}

.ado-portrait-member-dots {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
  flex: 1;
}

.ado-portrait-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ado-fill, rgba(255,255,255,0.12));
  transition: background var(--ado-transition), transform var(--ado-transition);
  cursor: pointer;
}
.ado-portrait-dot:hover {
  background: var(--ado-fill-deep, rgba(255,255,255,0.2));
}
.ado-portrait-dot--active {
  background: var(--ado-primary, rgba(140,130,255,0.8));
  transform: scale(1.3);
}

.ado-portrait-auto-follow {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border: 1px solid var(--ado-glass-border, rgba(255,255,255,0.06));
  border-radius: 12px;
  background: transparent;
  color: var(--ado-text-muted, rgba(230,230,240,0.45));
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--ado-transition), color var(--ado-transition), border-color var(--ado-transition);
}
.ado-portrait-auto-follow:hover {
  background: var(--ado-fill-subtle, rgba(255,255,255,0.04));
}
.ado-portrait-auto-follow--active {
  color: var(--ado-primary-text, rgba(160,150,255,0.95));
  border-color: var(--ado-primary-020, rgba(140,130,255,0.2));
  background: var(--ado-primary-008, rgba(140,130,255,0.08));
}

/* ═══════════════════════════════════════════════════════════════════════
   POPOVER RESPONSIVE — mobile: center like QR popover
   ═══════════════════════════════════════════════════════════════════════ */

@media (max-width: 480px) {
  .ado-persona-popover,
  .ado-force-reply-popover,
  .ado-guide-popover {
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    max-height: min(50vh, 360px);
    padding: 4px;
  }
}
`;
