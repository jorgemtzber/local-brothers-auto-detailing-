const { Resend } = require("resend");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, phone, service, message } = req.body || {};

    if (!name || !email || !phone || !service || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const toEmail = process.env.CONTACT_TO_EMAIL;
    if (!toEmail) {
      return res.status(500).json({ error: "Missing CONTACT_TO_EMAIL env var" });
    }

    const subject = `[Website Lead] ${service} — ${name}`;
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.45">
        <h2>New Website Lead</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Service:</strong> ${escapeHtml(service)}</p>
        <p><strong>Message:</strong><br/>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
      </div>
    `;

    await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL || "Website <onboarding@resend.dev>",
      to: toEmail,
      reply_to: email,
      subject,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
};

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
