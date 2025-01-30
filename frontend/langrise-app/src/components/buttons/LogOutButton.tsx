import React from "react"
import { type LogInData, View } from "../../App.tsx"


type LogOutButtonProps = {
    setLogInData: React.Dispatch<React.SetStateAction<LogInData>>
    setView: React.Dispatch<React.SetStateAction<View>>
}

export default function ({ setLogInData, setView}: LogOutButtonProps) {
    const handleClick = () => {
        localStorage.clear()
        setLogInData({
            isLoggedIn: false,
            username: 'anon',
        })
        setView('login')
    }
    return <button onClick={handleClick}>Log out</button>
}