let page = 1;
const limit = 20;
let q = "";
let ticketPage = 1;
let ticketStatus = "";
let ticketPriority = "";
let ticketSearch = "";
const toast = document.getElementById("toast");
const trEn = (trText, enText) => window.I18N?.trEn?.(trText, enText) || trText;

function showToast(message) {
  if (!toast) {
    alert(message);
    return;
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function jsonHeaders() {
  return { "Content-Type": "application/json" };
}

async function apiFetch(url, options = {}, canRetry = true) {
  const headers = { ...(options.headers || {}), "X-Lang": window.I18N?.getLang?.() || "tr" };
  const res = await fetch(url, { credentials: "include", ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && canRetry) {
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

async function ensureAdmin() {
  try {
    const data = await apiFetch("/api/v1/auth/me");
    if (data.user.role !== "admin") throw new Error(trEn("Bu sayfa sadece admin kullanıcılar içindir.", "This page is only for admin users."));
  } catch {
    alert(trEn("Bu sayfa sadece admin kullanıcılar içindir.", "This page is only for admin users."));
    location.href = "/auth.html";
    return false;
  }
  return true;
}

async function loadStats() {
  let data;
  try {
    data = await apiFetch("/api/v1/admin/istatistik");
  } catch (err) {
    alert(err.message || "Yetki yok");
    location.href = "/auth.html";
    return;
  }
  const cards = [
    [trEn("Toplam Üye", "Total Users"), data.toplamKullanici],
    [trEn("Bugün Kayıt", "Today Signups"), data.bugunKayit],
    [trEn("Toplam Yorum", "Total Interpretations"), data.toplamYorum],
    [trEn("Bugün Yorum", "Today Interpretations"), data.bugunYorum],
    [trEn("Pro Üye", "Pro Members"), data.proUye]
  ];
  document.getElementById("statsGrid").innerHTML = cards.map(([k, v]) => `
    <article class="info-card"><h3>${k}</h3><p style="font-size:1.4rem;color:#f0c040;">${v}</p></article>
  `).join("");
}

async function loadUsers() {
  let data;
  try {
    data = await apiFetch(`/api/v1/admin/kullanicilar?page=${page}&limit=${limit}&q=${encodeURIComponent(q)}`);
  } catch (err) {
    alert(err.message || trEn("Kullanıcılar alınamadı", "Could not fetch users"));
    return;
  }

  const list = Array.isArray(data.kullanicilar) ? data.kullanicilar : [];
  document.getElementById("pageLabel").textContent = trEn(`Sayfa ${data.page}`, `Page ${data.page}`);
  document.getElementById("usersInfo").textContent = trEn(
    `Toplam ${data.toplam} kullanıcı, bu sayfada ${list.length} kayıt gösteriliyor.`,
    `Total ${data.toplam} users, showing ${list.length} records on this page.`
  );

  if (!list.length) {
    document.getElementById("userRows").innerHTML = `
      <tr>
        <td colspan="4" style="padding:10px; border-top:1px solid var(--border); color:var(--muted);">
          ${trEn("Kayıt bulunamadı.", "No record found.")}
        </td>
      </tr>`;
    return;
  }

  document.getElementById("userRows").innerHTML = list.map((u) => `
    <tr>
      <td style="padding:8px; border-top:1px solid var(--border);">${u.email}</td>
      <td style="padding:8px; border-top:1px solid var(--border);">${u.role || "user"}</td>
      <td style="padding:8px; border-top:1px solid var(--border);">${u.plan}</td>
      <td style="padding:8px; border-top:1px solid var(--border);">${u.aktif ? trEn("Evet", "Yes") : trEn("Hayır", "No")}</td>
      <td style="padding:8px; border-top:1px solid var(--border);">
        <button class="btn btn-secondary" data-action="detay" data-id="${u._id}">${trEn("Detay", "Detail")}</button>
        <button class="btn btn-secondary" data-action="plan" data-id="${u._id}" data-plan="${u.plan === "pro" ? "free" : "pro"}">${trEn("Plan", "Plan")}</button>
        <button class="btn btn-secondary" data-action="aktif" data-id="${u._id}" data-aktif="${String(!u.aktif)}">${trEn("Aktif/Pasif", "Active/Passive")}</button>
        <button class="btn btn-secondary" data-action="sil" data-id="${u._id}">${trEn("Sil", "Delete")}</button>
      </td>
    </tr>
  `).join("");
}

async function setPlan(id, plan) {
  await apiFetch(`/api/v1/admin/kullanici/${id}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify({ plan })
  });
  await loadUsers();
  await loadStats();
}

async function setAktif(id, aktif) {
  await apiFetch(`/api/v1/admin/kullanici/${id}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify({ aktif })
  });
  await loadUsers();
}

async function deleteUser(id) {
  if (!confirm(trEn("Bu kullanıcı silinsin mi?", "Delete this user?"))) return;
  try {
    await apiFetch(`/api/v1/admin/kullanici/${id}`, { method: "DELETE" });
  } catch (err) {
    alert(err.message || trEn("Silme başarısız", "Delete failed"));
    return;
  }
  await loadUsers();
  await loadStats();
}

async function loadAudit() {
  let data;
  try {
    data = await apiFetch("/api/v1/admin/audit?page=1&limit=30");
  } catch (err) {
    document.getElementById("auditRows").innerHTML = `<article class="history-item"><div class="history-text">${err.message}</div></article>`;
    return;
  }

  const logs = data.logs || [];
  document.getElementById("auditRows").innerHTML = logs.length
    ? logs.map((log) => `
      <article class="history-item">
        <div class="history-meta">${new Date(log.createdAt).toLocaleString("tr-TR")} · ${log.action}</div>
        <div class="history-text">${log.targetType || "-"} / ${log.targetId || "-"}</div>
      </article>`).join("")
    : `<article class="history-item"><div class="history-text">${trEn("Audit kaydı yok.", "No audit log found.")}</div></article>`;
}

async function loadUserDetail(id) {
  let data;
  try {
    data = await apiFetch(`/api/v1/admin/kullanici/${id}/detay`);
  } catch (err) {
    document.getElementById("userDetailBox").innerHTML = `<article class="history-item"><div class="history-text">${err.message}</div></article>`;
    return;
  }

  const user = data.user;
  const sessions = (data.aktifOturumlar || []).slice(0, 5).map((s) => `<li>${s.userAgent || "Bilinmeyen cihaz"} · ${new Date(s.createdAt).toLocaleString("tr-TR")}</li>`).join("");
  const yorumlar = (data.sonYorumlar || []).slice(0, 5).map((y) => `<li>${new Date(y.createdAt).toLocaleString("tr-TR")} · ${y.tip}</li>`).join("");

  document.getElementById("userDetailBox").innerHTML = `
    <article class="history-item">
      <div class="history-meta">${user.email}</div>
      <div class="history-text">${trEn("Ad", "Name")}: ${user.ad} · ${trEn("Rol", "Role")}: ${user.role} · ${trEn("Plan", "Plan")}: ${user.plan} · ${trEn("Aktif", "Active")}: ${user.aktif ? trEn("Evet", "Yes") : trEn("Hayır", "No")}</div>
      <div class="history-text" style="margin-top:8px;">${trEn("Toplam Yorum", "Total Interpretations")}: ${data.toplamYorum} · ${trEn("Aktif Oturum", "Active Session")}: ${data.aktifOturumSayisi}</div>
      <div class="history-text" style="margin-top:8px;">${trEn("AI Maliyet (son)", "AI Cost (recent)")}: $${data.aiOzet?.toplamMaliyetUsd || 0} · Token: ${data.aiOzet?.toplamToken || 0}</div>
      <div class="history-text" style="margin-top:8px;">${trEn("Son Oturumlar", "Recent Sessions")}:</div>
      <ul style="margin:6px 0 0 16px; color:var(--muted);">${sessions || "<li>Yok</li>"}</ul>
      <div class="history-text" style="margin-top:8px;">${trEn("Son Yorumlar", "Recent Interpretations")}:</div>
      <ul style="margin:6px 0 0 16px; color:var(--muted);">${yorumlar || "<li>Yok</li>"}</ul>
    </article>`;
}

function renderAdminTickets(tickets) {
  const box = document.getElementById("adminTickets");
  box.innerHTML = tickets.length
    ? tickets.map((t) => `
      <article class="history-item" data-ticket-id="${t._id}">
        <div class="history-meta">${new Date(t.updatedAt).toLocaleString("tr-TR")} · ${t.status} · ${t.priority}</div>
        <div class="history-text">${t.subject} · ${t.userId?.email || "-"}</div>
      </article>`).join("")
    : `<article class="history-item"><div class="history-text">${trEn("Ticket bulunamadı.", "Ticket not found.")}</div></article>`;
}

async function loadTicketsAdmin() {
  let data;
  try {
    const qs = new URLSearchParams({
      page: String(ticketPage),
      limit: "20",
      q: ticketSearch,
      status: ticketStatus,
      priority: ticketPriority
    });
    data = await apiFetch(`/api/v1/admin/tickets?${qs.toString()}`);
  } catch (err) {
    document.getElementById("adminTickets").innerHTML = `<article class="history-item"><div class="history-text">${err.message}</div></article>`;
    return;
  }
  document.getElementById("ticketPageLabel").textContent = `Sayfa ${data.page || ticketPage}`;
  renderAdminTickets(data.tickets || []);
}

async function loadTicketAdminDetail(id) {
  let data;
  try {
    data = await apiFetch(`/api/v1/admin/tickets/${id}`);
  } catch (err) {
    document.getElementById("adminTicketDetail").innerHTML = `<article class="history-item"><div class="history-text">${err.message}</div></article>`;
    return;
  }

  const t = data.ticket;
  const msgs = (t.messages || []).map((m) => {
    const attachments = (m.attachments || []).length
      ? `<div class="history-text" style="margin-top:6px;">Ekler: ${(m.attachments || []).map((a) => `<a href="${a.url}" target="_blank" rel="noopener noreferrer">${a.name}</a>`).join(" · ")}</div>`
      : "";
    return `<article class="history-item"><div class="history-meta">${m.from} · ${new Date(m.createdAt).toLocaleString("tr-TR")}</div><div class="history-text">${m.message}</div>${attachments}</article>`;
  }).join("");
  document.getElementById("adminTicketDetail").innerHTML = `
    <article class="profile-card">
      <h3>${t.subject}</h3>
      <p style="color:var(--muted);">${trEn("Kullanıcı", "User")}: ${t.userId?.email || "-"} · ${trEn("Durum", "Status")}: ${t.status} · ${trEn("Öncelik", "Priority")}: ${t.priority}</p>
      <div class="history-list">${msgs}</div>
      <div class="row" style="margin-top:10px; gap:8px;">
        <button class="btn btn-secondary" data-ticket-action="close" data-ticket-id="${t._id}">${trEn("Kapat", "Close")}</button>
        <button class="btn btn-secondary" data-ticket-action="open" data-ticket-id="${t._id}">${trEn("Aç", "Open")}</button>
        <button class="btn btn-secondary" data-ticket-action="priority-high" data-ticket-id="${t._id}">High</button>
      </div>
      <form id="adminTicketReplyForm" class="profile-form" style="margin-top:10px;">
        <label>${trEn("Admin Yanıtı", "Admin Reply")}
          <textarea id="adminTicketReply" required></textarea>
        </label>
        <label>${trEn("Ek Dosya (opsiyonel)", "Attachment (optional)")}
          <input id="adminTicketFiles" type="file" multiple />
        </label>
        <button class="btn btn-main" type="submit">${trEn("Yanıt Gönder", "Send Reply")}</button>
      </form>
    </article>`;

  document.getElementById("adminTicketReplyForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("message", document.getElementById("adminTicketReply").value);
      const filesInput = document.getElementById("adminTicketFiles");
      if (filesInput?.files?.length) {
        for (const file of filesInput.files) {
          formData.append("files", file);
        }
      }
      await apiFetch(`/api/v1/admin/tickets/${t._id}/reply`, {
        method: "POST",
        body: formData
      });
      await loadTicketAdminDetail(t._id);
      await loadTicketsAdmin();
    } catch (err) {
      alert(err.message);
    }
  });
}

document.getElementById("prevPage").addEventListener("click", () => {
  page = Math.max(1, page - 1);
  loadUsers();
});

document.getElementById("nextPage").addEventListener("click", () => {
  page += 1;
  loadUsers();
});

document.getElementById("searchBtn").addEventListener("click", () => {
  q = document.getElementById("searchEmail").value.trim();
  page = 1;
  loadUsers();
});

document.getElementById("userRows").addEventListener("click", async (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  const btn = target.closest("button[data-action]");
  if (!(btn instanceof HTMLElement)) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if (!id) return;

  if (action === "plan") {
    await setPlan(id, btn.dataset.plan || "free");
    return;
  }
  if (action === "detay") {
    await loadUserDetail(id);
    return;
  }
  if (action === "aktif") {
    await setAktif(id, btn.dataset.aktif === "true");
    return;
  }
  if (action === "sil") {
    await deleteUser(id);
  }
});

document.getElementById("adminTickets").addEventListener("click", async (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  const root = target.closest("[data-ticket-id]");
  if (!(root instanceof HTMLElement)) return;
  await loadTicketAdminDetail(root.dataset.ticketId);
});

document.getElementById("adminTicketDetail").addEventListener("click", async (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement) || !target.matches("[data-ticket-action]")) return;
  const id = target.dataset.ticketId;
  const action = target.dataset.ticketAction;
  if (!id || !action) return;

  const patch = {};
  if (action === "close") patch.status = "closed";
  if (action === "open") patch.status = "open";
  if (action === "priority-high") patch.priority = "high";

  try {
    await apiFetch(`/api/v1/admin/tickets/${id}`, {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify(patch)
    });
    await loadTicketAdminDetail(id);
    await loadTicketsAdmin();
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById("ticketFilterBtn").addEventListener("click", async () => {
  ticketSearch = document.getElementById("ticketSearch").value.trim();
  ticketStatus = document.getElementById("ticketStatus").value;
  ticketPriority = document.getElementById("ticketPriority").value;
  ticketPage = 1;
  await loadTicketsAdmin();
});

document.getElementById("ticketPrevPage").addEventListener("click", async () => {
  ticketPage = Math.max(1, ticketPage - 1);
  await loadTicketsAdmin();
});

document.getElementById("ticketNextPage").addEventListener("click", async () => {
  ticketPage += 1;
  await loadTicketsAdmin();
});

(async () => {
  const ok = await ensureAdmin();
  if (!ok) return;
  await Promise.all([loadStats(), loadUsers(), loadAudit(), loadTicketsAdmin()]);
  const eventSource = new EventSource("/api/v1/admin/tickets/stream", { withCredentials: true });
  eventSource.addEventListener("ticket", async (event) => {
    try {
      const payload = JSON.parse(event.data || "{}");
      if (payload.type && payload.type !== "connected") {
        showToast(trEn("Ticket güncellendi.", "Ticket updated."));
      }
    } catch {}
    await Promise.all([loadTicketsAdmin(), loadStats()]);
  });
  eventSource.onerror = () => {
    showToast(trEn("Canlı bildirim bağlantısı kesildi, tekrar denenecek.", "Live notification connection lost, retrying."));
  };
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
})();
