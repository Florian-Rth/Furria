import { selectAllSectionsOf } from '@furria/studio/arrange-actions';
import { poseAt } from '@furria/studio/choreography-motion';
import {
  castChoiceLabelOf,
  castChoiceMetaOf,
  castLeadOf,
  castTitleOf,
  JOB_ADD_SPOT,
  JOB_ADD_SPOT_LABEL,
  JOB_CAST_OWNER,
  JOB_FREE,
  JOB_FREE_ALL,
  JOB_FREE_ALL_LABEL,
  JOB_GROUP_PERSON,
  JOB_GROUP_SPOTS,
  JOB_HERE,
  JOB_PICK_LINE,
  JOB_PICKED,
  JOB_SPOT_DELETE,
  JOB_SPOT_OWNER,
  JOB_SURE,
  pickedTextOf,
  spotPlaceOf,
  spotRowLabelOf,
  spotTitleOf,
} from '@furria/studio/job-copy';
import type { CastAssign, CastSpot } from '@furria/studio/job-model';
import {
  castAssignsOf,
  castChoiceKindOf,
  castCountOf,
  pickedSpotOf,
} from '@furria/studio/job-model';
import type { JobAction, JobBlock, JobListRow, JobSection, JobView } from '@furria/studio/job-view';
import { jobActionOf } from '@furria/studio/job-view';
import { stagePlaceTextOf } from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { byNameOf, spotPersonOf } from '@furria/studio/studio-spots';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import type { JobArrange } from '@furria/studio/use-arrange';
import type { JobConfirm } from '@furria/studio/use-job-confirm';

const CHOSEN_KEY = 'chosen';

