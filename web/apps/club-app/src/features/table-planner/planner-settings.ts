import type {
  SeatingStandard,
  TableShape,
  TableType,
  TableTypeForm,
} from '@/features/hall-plan/schemas';
import { TableTypeFormSchema } from '@/features/hall-plan/schemas';

const STANDARD_MIN_CM = 10;
const STANDARD_MAX_CM = 500;
const NEW_TYPE_LENGTH = '120';
const NEW_TYPE_WIDTH = '80';

export interface StandardFields {
  comfortable: string;
  maximum: string;
  depth: string;
  aisle: string;
  exit: string;
}

export interface TypeFields {
  name: string;
  shape: TableShape;
  length: string;
  width: string;
  seatsAtEnds: boolean;
}

export const standardFieldsOf = (standard: SeatingStandard): StandardFields => ({
  comfortable: String(standard.comfortableChairSpacingCm),
  maximum: String(standard.maximumChairSpacingCm),
  depth: String(standard.chairDepthCm),
  aisle: String(standard.aisleWidthCm),
  exit: String(standard.exitClearanceCm),
});

const centimetresOf = (value: string): number | null => {
  const trimmed = value.trim();
  const parsed = Number(trimmed);

  return trimmed !== '' &&
    Number.isInteger(parsed) &&
    parsed >= STANDARD_MIN_CM &&
    parsed <= STANDARD_MAX_CM
    ? parsed
    : null;
};

export const parseStandardFields = (fields: StandardFields): SeatingStandard | null => {
  const comfortable = centimetresOf(fields.comfortable);
  const maximum = centimetresOf(fields.maximum);
  const depth = centimetresOf(fields.depth);
  const aisle = centimetresOf(fields.aisle);
  const exit = centimetresOf(fields.exit);
  if (
    comfortable === null ||
    maximum === null ||
    depth === null ||
    aisle === null ||
    exit === null ||
    maximum > comfortable
  ) {
    return null;
  }

  return {
    comfortableChairSpacingCm: comfortable,
    maximumChairSpacingCm: maximum,
    chairDepthCm: depth,
    aisleWidthCm: aisle,
    exitClearanceCm: exit,
  };
};

export const typeFieldsOf = (type: TableType | null): TypeFields =>
  type === null
    ? {
        name: '',
        shape: 'rectangle',
        length: NEW_TYPE_LENGTH,
        width: NEW_TYPE_WIDTH,
        seatsAtEnds: true,
      }
    : {
        name: type.name,
        shape: type.shape,
        length: String(type.lengthCm),
        width: String(type.widthCm),
        seatsAtEnds: type.seatsAtEnds,
      };

export const parseTypeFields = (fields: TypeFields): TableTypeForm | null => {
  const length = Number(fields.length.trim());
  const isRound = fields.shape === 'round';
  const parsed = TableTypeFormSchema.safeParse({
    name: fields.name,
    shape: fields.shape,
    lengthCm: length,
    widthCm: isRound ? length : Number(fields.width.trim()),
    seatsAtEnds: isRound ? false : fields.seatsAtEnds,
  });

  return parsed.success ? parsed.data : null;
};
