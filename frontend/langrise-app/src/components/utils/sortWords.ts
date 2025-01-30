import { type Word } from "../RevealWords.tsx"


export default function sortWords(data: Word[], key: keyof Word, ascending: boolean = true): Word[] {
      return [...data].sort((a, b) => {
        const aValue = a[key] || 0;
        const bValue = b[key] || 0;

        if (key === "last_reviewed" || key === "next_review") {
          const aDate = aValue instanceof Date ? aValue.getTime() : new Date(aValue as string).getTime();
          const bDate = bValue instanceof Date ? bValue.getTime() : new Date(bValue as string).getTime();
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
