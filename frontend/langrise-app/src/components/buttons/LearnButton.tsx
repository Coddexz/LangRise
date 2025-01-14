import {Word} from "../RevealWords.tsx"


type LearnButtonProps = {
    wordsData: Word[] | undefined | null
};

export default function LearnButton({ wordsData }: LearnButtonProps) {
    const lastWord = wordsData?.length
        ? wordsData[wordsData.length - 1]?.word
        : 'No words available'

    return (
        <button onClick={() => alert(`TBD\nlast word: ${lastWord}`)} id='learnButton'>
            Learn
        </button>
    );
}