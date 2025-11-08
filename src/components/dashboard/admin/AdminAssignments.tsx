import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type Assignment = {
  id: string;
  mentor_id: string;
  student_id: string;
  mentor_name: string;
  student_name: string;
};

type User = {
  id: string;
  full_name: string;
};

const AdminAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({ mentor_id: '', student_id: '' });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: mentorRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'mentor');

      const { data: studentRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'student');

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name');

      const mentorsList = profiles?.filter(p => 
        mentorRoles?.some(r => r.user_id === p.id)
      ) || [];

      const studentsList = profiles?.filter(p => 
        studentRoles?.some(r => r.user_id === p.id)
      ) || [];

      setMentors(mentorsList);
      setStudents(studentsList);

      const { data: assignmentsData } = await supabase
        .from('mentor_student_assignments')
        .select('id, mentor_id, student_id');

      const assignmentsWithNames = assignmentsData?.map(assignment => ({
        ...assignment,
        mentor_name: profiles?.find(p => p.id === assignment.mentor_id)?.full_name || 'Unknown',
        student_name: profiles?.find(p => p.id === assignment.student_id)?.full_name || 'Unknown',
      })) || [];

      setAssignments(assignmentsWithNames);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.mentor_id || !formData.student_id) {
      toast({
        title: 'Error',
        description: 'Please select both mentor and student',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('mentor_student_assignments')
        .insert({
          mentor_id: formData.mentor_id,
          student_id: formData.student_id,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Assignment created successfully',
      });

      setCreateOpen(false);
      setFormData({ mentor_id: '', student_id: '' });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedAssignment) return;

    try {
      const { error } = await supabase
        .from('mentor_student_assignments')
        .delete()
        .eq('id', selectedAssignment.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Assignment deleted successfully',
      });

      setDeleteOpen(false);
      setSelectedAssignment(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openDeleteDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setDeleteOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Student-Mentor Assignments</h3>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Assign Student to Mentor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="mentor">Mentor</Label>
                <Select value={formData.mentor_id} onValueChange={(value) => setFormData({ ...formData, mentor_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="student">Student</Label>
                <Select value={formData.student_id} onValueChange={(value) => setFormData({ ...formData, student_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create Assignment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mentor</TableHead>
              <TableHead>Student</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No assignments found
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.mentor_name}</TableCell>
                  <TableCell>{assignment.student_name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(assignment)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the assignment between {selectedAssignment?.mentor_name} and {selectedAssignment?.student_name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminAssignments;
