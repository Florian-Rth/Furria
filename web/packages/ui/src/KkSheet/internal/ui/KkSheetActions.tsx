import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkButton } from '../../../KkButton';
import { kkTokens } from '../../../tokens';
import type { KkSheetAction } from '../../sheet-actions';

const ROW_GAP = 1;
const FOOT_PADDING = { px: 2.5, pt: 2 };

interface KkSheetActionsProps {
  primary?: KkSheetAction;
  secondary?: KkSheetAction;
  tertiary?: KkSheetAction;
}

export const KkSheetActions: FC<KkSheetActionsProps> = ({ primary, secondary, tertiary }) => {
  const supporting = [secondary, tertiary].filter((action) => action !== undefined);

  if (primary === undefined && supporting.length === 0) {
    return null;
  }

  const supportingRow =
    supporting.length === 0 ? null : (
      <Stack direction="row" sx={{ gap: ROW_GAP, minWidth: 0 }}>
        {supporting.map((action) => (
          <KkButton
            key={action.label}
            variant="outlined"
            tone={action.tone}
            component={action.component}
            to={action.to}
            params={action.params}
            onClick={action.onClick}
            disabled={action.disabled}
            loading={action.loading}
            ariaLabel={action.ariaLabel}
            fullWidth
          >
            {action.label}
          </KkButton>
        ))}
      </Stack>
    );

  const leadAction =
    primary === undefined ? null : (
      <KkButton
        size="large"
        tone={primary.tone}
        component={primary.component}
        to={primary.to}
        params={primary.params}
        onClick={primary.onClick}
        disabled={primary.disabled}
        loading={primary.loading}
        ariaLabel={primary.ariaLabel}
        fullWidth
      >
        {primary.label}
      </KkButton>
    );

  return (
    <Stack
      data-kk-sheet-actions
      sx={{
        flexShrink: 0,
        minWidth: 0,
        gap: ROW_GAP,
        borderTopWidth: kkTokens.line.hair,
        borderTopStyle: 'solid',
        borderColor: 'divider',
        ...FOOT_PADDING,
      }}
    >
      {supportingRow}
      {leadAction}
    </Stack>
  );
};
