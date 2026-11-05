import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RowActionButton({ onClick, label = "Modifier" }: { onClick: () => void; label?: string }) {
  return (
    <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={onClick} aria-label={label}>
      <MoreHorizontal size={16} />
    </Button>
  );
}
