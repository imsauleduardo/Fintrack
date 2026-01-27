"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Landmark, CreditCard, Loader2, Camera, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAssets, deleteAsset } from "@/lib/actions/assets";
import { getLiabilities, deleteLiability } from "@/lib/actions/liabilities";
import { getNetWorthHistory, saveNetWorthSnapshot } from "@/lib/actions/net-worth";
import Modal from "@/components/ui/Modal";
import AssetForm from "@/components/features/assets/AssetForm";
import LiabilityForm from "@/components/features/liabilities/LiabilityForm";
import NetWorthChart from "@/components/features/dashboard/NetWorthChart";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "@/components/ui/Toast";
import DashboardHeader from "@/components/layouts/DashboardHeader";

export default function NetWorthPage() {
    const [assets, setAssets] = useState<any[]>([]);
    const [liabilities, setLiabilities] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [modal, setModal] = useState<{ open: boolean, type: 'asset' | 'liability' | null }>({ open: false, type: null });
    const router = useRouter();

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setIsLoading(true);
        const [aData, lData, hData] = await Promise.all([
            getAssets(),
            getLiabilities(),
            getNetWorthHistory()
        ]);
        setAssets(aData);
        setLiabilities(lData);
        setHistory(hData);
        setIsLoading(false);
    };

    const handleSaveSnapshot = async () => {
        setIsSavingSnapshot(true);
        try {
            await saveNetWorthSnapshot();
            await loadData();
            setToast({ message: "Foto de patrimonio guardada", type: 'success' });
        } catch (e: any) {
            setToast({ message: e.message, type: 'error' });
        } finally {
            setIsSavingSnapshot(false);
        }
    };

    const handleDelete = async (id: string, type: 'asset' | 'liability') => {
        if (!confirm("¿Eliminar este registro?")) return;
        if (type === 'asset') await deleteAsset(id);
        else await deleteLiability(id);
        loadData();
    };

    const totalAssets = assets.reduce((acc, a) => acc + Number(a.balance), 0);
    const totalLiabs = liabilities.reduce((acc, l) => acc + Number(l.balance), 0);

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <DashboardHeader
                user={{ name: "Saúl", avatarLetter: "S" }}
                label="Patrimonio Neto"
                title="Evolución y Balance"
            />

            <div className="px-6 relative">
                <button
                    onClick={handleSaveSnapshot}
                    disabled={isSavingSnapshot}
                    className="absolute -top-16 right-6 p-4 bg-primary/10 text-primary rounded-2xl border border-primary/20 active:scale-95 transition-all z-10"
                    title="Guardar foto actual"
                >
                    {isSavingSnapshot ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                </button>

                {isLoading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
                ) : (
                    <div className="space-y-12">
                        {/* Resumen y Gráfico */}
                        <section className="space-y-8">
                            <div className="p-8 bg-gradient-to-br from-primary to-indigo-700 rounded-[40px] text-white text-center shadow-xl shadow-primary/20">
                                <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Tu Valor Total</p>
                                <h2 className="text-5xl font-black tabular-nums">${(totalAssets - totalLiabs).toLocaleString()}</h2>
                            </div>

                            <div className="bg-card border border-border rounded-[40px] p-8">
                                <div className="flex items-center gap-2 mb-8">
                                    <History className="w-4 h-4 text-primary" />
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Evolución Histórica</h3>
                                </div>
                                <NetWorthChart data={history} />
                            </div>
                        </section>

                        {/* Activos */}
                        <section className="space-y-6">
                            <div className="flex justify-between items-center px-2">
                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Activos (${totalAssets.toLocaleString()})</h3>
                                <button onClick={() => setModal({ open: true, type: 'asset' })} className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20 active:scale-95 transition-all">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {assets.length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground text-xs font-bold uppercase tracking-widest bg-card rounded-3xl border border-dashed border-border">No hay activos registrados</p>
                                ) : (
                                    assets.map(a => (
                                        <div key={a.id} className="p-5 bg-card border border-border rounded-[32px] flex items-center justify-between group hover:bg-muted/50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500"><Landmark className="w-5 h-5" /></div>
                                                <div>
                                                    <p className="font-bold text-sm tracking-tight">{a.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{a.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="font-black text-lg tabular-nums">${Number(a.balance).toLocaleString()}</p>
                                                <button onClick={() => handleDelete(a.id, 'asset')} className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Pasivos */}
                        <section className="space-y-6 pb-12">
                            <div className="flex justify-between items-center px-2">
                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Pasivos (${totalLiabs.toLocaleString()})</h3>
                                <button onClick={() => setModal({ open: true, type: 'liability' })} className="p-2 bg-red-600/10 text-red-500 rounded-xl border border-red-500/20 active:scale-95 transition-all">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {liabilities.length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground text-xs font-bold uppercase tracking-widest bg-card rounded-3xl border border-dashed border-border">No hay pasivos registrados</p>
                                ) : (
                                    liabilities.map(l => (
                                        <div key={l.id} className="p-5 bg-card border border-border rounded-[32px] flex items-center justify-between group hover:bg-muted/50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-red-500/10 rounded-2xl text-red-500"><CreditCard className="w-5 h-5" /></div>
                                                <div>
                                                    <p className="font-bold text-sm tracking-tight">{l.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{l.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="font-black text-lg tabular-nums text-red-500">-${Number(l.balance).toLocaleString()}</p>
                                                <button onClick={() => handleDelete(l.id, 'liability')} className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>

            <Modal
                isOpen={modal.open}
                onClose={() => setModal({ open: false, type: null })}
                title={modal.type === 'asset' ? "Nuevo Activo" : "Nuevo Pasivo"}
            >
                {modal.type === 'asset' ? (
                    <AssetForm onSuccess={() => { setModal({ open: false, type: null }); loadData(); }} />
                ) : (
                    <LiabilityForm onSuccess={() => { setModal({ open: false, type: null }); loadData(); }} />
                )}
            </Modal>

            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </div>
    );
}