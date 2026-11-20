const INTAKE_PAGE_PATH = '/intake';

export const intakeUrlOf = (origin: string, token: string): string =>
  `${origin}${INTAKE_PAGE_PATH}#${token}`;
