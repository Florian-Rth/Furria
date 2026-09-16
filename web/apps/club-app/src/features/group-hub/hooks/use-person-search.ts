import { useState } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { usePersonSearchQuery } from '../api';
import { toSearchCapLine, toSearchTerm } from '../group-hub-labels';
import { toPersonSearchErrorMessage } from '../group-hub-messages';

const NO_PERSONS: readonly PersonRef[] = [];
const TYPING_PAUSE_MS = 250;

export interface PersonSearchControl {
  query: string;
  setQuery: (value: string) => void;
  term: string | null;
  persons: readonly PersonRef[];
  isSearching: boolean;
  isEmpty: boolean;
  capLine: string | null;
  errorMessage: string | null;
}

export const usePersonSearch = (): PersonSearchControl => {
  const [query, setQuery] = useState('');
  const term = toSearchTerm(query);
  const searchedTerm = useDebouncedValue(term, TYPING_PAUSE_MS);
  const search = usePersonSearchQuery(searchedTerm);

  const persons = search.data?.persons ?? NO_PERSONS;
  const errorMessage = toPersonSearchErrorMessage(search.error);
  const isBehindTheTyping = term !== searchedTerm || search.isPlaceholderData;
  const isSearching =
    term !== null && (search.isLoading || (isBehindTheTyping && persons.length === 0));

  return {
    query,
    setQuery,
    term,
    persons,
    isSearching,
    isEmpty: term !== null && !isBehindTheTyping && errorMessage === null && persons.length === 0,
    capLine: toSearchCapLine(persons.length),
    errorMessage,
  };
};
