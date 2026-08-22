export interface BodyStage {
  shirt: string;
  shirtAccent: string;
  pose: "stand" | "confident" | "action";
  prop: "none" | "pipe" | "hammer" | "shield";
  cape: boolean;
  glow: string | null;
}

/**
 * Full-body art, one entry per hero, three stages matching: just recruited,
 * first hero upgrade owned, second hero upgrade owned. Only heroes listed
 * here get the poster treatment — everyone else still shows the round face
 * portrait until they get their own entry.
 */
export const BODIES: Record<string, [BodyStage, BodyStage, BodyStage]> = {
  "rapaz-barata": [
    { shirt: "#5b5142", shirtAccent: "#413a30", pose: "stand", prop: "none", cape: false, glow: null },
    { shirt: "#6b3f37", shirtAccent: "#8a3f36", pose: "confident", prop: "pipe", cape: false, glow: null },
    { shirt: "#3c2f2a", shirtAccent: "#8a3f36", pose: "action", prop: "pipe", cape: true, glow: "#7ee08a" },
  ],
  torneco: [
    { shirt: "#6b5a45", shirtAccent: "#4a4038", pose: "stand", prop: "none", cape: false, glow: null },
    { shirt: "#38517a", shirtAccent: "#c9971f", pose: "confident", prop: "hammer", cape: false, glow: null },
    { shirt: "#2a3d5c", shirtAccent: "#c9971f", pose: "action", prop: "hammer", cape: true, glow: "#ffd76a" },
  ],
  "alho-poro": [
    { shirt: "#4a5568", shirtAccent: "#37404d", pose: "stand", prop: "none", cape: false, glow: null },
    { shirt: "#3f6b52", shirtAccent: "#d9863f", pose: "confident", prop: "pipe", cape: false, glow: null },
    { shirt: "#2e4f3d", shirtAccent: "#d9863f", pose: "action", prop: "pipe", cape: false, glow: "#b28aff" },
  ],
  "viuva-cinza": [
    { shirt: "#3a3a42", shirtAccent: "#2a2a30", pose: "stand", prop: "none", cape: false, glow: null },
    { shirt: "#2c2c33", shirtAccent: "#8a3f36", pose: "confident", prop: "none", cape: false, glow: null },
    { shirt: "#1c1c22", shirtAccent: "#8a3f36", pose: "action", prop: "none", cape: false, glow: "#7ee0e0" },
  ],
  "capitao-brasil": [
    { shirt: "#7a3a3c", shirtAccent: "#5c2a2c", pose: "stand", prop: "none", cape: false, glow: null },
    { shirt: "#1f6b3a", shirtAccent: "#d9a441", pose: "confident", prop: "shield", cape: false, glow: null },
    { shirt: "#0f4a2a", shirtAccent: "#d9a441", pose: "action", prop: "shield", cape: true, glow: "#ffe08a" },
  ],
  "ghomme-de-ferro": [
    { shirt: "#6b6f75", shirtAccent: "#4f5359", pose: "stand", prop: "none", cape: false, glow: null },
    { shirt: "#8a3f36", shirtAccent: "#d9a441", pose: "confident", prop: "none", cape: false, glow: null },
    { shirt: "#5c1f1a", shirtAccent: "#d9a441", pose: "action", prop: "none", cape: false, glow: "#ffcf5c" },
  ],
  ciumento: [
    { shirt: "#5a4a6b", shirtAccent: "#413552", pose: "stand", prop: "none", cape: false, glow: null },
    { shirt: "#4a3a5c", shirtAccent: "#c9d95a", pose: "confident", prop: "none", cape: false, glow: null },
    { shirt: "#2f2440", shirtAccent: "#c9d95a", pose: "action", prop: "none", cape: false, glow: "#c9e05a" },
  ],
  "a-massa": [
    { shirt: "#7a8a7a", shirtAccent: "#5c6b5c", pose: "stand", prop: "none", cape: false, glow: null },
    { shirt: "#5c6b5c", shirtAccent: "#3a4a3a", pose: "confident", prop: "none", cape: false, glow: null },
    { shirt: "#3a4a3a", shirtAccent: "#2a3a2a", pose: "action", prop: "none", cape: false, glow: "#9fdba0" },
  ],
  "ima-neto": [
    { shirt: "#4a3f5c", shirtAccent: "#372e47", pose: "stand", prop: "none", cape: false, glow: null },
    { shirt: "#3a2f4c", shirtAccent: "#7a7f87", pose: "confident", prop: "none", cape: false, glow: null },
    { shirt: "#241c33", shirtAccent: "#7a7f87", pose: "action", prop: "none", cape: true, glow: "#e07ee0" },
  ],
  "doutor-estranhissimo": [
    { shirt: "#5c4a3a", shirtAccent: "#42352a", pose: "stand", prop: "none", cape: false, glow: null },
    { shirt: "#2c3a5c", shirtAccent: "#d9a441", pose: "confident", prop: "none", cape: false, glow: null },
    { shirt: "#1a2440", shirtAccent: "#4fc3d9", pose: "action", prop: "none", cape: true, glow: "#4fc3d9" },
  ],
  "pantera-parda": [
    { shirt: "#2a2a2a", shirtAccent: "#1c1c1c", pose: "stand", prop: "none", cape: false, glow: null },
    { shirt: "#1c1c1c", shirtAccent: "#d9a441", pose: "confident", prop: "none", cape: false, glow: null },
    { shirt: "#0d0d0d", shirtAccent: "#d9a441", pose: "action", prop: "none", cape: false, glow: "#9a6fd9" },
  ],
  "tio-thanao": [
    { shirt: "#5c5266", shirtAccent: "#443c4d", pose: "stand", prop: "none", cape: false, glow: null },
    { shirt: "#4a4058", shirtAccent: "#d9a441", pose: "confident", prop: "none", cape: false, glow: null },
    { shirt: "#2e2838", shirtAccent: "#d9a441", pose: "action", prop: "none", cape: true, glow: "#a37ee0" },
  ],
};
