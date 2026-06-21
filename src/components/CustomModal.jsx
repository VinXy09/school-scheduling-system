import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const CustomModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'confirm', // 'confirm', 'alert', 'error', 'success'
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  if (!isOpen) return null;

  const icons = {
    confirm: <Info className="text-blue-500" size={24} />,
    alert: <AlertCircle className="text-amber-500" size={24} />,
    error: <AlertCircle className="text-red-500" size={24} />,
    success: <CheckCircle2 className="text-emerald-500" size={24} />
  };

  const colors = {
    confirm: 'blue',
    alert: 'amber',
    error: 'red',
    success: 'emerald'
  };

  const themeColor = colors[type] || 'blue';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full shrink-0 ${themeColor === 'blue' ? 'bg-blue-50' : themeColor === 'amber' ? 'bg-amber-50' : themeColor === 'red' ? 'bg-red-50' : 'bg-emerald-50'}`}>
              {icons[type]}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 flex justify-end gap-3 px-6">
          {type === 'confirm' && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              if (type !== 'confirm') onClose();
            }}
            className={`px-6 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-all hover:shadow-md ${
              type === 'error' ? 'bg-red-600 hover:bg-red-700' : 
              type === 'alert' ? 'bg-amber-600 hover:bg-amber-700' :
              type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' :
              'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {type === 'confirm' ? confirmText : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
