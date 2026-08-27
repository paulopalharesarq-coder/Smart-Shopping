// Pure Node.js PNG icon generator for PWA (using built-in zlib)
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

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

function writePNG(width, height, rgbaBuffer, outputPath) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // color type 6: RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0 (None)
  const scanlines = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const scanlineOffset = y * (width * 4 + 1);
    scanlines[scanlineOffset] = 0; // Filter None
    rgbaBuffer.copy(scanlines, scanlineOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressedData = zlib.deflateSync(scanlines, { level: 9 });
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  const png = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(outputPath, png);
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

// Draw warm Lumina Lifestyle shopping cart icon onto RGBA buffer
function generateIconRGBA(size, isMaskable = false) {
  const buf = Buffer.alloc(size * size * 4);
  const radius = isMaskable ? size * 0.1 : size * 0.22;
  const cx = size / 2;
  const cy = size / 2;

  // Background colors
  const colTop = [148, 74, 0];    // #944a00
  const colMid = [184, 93, 0];    // #b85d00
  const colBot = [230, 126, 34];  // #e67e22

  for (let y = 0; y < size; y++) {
    const ny = y / (size - 1);
    const bgR = Math.round(ny < 0.5 ? colTop[0] + (colMid[0] - colTop[0]) * (ny * 2) : colMid[0] + (colBot[0] - colMid[0]) * ((ny - 0.5) * 2));
    const bgG = Math.round(ny < 0.5 ? colTop[1] + (colMid[1] - colTop[1]) * (ny * 2) : colMid[1] + (colBot[1] - colMid[1]) * ((ny - 0.5) * 2));
    const bgB = Math.round(ny < 0.5 ? colTop[2] + (colMid[2] - colTop[2]) * (ny * 2) : colMid[2] + (colBot[2] - colMid[2]) * ((ny - 0.5) * 2));

    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Rounded rect mask for non-maskable
      let insideBg = true;
      if (!isMaskable) {
        const dx = Math.abs(x - cx) - (cx - radius);
        const dy = Math.abs(y - cy) - (cy - radius);
        if (dx > 0 && dy > 0) {
          insideBg = (dx * dx + dy * dy) <= (radius * radius);
        } else {
          insideBg = (dx <= 0 || dy <= 0);
        }
      }

      if (!insideBg) {
        buf[idx] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
        continue;
      }

      // Default to background color
      buf[idx] = bgR;
      buf[idx + 1] = bgG;
      buf[idx + 2] = bgB;
      buf[idx + 3] = 255;

      // Render Basket Shape
      const scale = size / 512;
      const nx = x / scale;
      const ny2 = y / scale;

      // Basket Handle: arc centered at (256, 230), radius ~75, stroke ~26
      const hdx = nx - 256;
      const hdy = ny2 - 230;
      const hdist = Math.sqrt(hdx * hdx + hdy * hdy);
      if (ny2 <= 230 && hdist >= (75 - 13) && hdist <= (75 + 13)) {
        buf[idx] = 255;
        buf[idx + 1] = 255;
        buf[idx + 2] = 255;
        buf[idx + 3] = 255;
      }

      // Basket Body: trapezoid from y=230 to 408
      if (ny2 >= 230 && ny2 <= 408) {
        const t = (ny2 - 230) / (408 - 230);
        const leftX = 120 + t * 45;
        const rightX = 392 - t * 45;
        if (nx >= leftX && nx <= rightX) {
          // Basket fill color (warm white/cream)
          const isGrid = (
            (Math.abs(nx - (180 + t * 15)) < 4) ||
            (Math.abs(nx - 256) < 4) ||
            (Math.abs(nx - (332 - t * 15)) < 4) ||
            (Math.abs(ny2 - 320) < 4)
          );

          if (isGrid) {
            buf[idx] = 148;
            buf[idx + 1] = 74;
            buf[idx + 2] = 0;
            buf[idx + 3] = 255;
          } else {
            buf[idx] = 255;
            buf[idx + 1] = 248;
            buf[idx + 2] = 245;
            buf[idx + 3] = 255;
          }
        }
      }

      // Sparkle / Green badge at (365, 165)
      const bdx = nx - 365;
      const bdy = ny2 - 165;
      const bdist = Math.sqrt(bdx * bdx + bdy * bdy);
      if (bdist <= 38) {
        buf[idx] = 123;   // #7bf8a1
        buf[idx + 1] = 248;
        buf[idx + 2] = 161;
        buf[idx + 3] = 255;

        // Sparkle star inside badge
        const sdx = Math.abs(bdx);
        const sdy = Math.abs(bdy);
        if ((sdx < 5 && sdy < 24) || (sdy < 5 && sdx < 24)) {
          buf[idx] = 0;     // #006d37
          buf[idx + 1] = 109;
          buf[idx + 2] = 55;
          buf[idx + 3] = 255;
        }
      }
    }
  }

  return buf;
}

const iconsDir = path.join(__dirname, '..', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icon-192.png
const buf192 = generateIconRGBA(192, false);
writePNG(192, 192, buf192, path.join(iconsDir, 'icon-192.png'));

// Generate icon-512.png
const buf512 = generateIconRGBA(512, false);
writePNG(512, 512, buf512, path.join(iconsDir, 'icon-512.png'));

// Generate apple-touch-icon.png (180x180)
const buf180 = generateIconRGBA(180, false);
writePNG(180, 180, buf180, path.join(iconsDir, 'apple-touch-icon.png'));

// Generate icon-maskable-512.png
const bufMask512 = generateIconRGBA(512, true);
writePNG(512, 512, bufMask512, path.join(iconsDir, 'icon-maskable-512.png'));

// Generate icon-maskable-192.png
const bufMask192 = generateIconRGBA(192, true);
writePNG(192, 192, bufMask192, path.join(iconsDir, 'icon-maskable-192.png'));

// Generate favicon-32.png
const buf32 = generateIconRGBA(32, false);
writePNG(32, 32, buf32, path.join(iconsDir, 'favicon-32.png'));

console.log('Icons generated successfully in icons/ folder!');
