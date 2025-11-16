import { useState, useCallback } from 'react';
import { apiCall } from '../utils/apiUtils';

export const useApiState = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (requestConfig, options = {}) => {
    setLoading(true);
    setError(null);

    const result = await apiCall(requestConfig, options);

    if (result.success) {
      setData(result.data);
      setError(null);
    } else {
      setError(result.message);
      setData(null);
    }

    setLoading(false);
    return result;
  }, []);

  const retry = useCallback(async (requestConfig, options = {}) => {
    return execute(requestConfig, options);
  }, [execute]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    retry,
    reset
  };
};

export default useApiState;