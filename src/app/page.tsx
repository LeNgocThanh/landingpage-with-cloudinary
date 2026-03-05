'use client';

import { useState, useEffect } from 'react';
import { Clock, Wifi, Wind, Tv, Coffee, Shield, QrCode, Sparkles, TrendingUp, Heart, Star } from 'lucide-react';
import BookingModal from '@/components/BookingModal';
import RoomCard from '@/components/RoomCard';

interface Room {
  id: string;
  name: string;
  description: string;
  pricePerHour: number;
  capacity: number;
  status: string;
  images: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
  }>;
  amenities: Array<{
    amenity: {
      id: string;
      name: string;
      icon: string | null;
    };
  }>;
}

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const next60Min = new Date(now.getTime() + 60 * 60000);

      // Lấy danh sách phòng
      const resRooms = await fetch('/api/rooms');
      const roomsData = await resRooms.json();

      // Lấy timeline để check trạng thái thực tế
      const resTimeline = await fetch(
        `/api/timeline?startDate=${now.toISOString()}&endDate=${next60Min.toISOString()}`
      );
      const timelineRes = await resTimeline.json();

      setRooms(roomsData);
      setTimelineData(timelineRes.rooms || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

        {/* Animated circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-white text-sm font-medium">Hệ thống tự động hóa thông minh</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-white">
              Homestay Hiện Đại
            </h1>
            <p className="text-xl sm:text-2xl mb-4 text-blue-100 max-w-3xl mx-auto">
              Trải nghiệm thuê phòng theo giờ thông minh
            </p>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto mb-12">
              Quy trình <span className="font-bold text-white">"3 Không"</span> - Không lễ tân, không chờ đợi, không chìa khóa
            </p>

            {/* 3 Không Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Không Lễ Tân</h3>
                <p className="text-blue-100 leading-relaxed">Tự động hóa hoàn toàn, tiết kiệm thời gian</p>
              </div>

              <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Không Chờ Đợi</h3>
                <p className="text-blue-100 leading-relaxed">Check-in tức thì, sẵn sàng sử dụng ngay</p>
              </div>

              <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Không Chìa Khóa</h3>
                <p className="text-blue-100 leading-relaxed">Mã số/QR thông minh, an toàn tuyệt đối</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248 250 252)" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">98%</p>
                <p className="text-sm text-gray-600">Tỷ lệ hài lòng</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">1000+</p>
                <p className="text-sm text-gray-600">Khách hàng tin tưởng</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-100 rounded-xl">
                <Star className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">4.9/5</p>
                <p className="text-sm text-gray-600">Đánh giá trung bình</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-indigo-700 text-sm font-semibold uppercase tracking-wide">Phòng của chúng tôi</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Khám Phá Các Phòng
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Chọn phòng phù hợp với nhu cầu của bạn. Mỗi phòng được thiết kế với sự thoải mái và tiện nghi tối đa.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
                <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-2/3 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-xl text-gray-600 mb-2">
              Chưa có phòng nào
            </p>
            <p className="text-gray-500">
              Vui lòng quay lại sau!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => {
              // Tìm timeline của phòng này
              const roomTimeline = timelineData.find(t => t.id === room.id);
              return (
                <RoomCard
                  key={room.id}
                  room={room}
                  timelineEvents={roomTimeline?.events || []} // Truyền events vào
                  onBook={() => handleBookRoom(room)}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-indigo-700 text-sm font-semibold uppercase tracking-wide">Tiện nghi</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Tiện Nghi Hiện Đại
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Đầy đủ tiện nghi cho kỳ nghỉ hoàn hảo của bạn
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Wifi, name: 'WiFi Tốc Độ Cao', desc: '100 Mbps' },
              { icon: Wind, name: 'Điều Hòa', desc: 'Điều hòa tất cả các mùa' },
              { icon: Tv, name: 'Truyền hình bản quyền', desc: 'Netflix, YouTube' },
              { icon: Coffee, name: 'Minibar', desc: 'Đồ ăn uống có sẵn trong tủ' },
            ].map((amenity, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-indigo-100"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                    <amenity.icon className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{amenity.name}</h3>
                  <p className="text-sm text-gray-600">{amenity.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Sẵn Sàng Trải Nghiệm?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Đặt phòng ngay hôm nay và tận hưởng những trải nghiệm tuyệt vời với hệ thống tự động hóa thông minh và bảo mật
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                const roomsSection = document.querySelector('#rooms-section');
                roomsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-50 transition-all hover:scale-105 shadow-xl"
            >
              Xem Phòng và đặt phòng ngay
            </button>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Nút Xem Lịch - Chuyển hướng đến /timeline */}
              <a
                href="/timeline"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-xl font-semibold hover:bg-white/20 transition-all hover:scale-105 text-center min-w-[200px]"
              >
                Xem Lịch các phòng
              </a>

              {/* Cụm nút Liên Hệ */}
              <div className="relative">
                <button
                  onClick={() => setIsContactOpen(!isContactOpen)}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-xl font-semibold hover:bg-white/20 transition-all hover:scale-105 min-w-[200px]"
                >
                  Liên Hệ
                </button>

                {/* Dropdown Menu Liên Hệ - Đã fix lỗi hiển thị */}
                {isContactOpen && (
                  <>
                    {/* Overlay trong suốt để click ra ngoài là đóng menu */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsContactOpen(false)}></div>

                    <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-[300px] bg-white rounded-2xl shadow-2xl p-4 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
                      <a href="https://zalo.me/0965537138" target="_blank" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors border border-gray-100">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">Z</div>
                        <span className="font-semibold text-gray-700 text-sm">Zalo</span>
                      </a>

                      <a href="https://m.me/0966880820" target="_blank" className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors border border-gray-100">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold shrink-0">M</div>
                        <span className="font-semibold text-gray-700 text-sm">Inbox</span>
                      </a>

                      <a href="https://maps.app.goo.gl/S6Dcj1NsRH5PowaF7" target="_blank" className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors border border-gray-100">
                        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold shrink-0">G</div>
                        <span className="font-semibold text-gray-700 text-sm">Maps</span>
                      </a>

                      <a href="https://www.facebook.com/share/14U4dvEbHb1/?mibextid=wwXIfr" target="_blank" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors border border-gray-100">
                        <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center text-white font-bold shrink-0">F</div>
                        <span className="font-semibold text-gray-700 text-sm">Page</span>
                      </a>

                      <button
                        onClick={() => setIsContactOpen(false)}
                        className="col-span-2 mt-2 py-2 text-sm font-medium text-gray-400 hover:text-red-500 transition-colors border-t border-gray-100"
                      >
                        Đóng menu
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedRoom(null);
          }}
        />
      )}
    </div>
  );
}
