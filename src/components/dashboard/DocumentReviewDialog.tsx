import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { format } from 'date-fns';

const reviewSchema = z.object({
  action: z.enum(['approve', 'reject']),
  feedback: z.string().trim(),
}).refine(
  (data) => {
    if (data.action === 'reject') {
      return data.feedback.length > 0 && data.feedback.length <= 1000;
    }
    return data.feedback.length <= 1000;
  },
  {
    message: 'Feedback is required for rejections and must be less than 1000 characters',
    path: ['feedback'],
  }
);

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

interface DocumentReviewDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewComplete: () => void;
}

const DocumentReviewDialog = ({
  document,
  open,
  onOpenChange,
  onReviewComplete,
}: DocumentReviewDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  if (!document) return null;

  const handleReview = async (action: 'approve' | 'reject') => {
    if (!user) {
      toast.error('You must be logged in to review documents');
      return;
    }

    try {
      // Validate inputs
      const validatedData = reviewSchema.parse({
        action,
        feedback: feedback.trim(),
      });

      setLoading(true);

      const { error } = await supabase
        .from('documents')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          feedback: validatedData.feedback || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', document.id);

      if (error) throw error;

      toast.success(
        `Document ${action === 'approve' ? 'approved' : 'rejected'} successfully!`
      );
      
      setFeedback('');
      onOpenChange(false);
      onReviewComplete();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error('Error reviewing document:', error);
        toast.error(error.message || 'Failed to review document');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    try {
      setPreviewLoading(true);
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      window.open(url, '_blank');
      
      // Clean up after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error previewing file:', error);
      toast.error('Failed to preview file');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Review Document</DialogTitle>
          <DialogDescription>
            Review and provide feedback on this student's document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Document Info */}
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{document.file_name}</p>
                </div>
                {document.document_categories && (
                  <Badge variant="outline">{document.document_categories.name}</Badge>
                )}
              </div>
              <Badge variant="default" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
                Pending
              </Badge>
            </div>

            {document.profiles && (
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">Submitted by:</p>
                <p className="font-medium">{document.profiles.full_name}</p>
                <p className="text-muted-foreground">{document.profiles.email}</p>
              </div>
            )}

            {document.description && (
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">Description:</p>
                <p>{document.description}</p>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Uploaded on {format(new Date(document.created_at), 'MMM d, yyyy h:mm a')}
            </div>

            {/* Preview and Download Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                disabled={previewLoading}
                className="flex-1"
              >
                {previewLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="space-y-2">
            <Label htmlFor="feedback">
              Feedback {feedback.trim().length === 0 && <span className="text-destructive">* (Required for rejection)</span>}
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback for the student..."
              disabled={loading}
              maxLength={1000}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">
              {feedback.length}/1000 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleReview('reject')}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Reject
            </Button>
            <Button
              onClick={() => handleReview('approve')}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentReviewDialog;
