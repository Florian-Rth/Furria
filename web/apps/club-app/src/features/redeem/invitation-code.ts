const CODE_LENGTH = 8;
const GROUP_LENGTH = 4;
const GROUP_SEPARATOR = '-';
const TYPED_SEPARATORS = /[\s\-–—_.]/g;
const COMPLETE_CODE = /^[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/;

export const INVITATION_CODE_DISPLAY_LENGTH = CODE_LENGTH + GROUP_SEPARATOR.length;

export const normalizeInvitationCode = (typed: string): string => {
  const characters = typed.replace(TYPED_SEPARATORS, '').toUpperCase().slice(0, CODE_LENGTH);

  if (characters.length <= GROUP_LENGTH) {
    return characters;
  }

  return `${characters.slice(0, GROUP_LENGTH)}${GROUP_SEPARATOR}${characters.slice(GROUP_LENGTH)}`;
};

export const isCompleteInvitationCode = (code: string): boolean => COMPLETE_CODE.test(code);
