    // Google Analytics placeholder: Buraya GA4 script kodu eklenebilir.
    const MAX_CHAR = 500;
    const DAILY_LIMIT = 999;
    const XOR_KEY = 47;
    const KEY_TS = "_rx_ts";
    const KEY_CT = "_rx_ct";
    const KEY_DT = "_rx_dt";
    const KEY_HIST = "_rx_hist";
    const KEY_FB = "_rx_fb";
    const KEY_TOTAL = "_rx_total";
    const ONE_DAY_MS = 86400000;

    const dreamInput = document.getElementById("dreamInput");
    const charCounter = document.getElementById("charCounter");
    const interpretBtn = document.getElementById("interpretBtn");
    const loader = document.getElementById("loader");
    const resultContent = document.getElementById("resultContent");
    const hakDurumu = document.getElementById("hakDurumu");
    const copyBtn = document.getElementById("copyBtn");
    const waBtn = document.getElementById("waBtn");
    const toast = document.getElementById("toast");
    const proTopBtn = document.getElementById("proTopBtn");
    const confettiCanvas = document.getElementById("confettiCanvas");
    const sampleBtn = document.getElementById("sampleBtn");
    const historyList = document.getElementById("historyList");
    const retryBtn = document.getElementById("retryBtn");
    const visualBtn = document.getElementById("visualBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const likeBtn = document.getElementById("likeBtn");
    const dislikeBtn = document.getElementById("dislikeBtn");
    const shareCanvas = document.getElementById("shareCanvas");
    const symbolCard = document.getElementById("symbolCard");
    const symbolText = document.getElementById("symbolText");
    const statsLine = document.getElementById("statsLine");
    const btnPsikolojik = document.getElementById("btnPsikolojik");
    const btnDini = document.getElementById("btnDini");
    const navbar = document.querySelector(".navbar");
    let yorumTipi = "psikolojik";
    let currentUser = null;
    let remoteHistory = [];
    let lastSuccessfulDream = "";
    let lastInterpretation = "";
    let lastYorumId = "";
    let lastShareDataUrl = "";
    function getLang() {
      return window.I18N?.getLang?.() === "en" ? "en" : "tr";
    }
    function getLocale() {
      return getLang() === "en" ? "en-US" : "tr-TR";
    }
    function trEn(trText, enText) {
      return getLang() === "en" ? enText : trText;
    }
    const sampleDreams = [
      "Rüyamda eski bir evde kapıları tek tek açıyordum, her odada farklı bir ışık vardı.",
      "Yüksek bir dağın tepesine çıktım ve ufukta altın renkli bir güneş doğuyordu.",
      "Kalabalık bir pazarda kayboldum ama sonunda çocukluk arkadaşımı buldum.",
      "Denizin üzerinde yürüyormuşum gibi hafif hissediyordum ve ay bana çok yakındı.",
      "Bir köprüden geçerken köprünün altında berrak bir nehir akıyordu.",
      "Beyaz bir kuş gelip omzuma kondu ve bana bakıp sonra göğe yükseldi.",
      "Eski bir saat buldum, saat geri doğru çalışıyordu ama huzurluydum.",
      "Bir bahçede ağaçlar konuşuyordu, her biri bana farklı öğüt veriyordu.",
      "Karanlık bir koridordan geçtim, en sonda parlak bir kapı açıldı.",
      "Rüyamda bir anahtar buldum ve yıllardır açılmayan bir sandığı açtım."
    ];
    const daySymbols = [
      ["Ay", "Sezgi ve içsel rehberlik artar."], ["Su", "Duyguların arınma ihtiyacını gösterir."],
      ["Anahtar", "Yeni bir çözüm kapısı açılır."], ["Köprü", "Bir geçiş dönemindesin."],
      ["Kuş", "Haber ve özgürleşme enerjisi taşır."], ["Ayna", "Kendinle yüzleşme çağrısıdır."],
      ["Ağaç", "Köklenme ve büyüme vaktidir."], ["Yıldız", "Umut ve ilahi işaretleri simgeler."],
      ["Merdiven", "Aşamalı yükselişi anlatır."], ["Kapı", "Yeni başlangıçlara işaret eder."],
      ["Yol", "Hayat yönün netleşiyor."], ["Dağ", "Sabırla aşılacak zorlukları simgeler."],
      ["Nehir", "Hayat akışına güvenmeyi hatırlatır."], ["Ateş", "Dönüşüm ve arınma enerjisidir."],
      ["Gül", "Kalpte açılan şefkati anlatır."], ["Kitap", "Bilgelik arayışını simgeler."],
      ["Taç", "Sorumluluk ve liderlik çağrısıdır."], ["Gemi", "Uzak hedeflere doğru yolculuktur."],
      ["Bulut", "Geçici belirsizlik dönemidir."], ["Güneş", "Netlik ve canlılık getirir."],
      ["Yağmur", "Rahmet ve tazelenme enerjisidir."], ["Toprak", "Denge ve sağlamlık verir."],
      ["Kale", "İçsel güvenlik ihtiyacını gösterir."], ["Balık", "Bereket ve rızık sembolüdür."],
      ["At", "Güç ve irade hareketlenir."], ["Çiçek", "Narin ama güçlü bir başlangıçtır."],
      ["Saat", "Zamanı doğru kullanma mesajıdır."], ["Hilal", "Manevi yenilenmeyi gösterir."],
      ["Işık", "Farkındalık kapılarının açılmasıdır."], ["Rüzgar", "Değişimin yaklaşmakta olduğunu anlatır."]
    ];

    const userMenu = document.createElement("div");
    userMenu.className = "row-left";
    navbar.appendChild(userMenu);

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
        const message = window.I18N?.mapServerError?.(rawMessage) || rawMessage;
        throw new Error(message);
      }

      return data?.data ?? data;
    }

    function renderUserMenu() {
      if (currentUser) {
        userMenu.innerHTML = `<span style="font-size:.9rem;color:var(--muted);">${currentUser.ad}</span>
        <a class="btn btn-secondary" href="/profile.html">${trEn("Profil", "Profile")}</a>
        <a class="btn btn-secondary" href="/support.html">${trEn("Destek", "Support")}</a>
        ${currentUser.role === "admin" ? `<a class="btn btn-secondary" href="/admin.html">${trEn("Admin", "Admin")}</a>` : ""}
        <button class="btn btn-secondary" id="logoutBtn" type="button">${trEn("Çıkış", "Logout")}</button>`;
        document.getElementById("logoutBtn").addEventListener("click", async () => {
          await apiFetch("/api/v1/auth/logout", { method: "POST" });
          currentUser = null;
          remoteHistory = [];
          renderUserMenu();
          renderHistory();
          updateHakUI();
        });
      } else {
        userMenu.innerHTML = `<a class="btn btn-secondary" href="/auth.html">${trEn("Giriş / Kayıt", "Login / Register")}</a>`;
      }
    }

    async function resolveCurrentUser() {
      try {
        const data = await apiFetch("/api/v1/auth/me");
        currentUser = data.user;
      } catch {
        currentUser = null;
      }
      renderUserMenu();
    }

    function encode(n) { return (n ^ XOR_KEY).toString(16); }
    function decode(s) {
      const parsed = parseInt(s, 16);
      if (Number.isNaN(parsed)) throw new Error("decode_failed");
      return parsed ^ XOR_KEY;
    }
    function hashDate(value) {
      let h = 2166136261;
      for (let i = 0; i < value.length; i += 1) {
        h ^= value.charCodeAt(i);
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
      }
      return (h >>> 0).toString(16);
    }

    function tipSec(tip) {
      yorumTipi = tip;
      btnPsikolojik.classList.toggle("aktif", tip === "psikolojik");
      btnDini.classList.toggle("aktif", tip === "dini");
    }

    function getTodayStr() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    }

    function persistHak(count, ts = Date.now()) {
      localStorage.setItem(KEY_TS, String(ts));
      localStorage.setItem(KEY_CT, encode(count));
      localStorage.setItem(KEY_DT, hashDate(getTodayStr()));
    }

    function readHak() {
      const rawTs = localStorage.getItem(KEY_TS);
      const rawCt = localStorage.getItem(KEY_CT);
      const rawDt = localStorage.getItem(KEY_DT);

      if (!rawTs && !rawCt && !rawDt) {
        persistHak(DAILY_LIMIT);
        return { sayi: DAILY_LIMIT };
      }

      if (!rawTs || !rawCt || !rawDt) {
        persistHak(0);
        return { sayi: 0 };
      }

      const ts = Number(rawTs);
      if (!Number.isFinite(ts) || ts <= 0) {
        persistHak(0);
        return { sayi: 0 };
      }

      if (Date.now() - ts > ONE_DAY_MS) {
        persistHak(DAILY_LIMIT);
        return { sayi: DAILY_LIMIT };
      }

      if (rawDt !== hashDate(getTodayStr())) {
        persistHak(0);
        return { sayi: 0 };
      }

      let decodedCount;
      try {
        decodedCount = decode(rawCt);
      } catch {
        persistHak(0);
        return { sayi: 0 };
      }

      if (!Number.isInteger(decodedCount) || decodedCount < 0 || decodedCount > DAILY_LIMIT) {
        persistHak(0);
        return { sayi: 0 };
      }
      return { sayi: decodedCount };
    }

    function writeHak(data) {
      const safe = Math.max(0, Math.min(DAILY_LIMIT, data.sayi));
      const ts = Number(localStorage.getItem(KEY_TS)) || Date.now();
      persistHak(safe, ts);
    }

    function readHistory() {
      if (currentUser) return remoteHistory;
      try {
        const parsed = JSON.parse(localStorage.getItem(KEY_HIST) || "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    function saveHistoryItem(item) {
      if (currentUser) return;
      const history = readHistory();
      history.unshift(item);
      localStorage.setItem(KEY_HIST, JSON.stringify(history.slice(0, 5)));
    }

    async function loadRemoteHistory() {
      if (!currentUser) return;
      try {
        const data = await apiFetch("/api/v1/yorum/gecmis");
        remoteHistory = (data.yorumlar || []).map((y) => ({
          id: y._id,
          tarih: new Date(y.createdAt).toLocaleString(getLocale()),
          tip: y.tip,
          ruya: y.ruya,
          yorum: y.yorum
        }));
        renderHistory();
      } catch {}
    }

    function renderHistory() {
      const history = readHistory();
      historyList.innerHTML = "";
      if (!history.length) {
        const empty = document.createElement("div");
        empty.className = "history-item";
        empty.innerHTML = `<div class="history-text">${trEn("Henüz geçmiş yorum yok.", "No interpretation history yet.")}</div>`;
        historyList.appendChild(empty);
        return;
      }
      history.forEach((item, index) => {
        const el = document.createElement("article");
        el.className = "history-item";
        el.innerHTML = `
          <button class="delete-btn" data-delete-index="${index}" type="button">🗑️</button>
          <div class="history-meta">${item.tarih} · ${item.tip}</div>
          <div class="history-text">${item.ruya.slice(0, 90)}${item.ruya.length > 90 ? "..." : ""}</div>
        `;
        el.addEventListener("click", (ev) => {
          if (ev.target instanceof HTMLElement && ev.target.closest("[data-delete-index]")) return;
          setResult(item.yorum, "");
          dreamInput.value = item.ruya;
          updateCounter();
          lastSuccessfulDream = item.ruya;
          lastInterpretation = item.yorum;
          lastYorumId = item.id || "";
          retryBtn.classList.remove("hidden");
          visualBtn.classList.remove("hidden");
          likeBtn.classList.remove("hidden");
          dislikeBtn.classList.remove("hidden");
        });
        historyList.appendChild(el);
      });
    }

    async function saveFeedback(value) {
      if (lastYorumId) {
        const puan = value === "up" ? 1 : -1;
        try {
          await apiFetch(`/api/v1/yorum/${lastYorumId}/puan`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ puan })
          });
          return;
        } catch {}
      }
      let arr;
      try {
        arr = JSON.parse(localStorage.getItem(KEY_FB) || "[]");
        if (!Array.isArray(arr)) arr = [];
      } catch {
        arr = [];
      }
      arr.push({ tarih: new Date().toISOString(), tip: yorumTipi, deger: value });
      localStorage.setItem(KEY_FB, JSON.stringify(arr.slice(-200)));
    }

    function readMonthlyTotal() {
      const monthKey = getTodayStr().slice(0, 7);
      try {
        const data = JSON.parse(localStorage.getItem(KEY_TOTAL) || "{}");
        if (data.month === monthKey && Number.isInteger(data.count)) return data.count;
      } catch {}
      localStorage.setItem(KEY_TOTAL, JSON.stringify({ month: monthKey, count: 0 }));
      return 0;
    }

    function increaseMonthlyTotal() {
      const monthKey = getTodayStr().slice(0, 7);
      const count = readMonthlyTotal() + 1;
      localStorage.setItem(KEY_TOTAL, JSON.stringify({ month: monthKey, count }));
      updateStats();
    }

    async function updateStats() {
      if (currentUser) {
        try {
          const data = await apiFetch("/api/v1/yorum/istatistik");
          statsLine.textContent = trEn(`Bu ay ${data.buAy} rüya yorumladın 🔮`, `You interpreted ${data.buAy} dreams this month 🔮`);
          return;
        } catch {}
      }
      statsLine.textContent = trEn(`Bu ay ${readMonthlyTotal()} rüya yorumladın 🔮`, `You interpreted ${readMonthlyTotal()} dreams this month 🔮`);
    }

    function renderDaySymbol() {
      const idx = Math.floor(Date.now() / ONE_DAY_MS) % daySymbols.length;
      const [symbol, meaning] = daySymbols[idx];
      symbolText.textContent = `${symbol}: ${meaning}`;
      symbolCard.dataset.symbol = symbol;
    }

    async function updateHakUI() {
      try {
        const data = await apiFetch("/api/v1/yorum/hak");
        const label = data.kalanHak === "sinirsiz" ? trEn("Sınırsız", "Unlimited") : data.kalanHak;
        const max = data.plan === "pro" ? "∞" : 2;
        hakDurumu.innerHTML = trEn(`Günlük hak: <strong>${label}</strong>/${max}`, `Daily credits: <strong>${label}</strong>/${max}`);
        return;
      } catch {}
      const { sayi } = readHak();
      hakDurumu.innerHTML = trEn(`Günlük hak: <strong>${sayi}</strong>/${DAILY_LIMIT}`, `Daily credits: <strong>${sayi}</strong>/${DAILY_LIMIT}`);
    }

    function setLoading(status) {
      loader.classList.toggle("show", status);
      interpretBtn.disabled = status;
    }

    function showToast(message) {
      toast.textContent = message;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2000);
    }

    function sanitizeInput(input) {
      return input.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/[<>]/g, "").trim();
    }

    function setResult(text, type) {
      resultContent.classList.remove("empty", "error");
      if (type) resultContent.classList.add(type);
      resultContent.textContent = text;
    }

    function updateCounter() {
      charCounter.textContent = trEn(`${dreamInput.value.length}/${MAX_CHAR} karakter`, `${dreamInput.value.length}/${MAX_CHAR} characters`);
    }

    function buildPrompt(userDream) {
      if (yorumTipi === "dini") {
        return `UYARI: Yanıtın içinde tek bir İngilizce,
Arapça, Almanca, Çince veya başka yabancı
dil kelimesi geçerse yanıt geçersizdir.
Her kelime Türkçe olmak ZORUNDA.

Sen yüzyıllık İslami rüya tabiri
geleneğini temsil eden derin bir ilim
adamısın. İbn Sirin'in "Tabirü'r-Rüya",
İmam Nablusi'nin "Tefsirü'l-Ahlam" ve
Kirmani'nin tabir metodolojisini içselleştirmiş,
bu ilmi hayatının merkezine koymuş birisin.

TEMEL İLKELERİN:
- Hz. Peygamber'in "Güzel rüya Allah'tandır,
  kötü rüya şeytandandır" hadisini rehber alırsın
- Şüpheli durumlarda daima hayra yorarsın
- Her rüyayı rüyayı görenin ruh hali,
  yaşı ve içinde bulunduğu dönemle
  birlikte değerlendirirsin
- Sembolleri Kuran ve Sünnet ışığında
  yorumlarsın
- Klasik alimlerin görüşlerine atıfta
  bulunursun ama hangi alimin hangi eserde
  söylediğinden emin değilsen uydurma,
  genel bir atıf yap
- Asla psikolojik analiz yapma,
  saf İslami tabir yap
- Türkçe yaz, tek kelime bile başka
  dil kullanma
- KESİNLİKLE kural: Hiçbir zaman
  hadis veya ayet numarası uydurma.
  Emin olmadığın durumlarda şöyle yaz:
  'Alimlere göre...' veya
  'İslami gelenekte...'
  Yanlış kaynak vermek büyük günahtır.

YORUM YAPISI:
🕌 Rüyanın Anlamı:
Rüyadaki her önemli sembolü tek tek ele al.
Her birini İslami tabir geleneğine göre
yorumla. Alimlerin bu konudaki görüşlerine
atıfta bulun. Müjdeli unsurları öne çıkar,
uyarı içerenleri nazik bir dille belirt.
En az 4-5 cümle yaz.

📖 Dini Kaynak:
Bu konuda şunları paylaş:
- Eğer konuyla doğrudan ilgili
  BİLİNEN bir ayet varsa yaz,
  sure ve ayet numarasını YAZMA,
  sadece mealini ver
- Eğer kesin bilmiyorsan şöyle yaz:
  "Alimlere göre bu tür rüyalar..."
  veya "İslami gelenekte..."
- KESİNLİKLE hadis numarası,
  kitap adı ve sayfa numarası yazma
- KESİNLİKLE ayet numarası yazma
- Uydurma hadis İslam'da büyük
  günahtır, bu yüzden şüpheli
  durumlarda sadece
  "alimlere göre" de geç

ÖRNEK DOĞRU KULLANIM:
"Alimlere göre güzel rüyalar
Allah'tan bir müjdedir. İslami
gelenekte ölmüş yakınlarla
konuşmak hayra yorulur."

ÖRNEK YANLIŞ KULLANIM:
"Hz. Peygamber buyurdu: '...'
(Müslim 4/159)" — BUNU YAPMA!

🤲 Hayatına Yansıması:
Bu rüyanın sahibine ne gibi mesajlar
verdiğini anlat. Hayatında nelere dikkat
etmesi, nelere şükretmesi, nelerden
sakınması gerektiğini belirt.
Duaya teşvik et. Umut verici ve
motive edici bir dille bitir.

⭐ Mesaj:
Tek cümleyle özlü, derin ve akılda
kalıcı bir dini mesaj ver.

Kullanıcı Rüyası:
${userDream}`;
      } else {
        return `[SYSTEM: You must respond ONLY in Turkish. Never use English, Ukrainian, Polish or any other language. Every single word must be Turkish.]

Sen mistik ve psikolojik bir rüya yorumcususun.
Jung ve evrensel semboller çerçevesinde yorum yapıyorsun.
YALNIZCA TÜRKÇE yaz. Başka dil kesinlikle yasak.
Sıcak, gizemli ve ilham verici bir dil kullan.

Şu yapıyı kullan:
🌙 Ana Sembol: (1 paragraf, sadece Türkçe)
🧠 Psikolojik Anlam: (1 paragraf, sadece Türkçe)
✨ Hayatına Yansıması: (1 paragraf, sadece Türkçe)
⭐ Mesaj: (1 kısa cümle, sadece Türkçe)

Kullanıcı Rüyası:
${userDream}`;
      }
    }

    async function fetchInterpretation(cleanDream) {
      const data = await apiFetch("/api/v1/yorum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruya: cleanDream,
          tip: yorumTipi,
          lang: getLang()
        })
      });
      return data;
    }

    function useOneHak() {
      const current = readHak();
      current.sayi = Math.max(0, current.sayi - 1);
      writeHak(current);
      updateHakUI();
    }

    function triggerConfetti() {
      const ctx = confettiCanvas.getContext("2d");
      const particles = [];
      const colors = ["#f0c040","#6c3fc7","#9b7cff","#ffffff","#7ad9ff"];
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
      for (let i = 0; i < 140; i++) {
        particles.push({
          x: Math.random() * confettiCanvas.width,
          y: -20 - Math.random() * confettiCanvas.height * 0.25,
          size: 4 + Math.random() * 5,
          speedY: 1.8 + Math.random() * 3.8,
          speedX: -1.5 + Math.random() * 3,
          rot: Math.random() * Math.PI,
          rotSpeed: -0.07 + Math.random() * 0.14,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      let frame = 0;
      function draw() {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        particles.forEach(p => {
          p.x += p.speedX; p.y += p.speedY; p.rot += p.rotSpeed;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
          ctx.restore();
        });
        if (++frame < 120) requestAnimationFrame(draw);
        else ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
      draw();
    }

    async function runInterpretation(cleanDream, consumeRight = true) {
      if (!cleanDream) { setResult(trEn("Lütfen rüyanı yaz.", "Please write your dream."), "error"); return; }

      try {
        setLoading(true);
        setResult(trEn("Yorum hazırlanıyor...", "Preparing interpretation..."), "");
        const result = await fetchInterpretation(cleanDream);
        const text = result.yorum;
        setResult(text, "");
        lastSuccessfulDream = cleanDream;
        lastInterpretation = text;
        lastYorumId = result.yorumId || "";
        if (consumeRight && !currentUser) useOneHak();
        saveHistoryItem({
          tarih: new Date().toLocaleString(getLocale()),
          tip: yorumTipi,
          ruya: cleanDream,
          yorum: text
        });
        if (currentUser) await loadRemoteHistory();
        renderHistory();
        increaseMonthlyTotal();
        await updateStats();
        retryBtn.classList.remove("hidden");
        visualBtn.classList.remove("hidden");
        likeBtn.classList.remove("hidden");
        dislikeBtn.classList.remove("hidden");
        triggerConfetti();
      } catch (err) {
        setResult(trEn(`Yorum alınamadı: ${err.message}`, `Interpretation failed: ${err.message}`), "error");
      } finally {
        setLoading(false);
      }
    }

    interpretBtn.addEventListener("click", async () => {
      const cleanDream = sanitizeInput(dreamInput.value);
      await runInterpretation(cleanDream, true);
    });

    retryBtn.addEventListener("click", async () => {
      if (!lastSuccessfulDream) {
        showToast(trEn("Önce bir yorum oluşturmalısın.", "Generate an interpretation first."));
        return;
      }
      await runInterpretation(lastSuccessfulDream, false);
    });

    copyBtn.addEventListener("click", async () => {
      const text = resultContent.textContent.trim();
      if (!text || resultContent.classList.contains("empty") || resultContent.classList.contains("error")) {
        showToast(trEn("Kopyalanacak bir yorum bulunamadı.", "No interpretation to copy.")); return;
      }
      try { await navigator.clipboard.writeText(text); showToast(trEn("Yorum panoya kopyalandı.", "Interpretation copied.")); }
      catch { showToast(trEn("Kopyalama başarısız oldu.", "Copy failed.")); }
    });

    waBtn.addEventListener("click", () => {
      const text = resultContent.textContent.trim();
      if (!text || resultContent.classList.contains("empty") || resultContent.classList.contains("error")) {
        showToast(trEn("Önce bir yorum oluşturmalısın.", "Generate an interpretation first.")); return;
      }
      window.open(`https://wa.me/?text=${encodeURIComponent("RüyaYorum sonucum:\n\n" + text)}`, "_blank", "noopener,noreferrer");
    });

    likeBtn.addEventListener("click", async () => {
      await saveFeedback("up");
      showToast(trEn("Geri bildiriminiz için teşekkürler!", "Thanks for your feedback!"));
    });
    dislikeBtn.addEventListener("click", async () => {
      await saveFeedback("down");
      showToast(trEn("Geri bildiriminiz için teşekkürler!", "Thanks for your feedback!"));
    });

    visualBtn.addEventListener("click", () => {
      const text = lastInterpretation || resultContent.textContent.trim();
      if (!text || resultContent.classList.contains("error")) {
        showToast(trEn("Görsel için önce geçerli bir yorum oluştur.", "Create a valid interpretation first."));
        return;
      }
      const ctx = shareCanvas.getContext("2d");
      const w = shareCanvas.width;
      const h = shareCanvas.height;
      const grd = ctx.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, "#1b1140");
      grd.addColorStop(1, "#0a0a1a");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      for (let i = 0; i < 120; i += 1) {
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#f0c040";
      ctx.font = "bold 52px Inter";
      ctx.fillText("🔮 RüyaYorum", 80, 120);
      ctx.fillStyle = "#f4f2ff";
      ctx.font = "38px Inter";
      const snippet = text.slice(0, 200);
      const words = snippet.split(" ");
      let line = "";
      let y = 360;
      words.forEach((word) => {
        const test = line + word + " ";
        if (ctx.measureText(test).width > w - 160) {
          ctx.fillText(line.trim(), 80, y);
          line = word + " ";
          y += 58;
        } else {
          line = test;
        }
      });
      if (line.trim()) ctx.fillText(line.trim(), 80, y);
      ctx.font = "32px Inter";
      ctx.fillStyle = "#c7c2e8";
      ctx.fillText("🌙 ✦ ✧", w - 240, 120);
      ctx.fillStyle = "#f0c040";
      ctx.fillText("ruyayorum.app", 80, h - 90);
      lastShareDataUrl = shareCanvas.toDataURL("image/png");
      downloadBtn.classList.remove("hidden");
      showToast(trEn("Görsel hazır. İndir'e tıkla.", "Visual is ready. Click Download."));
    });

    downloadBtn.addEventListener("click", () => {
      if (!lastShareDataUrl) return;
      const a = document.createElement("a");
      a.href = lastShareDataUrl;
      a.download = `ruyayorum-${Date.now()}.png`;
      a.click();
    });

    sampleBtn.addEventListener("click", () => {
      const pick = sampleDreams[Math.floor(Math.random() * sampleDreams.length)];
      dreamInput.value = pick;
      updateCounter();
      showToast(trEn("Örnek rüya eklendi.", "Sample dream inserted."));
    });

    historyList.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.matches("[data-delete-index]")) return;
      e.stopPropagation();
      const idx = Number(target.dataset.deleteIndex);
      if (currentUser) {
        const item = remoteHistory[idx];
        if (!item?.id) return;
        apiFetch(`/api/v1/yorum/${item.id}`, { method: "DELETE" })
          .then(() => loadRemoteHistory())
          .then(() => {
            renderHistory();
            showToast(trEn("Geçmiş yorum silindi.", "History item deleted."));
          })
          .catch((err) => showToast(err.message || trEn("Silme başarısız.", "Delete failed.")));
        return;
      }
      const history = readHistory();
      history.splice(idx, 1);
      localStorage.setItem(KEY_HIST, JSON.stringify(history));
      renderHistory();
      showToast(trEn("Geçmiş yorum silindi.", "History item deleted."));
    });

    symbolCard.addEventListener("click", () => {
      const sym = symbolCard.dataset.symbol || trEn("sembol", "symbol");
      const text = trEn(`Rüyamda ${sym} gördüm.`, `I saw ${sym} in my dream.`);
      dreamInput.value = dreamInput.value.trim() ? `${dreamInput.value.trim()}\n${text}` : text;
      updateCounter();
      showToast(trEn("Günün sembolü rüya metnine eklendi.", "Symbol of the day added to your dream text."));
    });

    proTopBtn.addEventListener("click", () => {
      document.getElementById("pro-section").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    btnPsikolojik.addEventListener("click", () => tipSec("psikolojik"));
    btnDini.addEventListener("click", () => tipSec("dini"));

    dreamInput.addEventListener("input", updateCounter);
    window.addEventListener("resize", () => {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    });

    (async () => {
      await resolveCurrentUser();
      await loadRemoteHistory();
      updateCounter();
      await updateHakUI();
      renderHistory();
      renderDaySymbol();
      await updateStats();
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      }
    })();
