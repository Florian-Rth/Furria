import { KkSectionHeader } from '../KkSectionHeader/KkSectionHeader';
import { KkSectionRoot } from './internal/layout/KkSectionRoot';

export const KkSection = Object.assign(KkSectionRoot, {
  Header: KkSectionHeader,
});
