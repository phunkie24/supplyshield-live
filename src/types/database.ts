export interface Database {
  public: {
    Tables: Record<string, {
      Row: Record<string, unknown>;
      Insert: Record<string, unknown>;
      Update: Record<string, unknown>;
    }>;
  };
}

export interface Supplier {
  id: string;
  owner_id: string | null;
  name: string;
  category: string;
  country: string;
  contract_value: number | null;
  currency: string;
  criticality: number;
  delivery_score: number | null;
  quality_score: number | null;
  status: string;
  current_risk_score: number | null;
  current_risk_level: string;
  renewal_date: string | null;
  last_investigated_at: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Investigation {
  id: string;
  owner_id: string | null;
  supplier_id: string;
  mode: string;
  status: string;
  current_stage: string | null;
  trigger: string | null;
  executive_summary: string | null;
  overall_score: number | null;
  risk_level: string | null;
  confidence: number | null;
  model_name: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Evidence {
  id: string;
  investigation_id: string;
  supplier_id: string | null;
  source_url: string | null;
  source_title: string;
  publisher: string | null;
  published_at: string | null;
  retrieved_at: string;
  excerpt: string | null;
  extracted_claim: string | null;
  category: string;
  severity: number | null;
  confidence: number | null;
  source_quality: number | null;
  recency_weight: number | null;
  relevance: number | null;
  is_verified: boolean;
  is_demo: boolean;
  duplicate_group: string | null;
  created_at: string;
}

export interface RiskScore {
  id: string;
  investigation_id: string;
  category: string;
  raw_score: number | null;
  weighted_score: number | null;
  confidence: number | null;
  rationale: string | null;
  created_at: string;
}

export interface Recommendation {
  id: string;
  investigation_id: string;
  title: string;
  description: string | null;
  priority: string;
  rationale: string | null;
  expected_impact: string | null;
  status: string;
  owner_name: string | null;
  due_date: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
}

export type RiskLevel = "low" | "moderate" | "high" | "critical";
export type InvestigationStage =
  | "queued"
  | "collecting_signals"
  | "resolving_entity"
  | "verifying_evidence"
  | "classifying_risks"
  | "calculating_score"
  | "analysing_business_impact"
  | "generating_recommendations"
  | "completed"
  | "failed";
export type RecommendationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "modified"
  | "assigned"
  | "in_progress"
  | "completed"
  | "overdue";