export interface ActStudioStepTool {
  deskOpen: boolean;
  deskStepId: number | null;
  canMark: boolean;
  openDesk: () => void;
  closeDesk: () => void;
  markHere: () => void;
}
