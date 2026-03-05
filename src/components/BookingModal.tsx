'use client';

import { useState } from 'react';
import { X, Calendar, Clock, User, Phone, MessageCircle } from 'lucide-react';

interface Room {
    id: string;
    name: string;
    pricePerHour: number;
}

interface BookingModalProps {
    room: Room;
    isOpen: boolean;
    onClose: () => void;
}

export default function BookingModal({ room, isOpen, onClose }: BookingModalProps) {
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerZalo: '',
        startTime: '',
        endTime: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomId: room.id,
                    ...formData,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessageType('success');
                setMessage(data.message);
                setFormData({
                    customerName: '',
                    customerPhone: '',
                    customerZalo: '',
                    startTime: '',
                    endTime: '',
                });

                // Close modal after 3 seconds
                setTimeout(() => {
                    onClose();
                }, 3000);
            } else {
                setMessageType('error');
                setMessage(data.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            setMessageType('error');
            setMessage('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Đặt Phòng</h2>
                            <p className="text-indigo-100 mt-1">{room.name}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <User className="w-4 h-4" />
                            Họ và tên *
                        </label>
                        <input
                            type="text"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Nguyễn Văn A"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Phone className="w-4 h-4" />
                            Số điện thoại *
                        </label>
                        <input
                            type="tel"
                            name="customerPhone"
                            value={formData.customerPhone}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="0123456789"
                        />
                    </div>

                    {/* Zalo */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <MessageCircle className="w-4 h-4" />
                            Zalo (tùy chọn)
                        </label>
                        <input
                            type="text"
                            name="customerZalo"
                            value={formData.customerZalo}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="0123456789"
                        />
                    </div>

                    {/* Start Time */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4" />
                            Thời gian bắt đầu *
                        </label>
                        <input
                            type="datetime-local"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* End Time */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Clock className="w-4 h-4" />
                            Thời gian kết thúc *
                        </label>
                        <input
                            type="datetime-local"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Price Info */}
                    <div className="bg-indigo-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-600">Giá thuê</p>
                        <p className="text-2xl font-bold text-indigo-600">
                            {room.pricePerHour.toLocaleString('vi-VN')}đ/giờ
                        </p>
                    </div>

                    {/* Message */}
                    {message && (
                        <div
                            className={`p-4 rounded-xl ${messageType === 'success'
                                    ? 'bg-green-50 text-green-800 border border-green-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                                }`}
                        >
                            {message}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Đang xử lý...' : 'Xác Nhận Đặt Phòng'}
                    </button>
                </form>
            </div>
        </div>
    );
}
