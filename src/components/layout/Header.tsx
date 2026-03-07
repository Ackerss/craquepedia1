"use client";

import React from "react";
import { Menu, Search, Bell } from "lucide-react";
import styles from "./Header.module.css";
import { usePathname } from "next/navigation";

export default function Header({ toggleSidebar, isSidebarOpen }: { toggleSidebar: () => void; isSidebarOpen: boolean; }) {
    const pathname = usePathname();
    const getPageTitle = () => {
        if (pathname === "/") return "Dashboard";
        const path = pathname.split("/")[1];
        return path.charAt(0).toUpperCase() + path.slice(1);
    };

    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <button onClick={toggleSidebar} className={styles.menuButton} aria-label="Alternar Menu"><Menu size={24} color="var(--text-secondary)" /></button>
                <h2 className={styles.pageTitle}>{getPageTitle()}</h2>
            </div>
            <div className={styles.rightSection}>
                <div className={styles.searchBar}>
                    <Search size={18} className={styles.searchIcon} />
                    <input type="text" placeholder="Buscar atletas, formulários..." className={styles.searchInput} />
                </div>
                <button className={styles.iconButton}><Bell size={20} color="var(--text-secondary)" /><span className={styles.badge}>3</span></button>
            </div>
        </header>
    );
}
