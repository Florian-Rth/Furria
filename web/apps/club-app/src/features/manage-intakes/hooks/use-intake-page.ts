import type {
  KkScreenActionBar,
  KkScreenActions,
  KkScreenDeed,
  KkScreenOrigin,
} from '@furria/ui/screen-declaration';
import type { UseQueryResult } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useIntakeQuery } from '../api';
import {
  COPY_LABEL,
  EDIT_LABEL,
  INTAKE_EDIT_ROUTE,
  INTAKE_REVIEW_ROUTE,
  RENEW_LABEL,
  REVIEW_LABEL,
  SHARE_LABEL,
  toHomeOrigin,
  toHomePath,
} from '../intake-labels';
import type { IntakeActionPlan, IntakeActions } from '../intake-rules';
import { toIntakeActionPlan, toIntakeActions, toIntakeHome } from '../intake-rules';
import type { IntakeDetails } from '../schemas';
import type { IntakeRenewalControl } from './use-intake-renewal';
import { useIntakeRenewal } from './use-intake-renewal';
import type { IntakeShare } from './use-intake-share';
import { useIntakeShare } from './use-intake-share';

export interface IntakePage {
  intake: UseQueryResult<IntakeDetails, Error>;
  actions: IntakeActions | null;
  share: IntakeShare;
  renewal: IntakeRenewalControl;
  actionBar: KkScreenActionBar | undefined;
  headerActions: KkScreenActions | undefined;
  origin: KkScreenOrigin;
  homePath: string;
}

export const useIntakePage = (intakeId: number | null): IntakePage => {
  const intake = useIntakeQuery(intakeId);
  const navigate = useNavigate();
  const details = intake.data;
  const { has } = usePermissions();
  const home = toIntakeHome(details?.intake.groups ?? [], has(PERMISSION_KEYS.personsManage));
  const actions = details === undefined ? null : toIntakeActions(details.intake, details.token);
  const plan: IntakeActionPlan = actions === null ? 'none' : toIntakeActionPlan(actions);
  const share = useIntakeShare(details?.token ?? '');
  const renewal = useIntakeRenewal(intakeId, actions?.renewVoidsLink ?? false);

  const openAt = (to: string): void => {
    if (intakeId !== null) {
      void navigate({ to, params: { intakeId: String(intakeId) } });
    }
  };

  const shareDeed: KkScreenDeed = {
    label: share.canShare ? SHARE_LABEL : COPY_LABEL,
    icon: share.canShare ? 'share' : 'copy',
    onSelect: share.share,
  };
  const renewDeed: KkScreenDeed = {
    label: RENEW_LABEL,
    onSelect: renewal.ask,
    loading: renewal.isSaving,
  };
  const reviewDeed: KkScreenDeed = {
    label: REVIEW_LABEL,
    onSelect: () => {
      openAt(INTAKE_REVIEW_ROUTE);
    },
  };

  const actionBars: Record<IntakeActionPlan, KkScreenActionBar | undefined> = {
    review: { primary: reviewDeed },
    shareAndRenew: { primary: shareDeed, secondary: renewDeed },
    renew: { primary: renewDeed },
    none: undefined,
  };

  const headerActions: KkScreenActions | undefined = actions?.canEdit
    ? [
        {
          id: 'edit',
          label: EDIT_LABEL,
          icon: 'edit',
          onSelect: () => {
            openAt(INTAKE_EDIT_ROUTE);
          },
        },
      ]
    : undefined;

  return {
    intake,
    actions,
    share,
    renewal,
    actionBar: actionBars[plan],
    headerActions,
    origin: toHomeOrigin(home),
    homePath: toHomePath(home),
  };
};
