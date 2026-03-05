import { google } from 'googleapis';
import { BookingEmailData } from './email';

export const appendToGoogleSheet = async (data: BookingEmailData) => {
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    if (!privateKey || !clientEmail || !spreadsheetId) {
        console.warn('Google Sheets credentials not configured');
        return { success: false, error: 'Not configured' };
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        const values = [
            [
                new Date().toLocaleString('vi-VN'),
                data.customerName,
                data.customerPhone,
                data.customerZalo || '',
                data.roomName,
                data.startTime,
                data.endTime,
            ],
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:G',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        });

        return { success: true };
    } catch (error) {
        console.error('Google Sheets error:', error);
        return { success: false, error };
    }
};
