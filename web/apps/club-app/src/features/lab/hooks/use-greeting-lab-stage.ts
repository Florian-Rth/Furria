import type { KkSummaryFact } from '@furria/ui/KkSummaryRow';
import type { KkScreenActionBar } from '@furria/ui/screen-declaration';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { StartLook } from '@/features/start/hooks/use-start-look';
import type { LabGreeting } from '../lab-greetings';
import {
  LAB_GREETINGS,
  labFactsOf,
  labLookOf,
  labViewOf,
  NEXT_LABEL,
  nextLabGreetingOf,
  REPLAY_LABEL,
} from '../lab-greetings';

export interface GreetingLabStage {
  take: string;
  facts: KkSummaryFact[];
  action: KkScreenActionBar;
  look: StartLook;
}

export const useGreetingLabStage = (greeting: LabGreeting): GreetingLabStage => {
  const navigate = useNavigate();
  const [takes, setTakes] = useState(0);
  const next = nextLabGreetingOf(LAB_GREETINGS, greeting.slug);

  const replay = (): void => {
    setTakes((count) => count + 1);
  };

  const advance = (): void => {
    if (next !== null) {
      void navigate({ to: '/lab/$greeting', params: { greeting: next.slug } });
    }
  };

  return {
    take: `${greeting.slug}:${takes}`,
    facts: labFactsOf(greeting, labViewOf(greeting)),
    look: labLookOf(greeting),
    action: {
      primary: { label: NEXT_LABEL, onSelect: advance },
      secondary: { label: REPLAY_LABEL, onSelect: replay },
    },
  };
};
