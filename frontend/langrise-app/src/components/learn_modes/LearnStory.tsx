import { useEffect, useState } from 'react'
import { type Word } from '../RevealWords.tsx'
import api from "../../services/axiosConfig.ts"
import {GAME_RATING_LIMITS, sendWordReview} from "../../api/sendWordReview.ts";

type ParsedQuestion = {
  text: string
  correctAnswer: 'True' | 'False' | 'N/A'
}

type PropsLearnStory = {
  words: Word[]
  language_level: string
  tone: string
  isLoadingPosting: boolean
  setIsLoadingPosting: React.Dispatch<React.SetStateAction<boolean>>
}

export default function LearnStory({ words, language_level, tone, isLoadingPosting, setIsLoadingPosting }: PropsLearnStory) {
  const [story, setStory] = useState('')
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([])
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [score, setScore] = useState<undefined | number>(undefined)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // --------------------------------------------
  // Fetching the data
  // --------------------------------------------
  useEffect(() => {
    const fetchStory = async () => {
      setIsLoading(true)
      try {
        const response = await api.post('/api/generate-story/', {
          words: words.map(w => w.word),
          language_level,
          tone
        })
        const data = await response.data
        setStory(data.story || '')

        const questionsArray = (data.questions || '')
          .split('\n')
          .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())

        const answersArray = (data.answers || '')
          .split('\n')
          .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())

        const combined = questionsArray.map((qText: string, i: number) => {
          const ansLetter = answersArray[i] || ''
          let correctAnswer: ParsedQuestion['correctAnswer'] = 'N/A'
          if (ansLetter.toUpperCase() === 'R') {
            correctAnswer = 'True'
          } else if (ansLetter.toUpperCase() === 'F') {
            correctAnswer = 'False'
          } else if (ansLetter.toUpperCase() === 'N') {
            correctAnswer = 'N/A'
          }
          return {
            text: qText,
            correctAnswer
          }
        })

        setParsedQuestions(combined)
      } catch (error: any) {
        console.error('Error fetching story:', error)
        setError('Could not fetch the story. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStory()
  }, [words, language_level, tone])

  // --------------------------------------------
  // Using Dummy Data for Testing
  // --------------------------------------------
  // useEffect(() => {
  //   setStory(`
  //     <p>Once upon a time, there was a curious developer who wanted to test their component without fetching data.</p>
  //     <p><strong>This is the test story</strong>, stored directly in the component!</p>
  //   `)
  //
  //   setParsedQuestions([
  //     { text: 'Is the story about a developer?', correctAnswer: 'True' },
  //     { text: 'Is the developer’s name Bob?', correctAnswer: 'N/A' },
  //     { text: 'Does the developer dislike React?', correctAnswer: 'False' }
  //   ])
  // }, [words, language_level, tone])

  const handleAnswerChange = (index: number, value: string) => {
    setUserAnswers(prev => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }

  const getLabelStyle = (questionIndex: number, labelValue: string) => {
    if (score === undefined) {
      return {}
    }

    const correctAnswer = parsedQuestions[questionIndex].correctAnswer
    const userAnswer = userAnswers[questionIndex] || ''

    if (!userAnswer) {
      if (labelValue === correctAnswer) {
        return { backgroundColor: 'darkgreen', color: 'white' }
      } else {
        return {}
      }
    }

    if (labelValue === correctAnswer) {
      return { backgroundColor: 'darkgreen', color: 'white' }
    } else {
      if (labelValue === userAnswer) {
        return { backgroundColor: 'darkred', color: 'white' }
      }
      return {}
    }
  }

  const checkAnswers = async () => {
    setIsLoadingPosting(true)

    const totalQuestions = parsedQuestions.length
    const correctAnswers = parsedQuestions.filter((q, i) =>
        q.correctAnswer.toLowerCase() === (userAnswers[i] || '').toLowerCase()
    ).length

    setScore(correctAnswers) // Use correctAnswers directly

    const maxRating = GAME_RATING_LIMITS.story
    const meanRating = totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * maxRating)
        : 0 // Avoid NaN if no questions

    const validRating = Math.max(0, Math.min(meanRating, maxRating))

    const wordsToSend = words.map(w => ({
      word_id: w.id,
      rating: validRating as 0 | 1 | 2 | 3 | 4
    }))

    try {
      await sendWordReview('story', wordsToSend)
    } catch (error) {
      alert(`Error: ${error}`)
    } finally {
      setIsLoadingPosting(false)
    }
}

  return (
    <div className="learn-container">
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <h2>Story</h2>
      <div dangerouslySetInnerHTML={{ __html: story }} />
      <h2>Questions</h2>
      {parsedQuestions.map((q, index) => (
        <div key={index} style={{ margin: '1rem 0' }}>
          <p>{`${index + 1}) ${q.text}`}</p>
          <label style={{ cursor: 'pointer', ...getLabelStyle(index, 'True')}}>
            <input
              type="radio"
              name={`answer-${index}`}
              value="True"
              checked={userAnswers[index] === 'True'}
              onChange={() => handleAnswerChange(index, 'True')}
            />{' '}
            True
          </label>
          <label style={{ cursor: 'pointer', marginLeft: '1rem', ...getLabelStyle(index, 'False') }}>
            <input
              type="radio"
              name={`answer-${index}`}
              value="False"
              checked={userAnswers[index] === 'False'}
              onChange={() => handleAnswerChange(index, 'False')}
            />{' '}
            False
          </label>
          <label style={{ cursor: 'pointer', marginLeft: '1rem', ...getLabelStyle(index, 'N/A') }}>
            <input
              type="radio"
              name={`answer-${index}`}
              value="N/A"
              checked={userAnswers[index] === 'N/A'}
              onChange={() => handleAnswerChange(index, 'N/A')}
            />{' '}
            N/A
          </label>
        </div>
      ))}
      {parsedQuestions.length > 0 && (
        <button
          className="check-button"
          onClick={checkAnswers}
          disabled={score !== undefined || isLoadingPosting}
        >
          Check
        </button>
      )}
      {score !== undefined && (
        <div className="score">
          Score: {score} / {parsedQuestions.length}
        </div>
      )}
    {isLoading && (
      <div className="spinner-overlay">
        <div className="spinner"></div>
      </div>
    )}
    </div>
  )
}
