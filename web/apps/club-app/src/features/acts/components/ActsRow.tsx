import { KkOverlapGauge } from '@furria/ui/KkOverlapGauge';
import { KkPictureMark } from '@furria/ui/KkPictureMark';
import { KkSpotlightList } from '@furria/ui/KkSpotlightList';
import type { FC } from 'react';
import type { CatalogueAct } from '@/features/running-order/schemas';
import { KIND_ICONS, OPEN_LABEL, toOverlapCaption, toOverlapLabel } from '../acts-copy';
import { spotlightOf } from '../acts-overlap';
import type { ActsHub } from '../hooks/use-acts-hub';
import { ActsRowFact } from './ActsRowFact';
import { ActWishChips } from './ActWishChips';

interface ActsRowProps {
  act: CatalogueAct;
  hub: ActsHub;
}

export const ActsRow: FC<ActsRowProps> = ({ act, hub }) => {
  const overlap = hub.overlaps.get(act.actId) ?? { shared: 0, total: act.cast.length };
  const spotlight = spotlightOf(act, hub.spotlight?.person.personId ?? null);
  const roomy = hub.isWide && !hub.isSideOpen;
  const open = (): void => {
    hub.open(act.actId);
  };
  const mark = (
    <KkPictureMark
      image={null}
      tone={act.group?.tone ?? null}
      clubIcon={null}
      icon={KIND_ICONS[act.kind ?? 'point']}
      alt={act.name}
    />
  );
  const gauge = (
    <KkOverlapGauge
      shared={overlap.shared}
      total={overlap.total}
      label={toOverlapLabel(overlap.shared, overlap.total)}
      caption={roomy ? toOverlapCaption(overlap.shared) : null}
      tone={spotlight === 'lit' ? 'accent' : 'ink'}
    />
  );
  const runs = hub.runs.get(act.actId) ?? 0;
  const fact = <ActsRowFact act={act} runs={runs} />;
  const chips =
    hub.seesWishes && act.wishes.length > 0 ? <ActWishChips wishes={act.wishes} /> : null;

  return (
    <KkSpotlightList.Row
      rowKey={String(act.actId)}
      mark={mark}
      title={act.name}
      fact={fact}
      chips={chips}
      trailing={gauge}
      spotlight={spotlight}
      openLabel={OPEN_LABEL}
      onOpen={open}
    />
  );
};
