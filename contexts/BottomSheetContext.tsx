"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface BottomSheetContextType {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined);

export function BottomSheetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const setOpen = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  return (
    <BottomSheetContext.Provider value={{ isOpen, setOpen }}>
      {children}
    </BottomSheetContext.Provider>
  );
}

export function useBottomSheet() {
  const context = useContext(BottomSheetContext);
  if (context === undefined) {
    // Return default values if used outside provider (backwards compatibility)
    return { isOpen: false, setOpen: () => {} };
  }
  return context;
}
