const tabGiris = document.getElementById("tabGiris");
const tabKayit = document.getElementById("tabKayit");
const formGiris = document.getElementById("formGiris");
const formKayit = document.getElementById("formKayit");
const formForgot = document.getElementById("formForgot");
const formReset = document.getElementById("formReset");
const authMsg = document.getElementById("authMsg");
const resetMsg = document.getElementById("resetMsg");
const profilBox = document.getElementById("profilBox");
const authSection = document.getElementById("authSection");
const resetSection = document.getElementById("resetSection");
const forgotBtn = document.getElementById("forgotBtn");
const backToLoginBtn = document.getElementById("backToLoginBtn");
const trEn = (trText, enText) => window.I18N?.trEn?.(trText, enText) || trText;

const params = new URLSearchParams(window.location.search);
const resetToken = params.get("resetToken") || "";

async function apiFetch(url, options = {}, canRetry = true) {
  const headers = { ...(options.headers || {}), "X-Lang": window.I18N?.getLang?.() || "tr" };
  const res = await fetch(url, { credentials: "include", ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && canRetry && !url.includes("/auth/login") && !url.includes("/auth/register")) {
    const refreshRes = await fetch("/api/v1/auth/refresh", { method: "POST", credentials: "include", headers: { "X-Lang": window.I18N?.getLang?.() || "tr" } });
    if (refreshRes.ok) {
      return apiFetch(url, options, false);
    }
  }

  if (!res.ok || (data && data.success === false)) {
    const rawMessage = data?.error?.message || data?.error || "Sunucu hatası";
    throw new Error(window.I18N?.mapServerError?.(rawMessage) || rawMessage);
  }
  return data?.data ?? data;
}

function setTab(type) {
  const giris = type === "giris";
  tabGiris.classList.toggle("aktif", giris);
  tabKayit.classList.toggle("aktif", !giris);
  formGiris.classList.toggle("hidden", !giris);
  formKayit.classList.toggle("hidden", giris);
  formForgot.classList.add("hidden");
}

function setMsg(text, isError = false) {
  authMsg.style.color = isError ? "#ff8ea1" : "var(--muted)";
  authMsg.textContent = text;
}

function setResetMsg(text, isError = false) {
  resetMsg.style.color = isError ? "#ff8ea1" : "var(--muted)";
  resetMsg.textContent = text;
}

async function ben() {
  try {
    const data = await apiFetch("/api/v1/auth/me");
    const user = data.user;
    profilBox.classList.remove("hidden");
    profilBox.innerHTML = `
      <strong>Hoş geldin, ${user.ad}</strong><br>
      Plan: ${user.plan}<br>
      Rol: ${user.role}<br>
      Email: ${user.email}<br>
      <div class="row" style="margin-top:8px; gap:8px;">
        <a class="btn btn-secondary" href="/profile.html">Profil</a>
        <a class="btn btn-secondary" href="/support.html">Destek</a>
        ${user.role === "admin" ? '<a class="btn btn-secondary" href="/admin.html">Admin Paneli</a>' : ""}
        <button id="logoutBtn" class="btn btn-secondary" type="button">Çıkış Yap</button>
      </div>
    `;

    document.getElementById("logoutBtn").addEventListener("click", async () => {
      await apiFetch("/api/v1/auth/logout", { method: "POST" });
      profilBox.classList.add("hidden");
      setMsg(trEn("Çıkış yapıldı.", "Logged out."));
    });
  } catch {
    profilBox.classList.add("hidden");
    return false;
  }
  return true;
}

formGiris.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg(trEn("Giriş yapılıyor...", "Signing in..."));
  const payload = {
    email: document.getElementById("girisEmail").value.trim(),
    password: document.getElementById("girisSifre").value,
    twoFactorCode: document.getElementById("giris2fa").value.trim() || undefined,
    recoveryCode: document.getElementById("girisRecovery").value.trim() || undefined
  };

  try {
    await apiFetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    const message = err.message || trEn("Giriş başarısız", "Login failed");
    if (message.toLowerCase().includes("2fa")) {
      setMsg(trEn(`${message} Sağdaki alana 2FA kodunu yazıp tekrar dene.`, `${message} Enter your 2FA code and try again.`), true);
    } else {
      setMsg(message, true);
    }
    return;
  }

  setMsg(trEn("Giriş başarılı, yönlendiriliyorsun...", "Login successful, redirecting..."));
  setTimeout(() => {
    window.location.href = "/";
  }, 700);
});

formKayit.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg(trEn("Kayıt yapılıyor...", "Creating account..."));
  const payload = {
    ad: document.getElementById("kayitAd").value.trim(),
    email: document.getElementById("kayitEmail").value.trim(),
    password: document.getElementById("kayitSifre").value
  };

  try {
    await apiFetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    setMsg(err.message || trEn("Kayıt başarısız", "Registration failed"), true);
    return;
  }

  setMsg(trEn("Kayıt başarılı. Lütfen email doğrulama linkine tıkla.", "Registration successful. Please click the email verification link."));
  setTab("giris");
});

forgotBtn.addEventListener("click", () => {
  formGiris.classList.add("hidden");
  formForgot.classList.remove("hidden");
});

backToLoginBtn.addEventListener("click", () => {
  formForgot.classList.add("hidden");
  formGiris.classList.remove("hidden");
});

formForgot.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg(trEn("Sıfırlama maili gönderiliyor...", "Sending reset email..."));

  try {
    await apiFetch("/api/v1/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: document.getElementById("forgotEmail").value.trim() })
    });
  } catch (err) {
    setMsg(err.message || trEn("İşlem başarısız", "Operation failed"), true);
    return;
  }

  setMsg(trEn("Sıfırlama bağlantısı gönderildi (emailini kontrol et).", "Reset link sent (check your email)."));
  formForgot.classList.add("hidden");
  formGiris.classList.remove("hidden");
});

if (formReset) {
  formReset.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!resetToken) {
      setResetMsg(trEn("Geçersiz bağlantı.", "Invalid link."), true);
      return;
    }

    const yeniSifre = document.getElementById("resetPassword").value;
    setResetMsg(trEn("Şifre güncelleniyor...", "Updating password..."));

    try {
      await apiFetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, yeniSifre })
      });
    } catch (err) {
      setResetMsg(err.message || trEn("Şifre güncellenemedi.", "Password could not be updated."), true);
      return;
    }

    setResetMsg(trEn("Şifren güncellendi. Giriş ekranına yönlendiriliyorsun...", "Password updated. Redirecting to login..."));
    setTimeout(() => {
      window.location.href = "/auth.html";
    }, 1200);
  });
}

tabGiris.addEventListener("click", () => setTab("giris"));
tabKayit.addEventListener("click", () => setTab("kayit"));

(async () => {
  if (params.get("verified") === "1") {
    setMsg(trEn("Email doğrulandı, artık giriş yapabilirsin.", "Email verified, you can now sign in."));
  }

  if (resetToken) {
    authSection.classList.add("hidden");
    resetSection.classList.remove("hidden");

    let tokenValid = false;
    try {
      await apiFetch(`/api/v1/auth/verify-reset-token?token=${encodeURIComponent(resetToken)}`);
      tokenValid = true;
    } catch (err) {
      setResetMsg(err.message || trEn("Bağlantı geçersiz veya süresi dolmuş.", "Link is invalid or expired."), true);
      formReset.classList.add("hidden");
    }

    if (tokenValid) {
      setResetMsg(trEn("Yeni şifreni belirleyebilirsin.", "You can set your new password."));
    }
    return;
  }

  setTab("giris");
  await ben();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
})();
