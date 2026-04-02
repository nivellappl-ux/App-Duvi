interface StatusBadgeProps {
    status: string;
    type?: "success" | "warning" | "error" | "info" | "neutral";
}

const statusColors: Record<string, string> = {
    Paga: "#10B981",
    Ativo: "#10B981",
    Regular: "#10B981",
    Pendente: "#F59E0B",
    Licença: "#F59E0B",
    Vencida: "#EF4444",
    Inativo: "#6B7280",
    Irregular: "#EF4444",
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const color = statusColors[status] || "#6B7280";

    return (
        <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
            style={{
                backgroundColor: `${color}15`, // 15% opacity
                color: color
            }}
        >
            {status}
        </span>
    );
}
