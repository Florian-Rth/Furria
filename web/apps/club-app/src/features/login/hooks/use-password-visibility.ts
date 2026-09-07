import type { KkIconName } from '@furria/ui';
import { useState } from 'react';

interface PasswordVisibility {
  fieldType: 'password' | 'text';
  toggleIcon: KkIconName;
  toggleLabel: string;
  toggle: () => void;
}

export const usePasswordVisibility = (): PasswordVisibility => {
  const [isVisible, setIsVisible] = useState(false);

  const toggle = (): void => {
    setIsVisible((current) => !current);
  };

  return {
    fieldType: isVisible ? 'text' : 'password',
    toggleIcon: isVisible ? 'visibilityOff' : 'visibility',
    toggleLabel: isVisible ? 'Passwort verbergen' : 'Passwort anzeigen',
    toggle,
  };
};
