/* ============================================================
   ACAT Chatbot Widget
   Assam Cyber Aegis Team — floating FAQ assistant
   Usage: add this one line before </body> in index.html:
   <script src="acat-chatbot.js"></script>
   ============================================================ */
(function () {
  "use strict";

  // ---------- 1. Styles ----------
  const style = document.createElement("style");
  style.textContent = `
    #acat-chat-btn {
      position: fixed; bottom: 22px; right: 22px; z-index: 9999;
      width: 58px; height: 58px; border-radius: 50%;
      background: #0f766e; color: #fff; border: none; cursor: pointer;
      box-shadow: 0 6px 18px rgba(0,0,0,.25);
      display: flex; align-items: center; justify-content: center;
      font-size: 26px; transition: transform .2s ease;
    }
    #acat-chat-btn:hover { transform: scale(1.08); }

    #acat-chat-window {
      position: fixed; bottom: 92px; right: 22px; z-index: 9999;
      width: 320px; max-width: 90vw; height: 440px; max-height: 70vh;
      background: #fff; border-radius: 14px; overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,.3);
      display: none; flex-direction: column;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    }
    #acat-chat-window.open { display: flex; }

    #acat-chat-header {
      background: #0f766e; color: #fff; padding: 14px 16px;
      font-weight: 600; font-size: 15px;
      display: flex; justify-content: space-between; align-items: center;
    }
    #acat-chat-header span.sub { font-weight: 400; font-size: 11px; opacity: .85; display: block; }
    #acat-chat-close { background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; }

    #acat-chat-body {
      flex: 1; overflow-y: auto; padding: 12px;
      background: #f4f6f7; display: flex; flex-direction: column; gap: 8px;
    }
    .acat-msg { max-width: 82%; padding: 8px 12px; border-radius: 12px; font-size: 13.5px; line-height: 1.4; white-space: pre-wrap; }
    .acat-msg.bot { background: #e5e7eb; color: #111; align-self: flex-start; border-bottom-left-radius: 2px; }
    .acat-msg.user { background: #0f766e; color: #fff; align-self: flex-end; border-bottom-right-radius: 2px; }

    #acat-quick-replies { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 12px 8px; }
    .acat-chip {
      background: #fff; border: 1px solid #0f766e; color: #0f766e;
      font-size: 12px; padding: 5px 10px; border-radius: 999px; cursor: pointer;
    }
    .acat-chip:hover { background: #0f766e; color: #fff; }

    #acat-chat-input-row { display: flex; border-top: 1px solid #e5e7eb; padding: 8px; gap: 6px; }
    #acat-chat-input {
      flex: 1; border: 1px solid #d1d5db; border-radius: 999px; padding: 8px 14px;
      font-size: 13px; outline: none;
    }
    #acat-chat-send {
      background: #0f766e; color: #fff; border: none; border-radius: 999px;
      width: 36px; height: 36px; cursor: pointer; font-size: 15px;
    }
  `;
  document.head.appendChild(style);

  // ---------- 2. HTML ----------
  const btn = document.createElement("button");
  btn.id = "acat-chat-btn";
  btn.setAttribute("aria-label", "Open ACAT chat assistant");
  btn.innerHTML = "💬";

  const win = document.createElement("div");
  win.id = "acat-chat-window";
  win.innerHTML = `
    <div id="acat-chat-header">
      <div>ACAT Assistant<span class="sub">Assam Cyber Aegis Team</span></div>
      <button id="acat-chat-close" aria-label="Close chat">✕</button>
    </div>
    <div id="acat-chat-body"></div>
    <div id="acat-quick-replies"></div>
    <div id="acat-chat-input-row">
      <input id="acat-chat-input" type="text" placeholder="Type your question..." />
      <button id="acat-chat-send" aria-label="Send">➤</button>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(win);

  // ---------- 3. FAQ knowledge base (edit freely) ----------
  const FAQ = [
    // --- About / general ---
    { keys: ["what is acat", "about acat", "who are you", "what does acat do", "purpose"],
      a: "ACAT (Assam Cyber Aegis Team) is a volunteer cyber-safety initiative working to protect and educate people of Assam against cybercrime, scams, and online threats." },
    { keys: ["hi", "hello", "hey", "namaste"],
      a: "Hey! 👋 I'm the ACAT assistant. Ask me about our mission, reporting cybercrime, safety, or how to reach us." },
    { keys: ["free", "cost", "charge", "money to use", "paid service"],
      a: "Yes, all ACAT services — guidance, awareness sessions, and support — are completely free for the public. We're a volunteer-run initiative." },
    { keys: ["legit", "genuine", "real organisation", "real organization", "official", "trust", "trustworthy"],
      a: "ACAT is a genuine volunteer initiative focused on cyber-safety in Assam. You can verify our team and work through the About/Team section on this website." },

    // --- Security & safety of the site/data ---
    { keys: ["is it secure", "is this secure", "is it safe", "is this safe", "safe to use", "secure site", "secure website"],
      a: "Yes — this website uses secure (HTTPS) connections, and we don't sell or misuse your data. Always avoid sharing sensitive info like OTPs or passwords with anyone, including us." },
    { keys: ["data privacy", "privacy policy", "my data", "personal information", "data safe", "misuse data"],
      a: "We take privacy seriously. Any information you share (like in a report) is used only to help resolve your issue — check our Privacy Policy page for full details." },
    { keys: ["otp", "password share", "share password", "share otp"],
      a: "Never share your OTP, password, or PIN with anyone — ACAT, banks, or any legit organisation will NEVER ask for these." },

    // --- Reporting / cybercrime help ---
    { keys: ["report", "complaint", "scam", "fraud", "hacked", "cheated", "money lost", "lost money online"],
      a: "To report a cyber incident, use the contact/report section on our website, or reach out to the National Cyber Crime Helpline 1930 / cybercrime.gov.in for official complaints." },
    { keys: ["evidence", "screenshot", "proof needed", "what to submit"],
      a: "When reporting, keep screenshots, transaction IDs, chat records, and the scammer's contact/UPI details ready — this speeds up investigation." },
    { keys: ["how long", "response time", "how fast", "when will i get reply", "resolution time"],
      a: "We typically respond within 1-2 working days. For urgent/ongoing fraud (like an active bank transaction), immediately call 1930 as well." },
    { keys: ["phishing", "fake link", "suspicious link", "fake website", "fake sms", "fake email"],
      a: "Don't click unknown/suspicious links from SMS, email, or WhatsApp. Verify the sender, check the URL carefully, and report it to us or via cybercrime.gov.in." },
    { keys: ["cyberbullying", "harassment", "blackmail", "threat online", "being threatened"],
      a: "If you're facing online harassment or blackmail, please reach out to us immediately via the contact form — we can guide you on safe next steps and reporting to authorities." },
    { keys: ["social media", "instagram hacked", "facebook hacked", "account hacked", "whatsapp hacked"],
      a: "If your social media account is hacked, use the platform's official 'account recovery' option first, then report the incident to us and on cybercrime.gov.in." },
    { keys: ["children", "kids safety", "child safety", "minor"],
      a: "We also run awareness programs around child online safety — parents/schools can reach out to us for sessions on safe internet use for kids." },
    { keys: ["women safety", "women helpline"],
      a: "For women's safety concerns online, you can reach out to us directly, or the Women Helpline 181 / National Cyber Crime Helpline 1930." },

    // --- Team / involvement ---
    { keys: ["join", "volunteer", "member", "team", "internship", "career"],
      a: "We'd love to have you onboard! Check the 'Join Us' or 'Contact' section on the site, or drop us a message with your interest area (tech, awareness, legal, design)." },
    { keys: ["contact", "email", "reach", "phone number", "get in touch"],
      a: "You can reach ACAT through the contact form on this website. We usually respond within 1-2 working days." },
    { keys: ["ceo", "founder", "dhiraj"],
      a: "Dhiraj Nath is the CEO of ACAT." },
    { keys: ["cto", "sourav", "technical", "developer", "website made by", "who built"],
      a: "Sourav Maity is the CTO of ACAT, handling the tech and website side of things. The website was built by LyroWeb Solutions." },
    { keys: ["location", "based in", "where are you", "assam only", "outside assam"],
      a: "ACAT is based in Assam and primarily focused on the region, though our online guidance and awareness content is useful for anyone." },

    // --- Donation / awareness ---
    { keys: ["donate", "donation", "psf", "support us", "funding"],
      a: "You can support our cause through the PSF (People Support Foundation) donation initiative linked from our website — funds go towards helping students and people in need." },
    { keys: ["awareness", "workshop", "training", "school", "seminar", "session"],
      a: "ACAT runs cyber-safety awareness workshops, including AI-literacy and safe-internet sessions for schools and communities." },

    // --- Meta ---
    { keys: ["thank", "thanks", "thank you"],
      a: "You're welcome! Stay safe online 🙏 Feel free to ask if you have more questions." },
    { keys: ["bye", "goodbye"],
      a: "Take care and stay cyber-safe! 👋" },
  ];

  const FALLBACK = "Hmm, mujhe iska exact jawab nahi pata 🙏 — aap humein contact form se directly reach kar sakte ho, ya '1930' pe cybercrime helpline call kar sakte ho.";

  const QUICK_REPLIES = [
    "What is ACAT?",
    "Is it secure and safe?",
    "How to report a scam?",
    "Is this service free?",
    "How to join as volunteer?",
    "Contact info"
  ];

  // ---------- 4. Logic ----------
  const body = win.querySelector("#acat-chat-body");
  const chipsWrap = win.querySelector("#acat-quick-replies");
  const input = win.querySelector("#acat-chat-input");

  function addMsg(text, sender) {
    const el = document.createElement("div");
    el.className = "acat-msg " + sender;
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function getAnswer(text) {
    const t = text.toLowerCase();
    for (const item of FAQ) {
      if (item.keys.some(k => t.includes(k))) return item.a;
    }
    return FALLBACK;
  }

  function renderChips() {
    chipsWrap.innerHTML = "";
    QUICK_REPLIES.forEach(q => {
      const chip = document.createElement("button");
      chip.className = "acat-chip";
      chip.textContent = q;
      chip.onclick = () => handleSend(q);
      chipsWrap.appendChild(chip);
    });
  }

  function handleSend(text) {
    const msg = (text || input.value).trim();
    if (!msg) return;
    addMsg(msg, "user");
    input.value = "";
    setTimeout(() => addMsg(getAnswer(msg), "bot"), 300);
  }

  btn.addEventListener("click", () => {
    win.classList.toggle("open");
    if (win.classList.contains("open") && body.children.length === 0) {
      addMsg("Hi! 👋 I'm the ACAT Assistant. Ask me anything about cyber safety, reporting, or our team.", "bot");
      renderChips();
    }
  });
  win.querySelector("#acat-chat-close").addEventListener("click", () => win.classList.remove("open"));
  win.querySelector("#acat-chat-send").addEventListener("click", () => handleSend());
  input.addEventListener("keydown", e => { if (e.key === "Enter") handleSend(); });
})();
