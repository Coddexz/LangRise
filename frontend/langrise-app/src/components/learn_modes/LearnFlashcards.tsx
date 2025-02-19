import React, {SetStateAction, useState} from 'react'
import { type Word } from '../RevealWords.tsx'
import {sendWordReview} from "../../api/sendWordReview.ts";'../../api/sendWordReview.ts'

type PropsLearnFlashcards = {
  words: Word[]
  isLoading: boolean
  setIsLoading: React.Dispatch<SetStateAction<boolean>>
}

export default function LearnFlashcards({words, isLoading, setIsLoading}: PropsLearnFlashcards) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)
  const [score, setScore] = useState(0)

  const handleMouseEnter = (color: string) => (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = 'scale(1.1)'
      e.currentTarget.style.boxShadow = `0 4px 8px ${color}`
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = 'scale(1)'
      e.currentTarget.style.boxShadow = 'none'
  }

  if (words.length === 0) {
    return <div className="no-words">No words to learn</div>
  }

  const handleFlip = () => setShowBack(!showBack)
  const handleKnow = () => {
    setScore(score + 1)
    goNext(3)
  }
  const handleDontKnow = () => {
    goNext(0)
  }
  const goNext = async (rating: number) => {
    setShowBack(false)
    setIsLoading(true)
    try {
        const wordsToSend = {word_id: word.id, rating: rating as 0 | 3}
        await sendWordReview('flashcards', wordsToSend)
        setCurrentIndex(currentIndex + 1)
    } catch (error) {
        alert(`Error: ${error}`)
    } finally {
        setIsLoading(false)
    }
  }

  const word = words[currentIndex]

  if (!word) {
    return <div className="finished">You have finished your flashcards Score: {score} / {words.length}</div>
  }

  return (
      <div className="learn-container">
        <div className="flashcard-container" onClick={handleFlip}>
          <div className={`flashcard ${showBack ? 'show-back' : ''}`}>
            <div className="flashcard-face flashcard-front">{word.translation}</div>
            <div className="flashcard-face flashcard-back">{showBack ? word.word : '#'.repeat(word.word.length)}</div>
          </div>
        </div>
          <div className="buttons">
              <button className="next-button" style={{backgroundColor: '#e74c3c', height: '60px', width: '180px'}}
                      onClick={handleDontKnow} disabled={isLoading}
                      onMouseEnter={handleMouseEnter('rgba(231, 76, 60, 0.4)')} onMouseLeave={handleMouseLeave}>
                  I didn't know
              </button>
              <button className="check-button" style={{backgroundColor: '#28A745', height: '60px', width: '180px'}}
                      onClick={handleKnow} disabled={isLoading}
                      onMouseEnter={handleMouseEnter('rgba(0, 128, 0, 0.4)')} onMouseLeave={handleMouseLeave}>
                  I knew it
              </button>
          </div>
          <div className="score">Score: <strong>{score}</strong></div>
      </div>
  )
}
