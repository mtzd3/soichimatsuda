import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

class Control {
  constructor(dataset = {}) {
    this.dataset = dataset;
    this.listeners = {};
    this.hidden = true;
    this.textContent = "";
  }
  addEventListener(name, callback) {
    (this.listeners[name] ||= []).push(callback);
  }
  hasAttribute(name) {
    return name === "data-email-compose" && Boolean(this.compose);
  }
  getAttribute(name) {
    return name === "href" ? "#contact" : null;
  }
  async click() {
    for (const listener of this.listeners.click || [])
      await listener({ preventDefault() {} });
  }
}
function setup({ stored, analyticsFailure = false } = {}) {
  const contact = new Control({
    emailTopic: "startup-management",
    analyticsEvent: "cta_click",
    analyticsLabel: "startup",
  });
  contact.compose = true;
  const social = new Control({
    analyticsEvent: "social_click",
    analyticsLabel: "note",
  });
  const copy = new Control();
  const status = new Control();
  const events = [];
  const memory = new Map();
  if (stored !== undefined) memory.set("site_attribution", stored);
  let copied = "";
  const location = {
    search: "?utm_campaign=founder&email=private@example.com",
    pathname: "/",
    href: "",
  };
  const context = {
    document: {
      referrer: "",
      getElementById: (id) =>
        ({ year: new Control(), "copy-email": copy, "copy-status": status })[
          id
        ],
      querySelectorAll: (selector) =>
        selector === "[data-email-compose]"
          ? [contact]
          : selector === "[data-analytics-event]"
            ? [contact, social]
            : [],
    },
    window: {
      SITE_ANALYTICS: {
        provider: analyticsFailure ? "ga4" : "",
        gaMeasurementId: "test",
      },
      location,
      gtag: (...event) => {
        if (analyticsFailure) throw new Error("analytics unavailable");
        events.push(event);
      },
    },
    location,
    sessionStorage: {
      getItem: (key) => memory.get(key) || null,
      setItem: (key, value) => memory.set(key, value),
    },
    navigator: {
      clipboard: {
        writeText: async (value) => {
          copied = value;
        },
      },
    },
    URLSearchParams,
    console,
  };
  vm.runInNewContext(
    fs.readFileSync(new URL("../site.js", import.meta.url), "utf8"),
    context,
  );
  return {
    context,
    contact,
    social,
    copy,
    status,
    events,
    location,
    memory,
    getCopied: () => copied,
  };
}
const {
  context,
  contact,
  social,
  copy,
  status,
  events,
  location,
  memory,
  getCopied,
} = setup();
await contact.click();
const draft = new URL(location.href);
assert.equal(draft.protocol, "mailto:");
assert.equal(draft.pathname, "s.matsuda0913@gmail.com");
assert.equal(
  draft.searchParams.get("subject"),
  "創業・経営の相談｜松田総一さんへ",
);
assert.equal(events.filter((e) => e[1] === "contact_click").length, 1);
await social.click();
assert.equal(events.filter((e) => e[1] === "social_click").length, 1);
assert.equal(copy.hidden, false);
await copy.click();
assert.equal(getCopied(), draft.pathname);
assert.match(status.textContent, /コピーしました/);
assert.equal(events.filter((e) => e[1] === "contact_copy").length, 1);
assert.ok(!JSON.stringify(events).includes(draft.pathname));
assert.ok(!JSON.stringify(events).includes("private@example.com"));
assert.equal(JSON.parse(memory.get("site_attribution")).landing_page, "/");
context.navigator.clipboard.writeText = async () => {
  throw new Error("permission denied");
};
await copy.click();
assert.match(status.textContent, /コピーできませんでした/);
assert.equal(events.filter((e) => e[1] === "contact_copy").length, 1);
for (const stored of [
  "null",
  "[]",
  '"invalid"',
  "{broken",
  '{"landing_page":123}',
  '{"landing_page":"/old?email=private@example.com"}',
]) {
  const app = setup({ stored });
  await app.contact.click();
  assert.equal(new URL(app.location.href).protocol, "mailto:");
  await app.copy.click();
  assert.equal(app.getCopied(), draft.pathname);
  assert.ok(!JSON.stringify(app.events).includes("private@example.com"));
}
const withoutAnalytics = setup({ analyticsFailure: true });
await withoutAnalytics.contact.click();
await withoutAnalytics.copy.click();
assert.equal(new URL(withoutAnalytics.location.href).protocol, "mailto:");
assert.match(withoutAnalytics.status.textContent, /コピーしました/);
console.log(
  "PASS: email draft, social intent, clipboard, malformed storage and analytics failure, no raw query in custom events. No emails sent.",
);
