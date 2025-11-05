import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

const DocumentUploadDialog = ({ onUploadComplete }: { onUploadComplete: () => void }) => {
  return (
    <Button>
      <Upload className="h-4 w-4 mr-2" />
      Upload Document
    </Button>
  );
};

export default DocumentUploadDialog;