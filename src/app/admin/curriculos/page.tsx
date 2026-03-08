"use client";

import ServiceListPage from "@/components/admin/ServiceListPage";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { AthleteServiceWithAthlete } from "@/lib/supabase/types";

export default function CurriculosPage() {
    return (
        <ServiceListPage
            serviceType="curriculo"
            title="Currículos"
            subtitle="Gerencie os currículos esportivos de cada atleta"
            icon="📄"
            hasDetailPage={true}
            renderExtra={(service: AthleteServiceWithAthlete) => (
                <Link
                    href={`/admin/curriculos/${service.athletes.id}`}
                    style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        padding: "10px 16px", borderRadius: 10,
                        background: "linear-gradient(135deg, var(--primary-color), #7c3aed)",
                        color: "#fff", fontSize: 13, fontWeight: 600,
                        textDecoration: "none", transition: "all 0.2s",
                    }}
                >
                    📄 Abrir Currículo <ArrowRight size={14} />
                </Link>
            )}
        />
    );
}
