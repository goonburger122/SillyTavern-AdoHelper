/**
 * PersonaPopover — Glass popover for switching the active persona.
 *
 * Lists all configured personas with avatar thumbnails.
 * Click to switch; active persona highlighted.
 * Pattern mirrors QuickReplyPopover (click-outside + Escape).
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserCircle } from 'lucide-react';
import {
    fetchPersonaList,
    getCurrentPersonaAvatar,
    switchPersona,
} from '../../../lib/personaService';
import LazyImage from '../shared/LazyImage';

export default function PersonaPopover({ onClose }) {
    const [personas, setPersonas] = useState([]);
    const [currentAvatar, setCurrentAvatar] = useState(null);
    const menuRef = useRef(null);

    // Load personas on mount
    useEffect(() => {
        setCurrentAvatar(getCurrentPersonaAvatar());
        fetchPersonaList().then(setPersonas);
    }, []);

    // Close on click outside (deferred)
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const handleSelect = useCallback(async (avatarId) => {
        onClose();
        await switchPersona(avatarId);
    }, [onClose]);

    const isEmpty = personas.length === 0;

    return (
        <div className="ado-persona-popover" ref={menuRef}>
            {isEmpty ? (
                <div className="ado-persona-empty">
                    <UserCircle size={20} style={{ opacity: 0.4 }} />
                    <span>No personas configured</span>
                </div>
            ) : (
                <div className="ado-persona-list">
                    {personas.map((p) => {
                        const isActive = p.avatarId === currentAvatar;
                        return (
                            <button
                                key={p.avatarId}
                                className={`ado-persona-item${isActive ? ' ado-persona-active' : ''}`}
                                onClick={() => handleSelect(p.avatarId)}
                                type="button"
                            >
                                <LazyImage
                                    containerClassName="ado-persona-avatar"
                                    src={p.avatarUrl}
                                    alt={p.name}
                                    spinnerSize={10}
                                />
                                <div className="ado-persona-info">
                                    <span className="ado-persona-name">{p.name}</span>
                                    {p.title && <span className="ado-persona-title">{p.title}</span>}
                                </div>
                                {isActive && <span className="ado-persona-check">&#10003;</span>}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
