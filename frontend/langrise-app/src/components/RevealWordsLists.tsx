import useFetch from "./hooks/useFetch.ts";
import { type View } from "../App";
import React from "react";
import { type LogInData } from "../App"


type WordsList = {
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

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
      <>
          <div>
              <img src='/langrise_logo.webp' alt='logo' className='logo'/>
              <span>LangRise</span>
              <button>User Settings</button>
              <button>Log Out</button>
              <button>Add list</button>
              <button>Modify list</button>
          </div>
          <h3>Welcome back {logInData.username}!</h3>
          <h2>Choose a list to learn from</h2>
          <div className={'listsContainer'}>
              {data?.map((word) => (
                  <div className={'listsTile'} key={word.id} onClick={() => handleClick(word.id)}
                  >{word.name}
                  </div>
              ))}
          </div>
      </>
  );
}