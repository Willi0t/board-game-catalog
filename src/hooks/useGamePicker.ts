import { useRef, useState } from 'react';
import {
  defaultPickerCriteria,
  type PickerCriteria,
} from '../utils/gamePicker';

export default function useGamePicker() {
  const [criteria, setCriteria] = useState(defaultPickerCriteria);
  // Applied criteria are an explicit snapshot; editing/cancelling the draft
  // must not silently change the catalog's current results.
  const [appliedCriteria, setAppliedCriteria] = useState<PickerCriteria | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState(false);
  const openerRef = useRef<HTMLElement>(null);

  const open = (
    trigger: HTMLButtonElement,
    changes?: Partial<PickerCriteria>,
  ) => {
    openerRef.current = trigger;
    if (appliedCriteria) setCriteria({ ...appliedCriteria, ...changes });
    setIsOpen(true);
  };
  const apply = () => {
    setAppliedCriteria(criteria);
    setIsOpen(false);
  };

  return {
    criteria,
    setCriteria,
    appliedCriteria,
    clearResults: () => setAppliedCriteria(null),
    isOpen,
    open,
    close: () => setIsOpen(false),
    apply,
    openerRef,
  };
}
