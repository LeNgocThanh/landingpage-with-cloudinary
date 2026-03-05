'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Home, Calendar, Settings, Plus } from 'lucide-react';
import RoomManagement from '@/components/admin/RoomManagement';
import BookingManagement from '@/components/admin/BookingManagement';
import AmenityManagement from '@/components/admin/AmenityManagement';
import Link from "next/link";

type Tab = 'rooms' | 'bookings' | 'settings' | 'timeLine' | 'report';

export default function AdminPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('rooms');
    const [admin, setAdmin] = useState<any>(null);

    useEffect(() => {
        // Check if admin is logged in
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (!response.ok) {
                    router.push('/admin/login');
                } else {
                    const data = await response.json();
                    setAdmin(data.admin);
                }
            } catch (error) {
                router.push('/admin/login');
            }
        };

        checkAuth();
    }, [router]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/admin/login');
    };

    if (!admin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <Home className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                                <p className="text-sm text-gray-500">Quản lý homestay</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                Xin chào, <span className="font-semibold">{admin.username}</span>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('rooms')}
                            className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors ${activeTab === 'rooms'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Home className="w-5 h-5" />
                            Quản lý phòng
                        </button>
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors ${activeTab === 'bookings'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Calendar className="w-5 h-5" />
                            Đặt phòng
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors ${activeTab === 'settings'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Settings className="w-5 h-5" />
                           Tiện ích
                        </button>
                        <Link
                            href="/admin/timeLine"
                            className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors border-transparent text-gray-500 hover:text-gray-700 }`}
                        >
                            <Settings className="w-5 h-5" />
                            Sang trang thời gian thực
                        </Link>
                        <Link
                            href="/admin/RoomReport"
                            className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors border-transparent text-gray-500 hover:text-gray-700 }`}
                        >
                            <Settings className="w-5 h-5" />
                            Báo cáo tổng hợp
                        </Link>
                    </nav>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'rooms' && <RoomManagement />}
                {activeTab === 'bookings' && <BookingManagement />}
                {activeTab === 'settings' && <AmenityManagement />}
            </main>
        </div>
    );
}
