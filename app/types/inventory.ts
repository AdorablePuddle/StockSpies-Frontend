export type Detection = {
  label: string;
  quantity?: number;
  stockPercentage?: number;
  confidence?: number;
  timestamp?: string;
};

export type InventorySnapshot = {
  detections: Detection[];
  batchTimestamp?: string;
};
