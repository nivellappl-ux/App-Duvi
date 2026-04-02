import { LucideIcon } from "lucide-react";

interface KPICardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    change?: string;
    trend?: "up" | "down";
    subtitle?: string;
    accent?: boolean;
}

export function KPICard({ title, value, icon: Icon, change, trend, subtitle, accent }: KPICardProps) {
    return (
        <div
            className={`p-4 rounded-lg flex flex-col justify-between h-32 transition-all hover:scale-[1.02] ${accent ? 'border-l-4 border-primary' : ''
                }`}
            style={{ backgroundColor: "#1A1A1A" }}
        >
            <div className="flex justify-between items-start">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-secondary-foreground">
                    {title}
                </span>
                <div className="p-2 rounded bg-secondary/50 text-primary">
                    <Icon size={16} />
                </div>
            </div>

            <div>
                <div className="text-2xl font-bold text-foreground">
                    {value}
                </div>
                {change && (
                    <div className={`text-[11px] font-medium mt-1 ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                        {change}
                    </div>
                )}
                {subtitle && (
                    <div className="text-[11px] text-secondary-foreground mt-1">
                        {subtitle}
                    </div>
                )}
            </div>
        </div>
    );
}
