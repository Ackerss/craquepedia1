import Link from "next/link";
import { KeyRound } from "lucide-react";
import { and, eq, isNull, ne, sql as dsql } from "drizzle-orm";
import { db } from "@/db";
import { deliverables, intakes, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { ready } from "@/lib/data";
import { MobileBar, Sidebar } from "@/components/shell/Nav";
import { todayISO } from "@/lib/utils";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = await requireUser();
  await ready();
  const [[late], [received], [me]] = await Promise.all([
    db
      .select({ n: dsql<number>`count(*)::int` })
      .from(deliverables)
      .where(and(ne(deliverables.stage, "entregue"), dsql`${deliverables.dueDate} < ${todayISO()}`)),
    db
      .select({ n: dsql<number>`count(*)::int` })
      .from(intakes)
      .where(and(dsql`${intakes.submittedAt} is not null`, isNull(intakes.seenAt))),
    db.select({ temp: users.mustChangePassword }).from(users).where(eq(users.id, s.uid)).limit(1),
  ]);
  const counts = { "/entregas": late?.n ?? 0, "/formularios": received?.n ?? 0 };
  return (
    <div className="min-h-screen">
      <Sidebar name={s.name} counts={counts} />
      <MobileBar name={s.name} counts={counts} />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          {me?.temp ? (
            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <KeyRound className="size-4 shrink-0" />
              <span className="min-w-0 flex-1">Você está usando uma senha provisória. Crie uma senha só sua para proteger os dados dos atletas.</span>
              <Link href="/configuracoes#senha" className="btn btn-sm bg-amber-200 text-amber-950 hover:bg-amber-300">
                Trocar agora
              </Link>
            </div>
          ) : null}
          {children}
        </div>
      </main>
    </div>
  );
}
