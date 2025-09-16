import { useState, useMemo } from "react";

interface UseSearchFilterProps<T> {
  items: T[];
  searchFields: (keyof T)[];
}

export const useSearchFilter = <T>({
  items,
  searchFields,
}: UseSearchFilterProps<T>) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return items;
    }

    const lowercaseSearch = searchTerm.toLowerCase();

    return items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (typeof value === "string") {
          return value.toLowerCase().includes(lowercaseSearch);
        }
        return false;
      })
    );
  }, [items, searchTerm, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
    hasResults: filteredItems.length > 0,
    totalResults: filteredItems.length,
  };
};
