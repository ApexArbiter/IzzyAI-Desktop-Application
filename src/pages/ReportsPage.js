import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import moment from 'moment';
import CustomHeader from '../components/CustomHeader';
import ReportDetails from '../components/ReportDetails';
import ExerciseDetails from '../components/ExerciseDetails';
import { useDataContext } from '../contexts/DataContext';
import Loader from '../components/Loader';
import { getReports, getGameReports } from "../utils/functions";
import { useNavigate } from 'react-router-dom';

// Card for each report
// Assessment Card
function Card({ reportData, assessment, itemNum }) {
  if (!assessment) return null;

  const { AssessmentDate, DisorderName, Score } = assessment;
  const [detailsOpen, setDetailsOpen] = useState(false);

  const closeDetails = (val) => {
    setDetailsOpen(val);
  };

  return (
    <>
      <div
        onClick={() => setDetailsOpen(true)}
        className="cursor-pointer mt-3.5"
      >
        <div className="bg-gradient-to-br from-[#0CC8E8] to-[#2DEEAA] p-0.5 rounded-2xl">
          <div className="flex justify-between items-center bg-white rounded-2xl p-4">
            <div className="flex-1 mr-2.5">
              <h3 className="text-lg font-medium text-gray-900">
                {DisorderName} Assessment Report
              </h3>
              <div className="flex items-center mt-1.5">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium ml-1.5 text-gray-900">
                  {moment(AssessmentDate).subtract(5, 'hours').format("YYYY-MM-DD hh:mm:ss")}
                </span>
              </div>
            </div>
            <span className="text-xl font-extrabold text-[#71D860]">
              {Score ? Score.toFixed() : 0}%
            </span>
          </div>
        </div>
      </div>

      <ReportDetails
        detailsOpen={detailsOpen}
        closeDetails={closeDetails}
        reportData={reportData}
        itemNum={itemNum}
      />
    </>
  );
}

// Exercise Card - Updated to match Assessment Card layout
function ExerciseCard({ reportData, exercise, itemNum }) {
  if (!exercise) return null;

  const { ExerciseDate, DisorderName, Score } = exercise;
  const [detailsOpen, setDetailsOpen] = useState(false);

  const closeDetails = (val) => {
    setDetailsOpen(val);
  };

  return (
    <>
      <div
        onClick={() => setDetailsOpen(true)}
        className="cursor-pointer mt-3.5"
      >
        <div className="bg-gradient-to-br from-[#FF8C00] to-[#FFD700] p-0.5 rounded-2xl">
          <div className="flex justify-between items-center bg-white rounded-2xl p-4">
            <div className="flex-1 mr-2.5">
              <h3 className="text-lg font-medium text-gray-900">
                {DisorderName} Exercise Report
              </h3>
              <div className="flex items-center mt-1.5">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium ml-1.5 text-gray-900">
                  {moment(ExerciseDate).subtract(5, 'hours').format("YYYY-MM-DD hh:mm:ss")}
                </span>
              </div>
            </div>
            <span className="text-xl font-extrabold text-[#71D860]">
              {Score ? Score.toFixed() : 0}%
            </span>
          </div>
        </div>
      </div>

      <ExerciseDetails
        detailsOpen={detailsOpen}
        closeDetails={closeDetails}
        reportData={reportData}
        itemNum={itemNum}
      />
    </>
  );
}

export { Card, ExerciseCard };

// Main reports page component
function ReportsPage({ }) {
  // const { userId } = useDataContext();
  const User = () => localStorage.getItem("userId");
  const userId = User();

  const [reportData, setReportData] = useState(null);
  const [gameReports, setGameReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('assessments');
  const navigate = useNavigate()
  const navigateBack = () => {
    navigate(-1);
  };

  const getReportsData = async () => {
    setLoading(true);
    const reports = await getReports(userId);
    console.log(reports)
    const gamereport = await getGameReports(userId);
    console.log(gamereport);
    // console.log(reports);
    setLoading(false);
    setReportData(reports);
    setGameReports(gamereport);
  };

  useEffect(() => {
    getReportsData();
  }, []);

  const getData = () => {
    let array = [];
    if (selectedTab === 'assessments') {
      array = reportData?.AssessmentResults?.sort((a, b) =>
        new Date(b?.AssessmentDate) - new Date(a?.AssessmentDate)) || [];
    } else if (selectedTab === 'exercises') {
      array = reportData?.UserExercises?.sort((a, b) =>
        new Date(b?.ExerciseDate) - new Date(a?.ExerciseDate)) || [];
    } else {
      array = reportData?.Games || [];
    }
    return array;
  };

  const TabButton = ({ label, tabName }) => (
    <button
      onClick={() => setSelectedTab(tabName)}
      className={`w-1/3 h-12 flex justify-center items-center rounded-xl transition-colors
        ${selectedTab === tabName ? 'bg-[#2DEEAA]' : 'bg-white'}`}
    >
      <span className="text-gray-900">{label}</span>
    </button>
  );

  const GameCard = ({ title, score }) => (
    <div className="flex justify-between items-center border border-[#2DEEAA] rounded-lg bg-white mt-8 px-5 py-5">
      <span className="text-xl font-semibold text-gray-900">{title}</span>
      <span className="text-xl font-extrabold text-[#71D860]">{score}%</span>
    </div>
  );

  return (
    <div className="flex flex-col h-screen">
      <CustomHeader title="Reports" goBack={navigateBack} />

      <div className="flex-1 p-5">
        <div className="flex justify-between mt-8 space-x-4">
          <TabButton label="Assessments" tabName="assessments" />
          <TabButton label="Exercises" tabName="exercises" />
          <TabButton label="Games" tabName="games" />
        </div>

        {selectedTab === 'games' ? (
          <div className="mt-4">
            <GameCard title="Blow Game" score={gameReports?.Lowdness_blow_game_Score || 0} />
            <GameCard title="Voice Game" score={gameReports?.Sounds_game_Score || 0} />
            <GameCard title="Animal Game" score={gameReports?.Animal_game_Score || 0} />
            <GameCard title="Transport Game" score={gameReports?.Transport_game_Score || 0} />
            <GameCard title="Food Game" score={gameReports?.Food_game_Score || 0} />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {getData().map((item, index) => (
              selectedTab === 'assessments' ? (
                <Card
                  key={index}
                  reportData={reportData}
                  assessment={item}
                  itemNum={index}
                />
              ) : (
                <ExerciseCard
                  key={index}
                  reportData={reportData}
                  exercise={item}
                  itemNum={index}
                />
              )
            ))}
          </div>
        )}

        {loading && <Loader loading={loading} />}
      </div>
    </div>
  );
}

export default ReportsPage;