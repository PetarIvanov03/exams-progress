import { HashRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useCourses } from './hooks/useCourses';
import { useAssessments } from './hooks/useAssessments';
import { AuthForm } from './components/AuthForm';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CoursePage } from './pages/CoursePage';

function App() {
  const { session, loading, login, register, logout } = useAuth();
  const { courses, createCourse, updateCourse, deleteCourse } = useCourses(session);
  const { assessments, createAssessment, updateAssessment, deleteAssessment } = useAssessments(session);

  if (loading) {
    return <div className="loading-screen">Loading…</div>;
  }

  if (!session) {
    return <AuthForm onLogin={login} onRegister={register} />;
  }

  return (
    <HashRouter>
      <Layout onLogout={logout} userEmail={session.user.email ?? ''}>
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                courses={courses}
                assessments={assessments}
                onCreateCourse={createCourse}
                onUpdateCourse={updateCourse}
                onDeleteCourse={deleteCourse}
              />
            }
          />
          <Route
            path="/course/:id"
            element={
              <CoursePage
                courses={courses}
                assessments={assessments}
                onUpdateCourse={updateCourse}
                onDeleteCourse={deleteCourse}
                onCreateAssessment={createAssessment}
                onUpdateAssessment={updateAssessment}
                onDeleteAssessment={deleteAssessment}
              />
            }
          />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
