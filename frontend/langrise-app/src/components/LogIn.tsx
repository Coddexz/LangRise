import {useState} from "react";
import LogInButton from "./Button/LogInButton.tsx";

export default function LogIn() {

    type LogInData = {
        username: string,
        isLoggedIn: boolean,
    }

    const [logInData, setLogInData] = useState<LogInData>({
        username: "Anonymous",
        isLoggedIn: false,
    })

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