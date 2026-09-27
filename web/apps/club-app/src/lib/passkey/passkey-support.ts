const hasWebAuthn = (): boolean =>
  typeof window !== 'undefined' && typeof window.PublicKeyCredential === 'function';

export const isPasskeySupported = async (): Promise<boolean> => {
  if (!hasWebAuthn()) {
    return false;
  }
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
};
