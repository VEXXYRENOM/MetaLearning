import { useState, useEffect, useRef } from "react";
import { 
  Users, BookOpen, Clock, TrendingUp, Download, 
  ChevronLeft, Calendar, Filter, Star, 
  BarChart3, LayoutDashboard, Settings
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface AnalyticsData {
  totalLessons: number;
  totalStudents: number;
  totalSessions: number;
  subjectDistribution: { subject: string; count: number }[];
  recentSessions: any[];
  quizData?: any[];
}

export function TeacherAnalyticsPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile) return;
    fetchAnalytics();
  }, [profile]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      // 1. Lessons
      const { count: lessonCount, data: lessonData } = await supabase
        .from("lessons")
        .select("subject", { count: "exact" })
        .eq("teacher_id", profile?.id);

      // 2. Sessions
      const { data: sessions } = await supabase
        .from("sessions")
        .select("id, created_at, is_active, lesson_id, lessons(title, subject)")
        .eq("teacher_id", profile?.id)
        .order("created_at", { ascending: false });

      // 3. Students
      let totalStudents = 0;
      let quizData: any[] = [];
      if (sessions && sessions.length > 0) {
        const sessionIds = sessions.map(s => s.id);
        const { count } = await supabase
          .from("student_joins")
          .select("*", { count: "exact", head: true })
          .in("session_id", sessionIds);
        totalStudents = count || 0;

        // Fetch Quiz Data
        const { data: qData } = await supabase
          .from("quiz_performance")
          .select("*")
          .in("session_id", sessionIds);
        if (qData) quizData = qData;
      }

      // Subject distribution
      const subjCounts: Record<string, number> = {};
      (lessonData || []).forEach((l: any) => {
        subjCounts[l.subject] = (subjCounts[l.subject] || 0) + 1;
      });
      const distribution = Object.entries(subjCounts).map(([subject, count]) => ({ subject, count }));

      setData({
        totalLessons: lessonCount || 0,
        totalStudents,
        totalSessions: sessions?.length || 0,
        subjectDistribution: distribution,
        recentSessions: sessions || [],
        quizData: quizData
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0f172a"
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`MetaLearning_Report_${new Date().toLocaleDateString()}.pdf`);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingSpinner t={t} />;

  return (
    <div className="analytics-container" dir={t("dir") === "rtl" ? "rtl" : "ltr"}>
      {/* Navigation Sidebar (Mini) */}
      <aside className="mini-sidebar">
        <Link to="/teacher/create" className="sidebar-link">
          <ChevronLeft size={24} />
        </Link>
        <div className="sidebar-divider" />
        <Link to="/teacher/create" className="sidebar-link">
          <LayoutDashboard size={22} />
        </Link>
        <div className="sidebar-link active">
          <BarChart3 size={22} />
        </div>
        <Settings size={22} className="sidebar-link disabled" />
      </aside>

      <main className="analytics-main" ref={dashboardRef}>
        <header className="analytics-header">
          <div className="header-info">
            <h1>{t("analytics.title")}</h1>
            <p className="text-muted">Detailed insight into your 3D classroom performance</p>
          </div>
          <button 
            className={`btn-export ${exporting ? 'loading' : ''}`} 
            onClick={handleExportPDF}
            disabled={exporting}
          >
            {exporting ? "Generating..." : <><Download size={18} /> {t("analytics.btn_export")}</>}
          </button>
        </header>

        {/* Stats Grid */}
        <section className="stats-grid">
          <StatCard 
            icon={<BookOpen className="text-blue" />} 
            label={t("analytics.total_lessons")} 
            value={data?.totalLessons || 0} 
            trend={data?.totalLessons ? `${data.totalLessons} lessons created` : "No lessons yet"}
          />
          <StatCard 
            icon={<Users className="text-green" />} 
            label={t("analytics.total_students")} 
            value={data?.totalStudents || 0} 
            trend={data?.totalStudents ? `Across ${data.totalSessions} sessions` : "No students yet"}
          />
          <StatCard 
            icon={<Clock className="text-purple" />} 
            label={t("analytics.total_sessions")} 
            value={data?.totalSessions || 0} 
            trend={data?.totalSessions ? "Sessions recorded" : "No sessions yet"}
          />
          <StatCard 
            icon={<TrendingUp className="text-orange" />} 
            label="Avg. Students / Session" 
            value={data?.totalSessions ? Math.round((data.totalStudents / data.totalSessions) || 0) : 0} 
            trend={data?.totalSessions ? "Calculated from real data" : "No data yet"}
          />
        </section>

        <div className="content-row">
          {/* Chart Section */}
          <section className="chart-section glass-card">
            <div className="card-header">
              <h3><BarChart3 size={20} /> {t("analytics.subject_dist")}</h3>
              <Filter size={18} className="text-muted" />
            </div>
            <div className="custom-chart">
              {data?.subjectDistribution.map((item, idx) => (
                <div key={idx} className="chart-bar-wrap">
                  <div className="bar-label">{item.subject}</div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${(item.count / data.totalLessons) * 100}%`,
                        background: `linear-gradient(90deg, #3b82f6aa, #a855f7aa)` 
                      }} 
                    />
                  </div>
                  <div className="bar-value">{item.count}</div>
                </div>
              ))}
              {(!data?.subjectDistribution || data.subjectDistribution.length === 0) && (
                <p className="text-muted italic">No data available yet</p>
              )}
            </div>
          </section>

          {/* Activity Section */}
          <section className="activity-section glass-card">
            <div className="card-header">
              <h3><Calendar size={20} /> {t("analytics.recent_sessions")}</h3>
              <Star size={18} className="text-yellow" />
            </div>
            <div className="session-list">
              {data?.recentSessions.slice(0, 5).map((session, idx) => (
                <div key={idx} className="session-item">
                  <div className="session-icon">
                    {session.is_active ? <div className="pulse-dot" /> : <Clock size={16} />}
                  </div>
                  <div className="session-details">
                    <h4>{session.lessons?.title || "Unnamed Lesson"}</h4>
                    <p>{new Date(session.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className={`session-status ${session.is_active ? 'active' : 'ended'}`}>
                    {session.is_active ? "Live" : "Ended"}
                  </div>
                </div>
              ))}
              {(!data?.recentSessions || data.recentSessions.length === 0) && (
                <p className="text-muted text-center py-4">No sessions recorded</p>
              )}
            </div>
          </section>
        </div>
      </main>

      <style>{`
        .analytics-container {
          display: flex;
          min-height: 100vh;
          background: #020617;
          color: #f8fafc;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .mini-sidebar {
          width: 70px;
          background: #0f172a;
          border-right: 1px solid #1e293b;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 0;
          gap: 1.5rem;
        }

        .sidebar-link {
          color: #64748b;
          padding: 10px;
          border-radius: 12px;
          transition: all 0.2s;
          cursor: pointer;
          text-decoration: none;
        }

        .sidebar-link:hover, .sidebar-link.active {
          color: #a855f7;
          background: rgba(168, 85, 247, 0.1);
        }

        .sidebar-divider {
          width: 30px;
          height: 1px;
          background: #1e293b;
        }

        .analytics-main {
          flex: 1;
          padding: 2rem 3rem;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
        }

        .analytics-header h1 {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(to right, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .text-muted { color: #94a3b8; font-size: 0.95rem; }

        .btn-export {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-export:hover { 
          background: #2563eb; 
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .stat-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          padding: 1.5rem;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          position: relative;
          overflow: hidden;
        }

        .stat-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }

        .stat-value { font-size: 2.2rem; font-weight: 800; margin: 0; }
        .stat-label { color: #64748b; font-weight: 600; font-size: 0.9rem; }
        .stat-trend { font-size: 0.8rem; color: #10b981; }

        .content-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        .glass-card {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 24px;
          padding: 2rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .card-header h3 {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
        }

        /* Chart Custom Styles */
        .chart-bar-wrap { margin-bottom: 1.5rem; }
        .bar-label { font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.5rem; }
        .bar-track { height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; position: relative; }
        .bar-fill { height: 100%; border-radius: 4px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
        .bar-value { font-size: 0.85rem; color: #fff; margin-top: 0.25rem; text-align: right; }

        /* Session List Styles */
        .session-list { display: flex; flex-direction: column; gap: 1rem; }
        .session-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255,255,255,0.02);
          border-radius: 16px;
          border: 1px solid transparent;
          transition: all 0.2s;
        }
        .session-item:hover { border-color: rgba(255,255,255,0.05); background: rgba(255,255,255,0.04); }
        .session-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #1e293b; border-radius: 8px; color: #64748b; }
        .session-details h4 { margin: 0; font-size: 1rem; }
        .session-details p { margin: 2px 0 0 0; font-size: 0.8rem; color: #64748b; }
        .session-status { margin-left: auto; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 6px; }
        .session-status.active { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .session-status.ended { background: rgba(100, 116, 139, 0.1); color: #64748b; }

        .pulse-dot {
          width: 8px; height: 8px; background: #10b981; border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .loading-screen {
          height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: #020617; color: white; gap: 1.5rem;
        }
        .spinner { width: 50px; height: 50px; border: 4px solid rgba(255,255,255,0.1); border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 1024px) {
          .content-row { grid-template-columns: 1fr; }
          .mini-sidebar { display: none; }
          .analytics-main { padding: 1.5rem; }
        }
      `}</style>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: any) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-trend">{trend}</div>
    </div>
  );
}

function LoadingSpinner({ t }: any) {
  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p style={{ fontWeight: 600, letterSpacing: '1px' }}>{t("auth.loading")}</p>
    </div>
  );
}
