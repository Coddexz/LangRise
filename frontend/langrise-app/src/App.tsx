import './App.css'
import LogIn from './components/LogIn'
import RevealWordsLists from "./components/RevealWordsLists.tsx"
import { useState } from "react"
import RevealWords from "./components/RevealWords.tsx"
import { type Word } from "./components/RevealWords.tsx"
import RevealLearn from "./components/RevealLearn.tsx"
import { type Level } from "./components/buttons/LearnButton.tsx"

export type LogInData = {
    username: string,
    isLoggedIn: boolean,
}
export type Learn = 'learn_flashcards' | 'learn_match' | 'learn_write_words' | 'learn_story'
export type View = 'login' | 'wordsLists' | 'words' | Learn
type wordsListId = number

function App() {
    const [logInData, setLogInData] = useState<LogInData>({
        username: "anon",
        isLoggedIn: false,
    })
    const [view, setView] = useState<View>('login')
    const [wordsListId, setWordsListId] = useState<wordsListId>(1)
    const [wordsToLearn, setWordsToLearn] = useState<Word[] | []>([])
    const [languageLevel, setLanguageLevel] = useState<Level>(undefined)
    const [tone, setTone] = useState('Neutral')

    return (
        <>
            {!logInData.isLoggedIn ? (
                <LogIn logInData={logInData} setLogInData={setLogInData} setView={setView} />
            ) : (
                <>
                    {view=='wordsLists' && <RevealWordsLists setWordsListId={setWordsListId} setView={setView}
                                                             logInData={logInData} />}
                    {view=='words' && <RevealWords wordsListId={wordsListId} setView={setView}
                                                   setWordsToLearn={setWordsToLearn} languageLevel={languageLevel}
                        setLanguageLevel={setLanguageLevel} tone={tone} setTone={setTone} />}
                    {['learn_flashcards', 'learn_match', 'learn_write_words', 'learn_story'].includes(view)
                        && <RevealLearn view={view} setView={setView} wordsToLearn={wordsToLearn}
                                        languageLevel={languageLevel} tone={tone} />}
                </>
            )}
        </>
    )
}

export default App
