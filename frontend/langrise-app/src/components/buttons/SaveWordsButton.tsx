import React from "react"
import { type Word } from "../RevealWords.tsx"

type SaveWordsButtonProps = {
    wordsData: Word[] | undefined | null
    wordsChanged: boolean
    setWordsChanged: React.Dispatch<React.SetStateAction<boolean>>
}

export default function SaveWordsButton({ wordsData, wordsChanged, setWordsChanged }: SaveWordsButtonProps) {
    const lastWord = wordsData?.length
        ? wordsData[wordsData.length - 1]?.word
        : 'No words available'

    const handleClick = () => {
        setWordsChanged(false)
        alert(`TBD\nwords sent!\nlast word: ${lastWord}`)
    }

    return (
        <button disabled={!wordsChanged} id='saveWordsButton'
                onClick={() => handleClick()}>
            Save
        </button>
    )
}