import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type RowActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  editLabel: string;
  deleteLabel: string;
};

/** Edit and delete, with labels a screen reader can tell apart. */
export const RowActions = ({ onEdit, onDelete, editLabel, deleteLabel }: RowActionsProps) => (
  <div className="flex shrink-0 gap-1">
    <Button size="sm" variant="ghost" onClick={onEdit} aria-label={editLabel}>
      <Pencil className="h-3.5 w-3.5" />
    </Button>
    <Button
      size="sm"
      variant="ghost"
      onClick={onDelete}
      aria-label={deleteLabel}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  </div>
);

export default RowActions;
