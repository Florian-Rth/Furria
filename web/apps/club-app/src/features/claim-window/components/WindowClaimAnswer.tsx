import { KkButton } from '@furria/ui/KkButton';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkNote } from '@furria/ui/KkNote';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { LOGIN_PATH } from '@/lib/return-to';
import type { WindowClaimAnswer as Answer } from '../claim-screen-view';
import {
  CLAIM_ANSWERS,
  LOGIN_LABEL,
  REQUEST_ACCESS_LABEL,
  RETRY_LABEL,
} from '../claim-window-copy';

const REQUEST_ACCESS_PATH = '/request-access';

interface AnswerWay {
  label: string;
  to: string;
}

const ANSWER_WAYS: Record<Answer, AnswerWay | null> = {
  hasAccount: { label: LOGIN_LABEL, to: LOGIN_PATH },
  hasEmail: { label: REQUEST_ACCESS_LABEL, to: REQUEST_ACCESS_PATH },
  underAge: null,
  notFound: null,
};

interface WindowClaimAnswerProps {
  answer: Answer;
  onRetry: () => void;
}

export const WindowClaimAnswer: FC<WindowClaimAnswerProps> = ({ answer, onRetry }) => {
  const copy = CLAIM_ANSWERS[answer];
  const way = ANSWER_WAYS[answer];
  const wayButton =
    way === null ? null : (
      <KkButton fullWidth component={Link} to={way.to}>
        {way.label}
      </KkButton>
    );

  return (
    <Stack sx={{ gap: 2.5, minWidth: 0 }}>
      <Stack sx={{ gap: 1 }}>
        <KkHeading level={1} component="h1">
          {copy.title}
        </KkHeading>
        <KkNote>{copy.line}</KkNote>
      </Stack>
      {wayButton}
      <KkButton variant="text" fullWidth onClick={onRetry}>
        {RETRY_LABEL}
      </KkButton>
    </Stack>
  );
};
