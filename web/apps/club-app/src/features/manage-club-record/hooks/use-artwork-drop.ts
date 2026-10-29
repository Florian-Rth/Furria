import type { ChangeEvent, DragEvent, RefCallback } from 'react';
import { useRef, useState } from 'react';

export interface ArtworkDrop {
  dragging: boolean;
  fileInput: RefCallback<HTMLInputElement>;
  openPicker: () => void;
  onPicked: (event: ChangeEvent<HTMLInputElement>) => void;
  onDragEnter: (event: DragEvent<HTMLElement>) => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDragLeave: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
}

const carriesFiles = (event: DragEvent<HTMLElement>): boolean =>
  event.dataTransfer.types.includes('Files');

export const useArtworkDrop = (onPick: (file: File | null) => void): ArtworkDrop => {
  const fileField = useRef<HTMLInputElement | null>(null);
  const [dragDepth, setDragDepth] = useState(0);

  return {
    dragging: dragDepth > 0,
    fileInput: (node) => {
      fileField.current = node;
    },
    openPicker: () => {
      fileField.current?.click();
    },
    onPicked: (event) => {
      onPick(event.currentTarget.files?.[0] ?? null);
      event.currentTarget.value = '';
    },
    onDragEnter: (event) => {
      if (carriesFiles(event)) {
        event.preventDefault();
        setDragDepth((depth) => depth + 1);
      }
    },
    onDragOver: (event) => {
      if (carriesFiles(event)) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
      }
    },
    onDragLeave: (event) => {
      if (carriesFiles(event)) {
        setDragDepth((depth) => Math.max(depth - 1, 0));
      }
    },
    onDrop: (event) => {
      event.preventDefault();
      setDragDepth(0);
      onPick(event.dataTransfer.files[0] ?? null);
    },
  };
};
