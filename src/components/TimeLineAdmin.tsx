'use client';

import { useState, useRef, useCallback } from 'react';
import {
    Clock, User, Phone, XCircle, Save,
    PlusCircle, ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';

interface TimelineEvent {
    id: string;
    type: 'booking' | 'available';
    startTime: Date;
    endTime: Date;
    status: string;
    customerName?: string;
    customerPhone?: string;
    customerZalo?: string;
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

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    confirmed: { label: 'Đã xác nhận', bg: 'bg-blue-500', text: 'text-white', dot: 'bg-blue-300' },
    pending:   { label: 'Chờ xử lý',   bg: 'bg-amber-400', text: 'text-white', dot: 'bg-amber-200' },
    completed: { label: 'Hoàn thành',  bg: 'bg-emerald-500', text: 'text-white', dot: 'bg-emerald-300' },
    cancelled: { label: 'Đã hủy',      bg: 'bg-red-400', text: 'text-white', dot: 'bg-red-200' },
};

const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const HOUR_WIDTH = 80;
const ROOM_COL_WIDTH = 180;
const ROW_HEIGHT = 72;

function formatHour(date: Date) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: Date) {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

function formatToInputDateTime(date: Date) {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
}

export default function TimelineAdmin({ rooms, startDate, endDate }: TimelineGridProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
    const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Tooltip state for empty slot hover
    const [tooltip, setTooltip] = useState<{
        visible: boolean;
        x: number;
        y: number;
        roomId: string;
        slotTime: Date;
    } | null>(null);

    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerZalo: '',
        startTime: '',
        endTime: '',
        status: 'confirmed',
        notes: '',
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    // Generate time slots (every hour from start to end)
    const generateTimeSlots = useCallback(() => {
        const slots: Date[] = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffHours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
        for (let i = 0; i < diffHours; i++) {
            const slot = new Date(start);
            slot.setHours(start.getHours() + i);
            slots.push(slot);
        }
        return slots;
    }, [startDate, endDate]);

    const timeSlots = generateTimeSlots();

    // Group time slots by day for header rendering
    const dayGroups = useCallback(() => {
        const groups: { date: Date; slots: Date[]; startIdx: number }[] = [];
        let currentDay: Date | null = null;
        let currentGroup: Date[] = [];
        let startIdx = 0;
        let runningIdx = 0;

        timeSlots.forEach((slot, i) => {
            if (!currentDay || !isSameDay(currentDay, slot)) {
                if (currentGroup.length > 0) {
                    groups.push({ date: currentDay!, slots: currentGroup, startIdx });
                }
                currentDay = slot;
                currentGroup = [slot];
                startIdx = runningIdx;
            } else {
                currentGroup.push(slot);
            }
            runningIdx++;
        });
        if (currentGroup.length > 0) {
            groups.push({ date: currentDay!, slots: currentGroup, startIdx });
        }
        return groups;
    }, [timeSlots])();

    const isMultiDay = dayGroups.length > 1;

    const getEventPosition = (event: TimelineEvent) => {
        const startOffset = (new Date(event.startTime).getTime() - new Date(startDate).getTime()) / 3600000;
        const duration = (new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / 3600000;
        return {
            left: `${startOffset * HOUR_WIDTH}px`,
            width: `${Math.max(duration * HOUR_WIDTH - 4, 20)}px`,
        };
    };

    const openBookingModal = (roomId: string, slotTime: Date) => {
        const defaultEndTime = new Date(slotTime);
        defaultEndTime.setHours(defaultEndTime.getHours() + 1);
        setActiveRoomId(roomId);
        setSelectedEvent(null);
        setFormData({
            customerName: '',
            customerPhone: '',
            customerZalo: '',
            startTime: formatToInputDateTime(slotTime),
            endTime: formatToInputDateTime(defaultEndTime),
            status: 'confirmed',
            notes: '',
        });
        setTooltip(null);
        setIsModalOpen(true);
    };

    const openEditModal = (room: RoomTimeline, event: TimelineEvent) => {
        setActiveRoomId(room.id);
        setSelectedEvent(event);
        setFormData({
            customerName: event.customerName || '',
            customerPhone: event.customerPhone || '',
            customerZalo: event.customerZalo || '',
            startTime: formatToInputDateTime(event.startTime),
            endTime: formatToInputDateTime(event.endTime),
            status: event.status,
            notes: event.notes || '',
        });
        setIsModalOpen(true);
    };

    const handleEmptySlotClick = (roomId: string, slotTime: Date) => {
        openBookingModal(roomId, slotTime);
    };

    const handleSubmit = async () => {
        setIsUpdating(true);
        const isEdit = selectedEvent?.type === 'booking';
        const url = isEdit ? `/api/bookings/${selectedEvent!.id}` : `/api/bookings`;
        const method = isEdit ? 'PATCH' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, roomId: activeRoomId, isAdmin: true }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Thao tác thất bại');
            alert(isEdit ? 'Cập nhật thành công!' : 'Đặt phòng thành công!');
            window.location.reload();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const scrollTimeline = (dir: 'left' | 'right') => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir === 'left' ? -HOUR_WIDTH * 3 : HOUR_WIDTH * 3, behavior: 'smooth' });
        }
    };

    const activeRoom = rooms.find(r => r.id === activeRoomId);
    const isEdit = selectedEvent?.type === 'booking';
    const totalWidth = timeSlots.length * HOUR_WIDTH;

    return (
        <div className="relative">
            {/* Timeline Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Scroll Controls */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/60">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <span>
                            {formatDate(startDate)}
                            {isMultiDay && <> — {formatDate(endDate)}</>}
                        </span>
                        <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold">
                            {rooms.length} phòng
                        </span>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={() => scrollTimeline('left')} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <button onClick={() => scrollTimeline('right')} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto" ref={scrollRef}>
                    <div style={{ width: `${totalWidth + ROOM_COL_WIDTH}px`, minWidth: '100%' }}>

                        {/* === HEADER === */}
                        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
                            {/* Day row (only if multi-day) */}
                            {isMultiDay && (
                                <div className="flex" style={{ paddingLeft: `${ROOM_COL_WIDTH}px` }}>
                                    {dayGroups.map((group, gi) => {
                                        const isToday = isSameDay(group.date, new Date());
                                        return (
                                            <div
                                                key={gi}
                                                style={{ width: `${group.slots.length * HOUR_WIDTH}px` }}
                                                className={`flex-shrink-0 border-r border-gray-200 px-3 py-1.5 flex items-center gap-2
                                                    ${isToday ? 'bg-indigo-50' : 'bg-gray-50/80'}`}
                                            >
                                                <span className={`text-xs font-bold uppercase tracking-wider ${isToday ? 'text-indigo-600' : 'text-gray-500'}`}>
                                                    {DAY_NAMES[group.date.getDay()]}
                                                </span>
                                                <span className={`text-xs font-semibold ${isToday ? 'text-indigo-500' : 'text-gray-400'}`}>
                                                    {formatDate(group.date)}
                                                </span>
                                                {isToday && (
                                                    <span className="ml-auto text-[9px] font-bold bg-indigo-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                                                        Hôm nay
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Hour row */}
                            <div className="flex">
                                {/* Room label */}
                                <div
                                    className="flex-shrink-0 sticky left-0 z-40 bg-white border-r border-gray-200 flex items-center px-4"
                                    style={{ width: `${ROOM_COL_WIDTH}px` }}
                                >
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phòng</span>
                                </div>

                                {/* Hour cells */}
                                {timeSlots.map((slot, i) => {
                                    const isNewDay = i > 0 && !isSameDay(timeSlots[i - 1], slot);
                                    const isToday = isSameDay(slot, new Date());
                                    const isNoon = slot.getHours() === 12;
                                    return (
                                        <div
                                            key={i}
                                            style={{ width: `${HOUR_WIDTH}px` }}
                                            className={`flex-shrink-0 border-r flex flex-col items-center justify-center py-2 select-none
                                                ${isNewDay ? 'border-r-2 border-indigo-300' : 'border-gray-100'}
                                                ${isToday ? 'bg-indigo-50/40' : ''}`}
                                        >
                                            {/* Show day label on single-day view */}
                                            {!isMultiDay && i === 0 && (
                                                <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">
                                                    {DAY_NAMES[slot.getDay()]} {formatDate(slot)}
                                                </span>
                                            )}
                                            <span className={`text-xs font-bold tabular-nums
                                                ${isNoon ? 'text-orange-500' : isToday ? 'text-indigo-600' : 'text-gray-500'}`}>
                                                {formatHour(slot)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* === BODY === */}
                        <div className="max-h-[600px] overflow-y-auto">
                            {rooms.map((room, rowIdx) => (
                                <div
                                    key={room.id}
                                    className={`flex border-b border-gray-100 transition-colors hover:bg-slate-50/60 ${rowIdx % 2 === 0 ? '' : 'bg-gray-50/20'}`}
                                    style={{ height: `${ROW_HEIGHT}px` }}
                                >
                                    {/* Room info cell */}
                                    <div
                                        className="flex-shrink-0 sticky left-0 z-20 bg-white border-r border-gray-100 flex items-center px-4 gap-3"
                                        style={{ width: `${ROOM_COL_WIDTH}px` }}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-black text-indigo-600">
                                                {room.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate leading-tight">{room.name}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">{room.capacity} người</p>
                                        </div>
                                    </div>

                                    {/* Timeline cells */}
                                    <div
                                        className="relative flex-shrink-0"
                                        style={{ width: `${totalWidth}px`, height: `${ROW_HEIGHT}px` }}
                                    >
                                        {/* Background hour grid + clickable empty slots */}
                                        <div className="absolute inset-0 flex">
                                            {timeSlots.map((slot, i) => {
                                                const isNewDay = i > 0 && !isSameDay(timeSlots[i - 1], slot);
                                                const slotStart = new Date(slot);
                                                const slotEnd = new Date(slot);
                                                slotEnd.setHours(slotEnd.getHours() + 1);

                                                // Check if this slot is covered by any booking
                                                const isOccupied = room.events.some(ev =>
                                                    ev.type === 'booking' &&
                                                    ev.startTime < slotEnd &&
                                                    ev.endTime > slotStart
                                                );

                                                return (
                                                    <div
                                                        key={i}
                                                        style={{ width: `${HOUR_WIDTH}px` }}
                                                        className={`h-full border-r flex items-center justify-center cursor-pointer group/cell relative
                                                            ${isNewDay ? 'border-r-2 border-indigo-200' : 'border-gray-100/80'}
                                                            ${!isOccupied ? 'hover:bg-indigo-50/60' : ''}`}
                                                        onClick={() => !isOccupied && handleEmptySlotClick(room.id, slotStart)}
                                                    >
                                                        {!isOccupied && (
                                                            <div className="opacity-0 group-hover/cell:opacity-100 transition-all duration-150 flex flex-col items-center gap-0.5 pointer-events-none">
                                                                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-200">
                                                                    <PlusCircle className="w-3.5 h-3.5 text-white" />
                                                                </div>
                                                                <span className="text-[9px] font-bold text-indigo-500 whitespace-nowrap">
                                                                    Đặt phòng
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Booking events */}
                                        {room.events
                                            .filter(ev => ev.type === 'booking')
                                            .map(event => {
                                                const cfg = STATUS_CONFIG[event.status] || STATUS_CONFIG['confirmed'];
                                                const pos = getEventPosition(event);
                                                return (
                                                    <button
                                                        key={event.id}
                                                        onClick={() => openEditModal(room, event)}
                                                        style={{
                                                            left: pos.left,
                                                            width: pos.width,
                                                            top: '8px',
                                                            height: `${ROW_HEIGHT - 16}px`,
                                                        }}
                                                        className={`absolute z-10 rounded-xl border-0 px-2.5 py-1.5 text-left transition-all duration-150
                                                            ${cfg.bg} ${cfg.text}
                                                            hover:brightness-110 hover:shadow-lg hover:scale-[1.02] hover:z-20
                                                            shadow-sm flex flex-col justify-center overflow-hidden`}
                                                    >
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
                                                            <p className="text-[11px] font-bold truncate leading-none">
                                                                {event.customerName || 'Khách hàng'}
                                                            </p>
                                                        </div>
                                                        <p className="text-[9px] font-semibold opacity-75 pl-3">
                                                            {formatHour(new Date(event.startTime))} – {formatHour(new Date(event.endTime))}
                                                        </p>
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trạng thái:</span>
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                <div key={key} className="flex items-center gap-1.5">
                                    <div className={`w-2.5 h-2.5 rounded-full ${cfg.bg}`} />
                                    <span className="text-[10px] text-gray-500 font-medium">{cfg.label}</span>
                                </div>
                            ))}
                            <div className="flex items-center gap-1.5 ml-2">
                                <div className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-gray-300" />
                                <span className="text-[10px] text-gray-400 font-medium">Trống (click để đặt)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== BOOKING MODAL ===== */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)' }}
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in"
                        style={{ animation: 'modalIn 0.2s cubic-bezier(.34,1.56,.64,1)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className={`relative px-7 pt-7 pb-6 ${isEdit
                            ? 'bg-gradient-to-br from-indigo-600 to-violet-700'
                            : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                                            {isEdit
                                                ? <Clock className="w-4 h-4 text-white" />
                                                : <PlusCircle className="w-4 h-4 text-white" />}
                                        </div>
                                        <span className="text-xs font-bold text-white/60 uppercase tracking-widest">
                                            {isEdit ? 'Chỉnh sửa booking' : 'Đặt phòng mới'}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">
                                        {isEdit ? (selectedEvent?.customerName || 'Cập nhật') : 'Đặt phòng'}
                                    </h2>
                                    {activeRoom && (
                                        <p className="text-sm text-white/70 mt-1 font-medium">
                                            📍 {activeRoom.name} · {activeRoom.capacity} người · {activeRoom.pricePerHour.toLocaleString('vi-VN')}đ/giờ
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors mt-1"
                                >
                                    <XCircle className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="px-7 py-6 space-y-5">
                            {/* Customer Name */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                    Tên khách hàng *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-50 transition-all placeholder:text-gray-300"
                                        value={formData.customerName}
                                        onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                        placeholder="VD: Anh Minh"
                                    />
                                </div>
                            </div>

                            {/* Phone + Status row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                        Số điện thoại
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="tel"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-50 transition-all placeholder:text-gray-300"
                                            value={formData.customerPhone}
                                            onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                            placeholder="090..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                        Trạng thái
                                    </label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-50 transition-all appearance-none cursor-pointer"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="pending">⏳ Chờ xử lý</option>
                                        <option value="confirmed">✅ Xác nhận</option>
                                        <option value="completed">🏁 Hoàn thành</option>
                                        <option value="cancelled">❌ Hủy đơn</option>
                                    </select>
                                </div>
                            </div>

                            {/* Time range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                        Giờ vào
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-50 transition-all"
                                        value={formData.startTime}
                                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                        Giờ ra
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-50 transition-all"
                                        value={formData.endTime}
                                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Time preview chip */}
                            {formData.startTime && formData.endTime && (
                                <div className="flex items-center gap-2 bg-indigo-50 rounded-xl px-4 py-2.5">
                                    <Clock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                                    <span className="text-xs text-indigo-600 font-semibold">
                                        {(() => {
                                            const diff = (new Date(formData.endTime).getTime() - new Date(formData.startTime).getTime()) / 3600000;
                                            return diff > 0 ? `${diff} tiếng · Tổng: ${activeRoom ? (diff * activeRoom.pricePerHour).toLocaleString('vi-VN') : '—'}đ` : 'Thời gian không hợp lệ';
                                        })()}
                                    </span>
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                    Ghi chú
                                </label>
                                <textarea
                                    rows={2}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-50 transition-all resize-none placeholder:text-gray-300"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Yêu cầu đặc biệt, lưu ý thêm..."
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-7 pb-7 flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isUpdating || !formData.customerName.trim()}
                                className={`flex-[2] py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                                    ${isEdit
                                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-indigo-200'
                                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-200'
                                    }`}
                            >
                                {isUpdating
                                    ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    : <Save className="w-4 h-4" />}
                                {isEdit ? 'Lưu thay đổi' : 'Xác nhận đặt phòng'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.92) translateY(12px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
