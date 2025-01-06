import React from "react";
import axios from "axios";

type LogInButtonProps = {
    setLogInData: React.Dispatch<React.SetStateAction<{
        username: string;
        isLoggedIn: boolean;
    }>>;
};

// type Payload = {
//     'exp': number,
//     'iat': number
//     'jti': string,
//     'token_type': string
//     'user_id': number
// }

type TokenResponse = {
    access: string;
    refresh: string;
};

export default function LogInButton({ setLogInData }: LogInButtonProps) {
    const handleClick = async () => {
        const username = "admin";
        const password = "admin";

        try {
            const response = await axios.post<TokenResponse>("http://localhost:8000/api/token/", {
                username,
                password,
            });

            const {access, refresh} = response.data as TokenResponse;

            // Save tokens to localStorage or cookies
            localStorage.setItem("access_token", access);
            localStorage.setItem("refresh_token", refresh);

            // Decode the access token (optional)
            // const payload: Payload = JSON.parse(atob(access.split(".")[1]));
            // console.log("Token Payload:", payload);

            setLogInData({
                username: username,
                isLoggedIn: true,
            });
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error("Authentication failed:", error.response?.data?.message || error.message);
            } else {
                console.error("Unexpected error:", error);
            }
        }
    }

    return <button onClick={handleClick}>Log In</button>;
}
