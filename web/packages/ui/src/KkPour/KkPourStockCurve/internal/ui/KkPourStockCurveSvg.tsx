import type { FC } from 'react';
import type { KkPourStockCurvePlot } from '../../../pour-stock-trend';

interface KkPourStockCurveSvgProps {
  plot: KkPourStockCurvePlot;
  width: number;
  height: number;
  svgId: string;
  dot: number;
  glow: number;
  mark: number;
}

export const KkPourStockCurveSvg: FC<KkPourStockCurveSvgProps> = ({
  plot,
  width,
  height,
  svgId,
  dot,
  glow,
  mark,
}) => {
  const viewBox = `0 0 ${width} ${height}`;
  const areaId = `${svgId}-area`;
  const bandId = `${svgId}-band`;
  const areaFill = `url(#${areaId})`;
  const bandFill = `url(#${bandId})`;
  const band =
    plot.forecastBand === null ? null : (
      <path data-curve-band d={plot.forecastBand} fill={bandFill} />
    );
  const ahead = plot.forecastLine === null ? null : <path data-curve-ahead d={plot.forecastLine} />;
  const todayRule =
    plot.forecastLine === null ? null : (
      <line data-curve-rule x1={plot.now.x} x2={plot.now.x} y1={plot.top} y2={plot.floor} />
    );
  const marks = plot.marks.map((rise) => (
    <circle key={rise.day} data-curve-mark cx={rise.x} cy={rise.y} r={mark} />
  ));
  const empty =
    plot.empty === null ? null : (
      <circle data-curve-empty cx={plot.empty.x} cy={plot.empty.y} r={dot} />
    );

  return (
    <svg aria-hidden="true" data-curve-svg width={width} height={height} viewBox={viewBox}>
      <defs>
        <linearGradient id={areaId} data-curve-area-fade x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" />
          <stop offset="0.55" />
          <stop offset="1" />
        </linearGradient>
        <linearGradient id={bandId} data-curve-band-fade x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" />
          <stop offset="1" />
        </linearGradient>
      </defs>
      <line data-curve-floor x1={plot.left} x2={plot.right} y1={plot.floor} y2={plot.floor} />
      {todayRule}
      {band}
      <path data-curve-area d={plot.area} fill={areaFill} />
      <path data-curve-line d={plot.line} />
      {ahead}
      {marks}
      {empty}
      <circle data-curve-glow cx={plot.now.x} cy={plot.now.y} r={glow} />
      <circle data-curve-now cx={plot.now.x} cy={plot.now.y} r={dot} />
    </svg>
  );
};
