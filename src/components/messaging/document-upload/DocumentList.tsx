
import React from "react";
import { Badge } from "@/components/ui/badge";
import { File, Check, X, Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { documentTypes } from "./DocumentTypeSelect";

type Document = Tables<'application_documents'>;

interface DocumentListProps {
  documents: Document[];
}

const DocumentList: React.FC<DocumentListProps> = ({ documents }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <Check className="h-4 w-4 text-role-agent" />;
      case 'rejected': return <X className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-role-agent/10 text-role-agent';
      case 'rejected': return 'bg-destructive/10 text-destructive';
      default: return 'bg-warning/10 text-warning';
    }
  };

  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium">Uploaded Documents</h4>
      {documents.map((doc) => (
        <div 
          key={doc.id} 
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div className="flex items-center gap-3">
            <File className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">{doc.file_name}</p>
              <p className="text-xs text-muted-foreground">
                {documentTypes.find(t => t.value === doc.document_type)?.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(doc.verification_status)}
            <Badge className={getStatusColor(doc.verification_status)}>
              {doc.verification_status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
