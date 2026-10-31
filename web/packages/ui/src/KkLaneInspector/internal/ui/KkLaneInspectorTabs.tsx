import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export interface KkLaneInspectorTab {
  key: string;
  text: string;
  aside: string | null;
}

interface KkLaneInspectorTabsProps {
  label: string;
  tabs: readonly KkLaneInspectorTab[];
  current: string;
  onChoose: (key: string) => void;
}

export const KkLaneInspectorTabs: FC<KkLaneInspectorTabsProps> = ({
  label,
  tabs,
  current,
  onChoose,
}) => {
  const buttons = tabs.map((tab) => {
    const choose = (): void => {
      onChoose(tab.key);
    };
    const aside =
      tab.aside === null ? null : (
        <Typography
          component="span"
          variant="caption"
          sx={{ fontVariantNumeric: 'tabular-nums', color: 'inherit', opacity: 0.7 }}
        >
          {tab.aside}
        </Typography>
      );

    return (
      <ButtonBase
        key={tab.key}
        role="tab"
        aria-selected={tab.key === current}
        onClick={choose}
        sx={(theme) => ({
          flex: 1,
          gap: 0.5,
          minHeight: kkTokens.tapTarget,
          borderRadius: `${kkTokens.radius.bar}px`,
          color: palette(theme).text.secondary,
          '&[aria-selected="true"]': {
            color: palette(theme).text.primary,
            backgroundColor: palette(theme).background.paper,
            boxShadow: kkTokens.shadow.rest,
          },
          ...focusRing(theme),
        })}
      >
        <Typography component="span" variant="caption" sx={{ fontWeight: 800, color: 'inherit' }}>
          {tab.text}
        </Typography>
        {aside}
      </ButtonBase>
    );
  });

  return (
    <Stack
      direction="row"
      role="tablist"
      aria-label={label}
      sx={(theme) => ({
        flexShrink: 0,
        p: 0.25,
        gap: 0.25,
        borderRadius: `${kkTokens.radius.bar + 2}px`,
        backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 7%, transparent)`,
      })}
    >
      {buttons}
    </Stack>
  );
};
