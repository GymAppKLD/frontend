import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '..', 'public');

function svgFor(size, maskable = false) {
  const padding = maskable ? Math.round(size * 0.1) : 0;
  const inner = size - padding * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FF9F1C" />
        <stop offset="100%" stop-color="#FF6A00" />
      </linearGradient>
    </defs>
    <rect x="${padding}" y="${padding}" width="${inner}" height="${inner}" rx="${maskable ? 0 : Math.round(inner * 0.16)}" fill="#060607" />
    <g transform="translate(${size / 2}, ${size / 2})">
      <text
        x="0" y="0"
        text-anchor="middle"
        dominant-baseline="central"
        font-family="Inter, Helvetica, Arial, sans-serif"
        font-weight="800"
        font-size="${Math.round(inner * 0.55)}"
        fill="url(#g)"
        style="letter-spacing:-0.05em;"
      >K</text>
    </g>
  </svg>`;
}

const targets = [
  { name: 'pwa-192x192.png', size: 192, maskable: false },
  { name: 'pwa-512x512.png', size: 512, maskable: false },
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
];

for (const t of targets) {
  const buf = Buffer.from(svgFor(t.size, t.maskable));
  const out = path.join(publicDir, t.name);
  await sharp(buf).png().toFile(out);
  console.log('wrote', out);
}
