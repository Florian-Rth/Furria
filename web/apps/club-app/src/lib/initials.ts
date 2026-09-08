const toLeadingCharacter = (name: string): string => {
  const [character] = name.trim();

  if (character === undefined) {
    return '';
  }

  return character.toUpperCase();
};

export const toInitials = (firstName: string, lastName: string): string =>
  `${toLeadingCharacter(firstName)}${toLeadingCharacter(lastName)}`;
