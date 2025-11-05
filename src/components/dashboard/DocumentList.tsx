const DocumentList = ({ documents, userRole }: any) => {
  if (documents.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No documents yet</p>;
  }
  return <div>Document list coming soon</div>;
};

export default DocumentList;