import { useState, useEffect } from "react";
import api from "./axiosConfig"; // Axios instance with interceptors

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
        setState({ data: response.data, error: null, isLoading: false });
      } catch (err) {
        setState({
          data: null,
          error: err instanceof Error ? err.message : "Unknown error",
          isLoading: false,
        });
      }
    };

    fetchData();
  }, [endpoint]);

  return state;
}
