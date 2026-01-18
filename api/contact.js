const { Resend } = require("resend");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const b = req.body || {};

    const requiredFields = [
      "name",
      "email",
      "phone",
      "package",
      "vehicleSize",
      "vehicleCount",
      "address",
      "preferredDate",
      "timeWindow",
    ];

    for (const f of requiredFields) {
      if (!b[f] || String(b[f]).trim() === "") {
        return res.status(400).json({ error: `Missing required field: ${f}` });
      }
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const toEmail = process.env.CONTACT_TO_EMAIL;
    if (!toEmail) {
      return res.status(500).json({ error: "Missing CONTACT_TO_EMAIL env var" });
    }

    const subject = `[Local Brothers Website] ${safe(b.package)} — ${safe(b.name)}`;

    const addonsList = Array.isArray(b.addons) ? b.addons : [];
    const conditionList = Array.isArray(b.conditionFlags) ? b.conditionFlags : [];

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.45">
        <h2>New Booking Request</h2>

        <h3 style="margin:18px 0 6px">Customer</h3>
        <p><strong>Name:</strong> ${safe(b.name)}</p>
        <p><strong>Email:</strong> ${safe(b.email)}</p>
        <p><strong>Phone:</strong> ${safe(b.phone)}</p>

        <h3 style="margin:18px 0 6px">Booking Inputs</h3>
        <p><strong>Package:</strong> ${safe(b.package)}</p>
        <p><strong>Vehicle Size:</strong> ${safe(b.vehicleSize)}</p>
        <p><strong># Vehicles (same address):</strong> ${safe(b.vehicleCount)}</p>
        <p><strong>Service Address:</strong> ${safe(b.address)}</p>
        <p><strong>Preferred Date:</strong> ${safe(b.preferredDate)}</p>
        <p><strong>Time Window:</strong> ${safe(b.timeWindow)}</p>
        <p><strong>Same-day request:</strong> ${b.sameDayRequest ? "Yes" : "No"}</p>

        <h3 style="margin:18px 0 6px">Add-ons</h3>
        <ul>
          ${addonsList.length ? addonsList.map((x) => `<li>${safe(x)}</li>`).join("") : "<li>None selected</li>"}
          ${b.petHairLevel ? `<li>Pet Hair Removal: ${safe(b.petHairLevel)}</li>` : ""}
          ${b.wheelRustLevel ? `<li>Wheel Rust & Fallout Removal: ${safe(b.wheelRustLevel)}</li>` : ""}
        </ul>

        <h3 style="margin:18px 0 6px">Condition Flags</h3>
        <ul>
          ${conditionList.length ? conditionList.map((x) => `<li>${safe(x)}</li>`).join("") : "<li>None reported</li>"}
        </ul>

        <h3 style="margin:18px 0 6px">Notes</h3>
        <p>${safe(b.notes || "—").replace(/\n/g, "<br/>")}</p>

        <hr style="margin:18px 0; border:none; border-top:1px solid #ddd" />
        <p style="color:#666; font-size:12px; margin:0">
          Internal reminder: confirm vehicle category on arrival; confirm any condition-based adjustment before starting.
        </p>
      </div>
    `;

    await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL || "Website <onboarding@resend.dev>",
      to: toEmail,
      reply_to: safe(b.email),
      subject,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
};

function safe(str) {
  return escapeHtml(String(str ?? ""));
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
