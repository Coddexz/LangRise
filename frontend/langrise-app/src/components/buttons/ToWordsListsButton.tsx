import React, {SetStateAction} from "react"
import { type View } from "../../App.tsx"

type ToWordsListsButtonProps = {
    setView: React.Dispatch<SetStateAction<View>>
}

export default function ToWordsListsButton({ setView }: ToWordsListsButtonProps) {

    function handleClick() {
        setView('wordsLists')
    }
    return (
        <button id='toWordsListsButton' onClick={() => handleClick()}>
            Go Back
        </button>
    )
}