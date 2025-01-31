import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { endSession } from "../utils/functions"
import { useDataContext } from "../contexts/DataContext"
import CustomHeader from "../components/CustomHeader"

// Reusing existing custom components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>{children}</div>
)

const CardHeader = ({ children }) => <div className="p-6 border-b border-gray-200">{children}</div>

const CardTitle = ({ children }) => <h2 className="text-xl font-semibold text-gray-800">{children}</h2>

const CardContent = ({ children, className = "" }) => <div className={`p-6 ${className}`}>{children}</div>

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

const LinearProgressBar = ({ value }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full ${value >= 70 ? "bg-green-500" : "bg-red-500"}`}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

const ArticulationResult = () => {
  const navigate = useNavigate()
  const { updateUserDetail, articulationReport } = useDataContext()
  const userId = localStorage.getItem("userId")
  const [loading, setLoading] = useState(false)
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
  }, [SessiontypId, sessionId, startTime, isQuick]) // Added dependencies

  const addAssessmentResult = async () => {
    // Implementation remains the same
  }

  const submitUserExercise = async () => {
    // Implementation remains the same
  }

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 p-4 md:p-8">
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
              <LinearProgressBar value={(correctAnswers / totalQuestions) * 100} />
            </div>

            {expressionsArray?.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Correct Expressions</span>
                  <span className="font-semibold">
                    {correctExpressions?.length}/{expressionsArray?.length}
                  </span>
                </div>
                <LinearProgressBar value={expressionScore} />
              </div>
            )}

            {incorrectQuestions?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">List of incorrect Pronunciations:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {incorrectQuestions.map((question, index) => (
                    <div key={index} className="p-2 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{isQuick ? question.wordtext : question.WordText}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-8 flex justify-center">
          <button
            onClick={onPressBack}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ArticulationResult