export const useCastJob = (
  screen: StudioScreen,
  editor: ActStudioStage,
  arrange: JobArrange,
  confirm: JobConfirm,
  openPicker: () => void,
): JobView => {
  const { studio, cast, stageDocument, playback, evening } = screen;
  const onSession = evening === null;
  const spots = [...studio.spots].sort((left, right) => left.number - right.number);
  const count = castCountOf(spots);
  const chosen = editor.selected.length;
  const pickedId = pickedSpotOf(editor.selected);
  const picked = spots.find((spot) => spot.spotId === pickedId) ?? null;
  const castSpots: CastSpot[] = spots.map((spot) => ({
    spotId: spot.spotId,
    number: spot.number,
    personId: spot.person?.personId ?? null,
  }));
  const fullNameOf = (spot: (typeof spots)[number]): string | null =>
    spot.person === null ? null : `${spot.person.firstName} ${spot.person.lastName}`;
  const placeOf = (spotId: number): string => {
    const path = playback.paths.find((candidate) => candidate.spotId === spotId) ?? null;
    const pose = path === null ? null : poseAt(path, editor.formationSeconds);

    return spotPlaceOf(
      pose === null ? null : stagePlaceTextOf(pose.position.rightMetres, pose.position.backMetres),
      path?.keyframes.length ?? 0,
    );
  };
  const assign = (changes: readonly CastAssign[]): void => {
    if (changes.length === 0) {
      return;
    }
    stageDocument.startGesture();
    for (const change of changes) {
      const person = cast.find((candidate) => candidate.personId === change.personId) ?? null;
      stageDocument.change({
        kind: 'spotAssign',
        spotId: change.spotId,
        person: person === null ? null : spotPersonOf(person),
      });
    }
    stageDocument.endGesture();
  };
  const addSpot = onSession
    ? [jobActionOf('addSpot', JOB_ADD_SPOT, 'add', editor.addSpot, { label: JOB_ADD_SPOT_LABEL })]
    : [];
  const heldChosen = spots.filter(
    (spot) => editor.selected.includes(spot.spotId) && spot.person !== null,
  );
  const freeAll = (): void => {
    assign(heldChosen.map((spot) => ({ spotId: spot.spotId, personId: null })));
  };
  const free: JobAction[] =
    picked !== null && picked.person !== null
      ? [jobActionOf('free', JOB_FREE, 'free', freeAll)]
      : [];
  const freeMany: JobAction[] =
    chosen > 1 && heldChosen.length > 0
      ? [jobActionOf('freeAll', JOB_FREE_ALL, 'free', freeAll, { label: JOB_FREE_ALL_LABEL })]
      : [];
  const deleteKey = `spot:${picked?.spotId ?? 0}`;
  const deleteSpot =
    picked === null || !onSession
      ? null
      : jobActionOf(
          'deleteSpot',
          confirm.armed(deleteKey) ? JOB_SURE : JOB_SPOT_DELETE,
          'delete',
          () => {
            confirm.press(deleteKey, () => {
              editor.forget(picked.spotId);
              stageDocument.change({ kind: 'spotRemove', spotId: picked.spotId });
            });
          },
          { tone: 'danger' },
        );
  const choicesOf = (spot: (typeof spots)[number]): JobListRow[] =>
    [...cast].sort(byNameOf).map((person) => {
      const kind = castChoiceKindOf(castSpots, spot.spotId, person.personId);
      const swapWith = kind.kind === 'swap' ? kind.number : null;

      return {
        key: String(person.personId),
        lead: castLeadOf(kind, spot.number),
        title: `${person.firstName} ${person.lastName}`,
        meta: castChoiceMetaOf(kind),
        badge: kind.kind === 'here' ? JOB_HERE : null,
        selected: kind.kind === 'here',
        label: castChoiceLabelOf(person.firstName, person.lastName, spot.number, swapWith),
        press: () => {
          assign(castAssignsOf(castSpots, spot.spotId, person.personId));
        },
      };
    });
  const spotBlock: JobBlock | null =
    picked === null
      ? null
      : {
          key: `spot:${picked.spotId}`,
          owner: JOB_SPOT_OWNER,
          title: spotTitleOf(picked.number, fullNameOf(picked)),
          meta: placeOf(picked.spotId),
          sections: [
            {
              kind: 'spots',
              key: 'person',
              title: JOB_GROUP_PERSON,
              aside: null,
              rows: choicesOf(picked),
            },
            ...(free.length === 0
              ? []
              : [{ kind: 'tools' as const, key: 'free', title: null, aside: null, actions: free }]),
          ],
          danger: deleteSpot,
        };
  const chosenBlock: JobBlock | null =
    chosen > 1 && freeMany.length > 0
      ? {
          key: CHOSEN_KEY,
          owner: JOB_SPOT_OWNER,
          title: pickedTextOf(chosen, arrange.placed),
          meta: null,
          sections: [
            { kind: 'tools', key: 'freeAll', title: null, aside: null, actions: freeMany },
          ],
          danger: null,
        }
      : null;
  const overview: JobSection[] = [
    ...selectAllSectionsOf(chosen, arrange, JOB_PICK_LINE.cast),
    {
      kind: 'spots',
      key: 'spots',
      title: JOB_GROUP_SPOTS,
      aside: null,
      rows: spots.map((spot) => {
        const selected = editor.selected.includes(spot.spotId);
        const name = fullNameOf(spot);

        return {
          key: String(spot.spotId),
          lead: String(spot.number),
          title: name ?? 'frei',
          meta: placeOf(spot.spotId),
          badge: selected ? JOB_PICKED : null,
          selected,
          label: spotRowLabelOf(spot.number, name),
          press: () => {
            editor.tap(spot.spotId);
          },
        };
      }),
    },
    ...(addSpot.length === 0
      ? []
      : [{ kind: 'tools' as const, key: 'add', title: null, aside: null, actions: addSpot }]),
  ];
  const castBlock: JobBlock = {
    key: 'cast',
    owner: JOB_CAST_OWNER,
    title: castTitleOf(count.spots, count.held),
    meta: null,
    sections: overview,
    danger: null,
  };
  const leading = [spotBlock, chosenBlock].filter((block) => block !== null);
  const pickPerson: JobAction[] = [
    jobActionOf('pickPerson', JOB_GROUP_PERSON, 'person', openPicker, {
      reason: picked === null ? 'pickSpot' : null,
    }),
  ];
  const bar = [
    ...pickPerson,
    ...free,
    ...freeMany,
    ...addSpot,
    ...(deleteSpot === null ? [] : [deleteSpot]),
  ];

  return {
    context: chosen === 0 ? JOB_PICK_LINE.cast : castTitleOf(count.spots, count.held),
    blocks: [...leading, castBlock],
    bar,
  };
};
