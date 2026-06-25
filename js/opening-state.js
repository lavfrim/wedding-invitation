(() => {
  const OPENING_SHOWED_KEY = "opening_showed";
  const OPENING_SKIPPED_CLASS = "opening-skipped";
  const OPENING_AWAIT_CONFIRMATION_CLASS = "opening-await-confirmation";
  const OPENING_START_EVENT = "opening:start";
  const CRAWL_ANIMATION_NAME = "crawl-overlay";
  const RESET_BUTTON_ID = "resetOpeningStateButton";

  // Fallback timeout in case animationend never fires (shorter than the full
  // 72 s crawl so returning visitors see the opening as "already shown" early).
  const OPENING_SHOWED_FALLBACK_MS = 30_000;

  function isOpeningShowed() {
    return window.localStorage.getItem(OPENING_SHOWED_KEY) === "true";
  }

  function setOpeningShowed(value) {
    window.localStorage.setItem(OPENING_SHOWED_KEY, String(value));
  }

  function createResetOpeningButton() {
    if (!document.body || document.getElementById(RESET_BUTTON_ID)) return;

    const button = document.createElement("button");
    button.id = RESET_BUTTON_ID;
    button.type = "button";
    button.className = "opening-reset-button";
    button.textContent = "Show opening again";
    button.addEventListener("click", () => {
      setOpeningShowed(false);
      window.location.reload();
    });

    document.body.append(button);
  }

  function applyOpeningVisibilityState() {
    const showed = isOpeningShowed();
    document.documentElement.classList.toggle(OPENING_SKIPPED_CLASS, showed);

    if (document.body && showed) {
      document.documentElement.classList.remove("scroll-locked");
      document.body.classList.remove("scroll-locked");
    }
  }

  function watchOpeningCompletion() {
    const openingCrawlEl = document.querySelector(".opening-crawl");

    if (!openingCrawlEl) {
      setOpeningShowed(true);
      createResetOpeningButton();
      return;
    }

    const openingCrawlStyle = window.getComputedStyle(openingCrawlEl);
    const animationDelayMs = parseCssTimeToMilliseconds(openingCrawlStyle.animationDelay);

    if (openingCrawlStyle.animationName === "none") {
      setOpeningShowed(true);
      createResetOpeningButton();
      return;
    }

    let completionHandled = false;
    const markOpeningAsShowed = () => {
      if (completionHandled) return;
      completionHandled = true;
      setOpeningShowed(true);
      createResetOpeningButton();
    };

    openingCrawlEl.addEventListener(
      "animationend",
      (event) => {
        if (event.animationName === CRAWL_ANIMATION_NAME) markOpeningAsShowed();
      },
      { once: true },
    );

    window.setTimeout(markOpeningAsShowed, animationDelayMs + OPENING_SHOWED_FALLBACK_MS + 400);
  }

  if (isOpeningShowed()) {
    document.documentElement.classList.add(OPENING_SKIPPED_CLASS);
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyOpeningVisibilityState();

    if (isOpeningShowed()) {
      createResetOpeningButton();
      return;
    }

    if (document.documentElement.classList.contains(OPENING_AWAIT_CONFIRMATION_CLASS)) {
      window.addEventListener(OPENING_START_EVENT, watchOpeningCompletion, { once: true });
      return;
    }

    watchOpeningCompletion();
  });
})();
