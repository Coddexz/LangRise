import useFetch from "./hooks/useFetch.ts"
import { type View } from "../App"
import ToWordsListsButton from "./buttons/ToWordsListsButton.tsx"
import React, { useEffect, useState } from "react"
import AddWordButton from "./buttons/AddWordButton.tsx"
import LearnButton, {Level} from "./buttons/LearnButton.tsx"
import SaveWordsButton  from "./buttons/SaveWordsButton.tsx"
import sortWords from "./utils/sortWords.ts"


export type Word = {
    id: number,
    word: string,
    translation: string,
    pronunciation: string | null,
    last_reviewed: Date | null,
    next_review: Date | null
}

type RevealWordsProps = {
    wordsListId: number,
    setView: React.Dispatch<React.SetStateAction<View>>
    setWordsToLearn: React.Dispatch<React.SetStateAction<[] | Word[]>>
    languageLevel: Level
    setLanguageLevel: React.Dispatch<React.SetStateAction<Level>>
    tone: string
    setTone: React.Dispatch<React.SetStateAction<string>>
}

export default function RevealWords({ wordsListId, setView, setWordsToLearn, ...props}: RevealWordsProps) {
  const [wordsData, setWordsData] = useState<Word[] | undefined | null>(null)
  const [sortKey, setSortKey] = useState<keyof Word>("next_review")
  const [ascending, setAscending] = useState(true)
  const {data, error, isLoading} = useFetch<Word[]>(`/api/words/?words-list=${wordsListId}`)
  const [editingRowId, setEditingRowId] = useState<number | null>(null)
  const [editedRow, setEditedRow] = useState<Word | null>(null)
  const [wordsChanged, setWordsChanged] = useState(false)
  const [originalWordsData, setOriginalWordsData] = useState<Word[] | null>(null)

  useEffect(() => {
    if (data) {
        if (! wordsData) {
            const parsedData = data.map(word => ({
                ...word,
                last_reviewed: word.last_reviewed ? new Date(word.last_reviewed) : null,
                next_review: word.next_review ? new Date(word.next_review) : null
              }));
            const sortedData = sortWords(parsedData, sortKey, ascending)
            setWordsData(sortedData)
            setOriginalWordsData(sortedData)
        } else {
            setWordsData(sortWords(wordsData, sortKey, ascending))
    }}
  }, [data, sortKey, ascending])

    const handleEditClick = (id: number) => {
    const rowToEdit = wordsData?.find((word) => word.id === id);
    if (rowToEdit) {
      setEditingRowId(id);
      setEditedRow({ ...rowToEdit });
    }
  };

  const handleInputChange = (field: keyof Word, value: string | number) => {
    if (editedRow) {
      setEditedRow({ ...editedRow, [field]: value });
    }
  };

  const handleSaveClick = (id: number) => {
    if (wordsData && editedRow) {

        if (!editedRow.word.trim() || !editedRow.translation.trim()) {
            alert("Word and Translation cannot be empty.")
            return
        }

      const updatedData = wordsData.map((word) =>
        word.id === id ? editedRow : word
      );
      setWordsData(updatedData);
      setEditingRowId(null);
      setEditedRow(null);
      if (! wordsChanged) setWordsChanged(true)
    }
  };

  const handleCancelClick = () => {
    setEditingRowId(null);
    setEditedRow(null);
  };


  const handleSort = (key: keyof Word) => {
    if (sortKey === key) {
      setAscending(!ascending)
    } else {
      setSortKey(key)
      setAscending(true)
    }
  };

  const handleDeleteClick = (id: number) => {
      setEditingRowId(null)
      setEditedRow(null)
      setWordsData(wordsData?.filter((word) => word.id !== id))
      if (! wordsChanged) setWordsChanged(true)
  }


  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {error || "An unknown error occurred"}</p>
  if (!wordsData) return <p>No data available</p>

  return (
      <div className='reveal-words-container'>
          <div className="navbar">
              <div className="navbar-left">
                  <div className="image-container">
                      <img src="/langrise_logo.webp" alt="logo" className="logo"/>
                      <p className="image-name">LangRise</p>
                  </div>
              </div>

              <div className='navbar-content'>
                  <div className='navbar-center'>
                      <LearnButton wordsData={wordsData} setWordsToLearn={setWordsToLearn} setView={setView}
                                   languageLevel={props.languageLevel} setLanguageLevel={props.setLanguageLevel}
                                   tone={props.tone} setTone={props.setTone} />
                      <AddWordButton setWordsData={setWordsData} wordsChanged={wordsChanged}
                                     setWordsChanged={setWordsChanged} />
                      <SaveWordsButton wordsData={wordsData} setWordsData={setWordsData} wordsChanged={wordsChanged}
                                       setWordsChanged={setWordsChanged} originalWordsData={originalWordsData}
                                       setOriginalWordsData={setOriginalWordsData} wordsListId={wordsListId}
                                       ascending={ascending} sortKey={sortKey} />
                      <ToWordsListsButton setView={setView} />
                  </div>
              </div>
          </div>
          <table>
          <thead>
              <tr>
                  <th className={sortKey === 'word' ? (ascending ? 'sorted ascending' : 'sorted descending') : ''}
                      onClick={() => handleSort("word")} id='words-sort-th'>
                      Word
                  </th>
                  <th className={sortKey === 'translation' ? (ascending ? 'sorted ascending' : 'sorted descending') : ''}
                      onClick={() => handleSort("translation")} id='words-sort-th'>
                      Translation
                  </th>
                  <th className={sortKey === 'pronunciation' ? (ascending ? 'sorted ascending' : 'sorted descending') : ''}
                      onClick={() => handleSort("pronunciation")} id='words-sort-th'>
                      Pronunciation
                  </th>
                  <th className={sortKey === 'last_reviewed' ? (ascending ? 'sorted ascending' : 'sorted descending') : ''}
                      onClick={() => handleSort("last_reviewed")} id='words-sort-th'>
                      Last Reviewed
                  </th>
                  <th className={sortKey === 'next_review' ? (ascending ? 'sorted ascending' : 'sorted descending') : ''}
                      onClick={() => handleSort("next_review")} id='words-sort-th'>
                      Next Review
                  </th>
                  <th>Actions</th>
              </tr>
              </thead>
              <tbody>
              {wordsData.map((word) => (
                  <tr key={word.id}>
                      {editingRowId === word.id ? (
                          <>
                              <td>
                                  <input
                                      type="text"
                                      value={editedRow?.word || ""}
                                      onChange={(e) =>
                                          handleInputChange("word", e.target.value)
                                      }
                                  />
                              </td>
                              <td>
                                  <input
                                      type="text"
                                      value={editedRow?.translation || ""}
                                      onChange={(e) =>
                                          handleInputChange("translation", e.target.value)
                                      }
                                  />
                              </td>
                              <td>
                                  <input
                                      type="text"
                                      value={editedRow?.pronunciation || ""}
                                      onChange={(e) =>
                                          handleInputChange("pronunciation", e.target.value)
                                      }
                                  />
                              </td>
                              <td>
                                  {word.last_reviewed ? word.last_reviewed.toLocaleDateString() : "N/A"}
                              </td>
                              <td>
                                  {word.next_review ? word.next_review.toLocaleDateString() : "N/A"}
                              </td>
                              <td>
                                  <button className='button edit cancel' onClick={handleCancelClick}>Cancel</button>
                                  <button className='button edit delete'
                                          onClick={() => handleDeleteClick(word.id)}>Delete
                                  </button>
                                  <button className='button edit save' onClick={() => handleSaveClick(word.id)}>Save
                                  </button>
                              </td>
                          </>
                      ) : (
                          <>
                              <td>{word.word}</td>
                              <td>{word.translation}</td>
                              <td>{word.pronunciation || "N/A"}</td>
                              <td>{word.last_reviewed ? word.last_reviewed.toLocaleDateString() : "N/A"}</td>
                              <td>{word.next_review ? word.next_review.toLocaleDateString() : "N/A"}</td>
                              <td>
                                  <button onClick={() => handleEditClick(word.id)}>Edit</button>
                              </td>
                          </>
                      )}
                  </tr>
              ))}
              </tbody>
          </table>
      </div>
  );
}