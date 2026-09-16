import type { FC } from 'react';
import { KkBrandLockup } from '../../../KkBrandLockup';
import type { KkScreenOrigin } from '../../screen-declaration';
import { KkShellBarBack } from './KkShellBarBack';
import { KkShellBarSwap } from './KkShellBarSwap';
import { KkShellBarTitle } from './KkShellBarTitle';

export type KkShellBarLead = 'brand' | 'title';

const BRAND_MARK_SIZE = 'sm';

interface KkShellBarLeadingProps {
  lead: KkShellBarLead;
  title: string;
  origin?: KkScreenOrigin;
}

export const KkShellBarLeading: FC<KkShellBarLeadingProps> = ({ lead, title, origin }) => {
  const titleLine = <KkShellBarTitle>{title}</KkShellBarTitle>;
  const restLine =
    origin === undefined ? (
      <KkBrandLockup size={BRAND_MARK_SIZE} />
    ) : (
      <KkShellBarTitle>{origin.label}</KkShellBarTitle>
    );
  const leading =
    lead === 'title' ? titleLine : <KkShellBarSwap rest={restLine} title={titleLine} />;

  if (origin === undefined) {
    return leading;
  }

  return <KkShellBarBack origin={origin}>{leading}</KkShellBarBack>;
};
