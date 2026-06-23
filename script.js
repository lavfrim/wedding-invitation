const countdownEl = document.getElementById("countdown");
const rsvpButton = document.getElementById("rsvpButton");
const guestGreetingEl = document.getElementById("guestGreeting");
const weddingDateTextEl = document.getElementById("weddingDateText");
const weddingDetailsContentEl = document.getElementById("weddingDetailsContent");
const firstMainSectionEl = document.querySelector("main.container section");

const weddingScheduleByGuestType = {
  external: {
    label: "September 4, 5, 6, 2026",
    countdownStartDate: new Date("2026-09-04T14:00:00"),
    detailsHtml: `
      <p><strong>September 4, Friday, <em>Landing day</em>:</strong></p>
      <ul>
        <li>arrival</li>
        <li>meeting each other</li>
        <li>enjoying the day</li>
      </ul>
      <p><strong>September 5, Saturday, <em>Ceremony day</em>:</strong></p>
      <ul>
        <li>midday — ceremony (formal part)</li>
        <li>evening — feast and party</li>
      </ul>
      <p><strong>September 6, Sunday, <em>Party day</em>:</strong></p>
      <ul>
        <li>morning — hangover workout</li>
        <li>midday — barbecue, pool, sauna, music, and bar</li>
        <li>evening — even more</li>
      </ul>
    `,
  },
  internal: {
    label: "September 5, 6, 2026",
    countdownStartDate: new Date("2026-09-05T14:00:00"),
    detailsHtml: `
      <p><strong>September 5, Saturday, <em>Ceremony day</em>:</strong></p>
      <ul>
        <li>midday — ceremony (formal part)</li>
        <li>evening — feast and events</li>
      </ul>
      <p><strong>September 6, Sunday, <em>Party day</em>:</strong></p>
      <ul>
        <li>morning — hangover workout</li>
        <li>midday — barbecue, pool, music, and bar</li>
        <li>evening — even more action</li>
      </ul>
    `,
  },
};

function getGuestTypeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const guestType = (params.get("guestType") || "").trim().toLowerCase();
  return guestType === "internal" ? "internal" : "external";
}

function getGuestNamesFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const guestValues = params.getAll("guest");
  const guestsValues = params.getAll("guests").flatMap((value) => value.split(","));
  const nameValue = params.get("name");

  const allNames = [...guestValues, ...guestsValues, nameValue || ""]
    .map((name) => name.trim())
    .filter(Boolean);

  return [...new Set(allNames)];
}

function formatGuestNames(names) {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function updateGuestGreeting() {
  const names = getGuestNamesFromUrl();

  if (!names.length) return;

  guestGreetingEl.textContent = `Dear ${formatGuestNames(names)}, this invitation is for you.`;
  guestGreetingEl.hidden = false;
}

function updateWeddingDateByGuestType(guestType) {
  if (!weddingDateTextEl) return;
  weddingDateTextEl.textContent = weddingScheduleByGuestType[guestType].label;
}

function updateWeddingDetailsByGuestType(guestType) {
  if (!weddingDetailsContentEl) return;
  weddingDetailsContentEl.innerHTML = weddingScheduleByGuestType[guestType].detailsHtml;
}

function updateCountdown(targetDate) {
  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    countdownEl.textContent = "Today is the day. We are getting married!";
    return;
  }

  const day = 1000 * 60 * 60 * 24;
  const hour = 1000 * 60 * 60;
  const minute = 1000 * 60;

  const days = Math.floor(diff / day);
  const hours = Math.floor((diff % day) / hour);
  const minutes = Math.floor((diff % hour) / minute);

  countdownEl.textContent = `${days} days, ${hours} hours, ${minutes} minutes`;
}

function parseCssTimeToMilliseconds(value) {
  if (!value) return 0;
  const firstValue = value.split(",")[0].trim();
  if (firstValue.endsWith("ms")) return Number.parseFloat(firstValue) || 0;
  if (firstValue.endsWith("s")) return (Number.parseFloat(firstValue) || 0) * 1000;
  return 0;
}

function unlockScrollOnMainSectionsAppearance() {
  const unlock = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.body.classList.remove("scroll-locked");
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  };

  if (!firstMainSectionEl) {
    unlock();
    return;
  }

  const firstSectionComputedStyle = window.getComputedStyle(firstMainSectionEl);
  const hasRevealAnimation =
    firstSectionComputedStyle.animationName !== "none" &&
    parseCssTimeToMilliseconds(firstSectionComputedStyle.animationDuration) > 0;

  if (!hasRevealAnimation) {
    unlock();
    return;
  }

  firstMainSectionEl.addEventListener(
    "animationstart",
    (event) => {
      if (event.animationName === "section-fade-in") unlock();
    },
    { once: true },
  );

  const animationDelayMs = parseCssTimeToMilliseconds(firstSectionComputedStyle.animationDelay);
  window.setTimeout(unlock, animationDelayMs + 1500);
}

if (rsvpButton) {
  rsvpButton.addEventListener("click", () => {
    window.open("https://forms.gle/3wYWRsX3L1CcrxXWA", "_blank", "noopener,noreferrer");
  });
}

unlockScrollOnMainSectionsAppearance();

updateGuestGreeting();

const guestType = getGuestTypeFromUrl();
const targetWeddingDate = weddingScheduleByGuestType[guestType].countdownStartDate;

updateWeddingDateByGuestType(guestType);
updateWeddingDetailsByGuestType(guestType);
updateCountdown(targetWeddingDate);
setInterval(() => updateCountdown(targetWeddingDate), 60000);
