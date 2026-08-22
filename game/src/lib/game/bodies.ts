export interface BodyStage {
  shirt: string;
  shirtAccent: string;
  pose: "stand" | "confident" | "action";
  prop: "none" | "pipe";
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
};
