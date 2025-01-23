import { useState } from 'react'
import { type Word } from '../RevealWords.tsx'

type Props = {
  words: Word[]
}

export default function LearnWriteWords({ words }: Props) {
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

    const goNext = () => {
        setShowAnswer(false)
        setCurrentIndex(currentIndex + 1)
        setAnswer('')
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
                    disabled={showAnswer}
                    onClick={checkAnswer}
                >
                    Check
                </button>
                <button className="next-button" onClick={goNext}>
                    Next
                </button>
            </div>
            <div className="score">
                Score: <strong>{score}</strong>
            </div>
        </div>
    )
}