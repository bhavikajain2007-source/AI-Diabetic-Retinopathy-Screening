export type View = "dashboard" | "screening" | "results";
export type Step = 1 | 2 | 3 | "analyzing" | "rejected";
export type Patient = {
  name: string;
  id: string;
  age: string;
  eye: "Right (OD)" | "Left (OS)";
  diabetesYears: string;
  contact: string;
};
export type Result = {
  grade: number;
  key: string;
  label: string;
  confidence: number;
  probabilities: Record<string, number>;
  heatmapUrl?: string;
};
