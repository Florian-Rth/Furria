import { KkLead, KkSection } from '@furria/ui';
import type { FC } from 'react';
import { exchangeOpenQuestionsContent } from '@/features/events/exchange-content';
import { ExchangeOpenQuestionList } from '../layout/ExchangeOpenQuestionList';
import { ExchangeOpenQuestionRow } from './ExchangeOpenQuestionRow';

export const ExchangeOpenQuestions: FC = () => (
  <KkSection>
    <KkSection.Header
      kicker={exchangeOpenQuestionsContent.kicker}
      title={exchangeOpenQuestionsContent.title}
    />
    <KkLead>{exchangeOpenQuestionsContent.intro}</KkLead>
    <ExchangeOpenQuestionList>
      {exchangeOpenQuestionsContent.questions.map((question) => (
        <ExchangeOpenQuestionRow key={question.title} question={question} />
      ))}
    </ExchangeOpenQuestionList>
  </KkSection>
);
