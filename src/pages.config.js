import AdminDashboard from './pages/AdminDashboard';
import Classes from './pages/Classes';
import CourseDetail from './pages/CourseDetail';
import Courses from './pages/Courses';
import DailyChallenges from './pages/DailyChallenges';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import LiveClassDetail from './pages/LiveClassDetail';
import LiveClasses from './pages/LiveClasses';
import LiveClassesHub from './pages/LiveClassesHub';
import MemberProfile from './pages/MemberProfile';
import Notifications from './pages/Notifications';
import ProfileSettings from './pages/ProfileSettings';
import QuizGame from './pages/QuizGame';
import QuizHome from './pages/QuizHome';
import ReplaysHub from './pages/ReplaysHub';
import TutorialsHub from './pages/TutorialsHub';
import UserProgress from './pages/UserProgress';
import Login from './pages/Login';
import __Layout from './Layout.jsx';

export const PAGES = {
  "AdminDashboard": AdminDashboard,
  "Classes": Classes,
  "CourseDetail": CourseDetail,
  "Courses": Courses,
  "DailyChallenges": DailyChallenges,
  "Dashboard": Dashboard,
  "Leaderboard": Leaderboard,
  "LiveClassDetail": LiveClassDetail,
  "LiveClasses": LiveClasses,
  "LiveClassesHub": LiveClassesHub,
  "MemberProfile": MemberProfile,
  "Notifications": Notifications,
  "ProfileSettings": ProfileSettings,
  "QuizGame": QuizGame,
  "QuizHome": QuizHome,
  "ReplaysHub": ReplaysHub,
  "TutorialsHub": TutorialsHub,
  "UserProgress": UserProgress,
  "Login": Login,
};

export const pagesConfig = {
  mainPage: "Dashboard",
  Pages: PAGES,
  Layout: __Layout,
};
