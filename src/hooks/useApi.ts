import { useState, useCallback } from 'react';
import type { AxiosError } from 'axios';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (fn: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await fn();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      const message = axiosErr.response?.data?.message ?? 'Something went wrong';
      setState({ data: null, loading: false, error: message });
      throw err;
    }
  }, []);

  return { ...state, execute };
}
