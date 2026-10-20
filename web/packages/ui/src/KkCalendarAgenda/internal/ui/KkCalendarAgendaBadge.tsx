import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import { AnimatePresence, motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { useState } from 'react';
import type { KkAnswer } from '../../../internal/answer';
import { answerTones } from '../../../internal/answer';
import { focusRing } from '../../../internal/focus-ring';
import { toneSelectedPaint } from '../../../internal/tone';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { kkTokens } from '../../../tokens';
import { rowDelayOf } from '../logic/agenda-motion';
import { KkCalendarAgendaAnswerMark } from './KkCalendarAgendaAnswerMark';

const FACE = '2.125rem';
const FLIPPED = { rotateY: 90, opacity: 0 } as const;
const FADED = { opacity: 0 } as const;
const SHOWN = { rotateY: 0, opacity: 1 } as const;
const ARRIVAL_LAG = 0.12;

const FACE_STYLE: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  width: FACE,
  height: FACE,
  borderRadius: '50%',
};

const badgePaint =
  (answer: KkAnswer) =>
  (theme: Theme): CSSObject => ({
    width: kkTokens.tapTarget,
    height: kkTokens.tapTarget,
    borderRadius: '50%',
    perspective: '200px',
    '& [data-kk-calendar-badge-face]': {
      borderWidth: kkTokens.line.hair,
      borderStyle: 'solid',
      ...toneSelectedPaint(theme, answerTones[answer]),
    },
    ...focusRing(theme),
  });

interface KkCalendarAgendaBadgeProps {
  answer: KkAnswer;
  label: string;
  order: number;
  delayed: boolean;
  onSelect: () => void;
}

export const KkCalendarAgendaBadge: FC<KkCalendarAgendaBadgeProps> = ({
  answer,
  label,
  order,
  delayed,
  onSelect,
}) => {
  const reduced = useReducedMotion();
  const [arrivalAnswer] = useState(answer);
  const lead = delayed && answer === arrivalAnswer ? rowDelayOf(order) + ARRIVAL_LAG : 0;
  const initial = reduced ? FADED : FLIPPED;
  const transition = { duration: 0.34, delay: lead, ease: 'easeOut' } as const;

  return (
    <ButtonBase
      aria-label={label}
      onClick={onSelect}
      data-kk-calendar-badge={answer}
      sx={badgePaint(answer)}
    >
      <AnimatePresence mode="wait" initial>
        <motion.span
          key={answer}
          data-kk-calendar-badge-face
          initial={initial}
          animate={SHOWN}
          exit={initial}
          transition={transition}
          style={FACE_STYLE}
        >
          <KkCalendarAgendaAnswerMark answer={answer} />
        </motion.span>
      </AnimatePresence>
    </ButtonBase>
  );
};
