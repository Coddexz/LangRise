import { useState, useEffect } from "react";
import api from "../../services/axiosConfig.ts"; // Axios instance with interceptors

type FetchState<T> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
};

export default function useFetch<T>(endpoint: string) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await api.get<T>(endpoint);

      // Update only if state has changed
      setState((prevState) => {
        if (prevState.data !== response.data) {
          return { data: response.data, error: null, isLoading: false };
        }
        return prevState;
      });
    } catch (err) {
      setState((prevState) => ({
        ...prevState,
        error: err instanceof Error ? err.message : "Unknown error",
        isLoading: false,
      }));
    }
  };

    fetchData();
  }, []);

  return state;
}
