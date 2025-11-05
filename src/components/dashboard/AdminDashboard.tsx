import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import AdminUsers from './admin/AdminUsers';
import AdminCategories from './admin/AdminCategories';
import AdminAssignments from './admin/AdminAssignments';

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, totalStudents: 0, totalMentors: 0, totalDocuments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch user stats
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id');

      // Fetch role counts
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role');

      // Fetch document count
      const { data: docsData } = await supabase
        .from('documents')
        .select('id');

      const studentCount = rolesData?.filter(r => r.role === 'student').length || 0;
      const mentorCount = rolesData?.filter(r => r.role === 'mentor').length || 0;

      setStats({
        totalUsers: profilesData?.length || 0,
        totalStudents: studentCount,
        totalMentors: mentorCount,
        totalDocuments: docsData?.length || 0,
      });
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
      <DashboardHeader userRole="admin" onSignOut={signOut} />

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalStudents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mentors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats.totalMentors}</div>
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

        {/* Admin Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>System Management</CardTitle>
            <CardDescription>Manage users, categories, and assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="users" className="space-y-4">
                <AdminUsers onUpdate={fetchDashboardData} />
              </TabsContent>
              
              <TabsContent value="categories" className="space-y-4">
                <AdminCategories />
              </TabsContent>
              
              <TabsContent value="assignments" className="space-y-4">
                <AdminAssignments />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;