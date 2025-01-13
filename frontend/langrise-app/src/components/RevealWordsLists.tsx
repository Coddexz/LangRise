import useFetch from "./hooks/useFetch.ts";
import { type View } from "../App";


type WordsList = {
    id: number,
    name: string,
    date_created: string | null,
    user: number,
}

type RevealWordsListsProps = {
    setWordsListId: React.Dispatch<React.SetStateAction<number>>
    setView: React.Dispatch<React.SetStateAction<View>>
}

export default function RevealWordsLists({setWordsListId, setView}: RevealWordsListsProps) {
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
    <div className={'listsContainer'}>
      {data?.map((word) => (
            <div className={'listsTile'} key={word.id} onClick={() => handleClick(word.id)}
            >{word.name}
            </div>
      ))}
    </div>
  );
}