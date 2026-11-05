"use client";

import { useEffect, useState } from "react";

export function PointsInput({ value, onChange }: { value: number; onChange: (value: string) => void }) {
  const [localValue, setLocalValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);

  // Sync from parent when not focused
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(String(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const numValue = Number(localValue);
  const showPlus = !isNaN(numValue) && numValue >= 0 && localValue !== "" && localValue !== "-";

  return (
    <span className="flex h-8 w-[82px] items-center gap-1 rounded-lg border border-line bg-card pl-2.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
      {showPlus && <span className="text-[11px] font-bold text-green">+</span>}
      <input
        type="text"
        inputMode="numeric"
        value={localValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full bg-transparent text-[11px] font-bold text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="pr-2 text-[9px] text-soft">pts</span>
    </span>
  );
}
