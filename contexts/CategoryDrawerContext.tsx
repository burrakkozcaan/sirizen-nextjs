"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface CategoryDrawerContextType {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CategoryDrawerContext = createContext<CategoryDrawerContextType | undefined>(undefined);

export function CategoryDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  return (
    <CategoryDrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer }}>
      {children}
    </CategoryDrawerContext.Provider>
  );
}

export function useCategoryDrawer() {
  const context = useContext(CategoryDrawerContext);
  if (!context) {
    throw new Error("useCategoryDrawer must be used within CategoryDrawerProvider");
  }
  return context;
}
