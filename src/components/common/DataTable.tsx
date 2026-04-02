import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

type Column<T> = {
  key: keyof T;
  label: string;
  render?: (val: any) => React.ReactNode;
};

export function DataTable<T extends Record<string, any>>({
  columns,
  rows,
  isLoading = false,
  enableSelection = false,
}: {
  columns: Column<T>[];
  rows: T[];
  isLoading?: boolean;
  enableSelection?: boolean;
}) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(rows.map((_, i) => i)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const toggleRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  return (
    <div className="rounded-md border border-border/70 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {enableSelection && (
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={selectedRows.size === rows.length && rows.length > 0}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead key={String(col.key)}>{col.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (enableSelection ? 1 : 0)}
                className="h-24 text-center"
              >
                <div className="flex items-center justify-center gap-2 text-muted-foreground animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Carregando dados...
                </div>
              </TableCell>
            </TableRow>
          ) : rows.map((row, idx) => (
            <TableRow key={idx} data-state={selectedRows.has(idx) ? "selected" : undefined}>
              {enableSelection && (
                <TableCell className="text-center">
                  <Checkbox
                    checked={selectedRows.has(idx)}
                    onCheckedChange={() => toggleRow(idx)}
                    aria-label={`Select row ${idx}`}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell key={String(col.key)}>
                  {col.render ? col.render(row[col.key]) : row[col.key] ?? "—"}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {!isLoading && rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columns.length + (enableSelection ? 1 : 0)}
                className="h-24 text-center text-muted-foreground"
              >
                Nenhum registo encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
