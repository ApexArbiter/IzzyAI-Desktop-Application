import React, { useState } from 'react';
import { motion } from 'framer-motion';
import moment from 'moment';
import { useDataContext } from '../contexts/DataContext';
import CustomHeader from '../components/CustomHeader';
import { useNavigate } from 'react-router-dom';

const ManageSubscriptions = ({ history }) => {
    const navigate = useNavigate()
    const { userDetail, updateUserDetail } = useDataContext();
    const [loader, setLoader] = useState(false);
    console.log(userDetail);

    const onCancelSubscription = async () => {
        try {
            setLoader(true);
            const response = await cancelSubscription(userDetail?.UserID, userDetail?.SubscriptionDetails?.SubscriptionID);
            if (response?.status === 200) {
                const responseData = await getUserInfo(userDetail?.UserID);
                updateUserDetail({
                    UserID: userDetail?.UserID,
                    FullName: responseData?.data?.UserProfile?.FullName,
                    Age: responseData?.data?.UserProfile?.Age,
                    AvatarID: responseData?.data?.UserProfile?.AvatarID,
                    email: userDetail?.email,
                    UserType: responseData?.data?.UserType?.UserType,
                    Gender: responseData?.data?.UserProfile?.Gender,
                    SubscriptionDetails: responseData?.data?.SubscriptionDetails,
                    DaysLeft: responseData?.data?.DaysLeft,
                    Amount: responseData?.data?.SubscriptionDetails?.Amount
                });
            }
        } catch (error) {
            console.error("Error cancelling subscription:", error);
        } finally {
            setLoader(false);
        }
    };

    const getRenewalText = () => {
        if (userDetail?.SubscriptionDetails?.Plan?.toLowerCase() === 'monthly') {
            return "Rolling monthly plan, renews automatically";
        }
        return "Annual plan, renews yearly";
    };

    const onPressCancel = () => {
        if (window.confirm('Are you sure you want to cancel subscription?')) {
            onCancelSubscription();
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            {/* <div className="bg-white shadow-sm p-4 flex items-center">
                <button
                    onClick={() => history.goBack()}
                    className="text-gray-600 hover:text-gray-800"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-semibold ml-4">Manage Subscriptions</h1>
            </div> */}
            <CustomHeader title="Manage Subscriptions" goBack={() => { navigate(-1) }} />

            {/* Main Content */}
            <div className="max-w-3xl mx-auto px-4 py-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">My Current Plan</h2>

                    {/* Plan Details Card */}
                    <motion.div
                        className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Current Plan</p>
                                <p className="text-2xl font-semibold text-blue-600">
                                    {userDetail?.SubscriptionDetails?.Plan?.toUpperCase() ?? "NO PLAN"}
                                </p>
                            </div>
                            <p className="text-xl font-medium text-gray-900">
                                ${userDetail?.Amount}<span className="text-gray-600">/month</span>
                            </p>
                        </div>

                        {userDetail?.SubscriptionDetails && (
                            <>
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Purchased on</p>
                                            <p className="font-medium">
                                                {moment(userDetail?.SubscriptionDetails?.PaymentDate).format("MMM D, YYYY")}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Expires on</p>
                                            <div className="flex items-center">
                                                <p className="font-medium">
                                                    {moment(userDetail?.SubscriptionDetails?.SubscriptionEndDate ?? new Date()).format("MMM D, YYYY")}
                                                </p>
                                                <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded">
                                                    {userDetail?.DaysLeft ?? 0} days left
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-full font-medium hover:bg-red-100 transition-colors"
                                        onClick={onPressCancel}
                                    >
                                        Cancel Plan
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-blue-600 rounded-full font-medium hover:bg-gray-50 transition-colors"
                                        onClick={() => history.push("/plans")}
                                    >
                                        {userDetail?.SubscriptionDetails ? "Upgrade Plan" : "Purchase Plan"}
                                    </motion.button>
                                </div>
                            </>
                        )}
                    </motion.div>

                    {/* Features Section */}
                    {userDetail?.SubscriptionDetails && (
                        <motion.div
                            className="mt-8 space-y-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <FeatureRow text="Unlimited 24/7 Access: Get round-the-clock availability to therapy whenever you need it." />
                            <FeatureRow text="Comprehensive Tools: Explore and use the full suite of speech therapy assessments and exercises" />
                            <FeatureRow text="Innovative Therapy: Engage in interactive, avatar-led therapy sessions for a personalized experience" />
                            <FeatureRow text={getRenewalText()} />
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Loading Overlay */}
            {loader && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                </div>
            )}
        </div>
    );
};

// Feature Row Component
const FeatureRow = ({ text }) => (
    <motion.div
        className="flex items-start gap-3"
        whileHover={{ x: 5 }}
        transition={{ duration: 0.2 }}
    >
        <svg
            className="w-5 h-5 text-green-500 mt-1 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
            />
        </svg>
        <p className="text-gray-700">{text}</p>
    </motion.div>
);

export default ManageSubscriptions;