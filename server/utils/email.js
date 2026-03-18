const { Resend } = require("resend");
const { getEmailQueue } = require("../lib/queue");

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;

function baseTemplate({ title, description, ctaText, ctaUrl, footerNote }) {
  return `
  <div style="font-family: Inter, Arial, sans-serif; background:#0a0a1a; padding:24px; color:#f4f2ff;">
    <div style="max-width:620px; margin:0 auto; border:1px solid rgba(240,192,64,.35); border-radius:16px; overflow:hidden; background:rgba(27,22,52,.85);">
      <div style="padding:20px 24px; border-bottom:1px solid rgba(240,192,64,.25); font-size:24px; font-weight:700; color:#f0c040;">🔮 RüyaYorum</div>
      <div style="padding:24px; line-height:1.6;">
        <h2 style="margin:0 0 12px; color:#fff;">${title}</h2>
        <p style="margin:0 0 18px; color:#c7c2e8;">${description}</p>
        <a href="${ctaUrl}" style="display:inline-block; background:#6c3fc7; color:#fff; text-decoration:none; padding:10px 16px; border-radius:10px; font-weight:600;">${ctaText}</a>
        <p style="margin:18px 0 0; font-size:13px; color:#b9b4da;">${footerNote}</p>
      </div>
    </div>
  </div>`;
}

async function sendVerificationEmailNow(email, token) {
  const verifyUrl = `${APP_URL}/api/v1/auth/verify-email?token=${token}`;
  return resend.emails.send({
    from: process.env.RESEND_FROM,
    to: email,
    subject: "RüyaYorum - Email Doğrulama",
    html: baseTemplate({
      title: "Email Adresini Doğrula",
      description: "RüyaYorum hesabını aktifleştirmek için aşağıdaki butona tıkla.",
      ctaText: "Emailimi Doğrula",
      ctaUrl: verifyUrl,
      footerNote: "Eğer bu işlemi sen yapmadıysan bu emaili görmezden gelebilirsin."
    })
  });
}

async function sendResetEmailNow(email, token) {
  const resetUrl = `${APP_URL}/auth.html?resetToken=${token}`;
  return resend.emails.send({
    from: process.env.RESEND_FROM,
    to: email,
    subject: "RüyaYorum - Şifre Sıfırlama",
    html: baseTemplate({
      title: "Şifre Sıfırlama Talebi",
      description: "Yeni şifre belirlemek için aşağıdaki bağlantıyı kullan.",
      ctaText: "Şifremi Sıfırla",
      ctaUrl: resetUrl,
      footerNote: "Bu bağlantı 1 saat geçerlidir."
    })
  });
}

async function sendSuspiciousLoginEmailNow(email, context = {}) {
  return resend.emails.send({
    from: process.env.RESEND_FROM,
    to: email,
    subject: "RüyaYorum - Şüpheli Giriş Uyarısı",
    html: baseTemplate({
      title: "Hesabında Şüpheli Giriş Algılandı",
      description: `IP: ${context.ip || "-"}<br/>Cihaz: ${context.userAgent || "-"}<br/>Zaman: ${context.when || "-"}`,
      ctaText: "Hesabımı Kontrol Et",
      ctaUrl: `${APP_URL}/profile.html`,
      footerNote: "Bu giriş sana ait değilse şifreni hemen değiştir ve 2FA aç."
    })
  });
}

async function sendVerificationEmail(email, token) {
  const queue = getEmailQueue();
  if (!queue) {
    await sendVerificationEmailNow(email, token);
    return;
  }

  await queue.add(
    "verify-email",
    { email, token },
    { attempts: 3, removeOnComplete: true, removeOnFail: 50 }
  );
}

async function sendResetEmail(email, token) {
  const queue = getEmailQueue();
  if (!queue) {
    await sendResetEmailNow(email, token);
    return;
  }

  await queue.add(
    "reset-email",
    { email, token },
    { attempts: 3, removeOnComplete: true, removeOnFail: 50 }
  );
}

async function sendSuspiciousLoginEmail(email, context) {
  const queue = getEmailQueue();
  if (!queue) {
    await sendSuspiciousLoginEmailNow(email, context);
    return;
  }

  await queue.add(
    "suspicious-login-email",
    { email, context },
    { attempts: 3, removeOnComplete: true, removeOnFail: 50 }
  );
}

async function processEmailJob(name, payload) {
  if (name === "verify-email") {
    await sendVerificationEmailNow(payload.email, payload.token);
    return;
  }
  if (name === "reset-email") {
    await sendResetEmailNow(payload.email, payload.token);
    return;
  }
  if (name === "suspicious-login-email") {
    await sendSuspiciousLoginEmailNow(payload.email, payload.context || {});
  }
}

module.exports = {
  sendVerificationEmail,
  sendResetEmail,
  sendSuspiciousLoginEmail,
  processEmailJob
};
