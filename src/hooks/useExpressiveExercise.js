import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDataContext } from '../contexts/DataContext';

export const useExpressiveExercise = () => {
    const location = useLocation();
    const { sessionId, isAll } = location.state || {};
    const navigate = useNavigate();
    const { setExpressiveReport } = useDataContext();
    const webcamRef = useRef(null);
    const videoRef = useRef(null);
    
    const [startTime, setStartTime] = useState('');
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [questionResponse, setQuestionResponse] = useState('');
    const [questionCount, setQuestionCount] = useState(1);
    const [recordingStatus, setRecordingStatus] = useState('idle');
    const [incorrectQuestions, setIncorrectQuestions] = useState([]);
    const [correctQuestions, setCorrectQuestions] = useState([]);
    const [incorrectExpressions, setIncorrectExpressions] = useState([]);
    const [correctExpressions, setCorrectExpressions] = useState([]);
    const [expressionsArray, setExpressionsArray] = useState([]);
    const [questionExpressions, setQuestionExpressions] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [disableRecordingButton, setDisableRecordingButton] = useState(false);
    const [isWrongAnswer, setInWrongAnswer] = useState(false);
    const [wrongWord, setWrongWord] = useState(null);
    const [answerCount, setAnswerCount] = useState(0);  
    const [recordCount, setRecordCount] = useState(0);  
    const [consecutiveCorrect, setConsecutiveCorrect] = useState(0); 
    const [isNextAnswer, setIsNextAnswer] = useState(false); 
    const [isDelay, setIsDelay] = useState(false); 
    const [expression, setExpression] = useState(null);
    const [snapshot, setSnapshot] = useState(null);
    const [isVideoEnd, setIsVideoEnd] = useState(false);
    const [response, setResponse] = useState();
    const [expressionResponse, setExpressionResponse] = useState();
    const [transcript, setTranscript] = useState();
    const [incorrectWord, setIncorrectWord] = useState();
    const [updatedQuestionExpression, setUpdatedQuestionExpression] = useState();

    return { sessionId, isAll, navigate, setExpressiveReport, webcamRef, videoRef, startTime, setStartTime, correctAnswersCount, setCorrectAnswersCount, isLoading, setIsLoading, questionResponse, setQuestionResponse, questionCount, setQuestionCount, recordingStatus, setRecordingStatus, incorrectQuestions, setIncorrectQuestions, correctQuestions, setCorrectQuestions, incorrectExpressions, setIncorrectExpressions, correctExpressions, setCorrectExpressions, expressionsArray, setExpressionsArray, questionExpressions, setQuestionExpressions, questions, setQuestions, disableRecordingButton, setDisableRecordingButton, isWrongAnswer, setInWrongAnswer, wrongWord, setWrongWord, answerCount, setAnswerCount, recordCount, setRecordCount, consecutiveCorrect,setConsecutiveCorrect, isNextAnswer, setIsNextAnswer, isDelay, setIsDelay, expression, setExpression, snapshot, setSnapshot, isVideoEnd, setIsVideoEnd, response, setResponse, expressionResponse, setExpressionResponse, transcript, setTranscript, incorrectWord, setIncorrectWord, updatedQuestionExpression, setUpdatedQuestionExpression }
};
