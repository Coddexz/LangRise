import React, { useState } from 'react'
import { type Word } from '../RevealWords.tsx'
import {sendWordReview} from "../../api/sendWordReview.ts";

type PropsLearnWriteWords = {
  words: Word[]
  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

export default function LearnWriteWords({ words, isLoading, setIsLoading }: PropsLearnWriteWords) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answer, setAnswer] = useState('')
    const [score, setScore] = useState(0)
    const [showAnswer, setShowAnswer] = useState(false)

    if (words.length === 0) {
        return <div className="no-words">No words to learn</div>
    }

    const checkAnswer = () => {
        if (answer.trim().toLowerCase() === words[currentIndex].word.toLowerCase()) {
            setScore(score + 1)
        }
        setShowAnswer(true)
    }

    const goNext = async () => {
        setShowAnswer(false)
        setIsLoading(true)
        const answerToWord = answer ? answer : '0'
        const wordToSend = {word_id: word.id, typed_word: answerToWord}
        try {
            await sendWordReview('write_words', wordToSend)
        } catch (error) {
            alert(`Error: ${error}`)
        } finally {
            setIsLoading(false)
        }
        setAnswer('')
        setCurrentIndex(currentIndex + 1)
    }

    const word = words[currentIndex]

    if (!word) {
        return (
            <div className="finished">
                You have finished! Your score: {score} / {words.length}
            </div>
        )
    }

    return (
        <div className="learn-container">
            <div className="translation">
                Word: <strong>{word.translation}</strong>
            </div>
            <input
                className={`answer-input ${
                    showAnswer
                        ? answer.trim().toLocaleLowerCase() === words[currentIndex].word.toLocaleLowerCase()
                            ? 'correct'
                            : 'wrong'
                        : ''
                }`}
                type="text"
                value={answer}
                placeholder="Type your answer here"
                onChange={e => setAnswer(e.target.value)}
                disabled={showAnswer}
            />
            <div className="correct-answer">
                Correct answer: {showAnswer ? <strong>{word.word}</strong> : '#'.repeat(word.word.length)}
            </div>
            <div className="buttons">
                <button
                    className="check-button"
                    disabled={showAnswer || isLoading}
                    onClick={checkAnswer}
                >
                    Check
                </button>
                <button className="next-button" onClick={goNext} disabled={isLoading}>
                    Next
                </button>
            </div>
            <div className="score">
                Score: <strong>{score}</strong>
            </div>
        </div>
    )
}