import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomHeader from '../components/CustomHeader';
import { Button } from '@mui/material';

function ReceptiveLanguageInstructions() {
    const location = useLocation();
    const { sessionId, isAll } = location.state || {};
    console.log(location.state);
    const history = useNavigate();

    const navigate = () => {
        history('/ReceptiveAssessment', { state: { sessionId, isAll } });
    };




    return (
        <div className="flex flex-col min-h-screen">
            <CustomHeader
                title="Receptive Language Disorder"
                goBack={() => history(-1)}
            />

            <main className="flex-1 p-5 flex flex-col items-center">
                {/* Image container */}
                <div className="mt-10">
                    <img
                        src={require("../assets/images/mouth.png")}
                        alt="Mouth"
                        className="h-40 w-auto"
                    />
                </div>

                {/* Heading */}
                <h2 className="text-2xl font-medium text-center mt-12 text-gray-900">
                    Assessment Instructions
                </h2>

                {/* Instructions list - centered with max-width */}
                <div className="space-y-4 mt-6 max-w-md mx-auto w-full">
                    <div className="flex items-center gap-3 justify-center">
                        <span className="text-gray-600 flex-shrink-0">•</span>
                        <p className="text-gray-900">
                            You are required to select one picture in each set.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 justify-center">
                        <span className="text-gray-600 flex-shrink-0">•</span>
                        <p className="text-gray-900">
                            There is no pass or fail criteria.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 justify-center">
                        <span className="text-gray-600 flex-shrink-0">•</span>
                        <p className="text-gray-900">
                            Select the picture as per your understanding.
                        </p>
                    </div>
                </div>

                {/* Start button - centered */}
                <div className="mt-8 w-full max-w-xs">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={navigate}
                        fullWidth
                    >
                        Start Now
                    </Button>
                </div>
            </main>
        </div>
    );
}

export default ReceptiveLanguageInstructions;