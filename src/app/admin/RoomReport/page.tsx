'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Clock, DollarSign } from 'lucide-react';

export default function RoomReport() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mặc định tháng hiện tại
  const now = new Date();
  const [dateRange, setDateRange] = useState({
    start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  });

  const fetchReport = async () => {
    setLoading(true);
    const res = await fetch(`/api/reports/rooms?startDate=${dateRange.start}&endDate=${dateRange.end}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => { fetchReport(); }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 className="text-indigo-600" /> Báo cáo hiệu suất phòng
        </h1>
        <div className="flex items-center gap-3">
          <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="border rounded-lg p-2 text-sm" />
          <span>đến</span>
          <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="border rounded-lg p-2 text-sm" />
          <button onClick={fetchReport} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">Lọc</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => (
          <div key={item.roomId} className="bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition">
            <div className="border-b pb-3 mb-4 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">{item.roomName}</h3>
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">ID: {item.roomId.slice(-4)}</span>
            </div>

            <div className="space-y-4">
              {/* Tài chính */}
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Thực thu (Completed)</p>
                  <p className="text-xl font-bold text-green-600">{item.summary.totalRevenue.toLocaleString()}đ</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase">Dự kiến thu</p>
                  <p className="text-lg font-semibold text-gray-700">{item.summary.expectedRevenue.toLocaleString()}đ</p>
                </div>
              </div>

              {/* Lượt đặt */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-dashed">
                <div className="text-center">
                  <p className="text-sm font-bold text-blue-600">{item.summary.completed}</p>
                  <p className="text-[10px] text-gray-400 uppercase">Xong</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-green-600">{item.summary.confirmed}</p>
                  <p className="text-[10px] text-gray-400 uppercase">Đã duyệt</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-yellow-600">{item.summary.pending}</p>
                  <p className="text-[10px] text-gray-400 uppercase">Chờ</p>
                </div>
              </div>

              {/* Cao điểm */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">Giờ cao điểm:</span>
                  <span className="text-gray-800">{item.peakHours.join(', ') || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">Ngày cao điểm:</span>
                  <span className="text-gray-800">{item.peakDays.join(', ') || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}