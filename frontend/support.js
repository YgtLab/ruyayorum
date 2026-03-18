const ticketForm = document.getElementById("ticketForm");
const ticketList = document.getElementById("ticketList");
const ticketDetail = document.getElementById("ticketDetail");
const toast = document.getElementById("toast");
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

function ticketRow(t) {
  return `
    <article class="history-item" data-ticket="${t._id}">
      <div class="history-meta">${new Date(t.updatedAt).toLocaleString(window.I18N?.isEnglish?.() ? "en-US" : "tr-TR")} · ${t.status} · ${t.priority}</div>
      <div class="history-text">${t.subject}</div>
    </article>`;
}

function renderDetail(t) {
  function attachmentsHtml(list = []) {
    if (!list.length) return "";
    return `<div class="history-text" style="margin-top:6px;">Ekler: ${list.map((a) => `<a href="${a.url}" target="_blank" rel="noopener noreferrer">${a.name}</a>`).join(" · ")}</div>`;
  }

  const messages = (t.messages || []).map((m) => `
    <article class="history-item">
      <div class="history-meta">${m.from} · ${new Date(m.createdAt).toLocaleString("tr-TR")}</div>
      <div class="history-text">${m.message}</div>
      ${attachmentsHtml(m.attachments)}
    </article>`).join("");

  ticketDetail.innerHTML = `
    <article class="profile-card">
      <h3>${t.subject}</h3>
      <p style="color:var(--muted);">Durum: ${t.status} · Öncelik: ${t.priority} · Kategori: ${t.category}</p>
      <div class="history-list">${messages}</div>
      <form id="replyForm" class="profile-form" style="margin-top:10px;">
        <label>${trEn("Yanıt", "Reply")}
          <textarea id="replyMessage" maxlength="1200" required></textarea>
        </label>
        <label>${trEn("Ek Dosya (opsiyonel)", "Attachment (optional)")}
          <input id="replyFiles" type="file" multiple />
        </label>
        <button class="btn btn-secondary" type="submit">${trEn("Yanıt Gönder", "Send Reply")}</button>
      </form>
    </article>
  `;

  document.getElementById("replyForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("message", document.getElementById("replyMessage").value);
      const filesInput = document.getElementById("replyFiles");
      if (filesInput?.files?.length) {
        for (const file of filesInput.files) {
          formData.append("files", file);
        }
      }
      await apiFetch(`/api/v1/support/tickets/${t._id}/reply`, {
        method: "POST",
        body: formData
      });
      await loadTicketDetail(t._id);
      await loadTickets();
      showToast(trEn("Yanıt gönderildi.", "Reply sent."));
    } catch (err) {
      showToast(err.message);
    }
  });
}

async function loadTickets() {
  const data = await apiFetch("/api/v1/support/tickets");
  const tickets = data.tickets || [];
  ticketList.innerHTML = tickets.length
    ? tickets.map(ticketRow).join("")
    : `<article class="history-item"><div class="history-text">${trEn("Henüz ticket yok.", "No ticket yet.")}</div></article>`;
}

async function loadTicketDetail(id) {
  const data = await apiFetch(`/api/v1/support/tickets/${id}`);
  renderDetail(data.ticket);
}

ticketList.addEventListener("click", async (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  const root = target.closest("[data-ticket]");
  if (!(root instanceof HTMLElement)) return;
  await loadTicketDetail(root.dataset.ticket);
});

ticketForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData();
    formData.append("subject", document.getElementById("ticketSubject").value);
    formData.append("category", document.getElementById("ticketCategory").value);
    formData.append("message", document.getElementById("ticketMessage").value);
    const filesInput = document.getElementById("ticketFiles");
    if (filesInput?.files?.length) {
      for (const file of filesInput.files) {
        formData.append("files", file);
      }
    }
    await apiFetch("/api/v1/support/tickets", {
      method: "POST",
      body: formData
    });
    ticketForm.reset();
    await loadTickets();
    showToast(trEn("Ticket oluşturuldu.", "Ticket created."));
  } catch (err) {
    showToast(err.message);
  }
});

(async () => {
  try {
    await loadTickets();
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  } catch {
    window.location.href = "/auth.html";
  }
})();
