import React from "react";
import { type Word } from "../RevealWords";

type AddWordProps = {
    setWordsData: React.Dispatch<React.SetStateAction<Word[] | null>>
    wordsListId: number
};

export default function AddWord({ setWordsData, wordsListId }: AddWordProps) {
    const handleClick = () => {
        setWordsData(existingWordsData => {
            const updatedWordsData = existingWordsData || [];
            const maxId = updatedWordsData.length > 0
                ? Math.max(0, ...updatedWordsData.map(word => word.id))
                : 0;

            const newEntry: Word = {
                id: maxId + 1,
                word: "",
                translation: "",
                pronunciation: null,
                interval: 1,
                last_reviewed: null,
                words_list: wordsListId,
                image: null,
            };

            return [...updatedWordsData, newEntry];
        });
    };

    return (
        <button onClick={handleClick}>
            Add Word
        </button>
    );
}
