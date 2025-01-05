import LogInButton from './buttons/LogInButton.tsx'
import React from "react";

type LogInData = {
  username: string;
  isLoggedIn: boolean;
};

type LogInProps = {
    logInData: LogInData,
    setLogInData: React.Dispatch<React.SetStateAction<LogInData>>
}

export default function LogIn({ logInData, setLogInData }: LogInProps) {

    return (
        <>
            <h1>LangRise</h1>
            {!logInData.isLoggedIn ?
                (
                    <>
                        <h2>Please log in to continue</h2>
                        <LogInButton setLogInData={setLogInData}/>
                    </>
                ) :
                (
                    <h2>Welcome back {logInData.username}!</h2>
                )
            }
        </>
    )
}