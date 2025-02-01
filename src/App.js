import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// Import your components
import SignInPage from './pages/SigninPage';
import HomePage from './pages/HomePage';
import WaitVerifyingNew from './pages/WaitingVerifyNew';
import ScanFaceInstruction from './pages/ScanFaceInstruction';
import FaceAuthenticationScreen from './pages/FaceAuthenticationScreen';
import SignUpPage from './pages/SignUpPage';
import { DataProvider } from './contexts/DataContext';
import SetupProfilePage4 from './pages/SetupProfilePage4';
import SetupProfilePage3 from './pages/SetupProfilePage3';
import OtpScreen from './pages/OtpScreen';
import AllAssessmentPage from './pages/AllAssesmentPage';
import InstructionsPage from './pages/InstructionsPage';
import SpeechArticulationPage from './pages/SpeachArticukationPage';
import SetupProfilePage from './pages/SetupProfilePage';
import SetupProfilePage1 from './pages/SerupProfilePage1';
import SetupProfilePage2 from './pages/SetupProfilePage2';
import ExercisePage from './pages/ExercisePage';
import AllExercisesPage from './pages/AllExercisesPage';
import StammeringPassages from './pages/StammeringPassages'
import PassagePage from './pages/PassagePage';
import BaselineQuestions from './pages/BaselineQuestions';
import SufferingDisease from './pages/SufferingDisease';
import ProfileSetupSuccessPage from './pages/ProfileSuccess';
import VoiceDisorderPage from './pages/VoiceDisorderPage';
import ReceptiveLanguageInstructions from './pages/ReceptiveLanguageInstructions';
import ReceptiveAssessment from './pages/ReceptiveAssessment';
import LanguageInstructions from './pages/LanguageInstruction';
import ExpressiveAssessment from './pages/ExpressiveAssement';
import SpeechExercisePage from './pages/SpeachExcersicePage';
import StammeringExercisePage from './pages/StammeringExcersizePage';
import VoiceExerciseGame from './pages/VoiceExcersizeGame';
import VoiceExercisePage from './pages/VoiceExcersizePage';
import ReceptiveExercise from './pages/ReceptiveExercise';
import TherapistName from './pages/TherapistName';
import TherapistProfilePage from './pages/TherapistProfile';
import AssessmentPage from './pages/AssesmentPage';
import ResultExpressiveLanguage from './pages/ResultExpressiveLanguage'
import ResultReportArticulation from './pages/ResultReportArticulation';
import ReportsPage from './pages/ReportsPage';
import VoiceReport from './pages/VoiceReport';
import PassagePageTwo from './pages/PassagePageTwo';
import Games from './pages/Games';
import PassageResults from './pages/PassageResults';
import StammeringReport from './pages/StammeringReport';
import ExpressiveExercise from './pages/ExpressiveExercise';
import ProfilePage from './pages/ProfilePage';
import TherapistsPage from './pages/main/TherapistsPage';
import QuickArticulation from './pages/QuickArticulation';
import QuickExpressive from './pages/QuickExpressive';
import QuickReceptive from './pages/QuickReceptive';
import QuickStammering from './pages/QuickStammering';
import QuickVoice from './pages/QuickVoice';
import AvatarTherapistName from './pages/AvatarTharapistPage';
import Settings from './pages/Settings';
import UpdateAvatar from './pages/UpdateAvatar';
import ChangePassword from './pages/ChangePassword';
import BioDataPage from './pages/BioDataPage';
import AboutUs from './pages/AboutUs';
import ManageSubscriptions from './pages/ManageSubcriptions';
import SplashScreen from './pages/SplashScreen';
import GettingStartedPageOne from './pages/GettingStartedPageOne';
import GettingStartedPageTwo from './pages/GettingStartedPageTwo';
import GettingStartedPageThree from './pages/GettingStartedPageThree';

