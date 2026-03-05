'use client';

import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangePickerProps {
    startDate: Date;
    endDate: Date;
    onDateChange: (start: Date, end: Date) => void;
    showDays: 1 | 2 | 7;
    onShowDaysChange: (days: 1 | 2 | 7) => void;
}

const DAY_LABELS: Record<number, string> = { 0: 'CN', 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7' };

export default function DateRangePicker({
    startDate,
    endDate,
    onDateChange,
    showDays,
    onShowDaysChange,
}: DateRangePickerProps) {

    const formatDateLabel = (date: Date) =>
        date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const getDayLabel = (date: Date) => DAY_LABELS[date.getDay()];

    // Mini week preview chips (for 7-day view)
    const getWeekDays = () => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            return d;
        });
    };

    const shiftDays = (delta: number) => {
        const newStart = new Date(startDate);
        newStart.setDate(newStart.getDate() + delta);
        newStart.setHours(0, 0, 0, 0);
        const newEnd = new Date(newStart);
        newEnd.setDate(newEnd.getDate() + (showDays - 1));
        newEnd.setHours(23, 59, 59, 999);
        onDateChange(newStart, newEnd);
    };

    const handleToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(today);
        end.setDate(end.getDate() + (showDays - 1));
        end.setHours(23, 59, 59, 999);
        onDateChange(today, end);
    };

    const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = new Date(e.target.value);
        selected.setHours(0, 0, 0, 0);
        const newEnd = new Date(selected);
        newEnd.setDate(newEnd.getDate() + (showDays - 1));
        newEnd.setHours(23, 59, 59, 999);
        onDateChange(selected, newEnd);
    };

    const handleShowDaysChange = (days: 1 | 2 | 7) => {
        onShowDaysChange(days);
        const newEnd = new Date(startDate);
        newEnd.setDate(newEnd.getDate() + (days - 1));
        newEnd.setHours(23, 59, 59, 999);
        onDateChange(startDate, newEnd);
    };

    const isToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        return today.getTime() === s.getTime();
    };

    const weekDays = showDays === 7 ? getWeekDays() : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            {/* Main Controls Row */}
            <div className="flex flex-col lg:flex-row gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

                {/* LEFT: Navigation */}
                <div className="flex items-center gap-3 px-5 py-4">
                    <button
                        onClick={() => shiftDays(-showDays)}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-indigo-100 flex items-center justify-center transition-colors group"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-indigo-600" />
                    </button>

                    <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 min-w-0">
                        <Calendar className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <div className="text-sm font-bold text-gray-800 whitespace-nowrap">
                            <span className="text-indigo-600 font-black">{getDayLabel(startDate)}</span>
                            {' '}
                            {formatDateLabel(startDate)}
                            {showDays > 1 && (
                                <>
                                    <span className="mx-2 text-gray-300">→</span>
                                    <span className="text-indigo-600 font-black">{getDayLabel(endDate)}</span>
                                    {' '}
                                    {formatDateLabel(endDate)}
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => shiftDays(showDays)}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-indigo-100 flex items-center justify-center transition-colors group"
                        aria-label="Next"
                    >
                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-600" />
                    </button>
                </div>

                {/* CENTER: Date input + today */}
                <div className="flex items-center gap-3 px-5 py-4">
                    <input
                        type="date"
                        value={startDate.toISOString().split('T')[0]}
                        onChange={handleDateInputChange}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-xl hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-700 font-medium cursor-pointer"
                    />
                    <button
                        onClick={handleToday}
                        disabled={isToday()}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                            ${isToday()
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 active:scale-95'}`}
                    >
                        Hôm nay
                    </button>
                </div>

                {/* RIGHT: View toggle */}
                <div className="flex items-center gap-2 px-5 py-4 ml-auto">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Xem:</span>
                    <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-0.5">
                        {([1, 2, 7] as const).map((d) => (
                            <button
                                key={d}
                                onClick={() => handleShowDaysChange(d)}
                                className={`px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                                    ${showDays === d
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                {d === 1 ? '1 Ngày' : d === 2 ? '2 Ngày' : '7 Ngày'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 7-Day mini calendar strip */}
            {weekDays && (
                <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-3">
                    <div className="flex gap-1.5 items-center overflow-x-auto">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2 flex-shrink-0">Tuần này:</span>
                        {weekDays.map((day, i) => {
                            const isCurrentToday = day.getTime() === today.getTime();
                            const isSat = day.getDay() === 6;
                            const isSun = day.getDay() === 0;
                            return (
                                <button
                                    key={i}
                                    onClick={() => {
                                        const newStart = new Date(day);
                                        newStart.setHours(0, 0, 0, 0);
                                        const newEnd = new Date(newStart);
                                        newEnd.setDate(newEnd.getDate() + 6);
                                        newEnd.setHours(23, 59, 59, 999);
                                        onDateChange(newStart, newEnd);
                                    }}
                                    className={`flex flex-col items-center px-3 py-1.5 rounded-xl flex-shrink-0 transition-all group
                                        ${isCurrentToday
                                            ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200'
                                            : 'bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200'}`}
                                >
                                    <span className={`text-[9px] font-black uppercase tracking-wider leading-none mb-0.5
                                        ${isCurrentToday ? 'text-indigo-200' : isSat || isSun ? 'text-red-400' : 'text-gray-400'}`}>
                                        {DAY_LABELS[day.getDay()]}
                                    </span>
                                    <span className={`text-sm font-black leading-none
                                        ${isCurrentToday ? 'text-white' : isSat || isSun ? 'text-red-500' : 'text-gray-700'}`}>
                                        {day.getDate()}
                                    </span>
                                    <span className={`text-[8px] font-medium leading-none mt-0.5
                                        ${isCurrentToday ? 'text-indigo-200' : 'text-gray-400'}`}>
                                        T{day.getMonth() + 1}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
