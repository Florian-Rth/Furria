import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';
import { kkTokens } from '../../../tokens';
import { scrollIntoList } from '../scroll-into-list';

interface KkStudioStepListItemProps extends PropsWithChildren {
  selected: boolean;
}

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const KkStudioStepListItem: FC<KkStudioStepListItemProps> = ({ selected, children }) => {
  const item = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selected && item.current !== null) {
      scrollIntoList(item.current);
    }
  }, [selected]);

  return (
    <Stack
      ref={item}
      role="listitem"
      aria-current={selected ? 'true' : undefined}
      sx={(theme) => ({
        minWidth: 0,
        containerType: 'inline-size',
        containerName: 'kk-studio-step',
        borderRadius: `${kkTokens.radius.base}px`,
        backgroundColor: palette(theme).background.paper,
        boxShadow: `inset 0 0 0 ${selected ? kkTokens.line.section : kkTokens.line.hair}px ${
          selected ? palette(theme).text.primary : palette(theme).divider
        }`,
      })}
    >
      {children}
    </Stack>
  );
};
