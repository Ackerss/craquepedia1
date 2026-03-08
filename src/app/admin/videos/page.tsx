"use client";

import React, { useState } from "react";
import ServiceListPage from "@/components/admin/ServiceListPage";
import { supabase } from "@/lib/supabase/client";
import type { AthleteServiceWithAthlete } from "@/lib/supabase/types";
import { Save } from "lucide-react";

function VideoLinkInput({ service }: { service: AthleteServiceWithAthlete }) {
    const [url, setUrl] = useState<string>((service.data as Record<string, string>)?.video_url || "");
    const [saving, setSaving] = useState(false);

    const saveUrl = async () => {
        setSaving(true);
        await supabase
            .from("athlete_services")
            .update({
                data: { ...service.data, video_url: url },
                updated_at: new Date().toISOString(),
            })
            .eq("id", service.id);
        setSaving(false);
    };

    return (
        <div style={{ marginTop: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Link do Vídeo (YouTube / Drive)
            </label>
            <div style={{ display: "flex", gap: 8 }}>
                <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    style={{
                        flex: 1, padding: "8px 12px", borderRadius: 8,
                        border: "1.5px solid var(--border-color)", fontSize: 13,
                        fontFamily: "inherit", outline: "none",
                    }}
                />
                <button
                    onClick={saveUrl}
                    disabled={saving}
                    style={{
                        padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: "var(--primary-color)", color: "#fff", border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 4,
                    }}
                >
                    <Save size={14} /> {saving ? "..." : "Salvar"}
                </button>
            </div>
        </div>
    );
}

export default function VideosPage() {
    return (
        <ServiceListPage
            serviceType="video"
            title="Vídeos"
            subtitle="Organize os vídeos highlight de cada atleta — cole o link do YouTube ou Google Drive"
            icon="🎬"
            renderExtra={(service) => <VideoLinkInput service={service} />}
        />
    );
}
