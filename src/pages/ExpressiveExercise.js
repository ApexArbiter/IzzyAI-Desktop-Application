import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { endSession, getToken } from "../utils/functions"
import BaseURL from "../components/ApiCreds"
import moment from "moment"
import { useDataContext } from "../contexts/DataContext"
import CustomHeader from "../components/CustomHeader"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Progress } from "../components/ui/progress"

const CircularProgress = ({ percentage, size = "lg" }) => {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const sizes = {
    sm: "w-32 h-32",
    lg: "w-48 h-48",
    xl: "w-64 h-64",
  }

  return (
    <div className={`relative ${sizes[size]} flex items-center justify-center`}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx="50%" cy="50%" r={radius} className="stroke-gray-200 fill-none" strokeWidth="8" />
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className={`${percentage >= 70 ? "stroke-green-500" : "stroke-red-500"} fill-none`}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-2xl font-bold">{percentage.toFixed(1)}%</span>
    </div>
  )
}

const ArticulationResult = () => {
  const navigate = useNavigate()
  const { updateUserDetail, articulationReport } = useDataContext()
  const userId = localStorage.getItem("userId")
  const [loading, setLoading] = useState(false)
  const [soundNames, setSoundNames] = useState([])
  const location = useLocation()

  const {
    startTime,
    SessiontypId,
    sessionId,
    totalQuestions: total,
    expressionsArray,
    incorrectExpressions,
    correctExpressions,
    correctAnswers,
    isQuick,
  } = location.state || {}

  const incorrectQuestions = JSON.parse(localStorage.getItem("incorrectQuestions") || "[]")

  const totalQuestions = correctAnswers + incorrectQuestions?.length
  const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
  const expressionScore =
    expressionsArray?.length > 0 ? (correctExpressions?.length / expressionsArray?.length) * 100 : 0
  const expressionpercentage = (incorrectExpressions?.length / totalQuestions) * 100
  const correctexpressionPercentage = (correctExpressions?.length / totalQuestions) * 100

  const getIncorrectQuestions = () => {
    if (SessiontypId == 1) return incorrectQuestions?.filter((item) => item && (item.WordText || item?.wordtext))
    return incorrectQuestions
  }

  const addAssessmentResult = async () => {
    const token = await getToken()
    try {
      const obj = {
        expressions: isQuick ? null : expressionsArray,
        correct: isQuick ? null : correctexpressionPercentage,
        incorrect: isQuick ? null : expressionpercentage,
        questions_array: getIncorrectQuestions(),
      }
      setLoading(true)
      const formData = new FormData()
      formData.append("UserID", userId)
      formData.append("Score", percentage)
      formData.append("SessionID", sessionId)
      formData.append("DisorderID", 1)
      if (isQuick) {
        formData.append("quick_assessment", "quick_assessment")
      }
      formData.append("emotion", JSON.stringify(obj))

      const validItems = articulationReport?.filter((item) => item !== undefined)

      const extractedWordIDs = validItems?.map((item) => item?.WordID || item?.id)
      const extractedSoundIDs = validItems?.map((item) => item?.SoundID)

      if (extractedWordIDs && extractedSoundIDs) {
        formData.append("WordIDList", JSON.stringify(extractedWordIDs))
        formData.append("SoundIDList", JSON.stringify(extractedSoundIDs))
      } else {
        return
      }

      formData.append("AssessmentDate", moment(new Date()).format("YYYY-MM-DD hh:mm:ss"))

      const response = await fetch(`${BaseURL}/add_assessment_result`, {
        method: "POST",
        body: formData,
        headers: { Authorization: "Bearer " + token },
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log("Assessment result added successfully", responseData)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || response.statusText)
      }
    } catch (error) {
      console.error("Error in addAssessmentResult:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReport = async () => {
    const token = await getToken()
    try {
      const response = await fetch(`${BaseURL}/get_Exercise_word_count/${userId}/1/`, {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      })
      if (response.ok) {
        const reportData = await response.json()
        let sum = 0
        const names = []
        for (const key in reportData) {
          if (reportData.hasOwnProperty(key)) {
            sum += reportData[key].Count / 4
            names.push(reportData[key].SoundName)
          }
        }
        updateUserDetail({ totalQuestion: sum })
        setSoundNames(names)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || response.statusText)
      }
    } catch (error) {
      console.error("Error fetching report:", error)
    }
  }

  const submitUserExercise = async () => {
    const token = await getToken()
    const obj = {
      expressions: isQuick ? null : expressionsArray,
      correct: isQuick ? null : correctexpressionPercentage,
      incorrect: isQuick ? null : expressionpercentage,
      questions_array: getIncorrectQuestions(),
    }
    const formData = new FormData()
    formData.append("UserID", userId)
    formData.append("DisorderID", 1)
    formData.append("SessionID", sessionId)
    formData.append("ExerciseDate", moment(new Date()).format("YYYY-MM-DD hh:mm:ss"))
    formData.append("SoundIDList", JSON.stringify(soundNames))
    formData.append("CompletionStatus", "complete")
    formData.append("CompletedQuestions", totalQuestions)
    formData.append("WordIDList", JSON.stringify([]))
    formData.append("Score", percentage)
    formData.append("TotalQuestions", totalQuestions)
    formData.append("emotion", JSON.stringify(obj))

    try {
      setLoading(true)
      const response = await fetch(`${BaseURL}/artic_user_exercise`, {
        method: "POST",
        body: formData,
        headers: { Authorization: "Bearer " + token },
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log("User exercise submitted successfully", responseData)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || response.statusText)
      }
    } catch (error) {
      console.error("Error in submitUserExercise:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [userId, articulationReport]) // Added articulationReport to dependencies

  useEffect(() => {
    const handleEffects = async () => {
      try {
        if (SessiontypId === 1) {
          await addAssessmentResult()
        }
        if (SessiontypId === 2) {
          await submitUserExercise()
        }
        await updateSession()
      } catch (error) {
        console.error("Error in effect:", error)
      }
    }

    handleEffects()
  }, [])

  const updateSession = async () => {
    const response = await endSession(sessionId, startTime, isQuick ? "quick_assessment_status" : "Completed", 1)
    console.log("Session updated:", response)
  }

  const onPressBack = () => {
    if (isQuick) {
      navigate(-2)
    } else {
      navigate("/home")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <CustomHeader
          title={
            isQuick
              ? "Quick Articulation Disorder Assessment Result Report"
              : SessiontypId === 2
                ? "Articulation Disorder Exercise Result Report"
                : "Articulation Disorder Assessment Result Report"
          }
          goBack={() => navigate(-1)}
        />

        <div className={`${expressionsArray ? "grid md:grid-cols-2 gap-6" : ""} flex justify-center w-full`}>
          <Card>
            <CardHeader>
              <CardTitle>Overall Score</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <CircularProgress percentage={percentage} />
            </CardContent>
          </Card>

          {expressionsArray?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Expression Analysis</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <CircularProgress percentage={expressionScore} />
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="mt-6">
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Correct Pronunciations</span>
                <span className="font-semibold">
                  {correctAnswers}/{totalQuestions}
                </span>
              </div>
              <Progress value={(correctAnswers / totalQuestions) * 100} />
            </div>

            {expressionsArray?.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Correct Expressions</span>
                  <span className="font-semibold">
                    {correctExpressions?.length}/{expressionsArray?.length}
                  </span>
                </div>
                <Progress value={expressionScore} />
              </div>
            )}

            {incorrectQuestions?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">List of incorrect Pronunciations:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {incorrectQuestions.map((question, index) => (
                    <div key={index} className="p-2 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                      <span>{isQuick ? question.wordtext : question.WordText}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={onPressBack}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ArticulationResult

