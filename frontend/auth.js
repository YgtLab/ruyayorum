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

const params = new URLSearchParams(window.location.search);
const resetToken = params.get("resetToken") || "";

async function apiFetch(url, options = {}, canRetry = true) {
  const res = await fetch(url, { credentials: "include", ...options });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && canRetry && !url.includes("/auth/login") && !url.includes("/auth/register")) {
    const refreshRes = await fetch("/api/v1/auth/refresh", { method: "POST", credentials: "include" });
    if (refreshRes.ok) {
      return apiFetch(url, options, false);
    }
  }

  if (!res.ok || (data && data.success === false)) {
    throw new Error(data?.error?.message || data?.error || "Sunucu hatası");
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
      setMsg("Çıkış yapıldı.");
    });
  } catch {
    profilBox.classList.add("hidden");
    return false;
  }
  return true;
}

formGiris.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg("Giriş yapılıyor...");
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
    const message = err.message || "Giriş başarısız";
    if (message.toLowerCase().includes("2fa")) {
      setMsg(`${message} Sağdaki alana 2FA kodunu yazıp tekrar dene.`, true);
    } else {
      setMsg(message, true);
    }
    return;
  }

  setMsg("Giriş başarılı, yönlendiriliyorsun...");
  setTimeout(() => {
    window.location.href = "/";
  }, 700);
});

formKayit.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg("Kayıt yapılıyor...");
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
    setMsg(err.message || "Kayıt başarısız", true);
    return;
  }

  setMsg("Kayıt başarılı. Lütfen email doğrulama linkine tıkla.");
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
  setMsg("Sıfırlama maili gönderiliyor...");

  try {
    await apiFetch("/api/v1/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: document.getElementById("forgotEmail").value.trim() })
    });
  } catch (err) {
    setMsg(err.message || "İşlem başarısız", true);
    return;
  }

  setMsg("Sıfırlama bağlantısı gönderildi (emailini kontrol et).");
  formForgot.classList.add("hidden");
  formGiris.classList.remove("hidden");
});

if (formReset) {
  formReset.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!resetToken) {
      setResetMsg("Geçersiz bağlantı.", true);
      return;
    }

    const yeniSifre = document.getElementById("resetPassword").value;
    setResetMsg("Şifre güncelleniyor...");

    try {
      await apiFetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, yeniSifre })
      });
    } catch (err) {
      setResetMsg(err.message || "Şifre güncellenemedi.", true);
      return;
    }

    setResetMsg("Şifren güncellendi. Giriş ekranına yönlendiriliyorsun...");
    setTimeout(() => {
      window.location.href = "/auth.html";
    }, 1200);
  });
}

tabGiris.addEventListener("click", () => setTab("giris"));
tabKayit.addEventListener("click", () => setTab("kayit"));

(async () => {
  if (params.get("verified") === "1") {
    setMsg("Email doğrulandı, artık giriş yapabilirsin.");
  }

  if (resetToken) {
    authSection.classList.add("hidden");
    resetSection.classList.remove("hidden");

    let tokenValid = false;
    try {
      await apiFetch(`/api/v1/auth/verify-reset-token?token=${encodeURIComponent(resetToken)}`);
      tokenValid = true;
    } catch (err) {
      setResetMsg(err.message || "Bağlantı geçersiz veya süresi dolmuş.", true);
      formReset.classList.add("hidden");
    }

    if (tokenValid) {
      setResetMsg("Yeni şifreni belirleyebilirsin.");
    }
    return;
  }

  setTab("giris");
  await ben();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
})();
