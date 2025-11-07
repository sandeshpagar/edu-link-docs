import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText, Calendar, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  document_categories: {
    name: string;
  } | null;
}

interface DocumentListProps {
  documents: Document[];
  userRole: string;
}

const DocumentList = ({ documents: initialDocuments, userRole }: DocumentListProps) => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);

  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  useEffect(() => {
    // Subscribe to realtime updates
    const channel = supabase
      .channel('documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the full document with category info
            const { data } = await supabase
              .from('documents')
              .select('*, document_categories(name)')
              .eq('id', payload.new.id)
              .single();
            
            if (data) {
              setDocuments((prev) => [data as Document, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            // Fetch the updated document with category info
            const { data } = await supabase
              .from('documents')
              .select('*, document_categories(name)')
              .eq('id', payload.new.id)
              .single();
            
            if (data) {
              setDocuments((prev) =>
                prev.map((doc) => (doc.id === data.id ? data as Document : doc))
              );
            }
          } else if (payload.eventType === 'DELETE') {
            setDocuments((prev) => prev.filter((doc) => doc.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    const variants = {
      pending: 'default',
      approved: 'default',
      rejected: 'destructive',
    } as const;

    const colors = {
      pending: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
      approved: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
      rejected: '',
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No documents yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Upload your first document to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {doc.file_name}
                </CardTitle>
                {doc.document_categories && (
                  <p className="text-sm text-muted-foreground">
                    {doc.document_categories.name}
                  </p>
                )}
              </div>
              {getStatusBadge(doc.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {doc.description && (
              <div>
                <p className="text-sm text-muted-foreground">{doc.description}</p>
              </div>
            )}

            {doc.feedback && (
              <div className="bg-muted p-3 rounded-md space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" />
                  Feedback
                </div>
                <p className="text-sm">{doc.feedback}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Uploaded {format(new Date(doc.created_at), 'MMM d, yyyy')}
                </div>
                {doc.reviewed_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Reviewed {format(new Date(doc.reviewed_at), 'MMM d, yyyy')}
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(doc.file_path, doc.file_name)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DocumentList;
