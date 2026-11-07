import { selectAllSectionsOf } from '@furria/studio/arrange-actions';
import { countPlaceAt, countTrackOf } from '@furria/studio/count-marks';
import { keyShiftedTracksOf } from '@furria/studio/desk-keyframes';
import {
  compassTextOf,
  countPlaceOf,
  JOB_EARLIER,
  JOB_FACING,
  JOB_FACING_LABEL,
  JOB_GROUP_FACING,
  JOB_GROUP_SHOW,
  JOB_GROUP_WAY,
  JOB_GROUP_WAYPOINT,
  JOB_LATER,
  JOB_MOVEMENT_OWNER,
  JOB_NO_SPOT_PICKED,
  JOB_NO_WAY,
  JOB_ONION,
  JOB_PICK_LINE,
  JOB_STRAIGHTEN,
  JOB_SURE,
  JOB_WAYPOINT_DELETE,
  JOB_WAYPOINT_EARLIER_LABEL,
  JOB_WAYPOINT_LATER_LABEL,
  JOB_WAYPOINT_SET,
  movementContextOf,
  movementTitleOf,
  pickedTextOf,
  spotTitleOf,
  wayTextOf,
} from '@furria/studio/job-copy';
import { compassPointOf, pickedSpotOf, turnToOf } from '@furria/studio/job-model';
import type { JobAction, JobSection, JobView } from '@furria/studio/job-view';
import { actionsIn, jobActionOf } from '@furria/studio/job-view';
import { neighbourCountOf } from '@furria/studio/music-timeline';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import type { JobArrange } from '@furria/studio/use-arrange';
import type { JobConfirm } from '@furria/studio/use-job-confirm';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import { useTrackCommit } from '@furria/studio/use-track-commit';

const UNKEY_CONFIRM = 'unkey';

export const useMovementJob = (
  screen: StudioScreen,
  editor: ActStudioStage,
  arrange: JobArrange,
  confirm: JobConfirm,
  openCompass: () => void,
): JobView => {
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
        ? JOB_NO_SPOT_PICKED
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
  const keyShifts: JobAction[] = [
    jobActionOf(
      'keyEarlier',
      JOB_EARLIER,
      'earlier',
      () => {
        shift(-1);
      },
      { label: JOB_WAYPOINT_EARLIER_LABEL, reason: keyReason },
    ),
    jobActionOf(
      'keyLater',
      JOB_LATER,
      'later',
      () => {
        shift(1);
      },
      { label: JOB_WAYPOINT_LATER_LABEL, reason: keyReason },
    ),
  ];
  const facingTool = jobActionOf('facing', JOB_FACING, 'paths', openCompass, {
    label: JOB_FACING_LABEL,
    reason: lead === null ? 'noWay' : null,
  });
  const waypointSection: JobSection[] = movement.keyed
    ? [
        {
          kind: 'tools',
          key: 'waypoint',
          title: JOB_GROUP_WAYPOINT,
          aside: JOB_WAYPOINT_SET,
          actions: keyShifts,
        },
      ]
    : [];
  const straight: JobAction[] =
    lead?.bent === true
      ? [jobActionOf('straight', JOB_STRAIGHTEN, 'straight', movement.straighten)]
      : [];
  const waySections: JobSection[] =
    lead === null
      ? [{ kind: 'note', key: 'noWay', text: JOB_NO_WAY }]
      : [
          {
            kind: 'tools',
            key: 'way',
            title: JOB_GROUP_WAY,
            aside: wayTextOf(lead.fromSeconds, lead.toSeconds, lead.bent),
            actions: straight,
          },
          {
            kind: 'compass',
            key: 'facing',
            title: JOB_GROUP_FACING,
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
  const onion: JobSection = {
    kind: 'switch',
    key: 'onion',
    title: JOB_GROUP_SHOW,
    label: JOB_ONION,
    checked: editor.onion,
    change: editor.toggleOnion,
  };
  const selection = selectAllSectionsOf(chosen, arrange, JOB_PICK_LINE.movement);
  const sections: JobSection[] =
    chosen === 0
      ? [...selection, onion]
      : [...selection, ...waypointSection, ...waySections, onion];
  const view: JobView = {
    context: chosen === 0 ? JOB_PICK_LINE.movement : movementContextOf(place),
    blocks: [
      {
        key: 'movement',
        owner: JOB_MOVEMENT_OWNER,
        title: movementTitleOf(place),
        meta,
        sections,
        danger:
          chosen > 0 && movement.keyed
            ? jobActionOf(
                'unkey',
                confirm.armed(UNKEY_CONFIRM) ? JOB_SURE : JOB_WAYPOINT_DELETE,
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
