function hueFromHex(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    delta = max - min;
  if (!delta) return 0;
  const hue =
    max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return Math.round((hue * 60 + 360) % 360);
}
function hexFromHue(hue: number) {
  const h = hue / 60,
    chroma = 0.7 * (1 - Math.abs(2 * 0.42 - 1)),
    x = chroma * (1 - Math.abs((h % 2) - 1)),
    m = 0.42 - chroma / 2;
  const channels =
    h < 1
      ? [chroma, x, 0]
      : h < 2
        ? [x, chroma, 0]
        : h < 3
          ? [0, chroma, x]
          : h < 4
            ? [0, x, chroma]
            : h < 5
              ? [x, 0, chroma]
              : [chroma, 0, x];
  return (
    '#' +
    channels
      .map((v) =>
        Math.round((v + m) * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}
export default function ColorSlider({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const hue = hueFromHex(value);
  return (
    <span className="color-slider">
      <input type="hidden" name={name} value={value} />
      <input
        type="range"
        min="0"
        max="359"
        value={hue}
        aria-label="Selecionar cor"
        aria-valuetext={`Matiz ${hue} graus`}
        onChange={(e) => {
          const next = Number(e.target.value);
          onChange(hexFromHue(next));
        }}
      />
      <span className="color-slider-swatch" style={{ backgroundColor: value }} aria-hidden="true" />
    </span>
  );
}
