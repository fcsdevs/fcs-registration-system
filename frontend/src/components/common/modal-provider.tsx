"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ModalType = 'alert' | 'confirm' | 'custom';

interface ModalOptions {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'info' | 'warning' | 'danger' | 'success';
    content?: ReactNode;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface ModalContextType {
    showModal: (options: ModalOptions) => void;
    hideModal: () => void;
    confirm: (message: string, title?: string, type?: 'info' | 'warning' | 'danger') => Promise<boolean>;
    alert: (message: string, title?: string, type?: 'info' | 'warning' | 'success') => Promise<void>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ModalOptions & { modalType: ModalType }>({
        modalType: 'alert',
    });
    const [resolver, setResolver] = useState<{ resolve: (value: any) => void } | null>(null);

    const hideModal = useCallback(() => {
        setIsOpen(false);
        if (resolver) {
            resolver.resolve(false);
            setResolver(null);
        }
    }, [resolver]);

    const showModal = useCallback((opts: ModalOptions) => {
        setOptions({ ...opts, modalType: 'custom' });
        setIsOpen(true);
    }, []);

    const confirm = useCallback((message: string, title: string = 'Confirm Action', type: 'info' | 'warning' | 'danger' = 'warning'): Promise<boolean> => {
        setOptions({
            title,
            message,
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            type,
            modalType: 'confirm'
        });
        setIsOpen(true);
        return new Promise((resolve) => {
            setResolver({ resolve });
        });
    }, []);

    const alert = useCallback((message: string, title: string = 'Notice', type: 'info' | 'warning' | 'success' = 'info'): Promise<void> => {
        setOptions({
            title,
            message,
            confirmText: 'OK',
            type,
            modalType: 'alert'
        });
        setIsOpen(true);
        return new Promise((resolve) => {
            setResolver({ resolve: () => resolve() });
        });
    }, []);

    const handleConfirm = () => {
        if (options.onConfirm) options.onConfirm();
        if (resolver) {
            resolver.resolve(true);
            setResolver(null);
        }
        setIsOpen(false);
    };

    const handleCancel = () => {
        if (options.onCancel) options.onCancel();
        if (resolver) {
            resolver.resolve(false);
            setResolver(null);
        }
        setIsOpen(false);
    };

    return (
        <ModalContext.Provider value={{ showModal, hideModal, confirm, alert }}>
            {children}
            {isOpen && (
                <GlobalModalComponent
                    options={options}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    onClose={handleCancel}
                />
            )}
        </ModalContext.Provider>
    );
}

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

// Internal Component for the Modal UI
import { AlertCircle, CheckCircle2, Info, X, HelpCircle, AlertTriangle } from 'lucide-react';

function GlobalModalComponent({ options, onConfirm, onCancel, onClose }: {
    options: ModalOptions & { modalType: ModalType },
    onConfirm: () => void,
    onCancel: () => void,
    onClose: () => void
}) {
    const Icon = {
        info: Info,
        warning: AlertTriangle,
        danger: AlertCircle,
        success: CheckCircle2,
    }[options.type || 'info'];

    const colors = {
        info: 'text-blue-600 bg-blue-50 border-blue-100',
        warning: 'text-amber-600 bg-amber-50 border-amber-100',
        danger: 'text-red-600 bg-red-50 border-red-100',
        success: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    }[options.type || 'info'];

    const btnColors = {
        info: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
        warning: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
        danger: 'bg-red-600 hover:bg-red-700 shadow-red-200',
        success: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
    }[options.type || 'info'];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-slate-100 mt-[-10vh]">
                {/* Header Gradient */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${options.type === 'danger' ? 'from-red-500 to-rose-400' :
                        options.type === 'warning' ? 'from-amber-500 to-orange-400' :
                            options.type === 'success' ? 'from-emerald-500 to-teal-400' :
                                'from-[#060CCD] to-indigo-400'
                    }`} />

                <div className="p-8">
                    <div className="flex flex-col items-center text-center">
                        {/* Icon Circle */}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm border ${colors}`}>
                            <Icon size={32} strokeWidth={2.5} />
                        </div>

                        {options.title && (
                            <h3 className="text-xl font-black text-[#0F172A] tracking-tight mb-2 uppercase">
                                {options.title}
                            </h3>
                        )}

                        <p className="text-[#64748B] font-medium leading-relaxed">
                            {options.message}
                        </p>

                        {options.content && (
                            <div className="mt-4 w-full">
                                {options.content}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                        <button
                            onClick={onConfirm}
                            className={`w-full py-4 px-6 rounded-2xl text-white font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 ${btnColors}`}
                        >
                            {options.confirmText || 'Confirm'}
                        </button>

                        {options.modalType === 'confirm' && (
                            <button
                                onClick={onCancel}
                                className="w-full py-4 px-6 rounded-2xl text-[#64748B] font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-100 active:scale-95"
                            >
                                {options.cancelText || 'Cancel'}
                            </button>
                        )}
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-all"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
