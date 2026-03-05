import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export interface BookingEmailData {
    customerName: string;
    customerPhone: string;
    customerZalo?: string;
    roomName: string;
    startTime: string;
    endTime: string;
}

export const sendBookingEmail = async (data: BookingEmailData) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        subject: `Đặt phòng mới từ ${data.customerName}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Thông tin đặt phòng mới</h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
          <p><strong>Tên khách hàng:</strong> ${data.customerName}</p>
          <p><strong>Số điện thoại:</strong> ${data.customerPhone}</p>
          ${data.customerZalo ? `<p><strong>Zalo:</strong> ${data.customerZalo}</p>` : ''}
          <p><strong>Loại phòng:</strong> ${data.roomName}</p>
          <p><strong>Thời gian:</strong> ${data.startTime} - ${data.endTime}</p>
        </div>
        <p style="margin-top: 20px; color: #666;">
          Vui lòng liên hệ khách hàng sớm nhất có thể để xác nhận đặt phòng.
        </p>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email error:', error);
        return { success: false, error };
    }
};
