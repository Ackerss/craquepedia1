"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
    const router = useRouter();

    useEffect(() => {
        const autoLogin = async () => {
            // Auto-login silencioso a pedido do usuário para testar sem senhas
            await supabase.auth.signInWithPassword({
                email: "admin@craquepedia.com",
                password: "AdminCraquepedia2026!"
            });
            router.push("/admin");
            router.refresh();
        };
        autoLogin();
    }, [router]);

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
            padding: 24,
        }}>
            <div style={{ textAlign: "center", color: "#fff" }}>
                <Trophy size={48} color="var(--primary-color)" style={{ marginBottom: 24, margin: "0 auto" }} />
                <h2 style={{ marginBottom: 16 }}>Acessando o Sistema (Sem Senha)...</h2>
                <Loader2 size={32} style={{ animation: "spin 1s linear infinite", margin: "0 auto", color: "var(--primary-color)" }} />
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
