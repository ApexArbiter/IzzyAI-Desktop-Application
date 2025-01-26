import React, { useState } from 'react';
import CustomHeader from '../components/CustomHeader';
import { COLORS, fonts } from '../theme';
import { info_icon, tick_icon } from '../assets/icons';
import { useDataContext } from '../contexts/DataContext';
import CustomButton from '../components/Button';
import moment from 'moment';
import { cancelSubscription, getUserInfo } from '../utils/functions';
import LoaderModal from '../components/LoaderModal';

const ManageSubscriptions = ({ history }) => {
    const { userDetail, updateUserDetail } = useDataContext();

    const [loader, setLoader] = useState(false);

    const getPrice = () => {
        if (!userDetail?.SubscriptionDetails || (userDetail?.SubscriptionDetails && userDetail?.SubscriptionDetails?.Status === 'Free Trial')) {
            return {
                price: "0",
                toFixed: "00"
            };
        }
        if (userDetail?.SubscriptionDetails?.Plan?.toLowerCase() === 'monthly') {
            return {
                price: "152",
                toFixed: "00"
            };
        }
        return {
            price: "881",
            toFixed: "00"
        };
    };

    const onCancelSubscription = async () => {
        try {
            setLoader(true);
            const response = await cancelSubscription(userDetail?.UserID, userDetail?.SubscriptionDetails?.SubscriptionID);
            if (response?.status === 200) {
                const responseData = await getUserInfo(userDetail?.UserID);
                console.log("responseData", responseData);
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
            console.error("Error cancelling subscription", error);
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
        // Alert.alert('Cancel Subscription', 'Are you sure you want to cancel subscription?', [
        //     {
        //         text: 'Cancel',
        //         onPress: () => { },
        //         style: 'cancel',
        //     },
        //     { text: 'OK', onPress: () => onCancelSubscription() },
        // ]);
        alert('Cancel Subscription')
    };

    return (
        <div style={styles.safeArea}>
            <CustomHeader goBack={() => history.goBack()} title={"Manage Subscriptions"} />
            <div style={styles.mainView}>
                <div style={styles.scrollContainer}>
                    <h2 style={styles.heading}>My Current Plan</h2>

                    <div style={styles.detailView}>
                        <p style={styles.currentText}>Current Plan</p>
                        <div style={styles.row}>
                            <p style={styles.planText}>{userDetail?.SubscriptionDetails?.Plan?.toUpperCase() ?? "NO PLAN"}</p>
                            <p style={styles.priceText}>$ <span style={styles.planText}>{userDetail?.Amount}</span>/month</p>
                        </div>

                        {
                            userDetail?.SubscriptionDetails &&
                            <>
                                <div style={{ marginTop: 6 }}>
                                    <p style={styles.keyText}>Status</p>
                                    <p style={{ ...styles.valueText, color: COLORS.primary }}>{userDetail?.SubscriptionDetails?.Status?.toUpperCase()}</p>
                                </div>
                                <div style={styles.paymentRow}>
                                    <div>
                                        <p style={styles.keyText}>Purchased on</p>
                                        <p style={styles.valueText}>{moment(userDetail?.SubscriptionDetails?.PaymentDate).format("MMM D, YYYY")}</p>
                                    </div>
                                    <div style={{ width: 50 }} />
                                    <div>
                                        <p style={styles.keyText}>Expires on</p>
                                        <p style={styles.valueText}>{moment(userDetail?.SubscriptionDetails?.SubscriptionEndDate ?? new Date()).format("MMM D, YYYY")}</p>
                                    </div>
                                    <div style={styles.daysView}>
                                        <p style={styles.dayText}>{`${userDetail?.DaysLeft ?? 0} days`}</p>
                                    </div>
                                </div>
                            </>
                        }

                        <div style={{ height: 12 }} />

                        <div style={styles.row}>
                            {
                                userDetail?.SubscriptionDetails &&
                                <button onClick={onPressCancel} style={styles.cancelPlanBtn}>
                                    <img src={info_icon} alt="info" />
                                    <span style={styles.cancelPlanText}>Cancel Plan</span>
                                </button>
                            }

                            <button onClick={() => history("Plans")} style={styles.upgradePlanBtn}>
                                <span style={styles.upgradePlanText}>{userDetail?.SubscriptionDetails ? "Upgrade Plan" : "Purchase Plan"}</span>
                            </button>
                        </div>
                    </div>

                    <div style={{ height: 20 }} />
                    {
                        userDetail?.SubscriptionDetails &&
                        <>
                            <div style={styles.textRow}>
                                <img src={tick_icon} alt="tick" />
                                <span style={styles.rowText}>Unlimited 24/7 Access: Get round-the-clock availability to therapy whenever you need it.</span>
                            </div>
                            <div style={styles.textRow}>
                                <img src={tick_icon} alt="tick" />
                                <span style={styles.rowText}>Comprehensive Tools: Explore and use the full suite of speech therapy assessments and exercises</span>
                            </div>
                            <div style={styles.textRow}>
                                <img src={tick_icon} alt="tick" />
                                <span style={styles.rowText}>Innovative Therapy: Engage in interactive, avatar-led therapy sessions for a personalized experience</span>
                            </div>
                            <div style={styles.textRow}>
                                <img src={tick_icon} alt="tick" />
                                <span style={styles.rowText}>{getRenewalText()}</span>
                            </div>

                            <div style={{ height: 20 }} />
                        </>
                    }

                </div>
                <LoaderModal visible={loader} />
            </div>

            {
                userDetail?.SubscriptionDetails &&
                <CustomButton
                    onPress={onPressCancel}
                    textStyle={{ color: COLORS.cancelBtnText }}
                    style={styles.cancelBtn} title={"Cancel Subscription"} />
            }
            <CustomButton onPress={() => history("Plans")} style={styles.upgradeBtn} title={userDetail?.SubscriptionDetails ? "Upgrade Plan" : "Purchase Plan"} />
        </div>
    );
};

export default ManageSubscriptions;

const styles = {
    safeArea: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: COLORS.white,
        minHeight: '100vh',
    },
    mainView: {
        flex: 1,
        padding: '20px',
    },
    scrollContainer: {
        overflowY: 'scroll',
    },
    heading: {
        fontFamily: fonts.semibold,
        color: COLORS.black,
        fontSize: 20,
        marginTop: 20,
    },
    detailView: {
        borderWidth: '1px',
        borderColor: COLORS.borderColor,
        borderRadius: 12,
        marginTop: 20,
        padding: 20,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
        backgroundColor: COLORS.white,
    },
    currentText: {
        color: COLORS.black,
        fontSize: 14,
        fontFamily: fonts.semibold,
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    planText: {
        color: COLORS.primary,
        fontSize: 24,
        fontFamily: fonts.medium,
    },
    priceText: {
        fontSize: 16,
        fontFamily: fonts.medium,
        color: COLORS.black,
    },
    paymentRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 12,
    },
    keyText: {
        color: COLORS.textDarkGreyColor,
        fontSize: 12,
        fontFamily: fonts.medium,
    },
    valueText: {
        fontSize: 14,
        fontFamily: fonts.medium,
        color: COLORS.black,
    },
    daysView: {
        borderColor: COLORS.borderColor,
        borderWidth: '1px',
        height: 20,
        padding: '5px',
        backgroundColor: COLORS.orangeBackgroundColor,
        borderRadius: 4,
        marginLeft: 12,
        marginTop: 5,
    },
    dayText: {
        color: COLORS.textOrangeColor,
        fontFamily: fonts.medium,
        fontSize: 10,
    },
    cancelPlanBtn: {
        backgroundColor: COLORS.lightRedBackgroundColor,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        width: '45%',
        height: '50px',
        borderRadius: '40px',
    },
    cancelPlanText: {
        color: COLORS.textRedColor,
        fontSize: 14,
        fontFamily: fonts.medium,
    },
    upgradePlanBtn: {
        borderWidth: '1px',
        borderColor: COLORS.greyBorderColor,
        width: '45%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50px',
        borderRadius: '40px',
    },
    upgradePlanText: {
        color: COLORS.primary,
        fontSize: 14,
        fontFamily: fonts.medium,
    },
    textRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 20,
        gap: '12px',
    },
    rowText: {
        fontFamily: fonts.medium,
        color: COLORS.textBlackColor,
        flex: 1,
        marginTop: -4,
    },
    cancelBtn: {
        width: '90%',
        margin: 'auto',
        backgroundColor: COLORS.cancelBtnColor,
    },
    upgradeBtn: {
        width: '90%',
        margin: 'auto',
        marginTop: '12px',
        marginBottom: '20px',
    },
};
