const profileInfo = document.getElementById("profileInfo");
const adInput = document.getElementById("adInput");
const emailInput = document.getElementById("emailInput");
const profileForm = document.getElementById("profileForm");
const passwordForm = document.getElementById("passwordForm");
const sessionsList = document.getElementById("sessionsList");
const myHistory = document.getElementById("myHistory");
const toast = document.getElementById("toast");
const twoFaStatus = document.getElementById("twoFaStatus");
const twoFaBeginBtn = document.getElementById("twoFaBeginBtn");
const twoFaSetup = document.getElementById("twoFaSetup");
const twoFaQr = document.getElementById("twoFaQr");
const twoFaMask = document.getElementById("twoFaMask");
const twoFaEnableForm = document.getElementById("twoFaEnableForm");
const twoFaDisableForm = document.getElementById("twoFaDisableForm");
const recoveryStatus = document.getElementById("recoveryStatus");
const recoveryRegenerateForm = document.getElementById("recoveryRegenerateForm");
const recoveryCodesBox = document.getElementById("recoveryCodesBox");
const recoveryCodesText = document.getElementById("recoveryCodesText");
const downloadRecoveryBtn = document.getElementById("downloadRecoveryBtn");
const trEn = (trText, enText) => window.I18N?.trEn?.(trText, enText) || trText;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

async function apiFetch(url, options = {}, canRetry = true) {
  const headers = { ...(options.headers || {}), "X-Lang": window.I18N?.getLang?.() || "tr" };
  const res = await fetch(url, { credentials: "include", ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && canRetry) {
    const refreshRes = await fetch("/api/v1/auth/refresh", { method: "POST", credentials: "include", headers: { "X-Lang": window.I18N?.getLang?.() || "tr" } });
    if (refreshRes.ok) return apiFetch(url, options, false);
  }

  if (!res.ok || data?.success === false) {
    const rawMessage = data?.error?.message || data?.error || "Sunucu hatası";
    throw new Error(window.I18N?.mapServerError?.(rawMessage) || rawMessage);
  }

  return data?.data ?? data;
}

function sessionItem(session) {
  const ua = session.userAgent || trEn("Bilinmeyen cihaz", "Unknown device");
  const when = new Date(session.createdAt).toLocaleString(window.I18N?.isEnglish?.() ? "en-US" : "tr-TR");
  return `
  <article class="history-item">
    <button class="delete-btn" data-device="${session.deviceId}" type="button">${trEn("Kapat", "Close")}</button>
    <div class="history-meta">${when}</div>
    <div class="history-text">${ua}</div>
  </article>`;
}

function historyItem(item) {
  const when = new Date(item.createdAt).toLocaleString(window.I18N?.isEnglish?.() ? "en-US" : "tr-TR");
  return `
  <article class="history-item">
    <button class="delete-btn" data-yorum="${item._id}" type="button">${trEn("Sil", "Delete")}</button>
    <div class="history-meta">${when} · ${item.tip}</div>
    <div class="history-text">${item.ruya.slice(0, 130)}</div>
  </article>`;
}

async function loadProfile() {
  const me = await apiFetch("/api/v1/auth/me");
  const user = me.user;
  profileInfo.textContent = trEn(
    `${user.ad} · ${user.email} · Plan: ${user.plan} · Günlük hak: ${user.plan === "pro" ? "Sınırsız" : user.gunlukHak}`,
    `${user.ad} · ${user.email} · Plan: ${user.plan} · Daily credits: ${user.plan === "pro" ? "Unlimited" : user.gunlukHak}`
  );
  adInput.value = user.ad;
  emailInput.value = user.email;
  twoFaStatus.textContent = trEn(`Durum: ${user.twoFactorEnabled ? "Etkin" : "Kapalı"}`, `Status: ${user.twoFactorEnabled ? "Enabled" : "Disabled"}`);
  twoFaDisableForm.classList.toggle("hidden", !user.twoFactorEnabled);
  twoFaBeginBtn.classList.toggle("hidden", user.twoFactorEnabled);
  recoveryRegenerateForm.classList.toggle("hidden", !user.twoFactorEnabled);
  await loadRecoveryStatus();
}

async function loadRecoveryStatus() {
  try {
    const status = await apiFetch("/api/v1/auth/2fa/recovery-codes/status");
    if (!status.enabled) {
      recoveryStatus.textContent = trEn("Yedek kodlar: 2FA kapalı.", "Recovery codes: 2FA disabled.");
      return;
    }
    recoveryStatus.textContent = trEn(`Yedek kod kalan adet: ${status.remaining}`, `Remaining recovery codes: ${status.remaining}`);
  } catch {
    recoveryStatus.textContent = trEn("Yedek kod bilgisi alınamadı.", "Could not fetch recovery code status.");
  }
}

async function loadSessions() {
  const data = await apiFetch("/api/v1/auth/sessions");
  const sessions = data.sessions || [];
  sessionsList.innerHTML = sessions.length ? sessions.map(sessionItem).join("") : `<article class="history-item"><div class="history-text">${trEn("Aktif oturum yok.", "No active session.")}</div></article>`;
}

async function loadHistory() {
  const data = await apiFetch("/api/v1/yorum/gecmis");
  const rows = data.yorumlar || [];
  myHistory.innerHTML = rows.length ? rows.map(historyItem).join("") : `<article class="history-item"><div class="history-text">${trEn("Henüz yorum yok.", "No interpretation yet.")}</div></article>`;
}

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await apiFetch("/api/v1/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad: adInput.value.trim() })
    });
    await loadProfile();
    showToast(trEn("Profil güncellendi.", "Profile updated."));
  } catch (err) {
    showToast(err.message);
  }
});

passwordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await apiFetch("/api/v1/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mevcutSifre: document.getElementById("oldPass").value, yeniSifre: document.getElementById("newPass").value })
    });
    passwordForm.reset();
    showToast(trEn("Şifre güncellendi.", "Password updated."));
  } catch (err) {
    showToast(err.message);
  }
});

sessionsList.addEventListener("click", async (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement) || !target.matches("[data-device]")) return;
  try {
    await apiFetch(`/api/v1/auth/sessions/${encodeURIComponent(target.dataset.device)}`, { method: "DELETE" });
    await loadSessions();
    showToast(trEn("Oturum kapatıldı.", "Session closed."));
  } catch (err) {
    showToast(err.message);
  }
});

myHistory.addEventListener("click", async (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement) || !target.matches("[data-yorum]")) return;
  try {
    await apiFetch(`/api/v1/yorum/${target.dataset.yorum}`, { method: "DELETE" });
    await loadHistory();
    showToast(trEn("Yorum silindi.", "Interpretation deleted."));
  } catch (err) {
    showToast(err.message);
  }
});

twoFaBeginBtn.addEventListener("click", async () => {
  try {
    const data = await apiFetch("/api/v1/auth/2fa/setup-begin", { method: "POST" });
    twoFaQr.src = data.qrDataUrl;
    twoFaMask.textContent = `Gizli anahtar: ${data.secretMasked}`;
    twoFaSetup.classList.remove("hidden");
    showToast(trEn("Authenticator uygulamasıyla QR kodu okut.", "Scan the QR code with your authenticator app."));
  } catch (err) {
    showToast(err.message);
  }
});

twoFaDisableForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await apiFetch("/api/v1/auth/2fa/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: document.getElementById("twoFaDisableCode").value.trim() })
    });
    await loadProfile();
    showToast(trEn("2FA kapatıldı.", "2FA disabled."));
  } catch (err) {
    showToast(err.message);
  }
});

twoFaEnableForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const result = await apiFetch("/api/v1/auth/2fa/enable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: document.getElementById("twoFaEnableCode").value.trim() })
    });
    recoveryCodesText.textContent = (result?.recoveryCodes || []).join("\n");
    recoveryCodesBox.classList.remove("hidden");
    twoFaSetup.classList.add("hidden");
    await loadProfile();
    showToast(trEn("2FA etkinleştirildi.", "2FA enabled."));
  } catch (err) {
    showToast(err.message);
  }
});

recoveryRegenerateForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const data = await apiFetch("/api/v1/auth/2fa/recovery-codes/regenerate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: document.getElementById("recoveryCodeInput").value.trim() })
    });
    recoveryCodesText.textContent = (data.recoveryCodes || []).join("\n");
    recoveryCodesBox.classList.remove("hidden");
    await loadRecoveryStatus();
    showToast("Yedek kodlar yenilendi.");
  } catch (err) {
    showToast(err.message);
  }
});

downloadRecoveryBtn.addEventListener("click", () => {
  const content = recoveryCodesText.textContent.trim();
  if (!content) {
    showToast(trEn("İndirilecek yedek kod bulunamadı.", "No recovery code to download."));
    return;
  }
  const blob = new Blob([content + "\n"], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ruyayorum-2fa-yedek-kodlar-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(trEn("Yedek kodlar indirildi.", "Recovery codes downloaded."));
});

(async () => {
  try {
    await loadProfile();
    await Promise.all([loadSessions(), loadHistory()]);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  } catch {
    window.location.href = "/auth.html";
  }
})();
