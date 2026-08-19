// Browser-side remuxer: WebM/Opus (what Chrome's MediaRecorder produces) into
// Ogg/Opus (the only Opus container WhatsApp accepts). No transcoding happens —
// the Opus frames are copied verbatim into Ogg pages, so it is fast and lossless.

/** Ogg uses CRC-32 with polynomial 0x04c11db7, no input/output reflection. */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let r = i << 24;
    for (let j = 0; j < 8; j += 1) r = r & 0x80000000 ? ((r << 1) ^ 0x04c11db7) >>> 0 : (r << 1) >>> 0;
    table[i] = r >>> 0;
  }
  return table;
})();

function crc32(buf: Uint8Array): number {
  let crc = 0;
  for (let i = 0; i < buf.length; i += 1) {
    crc = ((crc << 8) ^ CRC_TABLE[((crc >>> 24) ^ buf[i]!) & 0xff]!) >>> 0;
  }
  return crc >>> 0;
}

/* ------------------------------ EBML reader ------------------------------ */

class Reader {
  pos = 0;
  constructor(readonly d: Uint8Array) {}
  get done() {
    return this.pos >= this.d.length;
  }
  /** Read an EBML id (leading length bits kept). */
  id(): number {
    const first = this.d[this.pos]!;
    let len = 1;
    for (let mask = 0x80; mask && !(first & mask); mask >>= 1) len += 1;
    let v = 0;
    for (let i = 0; i < len; i += 1) v = v * 256 + this.d[this.pos + i]!;
    this.pos += len;
    return v;
  }
  /** Read an EBML size (leading length bits stripped). Returns -1 for unknown. */
  size(): number {
    const first = this.d[this.pos]!;
    let len = 1;
    let mask = 0x80;
    while (mask && !(first & mask)) {
      len += 1;
      mask >>= 1;
    }
    let v = first & (mask - 1);
    let unknown = v === mask - 1;
    for (let i = 1; i < len; i += 1) {
      const b = this.d[this.pos + i]!;
      if (b !== 0xff) unknown = false;
      v = v * 256 + b;
    }
    this.pos += len;
    return unknown ? -1 : v;
  }
}

const MASTERS = new Set([0x18538067, 0x1654ae6b, 0xae, 0x1f43b675, 0xa0]);

/** Pull the Opus frames (and CodecPrivate header, when present) out of a WebM blob. */
function parseWebm(data: Uint8Array): { frames: Uint8Array[]; head: Uint8Array | null } {
  const frames: Uint8Array[] = [];
  let head: Uint8Array | null = null;
  const r = new Reader(data);

  const walk = (end: number) => {
    while (r.pos < end && !r.done) {
      const id = r.id();
      const size = r.size();
      const stop = size < 0 ? end : Math.min(end, r.pos + size);
      if (MASTERS.has(id)) {
        walk(stop);
        r.pos = Math.max(r.pos, stop);
      } else if (id === 0x63a2) {
        const priv = data.subarray(r.pos, stop);
        if (priv.length >= 8 && String.fromCharCode(...priv.subarray(0, 8)) === "OpusHead") {
          head = priv.slice();
        }
        r.pos = stop;
      } else if (id === 0xa3 || id === 0xa1) {
        // Track number (varint) + 2-byte timecode + flags byte + frame data.
        const start = r.pos;
        const sub = new Reader(data.subarray(start, stop));
        sub.size();
        const off = start + sub.pos + 3;
        if (off < stop) frames.push(data.subarray(off, stop).slice());
        r.pos = stop;
      } else {
        r.pos = stop;
      }
    }
  };

  walk(data.length);
  return { frames, head };
}

/* --------------------------- Opus frame duration -------------------------- */

