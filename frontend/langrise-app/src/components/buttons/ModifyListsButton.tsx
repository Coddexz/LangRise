import React from "react"


type ModifyListsButtonProps = {
    editMode: boolean
    setEditMode: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ModifyListsButton({ editMode, setEditMode }: ModifyListsButtonProps) {

    return (
        <div>
            <button onClick={() => setEditMode((prev) => !prev)}
            style={{ backgroundColor: editMode ? 'green' : ''}}>
                Modify lists
            </button>
        </div>
    )
}