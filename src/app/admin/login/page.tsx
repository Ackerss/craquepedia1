"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError("E-mail ou senha incorretos. Tente novamente.");
            setLoading(false);
        } else {
            router.push("/admin");
            router.refresh();
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
            padding: 24,
        }}>
            <div style={{
                width: "100%",
                maxWidth: 420,
                background: "#fff",
                borderRadius: 20,
                padding: "48px 40px",
                boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
            }}>
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        fontWeight: 800,
                        fontSize: 24,
                        marginBottom: 12,
                    }}>
                        <Trophy size={28} color="var(--primary-color)" />
                        CRAQUE<span style={{ color: "var(--primary-color)" }}>PEDIA</span>
                    </div>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                        Acesse a área administrativa
                    </p>
                </div>

                <form onSubmit={handleLogin}>
                    {error && (
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "12px 16px",
                            background: "rgba(239, 68, 68, 0.08)",
                            color: "#ef4444",
                            borderRadius: 10,
                            fontSize: 13,
                            fontWeight: 500,
                            marginBottom: 24,
                        }}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>E-mail</label>
                        <div style={{ position: "relative" }}>
                            <Mail size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "13px 16px 13px 44px",
                                    borderRadius: 10,
                                    border: "1.5px solid var(--border-color)",
                                    fontSize: 14,
                                    fontFamily: "inherit",
                                    outline: "none",
                                }}
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: 28 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Senha</label>
                        <div style={{ position: "relative" }}>
                            <Lock size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "13px 16px 13px 44px",
                                    borderRadius: 10,
                                    border: "1.5px solid var(--border-color)",
                                    fontSize: 14,
                                    fontFamily: "inherit",
                                    outline: "none",
                                }}
                                placeholder="Sua senha"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "14px",
                            background: loading ? "#94a3b8" : "var(--primary-color)",
                            color: "#fff",
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 15,
                            cursor: loading ? "not-allowed" : "pointer",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            transition: "all 0.2s",
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Entrando...
                            </>
                        ) : (
                            "Entrar"
                        )}
                    </button>
                </form>
            </div>

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:focus { border-color: var(--primary-color) !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.15) !important; }
      `}</style>
        </div>
    );
}
