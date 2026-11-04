import { useState } from 'react';
import { useSaveSeatingStandardMutation, useTableTypeMutations } from '@/features/hall-plan/api';
import type { TableType } from '@/features/hall-plan/schemas';
import type { StandardFields, TypeFields } from '../planner-settings';
import {
  parseStandardFields,
  parseTypeFields,
  standardFieldsOf,
  typeFieldsOf,
} from '../planner-settings';
import { useTablePlannerContext } from '../table-planner-context';

export type TypeEditing = { mode: 'new' } | { mode: 'edit'; tableTypeId: number } | null;

export interface SeatingSettings {
  open: boolean;
  close: () => void;
  standard: StandardFields;
  changeStandard: (field: keyof StandardFields, value: string) => void;
  standardValid: boolean;
  saveStandard: () => void;
  savingStandard: boolean;
  types: readonly TableType[];
  editing: TypeEditing;
  typeFields: TypeFields;
  changeType: (patch: Partial<TypeFields>) => void;
  typeValid: boolean;
  startNew: () => void;
  startEdit: (type: TableType) => void;
  cancelType: () => void;
  saveType: () => void;
  savingType: boolean;
  removeType: (tableTypeId: number) => void;
}

export const useSeatingSettings = (): SeatingSettings => {
  const planner = useTablePlannerContext();
  const saveStandard = useSaveSeatingStandardMutation();
  const typeMutations = useTableTypeMutations();
  const [standard, setStandard] = useState<StandardFields>(() =>
    standardFieldsOf(planner.standard),
  );
  const [seenStandard, setSeenStandard] = useState(planner.standard);
  const [editing, setEditing] = useState<TypeEditing>(null);
  const [typeFields, setTypeFields] = useState<TypeFields>(() => typeFieldsOf(null));

  if (seenStandard !== planner.standard) {
    setSeenStandard(planner.standard);
    setStandard(standardFieldsOf(planner.standard));
  }

  const parsedStandard = parseStandardFields(standard);
  const parsedType = parseTypeFields(typeFields);
  const finishType = (): void => {
    setEditing(null);
  };

  return {
    open: planner.drawer === 'settings',
    close: () => {
      planner.openDrawer(null);
    },
    standard,
    changeStandard: (field, value) => {
      setStandard((current) => ({ ...current, [field]: value }));
    },
    standardValid: parsedStandard !== null,
    saveStandard: () => {
      if (parsedStandard !== null) {
        saveStandard.mutate(parsedStandard);
      }
    },
    savingStandard: saveStandard.isPending,
    types: planner.activeTypes,
    editing,
    typeFields,
    changeType: (patch) => {
      setTypeFields((current) => ({ ...current, ...patch }));
    },
    typeValid: parsedType !== null,
    startNew: () => {
      setEditing({ mode: 'new' });
      setTypeFields(typeFieldsOf(null));
    },
    startEdit: (type) => {
      setEditing({ mode: 'edit', tableTypeId: type.tableTypeId });
      setTypeFields(typeFieldsOf(type));
    },
    cancelType: finishType,
    saveType: () => {
      if (parsedType === null || editing === null) {
        return;
      }
      if (editing.mode === 'new') {
        typeMutations.create.mutate(parsedType, { onSuccess: finishType });
      } else {
        typeMutations.update.mutate(
          { tableTypeId: editing.tableTypeId, form: parsedType },
          { onSuccess: finishType },
        );
      }
    },
    savingType: typeMutations.create.isPending || typeMutations.update.isPending,
    removeType: (tableTypeId) => {
      typeMutations.remove.mutate(tableTypeId);
    },
  };
};
