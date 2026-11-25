import { usePasskeySupport } from '@/lib/passkey/use-passkey-support';

export interface SecurityHelpViewer {
  addsPasskeys: boolean;
}

export const useSecurityHelpViewer = (): SecurityHelpViewer => ({
  addsPasskeys: usePasskeySupport(),
});
