import { countPlaceAt, countTrackOf } from '@furria/studio/count-marks';
import { keyShiftedTracksOf } from '@furria/studio/desk-keyframes';
import { neighbourCountOf } from '@furria/studio/music-timeline';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import { useTrackCommit } from '@furria/studio/use-track-commit';
import { selectAllSectionsOf } from '../arrange-actions';
import { compassPointOf, pickedSpotOf, turnToOf } from '../edit-jobs';
import {
  compassTextOf,
  countPlaceOf,
  EJ_EARLIER,
  EJ_FACING,
  EJ_FACING_LABEL,
  EJ_GROUP_FACING,
  EJ_GROUP_SHOW,
  EJ_GROUP_WAY,
  EJ_GROUP_WAYPOINT,
  EJ_LATER,
  EJ_MOVEMENT_OWNER,
  EJ_NO_SPOT_PICKED,
  EJ_NO_WAY,
  EJ_ONION,
  EJ_PICK_LINE,
  EJ_STRAIGHTEN,
  EJ_SURE,
  EJ_WAYPOINT_DELETE,
  EJ_WAYPOINT_EARLIER_LABEL,
  EJ_WAYPOINT_LATER_LABEL,
  EJ_WAYPOINT_SET,
  movementContextOf,
  movementTitleOf,
  pickedTextOf,
  spotTitleOf,
  wayTextOf,
} from '../edit-jobs-copy';
import type { EjAction, EjJobView, EjSection } from '../edit-jobs-view';
import { actionsIn, ejActionOf } from '../edit-jobs-view';
import type { EjArrange } from './use-arrange';
import type { EjConfirm } from './use-ej-confirm';

const UNKEY_CONFIRM = 'unkey';

export const useMovementJob = (
  screen: StudioScreen,
  editor: ActStudioStage,
  arrange: EjArrange,
  confirm: EjConfirm,
  openCompass: () => void,
): EjJobView => {
  const { playback, studio } = screen;
  const { player, countMarks, paths } = playback;
  const { movement } = editor;
  const { lead } = movement;
  const writes = useTrackCommit(screen);
  const track = countTrackOf(countMarks);
  const place = usePlaybackSelection(player, (seconds) => {
    const at = countPlaceAt(track, seconds);

    return at === null ? null : countPlaceOf(at.eight, at.count);
  });
  const chosen = editor.selected.length;
  const single = pickedSpotOf(editor.selected);
  const singleSpot = studio.spots.find((spot) => spot.spotId === single) ?? null;
  const meta =
    singleSpot !== null
      ? spotTitleOf(singleSpot.number, singleSpot.person?.firstName ?? null)
      : chosen === 0
        ? EJ_NO_SPOT_PICKED
        : pickedTextOf(chosen, arrange.placed);
  const shift = (direction: -1 | 1): void => {
    const from = player.position();
    const to = neighbourCountOf(countMarks, from, direction);
    if (to === null) {
      return;
    }
    const picked = paths.filter((path) => editor.selected.includes(path.spotId));
    const tracks = keyShiftedTracksOf(picked, from, to);
    if (Object.keys(tracks).length > 0) {
      writes.commit(tracks);
      player.seek(to);
    }
  };
  const facing = lead === null ? null : compassPointOf(lead.facingDegrees);
  const keyReason = movement.keyed ? null : 'noWaypoint';
  const keyShifts: EjAction[] = [
    ejActionOf(
      'keyEarlier',
      EJ_EARLIER,
      'earlier',
      () => {
        shift(-1);
      },
      { label: EJ_WAYPOINT_EARLIER_LABEL, reason: keyReason },
    ),
    ejActionOf(
      'keyLater',
      EJ_LATER,
      'later',
      () => {
        shift(1);
      },
      { label: EJ_WAYPOINT_LATER_LABEL, reason: keyReason },
    ),
  ];
  const facingTool = ejActionOf('facing', EJ_FACING, 'movement', openCompass, {
    label: EJ_FACING_LABEL,
    reason: lead === null ? 'noWay' : null,
  });
  const waypointSection: EjSection[] = movement.keyed
    ? [
        {
          kind: 'tools',
          key: 'waypoint',
          title: EJ_GROUP_WAYPOINT,
          aside: EJ_WAYPOINT_SET,
          actions: keyShifts,
        },
      ]
    : [];
  const straight: EjAction[] =
    lead?.bent === true
      ? [ejActionOf('straight', EJ_STRAIGHTEN, 'straight', movement.straighten)]
      : [];
  const waySections: EjSection[] =
    lead === null
      ? [{ kind: 'note', key: 'noWay', text: EJ_NO_WAY }]
      : [
          {
            kind: 'tools',
            key: 'way',
            title: EJ_GROUP_WAY,
            aside: wayTextOf(lead.fromSeconds, lead.toSeconds, lead.bent),
            actions: straight,
          },
          {
            kind: 'compass',
            key: 'facing',
            title: EJ_GROUP_FACING,
            aside: compassTextOf(facing),
            compass: {
              point: facing,
              choose: (point) => {
                movement.turn(turnToOf(lead.facingDegrees, point));
              },
              free: movement.unface,
            },
          },
        ];
  const onion: EjSection = {
    kind: 'switch',
    key: 'onion',
    title: EJ_GROUP_SHOW,
    label: EJ_ONION,
    checked: editor.onion,
    change: editor.toggleOnion,
  };
  const selection = selectAllSectionsOf(chosen, arrange, EJ_PICK_LINE.movement);
  const sections: EjSection[] =
    chosen === 0
      ? [...selection, onion]
      : [...selection, ...waypointSection, ...waySections, onion];
  const view: EjJobView = {
    context: chosen === 0 ? EJ_PICK_LINE.movement : movementContextOf(place),
    blocks: [
      {
        key: 'movement',
        owner: EJ_MOVEMENT_OWNER,
        title: movementTitleOf(place),
        meta,
        sections,
        danger:
          chosen > 0 && movement.keyed
            ? ejActionOf(
                'unkey',
                confirm.armed(UNKEY_CONFIRM) ? EJ_SURE : EJ_WAYPOINT_DELETE,
                'delete',
                () => {
                  confirm.press(UNKEY_CONFIRM, movement.unkey);
                },
                { tone: 'danger' },
              )
            : null,
      },
    ],
    bar: [],
  };

  const selectAll = actionsIn(view, ['selectAll']);

  return { ...view, bar: chosen === 0 ? selectAll : [...selectAll, ...keyShifts, facingTool] };
};
