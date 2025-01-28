import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomHeader from '../components/CustomHeader';
import DocumentIcon from '../assets/DocumentIcon';
import { useDataContext } from '../contexts/DataContext';
import BaseURL from '../components/ApiCreds';
import { resetArticSession, getToken, getReceptiveAllExerciseQuestions, getExpressiveAllExerciseQuestions, checkReceptiveAssessment, checkExpressiveAssessment, checkArticulationAssessment, checkAllAssessment } from "../utils/functions";
import Loader from '../components/Loader';
import { COLORS, fonts } from '../theme';

const DarkButton = (props) => {
    const isDisabled = props.disabled;
    return (
        <button
            onClick={props.onPress}
            style={{ ...styles.darkButton, opacity: isDisabled ? 0.3 : 1 }}
            disabled={isDisabled}>
            {props?.isLock ? (
                <span style={{ color: 'white' }}>🔒</span>
            ) : (
                <span style={styles.buttonText}>{props.title}</span>
            )}
        </button>
    );
};

function AllExercisesPage() {
    const { updateUserDetail, questionReport } = useDataContext();
    const SessiontypId = 2;
    const [userDetail, setUserDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [receptiveQuestions, setReceptiveQuestions] = useState([]);
    const [expressiveQuestions, setExpressiveQuestions] = useState([]);

    const navigate = useNavigate();

    const User = () => localStorage.getItem("userId");
    const userId = User();
    console.log(userId)
    useEffect(() => {
        const fetchData = () => {
            try {
                const storedUserDetail = localStorage.getItem("userDetails");

                if (storedUserDetail) {
                    setUserDetail(JSON.parse(storedUserDetail));
                    console.log(userDetail)
                }
            } catch (error) {
                console.error("Error retrieving or parsing userDetails from localStorage", error);
            }
        };

        fetchData();
        console.log(User());
    }, []);

    const fetchReport = async () => {
        const token = await getToken();
        try {
            const response = await fetch(
                `${BaseURL}/get_Exercise_word_count/${userId}/1/`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                    },
                }
            );

            if (response.ok) {
                const reportData = await response.json();
                let sum = 0;
                const names = [];
                for (const key in reportData) {
                    if (reportData.hasOwnProperty(key)) {
                        sum += reportData[key].Count / 4;
                        names.push(reportData[key].SoundName);
                    }
                }
                updateUserDetail({ totalQuestion: sum });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getReceptiveQuestions = async () => {
        const data = await getReceptiveAllExerciseQuestions(userId, userDetail?.AvatarID);
        setReceptiveQuestions(data);
    };

    const getExpressiveData = async () => {
        const data = await getExpressiveAllExerciseQuestions(userId, userDetail?.AvatarID);
        setExpressiveQuestions(data);
    };

    useEffect(() => {
        fetchReport();
        getReceptiveQuestions();
        getExpressiveData();
    }, []);

    const handleButtonClick = async () => {
        setLoading(true);
        try {
            const checkAssess = await checkArticulationAssessment(userId);
            const checkAllAsses = await checkAllAssessment(userId, 1);
            if (checkAssess?.data || checkAllAsses?.data?.status) {
                const token = await getToken();
                const response = resetArticSession(userId, 1);
                const formData = new FormData();
                formData.append('UserID', userId);
                formData.append('SessionTypeID', 2);

                const sessionResponse = await fetch(`${BaseURL}/insert_session_first_data`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Authorization': 'Bearer ' + token,
                    },
                });
                setLoading(false);

                if (sessionResponse.ok) {
                    const data = await sessionResponse.json();
                    navigate('/speechExcercisePage', {
                        state: {
                            sessionId: data.SessionID,
                            SessiontypId: SessiontypId,
                            isAll: true,
                        }
                    });
                } else {
                    throw new Error(sessionResponse.statusText);
                }
            } else {
                setLoading(false);
                alert('Complete your articulation disorder assessment.');
            }
        } catch (error) {
            setLoading(false);
            console.error('Error:', error);
        }
    };

    const handleButtonClickStammering = async () => {
        setLoading(true);
        const token = await getToken();
        const formData = new FormData();
        formData.append('UserID', userId);
        formData.append('SessionTypeID', 2);

        const sessionResponse = await fetch(`${BaseURL}/insert_session_first_data`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': 'Bearer ' + token,
            },
        });

        setLoading(false);

        if (sessionResponse.ok) {
            const data = await sessionResponse.json();
            navigate('/stammeringExercisePage', {
                state: {
                    sessionId: data.SessionID,
                    SessiontypId: SessiontypId,
                    isAll: true,
                }
            });
        } else {
            console.error('Error:', sessionResponse.statusText);
        }
    };

    const handleButtonClickVoice = async () => {
        const token = await getToken();
        setLoading(true);
        const formData = new FormData();
        formData.append('UserID', userId);
        formData.append('SessionTypeID', 2);

        const sessionResponse = await fetch(`${BaseURL}/insert_session_first_data`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': 'Bearer ' + token,
            },
        });

        setLoading(false);

        if (sessionResponse.ok) {
            const data = await sessionResponse.json();
            navigate('/VoiceExercisePage', {
                state: {
                    sessionId: data.SessionID,
                    SessiontypId: SessiontypId,
                    isAll: true,
                }
            });
        } else {
            console.error('Error:', sessionResponse.statusText);
        }
    };

    const handleButtonLanguage = async (isReceptive = false) => {
        setLoading(true);
        let checkAssess;
        if (isReceptive) {
            checkAssess = await checkReceptiveAssessment(userId);
        } else {
            checkAssess = await checkExpressiveAssessment(userId);
        }
        const checkAllAsses = await checkAllAssessment(userId, isReceptive ? 5 : 4);

        if (checkAssess?.data || checkAllAsses?.data?.status) {
            const token = await getToken();
            setLoading(false);
            const formData = new FormData();
            formData.append('UserID', userId);
            formData.append('SessionTypeID', 2);

            const sessionResponse = await fetch(`${BaseURL}/insert_session_first_data`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': 'Bearer ' + token,
                },
            });

            setLoading(false);

            if (sessionResponse.ok) {
                const data = await sessionResponse.json();
                console.log("SessionId", data.SessionID)
                navigate(isReceptive ? '/ReceptiveExercise' : '/ExpressiveExercise', {
                    state: {
                        sessionId: data.SessionID,
                        SessiontypId: SessiontypId,
                        isAll: true,
                    }
                });
            } else {
                setLoading(false);
                alert(isReceptive
                    ? 'Complete your receptive language disorder assessment'
                    : 'Complete your expressive language disorder assessment');
            }
        } else {
            setLoading(false);
            alert(isReceptive
                ? 'Complete your receptive language disorder assessment'
                : 'Complete your expressive language disorder assessment');
        }
    };

    return (
        <div style={styles.safe_area}>
            <CustomHeader title="Exercises" goBack={() => navigate(-1)} />
            <div style={styles.main_view}>
                <div>
                    <div style={styles.cardContainer}>
                        <div style={styles.text_view}>
                            <span style={styles.heading}>
                                Articulation Disorder
                            </span>
                            <div style={styles.text_row}>
                                <DocumentIcon />
                                <span style={styles.para}>271 Words</span>
                            </div>
                        </div>
                        <DarkButton onPress={handleButtonClick} title="Start" />
                    </div>
                    <div style={styles.cardContainer}>
                        <div style={styles.text_view}>
                            <span style={styles.heading}>Stammering</span>
                            <div style={styles.text_row}>
                                <DocumentIcon />
                                <span style={styles.para}>5 Statements</span>
                            </div>
                        </div>
                        <DarkButton onPress={handleButtonClickStammering} title="Start" />
                    </div>

                    <div style={styles.cardContainer}>
                        <div style={styles.text_view}>
                            <span style={styles.heading}>Voice Disorder</span>
                            <div style={styles.text_row}>
                                <DocumentIcon />
                                <span style={styles.para}>3 Sounds</span>
                            </div>
                        </div>
                        <DarkButton onPress={handleButtonClickVoice} title="Start" />
                    </div>

                    <div style={styles.cardContainer}>
                        <div style={styles.text_view}>
                            <span style={styles.heading}>
                                Receptive Language Disorder
                            </span>
                            <div style={styles.text_row}>
                                <DocumentIcon />
                                <span style={styles.para}>
                                    {`${receptiveQuestions?.length || 0} Questions`}
                                </span>
                            </div>
                        </div>
                        <DarkButton onPress={() => handleButtonLanguage(true)} title="Start" />
                    </div>

                    <div style={styles.cardContainer}>
                        <div style={styles.text_view}>
                            <span style={styles.heading}>
                                Expressive Language Disorder
                            </span>
                            <div style={styles.text_row}>
                                <DocumentIcon />
                                <span style={styles.para}>
                                    {`${expressiveQuestions?.length || 0} Questions`}
                                </span>
                            </div>
                        </div>
                        <DarkButton onPress={() => handleButtonLanguage()} title="Start" />
                    </div>
                    {/* 
                    {userDetail?.SubscriptionDetails &&
                        userDetail?.SubscriptionDetails?.Status !== 'Free Trial' && ( */}
                    <div style={styles.cardContainer}>
                        <div style={styles.text_view}>
                            <span style={styles.heading}>Games</span>
                            <div style={styles.text_row}>
                                <DocumentIcon />
                                <span style={styles.para}>{"5 Games"}</span>
                            </div>
                        </div>
                        <DarkButton onPress={() => navigate('/voiceExerciseGame')} title="Start" />
                    </div>
                    {/* )} */}
                    {loading && <Loader loading={loading} />}
                    <div style={{ height: 20 }} />
                </div>
            </div>
        </div>
    );
}

const styles = {
    safe_area: {
        flex: 1,
    },
    main_view: {
        flex: 1,
        padding: 20,
    },
    base: {
        fontFamily: fonts.regular,
        color: '#111920',
    },
    heading: {
        flex: 1,
        fontSize: 22,
        fontWeight: '500',
    },
    para: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 5,
    },
    cardContainer: {
        borderWidth: 1,
        borderColor: COLORS.blue_border_color,
        borderRadius: 16,
        padding: 14,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
    },
    darkButton: {
        borderRadius: 50,
        alignItems: 'center',
        backgroundColor: '#111920',
        justifyContent: 'center',
        height: 45,
        width: 100,
    },
    text_view: {
        flex: 1,
        marginRight: 12,
    },
    text_row: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
};

export default AllExercisesPage;
