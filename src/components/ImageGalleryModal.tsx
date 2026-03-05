'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';

interface ImageData {
    id: string;
    url: string;
    isPrimary: boolean;
}

interface ImageGalleryModalProps {
    images: ImageData[];
    initialIndex?: number;
    isOpen: boolean;
    onClose: () => void;
    roomName?: string;
}

export default function ImageGalleryModal({
    images,
    initialIndex = 0,
    isOpen,
    onClose,
    roomName = 'Gallery'
}: ImageGalleryModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Debug log
    useEffect(() => {
        console.log('ImageGalleryModal state:', { isOpen, imagesCount: images.length, roomName });
    }, [isOpen, images.length, roomName]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            setIsZoomed(false);
            setZoomLevel(1);
            setIsFullscreen(false);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, initialIndex]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') handlePrevious();
            if (e.key === 'ArrowRight') handleNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex]);

    const handlePrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        setIsZoomed(false);
        setZoomLevel(1);
    }, [images.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        setIsZoomed(false);
        setZoomLevel(1);
    }, [images.length]);

    // Touch handlers for swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe && !isZoomed) {
            handleNext();
        }
        if (isRightSwipe && !isZoomed) {
            handlePrevious();
        }
    };

    const handleZoomIn = () => {
        setZoomLevel((prev) => Math.min(prev + 0.5, 3));
        setIsZoomed(true);
    };

    const handleZoomOut = () => {
        setZoomLevel((prev) => {
            const newZoom = Math.max(prev - 0.5, 1);
            if (newZoom === 1) setIsZoomed(false);
            return newZoom;
        });
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h3 className="text-white text-xl font-semibold">{roomName}</h3>
                        <p className="text-white/70 text-sm">
                            {currentIndex + 1} / {images.length}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        aria-label="Close gallery"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>
            </div>

            {/* Main Image */}
            <div className="absolute inset-0 flex items-center justify-center p-4 pt-20 pb-32">
                <div
                    className={`relative w-full h-full ${isFullscreen ? 'max-w-none' : 'max-w-5xl'} transition-all duration-300`}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className={`relative w-full h-full transition-transform duration-300 ${isZoomed ? 'cursor-move' : 'cursor-zoom-in'}`}>
                        <Image
                            src={images[currentIndex].url}
                            alt={`Image ${currentIndex + 1}`}
                            fill
                            className="object-contain"
                            style={{
                                transform: `scale(${zoomLevel})`,
                                transition: 'transform 0.3s ease-in-out'
                            }}
                            priority
                            quality={100}
                        />
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={handlePrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all hover:scale-110"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="w-8 h-8 text-white" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all hover:scale-110"
                        aria-label="Next image"
                    >
                        <ChevronRight className="w-8 h-8 text-white" />
                    </button>
                </>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent p-4">
                <div className="max-w-7xl mx-auto">
                    {/* Zoom Controls */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <button
                            onClick={handleZoomOut}
                            disabled={zoomLevel === 1}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Zoom out"
                        >
                            <ZoomOut className="w-5 h-5 text-white" />
                        </button>
                        <span className="text-white text-sm font-medium min-w-[60px] text-center">
                            {Math.round(zoomLevel * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            disabled={zoomLevel === 3}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Zoom in"
                        >
                            <ZoomIn className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors ml-2"
                            aria-label="Toggle fullscreen"
                        >
                            {isFullscreen ? (
                                <Minimize2 className="w-5 h-5 text-white" />
                            ) : (
                                <Maximize2 className="w-5 h-5 text-white" />
                            )}
                        </button>
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
                            {images.map((image, index) => (
                                <button
                                    key={image.id}
                                    onClick={() => {
                                        setCurrentIndex(index);
                                        setIsZoomed(false);
                                        setZoomLevel(1);
                                    }}
                                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                                        index === currentIndex
                                            ? 'ring-2 ring-white scale-110'
                                            : 'ring-1 ring-white/30 hover:ring-white/60'
                                    }`}
                                >
                                    <Image
                                        src={image.url}
                                        alt={`Thumbnail ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                    />
                                    {image.isPrimary && (
                                        <div className="absolute top-1 right-1 bg-indigo-500 rounded-full w-2 h-2"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
