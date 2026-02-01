import { env } from "../config/env.js";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export class EmailService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = env.BREVO_API_KEY;
  }

  private async sendViaBrevo(payload: {
    subject: string;
    htmlContent: string;
    textContent: string;
    to: string;
  }): Promise<void> {
    if (!this.apiKey) {
      console.warn("[EmailService] BREVO_API_KEY not set, skipping email");
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    const res = await fetch(BREVO_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "api-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "e=mc³", email: env.EMAIL_FROM },
        to: [{ email: payload.to }],
        subject: payload.subject,
        htmlContent: payload.htmlContent,
        textContent: payload.textContent,
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(
        `Brevo API error ${res.status}: ${err.message ?? res.statusText}`,
      );
    }
  }

  // ─────────────────────────────────────────────────────────
  // Verification Email
  // ─────────────────────────────────────────────────────────

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

    await this.sendViaBrevo({
      subject: "Email Adresinizi Doğrulayın - e=mc³",
      htmlContent: this.getVerificationEmailHtml(verificationUrl),
      textContent: this.getVerificationEmailText(verificationUrl),
      to,
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

    await this.sendViaBrevo({
      subject: "Şifre Sıfırlama - e=mc³",
      htmlContent: this.getPasswordResetEmailHtml(resetUrl),
      textContent: this.getPasswordResetEmailText(resetUrl),
      to,
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
