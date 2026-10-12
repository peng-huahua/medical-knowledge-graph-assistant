export interface Department {
  name: string;
  confidence: number;
  reasons: string[];
}

export interface Examination {
  name: string;
  description?: string;
  importance: string;
}

export interface GuidanceRequest {
  symptoms: string;
  patient_info?: string;
  medical_history?: string;
  include_knowledge_graph?: boolean;
}

export interface GuidanceResponse {
  departments: Department[];
  primary_recommendation: string;
  preparation_advice: string[];
  possible_examinations: Examination[];
  is_emergency: boolean;
  emergency_advice?: string;
  knowledge_graph_data?: any;
  additional_information?: string;
  timestamp: string;
}

export interface GuidanceState {
  result: GuidanceResponse | null;
  loading: boolean;
  error: string | null;
}

export interface GuidanceFormData {
  symptoms: string;
  patient_info: string;
  medical_history: string;
  include_knowledge_graph: boolean;
} 