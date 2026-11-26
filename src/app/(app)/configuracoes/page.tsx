import { getCompany, listPackages, listServices, listUsers } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { aiStatus, GEMINI_MODELS } from "@/lib/ai";
import { brl } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { AIForm, CompanyForm, NewUserForm, PackageBadge, PackageEditor, PasswordForm, ServiceEditor, SetPasswordButton } from "./forms";

export const metadata = { title: "Configurações" };
export const dynamic = "force-dynamic";

function Box({ title, desc, children, action, id }: { title: string; desc?: string; children: React.ReactNode; action?: React.ReactNode; id?: string }) {
  return (
    <section className="card scroll-mt-20" id={id}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {desc ? <p className="text-sm text-slate-500">{desc}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default async function Configuracoes() {
  const s = await requireUser();
  const [company, services, packages, users, ai] = await Promise.all([getCompany(), listServices(), listPackages(), listUsers(), aiStatus()]);
  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" subtitle="Serviços, pacotes, preços, acessos e dados da empresa." />

      <Box title="Pacotes" desc="Ao contratar um pacote, todas as entregas são criadas automaticamente." action={<PackageEditor services={services} />}>
        <div className="grid gap-3 md:grid-cols-3">
          {packages.map((p) => (
            <div key={p.id} className={`rounded-2xl border p-4 ${p.active ? "border-slate-200" : "border-dashed border-slate-300 opacity-60"}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xl font-bold text-brand-700">{brl(p.priceCents)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <PackageBadge highlight={p.highlight} />
                  <PackageEditor p={p} services={services} />
                </div>
              </div>
              <p className="mt-1 text-sm text-slate-500">{p.description}</p>
              <ul className="mt-2 space-y-0.5 text-sm text-slate-600">
                {p.serviceKeys.map((k) => (
                  <li key={k}>✓ {services.find((x) => x.key === k)?.name ?? k}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Box>

      <Box title="Serviços" desc="Preço avulso, prazo padrão e se está ativo." action={<ServiceEditor />}>
        <div className="divide-y divide-slate-100">
          {services.map((x) => (
            <div key={x.id} className={`flex items-center gap-3 py-2.5 ${x.active ? "" : "opacity-50"}`}>
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {x.name} {x.automatic ? <span className="badge ml-1 bg-violet-50 text-violet-700">automático</span> : null}
                </p>
                <p className="truncate text-sm text-slate-500">{x.description}</p>
              </div>
              <span className="text-sm text-slate-500">{x.defaultDays} dias</span>
              <span className="w-24 text-right font-semibold">{brl(x.priceCents)}</span>
              <ServiceEditor s={x} />
            </div>
          ))}
        </div>
      </Box>

      <div className="grid gap-6 xl:grid-cols-2">
        <Box title="Equipe" desc="Quem acessa a plataforma. Esqueceu a senha? Use Definir senha ao lado do nome.">
          <ul className="mb-4 space-y-2">
            {users.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex size-8 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: u.color }}>
                  {u.name[0]}
                </span>
                <span className="font-medium">{u.name}</span>
                <span className="text-sm text-slate-500">@{u.username}</span>
                {u.id === s.uid ? <span className="badge bg-slate-100 text-slate-600">você</span> : null}
                {u.mustChangePassword ? <span className="badge bg-amber-100 text-amber-800">senha provisória</span> : null}
                {u.id !== s.uid ? (
                  <span className="ml-auto">
                    <SetPasswordButton userId={u.id} name={u.name} />
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
          <NewUserForm />
        </Box>
        <Box id="senha" title="Minha senha">
          <PasswordForm />
        </Box>
      </div>

      <Box id="ia" title="Inteligência artificial" desc="Organiza os formulários, revisa os perfis e escreve textos. Use a chave grátis do Gemini para economizar.">
        <AIForm status={ai} models={GEMINI_MODELS.map((m) => ({ id: m.id, label: m.label }))} />
      </Box>

      <Box title="Dados da empresa" desc="Aparecem no rodapé dos currículos e nas mensagens.">
        <CompanyForm c={company} />
      </Box>
    </div>
  );
}
