/**
 * GalleryMosaic — Scrollable grid of character gallery thumbnails.
 *
 * Renders inside/below SidePortrait when "View Gallery" is clicked.
 * Click thumbnail → opens AvatarLightbox with gallery navigation.
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import LazyImage from '../shared/LazyImage';

export default function GalleryMosaic({ images, loading, onImageClick }) {
    if (loading) {
        return (
            <div className="ado-gallery-mosaic ado-gallery-mosaic--loading">
                <Loader2 size={20} className="ado-gallery-spinner" />
            </div>
        );
    }

    if (!images || images.length === 0) {
        return (
            <div className="ado-gallery-mosaic ado-gallery-mosaic--empty">
                <span>No gallery images found</span>
            </div>
        );
    }

    return (
        <div className="ado-gallery-mosaic">
            <div className="ado-gallery-grid">
                {images.map((image, index) => (
                    <button
                        key={image.path || index}
                        className="ado-gallery-thumb"
                        onClick={() => onImageClick(index)}
                        type="button"
                        title={image.title || `Image ${index + 1}`}
                    >
                        <LazyImage
                            src={image.path}
                            alt={image.title || ''}
                            className="ado-gallery-thumb-img"
                            spinnerSize={14}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
