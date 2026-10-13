const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rail = document.querySelector("#rail");
const menuBtn = document.querySelector("#menuBtn");
const shade = document.querySelector("#shade");
const sheet = document.querySelector("#sheet");
const sheetTitle = document.querySelector("#sheetTitle");
const sheetKicker = document.querySelector("#sheetKicker");
const sheetBody = document.querySelector("#sheetBody");
const bar = document.querySelector(".progress");
const coverPhoto = document.querySelector(".cover-visual img");
let lastFocus = null;

document.querySelectorAll(".js-in").forEach((el) => {
  const io = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );
  io.observe(el);
});

const spyLinks = [...rail.querySelectorAll("ol a")];
const sections = spyLinks
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      spyLinks.forEach((a) => {
        const on = a.getAttribute("href") === `#${entry.target.id}`;
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    });
  },
  { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
);

sections.forEach((section) => spy.observe(section));

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? window.scrollY / max : 0;
  bar.style.transform = `scaleX(${p})`;
}

onScroll();
document.addEventListener("scroll", onScroll, { passive: true });

function closeMenu() {
  rail.classList.remove("is-open");
  menuBtn.setAttribute("aria-expanded", "false");
  shade.hidden = true;
  if (sheet.hidden) document.body.classList.remove("lock");
}

menuBtn.addEventListener("click", () => {
  const open = rail.classList.toggle("is-open");
  menuBtn.setAttribute("aria-expanded", String(open));
  shade.hidden = !open;
  document.body.classList.toggle("lock", open);
});

shade.addEventListener("click", closeMenu);
rail.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

window.addEventListener("resize", () => {
  if (window.innerWidth > 980) closeMenu();
});

function openSheet(details) {
  closeMenu();
  lastFocus = details.querySelector("summary");
  sheetKicker.textContent = details.querySelector(".scene-kicker").textContent;
  sheetTitle.textContent = details.querySelector(".scene-title").textContent;
  sheetBody.innerHTML = details.querySelector(".scene-copy").innerHTML;
  sheet.hidden = false;
  document.body.classList.add("lock");
  requestAnimationFrame(() => sheet.classList.add("is-open"));
  sheet.querySelector(".sheet-close").focus();
}

function closeSheet() {
  sheet.classList.remove("is-open");
  document.body.classList.remove("lock");
  const finish = () => {
    sheet.hidden = true;
    if (lastFocus) lastFocus.focus();
  };
  if (reduce) finish();
  else window.setTimeout(finish, 380);
}

document.querySelectorAll(".scene summary").forEach((summary) => {
  summary.addEventListener("click", (event) => {
    event.preventDefault();
    summary.parentElement.open = false;
    openSheet(summary.parentElement);
  });
});

sheet.querySelectorAll("[data-close]").forEach((el) => {
  el.addEventListener("click", closeSheet);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!sheet.hidden) closeSheet();
    else closeMenu();
  }
});

const cover = document.querySelector(".cover");
cover.addEventListener("mousemove", (event) => {
  if (reduce || window.innerWidth <= 980) return;
  const rect = cover.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  coverPhoto.style.transform = `translate(${x * -10}px, ${y * -8}px) scale(1.035)`;
});

cover.addEventListener("mouseleave", () => {
  coverPhoto.style.transform = "";
});
