import { KkButton, KkFormatRail, KkPressBar } from '@furria/ui';
import type { FC } from 'react';
import { RAIL_LABEL, READINESS_LABEL } from '../../editor-copy';
import { useFormatItems } from '../../hooks/use-format-items';
import type { NewsEditor } from '../../hooks/use-news-editor';
import { usePressFoot } from '../../hooks/use-press-foot';
import type { ProseText } from '../../hooks/use-prose-text';
import { MORE_ACTIONS, VERSION_TOGGLE_LABEL } from '../../press-copy';
import { NewsHoldButton } from '../press/NewsHoldButton';

interface NewsPressFootProps {
  editor: NewsEditor;
  text: ProseText;
}

export const NewsPressFoot: FC<NewsPressFootProps> = ({ editor, text }) => {
  const foot = usePressFoot(editor, text);
  const formatItems = useFormatItems(text, editor.isReadOnly);

  if (foot.isRailOnly) {
    return <KkFormatRail label={RAIL_LABEL} items={formatItems} orientation="horizontal" />;
  }

  const readiness =
    foot.readiness === null ? null : (
      <KkPressBar.Readiness
        label={READINESS_LABEL}
        slots={foot.readiness}
        onSelect={foot.selectRequirement}
      />
    );
  const toggle =
    foot.toggle === null ? null : (
      <KkPressBar.Toggle
        label={VERSION_TOGGLE_LABEL}
        options={foot.toggle.options}
        value={foot.toggle.value}
        onChange={foot.toggle.onChange}
      />
    );
  const inline = foot.inlineActions.map((action) => (
    <KkButton
      key={action.id}
      variant="outlined"
      tone={action.tone}
      size="small"
      disabled={action.disabled}
      onClick={action.onSelect}
    >
      {action.label}
    </KkButton>
  ));
  const more =
    foot.menuActions.length === 0 ? null : (
      <KkPressBar.More label={MORE_ACTIONS} items={foot.menuActions} />
    );
  const publish =
    foot.publishLabel === null ? null : (
      <NewsHoldButton
        label={foot.publishLabel}
        kind={foot.pressKind}
        firstPublication={foot.pressKind === 'first'}
        disabled={foot.isBlocked}
        onPress={editor.requestPublish}
      />
    );

  return (
    <KkPressBar>
      <KkPressBar.Status
        state={foot.markState}
        stateWord={foot.stateWord}
        line={foot.line}
        lineTone={foot.lineTone}
        foreignNote={foot.foreignNote}
      />
      {readiness}
      <KkPressBar.Actions>
        {toggle}
        {inline}
        {more}
        {publish}
      </KkPressBar.Actions>
    </KkPressBar>
  );
};
