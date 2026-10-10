export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/API_verify_login',
  },
  AGENT: {
    MY_ACCOUNT: '/API_my_account',
    TODAY_EARNINGS: '/API_today_earnings',
    FILTER_DATE_WISE: '/API_filter_date_wise',
    SEARCH_CUSTOMER: '/API_search_customer',
    FILTER_DATE_WISE_AND_PHONE: '/API_filter_date_wise_and_phone',
    PAY_AMOUNT: '/API_pay_amount',
    MY_ACCOUNT_UPDATE: '/API_my_account_update',
  },
} as const;
