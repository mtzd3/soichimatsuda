const SLACK_TEXT_LIMIT = 2900;
const SLACK_FIELD_LIMIT = 1900;

const FIELD_LABELS = {
    name: "お名前",
    company: "会社名・組織名",
    email: "返信先",
    topic: "ご相談内容",
    interest: "流入テーマ",
    page_url: "送信ページ",
    landing_page: "ランディング",
    referrer: "参照元",
    utm_source: "UTM source",
    utm_medium: "UTM medium",
    utm_campaign: "UTM campaign",
    utm_content: "UTM content",
    utm_term: "UTM term"
};

export default {
    async fetch(request, env) {
        if (request.method === "OPTIONS") {
            return jsonResponse({ ok: true });
        }

        if (request.method !== "POST") {
            return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
        }

        if (!env.SLACK_WEBHOOK_URL) {
            return jsonResponse({ ok: false, error: "missing_slack_webhook_url" }, 500);
        }

        let submission;
        try {
            submission = await readSubmission(request);
        } catch (error) {
            return jsonResponse({ ok: false, error: "invalid_payload", detail: error.message }, 400);
        }

        const formData = normalizeFormData(submission);
        if (Object.keys(formData).length === 0) {
            return jsonResponse({ ok: false, error: "empty_form_data" }, 400);
        }

        if (formData._honey) {
            return jsonResponse({ ok: true, skipped: "honeypot" });
        }

        if (formData.source && formData.source !== "matsuda_prof") {
            return jsonResponse({ ok: false, error: "unexpected_source" }, 400);
        }

        const slackResponse = await fetch(env.SLACK_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(buildSlackPayload(formData, submission.form_url))
        });

        if (!slackResponse.ok) {
            const detail = await slackResponse.text();
            return jsonResponse({
                ok: false,
                error: "slack_post_failed",
                status: slackResponse.status,
                detail: truncate(detail, 240)
            }, 502);
        }

        return jsonResponse({ ok: true });
    }
};

async function readSubmission(request) {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return request.json();
    }

    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        return { form_data: Object.fromEntries(formData.entries()) };
    }

    const text = await request.text();
    if (!text.trim()) {
        return {};
    }

    return JSON.parse(text);
}

function normalizeFormData(submission = {}) {
    const rawData = submission.form_data || submission.formData || submission;
    return Object.fromEntries(
        Object.entries(rawData)
            .map(([key, value]) => [key, normalizeValue(value)])
            .filter(([key, value]) => key && value)
    );
}

function normalizeValue(value) {
    if (Array.isArray(value)) {
        return value.map(normalizeValue).filter(Boolean).join(", ");
    }

    if (value === undefined || value === null) {
        return "";
    }

    return String(value).trim();
}

function buildSlackPayload(formData, formUrl) {
    const name = formData.name || "未入力";
    const company = formData.company || "";
    const topic = formData.topic || "未選択";
    const message = formData.message || "";
    const pageUrl = formData.page_url || formUrl || "";
    const summary = company ? `${name} / ${company}` : name;

    const fields = [
        formatField("name", name),
        company ? formatField("company", company) : null,
        formData.email ? formatField("email", formData.email) : null,
        formatField("topic", topic),
        formData.interest ? formatField("interest", formData.interest) : null,
        pageUrl ? formatField("page_url", pageUrl) : null,
        formData.utm_source ? formatField("utm_source", formData.utm_source) : null,
        formData.utm_medium ? formatField("utm_medium", formData.utm_medium) : null,
        formData.utm_campaign ? formatField("utm_campaign", formData.utm_campaign) : null
    ].filter(Boolean);

    const blocks = [
        {
            type: "header",
            text: {
                type: "plain_text",
                text: "新規お問い合わせ",
                emoji: true
            }
        },
        {
            type: "section",
            fields
        }
    ];

    if (message) {
        blocks.push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*背景やご相談したい論点*\n${formatQuote(message)}`
            }
        });
    }

    const contextItems = [
        formData.landing_page ? `landing: ${formData.landing_page}` : "",
        formData.referrer ? `referrer: ${formData.referrer}` : "",
        formData.utm_content ? `utm_content: ${formData.utm_content}` : "",
        formData.utm_term ? `utm_term: ${formData.utm_term}` : ""
    ].filter(Boolean);

    if (contextItems.length > 0) {
        blocks.push({
            type: "context",
            elements: [
                {
                    type: "mrkdwn",
                    text: truncate(escapeMrkdwn(contextItems.join(" / ")), SLACK_TEXT_LIMIT)
                }
            ]
        });
    }

    return {
        text: `新規お問い合わせ: ${summary} - ${topic}`,
        blocks
    };
}

function formatField(key, value) {
    return {
        type: "mrkdwn",
        text: `*${FIELD_LABELS[key] || key}*\n${truncate(escapeMrkdwn(value), SLACK_FIELD_LIMIT)}`
    };
}

function formatQuote(value) {
    const quoted = escapeMrkdwn(value)
        .split("\n")
        .map((line) => `>${line || " "}`)
        .join("\n");

    return truncate(quoted, SLACK_TEXT_LIMIT);
}

function escapeMrkdwn(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function truncate(value, limit) {
    const text = String(value);
    if (text.length <= limit) {
        return text;
    }

    return `${text.slice(0, limit - 1)}...`;
}

function jsonResponse(payload, status = 200) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            "content-type": "application/json; charset=utf-8"
        }
    });
}
