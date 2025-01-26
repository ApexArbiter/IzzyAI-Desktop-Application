// import React, { useEffect, useState } from 'react';
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   CircularProgress,
//   Grid,
//   Paper,
//   Divider,
//   List,
//   ListItem,
//   ListItemText,
//   Button,
// } from '@mui/material';
// import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { useDataContext } from '../contexts/DataContext';
// import BaseURL from '../components/ApiCreds';
// import { getToken } from '../utils/functions';

// const StammeringReport = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { userDetail } = useDataContext();
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const {
//     sessionId,
//     SessiontypId,
//     correctAnswers,
//     incorrectAnswers,
//     incorrectQuestions,
//     expressionsArray,
//     startTime,
//     isExercise
//   } = location.state || {};

//   const totalQuestions = correctAnswers + incorrectAnswers;
//   const accuracy = ((correctAnswers / totalQuestions) * 100).toFixed(1);

//   // Expression analysis
//   const expressionCounts = expressionsArray.reduce((acc, exp) => {
//     acc[exp] = (acc[exp] || 0) + 1;
//     return acc;
//   }, {});

//   const pieData = Object.entries(expressionCounts).map(([name, value]) => ({
//     name,
//     value
//   }));

//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

//   const submitReport = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const token = await getToken();
//       const endTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

//       const reportData = {
//         SessionID: sessionId,
//         UserID: userDetail?.UserID,
//         SessionTypeID: SessiontypId,
//         StartTime: startTime,
//         EndTime: endTime,
//         Expressions: JSON.stringify(expressionsArray),
//         IncorrectQuestions: JSON.stringify(incorrectQuestions),
//         Score: accuracy,
//       };

//       const response = await fetch(`${BaseURL}/submit_session_report`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(reportData)
//       });

//       if (!response.ok) {
//         throw new Error('Failed to submit report');
//       }

//       navigate('/dashboard');
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
//       <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
//         Exercise Report
//       </Typography>

//       {/* Score Overview Card */}
//       <Card sx={{ mb: 4, bgcolor: '#f8f9fa' }}>
//         <CardContent>
//           <Typography variant="h5" gutterBottom align="center">
//             Overall Performance
//           </Typography>
//           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 3 }}>
//             <Box sx={{ position: 'relative', display: 'inline-flex' }}>
//               <CircularProgress
//                 variant="determinate"
//                 value={parseFloat(accuracy)}
//                 size={120}
//                 thickness={5}
//                 sx={{ color: parseFloat(accuracy) >= 70 ? 'success.main' : 'warning.main' }}
//               />
//               <Box
//                 sx={{
//                   top: 0,
//                   left: 0,
//                   bottom: 0,
//                   right: 0,
//                   position: 'absolute',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                 }}
//               >
//                 <Typography variant="h5" component="div">
//                   {accuracy}%
//                 </Typography>
//               </Box>
//             </Box>
//           </Box>

//           <Grid container spacing={2} sx={{ textAlign: 'center' }}>
//             <Grid item xs={6}>
//               <Typography color="success.main" variant="h6">
//                 {correctAnswers}
//               </Typography>
//               <Typography variant="body2">Correct Answers</Typography>
//             </Grid>
//             <Grid item xs={6}>
//               <Typography color="error.main" variant="h6">
//                 {incorrectAnswers}
//               </Typography>
//               <Typography variant="body2">Incorrect Answers</Typography>
//             </Grid>
//           </Grid>
//         </CardContent>
//       </Card>

//       {/* Expression Analysis Card */}
//       <Card sx={{ mb: 4 }}>
//         <CardContent>
//           <Typography variant="h6" gutterBottom>
//             Expression Analysis
//           </Typography>
//           <Box sx={{ height: 300 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={pieData}
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="value"
//                   label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
//                 >
//                   {pieData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//               </PieChart>
//             </ResponsiveContainer>
//           </Box>
//           <List>
//             {Object.entries(expressionCounts).map(([expression, count]) => (
//               <ListItem key={expression}>
//                 <ListItemText 
//                   primary={`${expression}: ${count} times`}
//                   secondary={`${((count/expressionsArray.length) * 100).toFixed(1)}% of exercises`}
//                 />
//               </ListItem>
//             ))}
//           </List>
//         </CardContent>
//       </Card>

//       {/* Incorrect Questions List */}
//       {incorrectQuestions.length > 0 && (
//         <Card sx={{ mb: 4 }}>
//           <CardContent>
//             <Typography variant="h6" gutterBottom>
//               Questions to Practice
//             </Typography>
//             <List>
//               {incorrectQuestions.map((question, index) => (
//                 <React.Fragment key={index}>
//                   <ListItem>
//                     <ListItemText 
//                       primary={question.Sentence}
//                     />
//                   </ListItem>
//                   {index < incorrectQuestions.length - 1 && <Divider />}
//                 </React.Fragment>
//               ))}
//             </List>
//           </CardContent>
//         </Card>
//       )}

//       {/* Action Buttons */}
//       <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={submitReport}
//           disabled={isLoading}
//         >
//           {isLoading ? <CircularProgress size={24} /> : 'Submit Report'}
//         </Button>
//         <Button
//           variant="outlined"
//           onClick={() => navigate('/dashboard')}
//         >
//           Return to Dashboard
//         </Button>
//       </Box>

//       {/* Error Display */}
//       {error && (
//         <Typography color="error" align="center" sx={{ mt: 2 }}>
//           {error}
//         </Typography>
//       )}
//     </Box>
//   );
// };

// export default StammeringReport;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import moment from 'moment';
import { AlertCircle, CheckCircle, ChevronLeft } from 'lucide-react';
import { useDataContext } from '../contexts/DataContext';
import BaseURL from '../components/ApiCreds';
import { endSession, getToken } from '../utils/functions';

const CircularProgress = ({ percentage, size = "lg", color = "error" }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  const sizes = {
    sm: "w-32 h-32",
    lg: "w-48 h-48",
    xl: "w-64 h-64"
  };

  const colors = {
    error: "stroke-red-500",
    success: "stroke-green-500"
  };

  return (
    <div className={`relative ${sizes[size]} flex items-center justify-center`}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className="stroke-gray-200 fill-none"
          strokeWidth="8"
        />
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className={`${colors[color]} fill-none`}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-2xl font-bold">
        {percentage.toFixed(1)}%
      </span>
    </div>
  );
};

const LinearProgressBar = ({ value, color = "success" }) => {
  const colors = {
    error: "bg-red-500",
    success: "bg-green-500"
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full ${colors[color]}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

const VoiceDisorderResult = () => {
  const navigate = useNavigate();
  const { userId } = useDataContext();
  const [loading, setLoading] = useState(false);
  const [endTime, setEndTime] = useState('');

  // Get data from localStorage
  const sessionId = localStorage.getItem("sessionId");
  const startTime = localStorage.getItem("startTime");
  const questionScores = JSON.parse(localStorage.getItem("questionScores") || "[]");

  // Calculate average score
  const averageScore = questionScores.length > 0
    ? questionScores.reduce((acc, score) => acc + score, 0) / questionScores.length
    : 0;

  useEffect(() => {
    const currentEndTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    setEndTime(currentEndTime);
  }, []);

  const addAssessmentResult = async () => {
    const token = await getToken();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('UserID', userId);
      formData.append('SessionID', sessionId);
      formData.append('DisorderID', 3); // Voice disorder ID
      formData.append('AssessmentDate', moment(new Date()).format("YYYY-MM-DD hh:mm:ss"));
      formData.append('Score', averageScore);

      const response = await fetch(`${BaseURL}/add_assessment_voice_disorder`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': "Bearer " + token },
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await endSession(sessionId, startTime, 'Completed', 3); // 3 for voice disorder
      addAssessmentResult();
    };
    init();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 p-4 md:p-8"
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="flex items-center mb-8"
        >
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Stammering Result Report</h1>
        </motion.div>

        {/* Progress Circle */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center"
          >
            <CircularProgress 
              percentage={averageScore} 
              color={averageScore >= 50 ? "success" : "error"} 
            />
            <p className="mt-4 text-lg font-semibold">Overall Score</p>
          </motion.div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold mb-4">Practice Results</h3>
              <div className="space-y-4">
                {questionScores.map((score, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Exercise {index + 1}</span>
                      <span className={`font-semibold ${score >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                        {score.toFixed(1)}%
                      </span>
                    </div>
                    <LinearProgressBar 
                      value={score} 
                      color={score >= 50 ? "success" : "error"} 
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-8 flex justify-center"
        >
          <button
            onClick={() => navigate("/home")}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VoiceDisorderResult;