import { KkEjPanel } from '@furria/ui/KkEjPanel';
import type { FC } from 'react';
import type { EjSection } from '../edit-jobs-view';
import { EjChoicesSection } from './EjChoicesSection';
import { EjCompassSection } from './EjCompassSection';
import { EjCopySection } from './EjCopySection';
import { EjFieldsSection } from './EjFieldsSection';
import { EjSpotsSection } from './EjSpotsSection';
import { EjSwitchSection } from './EjSwitchSection';
import { EjToolsSection } from './EjToolsSection';

interface EjSectionViewProps {
  owner: string;
  section: EjSection;
}

export const EjSectionView: FC<EjSectionViewProps> = ({ owner, section }) => {
  switch (section.kind) {
    case 'tools':
      return (
        <EjToolsSection
          label={section.title ?? owner}
          title={section.title}
          aside={section.aside}
          actions={section.actions}
        />
      );
    case 'fields':
      return <EjFieldsSection title={section.title} fields={section.fields} />;
    case 'choices':
      return (
        <EjChoicesSection title={section.title} aside={section.aside} choices={section.choices} />
      );
    case 'copy':
      return <EjCopySection title={section.title} pick={section.pick} />;
    case 'switch':
      return (
        <EjSwitchSection
          title={section.title}
          label={section.label}
          checked={section.checked}
          onChange={section.change}
        />
      );
    case 'spots':
      return <EjSpotsSection title={section.title} aside={section.aside} rows={section.rows} />;
    case 'compass':
      return (
        <EjCompassSection title={section.title} aside={section.aside} compass={section.compass} />
      );
    case 'note':
      return <KkEjPanel.Note text={section.text} />;
  }
};
