import React, { useState } from "react"
import { type WordsList } from "../RevealWordsLists"
import Popup from "reactjs-popup"

type AddWordProps = {
  setWordsLists: React.Dispatch<React.SetStateAction<WordsList[] | null>>
  userId: number
  setIsPopupOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AddList({ setWordsLists, userId, setIsPopupOpen }: AddWordProps) {
  const [name, setName] = useState<string>("")


  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setWordsLists(existingWordsListsData => {
      const updatedWordsListsData = existingWordsListsData || []
      const maxId = updatedWordsListsData.reduce(
        (max, list) => Math.max(max, list.id),
        0
      )
      const newEntry: WordsList = {
        id: maxId + 1,
        name,
        date_created: new Date().toISOString(),
        user: userId
      }
      alert(`List "${name}" has been added`)
      return [newEntry, ...updatedWordsListsData]
    })
    setName("")
    setIsPopupOpen(false)
  }

  return (
    <div>
      <Popup
        trigger={
          <button id="addListButton" className="btn-primary">
            Add List
          </button>
        }
        modal
        closeOnDocumentClick
        onOpen={() => setIsPopupOpen(true)}
        onClose={() => setIsPopupOpen(false)}
      >
         {/* @ts-ignore */}
        {(close: () => void) => (
          <div className="form-container">
            <h2>Add New List</h2>
            <form
              onSubmit={e => {
                handleSubmit(e)
                close()
              }}
            >
              <label htmlFor="listName" className="label">
                Name
                <input
                  type="text"
                  id="listName"
                  name="name"
                  className="input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </label>
              <div className="button-group">
                <button type="submit" className="btn-primary">
                  Submit
                </button>
                <button type="button" className="btn-secondary" onClick={close}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </Popup>
      <div className="overlay" />
    </div>
  )
}
