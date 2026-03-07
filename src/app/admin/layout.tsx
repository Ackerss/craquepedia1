"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
    Trophy, LayoutDashboard, ClipboardList, Users, Plus,
    LogOut, Menu, X, ChevronRight
} from "lucide-react";

const NAV_ITEMS = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/cadastros", label: "Cadastros Recebidos", icon: ClipboardList },
    { href: "/admin/atletas", label: "Atletas", icon: Users },
    { href: "/admin/atletas/novo", label: "Novo Atleta", icon: Plus },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [user, setUser] = useState<string | null>(null);

    // Não renderizar layout no login
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user?.email || null);
        });
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* Sidebar */}
            <aside
                style={{
                    width: sidebarOpen ? 260 : 0,
                    background: "var(--bg-sidebar)",
                    color: "var(--text-sidebar)",
                    transition: "width 0.3s ease",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    zIndex: 100,
                }}
            >
                {/* Logo */}
                <div style={{ padding: "24px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border-sidebar)" }}>
                    <Trophy size={22} color="#fff" />
                    <span style={{ fontWeight: 800, fontSize: 18, color: "#fff", whiteSpace: "nowrap" }}>
                        CRAQUE<span style={{ color: "var(--primary-color)" }}>PEDIA</span>
                    </span>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: "16px 12px" }}>
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: "12px 16px",
                                    borderRadius: 10,
                                    marginBottom: 4,
                                    fontWeight: isActive ? 600 : 400,
                                    fontSize: 14,
                                    color: isActive ? "#fff" : "var(--text-sidebar)",
                                    background: isActive ? "rgba(37, 99, 235, 0.2)" : "transparent",
                                    textDecoration: "none",
                                    transition: "all 0.2s",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <item.icon size={18} />
                                {item.label}
                                {isActive && <ChevronRight size={14} style={{ marginLeft: "auto" }} />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Link para formulário público */}
                <div style={{ padding: "12px 12px", borderTop: "1px solid var(--border-sidebar)" }}>
                    <Link
                        href="/cadastro"
                        target="_blank"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 16px",
                            borderRadius: 8,
                            fontSize: 12,
                            color: "var(--text-sidebar)",
                            textDecoration: "none",
                            background: "rgba(255,255,255,0.05)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        📋 Formulário Público
                    </Link>
                </div>

                {/* User & Logout */}
                <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border-sidebar)" }}>
                    <div style={{ fontSize: 12, color: "var(--text-sidebar)", marginBottom: 8, padding: "0 16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user || "Admin"}
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 16px",
                            borderRadius: 8,
                            width: "100%",
                            color: "#ef4444",
                            fontSize: 13,
                            fontWeight: 500,
                            transition: "all 0.2s",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <LogOut size={16} /> Sair
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div style={{ flex: 1, marginLeft: sidebarOpen ? 260 : 0, transition: "margin 0.3s ease" }}>
                {/* Top Bar */}
                <header
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 24px",
                        background: "#fff",
                        borderBottom: "1px solid var(--border-color)",
                        position: "sticky",
                        top: 0,
                        zIndex: 50,
                    }}
                >
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{ padding: 8, borderRadius: 8, color: "var(--text-secondary)" }}
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <Link
                            href="/admin/atletas/novo"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "8px 16px",
                                background: "var(--primary-color)",
                                color: "#fff",
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 600,
                                textDecoration: "none",
                            }}
                        >
                            <Plus size={16} /> Novo Atleta
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{ background: "var(--bg-app)", minHeight: "calc(100vh - 56px)" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
