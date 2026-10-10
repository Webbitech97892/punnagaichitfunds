import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';
import { StorageService } from '../constants/StorageService';
import {
  AgentProfile,
  CustomerData,
  TodayEarningsResponse,
  TransactionItem,
  ApiResponse,
} from '../types';

export const loginUser = async (datas: { name: string; password: string }): Promise<ApiResponse> => {
  try {
    const payload = {
      username: datas.name,
      password: datas.password,
    };
    const response = await apiClient.post<ApiResponse>(ENDPOINTS.AUTH.LOGIN, payload);
    return response.data;
  } catch (error: any) {
    console.error('[ApiService] loginUser error:', error?.response?.data || error.message);
    return error?.response?.data || { response_status: 'error', message: error.message };
  }
};

export const myAccount = async (customUserId?: string | number): Promise<AgentProfile[] | null> => {
  try {
    const userId = customUserId || (await StorageService.getUserId());
    const payload = {
      user_id: userId,
    };
    console.log('[API Request] POST ->', ENDPOINTS.AGENT.MY_ACCOUNT, payload);
    const response = await apiClient.post<{ data: AgentProfile[] }>(ENDPOINTS.AGENT.MY_ACCOUNT, payload);
    console.log('[API Response] /API_my_account:', response.data);
    return response.data?.data || null;
  } catch (error: any) {
    console.error('[ApiService] myAccount error:', error?.response?.data || error.message);
    return null;
  }
};

export const todayEarnings = async (): Promise<TodayEarningsResponse | null> => {
  try {
    const userId = await StorageService.getUserId();
    const payload = {
      agent_id: userId,
    };
    const response = await apiClient.post<{ data: TodayEarningsResponse }>(ENDPOINTS.AGENT.TODAY_EARNINGS, payload);
    return response.data?.data || null;
  } catch (error: any) {
    console.error('[ApiService] todayEarnings error:', error?.response?.data || error.message);
    return null;
  }
};

export const history = async (datas: { from: string; to: string }): Promise<TransactionItem[]> => {
  try {
    const userId = await StorageService.getUserId();
    const payload = {
      agent_id: userId,
      from_date: datas.from,
      to_date: datas.to,
    };
    const response = await apiClient.post<{ data: { individual_earnings: TransactionItem[] } }>(
      ENDPOINTS.AGENT.FILTER_DATE_WISE,
      payload
    );
    if (response.data?.data) {
      return response.data.data.individual_earnings || [];
    }
    return [];
  } catch (error: any) {
    console.error('[ApiService] history error:', error?.response?.data || error.message);
    return [];
  }
};

export const searchCustomer = async (
  query: string
): Promise<ApiResponse<CustomerData | CustomerData[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<CustomerData | CustomerData[]>>(
      ENDPOINTS.AGENT.SEARCH_CUSTOMER,
      {
        params: {
          search: query.trim(),
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('[ApiService] searchCustomer error:', error?.response?.data || error.message);
    return { response_status: 'error', message: 'Unable to fetch customer data.' };
  }
};

export const dateWiseHistory = async (datas: { from: string; to: string; number: string }): Promise<TransactionItem[]> => {
  try {
    const userId = await StorageService.getUserId();
    const payload = {
      agent_id: userId,
      from_date: datas.from,
      to_date: datas.to,
      phone: datas.number,
    };
    console.log('[API Request] POST ->', ENDPOINTS.AGENT.FILTER_DATE_WISE_AND_PHONE, payload);
    const response = await apiClient.post<any>(ENDPOINTS.AGENT.FILTER_DATE_WISE_AND_PHONE, payload);
    console.log('[API Response] /API_filter_date_wise_and_phone:', response.data);
    if (response.data?.data?.individual_earnings && Array.isArray(response.data.data.individual_earnings)) {
      return response.data.data.individual_earnings;
    } else if (Array.isArray(response.data?.data)) {
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error: any) {
    console.error('[ApiService] dateWiseHistory error:', error?.response?.data || error.message);
    return [];
  }
};

export const payment = async (customerData: CustomerData, amount: string | number): Promise<ApiResponse> => {
  try {
    const userId = await StorageService.getUserId();
    const payload = {
      agent_id: userId,
      customer_id: customerData.chit_custid,
      amount: amount,
      chit_id: customerData.chit_id,
      id: customerData.id,
    };
    const response = await apiClient.post<ApiResponse>(ENDPOINTS.AGENT.PAY_AMOUNT, payload);
    return response.data;
  } catch (error: any) {
    console.error('[ApiService] payment error:', error?.response?.data || error.message);
    return { response_status: 'error', message: 'Payment collection failed. Please try again.' };
  }
};

export interface UpdateProfileParams {
  agent_name: string;
  agent_mobile: string;
  agent_address: string;
  agent_photo?: string;
}

export const myAccountUpdate = async (params: UpdateProfileParams): Promise<ApiResponse> => {
  try {
    const userId = await StorageService.getUserId();
    const payload = {
      user_id: String(userId || ''),
      agent_name: params.agent_name.trim(),
      agent_mobile: params.agent_mobile.trim(),
      agent_address: params.agent_address.trim(),
      agent_photo: params.agent_photo || 'profile.jpg',
    };
    console.log('[API Request] PUT ->', ENDPOINTS.AGENT.MY_ACCOUNT_UPDATE, payload);
    const response = await apiClient.put<ApiResponse>(ENDPOINTS.AGENT.MY_ACCOUNT_UPDATE, payload);
    console.log('[API Response] /API_my_account_update:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[ApiService] myAccountUpdate error:', error?.response?.data || error.message);
    return error?.response?.data || { response_status: 'error', message: error.message || 'Profile update failed.' };
  }
};
