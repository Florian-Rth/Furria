import { poseAt } from '@furria/studio/choreography-motion';
import { stagePlaceTextOf } from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { byNameOf, spotPersonOf } from '@furria/studio/studio-spots';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { selectAllSectionsOf } from '../arrange-actions';
import type { CastAssign, CastSpot } from '../edit-jobs';
import { castAssignsOf, castChoiceKindOf, castCountOf, pickedSpotOf } from '../edit-jobs';
import {
  castChoiceLabelOf,
  castChoiceMetaOf,
  castLeadOf,
  castTitleOf,
  EJ_ADD_SPOT,
  EJ_ADD_SPOT_LABEL,
  EJ_CAST_OWNER,
  EJ_FREE,
  EJ_FREE_ALL,
  EJ_FREE_ALL_LABEL,
  EJ_GROUP_PERSON,
  EJ_GROUP_SPOTS,
  EJ_HERE,
  EJ_PICK_LINE,
  EJ_PICKED,
  EJ_SPOT_DELETE,
  EJ_SPOT_OWNER,
  EJ_SURE,
  pickedTextOf,
  spotPlaceOf,
  spotRowLabelOf,
  spotTitleOf,
} from '../edit-jobs-copy';
import type { EjAction, EjBlock, EjJobView, EjListRow, EjSection } from '../edit-jobs-view';
import { ejActionOf } from '../edit-jobs-view';
import type { EjArrange } from './use-arrange';
import type { EjConfirm } from './use-ej-confirm';

const CHOSEN_KEY = 'chosen';

export const useCastJob = (
  screen: StudioScreen,
  editor: ActStudioStage,
  arrange: EjArrange,
  confirm: EjConfirm,
  openPicker: () => void,
): EjJobView => {
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
    ? [ejActionOf('addSpot', EJ_ADD_SPOT, 'add', editor.addSpot, { label: EJ_ADD_SPOT_LABEL })]
    : [];
  const heldChosen = spots.filter(
    (spot) => editor.selected.includes(spot.spotId) && spot.person !== null,
  );
  const freeAll = (): void => {
    assign(heldChosen.map((spot) => ({ spotId: spot.spotId, personId: null })));
  };
  const free: EjAction[] =
    picked !== null && picked.person !== null ? [ejActionOf('free', EJ_FREE, 'free', freeAll)] : [];
  const freeMany: EjAction[] =
    chosen > 1 && heldChosen.length > 0
      ? [ejActionOf('freeAll', EJ_FREE_ALL, 'free', freeAll, { label: EJ_FREE_ALL_LABEL })]
      : [];
  const deleteKey = `spot:${picked?.spotId ?? 0}`;
  const deleteSpot =
    picked === null || !onSession
      ? null
      : ejActionOf(
          'deleteSpot',
          confirm.armed(deleteKey) ? EJ_SURE : EJ_SPOT_DELETE,
          'delete',
          () => {
            confirm.press(deleteKey, () => {
              editor.forget(picked.spotId);
              stageDocument.change({ kind: 'spotRemove', spotId: picked.spotId });
            });
          },
          { tone: 'danger' },
        );
  const choicesOf = (spot: (typeof spots)[number]): EjListRow[] =>
    [...cast].sort(byNameOf).map((person) => {
      const kind = castChoiceKindOf(castSpots, spot.spotId, person.personId);
      const swapWith = kind.kind === 'swap' ? kind.number : null;

      return {
        key: String(person.personId),
        lead: castLeadOf(kind, spot.number),
        title: `${person.firstName} ${person.lastName}`,
        meta: castChoiceMetaOf(kind),
        badge: kind.kind === 'here' ? EJ_HERE : null,
        selected: kind.kind === 'here',
        label: castChoiceLabelOf(person.firstName, person.lastName, spot.number, swapWith),
        press: () => {
          assign(castAssignsOf(castSpots, spot.spotId, person.personId));
        },
      };
    });
  const spotBlock: EjBlock | null =
    picked === null
      ? null
      : {
          key: `spot:${picked.spotId}`,
          owner: EJ_SPOT_OWNER,
          title: spotTitleOf(picked.number, fullNameOf(picked)),
          meta: placeOf(picked.spotId),
          sections: [
            {
              kind: 'spots',
              key: 'person',
              title: EJ_GROUP_PERSON,
              aside: null,
              rows: choicesOf(picked),
            },
            ...(free.length === 0
              ? []
              : [{ kind: 'tools' as const, key: 'free', title: null, aside: null, actions: free }]),
          ],
          danger: deleteSpot,
        };
  const chosenBlock: EjBlock | null =
    chosen > 1 && freeMany.length > 0
      ? {
          key: CHOSEN_KEY,
          owner: EJ_SPOT_OWNER,
          title: pickedTextOf(chosen, arrange.placed),
          meta: null,
          sections: [
            { kind: 'tools', key: 'freeAll', title: null, aside: null, actions: freeMany },
          ],
          danger: null,
        }
      : null;
  const overview: EjSection[] = [
    ...selectAllSectionsOf(chosen, arrange, EJ_PICK_LINE.cast),
    {
      kind: 'spots',
      key: 'spots',
      title: EJ_GROUP_SPOTS,
      aside: null,
      rows: spots.map((spot) => {
        const selected = editor.selected.includes(spot.spotId);
        const name = fullNameOf(spot);

        return {
          key: String(spot.spotId),
          lead: String(spot.number),
          title: name ?? 'frei',
          meta: placeOf(spot.spotId),
          badge: selected ? EJ_PICKED : null,
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
  const castBlock: EjBlock = {
    key: 'cast',
    owner: EJ_CAST_OWNER,
    title: castTitleOf(count.spots, count.held),
    meta: null,
    sections: overview,
    danger: null,
  };
  const leading = [spotBlock, chosenBlock].filter((block) => block !== null);
  const pickPerson: EjAction[] = [
    ejActionOf('pickPerson', EJ_GROUP_PERSON, 'person', openPicker, {
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
    context: chosen === 0 ? EJ_PICK_LINE.cast : castTitleOf(count.spots, count.held),
    blocks: [...leading, castBlock],
    bar,
  };
};
