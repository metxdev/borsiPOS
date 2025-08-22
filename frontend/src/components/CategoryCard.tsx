import React from "react";
import { Pencil, Trash2 } from "lucide-react";

export interface Props {
  name: string;
  count: number;
  active?: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const CategoryCard: React.FC<Props> = ({
  name,
  count,
  active,
  onClick,
  onEdit,
  onDelete,
}) => {
  return (
      <div
        onClick={onClick}
        className={`relative group max-w-[160px] w-full rounded-lg border backdrop-blur-md transition duration-200 shadow-sm cursor-pointer
          ${active
            ? "bg-accent/20 border-accent text-accent shadow-accent/20"
            : "bg-card/60 hover:bg-card/80 border-transparent text-light"
          }`}
      >
        {(onEdit || onDelete) && (
          <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1 bg-neutral-800 rounded hover:bg-accent text-white"
              >
                <Pencil size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 bg-neutral-800 rounded hover:bg-red-600 text-white"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}

        <div className="p-3">
          <div className="text-sm font-medium truncate">{name}</div>
          <div className={`text-xs mt-0.5 ${active ? "text-accent/80" : "text-muted"}`}>
            {count} item{count !== 1 && "s"}
          </div>
        </div>
      </div>

  );
};

export default CategoryCard;
