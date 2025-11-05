import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Upload, FileText, LogOut, Loader2 } from 'lucide-react';
import DocumentUploadDialog from './DocumentUploadDialog';
import DocumentList from './DocumentList';
import DashboardHeader from './DashboardHeader';

const StudentDashboard = () => {
  const { user, signOut } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [stats, setStats] = useState({ approved: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [mentor, setMentor] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch documents
      const { data: docsData } = await supabase
        .from('documents')
        .select(`
          *,
          category:document_categories(name, description)
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (docsData) {
        setDocuments(docsData);
        // Calculate stats
        setStats({
          approved: docsData.filter(d => d.status === 'approved').length,
          pending: docsData.filter(d => d.status === 'pending').length,
          rejected: docsData.filter(d => d.status === 'rejected').length,
        });
      }

      // Fetch mentor info
      const { data: assignmentData } = await supabase
        .from('mentor_student_assignments')
        .select('mentor:profiles(full_name, email)')
        .eq('student_id', user.id)
        .single();

      if (assignmentData) {
        setMentor(assignmentData.mentor);
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
      <DashboardHeader userRole="student" onSignOut={signOut} />

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{documents.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Mentor Info */}
        {mentor && (
          <Card>
            <CardHeader>
              <CardTitle>Your Mentor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold">{mentor.full_name}</p>
                  <p className="text-sm text-muted-foreground">{mentor.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>Submit your documents for review</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUploadDialog onUploadComplete={fetchDashboardData} />
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>My Documents</CardTitle>
            <CardDescription>View and track all your submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentList documents={documents} userRole="student" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StudentDashboard;