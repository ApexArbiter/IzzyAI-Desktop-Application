import React, { useState } from 'react';
import { motion } from 'framer-motion';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '../contexts/DataContext';
import CustomHeader from '../components/CustomHeader';
import { CheckCircle, Info } from 'lucide-react';

// Helper function exactly as provided in the utils
const getSubscriptionDetails = (user) => {
  if (!user?.SubscriptionDetails) {
    return {
      title: "You'are currently on the Basic Tiel, which includes:",
      desc1: "Access to IzzyAI assessmenets Unlock the full benefits of IzzyAI Unlimited anytime, including:",
      desc2: "Unlimited therapy sessions",
      desc3: "Advances insights and prpgress tracking.",
      desc4: "Priority access to new features",
      plan_text: "Free Trial",
      header_title: "Basic",
    }
  }
  if (user?.SubscriptionDetails && user?.SubscriptionDetails?.Status === 'Trial') {
    return {
      title: "Enjoy to all therapy features:",
      desc1: "Access to all AI therapy features",
      desc2: "Personalized insights and progress tracking.",
      desc3: "Interactive therapy games designed to support your growth and development.",
      bottom_desc: "After your trial ends, you will automatically switch to IzzyAI Unlimited - Monthly",
      plan_text: "Free Trial",
      header_title: "Free Trial",
    }
  }
  return {
    title: "Thankyou for being an Unlimited user! Here's what you're enjoying:",
    desc1: "Unlimited access to all therapy features",
    desc2: "Personalized insights and progress tracking.",
    desc3: "24/7 AI powered therapy.",
    desc4: "Interactive therapy games designed to support your growth and development.",
    plan_text: "Unlimited",
    header_title: "Unlimited",
  }
};

const ManageSubscriptions = () => {
  const navigate = useNavigate();
  const { userDetail, updateUserDetail } = useDataContext();
  const [loader, setLoader] = useState(false);

  const onCancelSubscription = async () => {
    try {
      setLoader(true);
      const response = await cancelSubscription(
        userDetail?.UserID, 
        userDetail?.SubscriptionDetails?.SubscriptionID
      );
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

  const onPressCancel = () => {
    if (window.confirm('Are you sure you want to cancel subscription?')) {
      onCancelSubscription();
    }
  };

  const details = getSubscriptionDetails(userDetail);

  return (
    <div className="min-h-screen bg-white">
      <CustomHeader 
        title={`IzzyAI ${details.header_title}`} 
        goBack={() => navigate(-1)} 
      />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="text-2xl font-semibold text-gray-900 mt-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            My Current Plan
          </motion.h2>

          <motion.div 
            className="mt-6 p-6 border rounded-xl shadow-sm bg-white"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-900">PLAN TYPE:</p>
                <p className="text-lg font-semibold text-green-600">
                  IzzyAI {details.plan_text}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">STATUS:</p>
                <p className="text-lg font-semiboldtext-green-600">
                  {userDetail?.SubscriptionDetails?.Status || 'Active'}
                </p>
              </div>
            </div>

            {userDetail?.SubscriptionDetails && userDetail.SubscriptionDetails.Status !== 'Trial' && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-900">FREQUENCY:</p>
                <p className="text-lg font-semibold text-green-600">
                  {userDetail?.SubscriptionDetails?.Plan || 'Monthly/Annual'}
                </p>
              </div>
            )}

            {userDetail?.SubscriptionDetails && (
              <div className="mt-4 flex flex-wrap gap-6 justify-between">
                <div>
                  <p className="text-sm text-gray-600">Purchased on</p>
                  <p className="text-sm font-medium text-gray-900">
                    {moment(userDetail.SubscriptionDetails.PaymentDate).format("MMM D, YYYY")}
                  </p>
                </div>
                <div className='flex items-start'>
                 <div>
                 <p className="text-sm text-gray-600">Expires on</p>
                  <p className="text-sm font-medium text-gray-900">
                    {moment(userDetail.SubscriptionDetails.SubscriptionEndDate).format("MMM D, YYYY")}
                  </p>
                 </div>
                <div className="px-3 py-1 text-xs font-medium   text-orange-700 bg-orange-100 rounded-md border border-orange-200 ">
                  {userDetail.DaysLeft} days
                </div>
                </div>
              </div>
            )}

            {/* <div className="flex gap-4 mt-8">
              {userDetail?.SubscriptionDetails && (
                <motion.button
                  className="flex items-center justify-center gap-2 flex-1 px-6 py-3 text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
                  onClick={onPressCancel}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Info className="w-5 h-5" />
                  <span>Cancel Plan</span>
                </motion.button>
              )}
              <motion.button
                className="flex-1 px-6 py-3 text-blue-600 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                onClick={() => navigate('/plans')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {userDetail?.SubscriptionDetails ? "Upgrade Plan" : "Purchase Plan"}
              </motion.button>
            </div> */}
          </motion.div>

          <motion.div 
            className="mt-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {details.title}
            </h3>

            <div className="space-y-4">
              {[details.desc1, details.desc2, details.desc3, details.desc4]
                .filter(Boolean)
                .map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <p className="text-gray-700">{feature}</p>
                  </motion.div>
                ))}
            </div>

            {details.bottom_desc && (
              <motion.p 
                className="mt-6 text-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {details.bottom_desc}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </div>

      {loader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubscriptions;