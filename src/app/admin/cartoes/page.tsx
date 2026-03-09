"use client";

import ServiceListPage from "@/components/admin/ServiceListPage";

export default function CartoesPage() {
    return (
        <ServiceListPage
            serviceType="cartao"
            title="Cartões de Apresentação"
            subtitle="Gerencie os cartões de apresentação digital de cada atleta"
            icon="💳"
            hasDetailPage={true}
        />
    );
}
