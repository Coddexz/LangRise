import React from "react";
import axios from "axios";
import { type LogInData, type View} from "../../App.tsx";

type LogInButtonProps = {
    setLogInData: React.Dispatch<React.SetStateAction<LogInData>>,
    setView: React.Dispatch<React.SetStateAction<View>>
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

export default function LogInButton({ setLogInData, setView }: LogInButtonProps) {
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
                userId: 1,
            })

            setView('wordsLists')
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
