import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Azmera <notifications@azmera.com>'; // Update with verified domain

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
    if (!process.env.RESEND_API_KEY) {
        // Email service not configured - skip sending
        return { success: true, mock: true };
    }

    try {
        const data = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            html,
        });

        return { success: true, data };
    } catch (error) {
        // Email sending failed - return error without logging
        return { success: false, error };
    }
}
