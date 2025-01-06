import useFetch from "./hooks/useFetch.ts"

type Word = {
    id: number,
    word: string,
    translation: string,
    pronunciation: string | null,
    interval: number,
    last_reviewed: string | null,
    words_list: number,
}

export default function RevealWords({ wordsListId }: { wordsListId: number}) {
  const { data, error, isLoading } = useFetch<Word[]>(`/api/words/?words-list=${wordsListId}`)

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <ul>
      {data?.map((word) => (
        <li key={word.id}>{`${word.word}-${word.translation}`}</li>
      ))}
    </ul>
  );
}