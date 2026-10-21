import type { KkFilterOption } from '@furria/ui';
import { KkFilterChips } from '@furria/ui';
import type { FC } from 'react';
import { VIEW_LABEL, VIEW_OPTIONS } from '../roles-hub-copy';
import type { RolesView } from '../schemas';

const OPTIONS: KkFilterOption[] = VIEW_OPTIONS.map((option) => ({
  id: option.id,
  label: option.label,
}));

interface RolesViewSwitchProps {
  view: RolesView;
  onChoose: (view: string) => void;
}

export const RolesViewSwitch: FC<RolesViewSwitchProps> = ({ view, onChoose }) => (
  <KkFilterChips label={VIEW_LABEL} options={OPTIONS} value={view} onChange={onChoose} />
);
