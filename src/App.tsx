import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LessonPage } from "./pages/LessonPage";
import { ImageTo3DExperiencePage } from "./pages/ImageTo3DExperiencePage";
import { TeacherDashboardPage } from "./pages/TeacherDashboardPage";
import { AIGenerationHubPage } from "./pages/AIGenerationHubPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lesson/:lessonId" element={<LessonPage />} />
        <Route 
          path="/experience/hub" 
          element={<AIGenerationHubPage />} 
        />
        <Route
          path="/experience/image-to-3d"
          element={<ImageTo3DExperiencePage key="image" defaultInputType="image" />}
        />
        <Route
          path="/experience/text-to-3d"
          element={<ImageTo3DExperiencePage key="text" defaultInputType="text" />}
        />
        <Route path="/teacher/create" element={<TeacherDashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