function App() {
  return (

    <DataProvider> {/* Wrap your entire app or relevant component in DataProvider */}
      <Router>
        <Routes>

          {/* <Route path="/splash" element={<SplashScreen />} /> */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/gettingstartone" element={<GettingStartedPageOne />} />
          <Route path="/gettingstarttwo" element={<GettingStartedPageTwo />} />
          <Route path="/gettingstarthree" element={<GettingStartedPageThree />} />
          <Route path="/SignIn" element={<SignInPage />} />
          <Route path="/signUpPage" element={<SignUpPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/setupProfile4" element={<SetupProfilePage4 />} />
          <Route path="/setupProfile3" element={<SetupProfilePage3 />} />
          <Route path="/scanfaceInstruction" element={<ScanFaceInstruction />} />
          <Route path="/faceauthenticationscreen" element={<FaceAuthenticationScreen />} />
          <Route path="/waitverifyingnew" element={<WaitVerifyingNew />} />
          <Route path="/otpScreen" element={<OtpScreen />} />

          <Route path="/setupProfile2" element={<SetupProfilePage2 />} />
          <Route path="/setupProfile1" element={<SetupProfilePage1 />} />
          <Route path="/setupProfile" element={<SetupProfilePage />} />
          <Route path="/ExercisePage" element={<ExercisePage />} />
          <Route path="/AllExercisesPage" element={<AllExercisesPage />} />
          <Route path="/assessmentPage" element={<AssessmentPage />} />
          <Route path="/allAssessmentPage" element={<AllAssessmentPage />} />
          <Route path="/instructionsPage" element={<InstructionsPage />} />
          <Route path="/speechArticulationPage" element={<SpeechArticulationPage />} />
          <Route path="/StammeringPassages" element={<StammeringPassages />} />
          <Route path="/PassagePage" element={<PassagePage />} />
          <Route path="/baselineQuestions" element={<BaselineQuestions />} />
          <Route path="/sufferingDisease" element={<SufferingDisease />} />
          <Route path="/profileSetupSuccess" element={<ProfileSetupSuccessPage />} />
          <Route path="/voiceDisorderPage" element={<VoiceDisorderPage />} />
          <Route path="/ReceptiveLanguageInstructions" element={<ReceptiveLanguageInstructions />} />
          <Route path="/ReceptiveAssessment" element={<ReceptiveAssessment />} />
          <Route path="/LanguageInstructions" element={<LanguageInstructions />} />
          <Route path="/expressive-assessment" element={<ExpressiveAssessment />} />
          <Route path="/speechExcercisePage" element={<SpeechExercisePage />} />
          <Route path="/stammeringExercisePage" element={<StammeringExercisePage />} />
          <Route path="/VoiceExerciseGame" element={<VoiceExerciseGame />} />
          <Route path="/VoiceExercisePage" element={<VoiceExercisePage />} />
          <Route path="/ReceptiveExercise" element={<ReceptiveExercise />} />
          <Route path="/Assesments" element={<AssessmentPage />} />
          <Route path="/therapistsPage" element={<TherapistsPage />} />
          <Route path="/therapistProfile" element={<TherapistProfilePage />} />
          <Route path="/AvatarTherapistName" element={<TherapistName />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/result-expressive-language" element={<ResultExpressiveLanguage />} />
          <Route path="/resultReport" element={<ResultReportArticulation />} />
          <Route path="/reportsPage" element={<ReportsPage />} />
          <Route path="/voiceReport" element={<VoiceReport />} />
          <Route path="/passagePage2" element={<PassagePageTwo />} />
          <Route path="/exercisePage" element={<ExercisePage />} />
          <Route path="/games" element={<Games />} />
          <Route path="/passage-results" element={<PassageResults />} />
          <Route path="/stammeringReport" element={<StammeringReport />} />
          <Route path="/ExpressiveExercise" element={<ExpressiveExercise />} />
          <Route path="/quick-articulation" element={<QuickArticulation />} />
          <Route path="/quick-stammering" element={<QuickStammering />} />
          <Route path="/quick-voice" element={<QuickVoice />} />
          <Route path="/quick-receptive" element={<QuickReceptive />} />
          <Route path="/quick-expressive" element={<QuickExpressive />} />
          <Route path="/conversationalAvatar" element={<AvatarTherapistName />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/UpdateAvatar" element={<UpdateAvatar />} />
          <Route path="/ChangePassword" element={<ChangePassword />} />
          <Route path="/BioData" element={<BioDataPage />} />
          <Route path="/aboutUs" element={<AboutUs />} />
          <Route path="/ManageSubcription" element={<ManageSubscriptions />} />


        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;
