import useFetch from "./hooks/useFetch.ts";
import { type View } from "../App";
import React, { useState, useEffect } from "react";
import { type LogInData } from "../App"
import AddList from "./buttons/AddList.tsx";


export type WordsList = {
    id: number,
    name: string,
    date_created: string | null,
    user: number,
}

type RevealWordsListsProps = {
    setWordsListId: React.Dispatch<React.SetStateAction<number>>
    setView: React.Dispatch<React.SetStateAction<View>>
    logInData: LogInData
}

export default function RevealWordsLists({setWordsListId, setView, logInData}: RevealWordsListsProps) {
  const { data, error, isLoading } = useFetch<WordsList[]>("/api/words-list");
  data?.sort((a, b) => new Date(b.date_created || 0).getTime() -
      new Date(a.date_created || 0).getTime());

  const handleClick = (id: number) => {
      setWordsListId(id)
      setView('words')
  }

  const [wordsLists, setWordsLists] = useState<WordsList[] | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)

    useEffect(() => {
        console.log(wordsLists)
        if (! wordsLists) setWordsLists(data)
        else {
            wordsLists?.sort((a: WordsList, b: WordsList) => new Date(b.date_created || 0).getTime() -
                new Date(a.date_created || 0).getTime())
            setWordsLists(wordsLists)
        }
    }, [data, wordsLists])

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
      <div className={isPopupOpen ? 'overlay-active' : ''}>
          <div className="navbar" id="wordsListsHeader">

              <div className="navbar-left">
                  <div className="image-container">
                      <img src="/langrise_logo.webp" alt="logo" className="logo"/>
                      <p className="image-name">LangRise</p>
                  </div>
              </div>

              <div className="navbar-content">
                  <div className="navbar-center">
                      <AddList setWordsLists={setWordsLists} userId={logInData.userId}
                               setIsPopupOpen={setIsPopupOpen} />
                      <button>Modify list</button>
                  </div>
              </div>

              <div className="navbar-right">
                  <button>User Settings</button>
                  <button>Log Out</button>
              </div>
          </div>
          <h3>Welcome back {logInData.username}!</h3>
          <h2>Choose a list to learn from</h2>
          <div className={'listsContainer'}>
              {wordsLists?.map((word) => (
                  <div className={'listsTile'} key={word.id} onClick={() => handleClick(word.id)}
                  >{word.name}
                  </div>
              ))}
          </div>
      </div>
  );
}