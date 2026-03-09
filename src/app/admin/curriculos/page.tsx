"use client";

import ServiceListPage from "@/components/admin/ServiceListPage";

export default function CurriculosPage() {
    return (
        <ServiceListPage
            serviceType="curriculo"
            title="Currículos"
            subtitle="Gerencie os currículos esportivos de cada atleta"
            icon="📄"
            hasDetailPage={true}
        />
    );
}
