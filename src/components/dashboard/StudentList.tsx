import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, User, Mail, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DocumentReviewDialog from './DocumentReviewDialog';

interface Student {
  id: string;
  full_name: string;
  email: string;
}

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string | null;
  feedback: string | null;
  created_at: string;
  document_categories: {
    name: string;
  } | null;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

interface StudentListProps {
  students: Student[];
  onRefresh: () => void;
}

const StudentList = ({ students, onRefresh }: StudentListProps) => {
  const [studentDocuments, setStudentDocuments] = useState<Record<string, Document[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  useEffect(() => {
    if (students.length > 0) {
      fetchStudentDocuments();
    } else {
      setLoading(false);
    }
  }, [students]);

  useEffect(() => {
    if (students.length === 0) return;

    // Subscribe to realtime document updates
    const channel = supabase
      .channel('mentor-documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
        },
        () => {
          // Refresh documents when changes occur
          fetchStudentDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [students]);

  const fetchStudentDocuments = async () => {
    try {
      setLoading(true);
      const studentIds = students.map(s => s.id);

      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select('*, document_categories(name)')
        .in('student_id', studentIds)
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;

      // Fetch profiles for all students
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles
      const profilesMap = (profilesData || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, { full_name: string; email: string }>);

      // Group documents by student and add profile info
      const grouped = (docsData || []).reduce((acc, doc) => {
        const studentId = doc.student_id;
        if (!acc[studentId]) {
          acc[studentId] = [];
        }
        acc[studentId].push({
          ...doc,
          profiles: profilesMap[studentId] || null,
        } as Document);
        return acc;
      }, {} as Record<string, Document[]>);

      setStudentDocuments(grouped);
    } catch (error) {
      console.error('Error fetching student documents:', error);
      toast.error('Failed to load student documents');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (document: Document) => {
    setSelectedDocument(document);
    setReviewDialogOpen(true);
  };

  const handleReviewComplete = () => {
    fetchStudentDocuments();
    onRefresh();
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No students assigned</p>
        <p className="text-sm text-muted-foreground mt-2">
          Students will appear here once they are assigned to you
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading students...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        {students.map((student) => {
          const documents = studentDocuments[student.id] || [];
          const pendingCount = documents.filter(d => d.status === 'pending').length;

          return (
            <Card key={student.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Student Header */}
                <div className="bg-muted/50 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{student.full_name}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {student.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {documents.length} document{documents.length !== 1 ? 's' : ''}
                      </Badge>
                      {pendingCount > 0 && (
                        <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {pendingCount} pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Documents List */}
                <div className="p-4">
                  {documents.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">No documents submitted yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{doc.file_name}</p>
                              {doc.document_categories && (
                                <p className="text-xs text-muted-foreground">
                                  {doc.document_categories.name}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {doc.status === 'pending' ? (
                              <Button
                                size="sm"
                                onClick={() => handleReviewClick(doc)}
                              >
                                Review
                              </Button>
                            ) : (
                              <Badge
                                variant={doc.status === 'approved' ? 'default' : 'destructive'}
                                className={
                                  doc.status === 'approved'
                                    ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                    : ''
                                }
                              >
                                {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DocumentReviewDialog
        document={selectedDocument}
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        onReviewComplete={handleReviewComplete}
      />
    </>
  );
};

export default StudentList;
