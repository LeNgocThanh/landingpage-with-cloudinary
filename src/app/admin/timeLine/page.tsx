'use client';

import { useState, useEffect } from 'react';
import { Calendar, RefreshCw, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import DateRangePicker from '@/components/DateRangeAdminPicker';
import TimelineAdmin from '@/components/TimeLineAdmin';

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

    const [showDays, setShowDays] = useState<1 | 2 | 7>(1);
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

    const handleShowDaysChange = (days: 1 | 2 | 7) => {
        setShowDays(days);
    };

    const getStatistics = () => {
        if (!timelineData) return { totalBookings: 0, confirmedBookings: 0, totalRevenue: 0 };

        let totalBookings = 0;
        let confirmedBookings = 0;
        let totalRevenue = 0;

        timelineData.rooms.forEach((room) => {
            room.events.forEach((event) => {
                if (event.type === 'booking') {
                    totalBookings++;
                    if (event.status === 'confirmed') confirmedBookings++;
                    if (event.totalPrice) totalRevenue += event.totalPrice;
                }
            });
        });

        return { totalBookings, confirmedBookings, totalRevenue };
    };

    const stats = getStatistics();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight mb-1">Timeline Booking</h1>
                            <p className="text-indigo-200 text-sm font-medium">
                                Quản lý lịch đặt phòng theo thời gian thực
                            </p>
                        </div>
                        <button
                            onClick={fetchTimelineData}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl font-semibold text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Làm mới
                        </button>
                        <a
                            href="/admin"
                            className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl font-semibold text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
                        >
                            Về tạo phòng, xem lịch đặt
                        </a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7 -mt-14">
                    <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Tổng Bookings</p>
                            <p className="text-2xl font-black text-gray-900">{stats.totalBookings}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Đã Xác Nhận</p>
                            <p className="text-2xl font-black text-gray-900">{stats.confirmedBookings}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Doanh Thu</p>
                            <p className="text-2xl font-black text-gray-900">
                                {stats.totalRevenue.toLocaleString('vi-VN')}đ
                            </p>
                        </div>
                    </div>
                </div>

                {/* Date Range Picker */}
                <div className="mb-5">
                    <DateRangePicker
                        startDate={startDate}
                        endDate={endDate}
                        onDateChange={handleDateChange}
                        showDays={showDays}
                        onShowDaysChange={handleShowDaysChange}
                    />
                </div>

                {/* Timeline */}
                {loading ? (
                    <div className="bg-white rounded-2xl shadow-md p-16 text-center border border-gray-100">
                        <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-500 font-semibold text-sm">Đang tải dữ liệu...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-2xl shadow-md p-16 text-center border border-red-100">
                        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
                        <p className="text-red-500 font-semibold mb-5 text-sm">{error}</p>
                        <button
                            onClick={fetchTimelineData}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : timelineData ? (
                    <TimelineAdmin
                        rooms={timelineData.rooms}
                        startDate={startDate}
                        endDate={endDate}
                    />
                ) : null}

                {/* Guide */}
                <div className="mt-6 bg-indigo-50/80 rounded-2xl p-5 border border-indigo-100">
                    <p className="text-xs font-black text-indigo-700 uppercase tracking-widest mb-3">💡 Hướng dẫn</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                        <div className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                            <span>Click vào <strong>ô trống</strong> để đặt phòng nhanh cho khung giờ đó</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                            <span>Click vào <strong>booking</strong> hiện có để xem và chỉnh sửa thông tin</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                            <span>Chọn <strong>1 / 2 / 7 Ngày</strong> để thay đổi phạm vi hiển thị</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                            <span>Dùng mũi tên ← → để điều hướng theo ngày hoặc tuần</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
