"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SelectChoice = { value: string; label: string };
export type SelectGroup = { heading: string; options: SelectChoice[] };

/**
 * Searchable combobox with loose choices on top and non-selectable group headings
 * whose children are selectable. Typing filters across every group.
 */
export function GroupedSelect({
  value,
  onValueChange,
  choices = [],
  groups = [],
  placeholder = "Sélectionner…",
  searchPlaceholder = "Rechercher…",
  emptyMessage = "Aucun résultat.",
  className,
  id,
  disabled,
  "aria-label": ariaLabel,
}: {
  value: string;
  onValueChange: (value: string) => void;
  choices?: SelectChoice[];
  groups?: SelectGroup[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const all = [...choices, ...groups.flatMap((group) => group.options)];
  const selected = all.find((option) => option.value === value);

  const renderItem = (option: SelectChoice, nested = false) => (
    <CommandItem
      key={option.value}
      value={option.value}
      keywords={[option.label]}
      className={cn(nested && "pl-5")}
      onSelect={() => {
        onValueChange(option.value);
        setOpen(false);
      }}
    >
      {nested && <span className="text-soft">–</span>}
      <span className="truncate">{option.label}</span>
      <Check className={cn("ml-auto size-4", option.value === value ? "opacity-100" : "opacity-0")} />
    </CommandItem>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          role="combobox"
          variant="outline"
          aria-expanded={open}
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn(
            "h-10 w-full cursor-pointer justify-between gap-2 px-3 text-sm font-normal shadow-xs",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-[220px] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            {choices.length > 0 && <CommandGroup>{choices.map((option) => renderItem(option))}</CommandGroup>}
            {groups.map((group) => (
              <CommandGroup key={group.heading} heading={group.heading}>
                {group.options.map((option) => renderItem(option, true))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
