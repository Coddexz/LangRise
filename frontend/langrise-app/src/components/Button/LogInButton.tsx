import * as React from "react";

type LogInButtonProps = {
    setLogInData: React.Dispatch<React.SetStateAction<{
        username: string,
        isLoggedIn: boolean,
    }>>
}

export default function LogInButton({ setLogInData } : LogInButtonProps) {
    const handleClick = () => {
        setLogInData((prev) => ({
            ...prev,
            isLoggedIn: true,
        }))
    }
    return <button onClick={handleClick}>Log In</button>;
}