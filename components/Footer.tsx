'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'
import { useEffect } from 'react'

const FB_PAGE_URL = 'https://www.facebook.com/leumay.mocchau'
const FB_PAGE_NAME = ''

export default function Footer() { 
  useEffect(() => {
    if (document.getElementById("fb-sdk")) return;
    const s = document.createElement("script");
    s.id = "fb-sdk";
    s.async = true;
    s.defer = true;
    s.crossOrigin = "anonymous";
    s.src = "https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v19.0";
    document.body.appendChild(s);
  }, []);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Thông tin công ty */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="ml-2 text-xl font-bold uppercase">
                LỀU MÂY Retreat-Glamping-Coffee
              </span>
            </div>
            <div className="fb-page"
              data-href={FB_PAGE_URL}
              data-tabs=""
              data-width="280"
              data-height=""
              data-small-header="true"
              data-adapt-container-width="true"
              data-hide-cover="false"
              data-show-facepile="false">
              <blockquote cite={FB_PAGE_URL} className="fb-xfbml-parse-ignore">
                <a href={FB_PAGE_URL} target="_blank" rel="noopener noreferrer">{FB_PAGE_NAME}</a>
              </blockquote>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Chúng tôi cam kết mang đến những dịch vụ, trải ngiệm tốt nhất cho khách hàng.
            </p>
          </div>

          {/* Liên kết nhanh */}
          {/* <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-green-400 transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/woods" className="text-gray-300 hover:text-green-400 transition-colors">
                  Sản phẩm gỗ
                </Link>
              </li>
              <li>
                <Link href="/agricultural-products" className="text-gray-300 hover:text-green-400 transition-colors">
                  Sản phẩm nông sản
                </Link>
              </li>
              <li>
                <Link href="/networks" className="text-gray-300 hover:text-green-400 transition-colors">
                  Công ty liên kết
                </Link>
              </li>
              <li>
                <Link href="/trends" className="text-gray-300 hover:text-green-400 transition-colors">
                  Bài viết
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-green-400 transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div> */}

          {/* Thông tin liên hệ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Thông tin liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-3 mt-1 text-green-400 shrink-0" />
                <span className="text-gray-300 text-sm">
                  Thung lũng Mận Mu Náu, Tiểu khu 10, Thị trấn Mộc châu, Mộc Châu
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-green-400 shrink-0" />
                <span className="text-gray-300 text-sm">
                  +84 0966666598
                </span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-green-400 shrink-0" />
                <span className="text-gray-300 text-sm">
                   leu.may.moc.chau@gmail.com
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-gray-400 text-sm text-center md:text-left">
              ©2025 LỀU MÂY Retreat-Glamping-Coffee. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}