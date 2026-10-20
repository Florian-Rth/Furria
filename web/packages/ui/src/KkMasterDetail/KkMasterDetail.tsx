import { KkMasterDetailDetail } from './internal/layout/KkMasterDetailDetail';
import { KkMasterDetailMaster } from './internal/layout/KkMasterDetailMaster';
import { KkMasterDetailRoot } from './internal/layout/KkMasterDetailRoot';

export const KkMasterDetail = Object.assign(KkMasterDetailRoot, {
  Master: KkMasterDetailMaster,
  Detail: KkMasterDetailDetail,
});
