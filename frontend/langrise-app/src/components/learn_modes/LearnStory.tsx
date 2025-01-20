import { useEffect, useState } from 'react'
import { type Word } from "../RevealWords.tsx"

type Props = {
  words: Word[]
  level: string
}

export default function LearnStory({ words, level }: Props) {
  const [story, setStory] = useState('')
  const [question, setQuestion] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await fetch('/tasks/?task=chatgpt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ words, level })
        })
        const data = await response.json()
        setStory(data.story)
        setQuestion(data.question)
        setCorrectAnswer(data.answer)
      } catch (e) {
      }
    }
    fetchStory()
  }, [words, level])

  const checkAnswer = () => {
    if (userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()) {
      setScore(score + 1)
    }
    setUserAnswer('')
  }

  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: story }} />
      <div>{question}</div>
      <input
        value={userAnswer}
        onChange={e => setUserAnswer(e.target.value)}
      />
      <button onClick={checkAnswer}>Check Answer</button>
      <div>Score: {score}</div>
    </div>
  )
}
