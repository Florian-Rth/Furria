import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import type { WhatsAppHelpViewer } from '../hooks/use-whatsapp-help-viewer';
import { WHATSAPP_HELP_COPY, WHATSAPP_HELP_SPOTS } from '../whatsapp-help-copy';
import { WhatsAppHelpConnectionPreview } from './WhatsAppHelpConnectionPreview';
import { WhatsAppHelpKeepingPreview } from './WhatsAppHelpKeepingPreview';

interface WhatsAppHelpProps {
  viewer: WhatsAppHelpViewer;
}

export const WhatsAppHelp: FC<WhatsAppHelpProps> = ({ viewer }) => {
  const linkShow = viewer.showsLink ? <ScreenHelpShow spot={WHATSAPP_HELP_SPOTS.link} /> : null;
  const clubGroupShow = viewer.showsClubGroup ? (
    <ScreenHelpShow spot={WHATSAPP_HELP_SPOTS.clubGroup} />
  ) : null;
  const keepingShow = viewer.showsKeeping ? (
    <ScreenHelpShow spot={WHATSAPP_HELP_SPOTS.keeping} />
  ) : null;
  const refusedShow = viewer.showsKeeping ? (
    <ScreenHelpShow spot={WHATSAPP_HELP_SPOTS.refused} />
  ) : null;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <WhatsAppHelpConnectionPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{WHATSAPP_HELP_COPY.connection.title}</KkHelp.Title>
        <KkHelp.Text>{WHATSAPP_HELP_COPY.connection.text}</KkHelp.Text>
        <KkHelp.Text>{WHATSAPP_HELP_COPY.connection.start}</KkHelp.Text>
        <ScreenHelpShow spot={WHATSAPP_HELP_SPOTS.connection} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{WHATSAPP_HELP_COPY.link.title}</KkHelp.Title>
        <KkHelp.Text>{WHATSAPP_HELP_COPY.link.text}</KkHelp.Text>
        <KkHelp.Text>{WHATSAPP_HELP_COPY.link.pairing}</KkHelp.Text>
        {linkShow}
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{WHATSAPP_HELP_COPY.clubGroup.title}</KkHelp.Title>
        <KkHelp.Text>{WHATSAPP_HELP_COPY.clubGroup.text}</KkHelp.Text>
        <KkHelp.Text>{WHATSAPP_HELP_COPY.clubGroup.posts}</KkHelp.Text>
        {clubGroupShow}
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <WhatsAppHelpKeepingPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{WHATSAPP_HELP_COPY.keeping.title}</KkHelp.Title>
        <KkHelp.Text>{WHATSAPP_HELP_COPY.keeping.text}</KkHelp.Text>
        <KkHelp.Text>{WHATSAPP_HELP_COPY.keeping.never}</KkHelp.Text>
        {keepingShow}
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{WHATSAPP_HELP_COPY.refused.title}</KkHelp.Title>
        <KkHelp.Text>{WHATSAPP_HELP_COPY.refused.text}</KkHelp.Text>
        {refusedShow}
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
