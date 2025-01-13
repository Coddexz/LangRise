import useFetch from "./hooks/useFetch.ts"
import { type View } from "../App";
import ToWordsListsButton from "./buttons/ToWordsListsButton.tsx"
import React, {useEffect, useState} from "react";
import AddWordButton from "./buttons/AddWordButton.tsx";


export type Word = {
    id: number,
    word: string,
    translation: string,
    pronunciation: string | null,
    interval: number,
    last_reviewed: string | null,
    words_list: number,
    image: string | null,
}

type RevealWordsProps = {
    wordsListId: number,
    setView: React.Dispatch<React.SetStateAction<View>>
}

export const wordKeys = {
    id: 'number',
    word: 'string',
    translation: 'string',
    pronunciation: 'string',
    interval: 'number',
    last_reviewed: 'string',
    words_list: 'number',
    image: 'string',
} as const

function sortWords(data: Word[], key: keyof Word, ascending: boolean = true): Word[] {
  return [...data].sort((a, b) => {
    const aValue = a[key] || 0;
    const bValue = b[key] || 0;

    if (key === "last_reviewed") {
      const aDate = new Date(aValue as string).getTime();
      const bDate = new Date(bValue as string).getTime();
      return ascending ? aDate - bDate : bDate - aDate;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return ascending
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return ascending ? +aValue - +bValue : +bValue - +aValue;
  });
}

export default function RevealWords({ wordsListId, setView }: RevealWordsProps) {
  const [wordsData, setWordsData] = useState<Word[] | null>(null)
  const [sortKey, setSortKey] = useState<keyof Word>("last_reviewed")
  const [ascending, setAscending] = useState(true)
  const { data, error, isLoading } = useFetch<Word[]>(`/api/words/?words-list=${wordsListId}`)
  const [editingRowId, setEditingRowId] = useState<number | null>(null); // Track row being edited
  const [editedRow, setEditedRow] = useState<Word | null>(null); // Track edited row

  useEffect(() => {
    if (data) {
      setWordsData(sortWords(data, sortKey, ascending))
    }
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
      const updatedData = wordsData.map((word) =>
        word.id === id ? editedRow : word
      );
      setWordsData(updatedData);
      setEditingRowId(null);
      setEditedRow(null);
    }
  };

  const handleCancelClick = () => {
    setEditingRowId(null);
    setEditedRow(null);
  };
  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {error || "An unknown error occurred"}</p>
  if (!wordsData) return <p>No data available</p>

  const handleSort = (key: keyof Word) => {
    if (sortKey === key) {
      setAscending(!ascending)
    } else {
      setSortKey(key)
      setAscending(true)
    }
  };

  return (
    <>
      <table>
        <thead>
        <tr>
            <th onClick={() => handleSort("word")}>Word</th>
            <th onClick={() => handleSort("translation")}>Translation</th>
            <th onClick={() => handleSort("pronunciation")}>Pronunciation</th>
            <th onClick={() => handleSort("interval")}>Interval</th>
            <th onClick={() => handleSort("last_reviewed")}>Last Reviewed</th>
            <th>Image</th>
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
                    <input
                      type="number"
                      value={editedRow?.interval || 0}
                      onChange={(e) =>
                        handleInputChange("interval", parseInt(e.target.value))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={editedRow?.last_reviewed || ""}
                      onChange={(e) =>
                        handleInputChange("last_reviewed", e.target.value)
                      }
                    />
                  </td>
                  <td>
                      <input
                          type="file"
                          value={editedRow?.image || ""}
                          onChange={(e) => handleInputChange("image", e.target.value)}
                          />
                  </td>
                  <td>
                    <button onClick={() => handleSaveClick(word.id)}>Save</button>
                    <button onClick={handleCancelClick}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{word.word}</td>
                  <td>{word.translation}</td>
                  <td>{word.pronunciation || "N/A"}</td>
                  <td>{word.interval}</td>
                  <td>{word.last_reviewed || "Never"}</td>
                  <td>{word.image || "N/A"}</td>
                  <td>
                    <button onClick={() => handleEditClick(word.id)}>Edit</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <ToWordsListsButton setView={setView} />
      <AddWordButton setWordsData={setWordsData} wordsListId={wordsListId} />
    </>
  );
}