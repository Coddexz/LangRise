import React from "react";
import axios from "axios";

type LogInButtonProps = {
    setLogInData: React.Dispatch<React.SetStateAction<{
        username: string;
        isLoggedIn: boolean;
    }>>;
};

export default function LogInButton({ setLogInData }: LogInButtonProps) {
    const handleClick = async () => {
        const username = "admin";
        const password = "admin";

        try {
            const response = await axios.post("http://localhost:8000/api/token/", {
                username,
                password,
            });

            const { access, refresh } = response.data;

            // Save tokens to localStorage or cookies
            localStorage.setItem("access_token", access);
            localStorage.setItem("refresh_token", refresh);

            // Decode the access token (optional)
            const payload: any = JSON.parse(atob(access.split(".")[1]));
            console.log("Token Payload:", payload);

            setLogInData({
                username: payload.username || username,
                isLoggedIn: true,
            });
        } catch (error) {
            console.error("Authentication failed:", error);
        }
    };

    return <button onClick={handleClick}>Log In</button>;
}
