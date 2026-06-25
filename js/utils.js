/**
 * Parses the first value of a CSS time string (e.g. "1.5s", "300ms", "1s, 0.3s")
 * and returns its equivalent in milliseconds.
 */
function parseCssTimeToMilliseconds(value) {
  if (!value) return 0;
  const firstValue = value.split(",")[0].trim();
  if (firstValue.endsWith("ms")) return Number.parseFloat(firstValue) || 0;
  if (firstValue.endsWith("s")) return (Number.parseFloat(firstValue) || 0) * 1000;
  return 0;
}
