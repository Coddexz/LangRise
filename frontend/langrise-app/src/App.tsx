import './App.css'
import LogIn from './components/LogIn'
import RevealWordsLists from "./components/RevealWordsLists.tsx";
import { useState } from "react";
import RevealWords from "./components/RevealWords.tsx";

export type LogInData = {
    username: string,
    isLoggedIn: boolean,
}

export type View = 'login' | 'wordsLists' | 'words'
type wordsListId = number

function App() {
    const [logInData, setLogInData] = useState<LogInData>({
        username: "anon",
        isLoggedIn: false,
    })
    const [view, setView] = useState<View>('login')
    const [wordsListId, setWordsListId] = useState<wordsListId>(1)

    return (
        <>
            {!logInData.isLoggedIn ? (
                <LogIn logInData={logInData} setLogInData={setLogInData} setView={setView} />
            ) : (
                <>
                    {view=='wordsLists' && <RevealWordsLists setWordsListId={setWordsListId} setView={setView} />}
                    {view=='words' && <RevealWords wordsListId={wordsListId} setView={setView} />}
                </>
            )}
        </>
    )
}

export default App
