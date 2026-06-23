(() => {
  const OPENING_SHOWED_KEY = "opening_showed";
  const OPENING_AWAIT_CONFIRMATION_CLASS = "opening-await-confirmation";
  const MOBILE_BREAKPOINT_QUERY = "(max-width: 599px)";
  const MODAL_ID = "mobileOpeningModal";

  function shouldShowMobileOpeningModal() {
    const openingShowed = window.localStorage.getItem(OPENING_SHOWED_KEY) === "true";
    const isSmallScreen = window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches;
    return !openingShowed && isSmallScreen;
  }

  function createMobileOpeningModal() {
    if (!document.body || document.getElementById(MODAL_ID)) return;

    const modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.className = "mobile-opening-modal";
    modal.innerHTML = `
      <div class="mobile-opening-modal__backdrop"></div>
      <div class="mobile-opening-modal__content" role="dialog" aria-modal="true" aria-labelledby="mobileOpeningModalTitle">
        <p>Too small for that,<br/>if you know what I mean 😏</p>
        <h2 id="mobileOpeningModalTitle">For a better experience, open it on a bigger screen</h2>
        <button type="button" class="mobile-opening-modal__continue">Continue anyway</button>
      </div>
    `;

    const continueButton = modal.querySelector(".mobile-opening-modal__continue");
    continueButton.addEventListener("click", () => {
      document.documentElement.classList.remove(OPENING_AWAIT_CONFIRMATION_CLASS);
      modal.remove();
      window.dispatchEvent(new Event("opening:start"));
    });

    document.body.append(modal);
  }

  if (shouldShowMobileOpeningModal()) {
    document.documentElement.classList.add(OPENING_AWAIT_CONFIRMATION_CLASS);
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.documentElement.classList.contains(OPENING_AWAIT_CONFIRMATION_CLASS)) {
      createMobileOpeningModal();
    }
  });
})();
