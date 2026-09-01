/**
 * High-Quality Pure Node.js PNG Icon Generator for PWA
 * Generates all standard and maskable PWA icon sizes, Apple Touch Icon, and favicon
 * from the user's official 3D cream/orange shopping cart design.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation for PNG chunks
function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}
const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function writePNG(width, height, rgbaBuffer, outputPath) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const scanlines = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const scanlineOffset = y * (width * 4 + 1);
    scanlines[scanlineOffset] = 0;
    rgbaBuffer.copy(scanlines, scanlineOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressedData = zlib.deflateSync(scanlines, { level: 9 });
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  const png = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(outputPath, png);
}

// Decode source PNG into raw RGBA
function decodePNG(filePath) {
  const buf = fs.readFileSync(filePath);
  let pos = 8;
  let width, height, colorType;
  let idatChunks = [];

  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    pos += 8 + len + 4;

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  const bytesPerPixel = (colorType === 6) ? 4 : (colorType === 2) ? 3 : 1;
  const stride = width * bytesPerPixel;
  const rgba = Buffer.alloc(width * height * 4);

  let srcOffset = 0;
  let prevRow = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const filterType = decompressed[srcOffset++];
    const currentRow = Buffer.alloc(stride);

    for (let x = 0; x < stride; x++) {
      const b = decompressed[srcOffset++];
      const a = (x >= bytesPerPixel) ? currentRow[x - bytesPerPixel] : 0;
      const c = (x >= bytesPerPixel) ? prevRow[x - bytesPerPixel] : 0;
      const d = prevRow[x];

      let val = 0;
      if (filterType === 0) val = b;
      else if (filterType === 1) val = (b + a) & 0xFF;
      else if (filterType === 2) val = (b + d) & 0xFF;
      else if (filterType === 3) val = (b + Math.floor((a + d) / 2)) & 0xFF;
      else if (filterType === 4) {
        const p = a + d - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - d);
        const pc = Math.abs(p - c);
        const pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? d : c);
        val = (b + pr) & 0xFF;
      }
      currentRow[x] = val;
    }

    for (let x = 0; x < width; x++) {
      const dstIdx = (y * width + x) * 4;
      const srcIdx = x * bytesPerPixel;
      if (bytesPerPixel === 4) {
        rgba[dstIdx] = currentRow[srcIdx];
        rgba[dstIdx + 1] = currentRow[srcIdx + 1];
        rgba[dstIdx + 2] = currentRow[srcIdx + 2];
        rgba[dstIdx + 3] = currentRow[srcIdx + 3];
      } else if (bytesPerPixel === 3) {
        rgba[dstIdx] = currentRow[srcIdx];
        rgba[dstIdx + 1] = currentRow[srcIdx + 1];
        rgba[dstIdx + 2] = currentRow[srcIdx + 2];
        rgba[dstIdx + 3] = 255;
      }
    }
    prevRow = currentRow;
  }
  return { width, height, rgba };
}

// Bilinear sample from source RGBA
function sampleRGBA(src, x, y) {
  const { width, height, rgba } = src;
  const cx = Math.max(0, Math.min(width - 1, x));
  const cy = Math.max(0, Math.min(height - 1, y));

  const x0 = Math.floor(cx);
  const x1 = Math.min(width - 1, x0 + 1);
  const y0 = Math.floor(cy);
  const y1 = Math.min(height - 1, y0 + 1);

  const fx = cx - x0;
  const fy = cy - y0;

  const idx00 = (y0 * width + x0) * 4;
  const idx10 = (y0 * width + x1) * 4;
  const idx01 = (y1 * width + x0) * 4;
  const idx11 = (y1 * width + x1) * 4;

  const out = [0, 0, 0, 255];
  for (let c = 0; c < 4; c++) {
    const top = rgba[idx00 + c] * (1 - fx) + rgba[idx10 + c] * fx;
    const bot = rgba[idx01 + c] * (1 - fx) + rgba[idx11 + c] * fx;
    out[c] = Math.round(top * (1 - fy) + bot * fy);
  }
  return out;
}

// Resize source image to target square with optional maskable padding
function resizeIcon(src, targetSize, isMaskable = false) {
  const dst = Buffer.alloc(targetSize * targetSize * 4);

  // Square crop of source
  const squareSize = Math.min(src.width, src.height);
  const cropStartX = (src.width - squareSize) / 2;
  const cropStartY = (src.height - squareSize) / 2;

  // Background color for maskable safe area (cream background)
  const bgR = 251, bgG = 240, bgB = 230; // #fbf0e6

  // For maskable icons, keep content inside 80% safe zone
  const scale = isMaskable ? 0.80 : 1.0;
  const margin = (targetSize * (1 - scale)) / 2;

  for (let dy = 0; dy < targetSize; dy++) {
    for (let dx = 0; dx < targetSize; dx++) {
      const dstIdx = (dy * targetSize + dx) * 4;

      if (isMaskable && (dx < margin || dx >= targetSize - margin || dy < margin || dy >= targetSize - margin)) {
        dst[dstIdx] = bgR;
        dst[dstIdx + 1] = bgG;
        dst[dstIdx + 2] = bgB;
        dst[dstIdx + 3] = 255;
      } else {
        const normX = (dx - (isMaskable ? margin : 0)) / (targetSize * scale);
        const normY = (dy - (isMaskable ? margin : 0)) / (targetSize * scale);

        const srcX = cropStartX + normX * squareSize;
        const srcY = cropStartY + normY * squareSize;

        const pixel = sampleRGBA(src, srcX, srcY);
        dst[dstIdx] = pixel[0];
        dst[dstIdx + 1] = pixel[1];
        dst[dstIdx + 2] = pixel[2];
        dst[dstIdx + 3] = pixel[3];
      }
    }
  }
  return dst;
}

// SVG Vector version of the 3D cream & orange shopping cart
function generateSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdf4ec"/>
      <stop offset="100%" stop-color="#f5e3d3"/>
    </linearGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#7a4216" flood-opacity="0.16"/>
    </filter>
    <filter id="cartShadow" x="-15%" y="-15%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#804107" flood-opacity="0.22"/>
    </filter>
    <linearGradient id="orangeLayer" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffb783"/>
      <stop offset="100%" stop-color="#e67e22"/>
    </linearGradient>
    <linearGradient id="creamLayer" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#faefe6"/>
    </linearGradient>
    <linearGradient id="wheelGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffd5b5"/>
      <stop offset="100%" stop-color="#f29f57"/>
    </linearGradient>
  </defs>

  <!-- Base Rounded Card -->
  <rect x="32" y="32" width="448" height="448" rx="105" fill="url(#bgGrad)" filter="url(#softShadow)"/>

  <!-- Orange 3D Bottom Layer -->
  <path d="M 130 160 C 130 150 142 142 154 146 L 180 156 C 190 160 196 172 200 188 L 220 280 C 224 298 240 312 260 312 L 375 312 C 392 312 406 298 410 282 L 424 200 C 428 178 410 160 388 160 L 205 160" 
        fill="url(#orangeLayer)" 
        filter="url(#cartShadow)"/>

  <!-- 3D Wheels -->
  <circle cx="205" cy="380" r="34" fill="url(#wheelGrad)" filter="url(#cartShadow)"/>
  <circle cx="205" cy="380" r="24" fill="#faefe6" opacity="0.4"/>
  <circle cx="355" cy="380" r="34" fill="url(#wheelGrad)" filter="url(#cartShadow)"/>
  <circle cx="355" cy="380" r="24" fill="#faefe6" opacity="0.4"/>

  <!-- Cream 3D Top Layer / Shopping Basket -->
  <path d="M 125 150 C 112 150 102 160 102 172 C 102 184 112 194 125 194 L 148 194 C 158 194 167 200 171 210 L 195 272 C 204 296 226 312 252 312 L 375 312 C 396 312 414 296 420 275 L 434 200 C 438 182 424 166 406 166 L 185 166" 
        fill="url(#creamLayer)" 
        stroke="rgba(255,255,255,0.85)" 
        stroke-width="6" 
        filter="url(#cartShadow)"/>
</svg>`;
}

function generateAllIcons() {
  const iconsDir = path.join(__dirname, '..', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const sourceFile = path.join(iconsDir, 'source_icon.png');
  if (!fs.existsSync(sourceFile)) {
    console.error('source_icon.png not found!');
    process.exit(1);
  }

  console.log('Decoding source icon:', sourceFile);
  const src = decodePNG(sourceFile);
  console.log(`Source dimensions: ${src.width}x${src.height}`);

  // 1. icon-512.png
  console.log('Generating icon-512.png...');
  const buf512 = resizeIcon(src, 512, false);
  writePNG(512, 512, buf512, path.join(iconsDir, 'icon-512.png'));

  // 2. icon-192.png
  console.log('Generating icon-192.png...');
  const buf192 = resizeIcon(src, 192, false);
  writePNG(192, 192, buf192, path.join(iconsDir, 'icon-192.png'));

  // 3. apple-touch-icon.png (180x180)
  console.log('Generating apple-touch-icon.png (180x180)...');
  const buf180 = resizeIcon(src, 180, false);
  writePNG(180, 180, buf180, path.join(iconsDir, 'apple-touch-icon.png'));

  // 4. icon-maskable-512.png (with safe area margin)
  console.log('Generating icon-maskable-512.png...');
  const bufMask512 = resizeIcon(src, 512, true);
  writePNG(512, 512, bufMask512, path.join(iconsDir, 'icon-maskable-512.png'));

  // 5. icon-maskable-192.png (with safe area margin)
  console.log('Generating icon-maskable-192.png...');
  const bufMask192 = resizeIcon(src, 192, true);
  writePNG(192, 192, bufMask192, path.join(iconsDir, 'icon-maskable-192.png'));

  // 6. favicon-32.png
  console.log('Generating favicon-32.png...');
  const buf32 = resizeIcon(src, 32, false);
  writePNG(32, 32, buf32, path.join(iconsDir, 'favicon-32.png'));

  // 7. icon.svg
  console.log('Generating icon.svg...');
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), generateSVG(), 'utf8');

  console.log('✨ All PWA icons generated successfully from official design!');
}

generateAllIcons();
