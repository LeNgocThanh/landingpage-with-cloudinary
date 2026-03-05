'use client';

import { useState, useEffect } from 'react';
import { Calendar, RefreshCw, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import DateRangePicker from '@/components/DateRangePicker';
import TimelineGrid from '@/components/TimelineGrid';

interface TimelineEvent {
    id: string;
    type: 'booking' | 'available';
    startTime: Date;
    endTime: Date;
    status: string;
    customerName?: string;
    customerPhone?: string;
    totalPrice?: number;
    notes?: string;
}

interface RoomTimeline {
    id: string;
    name: string;
    capacity: number;
    pricePerHour: number;
    status: string;
    image: string | null;
    events: TimelineEvent[];
}

interface TimelineData {
    rooms: RoomTimeline[];
    dateRange: {
        start: string;
        end: string;
    };
}

export default function TimelinePage() {
    const [startDate, setStartDate] = useState<Date>(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    });

    const [endDate, setEndDate] = useState<Date>(() => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return today;
    });

    const [showDays, setShowDays] = useState<1 | 2>(1);
    const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTimelineData();
    }, [startDate, endDate]);

    const fetchTimelineData = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            });

            const response = await fetch(`/api/timeline?${params}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch timeline data');
            }

            const data = await response.json();
            
            // Convert string dates to Date objects
            const processedData = {
                ...data,
                rooms: data.rooms.map((room: RoomTimeline) => ({
                    ...room,
                    events: room.events.map((event: TimelineEvent) => ({
                        ...event,
                        startTime: new Date(event.startTime),
                        endTime: new Date(event.endTime),
                    })),
                })),
            };

            setTimelineData(processedData);
        } catch (err) {
            console.error('Error fetching timeline:', err);
            setError('Không thể tải dữ liệu timeline. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (start: Date, end: Date) => {
        setStartDate(start);
        setEndDate(end);
    };

    const handleShowDaysChange = (days: 1 | 2) => {
        setShowDays(days);
    };

    // Calculate statistics
    const getStatistics = () => {
        if (!timelineData) {
            return { totalBookings: 0, confirmedBookings: 0, totalRevenue: 0 };
        }

        let totalBookings = 0;
        let confirmedBookings = 0;
        let totalRevenue = 0;

        timelineData.rooms.forEach((room) => {
            room.events.forEach((event) => {
                if (event.type === 'booking') {
                    totalBookings++;
                    if (event.status === 'confirmed') {
                        confirmedBookings++;
                    }
                    if (event.totalPrice) {
                        totalRevenue += event.totalPrice;
                    }
                }
            });
        });

        return { totalBookings, confirmedBookings, totalRevenue };
    };

    const stats = getStatistics();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Timeline Booking</h1>
                            <p className="text-blue-100 text-lg">
                               Lịch đặt phòng theo thời gian
                            </p>
                        </div>
                        <a
                            href="/"
                            className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl font-semibold text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
                        >
                            Về trang chủ
                        </a>
                        <button
                            onClick={fetchTimelineData}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            Làm mới
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 -mt-16">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 rounded-xl">
                                <Calendar className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Tổng Bookings</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Đã Xác Nhận</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.confirmedBookings}</p>
                            </div>
                        </div>
                    </div>

                    {/* <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Clock className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Doanh Thu</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.totalRevenue.toLocaleString('vi-VN')}đ
                                </p>
                            </div>
                        </div>
                    </div> */}
                </div>

                {/* Date Range Picker */}
                <div className="mb-6">
                    <DateRangePicker
                        startDate={startDate}
                        endDate={endDate}
                        onDateChange={handleDateChange}
                        showDays={showDays}
                        onShowDaysChange={handleShowDaysChange}
                    />
                </div>

                {/* Timeline Grid */}
                {loading ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-red-200">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 font-medium mb-4">{error}</p>
                        <button
                            onClick={fetchTimelineData}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : timelineData ? (
                    <TimelineGrid
                        rooms={timelineData.rooms}
                        startDate={startDate}
                        endDate={endDate}
                    />
                ) : null}
            </div>

            {/* Footer Info */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                    <h3 className="font-bold text-gray-900 mb-3">💡 Hướng dẫn sử dụng</h3>
                    <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>Click vào các booking để xem chi tiết (không có thông tin cá nhân)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>Sử dụng nút mũi tên hoặc chọn ngày để xem timeline các ngày khác</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>Chọn "1 Ngày" hoặc "2 Ngày" để thay đổi phạm vi hiển thị</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>Các booking được tô màu theo trạng thái: Xanh dương (đã xác nhận), Vàng (chờ xác nhận), Xám (hoàn thành)</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
