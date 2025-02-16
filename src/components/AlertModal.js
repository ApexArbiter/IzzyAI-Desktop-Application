import React, { useEffect, useNavigate } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, XCircle, Info } from 'lucide-react';

const AlertModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info',
  confirmText = 'OK',
  showCancel = false,
  cancelText = 'Cancel',
  onConfirm = () => {},
  onCancel = () => {}
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          // icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
          bgColor: 'bg-gray-50',
          // borderColor: 'border-green-200',
          buttonColor: 'bg-black hover:bg-gray-900'
        };
      case 'error':
        return {
          icon: <XCircle className="w-6 h-6 text-red-500" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          buttonColor: 'bg-red-500 hover:bg-red-600'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-6 h-6 text-yellow-500" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          buttonColor: 'bg-yellow-500 hover:bg-yellow-600'
        };
      default:
        return {
          icon: <Info className="w-6 h-6 text-blue-500" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          buttonColor: 'bg-blue-500 hover:bg-blue-600'
        };
    }
  };

  const { icon, bgColor, borderColor, buttonColor } = getIconAndColor();

  return (
    <AnimatePresence>
      {isOpen && (
        // Wrapper with higher z-index than bottom navigation
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className={`relative w-full max-w-sm rounded-lg ${bgColor} ${borderColor} border p-4 shadow-lg`}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="flex items-start gap-4">
                {icon}
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {message}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex gap-3 justify-end">
                {showCancel && (
                  <button
                    onClick={() => {
                      onCancel();
                      onClose();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonColor}`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AlertModal;