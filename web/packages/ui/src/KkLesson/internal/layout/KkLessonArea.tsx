import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { FOLDED_BAR_HEIGHT, foldedBarRoomOf } from '../../../KkShell/internal/folded-bar';

export type KkLessonAreaName = 'strip' | 'card' | 'rail' | 'dock';

const NO_PLACE: CSSObject = {};

const placeOf = (theme: Theme, name: KkLessonAreaName): CSSObject =>
  name === 'strip'
    ? {
        height: FOLDED_BAR_HEIGHT,
        paddingInline: foldedBarRoomOf(theme),
      }
    : NO_PLACE;

interface KkLessonAreaProps extends PropsWithChildren {
  name: KkLessonAreaName;
}

export const KkLessonArea: FC<KkLessonAreaProps> = ({ name, children }) => (
  <Stack
    data-kk-lesson-area={name}
    sx={(theme) => ({
      gridArea: name,
      minWidth: 0,
      minHeight: 0,
      justifyContent: 'center',
      ...placeOf(theme, name),
    })}
  >
    {children}
  </Stack>
);
