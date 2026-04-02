import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CountUp from "react-countup";
import { LucideIcon } from "lucide-react";

type KpiCardProps = {
  label: string;
  value?: string;
  amount?: number;
  isCurrency?: boolean;
  suffix?: string;
  hint?: string;
  icon?: LucideIcon;
  change?: string;
  trend?: "up" | "down";
  accent?: boolean;
};

export const KpiCard = ({
  label,
  value,
  amount,
  isCurrency,
  suffix,
  hint,
  icon: Icon,
  change,
  trend,
  accent
}: KpiCardProps) => {
  return (
    <Card className={`border-border/70 bg-card/80 shadow-elevated transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${accent ? 'border-l-4 border-primary' : ''}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</CardTitle>
        {Icon && (
          <div className="p-2 rounded bg-primary/10 text-primary">
            <Icon size={16} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-foreground">
          {amount !== undefined ? (
            <CountUp
              end={amount}
              duration={2.5}
              separator=" "
              decimal=","
              decimals={isCurrency ? 2 : 0}
              prefix={isCurrency ? "AOA " : ""}
              suffix={suffix || ""}
            />
          ) : (
            value
          )}
        </p>

        <div className="flex items-center gap-2 mt-1">
          {change && (
            <span className={`text-[11px] font-bold ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
              {change}
            </span>
          )}
          {hint && <span className="text-[11px] text-muted-foreground font-medium">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  );
};
