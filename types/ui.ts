import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string;
  label: string;
  render: (row: T, index: number) => ReactNode;
  align?: "left" | "right";
};

export type FilterSelect = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};
