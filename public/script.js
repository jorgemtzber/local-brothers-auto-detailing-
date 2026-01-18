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

  function getCheckedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(
      (el) => el.value
    );
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fd = new FormData(form);

      const payload = {
        name: (fd.get("name") || "").toString().trim(),
        email: (fd.get("email") || "").toString().trim(),
        phone: (fd.get("phone") || "").toString().trim(),
        package: (fd.get("package") || "").toString().trim(),
        vehicleSize: (fd.get("vehicleSize") || "").toString().trim(),
        vehicleCount: (fd.get("vehicleCount") || "").toString().trim(),
        address: (fd.get("address") || "").toString().trim(),
        preferredDate: (fd.get("preferredDate") || "").toString().trim(),
        timeWindow: (fd.get("timeWindow") || "").toString().trim(),
        sameDayRequest: fd.get("sameDayRequest") === "on",
        addons: getCheckedValues("addons"),
        petHairLevel: (fd.get("petHairLevel") || "").toString().trim(),
        wheelRustLevel: (fd.get("wheelRustLevel") || "").toString().trim(),
        conditionFlags: getCheckedValues("conditionFlags"),
        notes: (fd.get("notes") || "").toString().trim(),
      };

      // Required fields (rule-enforcing)
      const required = [
        ["name", "Name is required."],
        ["email", "Email is required."],
        ["phone", "Phone number is required."],
        ["package", "Please select a package."],
        ["vehicleSize", "Please select a vehicle size."],
        ["vehicleCount", "Please select the number of vehicles."],
        ["address", "Service address is required."],
        ["preferredDate", "Preferred date is required."],
        ["timeWindow", "Please select a time window."],
      ];

      for (const [key, msg] of required) {
        if (!payload[key]) {
          setStatus(msg, false);
          return;
        }
      }

      submitBtn && (submitBtn.disabled = true);
      setStatus("Sending...");

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
