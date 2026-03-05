'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';

interface Amenity {
    id: string;
    name: string;
    icon: string | null;
}

export default function AmenityManagement() {
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
    const [formData, setFormData] = useState({ name: '', icon: '' });

    useEffect(() => {
        fetchAmenities();
    }, []);

    const fetchAmenities = async () => {
        try {
            const response = await fetch('/api/amenities');
            const data = await response.json();
            setAmenities(data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách tiện ích:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingAmenity ? `/api/amenities/${editingAmenity.id}` : '/api/amenities';
        const method = editingAmenity ? 'PATCH' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                closeModal();
                fetchAmenities();
            } else {
                alert('Có lỗi xảy ra (có thể tên tiện ích bị trùng)');
            }
        } catch (error) {
            console.error('Lỗi khi lưu tiện ích:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa tiện ích này sẽ gỡ nó khỏi tất cả các phòng liên quan. Bạn chắc chứ?')) return;

        try {
            const response = await fetch(`/api/amenities/${id}`, { method: 'DELETE' });
            if (response.ok) fetchAmenities();
        } catch (error) {
            console.error('Lỗi khi xóa tiện ích:', error);
        }
    };

    const openModal = (amenity?: Amenity) => {
        if (amenity) {
            setEditingAmenity(amenity);
            setFormData({ name: amenity.name, icon: amenity.icon || '' });
        } else {
            setEditingAmenity(null);
            setFormData({ name: '', icon: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingAmenity(null);
        setFormData({ name: '', icon: '' });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Danh sách tiện ích</h2>
                    <p className="text-sm text-gray-500">Quản lý các trang thiết bị đi kèm phòng</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Thêm mới
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {amenities.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold">
                                    {item.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">{item.name}</p>
                                    <p className="text-xs text-gray-400">Icon: {item.icon || 'none'}</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => openModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">{editingAmenity ? 'Sửa tiện ích' : 'Thêm tiện ích'}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên tiện ích</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="VD: Wifi, Điều hòa..."
                                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Icon code (tùy chọn)</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="VD: wifi, tv, coffee..."
                                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Lưu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}