(() => {
  const OPENING_SHOWED_KEY = "opening_showed";
  const OPENING_SKIPPED_CLASS = "opening-skipped";
  const OPENING_AWAIT_CONFIRMATION_CLASS = "opening-await-confirmation";
  const RESET_BUTTON_ID = "resetOpeningStateButton";
  const CRAWL_ANIMATION_NAME = "crawl-overlay";

  function parseCssTimeToMilliseconds(value) {
    if (!value) return 0;
    const firstValue = value.split(",")[0].trim();
    if (firstValue.endsWith("ms")) return Number.parseFloat(firstValue) || 0;
    if (firstValue.endsWith("s")) return (Number.parseFloat(firstValue) || 0) * 1000;
    return 0;
  }

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
    const animationDurationMs = 30000;
    const animationDelayMs = parseCssTimeToMilliseconds(openingCrawlStyle.animationDelay);

    if (openingCrawlStyle.animationName === "none" || animationDurationMs <= 0) {
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
        if (event.animationName === CRAWL_ANIMATION_NAME) {
          markOpeningAsShowed();
        }
      },
      { once: true },
    );

    window.setTimeout(markOpeningAsShowed, animationDelayMs + animationDurationMs + 400);
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
      window.addEventListener("opening:start", watchOpeningCompletion, { once: true });
      return;
    }

    watchOpeningCompletion();
  });
})();
