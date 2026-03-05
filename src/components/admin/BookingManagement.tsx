'use client';

import { useState, useEffect } from 'react';
import { Calendar, User, Phone, Clock, CheckCircle, XCircle, Search } from 'lucide-react';

interface Booking {
    id: string;
    customerName: string;
    customerPhone: string;
    customerZalo?: string;
    startTime: string;
    endTime: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    room: {
        id: string;
        name: string;
    };
}

export default function BookingManagement() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(firstDay);
    const [endDate, setEndDate] = useState(lastDay);

    useEffect(() => {
        fetchBookings();
    }, [startDate, endDate]); // Fetch lại khi ngày thay đổi

    const fetchBookings = async () => {
        setLoading(true);
        try {
            // Truyền tham số thời gian vào API
            const params = new URLSearchParams({
                startTime: new Date(startDate).toISOString(),
                endTime: new Date(`${endDate}T23:59:59`).toISOString(),
            });

            const response = await fetch(`/api/bookings?${params.toString()}`);
            const data = await response.json();
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };    

    const updateBookingStatus = async (id: string, status: string) => {
        try {
            const response = await fetch(`/api/bookings/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                fetchBookings();
            }
        } catch (error) {
            console.error('Error updating booking:', error);
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        if (filter === 'all') return true;
        return booking.status === filter;
    });

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        completed: 'bg-blue-100 text-blue-800',
    };

    const statusLabels = {
        pending: 'Chờ xác nhận',
        confirmed: 'Đã xác nhận',
        cancelled: 'Đã hủy',
        completed: 'Hoàn thành',
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Quản lý đặt phòng</h2>

                <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-2">
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="text-sm border-none focus:ring-0"
                        />
                        <span className="text-gray-400">→</span>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-sm border-none focus:ring-0"
                        />
                    </div>
                    <button 
                        onClick={fetchBookings}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                </div>
            

                <div className="flex gap-2">
                    {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === status
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {status === 'all' ? 'Tất cả' : statusLabels[status as keyof typeof statusLabels]}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Không có đặt phòng nào</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Khách hàng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Phòng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thời gian
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tổng tiền
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                                    <User className="w-4 h-4" />
                                                    {booking.customerName}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                    <Phone className="w-4 h-4" />
                                                    {booking.customerPhone}
                                                </div>
                                                {booking.customerZalo && (
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        Zalo: {booking.customerZalo}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{booking.room.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(booking.startTime).toLocaleString('vi-VN')}
                                                </div>
                                                <div className="text-gray-500 mt-1">
                                                    đến {new Date(booking.endTime).toLocaleString('vi-VN')}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-indigo-600">
                                                {booking.totalPrice.toLocaleString('vi-VN')}đ
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[booking.status as keyof typeof statusColors]
                                                    }`}
                                            >
                                                {statusLabels[booking.status as keyof typeof statusLabels]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {booking.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                                        className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Xác nhận
                                                    </button>
                                                    <button
                                                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                                        className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Hủy
                                                    </button>
                                                </div>
                                            )}
                                            {booking.status === 'confirmed' && (
                                                <button
                                                    onClick={() => updateBookingStatus(booking.id, 'completed')}
                                                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                                                >
                                                    Hoàn thành
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
