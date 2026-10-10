import type { CSSObject, Theme } from '@mui/material/styles';

const MARGIN_RULE_OFFSET = { xs: -1.5, md: -3 } as const;
const MARGIN_RULE_WIDTH = 0.375;

export const proofMarginRuleOf = (theme: Theme, color: string): CSSObject => ({
  content: '""',
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: theme.spacing(MARGIN_RULE_OFFSET.xs),
  [theme.breakpoints.up('md')]: { left: theme.spacing(MARGIN_RULE_OFFSET.md) },
  width: theme.spacing(MARGIN_RULE_WIDTH),
  borderRadius: 2,
  backgroundColor: color,
  transition: theme.transitions.create('background-color'),
});
