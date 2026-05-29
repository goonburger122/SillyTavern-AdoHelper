/**
 * ReasoningSettings - Shared component for Chat Preset reasoning configuration
 * Used by both ChatPresetsModal and PromptSettings sidebar
 */
import React from 'react';
import clsx from 'clsx';
import {
    Brain,
    Sparkles,
    Zap,
    X,
    Tag,
    Gauge,
    Layers,
    Workflow
} from 'lucide-react';
import { isAdaptiveThinkingModel } from '../../../lib/lucidLoomService';

/**
 * Reasoning Settings Content Component
 * Renders the full reasoning configuration UI (CoT presets, API reasoning, Start Reply With)
 */
export function ReasoningSettingsContent({
    reasoningSettings,
    startReplyWith,
    apiReasoning,
    postProcessing = '',
    adaptiveThinking,
    connectionProfile,
    onApplyReasoningPreset,
    onStartReplyWithChange,
    onReasoningToggle,
    onAPIReasoningToggle,
    onReasoningEffortChange,
    onPostProcessingChange,
    onAdaptiveThinkingToggle,
    effortLevels = ['auto', 'none', 'low', 'medium', 'high', 'xhigh', 'min', 'max'],
    postProcessingOptions = [
        { value: '', label: 'None (Default)' },
        { value: 'merge', label: 'Merge (Recommended for Claude/OpenAI)' },
        { value: 'merge_tools', label: 'Merge (preserve tool calls)' },
        { value: 'semi', label: 'Semi-alternation' },
        { value: 'semi_tools', label: 'Semi-alternation (with tools)' },
        { value: 'strict', label: 'Strict alternation' },
        { value: 'strict_tools', label: 'Strict alternation (with tools)' },
        { value: 'single', label: 'Single (last user message only)' },
    ],
    compact = false
}) {
    const showAdaptiveToggle = apiReasoning.enabled
        && onAdaptiveThinkingToggle
        && connectionProfile?.model
        && isAdaptiveThinkingModel(connectionProfile.model);
    return (
        <div className={clsx('ado-presets-reasoning', compact && 'ado-presets-reasoning--compact')}>
            {/* Quick presets */}
            <div className="ado-presets-reasoning-quick">
                <span className="ado-presets-reasoning-label">
                    <Sparkles size={12} strokeWidth={2} />
                    Quick Presets
                </span>
                <div className="ado-presets-reasoning-btns">
                    <button
                        className="ado-presets-reasoning-btn ado-presets-reasoning-btn--deepseek"
                        onClick={() => onApplyReasoningPreset('deepseek', false)}
                        title="Apply DeepSeek <think> tags"
                        type="button"
                    >
                        <span className="ado-presets-reasoning-btn-label">DeepSeek</span>
                        <code>&lt;think&gt;</code>
                    </button>
                    <button
                        className="ado-presets-reasoning-btn ado-presets-reasoning-btn--claude"
                        onClick={() => onApplyReasoningPreset('claude_extended', false)}
                        title="Apply Claude <thinking> tags"
                        type="button"
                    >
                        <span className="ado-presets-reasoning-btn-label">Claude</span>
                        <code>&lt;thinking&gt;</code>
                    </button>
                    <button
                        className="ado-presets-reasoning-btn ado-presets-reasoning-btn--o1"
                        onClick={() => onApplyReasoningPreset('openai_o1', false)}
                        title="Apply o1 <reasoning> tags"
                        type="button"
                    >
                        <span className="ado-presets-reasoning-btn-label">o1</span>
                        <code>&lt;reasoning&gt;</code>
                    </button>
                </div>
            </div>

            {/* Current settings display */}
            {reasoningSettings && (
                <div className="ado-presets-reasoning-current">
                    <div className="ado-presets-reasoning-row">
                        <label className="ado-presets-reasoning-checkbox">
                            <input
                                type="checkbox"
                                checked={reasoningSettings.auto_parse || false}
                                onChange={(e) => onReasoningToggle('autoParse', e.target.checked)}
                            />
                            <span className="ado-presets-reasoning-checkmark"></span>
                            <span>Auto-parse thoughts</span>
                        </label>
                    </div>
                    <div className="ado-presets-reasoning-tags">
                        <Tag size={12} strokeWidth={2} />
                        <span>Tags:</span>
                        <code>{(reasoningSettings.prefix || '<think>').replace(/\n/g, '↵')}</code>
                        <span className="ado-presets-reasoning-tags-sep">/</span>
                        <code>{(reasoningSettings.suffix || '</think>').replace(/\n/g, '↵')}</code>
                    </div>
                </div>
            )}

            {/* API Reasoning Settings (Include Reasoning & Effort) */}
            <div className="ado-presets-api-reasoning">
                <span className="ado-presets-reasoning-label">
                    <Gauge size={12} strokeWidth={2} />
                    API Reasoning (for supported models)
                </span>
                <div className="ado-presets-api-reasoning-controls">
                    <label className="ado-presets-reasoning-checkbox">
                        <input
                            type="checkbox"
                            checked={apiReasoning.enabled}
                            onChange={(e) => onAPIReasoningToggle(e.target.checked)}
                        />
                        <span className="ado-presets-reasoning-checkmark"></span>
                        <span>Include Reasoning</span>
                    </label>
                    <div className="ado-presets-api-reasoning-effort">
                        <span className="ado-presets-api-reasoning-effort-label">Effort:</span>
                        <select
                            className="ado-presets-api-reasoning-select"
                            value={apiReasoning.effort}
                            onChange={(e) => onReasoningEffortChange(e.target.value)}
                            disabled={!apiReasoning.enabled}
                        >
                            {effortLevels.map((level) => (
                                <option key={level} value={level}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {showAdaptiveToggle && (
                    <label className="ado-presets-reasoning-checkbox" style={{ marginTop: '6px' }}>
                        <input
                            type="checkbox"
                            checked={adaptiveThinking ?? true}
                            onChange={(e) => onAdaptiveThinkingToggle(e.target.checked)}
                        />
                        <span className="ado-presets-reasoning-checkmark"></span>
                        <Workflow size={12} strokeWidth={2} style={{ opacity: 0.7 }} />
                        <span>Adaptive Thinking</span>
                    </label>
                )}
                <p className="ado-presets-api-reasoning-hint">
                    {showAdaptiveToggle && adaptiveThinking
                        ? 'Adaptive thinking mode active for this Claude 4.6 model'
                        : 'For o1/o3, Grok 3, DeepSeek R1, and other reasoning models'}
                </p>
            </div>

            {/* Start Reply With */}
            <div className={clsx(
                'ado-presets-startreply',
                apiReasoning.enabled && 'is-disabled'
            )}>
                <label className="ado-presets-startreply-label">
                    <Zap size={12} strokeWidth={2} />
                    <span>Start Reply With (Prompt Bias)</span>
                    {apiReasoning.enabled && (
                        <span className="ado-presets-startreply-disabled-hint">
                            Disabled when API Reasoning is on
                        </span>
                    )}
                </label>
                <div className="ado-presets-startreply-input-wrap">
                    <textarea
                        className="ado-presets-startreply-input"
                        value={startReplyWith}
                        onChange={(e) => onStartReplyWithChange(e.target.value)}
                        placeholder={apiReasoning.enabled 
                            ? 'Disabled while API Reasoning is active' 
                            : 'Force AI to start response with...'}
                        rows={2}
                        disabled={apiReasoning.enabled}
                    />
                </div>
                <div className="ado-presets-startreply-quick">
                    <button
                        className="ado-presets-startreply-btn"
                        onClick={() => onStartReplyWithChange('<think>\n')}
                        title="Set to <think> tag with newline"
                        type="button"
                        disabled={apiReasoning.enabled}
                    >
                        &lt;think&gt;↵
                    </button>
                    <button
                        className="ado-presets-startreply-btn ado-presets-startreply-btn--claude"
                        onClick={() => onStartReplyWithChange('<think>')}
                        title="Set to <think> tag (Claude, no newline)"
                        type="button"
                        disabled={apiReasoning.enabled}
                    >
                        &lt;think&gt;
                    </button>
                    <button
                        className="ado-presets-startreply-btn ado-presets-startreply-btn--claude"
                        onClick={() => onStartReplyWithChange('<thinking>')}
                        title="Set to <thinking> tag (Claude, no newline)"
                        type="button"
                        disabled={apiReasoning.enabled}
                    >
                        &lt;thinking&gt;
                    </button>
                    <button
                        className="ado-presets-startreply-btn ado-presets-startreply-btn--clear"
                        onClick={() => onStartReplyWithChange('')}
                        title="Clear"
                        type="button"
                        disabled={apiReasoning.enabled}
                    >
                        <X size={12} strokeWidth={2} />
                    </button>
                </div>
            </div>

            {/* Prompt Post-Processing */}
            {onPostProcessingChange && (
                <div className="ado-presets-postprocessing">
                    <label className="ado-presets-postprocessing-label">
                        <Layers size={12} strokeWidth={2} />
                        <span>Prompt Post-Processing</span>
                    </label>
                    <select
                        className="ado-presets-postprocessing-select"
                        value={postProcessing}
                        onChange={(e) => onPostProcessingChange(e.target.value)}
                    >
                        {postProcessingOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <p className="ado-presets-postprocessing-hint">
                        Controls how messages are combined before sending to the API
                    </p>
                </div>
            )}
        </div>
    );
}

/**
 * Reasoning section header for sidebar usage
 */
export function ReasoningSectionHeader() {
    return (
        <div className="ado-presets-section-title">
            <Brain size={14} strokeWidth={2} />
            <span>Reasoning / Chain of Thought</span>
        </div>
    );
}

export default ReasoningSettingsContent;
