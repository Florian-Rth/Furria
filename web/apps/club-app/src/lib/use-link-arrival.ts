import { useLocation } from '@tanstack/react-router';
import { useState } from 'react';

export const useLinkArrival = (): number => {
  const { hash } = useLocation();
  const [seenHash, setSeenHash] = useState(hash);
  const [arrival, setArrival] = useState(0);

  if (hash !== seenHash) {
    setSeenHash(hash);
    if (hash !== '') {
      setArrival(arrival + 1);
    }
  }

  return arrival;
};
