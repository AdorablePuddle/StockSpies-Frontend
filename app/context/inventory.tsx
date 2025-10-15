import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type { Detection, InventorySnapshot } from "../types/inventory";

type InventoryContextValue = {
  snapshot: InventorySnapshot;
  setSnapshot: (snapshot: InventorySnapshot) => void;
  clear: () => void;
};

const defaultSnapshot: InventorySnapshot = {
  detections: [],
  batchTimestamp: undefined,
};

const InventoryContext = createContext<InventoryContextValue | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshotState] = useState<InventorySnapshot>(defaultSnapshot);

  const setSnapshot = (incoming: InventorySnapshot) => {
    setSnapshotState({
      detections: incoming.detections ?? [],
      batchTimestamp: incoming.batchTimestamp,
    });
  };

  const clear = () => setSnapshotState(defaultSnapshot);

  const value = useMemo<InventoryContextValue>(
    () => ({ snapshot, setSnapshot, clear }),
    [snapshot]
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}

export type { Detection } from "../types/inventory";
