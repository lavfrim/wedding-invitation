const OPENING_AWAIT_CONFIRMATION_CLASS = "opening-await-confirmation";
const OPENING_START_EVENT = "opening:start";

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

  const el = document.getElementById("guestGreeting");
  const invitationText = document.getElementById("invitationText");
  if (!el || !invitationText) return;

  el.innerHTML = `Dear <span class="guest-names">${formatGuestNames(names)}</span>,`;
  el.hidden = false;

  invitationText.innerHTML =
    "Together with our families, we are delighted to<br/>invite you to celebrate our wedding";
}

function updateWeddingDate(guestType) {
  const el = document.getElementById("weddingDateText");
  if (el) el.textContent = weddingScheduleByGuestType[guestType].label;
}

function updateWeddingDetails(guestType) {
  const el = document.getElementById("weddingDetailsContent");
  if (el) el.innerHTML = weddingScheduleByGuestType[guestType].detailsHtml;
}

function updateCountdown(targetDate) {
  const el = document.getElementById("countdown");
  if (!el) return;

  const diff = targetDate - Date.now();

  if (diff <= 0) {
    el.textContent = "Today is the day. We are getting married!";
    return;
  }

  const MS_PER_MINUTE = 60_000;
  const MS_PER_HOUR = MS_PER_MINUTE * 60;
  const MS_PER_DAY = MS_PER_HOUR * 24;

  const days = Math.floor(diff / MS_PER_DAY);
  const hours = Math.floor((diff % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((diff % MS_PER_HOUR) / MS_PER_MINUTE);

  el.textContent = `${days} days, ${hours} hours, ${minutes} minutes`;
}

function unlockScrollOnMainSectionsAppearance() {
  const firstMainSectionEl = document.querySelector("main.container section");
  let isUnlocked = false;

  const unlock = () => {
    if (isUnlocked) return;
    isUnlocked = true;
    document.documentElement.classList.add("opening-fade-out");
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.classList.remove("scroll-locked");
    document.body.classList.remove("scroll-locked");
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  };

  const startUnlockTracking = () => {
    if (!firstMainSectionEl) {
      unlock();
      return;
    }

    const style = window.getComputedStyle(firstMainSectionEl);
    const hasRevealAnimation =
      style.animationName !== "none" &&
      parseCssTimeToMilliseconds(style.animationDuration) > 0;

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

    const animationDelayMs = parseCssTimeToMilliseconds(style.animationDelay);
    window.setTimeout(unlock, animationDelayMs + 1500);
  };

  if (document.documentElement.classList.contains(OPENING_AWAIT_CONFIRMATION_CLASS)) {
    window.addEventListener(OPENING_START_EVENT, startUnlockTracking, { once: true });
    return;
  }

  startUnlockTracking();
}

const rsvpButton = document.getElementById("rsvpButton");
if (rsvpButton) {
  rsvpButton.addEventListener("click", () => {
    window.open("https://forms.gle/3wYWRsX3L1CcrxXWA", "_blank", "noopener,noreferrer");
  });
}

unlockScrollOnMainSectionsAppearance();
updateGuestGreeting();

const guestType = getGuestTypeFromUrl();
const targetWeddingDate = weddingScheduleByGuestType[guestType].countdownStartDate;

updateWeddingDate(guestType);
updateWeddingDetails(guestType);
updateCountdown(targetWeddingDate);
setInterval(() => updateCountdown(targetWeddingDate), 60_000);
