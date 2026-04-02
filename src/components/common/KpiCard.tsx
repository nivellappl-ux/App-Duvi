import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CountUp from "react-countup";

type KpiCardProps = {
  label: string;
  value?: string;
  amount?: number;
  isCurrency?: boolean;
  suffix?: string;
  hint?: string;
};

export const KpiCard = ({ label, value, amount, isCurrency, suffix, hint }: KpiCardProps) => {
  return (
    <Card className="border-border/70 bg-card/80 shadow-elevated transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-foreground">
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
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
};
