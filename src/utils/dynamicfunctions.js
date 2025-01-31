import { useState } from "react";

export default function dynamicfunctions() {
    const [questionResponse, setQuestionResponse] = useState('');
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [questionCount, setQuestionCount] = useState(1);
    const [recordingStatus, setRecordingStatus] = useState('idle');
    const [correctQuestions, setCorrectQuestions] = useState([]);
    const [incorrectExpressions, setIncorrectExpressions] = useState([]);
    const [correctExpressions, setCorrectExpressions] = useState([]);
    const [incorrectQuestions, setIncorrectQuestions] = useState([]);

    const onCorrectAnswer = (ques, onCorrect = () => { }) => {
        setQuestionResponse('Correct!');
        setCorrectAnswersCount(prevCount => prevCount + 1);
        if (!correctQuestions?.includes(ques + questionCount)) {
            setCorrectQuestions(prevQuestions => [
                ...prevQuestions,
                ques + questionCount,
            ]);
        }
        if (incorrectQuestions.some(q => q?.questiontext === ques + questionCount)) {
            setIncorrectQuestions(prevQuestions =>
                prevQuestions.filter(q => q?.questiontext !== ques + questionCount),
            );
        }
        setRecordingStatus("stop");
        onCorrect();
    }

    const onWrongAnswer = (questionData, ques, onWrong = () => { }) => {
        if (!incorrectQuestions.some(q => q?.questiontext === ques + questionCount)) {
            setIncorrectQuestions(prevQuestions => [
                ...prevQuestions,
                { ...questionData, questiontext: ques + questionCount },
            ]);
        }
        if (correctQuestions.includes(ques + questionCount)) {
            setCorrectAnswersCount(prevCount => prevCount - 1);
            setCorrectQuestions(prevQuestions =>
                prevQuestions.filter(q => q !== ques + questionCount),
            );
        }
        setQuestionResponse('Incorrect!');
        onWrong();
    }

    const onCorrectExpression = (ques, exp) => {
        if (!correctExpressions.includes(ques + exp)) {
            setCorrectExpressions(prevQuestions => [
                ...prevQuestions,
                ques + exp,
            ]);
        }
        if (incorrectExpressions.some(q => q === ques + exp)) {
            setIncorrectExpressions(prevQuestions =>
                prevQuestions.filter(q => q !== ques + exp),
            );
        }
    }

    const onWrongExpression = (ques, exp) => {
        if (!incorrectExpressions.some(q => q === ques + exp)) {
            setIncorrectExpressions(prevQuestions => [
                ...prevQuestions,
                ques + exp,
            ]);
        }
        if (correctExpressions.includes(ques + exp)) {
            setCorrectExpressions(prevQuestions =>
                prevQuestions.filter(q => q !== (ques + exp)),
            );
        }
    }

    return {
        questionResponse,
        setQuestionResponse,
        correctAnswersCount,
        setCorrectAnswersCount,
        questionCount,
        setQuestionCount,
        recordingStatus,
        setRecordingStatus,
        incorrectQuestions,
        setIncorrectQuestions,
        correctQuestions,
        setCorrectQuestions,
        incorrectExpressions,
        setIncorrectExpressions,
        correctExpressions,
        setCorrectExpressions,
        onCorrectAnswer,
        onCorrectExpression,
        onWrongAnswer,
        onWrongExpression
    };
}