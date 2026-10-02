import { KkGreeting, KkGreetingSkeleton } from '@furria/ui';
import type { FC } from 'react';
import { useGreeting } from '../hooks/use-greeting';

export const StartGreeting: FC = () => {
  const greeting = useGreeting();

  if (greeting === null) {
    return <KkGreetingSkeleton />;
  }

  const line = greeting.line === null ? null : <KkGreeting.Line>{greeting.line}</KkGreeting.Line>;

  return (
    <KkGreeting
      key={greeting.key}
      play={greeting.play}
      festive={greeting.festive}
      night={greeting.night}
      burst={greeting.burst}
      onSettled={greeting.onSettled}
    >
      <KkGreeting.Headline
        parts={greeting.parts}
        previousCells={greeting.previousCells}
        deck={greeting.deck}
        nameDeck={greeting.nameDeck}
        tempo={greeting.tempo}
        countFrom={greeting.countFrom}
      />
      {line}
    </KkGreeting>
  );
};
