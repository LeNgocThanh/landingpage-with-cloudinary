import axios from 'axios';
import { BookingEmailData } from './email';

export const sendTelegramNotification = async (data: BookingEmailData) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.warn('Telegram credentials not configured');
        return { success: false, error: 'Not configured' };
    }

    const message = `
🏠 *ĐẶT PHÒNG MỚI*

👤 *Khách hàng:* ${data.customerName}
📱 *Số điện thoại:* ${data.customerPhone}
${data.customerZalo ? `💬 *Zalo:* ${data.customerZalo}` : ''}
🛏️ *Loại phòng:* ${data.roomName}
⏰ *Thời gian:* ${data.startTime} - ${data.endTime}

_Vui lòng liên hệ khách hàng sớm nhất có thể!_
  `.trim();

    try {
        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
        });
        return { success: true };
    } catch (error) {
        console.error('Telegram error:', error);
        return { success: false, error };
    }
};
