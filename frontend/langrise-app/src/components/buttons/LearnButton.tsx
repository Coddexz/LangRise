import React, { useState } from "react"
import Popup from "reactjs-popup"
import { type Word } from "../RevealWords.tsx"
import { type Learn, type View } from "../../App.tsx"

type LearnButtonProps = {
  wordsData: Word[] | undefined | null
  setWordsToLearn: React.Dispatch<React.SetStateAction<[] | Word[]>>
  setView: React.Dispatch<React.SetStateAction<View>>
}

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2"

export default function LearnButton({ wordsData, setWordsToLearn, setView }: LearnButtonProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [learnMode, setLearnMode] = useState<Learn | "">("")
  const [level, setLevel] = useState<Level | "">("")

  const handleClick = () => {
    if (!wordsData) {
      alert("No words to learn")
      return
    }
    setIsPopupOpen(true)
  }

  const handleLearn = () => {
    if (!learnMode || (learnMode === "learn_story" && !level)) {
      alert("Please select a valid mode and level (if required)")
      return
    }
    setWordsToLearn(wordsData || [])
    setView(learnMode)
    setIsPopupOpen(false)
  }

  return (
    <>
      <button onClick={handleClick} id="learnButton">
        Learn
      </button>
      <Popup open={isPopupOpen} onClose={() => setIsPopupOpen(false)} modal nested>
          {/* @ts-ignore */}
        {(close) => (
          <div className="modal">
            <button className="close" onClick={close}>
              &times;
            </button>
            <div className="header">Select Learning Options</div>
            <div className="content">
              <label>
                <select
                  value={learnMode}
                  onChange={(e) => setLearnMode(e.target.value as Learn | "")}
                  style={{ marginLeft: "16px", width: "200px", height: "40px", fontSize: "16px" }}
                >
                  <option value="">-- Select Mode --</option>
                  <option value="learn_flashcards">Flashcards</option>
                  <option value="learn_match">Match</option>
                  <option value="learn_write_words">Translate by Typing</option>
                  <option value="learn_story">Story</option>
                </select>
              </label>
              {learnMode === "learn_story" && (
                <label>
                  <div>Level:</div>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as Level | "")}
                    style={{ marginLeft: "16px", width: '150px', height: '30px', fontSize: '14px'}}
                  >
                    <option value="">-- Select Level --</option>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                </label>
              )}
            </div>
            <div className="actions">
              <button onClick={handleLearn} style={{ width: 'auto' }}>Start Learning</button>
              <button onClick={close} style={{ width: 'auto' }}>Cancel</button>
            </div>
          </div>
        )}
      </Popup>
    </>
  )
}
