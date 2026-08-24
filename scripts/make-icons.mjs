import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const PATH =
  "M12.0225 18C8.70131 18 6.01127 15.315 6.01127 12C6.01127 8.685 8.70131 6 12.0225 6C14.9981 6 17.4678 8.165 17.9436 11H24C23.489 4.84 18.3244 0 12.0225 0C5.3851 0 0 5.375 0 12C0 18.625 5.3851 24 12.0225 24C18.3244 24 23.489 19.16 24 13H17.9436C17.4678 15.835 14.9981 18 12.0225 18Z";

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 24 24">
  <rect width="24" height="24" fill="#0052FF"/>
  <path fill="#FFFFFF" d="${PATH}"/>
</svg>`;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const png = await sharp(Buffer.from(svg)).png().toBuffer();

const writes = [
  ["public/icon-1024.png", 1024],
  ["public/icon-512.png", 512],
  ["public/icon-180.png", 180],
  ["ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png", 1024],
];

for (const [rel, size] of writes) {
  const out = await sharp(png).resize(size, size).png().toBuffer();
  writeFileSync(join(root, rel), out);
  console.log(rel, out.length);
}
