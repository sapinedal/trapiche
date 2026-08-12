import { Inbox } from "lucide-react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  /** Oculta la columna en la vista de tarjetas móvil. */
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyText?: string;
  loading?: boolean;
  dense?: boolean;
  getRowActions?: (row: T) => React.ReactNode;
  getRowIcon?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
}

function alignClass(align: Column<unknown>["align"]) {
  return align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
}

function renderCell<T>(row: T, col: Column<T>): React.ReactNode {
  if (col.render) return col.render(row);
  const value = (row as Record<string, unknown>)[col.key];
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  emptyText = "Sin registros",
  loading = false,
  dense = false,
  getRowActions,
  getRowIcon,
  onRowClick,
}: DataTableProps<T>) {
  const cellPadding = dense ? "px-3 py-2" : "px-4 py-3";

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white py-16 shadow-md">
        <Spinner />
        <span className="text-sm font-medium italic text-neutral-500">Preparando registros…</span>
      </div>
    );
  }

  const isEmpty = data.length === 0;

  return (
    <div className="w-full">
      {/* Vista móvil en tarjetas */}
      <div className="space-y-4 md:hidden">
        {isEmpty && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-200 bg-white py-12 text-neutral-500 shadow-sm">
            <Inbox className="size-10 text-neutral-300" />
            <p className="text-sm font-medium">{emptyText}</p>
          </div>
        )}
        {data.map((row) => (
          <div
            key={row.id}
            onClick={() => onRowClick?.(row)}
            className={cn(
              "space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm",
              onRowClick && "cursor-pointer transition-transform active:scale-[0.99]"
            )}
          >
            <div className="mb-2 flex items-center gap-2 border-b border-neutral-100 pb-2 font-bold text-neutral-800">
              {getRowIcon?.(row)}
              <span>{renderCell(row, columns[0])}</span>
            </div>

            <div className="space-y-2 text-sm">
              {columns.slice(1).filter((c) => !c.hideOnMobile).map((col) => (
                <div key={col.key} className="flex items-start justify-between gap-4">
                  <span className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    {col.header}
                  </span>
                  <span className="break-words text-right font-medium text-neutral-800">
                    {renderCell(row, col)}
                  </span>
                </div>
              ))}
            </div>

            {getRowActions && (
              <div className="mt-3 flex justify-end gap-2 border-t border-neutral-100 pt-3">
                {getRowActions(row)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Vista escritorio */}
      <div className="hidden overflow-hidden rounded-xl shadow-md ring-1 ring-neutral-200 transition-shadow duration-200 hover:shadow-lg md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50/80 text-xs uppercase tracking-wider text-neutral-600">
              <tr>
                {getRowIcon && <th className={cn(cellPadding, "w-10")} />}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={cn(cellPadding, "whitespace-nowrap font-bold", alignClass(col.align))}
                  >
                    {col.header}
                  </th>
                ))}
                {getRowActions && (
                  <th className={cn(cellPadding, "whitespace-nowrap text-center font-bold")}>
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isEmpty && (
                <tr>
                  <td
                    colSpan={columns.length + (getRowIcon ? 1 : 0) + (getRowActions ? 1 : 0)}
                    className="bg-neutral-50 py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-3 text-neutral-500">
                      <Inbox className="size-12 text-neutral-300" />
                      <span className="text-sm font-medium">{emptyText}</span>
                    </div>
                  </td>
                </tr>
              )}

              {data.map((row, index) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "transition-all duration-150 hover:bg-primary-50 hover:shadow-sm",
                    index % 2 === 0 ? "bg-white" : "bg-neutral-50/40",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {getRowIcon && <td className={cn(cellPadding, "text-center")}>{getRowIcon(row)}</td>}
                  {columns.map((col) => (
                    <td key={col.key} className={cn(cellPadding, alignClass(col.align))}>
                      {renderCell(row, col)}
                    </td>
                  ))}
                  {getRowActions && (
                    <td className={cn(cellPadding, "whitespace-nowrap text-center")}>
                      {getRowActions(row)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
