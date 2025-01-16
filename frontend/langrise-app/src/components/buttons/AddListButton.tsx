import React, { useState } from 'react'
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import { type WordsList } from '../RevealWordsLists'

type AddWordProps = {
  setWordsLists: React.Dispatch<React.SetStateAction<WordsList[] | null>>
  userId: number
}

export default function AddList({ setWordsLists, userId }: AddWordProps) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setWordsLists(data => {
      const d = data || []
      const maxId = d.reduce((max, list) => Math.max(max, list.id), 0)
      return [
        { id: maxId + 1, name, date_created: new Date().toISOString(), user: userId },
        ...d
      ]
    })
    setName('')
  }

  return (
    <Popup trigger={<button id="addListButton">Add List</button>} modal nested>
      {/* @ts-ignore */}
      {close => (
        <div className="modal">
          <button className="close" onClick={close}>&times;</button>
          <div className="header">Add New List</div>
          <div className="content">
            <form
              onSubmit={e => {
                handleSubmit(e)
                close()
              }}
            >
              <label>
                Name:
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  style={{ marginLeft: '16px'}}
                />
              </label>
              <p></p>
              <div className="actions">
                <button type="submit">Submit</button>
                <button type="button" onClick={close}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Popup>
  )
}
