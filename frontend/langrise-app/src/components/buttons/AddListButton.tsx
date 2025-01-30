import React, { useState } from 'react'
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import { type WordsList } from '../RevealWordsLists'
import {createList} from "../../api/createList.ts"

type AddListButtonProps = {
  setWordsLists: React.Dispatch<React.SetStateAction<WordsList[] | null | undefined>>
}

export default function AddListButton({ setWordsLists }: AddListButtonProps) {
  const [name, setName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newList = await createList({ name })
      setWordsLists(data => [newList, ...(data || [])])
      setName('')
    } catch (error) {
      console.error('Failed to create the list:', error)
      alert('Failed to create the list')
    }
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
                    .then(close())
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
                <button type="button" onClick={close}>Cancel</button>
                <button type="submit">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Popup>
  )
}
