import React from "react";
import { Button } from "./button";

interface CustomAlertProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm: () => void;
  variant?: "1-button" | "2-button" | "1-button-text";
}

export function CustomAlert({
  isOpen,
  title,
  description,
  cancelText = "취소",
  confirmText = "확인",
  onCancel,
  onConfirm,
  variant = "2-button"
}: CustomAlertProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-[320px] p-6 flex flex-col items-center animate-in zoom-in-95 duration-200">
        <h2 className="text-lg font-bold text-slate-900 text-center mb-2">{title}</h2>
        <div className="text-sm text-slate-500 text-center mb-6 leading-relaxed whitespace-pre-wrap">
          {description}
        </div>
        
        <div className="flex w-full gap-3">
          {variant === "2-button" && onCancel && (
            <Button 
              variant="outline" 
              className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 border-none text-slate-700 font-bold"
              onClick={onCancel}
            >
              {cancelText}
            </Button>
          )}
          <Button 
            className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-black text-white font-bold"
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
        {variant === "1-button-text" && onCancel && (
          <button 
            className="mt-4 text-xs text-slate-400 hover:text-slate-600 underline underline-offset-4 font-medium transition-colors"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        )}
      </div>
    </div>
  );
}
