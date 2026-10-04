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
let copied = "";
const location = { search: "?utm_campaign=founder", pathname: "/", href: "" };
const context = {
  document: {
    referrer: "",
    getElementById: (id) =>
      ({ year: new Control(), "copy-email": copy, "copy-status": status })[id],
    querySelectorAll: (selector) =>
      selector === "[data-email-compose]"
        ? [contact]
        : selector === "[data-analytics-event]"
          ? [contact, social]
          : [],
  },
  window: {
    SITE_ANALYTICS: { provider: "" },
    location,
    gtag: (...event) => events.push(event),
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
assert.equal(copied, draft.pathname);
assert.match(status.textContent, /コピーしました/);
assert.equal(events.filter((e) => e[1] === "contact_copy").length, 1);
assert.ok(!JSON.stringify(events).includes(draft.pathname));
context.navigator.clipboard.writeText = async () => {
  throw new Error("permission denied");
};
await copy.click();
assert.match(status.textContent, /コピーできませんでした/);
assert.equal(events.filter((e) => e[1] === "contact_copy").length, 1);
console.log(
  "PASS: draft recipient and subject, social intent, clipboard success/failure, no mailbox in analytics. No emails sent.",
);
