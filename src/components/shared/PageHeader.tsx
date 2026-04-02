import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
    icon: LucideIcon;
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export function PageHeader({ icon: Icon, title, subtitle, actions }: PageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Icon size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-sm text-secondary-foreground font-medium">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {actions && (
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}
