import { useKkNotice } from '@furria/ui';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useUpdateGroupInfoMutation } from '../api';
import { toGroupInfoFormValues } from '../group-hub-labels';
import type { GroupHub } from '../schemas';

export interface RecruitingSwitchControl {
  checked: boolean;
  busy: boolean;
  onChange: (next: boolean) => void;
}

export const useRecruitingSwitch = (hub: GroupHub): RecruitingSwitchControl => {
  const mutation = useUpdateGroupInfoMutation(hub.groupId);
  const raiseNotice = useKkNotice();

  const onChange = (next: boolean): void => {
    mutation.mutate(toGroupInfoFormValues(hub, { isRecruiting: next }), {
      onError: (error) => {
        const message = toWriteErrorMessage(error);

        if (message !== null) {
          raiseNotice({ tone: 'error', message });
        }
      },
    });
  };

  return { checked: hub.isRecruiting, busy: mutation.isPending, onChange };
};
