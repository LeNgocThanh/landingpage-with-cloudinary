// lib/telegram.ts
'use server'
import nodemailer from 'nodemailer';

export async function sendTelegramMessage(text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_GROUP_ID;
  
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
  
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text }),
    });
  
    if (!response.ok) {
      throw new Error('Failed to send Telegram message');
    }
  
    return await response.json();
  }

  export async function sendEmail(to: string, subject: string, html: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };
  
    return await transporter.sendMail(mailOptions);
  }

  export async function sendNotificationAction(formData: { message: string, email: string }) {
    try {
      // Logic gửi Telegram
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_GROUP_ID;
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: formData.message }),
      });
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  }