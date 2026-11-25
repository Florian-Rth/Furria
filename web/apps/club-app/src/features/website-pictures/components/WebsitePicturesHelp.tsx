import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { WEBSITE_HELP_COPY, WEBSITE_HELP_SPOTS } from '../website-help-copy';
import { WebsiteHelpSlotPreview } from './WebsiteHelpSlotPreview';

interface WebsitePicturesHelpProps {
  hasOrphans: boolean;
}

export const WebsitePicturesHelp: FC<WebsitePicturesHelpProps> = ({ hasOrphans }) => {
  const orphans = hasOrphans ? (
    <KkHelp.Hint>
      <KkHelp.Title>{WEBSITE_HELP_COPY.orphans.title}</KkHelp.Title>
      <KkHelp.Text>{WEBSITE_HELP_COPY.orphans.text}</KkHelp.Text>
      <ScreenHelpShow spot={WEBSITE_HELP_SPOTS.orphans} />
    </KkHelp.Hint>
  ) : null;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <WebsiteHelpSlotPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{WEBSITE_HELP_COPY.slots.title}</KkHelp.Title>
        <KkHelp.Text>{WEBSITE_HELP_COPY.slots.text}</KkHelp.Text>
        <ScreenHelpShow spot={WEBSITE_HELP_SPOTS.slots} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{WEBSITE_HELP_COPY.fill.title}</KkHelp.Title>
        <KkHelp.Text>{WEBSITE_HELP_COPY.fill.text}</KkHelp.Text>
        <KkHelp.Text>{WEBSITE_HELP_COPY.fill.copy}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{WEBSITE_HELP_COPY.crop.title}</KkHelp.Title>
        <KkHelp.Text>{WEBSITE_HELP_COPY.crop.text}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{WEBSITE_HELP_COPY.alt.title}</KkHelp.Title>
        <KkHelp.Text>{WEBSITE_HELP_COPY.alt.text}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{WEBSITE_HELP_COPY.live.title}</KkHelp.Title>
        <KkHelp.Text>{WEBSITE_HELP_COPY.live.text}</KkHelp.Text>
      </KkHelp.Hint>
      {orphans}
    </ScreenHelp>
  );
};
