import { useState } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { usePersonSearchQuery } from '../api';
import { toSearchCapLine, toSearchTerm } from '../group-hub-labels';
import { toPersonSearchErrorMessage } from '../group-hub-messages';

const NO_PERSONS: readonly PersonRef[] = [];

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
  const search = usePersonSearchQuery(term);

  const persons = search.data?.persons ?? NO_PERSONS;
  const errorMessage = toPersonSearchErrorMessage(search.error);
  const isSearching = search.isLoading;

  return {
    query,
    setQuery,
    term,
    persons,
    isSearching,
    isEmpty: term !== null && !isSearching && errorMessage === null && persons.length === 0,
    capLine: toSearchCapLine(persons.length),
    errorMessage,
  };
};
