const mapContainer = document.getElementById("mapWidget");

function initMapWidget() {
  if (!mapContainer) return;

  const placeQuery = mapContainer.dataset.placeQuery || "";
  const lat = mapContainer.dataset.lat || "41.6593144";
  const lng = mapContainer.dataset.lng || "44.7641561";
  const zoom = mapContainer.dataset.zoom || "16";

  const embedUrl = new URL("https://www.google.com/maps");
  embedUrl.searchParams.set("q", placeQuery || `${lat},${lng}`);
  embedUrl.searchParams.set("z", zoom);
  embedUrl.searchParams.set("output", "embed");

  const iframe = document.createElement("iframe");
  iframe.src = embedUrl.toString();
  iframe.loading = "lazy";
  iframe.referrerPolicy = "no-referrer-when-downgrade";
  iframe.title = "Wedding venue map";
  iframe.allowFullscreen = true;

  mapContainer.replaceChildren(iframe);
}

initMapWidget();
