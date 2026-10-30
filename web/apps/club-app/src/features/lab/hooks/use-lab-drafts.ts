import { useMyActsQuery } from '@/features/acts/api';
import type { LabDraft } from '../lab-drafts';
import { labDraftsOf } from '../lab-drafts';

export const useLabDrafts = (): LabDraft[] => labDraftsOf(useMyActsQuery().data?.acts ?? []);
