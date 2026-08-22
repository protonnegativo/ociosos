export type Accessory =
  | "antennae"
  | "headphones"
  | "sunglasses"
  | "wingHelmet"
  | "visor"
  | "catEars"
  | "magnet"
  | "spiral"
  | "cowl"
  | "none";

export interface FaceParams {
  skin: string;
  headScaleX: number;
  headScaleY: number;
  /** 0 (closed/sleepy) .. 1 (wide open). */
  eyeOpen: number;
  /** Degrees; positive furrows the brow inward (serious/angry), negative raises it (relaxed/sly). */
  browAngle: number;
  /** -1 (deep frown) .. 1 (big smile). */
  smile: number;
  mouthWidth: number;
  accessory: Accessory;
  accessoryColor: string;
  extra?: "beard" | "goatee";
  extraColor?: string;
}

// Drawn, not photographed: simple cartoon proportions built from a handful of
// numeric knobs (eye openness, brow angle, smile curve) plus one or two
// signature props per hero, so every face is a distinct little person rather
// than a copy-pasted template.
export const FACES: Record<string, FaceParams> = {
  "rapaz-barata": {
    skin: "#a9784f",
    headScaleX: 0.95,
    headScaleY: 0.95,
    eyeOpen: 0.55,
    browAngle: 10,
    smile: 0.35,
    mouthWidth: 1,
    accessory: "antennae",
    accessoryColor: "#3b2a1c",
  },
  torneco: {
    skin: "#e8b88a",
    headScaleX: 1,
    headScaleY: 1,
    eyeOpen: 0.85,
    browAngle: 14,
    smile: -0.1,
    mouthWidth: 1,
    accessory: "none",
    accessoryColor: "#000",
    extra: "beard",
    extraColor: "#c9971f",
  },
  "alho-poro": {
    skin: "#c98a5e",
    headScaleX: 1,
    headScaleY: 0.95,
    eyeOpen: 0.65,
    browAngle: -6,
    smile: 0.4,
    mouthWidth: 1,
    accessory: "headphones",
    accessoryColor: "#d9a441",
  },
  "viuva-cinza": {
    skin: "#e3bda3",
    headScaleX: 0.92,
    headScaleY: 1,
    eyeOpen: 0.5,
    browAngle: 2,
    smile: -0.05,
    mouthWidth: 0.9,
    accessory: "sunglasses",
    accessoryColor: "#151515",
  },
  "capitao-brasil": {
    skin: "#f0c8a0",
    headScaleX: 1.05,
    headScaleY: 1,
    eyeOpen: 0.95,
    browAngle: 12,
    smile: 0.2,
    mouthWidth: 1.05,
    accessory: "wingHelmet",
    accessoryColor: "#b03436",
  },
  "ghomme-de-ferro": {
    skin: "#aab6bf",
    headScaleX: 1,
    headScaleY: 1,
    eyeOpen: 0.4,
    browAngle: 16,
    smile: 0.2,
    mouthWidth: 1,
    accessory: "visor",
    accessoryColor: "#d9a441",
    extra: "goatee",
    extraColor: "#2a2a2a",
  },
  ciumento: {
    skin: "#8fae6e",
    headScaleX: 0.95,
    headScaleY: 0.95,
    eyeOpen: 0.45,
    browAngle: 24,
    smile: -0.4,
    mouthWidth: 0.85,
    accessory: "catEars",
    accessoryColor: "#5c6e46",
  },
  "a-massa": {
    skin: "#9fae9f",
    headScaleX: 1.25,
    headScaleY: 1.1,
    eyeOpen: 0.35,
    browAngle: 6,
    smile: 0.05,
    mouthWidth: 1,
    accessory: "none",
    accessoryColor: "#000",
  },
  "ima-neto": {
    skin: "#bda6cf",
    headScaleX: 1,
    headScaleY: 1,
    eyeOpen: 0.65,
    browAngle: -10,
    smile: 0.35,
    mouthWidth: 1,
    accessory: "magnet",
    accessoryColor: "#7a7f87",
  },
  "doutor-estranhissimo": {
    skin: "#d3aa87",
    headScaleX: 0.9,
    headScaleY: 1.05,
    eyeOpen: 0.3,
    browAngle: -4,
    smile: 0.05,
    mouthWidth: 0.95,
    accessory: "spiral",
    accessoryColor: "#4fc3d9",
    extra: "goatee",
    extraColor: "#2a2a2a",
  },
  "pantera-parda": {
    skin: "#6b4a35",
    headScaleX: 1,
    headScaleY: 1,
    eyeOpen: 0.45,
    browAngle: 8,
    smile: 0.1,
    mouthWidth: 0.95,
    accessory: "cowl",
    accessoryColor: "#161616",
  },
  "tio-thanao": {
    skin: "#8e6fa3",
    headScaleX: 1.15,
    headScaleY: 1.05,
    eyeOpen: 0.5,
    browAngle: 8,
    smile: -0.15,
    mouthWidth: 1,
    accessory: "none",
    accessoryColor: "#000",
  },
};
