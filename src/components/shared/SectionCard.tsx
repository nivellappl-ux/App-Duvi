interface SectionCardProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    noPadding?: boolean;
}

export function SectionCard({ title, subtitle, children, actions, noPadding }: SectionCardProps) {
    return (
        <div className="rounded-lg overflow-hidden border border-border" style={{ backgroundColor: "#1A1A1A" }}>
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card/30">
                <div>
                    <h3 className="font-bold text-foreground">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-xs text-secondary-foreground mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
            <div className={noPadding ? "" : "p-6"}>
                {children}
            </div>
        </div>
    );
}
