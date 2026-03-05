'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Clock, User, Phone, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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

interface TimelineGridProps {
    rooms: RoomTimeline[];
    startDate: Date;
    endDate: Date;
}

export default function TimelineGrid({ rooms, startDate, endDate }: TimelineGridProps) {
    const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

    // Cấu hình độ rộng cột cố định để tránh lệch dòng
    const COLUMN_WIDTH = 100; // 100px cho mỗi giờ
    const ROOM_COL_WIDTH = 192; // Tương đương w-48 (12rem)

    // Tạo danh sách các mốc giờ dựa trên khoảng thời gian chọn
    const generateTimeSlots = () => {
        const slots = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Tính số giờ chênh lệch thực tế
        const diffHours = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60));

        for (let i = 0; i <= diffHours; i++) {
            const slot = new Date(start);
            slot.setHours(start.getHours() + i);
            slots.push(slot);
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();
    const totalTimelineWidth = timeSlots.length * COLUMN_WIDTH;

    // Tính toán vị trí chính xác của khối booking theo pixel [cite: 8]
    const getEventStyle = (event: TimelineEvent) => {
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        const timelineStart = new Date(startDate);

        const startOffsetHours = (eventStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60);
        const durationHours = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60);

        return {
            left: `${startOffsetHours * COLUMN_WIDTH}px`,
            width: `${durationHours * COLUMN_WIDTH}px`,
        };
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            weekday: 'short', // Thêm "Thứ" viết tắt (T2, T3...)
            day: '2-digit',
            month: '2-digit',
        });
    };

    const getStatusColor = (status: string, type: string) => {
        if (type === 'available') return 'bg-green-100 border-green-300 text-green-700';
        switch (status) {
            case 'confirmed': return 'bg-blue-500 border-blue-600 text-white';
            case 'pending': return 'bg-yellow-500 border-yellow-600 text-white';
            case 'completed': return 'bg-gray-400 border-gray-500 text-white';
            default: return 'bg-indigo-500 border-indigo-600 text-white';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': case 'completed': return <CheckCircle className="w-3 h-3" />;
            case 'pending': return <AlertCircle className="w-3 h-3" />;
            default: return <Clock className="w-3 h-3" />;
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Scroll Wrapper ngang cho cả Header và Body */}
            <div className="overflow-x-auto overflow-y-hidden">
                <div style={{ width: `${totalTimelineWidth + ROOM_COL_WIDTH}px` }}>

                    {/* Time Header */}
                    <div className="sticky top-0 z-20 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                        <div className="flex">
                            {/* Cột tiêu đề "Phòng" cố định khi cuộn ngang */}
                            <div
                                className="flex-shrink-0 p-4 border-r border-gray-200 bg-indigo-50 sticky left-0 z-30"
                                style={{ width: `${ROOM_COL_WIDTH}px` }}
                            >
                                <h3 className="font-bold text-gray-900">Phòng</h3>
                            </div>

                            {/* Các mốc giờ */}
                            <div className="flex">
                                {timeSlots.map((slot, index) => (
                                    <div
                                        key={index}
                                        style={{ width: `${COLUMN_WIDTH}px` }}
                                        className="flex-shrink-0 border-r border-gray-200 p-2 text-center"
                                    >
                                        {(index === 0 || slot.getHours() === 0) && (
                                            <div className="text-[10px] font-bold text-indigo-600 mb-1 uppercase bg-indigo-100/50 rounded py-0.5">
                                                {formatDate(slot)}
                                            </div>
                                        )}
                                        <div className="text-sm font-medium text-gray-700">
                                            {formatTime(slot)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Timeline Body */}
                    <div className="max-h-[600px] overflow-y-auto">
                        {rooms.length === 0 ? (
                            <div className="p-12 text-center text-gray-500" style={{ width: `${ROOM_COL_WIDTH}px` }}>
                                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                <p>Không có dữ liệu phòng</p>
                            </div>
                        ) : (
                            rooms.map((room) => (
                                <div key={room.id} className="flex border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    {/* Thông tin phòng cố định bên trái [cite: 8] */}
                                    <div
                                        className="flex-shrink-0 p-4 border-r border-gray-200 bg-white sticky left-0 z-10"
                                        style={{ width: `${ROOM_COL_WIDTH}px` }}
                                    >
                                        <div className="flex items-center gap-3">
                                            {room.image ? (
                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                                    <Image src={room.image} alt={room.name} fill className="object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-400 flex-shrink-0" />
                                            )}
                                            <div className="min-w-0">
                                                <h4 className="font-semibold text-gray-900 truncate text-sm">{room.name}</h4>
                                                <p className="text-[10px] text-gray-500">{room.capacity} người</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vùng hiển thị các sự kiện booking */}
                                    <div className="relative" style={{ width: `${totalTimelineWidth}px`, height: '85px' }}>
                                        {/* Lưới kẻ dọc nền */}
                                        <div className="absolute inset-0 flex pointer-events-none">
                                            {timeSlots.map((_, index) => (
                                                <div
                                                    key={index}
                                                    style={{ width: `${COLUMN_WIDTH}px` }}
                                                    className="flex-shrink-0 border-r border-gray-100/50"
                                                />
                                            ))}
                                        </div>

                                        {/* Các khối sự kiện */}
                                        <div className="absolute inset-0 p-2">
                                            {room.events.map((event) => (
                                                <button
                                                    key={event.id}
                                                    onClick={() => setSelectedEvent(event)}
                                                    className={`absolute top-2 h-16 rounded-lg border-2 transition-all hover:z-20 hover:shadow-md ${getStatusColor(event.status, event.type)}`}
                                                    style={getEventStyle(event)}
                                                >
                                                    <div className="px-2 py-1 h-full flex flex-col justify-between overflow-hidden text-left">
                                                        <div className="flex items-center gap-1 text-[11px] font-bold">
                                                            {getStatusIcon(event.status)}
                                                            <span className="truncate">
                                                                {event.type === 'booking' ? 'Đã đặt' : 'Trống'}
                                                            </span>
                                                        </div>
                                                        <div className="text-[10px] opacity-90 font-medium">
                                                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal chi tiết và Legend giữ nguyên như bản cũ [cite: 8] */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Chi Tiết Booking</h3>
                            <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-gray-100 rounded-lg"><XCircle className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Clock className="w-5 h-5 text-indigo-600" />
                                <div>
                                    <p className="text-xs text-gray-500">Thời gian</p>
                                    <p className="font-semibold text-gray-900">{formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)} ({formatDate(selectedEvent.startTime)})</p>
                                </div>
                            </div>
                            {selectedEvent.type === 'booking' && (
                                <>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <User className="w-5 h-5 text-indigo-600" />
                                        <div>
                                            <p className="text-xs text-gray-500">Khách hàng</p>
                                            <p className="font-semibold text-gray-900">***</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Phone className="w-5 h-5 text-indigo-600" />
                                        <div>
                                            <p className="text-xs text-gray-500">Điện thoại</p>
                                            <p className="font-semibold text-gray-900">###</p>
                                        </div>
                                    </div>
                                    {selectedEvent.totalPrice && (
                                        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                            <DollarSign className="w-5 h-5 text-indigo-600" />
                                            <div>
                                                <p className="text-xs text-gray-500">Tổng tiền tạm tính</p>
                                                <p className="font-bold text-indigo-600">{selectedEvent.totalPrice.toLocaleString('vi-VN')}đ</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <button onClick={() => setSelectedEvent(null)} className="w-full mt-6 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold">Đóng</button>
                    </div>
                </div>
            )}

            <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex flex-wrap gap-4 justify-center text-xs">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded border border-blue-600"></div><span>Đã xác nhận</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded border border-yellow-600"></div><span>Chờ xác nhận</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-100 rounded border border-green-300"></div><span>Còn trống</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-400 rounded border border-gray-500"></div><span>Đã hoàn thành</span></div>
                </div>
            </div>
        </div>
    );
}
