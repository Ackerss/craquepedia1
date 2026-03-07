"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Trophy,
    Users,
    FileText,
    Briefcase,
    Layers,
    Settings,
    GitBranch,
    ClipboardList,
} from "lucide-react";
import styles from "./Sidebar.module.css";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Fluxo do Atleta", href: "/fluxo-atleta", icon: GitBranch },
    { name: "Atletas", href: "/atletas", icon: Users },
    { name: "Modalidades", href: "/modalidades", icon: Trophy },
    { name: "Formulários", href: "/formularios", icon: FileText },
    { name: "Entregas", href: "/entregas", icon: Briefcase },
    { name: "Templates", href: "/templates", icon: Layers },
    { name: "Tarefas", href: "/tarefas", icon: ClipboardList },
    { name: "Integração / Formulário", href: "/onboarding", icon: GitBranch },
];

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
    const pathname = usePathname();

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.collapsed}`}>
            <div className={styles.logoContainer}>
                <div className={styles.logoIcon}>
                    <Trophy size={24} color="var(--primary-color)" />
                </div>
                {isOpen && (
                    <h1 className={styles.logoText}>
                        CRAQUE<span>PEDIA</span>
                    </h1>
                )}
            </div>
            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {MENU_ITEMS.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (pathname.startsWith(item.href) && item.href !== "/");
                        const Icon = item.icon;
                        return (
                            <li key={item.name} className={styles.navItem}>
                                <Link
                                    href={item.href}
                                    className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                                    title={!isOpen ? item.name : undefined}
                                >
                                    <Icon size={20} className={styles.icon} />
                                    {isOpen && <span className={styles.navText}>{item.name}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
                <div className={styles.divider} />
                <ul className={styles.navList}>
                    <li className={styles.navItem}>
                        <Link
                            href="/configuracoes"
                            className={`${styles.navLink} ${pathname.startsWith("/configuracoes") ? styles.active : ""}`}
                            title={!isOpen ? "Configurações" : undefined}
                        >
                            <Settings size={20} className={styles.icon} />
                            {isOpen && <span className={styles.navText}>Configurações</span>}
                        </Link>
                    </li>
                </ul>
            </nav>
            {isOpen && (
                <div className={styles.userProfile}>
                    <div className={styles.avatar}>A</div>
                    <div className={styles.userInfo}>
                        <p className={styles.userName}>Admin Sports</p>
                        <p className={styles.userRole}>Gestor de Atletas</p>
                    </div>
                </div>
            )}
        </aside>
    );
}
