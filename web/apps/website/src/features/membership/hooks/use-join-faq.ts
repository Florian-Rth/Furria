import { useClubAgeOfConsent } from '@/lib/public-club/use-club-age-of-consent';
import type { JoinFaqEntry } from '../faq-content';
import { buildJoinFaq } from '../faq-content';

export const useJoinFaq = (): JoinFaqEntry[] => buildJoinFaq(useClubAgeOfConsent());
