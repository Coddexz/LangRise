import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/",
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refresh_token");
                const { data } = await axios.post("http://localhost:8000/api/token/refresh/", {
                    refresh: refreshToken,
                });

                localStorage.setItem("access_token", data.access);
                originalRequest.headers.Authorization = `Bearer ${data.access}`;

                return axios(originalRequest);
            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                // Handle logout if needed
            }
        }

        return Promise.reject(error);
    }
);

export default api;
