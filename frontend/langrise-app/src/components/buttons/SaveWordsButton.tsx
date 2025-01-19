import React, { useState } from "react"
import Popup from "reactjs-popup"
import { type Word } from "../RevealWords.tsx"
import { postWords } from "../../api/postWords"

type SaveWordsButtonProps = {
    wordsData: Word[] | undefined | null
    wordsChanged: boolean
    setWordsChanged: React.Dispatch<React.SetStateAction<boolean>>
    originalWordsData: Word[] | null
    setOriginalWordsData: React.Dispatch<React.SetStateAction<Word[] | null>>
    wordsListId: number
}

export default function SaveWordsButton({
    wordsData,
    wordsChanged,
    setWordsChanged,
    originalWordsData,
    setOriginalWordsData,
    wordsListId
}: SaveWordsButtonProps) {
    const [isPopupOpen, setPopupOpen] = useState(false)

    const getPayload = () => {
        const isValidWord = (word: Word | undefined | null): boolean => (!!word
            && !!word.word?.trim() && !!word.translation?.trim())

        const validOriginalWordsData = originalWordsData?.filter(isValidWord) || []
        const validWordsData = wordsData?.filter(isValidWord) || []

        const originalWordsMap = new Map(validOriginalWordsData?.map(word => [word.id, word]) || [])
        const newWordsMap = new Map(validWordsData?.map(word => [word.id, word]) || [])

        const add = Array.from(newWordsMap.values())
            .filter(word => !originalWordsMap.has(word.id))
            .map(({ id, ...rest }) => rest)

        const update = Array.from(newWordsMap.values()).filter(
            word =>
                originalWordsMap.has(word.id) &&
                (originalWordsMap.get(word.id)?.word !== word.word ||
                    originalWordsMap.get(word.id)?.translation !== word.translation)
        )

        const deleteIds = Array.from(originalWordsMap.values())
            .filter(word => !newWordsMap.has(word.id))
            .map(word => word.id)

        return {
            add,
            update,
            delete: deleteIds
        }
    }

    const handleClick = async () => {
        setPopupOpen(true)
        const payload = getPayload()
        try {
            await postWords(payload, wordsListId)
            setWordsChanged(false)
            setOriginalWordsData(wordsData || null)
            alert("Words saved successfully")
        } catch (error) {
            console.error("Error during save request:", error)
            alert("Error saving words. Check console for details.")
        } finally {
            setPopupOpen(false)
        }
    }

    return (
        <>
            <button disabled={!wordsChanged} id="saveWordsButton" onClick={handleClick}>
                Save
            </button>
            <Popup open={isPopupOpen} modal nested>
                <div className="modal">
                    <div className="header">Processing</div>
                    <div className="content">Please wait while your changes are being saved...</div>
                </div>
            </Popup>
        </>
    )
}
