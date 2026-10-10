export interface AgentProfile {
  id?: number | string;
  agent_id?: number | string;
  agent_name: string;
  agent_mobile: string;
  agent_address?: string;
  agent_code?: string;
  agent_photo?: string;
}

export interface CustomerData {
  id?: number | string;
  chit_custid?: string;
  chit_id?: number | string;
  chit_groupcode?: string;
  name: string;
  mobile: string;
  chit_plan: string | number;
  group_name: string;
  chit_started_date: string;
  total_paid_amount: string | number;
  pending_amount: string | number;
  next_chit_date?: string | null;
  last_payment_date?: string | null;
  perday_collection_amount?: string | number;
  chit_amount?: string | number;
}

export interface TransactionItem {
  id: string | number;
  name: string;
  date: string;
  amount: string | number;
}

export interface TodayEarningsResponse {
  total_earnings: string | number;
  individual_earnings: TransactionItem[];
}

export interface ApiResponse<T = any> {
  response_status: 'success' | 'sucess' | 'error' | string;
  message?: string;
  data?: T;
}

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  Home: undefined;
  Collection: undefined;
  Transaction: undefined;
  MyAccount: undefined;
};
