import React from 'react';

const OTPVerificationModal = ({ visible, email, onClose, onResend }) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white w-[90%] max-w-md rounded-2xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <div className="flex flex-col items-center space-y-4">
                    <div className="w-32  mb-2">
                        <img
                            src={require("../assets/images/logo.png")}
                            alt="Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <h2 className="text-xl font-bold text-center">Check Your Email to Verify Your Account!</h2>

                    <p className="text-center text-gray-600">
                        We've sent a verification email to <span className='text-gray-800 font-semibold' >{email}</span>. Please open it and click the link to activate your account.
                    </p>

                    <button
                        onClick={onResend}
                        className="text-blue-500 font-medium hover:text-blue-700"
                    >
                        Didn't receive it? Resend Email
                    </button>

                    <p className="text-center text-gray-600 text-sm mt-4">
                        Need to update your email? Contact us at hello@izzyai.com.
                    </p>

                    <p className="text-center text-gray-600 text-sm">
                        Once verified, you can continue setting up your account.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OTPVerificationModal;