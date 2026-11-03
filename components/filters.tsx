"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { OptionSelect } from "@/components/option-select";

export function Filters({
  search,
  onSearch,
  searchPlaceholder = "Rechercher…",
  selects,
  onReset,
  id,
}: {
  search: string;
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  selects?: Array<{ label: string; value: string; options: string[]; onChange: (value: string) => void }>;
  onReset?: () => void;
  id?: string;
}) {
  return (
    <div id={id} className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-2">
      <InputGroup className="h-10 w-full sm:w-[280px]">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="text-[12.5px] [&::-webkit-search-cancel-button]:hidden"
        />
      </InputGroup>
      {selects?.map((select) => (
        <OptionSelect
          key={select.label}
          aria-label={select.label}
          value={select.value}
          onValueChange={select.onChange}
          options={select.options}
          className="w-auto min-w-[150px] text-[12px] font-medium"
        />
      ))}
      {onReset && (
        <Button
          variant="ghost"
          onClick={onReset}
          className="ml-auto h-10 text-[12px] font-bold text-brand hover:text-brand"
        >
          Réinitialiser
        </Button>
      )}
    </div>
  );
}
