import useFetch from "./hooks/useFetch.ts";


type WordsList = {
    id: number,
    name: string,
    date_created: string | null,
    user: number,
}

export default function RevealWordsLists() {
  const { data, error, isLoading } = useFetch<WordsList[]>("/api/words-list");

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {data?.map((word) => (
        <li key={word.id}>{word.name}</li>
      ))}
    </ul>
  );
}