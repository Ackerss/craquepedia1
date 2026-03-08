"use client";

import ServiceListPage from "@/components/admin/ServiceListPage";

export default function PortfoliosPage() {
    return (
        <ServiceListPage
            serviceType="portfolio"
            title="Portfólios"
            subtitle="Gerencie os portfólios digitais de cada atleta"
            icon="🎨"
        />
    );
}
