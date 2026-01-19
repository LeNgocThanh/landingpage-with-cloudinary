"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, X, Phone, Mail, Send, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {sendTelegramMessage, sendNotificationAction, sendEmail} from "@/lib/sendOuter"

export default function FloatingContact() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const labels = useMemo(
    () => ({
      labelName: "Họ và tên *",
      phName: "Nhập họ và tên",
      labelEmail: "Email",
      phEmail: "Email",
      labelPhone: "Số điện thoại *",
      phPhone: "Số điện thoại",
      labelSubject: "Chủ đề *",
      phSubject: "Nhập chủ đề",
      labelMessage: "Tin nhắn *",
      phMessage: "Nhập tin nhắn của bạn",
      btnSend: "Gửi tin nhắn",
      submitErr: "Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.",
    }),
    []
  );

  useEffect(() => setMounted(true), []);

  // khóa scroll body khi mở
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    const onSet = (e: any) => {
      if (e?.detail?.message) {
        setFormData((prev) => ({
          ...prev,
          message: String(e.detail.message),
          subject: e.detail.title ? String(e.detail.title) : prev.subject,
        }));
      }
      setIsOpen(true);
    };

    const onOpen = () => setIsOpen(true);

    window.addEventListener("set-floating-contact-message", onSet);
    window.addEventListener("open-floating-contact", onOpen);

    return () => {
      window.removeEventListener("set-floating-contact-message", onSet);
      window.removeEventListener("open-floating-contact", onOpen);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(false);

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => null);
      await sendTelegramMessage(JSON.stringify(formData));

      await sendEmail('leu.may.moc.chau@gmail.com', 'khách hàng gửi tin', JSON.stringify(formData))

      // const result = await sendNotificationAction({
      //   message: "Chào bạn từ website!",
      //   email: "khachhang@gmail.com"
      // });

      if (data?.success) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({ name: "", email: "", phone: "", company: "", subject: "", message: "" });
        }, 2500);
      } else {
        alert(labels.submitErr);
      }
    } catch {
      alert(labels.submitErr);
    }
  };

  if (!mounted) return null;

  // ✅ IMPORTANT: Portal ra thẳng body => không bị "transfer" theo container blur/transform
  return createPortal(
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/35"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dock fixed to viewport */}
      <div
        className="fixed bottom-6 right-6 z-[9999]"
        style={{
          // “chốt” vào viewport, tránh bị ancestor gây stacking context kỳ lạ
          position: "fixed",
          right: 24,
          bottom: 24,
        }}
      >
        {/* Card */}
        {isOpen && (
          <Card className="w-[92vw] max-w-[420px] mb-4 shadow-2xl border-green-100 overflow-hidden">
            <CardContent className="p-6 bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-green-700">Liên hệ nhanh</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-full hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {isSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <p className="font-medium text-gray-800">Gửi tin nhắn thành công!</p>
                  <p className="text-sm text-gray-500">Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">
                        {labels.labelName}
                      </label>
                      <Input
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={labels.phName}
                        className="h-9"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">
                          {labels.labelPhone}
                        </label>
                        <Input
                          name="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder={labels.phPhone}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">
                          {labels.labelEmail}
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder={labels.phEmail}
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">
                        {labels.labelSubject}
                      </label>
                      <Input
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder={labels.phSubject}
                        className="h-9"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">
                        {labels.labelMessage}
                      </label>
                      <Textarea
                        name="message"
                        required
                        rows={3}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder={labels.phMessage}
                        className="resize-none"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold">
                    <Send className="w-4 h-4 mr-2" />
                    {labels.btnSend}
                  </Button>
                </form>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-2 text-[11px] font-medium">
                  <a
                    href="tel:+84966666598"
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-green-50 text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <Phone className="w-4 h-4 mb-1" />
                    Gọi ngay
                  </a>
                  <a
                    href="https://zalo.me/0966666598"
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 mb-1" />
                    Zalo
                  </a>
                  <a
                    href="mailto:leu.may.moc.chau@gmail.com"
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Mail className="w-4 h-4 mb-1" />
                    Email
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Floating button */}
        <Button
          onClick={() => setIsOpen((v) => !v)}
          className={`rounded-full w-14 h-14 shadow-2xl transition-all duration-300 ${
            isOpen ? "bg-red-500 hover:bg-red-600 rotate-90" : "bg-green-600 hover:bg-green-700"
          }`}
          size="icon"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </div>
    </>,
    document.body
  );
}
