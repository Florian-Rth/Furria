import { kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { MatchAgreement, MatchReason } from '@/features/group-matcher/match-reasons';
import {
  buildReasonAnswerLine,
  matcherAgreementLabels,
} from '@/features/group-matcher/matcher-content';

const agreementAccents: Record<MatchAgreement, string> = {
  agree: 'success.main',
  partial: 'warning.main',
  disagree: 'error.main',
};

interface MatcherWhyRowProps {
  reason: MatchReason;
  groupName: string;
}

export const MatcherWhyRow: FC<MatcherWhyRowProps> = ({ reason, groupName }) => {
  const answerLine = buildReasonAnswerLine(reason, groupName);

  return (
    <Stack
      sx={{
        gap: 0.25,
        pl: 1.5,
        borderLeft: `${kkTokens.line.section}px solid`,
        borderColor: agreementAccents[reason.agreement],
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 900,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'text.secondary',
        }}
      >
        {matcherAgreementLabels[reason.agreement]}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {reason.prompt}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {answerLine}
      </Typography>
    </Stack>
  );
};
