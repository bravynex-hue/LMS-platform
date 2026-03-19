import sharp from "sharp";
import { mkdir } from "node:fs/promises";

await mkdir(new URL("../public/screenshots/", import.meta.url), { recursive: true });

const wide = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#020617"/>
      <stop offset="0.45" stop-color="#0b1220"/>
      <stop offset="1" stop-color="#111827"/>
    </linearGradient>
    <linearGradient id="a" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3b82f6"/>
      <stop offset="0.5" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#c084fc"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" rx="48" fill="url(#g)"/>
  <circle cx="980" cy="260" r="240" fill="url(#a)" opacity="0.12"/>
  <circle cx="380" cy="520" r="260" fill="url(#a)" opacity="0.10"/>
  <rect x="88" y="96" width="1104" height="528" rx="40" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
  <text x="140" y="190" font-family="Segoe UI, Inter, Arial" font-size="40" font-weight="800" fill="#e2e8f0">Bravynex LMS</text>
  <text x="140" y="250" font-family="Segoe UI, Inter, Arial" font-size="22" font-weight="600" fill="#94a3b8">Installable • Offline-ready • Fast</text>
  <text x="140" y="355" font-family="Segoe UI, Inter, Arial" font-size="56" font-weight="900" fill="url(#a)">Learn like an app</text>
  <text x="140" y="415" font-family="Segoe UI, Inter, Arial" font-size="24" font-weight="600" fill="#cbd5e1">Save to your Home Screen for the best experience.</text>
  <rect x="140" y="470" width="260" height="64" rx="18" fill="url(#a)"/>
  <text x="178" y="513" font-family="Segoe UI, Inter, Arial" font-size="22" font-weight="800" fill="#ffffff">Install App</text>
</svg>`;

const narrow = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="750" height="1334" viewBox="0 0 750 1334">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#020617"/>
      <stop offset="0.5" stop-color="#0b1220"/>
      <stop offset="1" stop-color="#111827"/>
    </linearGradient>
    <linearGradient id="a" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3b82f6"/>
      <stop offset="0.5" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#c084fc"/>
    </linearGradient>
  </defs>
  <rect width="750" height="1334" rx="72" fill="url(#g)"/>
  <circle cx="540" cy="360" r="260" fill="url(#a)" opacity="0.12"/>
  <circle cx="230" cy="980" r="280" fill="url(#a)" opacity="0.10"/>
  <rect x="72" y="120" width="606" height="1094" rx="44" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
  <text x="120" y="240" font-family="Segoe UI, Inter, Arial" font-size="34" font-weight="800" fill="#e2e8f0">Bravynex</text>
  <text x="120" y="295" font-family="Segoe UI, Inter, Arial" font-size="20" font-weight="600" fill="#94a3b8">Install and learn offline</text>
  <text x="120" y="430" font-family="Segoe UI, Inter, Arial" font-size="50" font-weight="900" fill="url(#a)">Mobile</text>
  <text x="120" y="490" font-family="Segoe UI, Inter, Arial" font-size="50" font-weight="900" fill="#f8fafc">experience</text>
  <text x="120" y="560" font-family="Segoe UI, Inter, Arial" font-size="22" font-weight="600" fill="#cbd5e1">Add to Home Screen for quick access.</text>
  <rect x="120" y="650" width="280" height="70" rx="20" fill="url(#a)"/>
  <text x="160" y="697" font-family="Segoe UI, Inter, Arial" font-size="22" font-weight="800" fill="#ffffff">Get Started</text>
</svg>`;

await sharp(Buffer.from(wide)).png({ compressionLevel: 9 }).toFile("public/screenshots/screenshot-wide.png");
await sharp(Buffer.from(narrow)).png({ compressionLevel: 9 }).toFile("public/screenshots/screenshot-narrow.png");

console.log("✅ PWA screenshots generated in public/screenshots/");

