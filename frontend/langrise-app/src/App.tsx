import './App.css'
import LogIn from './components/LogIn'
import RevealWordsLists from "./components/RevealWordsLists.tsx";
import { useState } from "react";
import RevealWords from "./components/RevealWords.tsx";

type LogInData = {
    username: string,
    isLoggedIn: boolean,
}

function App() {
    const [logInData, setLogInData] = useState<LogInData>({
        username: "anon",
        isLoggedIn: false,
    })


    return (
        <>
            <LogIn logInData={logInData} setLogInData={setLogInData} />
            {logInData.isLoggedIn && <RevealWordsLists/>}
            {logInData.isLoggedIn && <RevealWords wordsListId={1} />}
        </>
    )
}

export default App
