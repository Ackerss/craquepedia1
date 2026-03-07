import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cadastro de Atleta | CRAQUEPEDIA",
    description: "Cadastre-se na plataforma Craquepedia — preencha seus dados esportivos e receba seu portfólio profissional.",
};

export default function CadastroLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
            {children}
        </div>
    );
}
