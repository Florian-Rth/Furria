import type { ClubIcon } from '@/lib/club-icon';
import type { GroupTone } from '@/lib/group-tone';
import type { RoleCoin, RoleForm } from './schemas';

export type RoleCoinForm = Pick<RoleForm, 'showsCoin' | 'coinIcon' | 'coinTone'>;

const FIRST_COIN: RoleCoin = { icon: 'shield', tone: 'teal' };

export const toRoleCoin = (form: RoleCoinForm): RoleCoin | null => {
  if (!form.showsCoin || form.coinIcon === null || form.coinTone === null) {
    return null;
  }

  return { icon: form.coinIcon, tone: form.coinTone };
};

export const toRoleCoinForm = (coin: RoleCoin | null): RoleCoinForm =>
  coin === null
    ? { showsCoin: false, coinIcon: null, coinTone: null }
    : { showsCoin: true, coinIcon: coin.icon, coinTone: coin.tone };

export const toShownCoin = (icon: ClubIcon | null, tone: GroupTone | null): RoleCoin => ({
  icon: icon ?? FIRST_COIN.icon,
  tone: tone ?? FIRST_COIN.tone,
});
