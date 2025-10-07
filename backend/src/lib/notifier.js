"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendSMS = sendSMS;
const nodemailer_1 = __importDefault(require("nodemailer"));
const twilio_1 = __importDefault(require("twilio"));
const prisma_1 = require("@lib/prisma");
async function sendEmail(to, subject, text) {
    const config = await prisma_1.prisma.systemConfig.findMany();
    const smtpHost = config.find((c) => c.key === 'smtp_host')?.value;
    const smtpPort = Number(config.find((c) => c.key === 'smtp_port')?.value || 587);
    const smtpUser = config.find((c) => c.key === 'smtp_user')?.value;
    const smtpPass = config.find((c) => c.key === 'smtp_password')?.value;
    const smtpSender = config.find((c) => c.key === 'smtp_sender')?.value;
    if (!smtpHost || !smtpUser || !smtpPass) {
        console.log("Skipping email send, SMTP not configured");
        return;
    }
    const transporter = nodemailer_1.default.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
    });
    await transporter.sendMail({
        from: smtpSender,
        to,
        subject,
        text,
    });
}
async function sendSMS(to, text) {
    const config = await prisma_1.prisma.systemConfig.findMany();
    const sid = config.find((c) => c.key === 'sms_sid')?.value;
    const token = config.find((c) => c.key === 'sms_token')?.value;
    const from = config.find((c) => c.key === 'sms_from')?.value;
    if (!sid || !token || !from) {
        console.log("Skipping SMS send, Twilio not configured");
        return;
    }
    const client = (0, twilio_1.default)(sid, token);
    await client.messages.create({
        body: text,
        from,
        to,
    });
}
