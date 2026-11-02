export type KkScoreFormationSize = 'thumb' | 'card' | 'stage';

export interface FormationFrame {
  pad: number;
  radius: number;
  halo: number;
  edge: number;
  front: number;
}

export const FORMATION_FRAMES: Record<KkScoreFormationSize, FormationFrame> = {
  thumb: { pad: 0.5, radius: 0.42, halo: 0, edge: 0.08, front: 0.22 },
  card: { pad: 0.6, radius: 0.34, halo: 0.85, edge: 0.06, front: 0.16 },
  stage: { pad: 0.6, radius: 0.32, halo: 0.6, edge: 0.04, front: 0.12 },
};

export interface FormationBox {
  width: number;
  height: number;
}

export const formationBoxOf = (
  widthMetres: number,
  depthMetres: number,
  frame: FormationFrame,
): FormationBox => ({ width: widthMetres + frame.pad * 2, height: depthMetres + frame.pad * 2 });

export const viewBoxOf = (box: FormationBox, frame: FormationFrame): string =>
  `${-frame.pad} ${-frame.pad} ${box.width} ${box.height}`;

export const boxShareOf = (metres: number, pad: number, extent: number): number =>
  (metres + pad) / extent;
