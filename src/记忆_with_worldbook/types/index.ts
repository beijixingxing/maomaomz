// 基础类型定义
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  message: string;
  name?: string;
  is_name?: boolean;
  send_date?: number;
  extra?: Record<string, any>;
}

export interface SummaryHistory {
  start_id: number;
  end_id: number;
  content: string;
  created_at?: string;
}

export interface APISettings {
  api_endpoint: string;
  api_key: string;
  model: string;
  max_tokens: number;
  temperature: number;
  top_p: number;
  presence_penalty: number;
  frequency_penalty: number;
}

export interface WorldbookEntry {
  name: string;
  content: string;
  enabled: boolean;
  position: number;
  keys: string[];
}

export interface DebugInfo {
  variableInfo: any;
  chatInfo: any;
  worldbookInfo: any;
}

export interface StoreState {
  settings: APISettings;
  summary_history: SummaryHistory[];
  available_models: string[];
  loading: boolean;
  error: string | null;
}
