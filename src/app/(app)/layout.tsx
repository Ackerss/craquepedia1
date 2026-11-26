import { and, isNull, ne, sql as dsql } from "drizzle-orm";
import { db } from "@/db";
import { deliverables, intakes } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { ready } from "@/lib/data";
import { MobileBar, Sidebar } from "@/components/shell/Nav";
import { todayISO } from "@/lib/utils";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = await requireUser();
  await ready();
  const [[late], [received]] = await Promise.all([
    db
      .select({ n: dsql<number>`count(*)::int` })
      .from(deliverables)
      .where(and(ne(deliverables.stage, "entregue"), dsql`${deliverables.dueDate} < ${todayISO()}`)),
    db
      .select({ n: dsql<number>`count(*)::int` })
      .from(intakes)
      .where(and(dsql`${intakes.submittedAt} is not null`, isNull(intakes.seenAt))),
  ]);
  const counts = { "/entregas": late?.n ?? 0, "/formularios": received?.n ?? 0 };
  return (
    <div className="min-h-screen">
      <Sidebar name={s.name} counts={counts} />
      <MobileBar name={s.name} counts={counts} />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-9">{children}</div>
      </main>
    </div>
  );
}
