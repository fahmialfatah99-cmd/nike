/* ============ Lumina Studio — Interactions ============ */
"use strict";

// ---------- Navbar scroll state + to-top button ----------
const navbar = document.getElementById("navbar");
const toTop = document.getElementById("toTop");

function onScroll() {
  const y = window.scrollY;
  navbar.classList.toggle("scrolled", y > 40);
  toTop.classList.toggle("show", y > 600);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// ---------- Mobile hamburger menu ----------
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  navLinks.classList.toggle("open");
});
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    hamburger.classList.remove("open");
    navLinks.classList.remove("open");
  })
);

// ---------- Active nav link on scroll (scrollspy) ----------
const sections = [...document.querySelectorAll("section[id]")];
const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.querySelectorAll("a").forEach((a) =>
          a.classList.toggle("active", a.getAttribute("href") === `#${id}`)
        );
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
sections.forEach((s) => spy.observe(s));

// ---------- Reveal on scroll ----------
const revealObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ---------- Animated counters (hero stats) ----------
function animateCount(el) {
  const target = +el.dataset.count;
  const dur = 1600;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased).toLocaleString("id-ID");
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const countObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animateCount(e.target);
        obs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

// ---------- Portfolio filter ----------
const filterBtns = document.querySelectorAll(".fbtn");
const works = document.querySelectorAll(".work");

filterBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const f = btn.dataset.filter;
    works.forEach((w) => {
      const show = f === "all" || w.dataset.cat === f;
      w.classList.toggle("hidden", !show);
    });
  })
);

// ---------- Pricing toggle (once vs monthly) ----------
const togglePrice = document.getElementById("togglePrice");
const amounts = document.querySelectorAll(".amount");
const pers = document.querySelectorAll(".per");

togglePrice.addEventListener("change", () => {
  const monthly = togglePrice.checked;
  amounts.forEach((a) => {
    a.textContent = monthly ? a.dataset.monthly : a.dataset.once;
  });
  pers.forEach((p) => (p.textContent = monthly ? "/bulan" : "/proyek"));
});

// ---------- Testimonial slider ----------
const track = document.getElementById("tTrack");
const slides = track.children.length;
const dotsWrap = document.getElementById("tDots");
let current = 0;
let timer;

for (let i = 0; i < slides; i++) {
  const dot = document.createElement("button");
  dot.className = "t-dot" + (i === 0 ? " active" : "");
  dot.setAttribute("aria-label", `Testimoni ${i + 1}`);
  dot.addEventListener("click", () => goTo(i, true));
  dotsWrap.appendChild(dot);
}
const dots = dotsWrap.children;

function goTo(i, manual = false) {
  current = (i + slides) % slides;
  track.style.transform = `translateX(-${current * 100}%)`;
  [...dots].forEach((d, j) => d.classList.toggle("active", j === current));
  if (manual) restartAuto();
}
function restartAuto() {
  clearInterval(timer);
  timer = setInterval(() => goTo(current + 1), 6000);
}
restartAuto();

// Pause on hover
const tSlider = document.getElementById("tSlider");
tSlider.addEventListener("mouseenter", () => clearInterval(timer));
tSlider.addEventListener("mouseleave", restartAuto);

// Touch swipe support
let touchX = null;
tSlider.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
tSlider.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1), true);
  touchX = null;
});

// ---------- FAQ: close others when one opens ----------
document.querySelectorAll(".faq-item").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (item.open) {
      document.querySelectorAll(".faq-item[open]").forEach((o) => {
        if (o !== item) o.removeAttribute("open");
      });
    }
  });
});

// ---------- Contact form validation ----------
const form = document.getElementById("contactForm");
const note = document.getElementById("formNote");
const submitBtn = document.getElementById("submitBtn");

const validators = {
  nama: (v) => v.trim().length >= 3 || "Nama minimal 3 karakter.",
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Format email tidak valid.",
  telepon: (v) =>
    v.trim() === "" || /^(\+?62|0)8[1-9][0-9\s-]{7,13}$/.test(v.trim()) || "Nomor WhatsApp tidak valid.",
  layanan: (v) => v !== "" || "Pilih salah satu layanan.",
  budget: () => true,
  pesan: (v) => v.trim().length >= 10 || "Ceritakan proyek Anda minimal 10 karakter.",
};

function validateField(el) {
  const rule = validators[el.name];
  if (!rule) return true;
  const result = rule(el.value);
  const field = el.closest(".field");
  const errEl = field.querySelector(".err");
  const ok = result === true;
  field.classList.toggle("invalid", !ok);
  if (errEl) errEl.textContent = ok ? "" : result;
  return ok;
}

form.querySelectorAll("input, select, textarea").forEach((el) => {
  el.addEventListener("blur", () => validateField(el));
  el.addEventListener("input", () => {
    if (el.closest(".field").classList.contains("invalid")) validateField(el);
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const fields = [...form.querySelectorAll("input, select, textarea")];
  const allValid = fields.map(validateField).every(Boolean);

  if (!allValid) {
    note.className = "form-note fail";
    note.textContent = "Mohon periksa kembali kolom yang ditandai merah.";
    form.querySelector(".invalid input, .invalid select, .invalid textarea")?.focus();
    return;
  }

  // Simulasi pengiriman (demo) — di produksi hubungkan ke API/email backend
  submitBtn.disabled = true;
  submitBtn.textContent = "Mengirim…";
  setTimeout(() => {
    const data = Object.fromEntries(new FormData(form).entries());
    console.log("Data lead:", data);
    form.reset();
    fields.forEach((el) => {
      el.closest(".field")?.classList.remove("invalid");
      const err = el.closest(".field")?.querySelector(".err");
      if (err) err.textContent = "";
    });
    submitBtn.disabled = false;
    submitBtn.textContent = "Kirim Permintaan Konsultasi";
    note.className = "form-note ok";
    note.textContent = "✅ Terima kasih! Permintaan Anda terkirim. Kami balas kurang dari 1×24 jam.";
  }, 1200);
});

// ---------- Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();
