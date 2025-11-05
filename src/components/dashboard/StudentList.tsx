const StudentList = ({ students, onRefresh }: any) => {
  if (students.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No students assigned</p>;
  }
  return <div>Student list coming soon</div>;
};

export default StudentList;