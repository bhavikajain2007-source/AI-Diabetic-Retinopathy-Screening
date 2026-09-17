export type GradeKey = "no_dr" | "mild" | "moderate" | "severe" | "proliferative_dr";

export type PredictionResponse = {
  success: true;
  severity: string;
  confidence: number;
  probabilities: Record<string, number>;
  heatmap_url?: string;
} | {
  success: false;
  error: string;
};

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
export const DEMO_MODE = String(import.meta.env.VITE_DEMO_MODE).toLowerCase() === "true";

// Real backend responses have drifted slightly from the originally frozen
// contract. This map normalizes whichever casing shows up so the rest of
// the app never has to care:
//   - probability keys may come back as "No DR" / "Mild" / ... (Title Case)
//     instead of "no_dr" / "mild" / ... (snake_case)
const KEY_MAP: Record<string, string> = {
  "no dr": "no_dr",
  "mild": "mild",
  "moderate": "moderate",
  "severe": "severe",
  "proliferative dr": "proliferative_dr",
};

function normalizeProbabilities(raw: Record<string, number> | undefined): Record<string, number> {
  if (!raw) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw)) {
    const mapped = KEY_MAP[k.toLowerCase().trim()] ?? k.toLowerCase().replace(/\s+/g, "_");
    out[mapped] = v;
  }
  return out;
}

// Dev-only: append ?reject=1 to the app URL to force the rejection branch
// without needing a live backend that actually rejects an image. Remove
// once the real backend is stable and you no longer need to test this path
// offline.
function forcedRejectionReason(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get("reject") !== "1") return null;
  const reasons = ["Image is too blurry.", "Image is too dark.", "Image resolution is too low."];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

export async function predictImage(file: File): Promise<PredictionResponse> {
  const forced = forcedRejectionReason();
  if (forced) {
    await new Promise((r) => setTimeout(r, 1200));
    return { success: false, error: forced };
  }

  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 2200));
    return {
      success: true,
      severity: "Severe",
      confidence: 0.83,
      probabilities: { no_dr: 0.02, mild: 0.03, moderate: 0.07, severe: 0.83, proliferative_dr: 0.05 }
    };
  }

  const form = new FormData();
  form.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/predict`, {
    method: "POST",
    body: form
  });

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Backend returned HTTP ${response.status} with an invalid JSON response.`);
  }

  if (!response.ok) {
    // FastAPI's default HTTPException shape is { detail: "..." }, not the
    // { error: "..." } that was originally frozen — accept either.
    throw new Error(data?.error || data?.detail || `Prediction failed (HTTP ${response.status}).`);
  }

  return {
    success: true,
    severity: data.severity || data.prediction, // backend currently sends "prediction", not "severity"
    confidence: data.confidence,
    probabilities: normalizeProbabilities(data.probabilities),
    heatmap_url: data.heatmap_url,
  };
}

export function imageUrl(path?: string) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
