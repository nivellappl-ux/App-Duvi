import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        // 1. Verificar se o chamador é um Admin
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) throw new Error("Não autorizado");

        const { data: { user }, error: authError } = await createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
            global: { headers: { Authorization: authHeader } }
        }).auth.getUser();

        if (authError || !user) throw new Error("Sessão inválida");

        // Verificar permissão no DB
        const { data: hasPerm } = await supabase.rpc("has_permission", { _user_id: user.id, _permission: "user.create" });
        if (!hasPerm && user.email !== "admin@duvion.com") { // Admin bypass inicial para setup
            // Verificação secundária para aprovações
            const { data: hasApprovePerm } = await supabase.rpc("has_permission", { _user_id: user.id, _permission: "finance.approve" });
            const { action: reqAction } = await req.json();
            if (reqAction === "execute-approved" && !hasApprovePerm) throw new Error("Sem permissão de aprovação");
            if (reqAction !== "execute-approved") throw new Error("Proibido: Requer privilégios de Admin");
        }

        const body = await req.json();
        const { action } = body;

        if (action === "create-user") {
            const { email, password, fullName, role } = body;
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { full_name: fullName }
            });

            if (createError) throw createError;

            // Atribuir Role
            await supabase.from("user_roles").insert({ user_id: newUser.user.id, role: role || "visualizador" });

            return new Response(JSON.stringify({ ok: true, userId: newUser.user.id }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (action === "execute-approved") {
            const { requestId } = body;

            // 1. Buscar a solicitação
            const { data: request, error: fetchErr } = await supabase
                .from("operation_requests")
                .select("*")
                .eq("id", requestId)
                .single();

            if (fetchErr || !request) throw new Error("Solicitação não encontrada");
            if (request.status !== "aprovado") throw new Error("Operação não está aprovada para execução");

            // 2. Executar Lógica baseada no tipo
            if (request.operation_type === "pagamento") {
                const { fatura_id, valor, metodo } = request.payload;

                const { error: execErr } = await supabase.from("pagamentos").insert({
                    empresa_id: request.empresa_id,
                    fatura_id,
                    valor,
                    metodo,
                    criado_por: request.requester_id,
                    notas: `Executado via Workflow #${requestId}`
                });

                if (execErr) throw execErr;
            }

            // 3. Marcar como Concluído
            await supabase.from("operation_requests").update({ status: "concluido" }).eq("id", requestId);

            return new Response(JSON.stringify({ ok: true, message: "Operação executada com sucesso" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        throw new Error("Ação inválida");

    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
