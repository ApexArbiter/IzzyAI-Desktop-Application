import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomHeader from '../components/CustomHeader';

function ReceptiveLanguageInstructions() {
    const location = useLocation();
    const { sessionId, isAll } = location.state || {};
    const history = useNavigate();

    const navigate = () => {
        history('/ReceptiveAssessment', { state: { sessionId, isAll } });
    };

    return (
        <div className="flex flex-col min-h-screen">
            <CustomHeader
                title="Receptive Language Disorder"
                goBack={() => navigate(-1)}
            />
            <div className="h-14 w-28 md:h-16 md:w-32  lg:h-20 lg:w-40 mx-auto mt-2 ">
                <img
                    src={require("../assets/images/logo.png")}
                    alt="Logo"
                    className="h-full w-full object-contain"
                />
            </div>
            <main className="flex-1 p-5 flex flex-col items-center  bg-white shadow-lg rounded-lg mx-20 relative mb-5 ">
                {/* Image container */}
                <div className="flex justify-center mb-8">
                    <div className="relative w-56 h-56 bg-teal-50 rounded-full flex items-center justify-center">
                        <img
                            src={require("../assets/images/mouth.png")}
                            alt="Mouth"
                            className="h-44 w-auto transform transition-transform hover:scale-105"
                        />
                    </div>
                </div>

                {/* Heading */}
                <h2 className="text-xl lg:text-2xl font-bold    text-gray-900">
                    Assessment Instructions
                </h2>

                {/* Instructions list - centered with max-width */}
                <div className="space-y-4 h-[23vh] mt-6 max-w-md mx-auto w-full pl-4">
                    <div className="flex items-start gap-3 ">
                        <span className="text-teal-500 text-[20px] relative bottom-1 animate-pulse glow">•</span>
                        <p className="text-gray-900 font-serif">
                            You are required to select one picture in each set.
                        </p>
                    </div>

                    <div className="flex items-start gap-3 ">
                        <span className="text-teal-500 text-[20px] relative bottom-1 animate-pulse glow">•</span>
                        <p className="text-gray-900 font-serif">
                            There is no pass or fail criteria.
                        </p>
                    </div>

                    <div className="flex items-start gap-3 ">
                        <span className="text-teal-500 text-[20px] relative bottom-1 animate-pulse glow">•</span>
                        <p className="text-gray-900 font-serif">
                            Select the picture as per your understanding.
                        </p>
                    </div>
                </div>

                {/* Start button - centered */}
                <div className=" w-full max-w-xs flex justify-center">
                    <button
                        className="bg-black hover:bg-gray-800 text-white pl-16 pr-16 pt-2 pb-2 rounded-full absolute bottom-5 "
                        onClick={navigate}
                    >
                        Start Now
                    </button>
                </div>
            </main>
        </div>

        // <div className="flex flex-col min-h-screen">
        //     <CustomHeader
        //         title="Receptive Language Disorder"
        //         goBack={() => history(-1)}
        //     />

        //     <main className="flex-1 p-5 flex flex-col items-center  bg-white shadow-lg rounded-lg md:m-10 m-0">
        //         {/* Image container */}
        //         <div className="flex justify-center mb-12">
        //             <div className="relative w-56 h-56 bg-teal-50 rounded-full flex items-center justify-center">
        //                 <img
        //                     src={require("../assets/images/mouth.png")}
        //                     alt="Mouth"
        //                     className="h-44 w-auto transform transition-transform hover:scale-105"
        //                 />
        //             </div>
        //         </div>

        //         {/* Heading */}
        //         <h2 className="text-xl font-bold   mt-12 font-serif text-gray-900">
        //             Assessment Instructions
        //         </h2>

        //         {/* Instructions list - centered with max-width */}
        //         <div className="space-y-4 h-[23vh] mt-6 max-w-md mx-auto w-full pl-4">
        //             <div className="flex items-start gap-3 ">
        //                 <span className="text-teal-500 text-[20px] relative bottom-1 animate-pulse glow">•</span>
        //                 <p className="text-gray-900 font-serif">
        //                     You are required to select one picture in each set.
        //                 </p>
        //             </div>

        //             <div className="flex items-start gap-3 ">
        //                 <span className="text-teal-500 text-[20px] relative bottom-1 animate-pulse glow">•</span>
        //                 <p className="text-gray-900 font-serif">
        //                     There is no pass or fail criteria.
        //                 </p>
        //             </div>

        //             <div className="flex items-start gap-3 ">
        //                 <span className="text-teal-500 text-[20px] relative bottom-1 animate-pulse glow">•</span>
        //                 <p className="text-gray-900 font-serif">
        //                     Select the picture as per your understanding.
        //                 </p>
        //             </div>
        //         </div>

        //         {/* Start button - centered */}
        //         <div className=" w-full max-w-xs flex justify-center">
        //             <button
        //                 className="bg-black hover:bg-gray-800 text-white pl-16 pr-16 pt-2 pb-2 rounded-full"
        //                 onClick={navigate}
        //             >
        //                 Start Now
        //             </button>
        //         </div>
        //     </main>
        // </div>
    );
}

export default ReceptiveLanguageInstructions;