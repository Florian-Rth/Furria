const toLeadingCharacter = (name: string): string => {
  const [character] = name.trim();

  if (character === undefined) {
    return '';
  }

  return character.toUpperCase();
};

const NAME_WORDS = /[\p{L}\p{N}]+/gu;
const GROUP_INITIALS_LENGTH = 2;

export const groupInitialsOf = (name: string): string =>
  (name.match(NAME_WORDS) ?? [])
    .slice(0, GROUP_INITIALS_LENGTH)
    .map((word) => word.charAt(0).toLocaleUpperCase('de-DE'))
    .join('');

export const toInitials = (firstName: string, lastName: string): string =>
  `${toLeadingCharacter(firstName)}${toLeadingCharacter(lastName)}`;
