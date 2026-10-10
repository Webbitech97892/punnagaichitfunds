export const parseApiError = (error: any): string => {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error.response) {
    const data = error.response.data;
    if (typeof data === 'string') {
      return data;
    }
    if (data?.message) {
      return data.message;
    }
    if (data?.error) {
      return data.error;
    }
    if (data?.response_message) {
      return data.response_message;
    }
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors[0];
    }
  }

  if (error.message) {
    if (error.message.includes('Network Error')) {
      return 'Network connection error. Please check your internet connection.';
    }
    if (error.message.includes('timeout')) {
      return 'Server response timeout. Please try again.';
    }
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};
