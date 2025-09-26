import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { prisma } from '@lib/prisma';

export async function sendEmail(to: string, subject: string, text: string) {
    const config = await prisma.systemConfig.findMany();
    const smtpHost = config.find((c) => c.key === 'smtp_host')?.value;
    const smtpPort = Number(config.find((c) => c.key === 'smtp_port')?.value || 587);
    const smtpUser = config.find((c) => c.key === 'smtp_user')?.value;
    const smtpPass = config.find((c) => c.key === 'smtp_password')?.value;
    if (!smtpHost || !smtpUser || !smtpPass) {
        console.log("Skipping email send, SMTP not configured");
        return;
    }
    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
        from: smtpUser,
        to,
        subject,
        text,
    });
}

export async function sendSMS(to: string, text: string) {
    const config = await prisma.systemConfig.findMany();
    const sid = config.find((c) => c.key === 'sms_sid')?.value;
    const token = config.find((c) => c.key === 'sms_token')?.value;
    const from = config.find((c) => c.key === 'sms_from')?.value;
    if (!sid || !token || !from) {
        console.log("Skipping SMS send, Twilio not configured");
        return;
    }
    const client = twilio(sid, token);
    await client.messages.create({
        body: text,
        from,
        to,
    });
}
