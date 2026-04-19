import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthPage } from "./pages/AuthPage";
import { StudentJoinPage } from "./pages/StudentJoinPage";
import { HomePage } from "./pages/HomePage";
import { LessonPage } from "./pages/LessonPage";
import { ImageTo3DExperiencePage } from "./pages/ImageTo3DExperiencePage";
import { TeacherDashboardPage } from "./pages/TeacherDashboardPage";
import { AIGenerationHubPage } from "./pages/AIGenerationHubPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/join" element={<StudentJoinPage />} />
          <Route path="/lesson/:lessonId" element={<LessonPage />} />
          
          <Route 
            path="/experience/hub" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <AIGenerationHubPage />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/experience/image-to-3d"
            element={
              <ProtectedRoute requiredRole="teacher">
                <ImageTo3DExperiencePage key="image" defaultInputType="image" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/experience/text-to-3d"
            element={
              <ProtectedRoute requiredRole="teacher">
                <ImageTo3DExperiencePage key="text" defaultInputType="text" />
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/teacher/create" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherDashboardPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
