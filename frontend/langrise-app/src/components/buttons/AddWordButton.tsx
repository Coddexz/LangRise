import React from "react"
import { type Word } from "../RevealWords"

type AddWordProps = {
    setWordsData: React.Dispatch<React.SetStateAction<Word[] | null | undefined>>
    wordsChanged: boolean
    setWordsChanged: React.Dispatch<React.SetStateAction<boolean>>
};

export default function AddWord({ setWordsData, setWordsChanged, wordsChanged }: AddWordProps) {
    const handleClick = () => {
        setWordsData(existingWordsData => {
            const updatedWordsData = existingWordsData || [];
            const maxId = updatedWordsData.length > 0
                ? Math.max(0, ...updatedWordsData.map(word => word.id))
                : 0;

            const newEntry: Word = {
                id: maxId + 1,
                word: "New word",
                translation: "New translation",
                pronunciation: null,
                last_reviewed: null,
                next_review: null,
            };
            if (! wordsChanged) setWordsChanged(true)
            return [...updatedWordsData, newEntry];
        });
    };

    return (
        <button onClick={handleClick} id='addWordButton'>
            Add Word
        </button>
    );
}
