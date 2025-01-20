import { useState, useMemo } from 'react'
import { type Word } from '../RevealWords'

type Props = {
  words: Word[]
}

type SelectedItem = {
  list: 'word' | 'translation'
  item: Word
} | null

type MatchedPair = {
  word: Word
  translation: Word
  correct: boolean
}

export default function LearnMatch({ words }: Props) {
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null)
  const [matchedPairs, setMatchedPairs] = useState<MatchedPair[]>([])
  const [isChecked, setIsChecked] = useState(false)

  const shuffle = (array: Word[]) => [...array].sort(() => 0.5 - Math.random())
  const [wordList, setWordList] = useState<Word[]>(() => shuffle(words))
  const [translationList, setTranslationList] = useState<Word[]>(() => shuffle(words))

  const handleWordClick = (word: Word) => {
    if (isChecked) return
    if (!selectedItem) {
      setSelectedItem({ list: 'word', item: word })
      return
    }
    if (selectedItem.list === 'word') {
      if (selectedItem.item.id === word.id) {
        setSelectedItem(null)
      } else {
        setSelectedItem({ list: 'word', item: word })
      }
    } else {
      const translation = selectedItem.item
      setMatchedPairs([...matchedPairs, { word, translation, correct: false }])
      setWordList(wordList.filter(w => w.id !== word.id))
      setTranslationList(translationList.filter(t => t.id !== translation.id))
      setSelectedItem(null)
    }
  }

  const handleTranslationClick = (tr: Word) => {
    if (isChecked) return
    if (!selectedItem) {
      setSelectedItem({ list: 'translation', item: tr })
      return
    }
    if (selectedItem.list === 'translation') {
      if (selectedItem.item.id === tr.id) {
        setSelectedItem(null)
      } else {
        setSelectedItem({ list: 'translation', item: tr })
      }
    } else {
      const w = selectedItem.item
      setMatchedPairs([...matchedPairs, { word: w, translation: tr, correct: false }])
      setWordList(wordList.filter(x => x.id !== w.id))
      setTranslationList(translationList.filter(x => x.id !== tr.id))
      setSelectedItem(null)
    }
  }

  const handlePairClick = (index: number) => {
    if (isChecked) return
    const pairToRemove = matchedPairs[index]
    setMatchedPairs(matchedPairs.filter((_, i) => i !== index))
    setWordList([...wordList, pairToRemove.word])
    setTranslationList([...translationList, pairToRemove.translation])
  }

  const handleCheck = () => {
    setIsChecked(true)
    setMatchedPairs(matchedPairs.map(p => ({ ...p, correct: p.word.id === p.translation.id })))
  }

  const score = useMemo(() => {
    return matchedPairs.filter(p => p.correct).length
  }, [matchedPairs])

  return (
      <div className="learn-container">

        <div className="listsContainer">
          <div className="listsTile">
            <h3>Words</h3>
            {wordList.map(w => (
                <div
                    key={w.id}
                    onClick={() => handleWordClick(w)}
                    className={`match-item ${
                        selectedItem?.list === 'word' && selectedItem?.item.id === w.id ? 'selected' : ''
                    }`}
                >
                  {w.word}
                </div>
            ))}
          </div>
          <div className="listsTile">
            <h3>Translations</h3>
            {translationList.map(t => (
                <div
                    key={t.id}
                    onClick={() => handleTranslationClick(t)}
                    className={`match-item ${
                        selectedItem?.list === 'translation' && selectedItem?.item.id === t.id ? 'selected' : ''
                    }`}
                >
                  {t.translation}
                </div>
            ))}
          </div>
        </div>

        <h3>Matched Pairs</h3>
        <div className="listsContainer matched-pairs">
          {matchedPairs.map((p, i) => (
              <div
                  key={i}
                  onClick={() => handlePairClick(i)}
                  className={`listsTile pair-item ${isChecked ? (p.correct ? 'correct' : 'wrong') : ''}`}
                  style={{cursor: isChecked ? 'auto' : 'pointer'}}
              >
                <div className="pair-word">{p.word.word}</div>
                <div className="pair-translation">{p.translation.translation}</div>
              </div>
          ))}
        </div>
        <div className="buttons">
          <button
              onClick={handleCheck}
              disabled={isChecked}
              className="check-button"
          >
            Check
          </button>
          <div className="score">Score: {isChecked ? score : 0}</div>
        </div>
      </div>
  )
}
