import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { sendFeedback } from '../utils/functions';

const FeedbackModal = ({ isOpen, onClose }) => {
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const userDetail = JSON.parse(localStorage.getItem('userDetails'));

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
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

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const apiData = {
                user_id: userDetail?.UserID?.toString(),
                user_email: userDetail?.email,
                comment
            };

            const response = await sendFeedback(apiData);
            if (response?.data?.message === 'Feedback submitted and email sent.') {
                setLoading(false);
                setComment('');
                onClose();
                alert(response?.data?.message);
                
            }
        } catch (error) {
            setLoading(false);
            alert(error?.response?.data?.message ?? "Something went wrong");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                // Wrapper with highest z-index
                <div className="fixed inset-0 z-[9999] overflow-y-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black bg-opacity-70"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 w-full max-w-lg relative shadow-xl"
                        >
                            {/* Close Button */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                aria-label="Close modal"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </motion.button>

                            {/* Content */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h2 className="text-xl font-bold text-center text-gray-900">
                                    Feedback
                                </h2>

                                <p className="text-base text-gray-700 text-center mt-2">
                                    We value your input! Tell us what's working and where we can improve to make your therapy experience even better.
                                </p>

                                <textarea
                                    className="w-full h-40 bg-gray-50 mt-6 rounded-xl p-4 text-gray-900 resize-none 
                                             focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Add your feedback"
                                />

                                <div className="w-full flex justify-center">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`bg-black text-white rounded-full py-3 px-12 font-semibold
                                                  transition-all duration-300 mt-4
                                                  ${(!comment || comment.trim().length < 1)
                                                    ? 'bg-gray-200 cursor-not-allowed'
                                                    : 'bg-gray-900 hover:bg-gray-800'}`}
                                        onClick={handleSubmit}
                                        disabled={!comment || comment.trim().length < 1 || loading}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                                    <circle 
                                                        className="opacity-25" 
                                                        cx="12" 
                                                        cy="12" 
                                                        r="10" 
                                                        stroke="currentColor" 
                                                        strokeWidth="4" 
                                                        fill="none" 
                                                    />
                                                    <path 
                                                        className="opacity-75" 
                                                        fill="currentColor" 
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                                                    />
                                                </svg>
                                                Submitting...
                                            </span>
                                        ) : (
                                            'Submit'
                                        )}
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default FeedbackModal;