import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ATLETAS, TAREFAS, FORMULARIOS_RECEBIDOS, MODALIDADES } from "./mockData";

export interface DashboardStore {
    atletas: typeof ATLETAS;
    tarefas: typeof TAREFAS;
    formularios: typeof FORMULARIOS_RECEBIDOS;
    modalidades: typeof MODALIDADES;

    // Actions Atletas
    addAtleta: (atleta: typeof ATLETAS[0]) => void;
    updateAtleta: (id: string, updates: Partial<typeof ATLETAS[0]>) => void;
    deleteAtleta: (id: string) => void;

    // Actions Tarefas
    addTarefa: (tarefa: typeof TAREFAS[0]) => void;
    updateTarefaStatus: (id: string, status: typeof TAREFAS[0]["status"]) => void;

    // Actions Formulários
    addFormulario: (form: typeof FORMULARIOS_RECEBIDOS[0]) => void;
    updateFormularioStatus: (id: string, status: typeof FORMULARIOS_RECEBIDOS[0]["status"]) => void;
}

export const useStore = create<DashboardStore>()(
    persist(
        (set) => ({
            atletas: ATLETAS,
            tarefas: TAREFAS,
            formularios: FORMULARIOS_RECEBIDOS,
            modalidades: MODALIDADES,

            addAtleta: (atleta) =>
                set((state) => ({ atletas: [...state.atletas, atleta] })),
            updateAtleta: (id, updates) =>
                set((state) => ({
                    atletas: state.atletas.map((a) => (a.id === id ? { ...a, ...updates } : a)),
                })),
            deleteAtleta: (id) =>
                set((state) => ({
                    atletas: state.atletas.filter((a) => a.id !== id),
                })),

            addTarefa: (tarefa) =>
                set((state) => ({ tarefas: [...state.tarefas, tarefa] })),
            updateTarefaStatus: (id, status) =>
                set((state) => ({
                    tarefas: state.tarefas.map((t) => (t.id === id ? { ...t, status } : t)),
                })),

            addFormulario: (form) =>
                set((state) => ({ formularios: [...state.formularios, form] })),
            updateFormularioStatus: (id, status) =>
                set((state) => ({
                    formularios: state.formularios.map((f) => (f.id === id ? { ...f, status } : f)),
                })),
        }),
        {
            name: "craquepedia-storage",
        }
    )
);
