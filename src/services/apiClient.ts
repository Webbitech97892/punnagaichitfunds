import axios, {AxiosInstance, InternalAxiosRequestConfig} from 'axios';
import {API_BASE_URL} from '@env';

const FALLBACK_BASE_URL = 'https://webbitech.in/beta/citfunds/crm';
const resolvedBaseUrl = API_BASE_URL || FALLBACK_BASE_URL;

if (__DEV__) {
  console.log('[ApiClient] Resolved BASE_URL:', resolvedBaseUrl);
}

const apiClient: AxiosInstance = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (__DEV__) {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} -> ${config.baseURL}${
          config.url
        }`,
        {
          params: config.params,
          data: config.data,
        },
      );
    }
    return config;
  },
  error => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  response => {
    if (__DEV__) {
      console.log(
        `[API Response] ${response.config.url} [${response.status}]`,
        response.data,
      );
    }
    return response;
  },
  async error => {
    if (__DEV__) {
      console.log(
        `[API Error] ${error.config?.url}:`,
        error.response?.data || error.message,
      );
    }
    return Promise.reject(error);
  },
);

export default apiClient;
