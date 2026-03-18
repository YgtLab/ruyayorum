(() => {
  const KEY = "ruyayorum_lang";
  const supported = ["tr", "en"];
  const initial = localStorage.getItem(KEY);
  let lang = supported.includes(initial) ? initial : "tr";

  const text = {
    tr: {
      langToggle: "EN"
    },
    en: {
      langToggle: "TR"
    }
  };

  const serverErrorMap = {
    "Sunucu hatası": "Server error",
    "Rüya metni boş olamaz.": "Dream text cannot be empty.",
    "Rüya metni çok uzun.": "Dream text is too long.",
    "Geçersiz yorum tipi.": "Invalid interpretation type.",
    "Geçersiz dil seçimi.": "Invalid language selection.",
    "Günlük hakkın bitti. Yarın tekrar dene.": "Your daily credits are exhausted. Please try again tomorrow.",
    "Misafir günlük hak bitti. Giriş yaparak devam edebilirsin.": "Guest daily credits are exhausted. Sign in to continue.",
    "Yorum bulunamadı.": "Interpretation not found.",
    "Konu zorunludur.": "Subject is required.",
    "Mesaj zorunludur.": "Message is required.",
    "Ticket bulunamadı.": "Ticket not found.",
    "Email veya şifre hatalı.": "Incorrect email or password.",
    "Email doğrulanmadan giriş yapılamaz.": "You must verify your email before signing in.",
    "2FA kodu geçersiz.": "Invalid 2FA code.",
    "2FA kodu veya yedek kurtarma kodu gerekli.": "2FA code or recovery code is required.",
    "Bu email zaten kayıtlı.": "This email is already registered.",
    "Yetkisiz erişim.": "Unauthorized access.",
    "Geçersiz veya süresi dolmuş token.": "Invalid or expired token.",
    "Bu sayfa sadece admin kullanıcılar içindir.": "This page is only for admin users.",
    "Kullanıcılar alınamadı": "Could not fetch users",
    "Silme başarısız": "Delete failed",
    "Kayıt bulunamadı.": "No record found.",
    "Aktif oturum yok.": "No active session.",
    "Henüz yorum yok.": "No interpretation yet.",
    "Yanıt gönderildi.": "Reply sent.",
    "Ticket oluşturuldu.": "Ticket created.",
    "Ticket güncellendi.": "Ticket updated.",
    "Canlı bildirim bağlantısı kesildi, tekrar denenecek.": "Live notification connection lost, retrying."
  };

  function t(key, fallback = "") {
    return text[lang]?.[key] || fallback || key;
  }

  function mapServerError(message) {
    if (lang === "tr") return message;
    if (!message) return message;
    return serverErrorMap[message] || message;
  }

  function applyText(selector, value) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.textContent = value;
  }

  function applyHtml(selector, value) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.innerHTML = value;
  }

  function setTitle(title) {
    if (title) document.title = title;
  }

  function translateIndex() {
    if (lang === "tr") return;

    setTitle("RüyaYorum - Dream Interpreter");
    applyText(".logo", "🔮 RüyaYorum");
    applyText("#proTopBtn", "Go Pro");
    applyText("header.hero h1", "Discover the Secret of Your Dreams");
    applyText("header.hero p", "AI-powered deep dream interpretation. Let's read symbols, emotions, and your inner voice together.");
    const symbolCard = document.getElementById("symbolCard");
    if (symbolCard) symbolCard.title = "Click to add this symbol to your dream text";
    applyText(".symbol-title", "🌙 Symbol of the Day");
    applyText("#symbolText", "Loading...");
    applyText("#yorum-araci h2", "Dream Interpretation Tool");
    applyHtml("#hakDurumu", "Daily credits: <strong>2</strong>/2");
    const dreamInput = document.getElementById("dreamInput");
    if (dreamInput) dreamInput.placeholder = "Write your dream here...";
    applyText("#btnPsikolojik", "🧠 Psychological");
    applyText("#btnDini", "🕌 Religious");
    applyText("#sampleBtn", "✨ Example");
    applyText("#interpretBtn", "🔮 Interpret My Dream");
    const loaderText = document.querySelector("#loader span:last-child");
    if (loaderText) loaderText.textContent = "Preparing mystical analysis...";
    applyText("#resultContent", "Your interpretation will appear here.");
    applyText("#copyBtn", "Copy");
    applyText("#waBtn", "Share on WhatsApp");
    applyText("#retryBtn", "🔄 Re-interpret");
    applyText("#visualBtn", "📸 Create Visual");
    applyText("#downloadBtn", "Download");
    const historyTitle = document.querySelector("#yorum-araci h3");
    if (historyTitle) historyTitle.textContent = "📜 Interpretation History";

    applyText("section.section.glass:nth-of-type(3) h2", "How It Works?");
    applyText("section.section.glass:nth-of-type(3) .info-card:nth-child(1) h3", "1. Write");
    applyText("section.section.glass:nth-of-type(3) .info-card:nth-child(1) p", "Write your dream clearly in short sentences.");
    applyText("section.section.glass:nth-of-type(3) .info-card:nth-child(2) h3", "2. Interpret");
    applyText("section.section.glass:nth-of-type(3) .info-card:nth-child(2) p", "AI analyzes symbols in layered form using a Jungian approach.");
    applyText("section.section.glass:nth-of-type(3) .info-card:nth-child(3) h3", "3. Discover");
    applyText("section.section.glass:nth-of-type(3) .info-card:nth-child(3) p", "Carry the message into daily life and boost awareness.");

    applyText("section.section.glass:nth-of-type(4) h2", "Important Legal Notice");
    applyText("section.section.glass:nth-of-type(4) .legal-note", "Content on this platform is generated by AI and intended for information/entertainment only. It does not replace definitive judgment, religious fatwa, medical or legal advice.");

    applyText("section.section.glass:nth-of-type(5) h2", "User Reviews");
    applyText("section.section.glass:nth-of-type(6) h2", "Pro Membership");
    applyText("section.section.glass:nth-of-type(6) .plan:nth-child(1) h3", "Free");
    applyText("section.section.glass:nth-of-type(6) .plan:nth-child(1) li:nth-child(1)", "2 dream interpretations per day");
    applyText("section.section.glass:nth-of-type(6) .plan:nth-child(1) li:nth-child(2)", "Basic symbol analysis");
    applyText("section.section.glass:nth-of-type(6) .plan:nth-child(1) li:nth-child(3)", "Fast results");
    const proTitle = document.querySelector("section.section.glass:nth-of-type(6) .plan:nth-child(2) h3");
    if (proTitle) proTitle.innerHTML = 'Pro <span class="badge">Soon</span>';
    applyText("section.section.glass:nth-of-type(6) .plan:nth-child(2) li:nth-child(1)", "Unlimited interpretations");
    applyText("section.section.glass:nth-of-type(6) .plan:nth-child(2) li:nth-child(2)", "View interpretation history");
    applyText("section.section.glass:nth-of-type(6) .plan:nth-child(2) li:nth-child(3)", "Detailed deep analysis");
    applyText(".payment-placeholder", "Payment Infrastructure Coming Soon");

    applyText("#statsLine", "You interpreted 0 dreams this month 🔮");
    const footer = document.querySelector("footer.glass");
    if (footer) {
      const first = footer.querySelector("div:first-child");
      if (first) first.textContent = "© 2026 RüyaYorum. All rights reserved.";
      const links = footer.querySelector("div:nth-child(2)");
      if (links) {
        links.innerHTML =
          '<a href="/gizlilik.html">Privacy Policy</a> · ' +
          '<a href="/cerez-politikasi.html">Cookie Policy</a> · ' +
          '<a href="/kullanim-kosullari.html">Terms of Use</a> · ' +
          '<a href="/kvkk.html">Data Protection Notice</a> · ' +
          '<a href="/yasal-uyari.html">Legal Disclaimer</a> · ' +
          '<a href="mailto:iletisim@ruyayorum.app">Contact</a>';
      }
    }
  }

  function translateAuth() {
    if (lang === "tr") return;
    setTitle("RüyaYorum - Login/Register");
    applyText("#authSection h2", "Your Account");
    applyText("#tabGiris", "Login");
    applyText("#tabKayit", "Register");
    const placeholders = {
      "#girisEmail": "Email",
      "#girisSifre": "Password",
      "#giris2fa": "2FA code (optional)",
      "#girisRecovery": "Recovery code (optional)",
      "#forgotEmail": "Registered email",
      "#kayitAd": "Full name",
      "#kayitEmail": "Email",
      "#kayitSifre": "Password (min 8, upper/lower + number)",
      "#resetPassword": "New password (min 8, upper/lower + number)"
    };
    Object.entries(placeholders).forEach(([selector, value]) => {
      const el = document.querySelector(selector);
      if (el) el.placeholder = value;
    });
    applyText("#formGiris .btn.btn-main", "Login");
    applyText("#forgotBtn", "Forgot Password");
    applyText("#formForgot .btn.btn-main", "Send Reset Link");
    applyText("#backToLoginBtn", "Back");
    applyText("#formKayit .btn.btn-main", "Register");
    applyText("#resetSection h2", "Set New Password");
    applyText("#formReset .btn.btn-main", "Update Password");
    const profileBox = document.getElementById("profilBox");
    if (profileBox && profileBox.textContent.includes("Hoş geldin")) {
      profileBox.innerHTML = profileBox.innerHTML
        .replace("Hoş geldin,", "Welcome,")
        .replace("Plan:", "Plan:")
        .replace("Rol:", "Role:")
        .replace("Çıkış Yap", "Logout")
        .replace("Admin Paneli", "Admin Panel")
        .replace(">Profil<", ">Profile<")
        .replace(">Destek<", ">Support<");
    }
  }

  function translateProfile() {
    if (lang === "tr") return;
    setTitle("RüyaYorum - Profile");
    applyText("main .section h2", "My Profile");
    applyText("a[href='/']", "Home");
    applyText(".profile-card:nth-child(1) h3", "Account Settings");
    applyText(".profile-card:nth-child(1) label:nth-child(1)", "Name");
    applyText(".profile-card:nth-child(1) label:nth-child(2)", "Email");
    applyText(".profile-card:nth-child(1) button", "Save");
    applyText(".profile-card:nth-child(2) h3", "Change Password");
    applyText(".profile-card:nth-child(2) label:nth-child(1)", "Current Password");
    applyText(".profile-card:nth-child(2) label:nth-child(2)", "New Password");
    applyText(".profile-card:nth-child(2) button", "Update Password");
    applyText(".profile-card:nth-child(3) h3", "2FA Security");
    applyText("#twoFaBeginBtn", "Start 2FA Setup");
    applyText("#downloadRecoveryBtn", "Download Codes (.txt)");
    applyText("main .section:nth-of-type(3) h2", "Active Sessions");
    applyText("main .section:nth-of-type(4) h2", "My Interpretation History");
    const recoveryHint = document.querySelector("#recoveryCodesBox p");
    if (recoveryHint) recoveryHint.textContent = "Your one-time recovery codes (save them):";
  }

  function translateAdmin() {
    if (lang === "tr") return;
    setTitle("RüyaYorum Admin");
    applyText("main .section:nth-of-type(1) h2", "Admin Panel");
    applyText("main .section:nth-of-type(2) h2", "Users");
    applyText("thead tr th:nth-child(1)", "Email");
    applyText("thead tr th:nth-child(2)", "Role");
    applyText("thead tr th:nth-child(3)", "Plan");
    applyText("thead tr th:nth-child(4)", "Active");
    applyText("thead tr th:nth-child(5)", "Action");
    const searchEmail = document.getElementById("searchEmail");
    if (searchEmail) searchEmail.placeholder = "Search email";
    applyText("#searchBtn", "Search");
    applyText("#prevPage", "Previous");
    applyText("#nextPage", "Next");
    applyText("main .section:nth-of-type(3) h2", "User Details");
    applyText("main .section:nth-of-type(4) h2", "Audit Log");
    applyText("main .section:nth-of-type(5) h2", "Ticket Management");
    const ticketSearch = document.getElementById("ticketSearch");
    if (ticketSearch) ticketSearch.placeholder = "Search subject";
    applyText("#ticketStatus option[value='']", "All Statuses");
    applyText("#ticketStatus option[value='open']", "Open");
    applyText("#ticketStatus option[value='closed']", "Closed");
    applyText("#ticketPriority option[value='']", "All Priorities");
    applyText("#ticketPriority option[value='normal']", "Normal");
    applyText("#ticketFilterBtn", "Filter");
    applyText("#ticketPrevPage", "Previous");
    applyText("#ticketNextPage", "Next");
    const userDetailEmpty = document.querySelector("#userDetailBox .history-text");
    if (userDetailEmpty) userDetailEmpty.textContent = "Select a user from the table to view details.";
    const auditEmpty = document.querySelector("#auditRows .history-text");
    if (auditEmpty) auditEmpty.textContent = "Loading...";
    const ticketEmpty = document.querySelector("#adminTicketDetail .history-text");
    if (ticketEmpty) ticketEmpty.textContent = "Select a ticket.";
  }

  function translateSupport() {
    if (lang === "tr") return;
    setTitle("RüyaYorum - Support");
    applyText("main .section:nth-of-type(1) h2", "Support Center");
    applyText("main .section:nth-of-type(1) a[href='/']", "Home");
    const p = document.querySelector("main .section:nth-of-type(1) p");
    if (p) p.textContent = "You can send us your issue as a support ticket.";
    applyText(".profile-card:nth-child(1) h3", "New Ticket");
    applyText(".profile-card:nth-child(1) label:nth-child(1)", "Subject");
    applyText(".profile-card:nth-child(1) label:nth-child(2)", "Category");
    applyText(".profile-card:nth-child(1) label:nth-child(3)", "Message");
    applyText(".profile-card:nth-child(1) label:nth-child(4)", "Attachment (optional)");
    applyText("#ticketCategory option[value='genel']", "General");
    applyText("#ticketCategory option[value='hesap']", "Account");
    applyText("#ticketCategory option[value='odeme']", "Billing");
    applyText("#ticketCategory option[value='teknik']", "Technical");
    applyText(".profile-card:nth-child(1) button.btn.btn-main", "Send");
    applyText(".profile-card:nth-child(2) h3", "My Tickets");
    applyText("main .section:nth-of-type(3) h2", "Ticket Details");
    const detailEmpty = document.querySelector("#ticketDetail .history-text");
    if (detailEmpty) detailEmpty.textContent = "Select a ticket from the list to view details.";
  }

  function translateLegal() {
    if (lang === "tr") return;

    const h2 = document.querySelector("main .section h2");
    if (!h2) return;

    if (h2.textContent.includes("Gizlilik")) {
      setTitle("RüyaYorum - Privacy Policy");
      h2.textContent = "Privacy Policy";
      const ps = document.querySelectorAll("main .section .legal-note");
      if (ps[0]) ps[0].textContent = "RüyaYorum processes limited technical data to improve service quality. Email data is stored for account security and session management. Sensitive data is retained only as necessary and is not shared with unauthorized third parties.";
      if (ps[1]) ps[1].textContent = "Account data can be deleted upon user request. Security logs may be retained for a reasonable period to prevent abuse and fraud.";
    } else if (h2.textContent.includes("Çerez")) {
      setTitle("RüyaYorum - Cookie Policy");
      h2.textContent = "Cookie Policy";
      const ps = document.querySelectorAll("main .section .legal-note");
      if (ps[0]) ps[0].textContent = "The site may use essential cookies for session, security, and core user experience. Analytics cookies should only be enabled with explicit consent.";
      if (ps[1]) ps[1].textContent = "You can manage or delete cookies via browser settings. Disabling essential cookies may cause some features to stop working.";
    } else if (h2.textContent.includes("Kullanım")) {
      setTitle("RüyaYorum - Terms of Use");
      h2.textContent = "Terms of Use";
      const ps = document.querySelectorAll("main .section .legal-note");
      if (ps[0]) ps[0].textContent = "By using RüyaYorum, you agree to platform rules. The service may not be used for abuse, attacks, spam, or unlawful activity.";
      if (ps[1]) ps[1].textContent = "AI outputs are informational and do not constitute definitive advice. Terms may be updated when needed.";
    } else if (h2.textContent.includes("KVKK")) {
      setTitle("RüyaYorum - Data Protection Notice");
      h2.textContent = "Data Protection Notice";
      const ps = document.querySelectorAll("main .section .legal-note");
      if (ps[0]) ps[0].textContent = "As a data controller under applicable data protection law, we may process personal data for service delivery, security, user support, and legal obligations.";
      if (ps[1]) ps[1].textContent = "As a data subject, you have rights to access, correction, deletion, restriction, and objection. Contact: iletisim@ruyayorum.app";
    } else if (h2.textContent.includes("Yasal")) {
      setTitle("RüyaYorum - Legal Disclaimer");
      h2.textContent = "Legal Disclaimer";
      const ps = document.querySelectorAll("main .section .legal-note");
      if (ps[0]) ps[0].textContent = "Dream interpretations are AI-generated. They do not replace religious fatwa, psychological diagnosis, medical or legal counseling. Seek expert support for important decisions.";
      if (ps[1]) ps[1].textContent = "Platform content is for information and personal awareness only; it does not claim certainty.";
    }

    const homeLink = document.querySelector("a[href='/']");
    if (homeLink) homeLink.textContent = "Home";
  }

  function translateOffline() {
    if (lang === "tr") return;
    setTitle("RüyaYorum - Offline");
    applyText("main h1", "🔮 Offline Mode");
    applyText("main p", "You appear to be offline. Please try again when your connection is back.");
  }

  function translateDynamicText() {
    if (lang !== "en") return;

    const replacements = [
      ["Yükleniyor...", "Loading..."],
      ["Sayfa", "Page"],
      ["Önceki", "Previous"],
      ["Sonraki", "Next"],
      ["Ara", "Search"],
      ["Filtrele", "Filter"],
      ["Kapat", "Close"],
      ["Sil", "Delete"],
      ["Aç", "Open"],
      ["Ticket bulunamadı.", "Ticket not found."],
      ["Audit kaydı yok.", "No audit log found."],
      ["Toplam", "Total"],
      ["kullanıcı", "users"],
      ["bu sayfada", "on this page"],
      ["kayıt gösteriliyor.", "records shown."],
      ["Evet", "Yes"],
      ["Hayır", "No"],
      ["Kullanıcı:", "User:"],
      ["Durum:", "Status:"],
      ["Öncelik:", "Priority:"],
      ["Kategori:", "Category:"],
      ["Admin Yanıtı", "Admin Reply"],
      ["Yanıt Gönder", "Send Reply"],
      ["Yorum silindi.", "Interpretation deleted."],
      ["Oturum kapatıldı.", "Session closed."],
      ["Profil güncellendi.", "Profile updated."],
      ["Şifre güncellendi.", "Password updated."]
    ];

    const nodes = document.querySelectorAll("*");
    nodes.forEach((node) => {
      if (!node || node.children.length) return;
      const value = node.textContent;
      if (!value) return;
      let next = value;
      replacements.forEach(([tr, en]) => {
        if (next.includes(tr)) next = next.replaceAll(tr, en);
      });
      if (next !== value) node.textContent = next;
    });
  }

  function renderSwitcher() {
    const wrap = document.createElement("div");
    wrap.style.position = "fixed";
    wrap.style.right = "14px";
    wrap.style.top = "14px";
    wrap.style.zIndex = "120";
    wrap.style.display = "flex";
    wrap.style.alignItems = "center";
    wrap.style.padding = "8px 10px";
    wrap.style.borderRadius = "10px";
    wrap.style.background = "rgba(15,14,30,0.85)";
    wrap.style.border = "1px solid rgba(240,192,64,0.3)";

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = t("langToggle", lang === "tr" ? "EN" : "TR");
    button.title = lang === "tr" ? "Switch to English" : "Türkçe'ye geç";
    button.style.background = "#1b1140";
    button.style.color = "#fff";
    button.style.border = "1px solid rgba(240,192,64,0.35)";
    button.style.borderRadius = "8px";
    button.style.padding = "5px 10px";
    button.style.cursor = "pointer";
    button.style.fontSize = "12px";
    button.style.fontWeight = "700";

    button.addEventListener("click", () => {
      lang = lang === "tr" ? "en" : "tr";
      localStorage.setItem(KEY, lang);
      location.reload();
    });

    wrap.appendChild(button);
    document.body.appendChild(wrap);
  }

  function applyPageTranslations() {
    const path = location.pathname;
    if (path === "/" || path.endsWith("/index.html")) {
      translateIndex();
      return;
    }
    if (path.endsWith("/auth.html")) {
      translateAuth();
      return;
    }
    if (path.endsWith("/profile.html")) {
      translateProfile();
      return;
    }
    if (path.endsWith("/admin.html")) {
      translateAdmin();
      return;
    }
    if (path.endsWith("/support.html")) {
      translateSupport();
      return;
    }
    if (path.endsWith("/offline.html")) {
      translateOffline();
      return;
    }
    translateLegal();
  }

  document.documentElement.lang = lang;

  window.I18N = {
    getLang: () => lang,
    isEnglish: () => lang === "en",
    setLang: (next) => {
      if (!supported.includes(next)) return;
      localStorage.setItem(KEY, next);
      lang = next;
      document.documentElement.lang = lang;
    },
    mapServerError,
    trEn: (trText, enText) => (lang === "en" ? enText : trText)
  };

  window.addEventListener("DOMContentLoaded", () => {
    renderSwitcher();
    applyPageTranslations();
    translateDynamicText();
    if (lang === "en") {
      setTimeout(translateDynamicText, 300);
      setTimeout(translateDynamicText, 1200);
    }
  });
})();
