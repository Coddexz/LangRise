import LogInButton from './buttons/LogInButton.tsx'
import RegisterButton from './buttons/RegisterButton.tsx'
import React from "react"
import { type View, type LogInData } from "../App"


export type LogInProps = {
    logInData: LogInData,
    setLogInData: React.Dispatch<React.SetStateAction<LogInData>>
    setView: React.Dispatch<React.SetStateAction<View>>
}

export default function LogIn({ logInData, setLogInData, setView }: LogInProps) {

    return (
        <>
            <h1>LangRise </h1>
            <div><img src='/langrise_logo.webp' alt='logo' className='logo login'/></div>

            {!logInData.isLoggedIn ?
                (
                    <>
                        <h2>Please log in to continue</h2>
                        <RegisterButton setLogInData={setLogInData} setView={setView} />
                        <LogInButton setLogInData={setLogInData} setView={setView} />
                    </>
                ) :
                (
                    <h2>Welcome back {logInData.username}!</h2>
                )
            }
        </>
    )
}