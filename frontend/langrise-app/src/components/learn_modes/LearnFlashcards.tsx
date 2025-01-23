import React, { useState } from 'react'
import {type Word} from '../RevealWords.tsx'

type Props = {
  words: Word[]
}

export default function LearnFlashcards({words}: Props) {
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
    goNext()
  }
  const handleDontKnow = () => {
    goNext()
  }
  const goNext = () => {
    setShowBack(false)
    setCurrentIndex(currentIndex + 1)
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
          <button className="check-button" style={{ backgroundColor: '#28A745', height: '60px', width: '180px' }}
                  onClick={handleKnow}
                  onMouseEnter={handleMouseEnter('rgba(0, 128, 0, 0.4)')} onMouseLeave={handleMouseLeave}>
            I knew it
          </button>
          <button className="next-button" style={{ backgroundColor: '#e74c3c', height: '60px', width: '180px' }}
                  onClick={handleDontKnow}
                  onMouseEnter={handleMouseEnter('rgba(231, 76, 60, 0.4)')} onMouseLeave={handleMouseLeave}>
            I didn't know
          </button>
        </div>
        <div className="score">Score: <strong>{score}</strong></div>
      </div>
  )
}
