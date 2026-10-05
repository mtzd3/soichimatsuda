// Build the email address only when a visitor chooses to compose or copy.
// Track contact intent; actual enquiries arrive in Gmail.
(() => {
  document.getElementById("year").textContent = String(
    new Date().getFullYear(),
  );
  const config = window.SITE_ANALYTICS || {};
  const campaignKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ];
  const params = new URLSearchParams(location.search);
  let stored = {};
  try {
    const saved = JSON.parse(
      sessionStorage.getItem("site_attribution") || "{}",
    );
    if (saved && typeof saved === "object" && !Array.isArray(saved)) {
      stored = Object.fromEntries(
        [...campaignKeys, "landing_page"]
          .filter((key) => typeof saved[key] === "string")
          .map((key) => [key, saved[key]]),
      );
    }
  } catch {
    /* Optional storage. */
  }
  const campaign = Object.fromEntries(
    campaignKeys
      .map((key) => [key, params.get(key)])
      .filter(([, value]) => value),
  );
  const attribution = {
    ...stored,
    landing_page: (stored.landing_page || location.pathname).split(/[?#]/)[0],
    ...campaign,
  };
  try {
    sessionStorage.setItem("site_attribution", JSON.stringify(attribution));
  } catch {
    /* Contact stays usable. */
  }

  if (config.provider === "ga4" && config.gaMeasurementId) {
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };
    try {
      window.gtag("js", new Date());
      window.gtag("config", config.gaMeasurementId, { anonymize_ip: true });
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.gaMeasurementId)}`;
      document.head.appendChild(script);
    } catch {
      /* Analytics must not prevent visitors from contacting us. */
    }
  }
  const track = (event, payload) => {
    if (config.debug) console.info("[site-analytics]", event, payload);
    try {
      window.gtag?.("event", event, payload);
    } catch {
      /* Keep navigation and clipboard feedback independent of analytics. */
    }
  };
  const emailAddress = () =>
    ["s.matsuda0913", "gmail.com"].join(String.fromCharCode(64));
  const topics = {
    "ai-advisor": "AI・半導体の技術相談",
    "deeptech-strategy": "事業戦略の相談",
    "poc-to-production": "PoCから本番導入の相談",
    "startup-management": "創業・経営の相談",
    capital: "資金調達・提携・経営判断の相談",
  };
  document.querySelectorAll("[data-email-compose]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const subject = `${topics[link.dataset.emailTopic] || "ご相談"}｜松田総一さんへ`;
      window.location.href = `mailto:${emailAddress()}?subject=${encodeURIComponent(subject)}`;
    });
  });
  document.querySelectorAll("[data-analytics-event]").forEach((link) => {
    link.addEventListener("click", () => {
      const event = link.hasAttribute("data-email-compose")
        ? "contact_click"
        : link.dataset.analyticsEvent;
      track(event, {
        label: link.dataset.analyticsLabel,
        contact_topic: link.dataset.emailTopic,
        landing_page: attribution.landing_page,
        ...Object.fromEntries(
          campaignKeys
            .map((key) => [key, attribution[key]])
            .filter(([, value]) => value),
        ),
      });
    });
  });
  document.querySelectorAll(".faq-item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open)
        track("faq_open", {
          question: item.querySelector("summary").textContent.trim(),
        });
    });
  });
  const copyButton = document.getElementById("copy-email");
  if (navigator.clipboard?.writeText && copyButton) {
    copyButton.hidden = false;
    copyButton.addEventListener("click", async () => {
      const status = document.getElementById("copy-status");
      try {
        await navigator.clipboard.writeText(emailAddress());
        status.textContent = "メールアドレスをコピーしました。";
        track("contact_copy", {
          label: "contact_email_copy",
          landing_page: attribution.landing_page,
        });
      } catch {
        status.textContent =
          "コピーできませんでした。表示されたアドレスの[アット]を@に置き換えてお使いください。";
      }
    });
  }
})();
