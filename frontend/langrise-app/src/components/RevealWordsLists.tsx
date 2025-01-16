import React, { useState, useEffect } from 'react'
import useFetch from './hooks/useFetch'
import Popup from 'reactjs-popup'
import { type View } from '../App'
import { type LogInData } from '../App'
import AddListButton from './buttons/AddListButton'
import ModifyListsButton from './buttons/ModifyListsButton'

export type WordsList = {
  id: number
  name: string
  date_created: string | null
  user: number
}

type RevealWordsListsProps = {
  setWordsListId: React.Dispatch<React.SetStateAction<number>>
  setView: React.Dispatch<React.SetStateAction<View>>
  logInData: LogInData
}

export default function RevealWordsLists({ setWordsListId, setView, logInData }: RevealWordsListsProps) {
  const { data, error, isLoading } = useFetch<WordsList[]>('/api/words-list')

  data?.sort((a, b) => new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime())

  const [wordsLists, setWordsLists] = useState<WordsList[] | null | undefined>(null)
  const [editMode, setEditMode] = useState(false)
  // const [popup, setPopup] = useState<{ type: 'edit' | 'delete', id: number } | null>(null)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    setWordsLists(data)
  }, [data])

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  const handleClick = (id: number) => {
    setWordsListId(id)
    setView('words')
  }

  const handleEdit = (id: number) => {
    const updatedLists = wordsLists?.map(list => list.id === id ? { ...list, name: newName } : list)
    setWordsLists(updatedLists)
    // setPopup(null)
  }

  const handleDelete = (id: number) => {
    const updatedLists = wordsLists?.filter(list => list.id !== id)
    setWordsLists(updatedLists)
    // setPopup(null)
  }

  return (
    <div>
      <div className="navbar" id="wordsListsHeader">
        <div className="navbar-left">
          <div className="image-container">
            <img src="/langrise_logo.webp" alt="logo" className="logo" />
            <p className="image-name">LangRise</p>
          </div>
        </div>
        <div className="navbar-content">
          <div className="navbar-center">
            <AddListButton setWordsLists={setWordsLists} userId={logInData.userId} />
            <ModifyListsButton editMode={editMode} setEditMode={setEditMode} />
          </div>
        </div>
        <div className="navbar-right">
          <button>User Settings</button>
          <button>Log Out</button>
        </div>
      </div>
      <h3>Welcome back {logInData.username}!</h3>
      <h2>Choose a list to learn from</h2>
      <div className="listsContainer">
        {wordsLists?.map((word) => (
          <div
            className="listsTile"
            key={word.id}
            onClick={!editMode ? () => handleClick(word.id) : undefined}
          >
            {word.name}
            {editMode && (
              <div>
                <Popup trigger={<button>Edit</button>} modal nested>
                  {/* @ts-ignore */}
                  {close => (
                    <div className="modal">
                      <button className="close" onClick={close}>&times;</button>
                      <div className="header">Edit List</div>
                      <div className="content">
                        <input
                          type="text"
                          value={newName}
                          onChange={e => setNewName(e.target.value)}
                          placeholder="New name"
                          required
                          style={{ marginLeft: '16px' }}
                        />
                        <div className="actions">
                          <button onClick={() => { handleEdit(word.id); close() }}>Save</button>
                          <button onClick={close}>Cancel</button>
                        </div>
                      </div>
                    </div>
                  )}
                </Popup>
                <Popup trigger={<button>Delete</button>} modal nested>
                  {/* @ts-ignore */}
                  {close => (
                    <div className="modal">
                      <button className="close" onClick={close}>&times;</button>
                      <div className="header">Confirm Deletion</div>
                      <div className="content">
                        <p>Are you sure you want to delete this list?</p>
                        <div className="actions">
                          <button onClick={() => { handleDelete(word.id); close() }}>Yes</button>
                          <button onClick={close}>No</button>
                        </div>
                      </div>
                    </div>
                  )}
                </Popup>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
