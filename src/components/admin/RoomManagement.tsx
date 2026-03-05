'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon, Upload, CheckSquare, Square } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';

interface Amenity {
    id: string;
    name: string;
}

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
        publicId: string;
        isPrimary: boolean;
    }>;
    // Cập nhật interface để nhận dữ liệu tiện ích
    amenities: Array<{
        amenity: Amenity;
    }>;
}

export default function RoomManagement() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [allAmenities, setAllAmenities] = useState<Amenity[]>([]); // Danh sách tất cả tiện ích có sẵn
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        pricePerHour: '',
        capacity: '',
        status: 'available',
        amenityIds: [] as string[], // Lưu danh sách ID tiện ích được chọn
    });

    useEffect(() => {
        fetchRooms();
        fetchAllAmenities();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await fetch('/api/rooms');
            const data = await response.json();
            setRooms(data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllAmenities = async () => {
        try {
            // Giả sử bạn có route này để lấy danh sách tiện ích tổng
            const response = await fetch('/api/amenities');
            const data = await response.json();
            setAllAmenities(data);
        } catch (error) {
            console.error('Error fetching amenities:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingRoom ? `/api/rooms/${editingRoom.id}` : '/api/rooms';
            const method = editingRoom ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                handleCloseModal();
                fetchRooms();
            }
        } catch (error) {
            console.error('Error saving room:', error);
        }
    };

    const handleEdit = (room: Room) => {
        setEditingRoom(room);
        setFormData({
            name: room.name,
            description: room.description,
            pricePerHour: room.pricePerHour.toString(),
            capacity: room.capacity.toString(),
            status: room.status,
            // Chuyển đổi từ cấu trúc quan hệ sang mảng ID để dễ quản lý trong form
            amenityIds: room.amenities?.map(a => a.amenity.id) || [],
        });
        setShowModal(true);
    };

    const handleToggleAmenity = (id: string) => {
        setFormData(prev => ({
            ...prev,
            amenityIds: prev.amenityIds.includes(id)
                ? prev.amenityIds.filter(item => item !== id)
                : [...prev.amenityIds, id]
        }));
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRoom(null);
        setFormData({
            name: '',
            description: '',
            pricePerHour: '',
            capacity: '',
            status: 'available',
            amenityIds: [],
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa phòng này?')) return;

        try {
            const response = await fetch(`/api/rooms/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchRooms();
            }
        } catch (error) {
            console.error('Error deleting room:', error);
        }
    };

    const handleImageUpload = async (result: any, roomId: string) => {
        try {
            await fetch(`/api/rooms/${roomId}/images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: result.info.secure_url,
                    publicId: result.info.public_id,
                }),
            });
            fetchRooms();
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Quản lý phòng</h2>
                <button
                    onClick={() => {
                        handleCloseModal();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Thêm phòng mới
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <div key={room.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="relative h-48 bg-gray-200">
                                {room.images[0] ? (
                                    <img
                                        src={room.images[0].url}
                                        alt={room.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <CldUploadWidget
                                        uploadPreset="homestay-rooms"
                                        onSuccess={(result) => handleImageUpload(result, room.id)}
                                    >
                                        {({ open }) => (
                                            <button
                                                onClick={() => open()}
                                                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                                            >
                                                <Upload className="w-4 h-4" />
                                            </button>
                                        )}
                                    </CldUploadWidget>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold">{room.name}</h3>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${room.status === 'available'
                                                ? 'bg-green-100 text-green-800'
                                                : room.status === 'occupied'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                    >
                                        {room.status}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-2 line-clamp-1">{room.description}</p>
                                
                                {/* Hiển thị các tiện ích hiện có của phòng */}
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {room.amenities?.map((a) => (
                                        <span key={a.amenity.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded border">
                                            {a.amenity.name}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-indigo-600 font-semibold">
                                        {room.pricePerHour.toLocaleString('vi-VN')}đ/giờ
                                    </span>
                                    <span className="text-gray-500 text-sm">{room.capacity} người</span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(room)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(room.id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 my-8">
                        <h3 className="text-2xl font-bold mb-4">
                            {editingRoom ? 'Sửa phòng' : 'Thêm phòng mới'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên phòng</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá/giờ (VNĐ)</label>
                                    <input
                                        type="number"
                                        value={formData.pricePerHour}
                                        onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                                    <input
                                        type="number"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Section chọn Amenities */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tiện ích</label>
                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-100 rounded-lg bg-gray-50">
                                    {allAmenities.map((amenity) => (
                                        <button
                                            key={amenity.id}
                                            type="button"
                                            onClick={() => handleToggleAmenity(amenity.id)}
                                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                                        >
                                            {formData.amenityIds.includes(amenity.id) ? (
                                                <CheckSquare className="w-4 h-4 text-indigo-600" />
                                            ) : (
                                                <Square className="w-4 h-4 text-gray-400" />
                                            )}
                                            {amenity.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="available">Còn trống</option>
                                    <option value="occupied">Đã thuê</option>
                                    <option value="maintenance">Bảo trì</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    {editingRoom ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}