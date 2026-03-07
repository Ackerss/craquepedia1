"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import styles from "./MainLayout.module.css";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    return (
        <div className={styles.layoutContainer}>
            <Sidebar isOpen={isSidebarOpen} />
            <div className={`${styles.mainContent} ${isSidebarOpen ? '' : styles.expanded}`}>
                <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <main className={styles.pageContent}>
                    {children}
                </main>
            </div>
        </div>
    );
}
