// Audio delivery formats a super admin can enable (one at a time) in
// Settings → Audio. The selected format decides BOTH how the browser encodes a
// recorded voice note and how the provider delivers it on WhatsApp:
// "document" formats arrive as a downloadable file that opens locally, while
// "voice" formats arrive as an inline playable bubble.

export type AudioDeliveryFormat = "mp3_document" | "mp3_audio" | "ogg_voice" | "m4a_audio";

export type AudioFormatSpec = {
  id: AudioDeliveryFormat;
  label: string;
  description: string;
  mime: string;
  ext: string;
  /** Deliver as a WhatsApp document (downloadable file) instead of an audio bubble. */
  asDocument: boolean;
};

export const AUDIO_FORMATS: AudioFormatSpec[] = [
  {
    id: "mp3_document",
    label: "MP3 file (attachment)",
    description:
      "Recordings are encoded to MP3 and sent as a file attachment, so contacts download and open them locally.",
    mime: "audio/mpeg",
    ext: "mp3",
    asDocument: true,
  },
  {
    id: "mp3_audio",
    label: "MP3 audio message",
    description: "MP3 encoding delivered as a playable WhatsApp audio bubble.",
    mime: "audio/mpeg",
    ext: "mp3",
    asDocument: false,
  },
  {
    id: "ogg_voice",
    label: "Ogg/Opus voice note",
    description: "Native WhatsApp voice note (push-to-talk bubble). Smallest files.",
    mime: "audio/ogg",
    ext: "ogg",
    asDocument: false,
  },
  {
    id: "m4a_audio",
    label: "M4A / AAC audio",
    description: "MPEG-4 audio bubble. Useful when recording from Safari/iOS.",
    mime: "audio/mp4",
    ext: "m4a",
    asDocument: false,
  },
];

export const DEFAULT_AUDIO_FORMAT: AudioDeliveryFormat = "mp3_document";

export function resolveAudioFormat(value: unknown): AudioFormatSpec {
  const found = AUDIO_FORMATS.find((f) => f.id === value);
  return found ?? AUDIO_FORMATS[0]!;
}
