import React from "react"
import { type Word } from "./RevealWords.tsx"
import { type View } from "../App.tsx"

type RevealLearnProps = {
    setView: React.Dispatch<React.SetStateAction<View>>
    view: View
    wordsToLearn: Word[] | []
}

export default function RevealLearn({ setView, view, wordsToLearn }: RevealLearnProps) {
    console.log(view)
    console.log(wordsToLearn)
    return (
        <div>
            <h2>Words to Learn</h2>
            {wordsToLearn.length > 0 ? (
                <ul>
                    {wordsToLearn.map((word) => (
                        <li key={word.id}>
                            <p><strong>Word:</strong> {word.word}</p>
                            <p><strong>Translation:</strong> {word.translation}</p>
                            {word.pronunciation && (
                                <p><strong>Pronunciation:</strong> {word.pronunciation}</p>
                            )}
                            <p><strong>Interval:</strong> {word.interval}</p>
                            <p>
                                <strong>Last Reviewed:</strong>
                                {word.last_reviewed ? word.last_reviewed : "Never"}
                            </p>
                            {word.image && (
                                <p>
                                    <strong>Image:</strong> <img src={word.image} alt={word.word} width="50" />
                                </p>
                            )}
                            <hr />
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No words to learn!</p>
            )}
            <button onClick={() => setView("words")}>Go Back</button>
        </div>
    )
}
