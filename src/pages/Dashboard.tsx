import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import MentorDashboard from '@/components/dashboard/MentorDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !userRole) {
    return null;
  }

  return (
    <>
      {userRole === 'student' && <StudentDashboard />}
      {userRole === 'mentor' && <MentorDashboard />}
      {userRole === 'admin' && <AdminDashboard />}
    </>
  );
};

export default Dashboard;