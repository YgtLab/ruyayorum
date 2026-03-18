const ticketForm = document.getElementById("ticketForm");
const ticketList = document.getElementById("ticketList");
const ticketDetail = document.getElementById("ticketDetail");
const toast = document.getElementById("toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

async function apiFetch(url, options = {}, canRetry = true) {
  const res = await fetch(url, { credentials: "include", ...options });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && canRetry) {
    const refreshRes = await fetch("/api/v1/auth/refresh", { method: "POST", credentials: "include" });
    if (refreshRes.ok) return apiFetch(url, options, false);
  }

  if (!res.ok || data?.success === false) {
    throw new Error(data?.error?.message || data?.error || "Sunucu hatası");
  }

  return data?.data ?? data;
}

function ticketRow(t) {
  return `
    <article class="history-item" data-ticket="${t._id}">
      <div class="history-meta">${new Date(t.updatedAt).toLocaleString("tr-TR")} · ${t.status} · ${t.priority}</div>
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
        <label>Yanıt
          <textarea id="replyMessage" maxlength="1200" required></textarea>
        </label>
        <label>Ek Dosya (opsiyonel)
          <input id="replyFiles" type="file" multiple />
        </label>
        <button class="btn btn-secondary" type="submit">Yanıt Gönder</button>
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
      showToast("Yanıt gönderildi.");
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
    : '<article class="history-item"><div class="history-text">Henüz ticket yok.</div></article>';
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
    showToast("Ticket oluşturuldu.");
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
