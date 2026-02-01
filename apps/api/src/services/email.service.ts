import nodemailer from "nodemailer";

import { env } from "../config/env.js";

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: false, // Brevo uses STARTTLS on port 587
      auth: env.SMTP_USER
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          }
        : undefined,
    });
  }

  // ─────────────────────────────────────────────────────────
  // Verification Email
  // ─────────────────────────────────────────────────────────

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: `"e=mc³" <${env.EMAIL_FROM}>`,
      to,
      subject: "Email Adresinizi Doğrulayın - e=mc³",
      html: this.getVerificationEmailHtml(verificationUrl),
      text: this.getVerificationEmailText(verificationUrl),
    });
  }

  private getVerificationEmailHtml(url: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Doğrulama</title>
</head>
<body style="font-family: Georgia, serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0f3d2e; margin: 0;">e=mc³</h1>
    <p style="color: #6b7280; margin-top: 5px;">Epistemik Metayöntem Cemiyeti</p>
  </div>
  
  <h2 style="color: #111827;">Email Adresinizi Doğrulayın</h2>
  
  <p>Merhaba,</p>
  
  <p>e=mc³ platformuna kayıt olduğunuz için teşekkür ederiz. Email adresinizi doğrulamak için aşağıdaki butona tıklayın:</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${url}" style="background-color: #0f3d2e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
      Email Adresimi Doğrula
    </a>
  </div>
  
  <p>Veya bu linki tarayıcınıza kopyalayın:</p>
  <p style="word-break: break-all; color: #0f3d2e;">${url}</p>
  
  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
    Bu link 24 saat geçerlidir. Eğer bu işlemi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.
  </p>
  
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  
  <p style="color: #6b7280; font-size: 12px; text-align: center;">
    © ${new Date().getFullYear()} e=mc³ - Epistemik Metayöntem Cemiyeti
  </p>
</body>
</html>
    `;
  }

  private getVerificationEmailText(url: string): string {
    return `
e=mc³ - Epistemik Metayöntem Cemiyeti

Email Adresinizi Doğrulayın

Merhaba,

e=mc³ platformuna kayıt olduğunuz için teşekkür ederiz. Email adresinizi doğrulamak için aşağıdaki linke tıklayın:

${url}

Bu link 24 saat geçerlidir. Eğer bu işlemi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.

---
© ${new Date().getFullYear()} e=mc³ - Epistemik Metayöntem Cemiyeti
    `;
  }

  // ─────────────────────────────────────────────────────────
  // Password Reset Email
  // ─────────────────────────────────────────────────────────

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: `"e=mc³" <${env.EMAIL_FROM}>`,
      to,
      subject: "Şifre Sıfırlama - e=mc³",
      html: this.getPasswordResetEmailHtml(resetUrl),
      text: this.getPasswordResetEmailText(resetUrl),
    });
  }

  private getPasswordResetEmailHtml(url: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Şifre Sıfırlama</title>
</head>
<body style="font-family: Georgia, serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0f3d2e; margin: 0;">e=mc³</h1>
    <p style="color: #6b7280; margin-top: 5px;">Epistemik Metayöntem Cemiyeti</p>
  </div>
  
  <h2 style="color: #111827;">Şifre Sıfırlama Talebi</h2>
  
  <p>Merhaba,</p>
  
  <p>e=mc³ hesabınız için bir şifre sıfırlama talebi aldık. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${url}" style="background-color: #0f3d2e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
      Şifremi Sıfırla
    </a>
  </div>
  
  <p>Veya bu linki tarayıcınıza kopyalayın:</p>
  <p style="word-break: break-all; color: #0f3d2e;">${url}</p>
  
  <p style="color: #8b1e1e; font-size: 14px; margin-top: 30px;">
    ⚠️ Bu link <strong>1 saat</strong> geçerlidir.
  </p>
  
  <p style="color: #6b7280; font-size: 14px;">
    Eğer bu talebi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz. Hesabınız güvende.
  </p>
  
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  
  <p style="color: #6b7280; font-size: 12px; text-align: center;">
    © ${new Date().getFullYear()} e=mc³ - Epistemik Metayöntem Cemiyeti
  </p>
</body>
</html>
    `;
  }

  private getPasswordResetEmailText(url: string): string {
    return `
e=mc³ - Epistemik Metayöntem Cemiyeti

Şifre Sıfırlama Talebi

Merhaba,

e=mc³ hesabınız için bir şifre sıfırlama talebi aldık. Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:

${url}

⚠️ Bu link 1 saat geçerlidir.

Eğer bu talebi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz. Hesabınız güvende.

---
© ${new Date().getFullYear()} e=mc³ - Epistemik Metayöntem Cemiyeti
    `;
  }
}
