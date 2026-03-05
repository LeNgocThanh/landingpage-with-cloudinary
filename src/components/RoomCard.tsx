'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Users, DollarSign, ImageIcon } from 'lucide-react';
import ImageGalleryModal from '@/components/ImageGalleryModal';

interface Room {
    id: string;
    name: string;
    description: string;
    pricePerHour: number;
    capacity: number;
    status: string;
    images: Array<{
        id: string;
        url: string;
        isPrimary: boolean;
    }>;
    amenities: Array<{
        amenity: {
            id: string;
            name: string;
            icon: string | null;
        };
    }>;
}

interface RoomCardProps {
    room: Room;
    timelineEvents: any[];
    onBook: () => void;
}

export default function RoomCard({ room, timelineEvents, onBook }: RoomCardProps) {
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [imageLoadError, setImageLoadError] = useState(false);

    const primaryImage = room.images.find(img => img.isPrimary) || room.images[0];
    const hasMultipleImages = room.images.length > 1;

    const isActuallyOccupied =
        room.status === 'occupied' ||
        timelineEvents.some(event => event.type === 'booking');

    const handleImageClick = () => {
        console.log('Image clicked!', {
            roomName: room.name,
            imagesCount: room.images.length,
            currentGalleryState: isGalleryOpen
        });
        setIsGalleryOpen(true);
    };

    const statusColors = {
        available: 'bg-emerald-500',
        occupied: 'bg-rose-500',
        maintenance: 'bg-amber-500',
    };
    const statusLabels = {
        available: 'Còn sử dụng',
        occupied: 'Đã thuê',
        maintenance: 'Bảo trì',
    };

    const getStatusColor = () => {
        if (room.status === 'maintenance') return 'bg-amber-500';
        if (isActuallyOccupied) return 'bg-rose-500'; // Đỏ nếu đã thuê hoặc có lịch
        return 'bg-emerald-500'; // Xanh nếu trống hoàn toàn
    };

    // Xác định nhãn hiển thị
    const getStatusLabel = () => {
        if (room.status === 'maintenance') return 'Bảo trì';
        if (isActuallyOccupied) return 'có lịch sử dụng'; // Ưu tiên hiển thị "Đã thuê"
        return 'Còn trống';
    };

    return (
        <>
            <div className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-gray-100">
                {/* Image */}
                <div
                    className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer"
                    onClick={handleImageClick}
                >
                    {primaryImage && !imageLoadError ? (
                        <>
                            <Image
                                src={primaryImage.url}
                                alt={room.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                onError={() => setImageLoadError(true)}
                                priority
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />

                            {/* Image overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                            {/* Image counter badge */}
                            {hasMultipleImages && (
                                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium pointer-events-none">
                                    <ImageIcon className="w-4 h-4" />
                                    <span>{room.images.length}</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center">
                            <div className="text-center">
                                <ImageIcon className="w-16 h-16 text-white/80 mx-auto mb-2" />
                                <p className="text-white/90 text-lg font-semibold">Không có ảnh</p>
                            </div>
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4 z-10 pointer-events-none">
                        <span className={`${getStatusColor()} text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm`}>
                            {getStatusLabel()}
                        </span>
                    </div>

                    {/* View Gallery hint */}
                    {hasMultipleImages && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                                <p className="text-gray-900 font-medium text-sm">Xem tất cả {room.images.length} ảnh</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {room.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                        {room.description}
                    </p>

                    {/* Info */}
                    <div className="flex items-center gap-6 mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-gray-700">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Users className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Sức chứa</p>
                                <p className="text-sm font-semibold">{room.capacity} người</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-indigo-600">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <DollarSign className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Giá thuê từ</p>
                                <p className="text-sm font-bold">{room.pricePerHour.toLocaleString('vi-VN')}đ/giờ</p>
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    {room.amenities.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tiện nghi</p>
                            <div className="flex flex-wrap gap-2">
                                {room.amenities.slice(0, 3).map((item) => (
                                    <span
                                        key={item.amenity.id}
                                        className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-indigo-100"
                                    >
                                        {item.amenity.name}
                                    </span>
                                ))}
                                {room.amenities.length > 3 && (
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200">
                                        +{room.amenities.length - 3} khác
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Book Button */}
                    <button
                        onClick={onBook}
                        disabled={room.status !== 'available'}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-md ${room.status === 'available'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {room.status === 'available' ? 'Đặt Phòng Ngay' : 'Không Khả Dụng'}
                    </button>
                </div>
            </div>

            {/* Image Gallery Modal */}
            <ImageGalleryModal
                images={room.images}
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                roomName={room.name}
            />
        </>
    );
}
