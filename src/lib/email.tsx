
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

export const sendEmail = async ({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) => {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[EMAIL SIMULATION] To: ${to} | Subject: ${subject}`);
        console.log(`[EMAIL BODY]: ${html}`);
        return { success: true, simulated: true };
    }

    try {
        const data = await resend.emails.send({
            from: 'MedFlow <onboarding@resend.dev>',
            to,
            subject,
            html,
        });
        return { success: true, data };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error };
    }
};
