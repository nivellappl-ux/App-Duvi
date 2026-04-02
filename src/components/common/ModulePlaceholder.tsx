import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";

type ModulePlaceholderProps = {
  title: string;
  description: string;
};

export const ModulePlaceholder = ({ title, description }: ModulePlaceholderProps) => {
  return (
    <section>
      <PageHeader title={title} description={description} />
      <Card className="border-border/70 bg-card/80 shadow-elevated">
        <CardHeader>
          <CardTitle>Base da Entrega A pronta</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Este módulo já está preparado com autenticação, permissões e estrutura para a próxima entrega.
        </CardContent>
      </Card>
    </section>
  );
};
