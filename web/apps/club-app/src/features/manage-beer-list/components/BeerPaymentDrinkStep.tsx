import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { BeerPaymentDrinkLine } from '../beer-hub';
import { payOpenOf, payStepLabelsOf } from '../beer-hub-copy';

interface BeerPaymentDrinkStepProps {
  drink: BeerPaymentDrinkLine;
  onStep: (beerDrinkId: number, step: number) => void;
}

export const BeerPaymentDrinkStep: FC<BeerPaymentDrinkStepProps> = ({ drink, onStep }) => {
  const labels = payStepLabelsOf(drink.name);
  const open = payOpenOf(drink.open);
  const countTone = drink.crates > 0 ? 'primary' : 'secondary';
  const cannotLess = drink.crates < 1;
  const cannotMore = drink.crates >= drink.open;
  const less = (): void => {
    onStep(drink.beerDrinkId, -1);
  };
  const more = (): void => {
    onStep(drink.beerDrinkId, 1);
  };

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, minWidth: 0 }}>
      <KkText variant="body2" clamp={1} sx={{ flex: 1, minWidth: 0 }}>
        {drink.name}
      </KkText>
      <KkIconButton
        label={labels.less}
        icon="subtract"
        size="small"
        disabled={cannotLess}
        onClick={less}
      />
      <KkText
        variant="subtitle1"
        tone={countTone}
        sx={{ minWidth: (theme) => theme.spacing(3), textAlign: 'center' }}
      >
        {drink.crates}
      </KkText>
      <KkIconButton
        label={labels.more}
        icon="add"
        size="small"
        disabled={cannotMore}
        onClick={more}
      />
      <KkText variant="caption" tone="secondary" sx={{ minWidth: (theme) => theme.spacing(5) }}>
        {open}
      </KkText>
    </Stack>
  );
};
