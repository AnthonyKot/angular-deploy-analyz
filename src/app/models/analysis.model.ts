// Types for our analysis system
export type AnalysisItemType = "success" | "warning" | "danger";
export type SeverityLevel = "critical" | "high" | "medium" | "low";
export type CategoryType = "security" | "reliability" | "performance" | "scalability" | "cost";

export interface AnalysisResult {
  good: AnalysisItem[];
  ok: AnalysisItem[];
  improvements: AnalysisItem[];
  scoreBreakdown?: ScoreBreakdown;
  overallScore?: number;
}

export interface AnalysisItem {
  title: string;
  type: AnalysisItemType;
  details?: string;
  severity?: SeverityLevel;
  category?: CategoryType;
  recommendation?: string;
  fixExample?: string;
  id?: string;
}

export interface ScoreBreakdown {
  security: number;
  reliability: number;
  performance: number;
  scalability: number;
  cost: number;
}