import type { FC } from 'react';
import { KkBrandLockup } from '../../../KkBrandLockup';
import { useKkHandoverStage } from '../../handover-stage';
import type { KkScreenKind, KkScreenOrigin } from '../../screen-declaration';
import { KkShellBarBack } from './KkShellBarBack';
import { KkShellBarClose } from './KkShellBarClose';
import { KkShellBarSwap } from './KkShellBarSwap';
import { KkShellBarTitle } from './KkShellBarTitle';

export type KkShellBarLead = 'brand' | 'title';

const BRAND_MARK_SIZE = 'sm';

interface KkShellBarLeadingProps {
  kind: KkScreenKind;
  lead: KkShellBarLead;
  title: string;
  origin?: KkScreenOrigin;
}

export const KkShellBarLeading: FC<KkShellBarLeadingProps> = ({ kind, lead, title, origin }) => {
  const stage = useKkHandoverStage();
  const Swap = stage?.Swap ?? KkShellBarSwap;

  if (kind === 'fullscreen' && origin !== undefined) {
    return <KkShellBarClose origin={origin} title={title} />;
  }

  const titleLine = <KkShellBarTitle>{title}</KkShellBarTitle>;
  const restLine =
    origin === undefined ? (
      <KkBrandLockup size={BRAND_MARK_SIZE} />
    ) : (
      <KkShellBarTitle>{origin.label}</KkShellBarTitle>
    );
  const leading =
    lead === 'title' ? (
      titleLine
    ) : (
      <Swap rest={restLine} title={titleLine} restText={origin?.label ?? null} titleText={title} />
    );

  if (origin === undefined) {
    return leading;
  }

  return <KkShellBarBack origin={origin}>{leading}</KkShellBarBack>;
};
