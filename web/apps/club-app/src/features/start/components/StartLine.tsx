import { KkDensePanel } from '@furria/ui';
import type { FC } from 'react';
import type { StartLineInput } from '../hooks/use-start-line';
import { useStartLine } from '../hooks/use-start-line';

export const StartLine: FC<StartLineInput> = (props) => {
  const { line } = props;
  const { meta, state, tick, route, reach } = useStartLine(props);

  const anchor =
    line.anchor.kind === 'icon' ? (
      <KkDensePanel.Icon name={line.anchor.name} tone={line.anchor.tone} />
    ) : (
      <KkDensePanel.Number value={line.anchor.value} festive={line.anchor.festive} />
    );

  return (
    <KkDensePanel.Line
      anchor={anchor}
      title={line.title}
      meta={meta}
      tick={tick}
      state={state}
      accessibleLabel={line.accessibleName}
      component={route.component}
      to={route.to}
      params={route.params}
      search={route.search}
      onClick={reach}
    />
  );
};
