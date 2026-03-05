'use client';

import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangePickerProps {
    startDate: Date;
    endDate: Date;
    onDateChange: (start: Date, end: Date) => void;
    showDays: 1 | 2;
    onShowDaysChange: (days: 1 | 2) => void;
}

export default function DateRangePicker({
    startDate,
    endDate,
    onDateChange,
    showDays,
    onShowDaysChange,
}: DateRangePickerProps) {
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 1);

    const handlePreviousDay = () => {
        const newStart = new Date(startDate);
        newStart.setDate(newStart.getDate() - 1);
        if (newStart < today) return;
        const newEnd = new Date(newStart);
        if (showDays === 2) {
            newEnd.setDate(newEnd.getDate() + 1);
        }
        newEnd.setHours(23, 59, 59, 999);
        onDateChange(newStart, newEnd);
    };



    const handleNextDay = () => {
        const newStart = new Date(startDate);
        newStart.setDate(newStart.getDate() + 1);
        if (newStart > maxDate) return;
        const newEnd = new Date(newStart);
        if (showDays === 2) {
            newEnd.setDate(newEnd.getDate() + 1);
        }
        newEnd.setHours(23, 59, 59, 999);
        onDateChange(newStart, newEnd);
    };

    const handleToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(today);
        if (showDays === 2) {
            end.setDate(end.getDate() + 1);
        }
        end.setHours(23, 59, 59, 999);
        onDateChange(today, end);
    };

    const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let selectedDate = new Date(e.target.value);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < today) selectedDate = today;
        if (selectedDate > maxDate) selectedDate = maxDate;

        const newEnd = new Date(selectedDate);
        if (showDays === 2) {
            newEnd.setDate(newEnd.getDate() + 1);
        }
        newEnd.setHours(23, 59, 59, 999);
        onDateChange(selectedDate, newEnd);
    };

    const handleShowDaysChange = (days: 1 | 2) => {
        onShowDaysChange(days);
        const newEnd = new Date(startDate);
        if (days === 2) {
            newEnd.setDate(newEnd.getDate() + 1);
        }
        newEnd.setHours(23, 59, 59, 999);
        onDateChange(startDate, newEnd);
    };

    const isToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        return today.getTime() === start.getTime();
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Date Navigation */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePreviousDay}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Previous day"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>

                    <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-xl border border-indigo-100">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        <span className="font-semibold text-gray-900">
                            {formatDate(startDate)}
                            {showDays === 2 && (
                                <>
                                    <span className="mx-2 text-gray-400">→</span>
                                    {formatDate(endDate)}
                                </>
                            )}
                        </span>
                    </div>

                    <button
                        onClick={handleNextDay}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Next day"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                    {/* Custom Date Picker */}
                    <input
                        type="date"
                        min={today.toISOString().split('T')[0]}
                        max={maxDate.toISOString().split('T')[0]}
                        value={startDate.toISOString().split('T')[0]}
                        onChange={handleDateInputChange}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                    />

                    {/* Today Button */}
                    <button
                        onClick={handleToday}
                        disabled={isToday()}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${isToday()
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                            }`}
                    >
                        Hôm nay
                    </button>

                    {/* Show Days Toggle */}
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => handleShowDaysChange(1)}
                            className={`px-4 py-1.5 rounded-md font-medium transition-all ${showDays === 1
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            1 Ngày
                        </button>
                        <button
                            onClick={() => handleShowDaysChange(2)}
                            className={`px-4 py-1.5 rounded-md font-medium transition-all ${showDays === 2
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            2 Ngày
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
