import { Button } from '@/components/ui/button';
import { GraduationCap, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardHeaderProps {
  userRole: string;
  onSignOut: () => void;
}

const DashboardHeader = ({ userRole, onSignOut }: DashboardHeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">MentorLink</h1>
            <p className="text-sm text-muted-foreground capitalize">{userRole} Dashboard</p>
          </div>
        </div>
        <Button variant="outline" onClick={onSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;