// Browser-side MP3 encoder. WhatsApp plays MP3 natively and, when sent as a
// document, the file downloads and opens in any local player. MediaRecorder
// cannot produce MP3, so we decode the recording with the Web Audio API and
// re-encode it with lamejs.

const SAMPLE_BLOCK = 1152;

/** Encode any decodable audio blob into a mono 128 kbps MP3 blob. */
export async function encodeMp3(blob: Blob): Promise<Blob | null> {
  try {
    const { Mp3Encoder } = await import("@breezystack/lamejs");
    const AudioCtx =
      (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
        .AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    const ctx = new AudioCtx();
    const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
    await ctx.close().catch(() => undefined);

    const channel = decoded.getChannelData(0);
    const samples = new Int16Array(channel.length);
    for (let i = 0; i < channel.length; i += 1) {
      const s = Math.max(-1, Math.min(1, channel[i]!));
      samples[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    const encoder = new Mp3Encoder(1, decoded.sampleRate, 128);
    const chunks: Uint8Array[] = [];
    for (let i = 0; i < samples.length; i += SAMPLE_BLOCK) {
      const buf = encoder.encodeBuffer(samples.subarray(i, i + SAMPLE_BLOCK));
      if (buf.length > 0) chunks.push(new Uint8Array(buf));
    }
    const tail = encoder.flush();
    if (tail.length > 0) chunks.push(new Uint8Array(tail));

    return new Blob(chunks as BlobPart[], { type: "audio/mpeg" });
  } catch (error) {
    console.error("MP3 encoding failed:", error);
    return null;
  }
}
