import type { FC, ReactElement } from 'react';
import type { BucketPiece, BucketPieceKind } from './bucket-spill';

const SHAPE_BY_KIND: Record<BucketPieceKind, ReactElement> = {
  strip: <rect x={-5} y={-2} width={10} height={4} rx={1} fill="currentColor" />,
  dot: <circle r={2.6} fill="currentColor" />,
  curl: (
    <path
      d="M-7 0q1.75-4 3.5 0t3.5 0 3.5 0 3.5 0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  ),
};

interface KkMottoStageBucketPieceProps {
  piece: BucketPiece;
}

export const KkMottoStageBucketPiece: FC<KkMottoStageBucketPieceProps> = ({ piece }) => {
  const placement = `translate(${piece.x} ${piece.y}) rotate(${piece.rotate})`;

  return (
    <g transform={placement} data-tone={piece.tone}>
      {SHAPE_BY_KIND[piece.kind]}
    </g>
  );
};
