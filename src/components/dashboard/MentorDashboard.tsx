import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import StudentList from './StudentList';

const MentorDashboard = () => {
  const { user, signOut } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalStudents: 0, pendingReviews: 0, totalDocuments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch assigned students
      const { data: assignmentsData } = await supabase
        .from('mentor_student_assignments')
        .select('student_id')
        .eq('mentor_id', user.id);

      if (assignmentsData && assignmentsData.length > 0) {
        const studentIds = assignmentsData.map(a => a.student_id);
        
        // Fetch student profiles
        const { data: studentsData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', studentIds);
        
        // Fetch documents for all students
        const { data: docsData } = await supabase
          .from('documents')
          .select('*')
          .in('student_id', studentIds);

        // Calculate stats
        const pendingCount = docsData?.filter(d => d.status === 'pending').length || 0;
        
        setStudents(studentsData || []);
        setStats({
          totalStudents: studentsData?.length || 0,
          pendingReviews: pendingCount,
          totalDocuments: docsData?.length || 0,
        });
      } else {
        setStudents([]);
        setStats({ totalStudents: 0, pendingReviews: 0, totalDocuments: 0 });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <DashboardHeader userRole="mentor" onSignOut={signOut} />

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pendingReviews}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalDocuments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>My Students</CardTitle>
            <CardDescription>Review and manage your assigned students</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentList students={students} onRefresh={fetchDashboardData} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MentorDashboard;