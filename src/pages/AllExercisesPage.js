import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomHeader from '../components/CustomHeader';
import DocumentIcon from '../assets/DocumentIcon';
import { useDataContext } from '../contexts/DataContext';
import BaseURL from '../components/ApiCreds';
import { 
    resetArticSession, 
    getToken, 
    getReceptiveAllExerciseQuestions, 
    getExpressiveAllExerciseQuestions, 
    checkReceptiveAssessment, 
    checkExpressiveAssessment, 
    checkArticulationAssessment, 
    checkAllAssessment 
} from "../utils/functions";
import Loader from '../components/Loader';

const DarkButton = ({ onClick, title, isLock, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`ml-auto rounded-full bg-gray-900 text-white px-6 py-3 font-semibold hover:bg-gray-700 disabled:opacity-30`}
    >
        {isLock ? (
            <span className="text-white">🔒</span>
        ) : (
            <span>{title}</span>
        )}
    </button>
);

const ExerciseCard = ({ title, subtitle, onStart }) => {
    return (
        <div className="border border-[#0CC8E8] rounded-2xl p-4 flex flex-row items-center mt-8">
            <div className="flex-1 mr-3">
                <h2 className="text-gray-900 text-xl font-medium">
                    {title}
                </h2>
                <div className="flex items-center mt-3">
                    <DocumentIcon className="w-5 h-5 text-gray-600" />
                    <p className="text-gray-900 text-sm font-medium ml-2">
                        {subtitle}
                    </p>
                </div>
            </div>
            <DarkButton onClick={onStart} title="Start" />
        </div>
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

    useEffect(() => {
        const fetchData = () => {
            try {
                const storedUserDetail = localStorage.getItem("userDetails");
                if (storedUserDetail) {
                    setUserDetail(JSON.parse(storedUserDetail));
                }
            } catch (error) {
                console.error("Error retrieving or parsing userDetails from localStorage", error);
            }
        };
        fetchData();
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

        if (!checkAssess?.data || checkAllAsses?.data?.status) {
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
        <div className="flex flex-col h-screen">
            <CustomHeader title="Exercises" goBack={() => navigate(-1)} />
            <div className="p-5 py-2">
                <div className="space-y-6">
                    <ExerciseCard
                        title="Articulation Disorder"
                        subtitle="271 Words"
                        onStart={handleButtonClick}
                    />

                    <ExerciseCard
                        title="Stammering"
                        subtitle="5 Statements"
                        onStart={handleButtonClickStammering}
                    />

                    <ExerciseCard
                        title="Voice Disorder"
                        subtitle="3 Sounds"
                        onStart={handleButtonClickVoice}
                    />

                    <ExerciseCard
                        title="Receptive Language Disorder"
                        subtitle={`${receptiveQuestions?.length || 0} Questions`}
                        onStart={() => handleButtonLanguage(true)}
                    />

                    <ExerciseCard
                        title="Expressive Language Disorder"
                        subtitle={`${expressiveQuestions?.length || 0} Questions`}
                        onStart={() => handleButtonLanguage()}
                    />

                    {
                      userDetail?.SubscriptionDetails && (
                            <ExerciseCard
                        title="Games"
                        subtitle="5 Games"
                        onStart={() => navigate('/voiceExerciseGame')}
                    />
                        )
                    }

                    {loading && <Loader loading={loading} />}
                </div>
            </div>
        </div>
    );
}

export default AllExercisesPage;