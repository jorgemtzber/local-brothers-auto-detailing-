(function () {
  // Footer year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Mobile nav
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Contact form -> Vercel Function
  const form = document.getElementById("leadForm");
  const statusEl = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");

  function setStatus(msg, ok = true) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.style.color = ok ? "rgba(233,238,245,.75)" : "rgba(255,120,120,.95)";
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(form).entries());

      if (!data.name || !data.email || !data.phone || !data.service || !data.message) {
        setStatus("Please fill out all fields.", false);
        return;
      }

      submitBtn && (submitBtn.disabled = true);
      setStatus("Sending...");

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || "Failed to send.");

        form.reset();
        setStatus("Submitted! We’ll reach out shortly. ✅");
      } catch (err) {
        setStatus(err.message || "Something went wrong.", false);
      } finally {
        submitBtn && (submitBtn.disabled = false);
      }
    });
  }
})();