/** Samples at 48 kHz encoded in one Opus packet, derived from its TOC byte. */
function packetSamples(pkt: Uint8Array): number {
  if (pkt.length === 0) return 960;
  const toc = pkt[0]!;
  const config = toc >> 3;
  let frameMs: number;
  if (config < 12) frameMs = [10, 20, 40, 60][config % 4]!;
  else if (config < 16) frameMs = [10, 20][config % 2]!;
  else frameMs = [2.5, 5, 10, 20][config % 4]!;
  const code = toc & 0x03;
  let count = 1;
  if (code === 1 || code === 2) count = 2;
  else if (code === 3) count = pkt.length > 1 ? pkt[1]! & 0x3f : 1;
  return Math.round(frameMs * 48 * Math.max(1, count));
}

/* ------------------------------- Ogg writer ------------------------------- */

function oggPage(
  payloads: Uint8Array[],
  granule: number,
  serial: number,
  seq: number,
  headerType: number,
): Uint8Array {
  const segs: number[] = [];
  for (const p of payloads) {
    let left = p.length;
    while (left >= 255) {
      segs.push(255);
      left -= 255;
    }
    segs.push(left);
  }
  const bodyLen = payloads.reduce((n, p) => n + p.length, 0);
  const page = new Uint8Array(27 + segs.length + bodyLen);
  const view = new DataView(page.buffer);
  page.set([0x4f, 0x67, 0x67, 0x53], 0); // "OggS"
  page[4] = 0;
  page[5] = headerType;
  // 64-bit granule position, little endian.
  view.setUint32(6, granule >>> 0, true);
  view.setUint32(10, Math.floor(granule / 2 ** 32), true);
  view.setUint32(14, serial, true);
  view.setUint32(18, seq, true);
  view.setUint32(22, 0, true); // checksum placeholder
  page[26] = segs.length;
  page.set(segs, 27);
  let off = 27 + segs.length;
  for (const p of payloads) {
    page.set(p, off);
    off += p.length;
  }
  view.setUint32(22, crc32(page), true);
  return page;
}

function opusHead(channels: number): Uint8Array {
  const h = new Uint8Array(19);
  h.set([0x4f, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64], 0); // "OpusHead"
  h[8] = 1; // version
  h[9] = channels;
  new DataView(h.buffer).setUint16(10, 3840, true); // pre-skip
  new DataView(h.buffer).setUint32(12, 48000, true);
  new DataView(h.buffer).setUint16(16, 0, true); // output gain
  h[18] = 0; // channel mapping family
  return h;
}

function opusTags(): Uint8Array {
  const vendor = new TextEncoder().encode("lovable-remux");
  const t = new Uint8Array(8 + 4 + vendor.length + 4);
  t.set(new TextEncoder().encode("OpusTags"), 0);
  const view = new DataView(t.buffer);
  view.setUint32(8, vendor.length, true);
  t.set(vendor, 12);
  view.setUint32(12 + vendor.length, 0, true); // zero user comments
  return t;
}

/**
 * Convert a WebM/Opus recording into an Ogg/Opus file.
 * Returns null when the input isn't WebM/Opus (caller should keep the original).
 */
export async function webmOpusToOgg(blob: Blob): Promise<Blob | null> {
  try {
    const data = new Uint8Array(await blob.arrayBuffer());
    const { frames, head } = parseWebm(data);
    if (frames.length === 0) return null;

    const serial = (Math.random() * 0xffffffff) >>> 0;
    const pages: Uint8Array[] = [];
    let seq = 0;
    pages.push(oggPage([head ?? opusHead(1)], 0, serial, seq++, 0x02));
    pages.push(oggPage([opusTags()], 0, serial, seq++, 0x00));

    let granule = 0;
    let batch: Uint8Array[] = [];
    for (let i = 0; i < frames.length; i += 1) {
      batch.push(frames[i]!);
      granule += packetSamples(frames[i]!);
      const last = i === frames.length - 1;
      if (batch.length >= 20 || last) {
        pages.push(oggPage(batch, granule, serial, seq++, last ? 0x04 : 0x00));
        batch = [];
      }
    }

    const total = pages.reduce((n, p) => n + p.length, 0);
    const out = new Uint8Array(total);
    let off = 0;
    for (const p of pages) {
      out.set(p, off);
      off += p.length;
    }
    return new Blob([out], { type: "audio/ogg" });
  } catch {
    return null;
  }
}
