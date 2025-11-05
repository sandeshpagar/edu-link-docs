import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, FileCheck, Users, Shield, Upload, CheckCircle, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Welcome to <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">MentorLink</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A secure, centralized platform connecting mentors and students. Streamline document management, 
            track progress, and build transparency in educational administration.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="text-lg px-8">
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Everyone</h2>
          <p className="text-muted-foreground text-lg">Different roles, one powerful platform</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">For Students</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Upload className="h-5 w-5 mt-0.5 text-primary" />
                  <span>Upload documents directly to your mentor</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 mt-0.5 text-primary" />
                  <span>Track submission status in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageSquare className="h-5 w-5 mt-0.5 text-primary" />
                  <span>Receive feedback on your submissions</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-secondary/50 transition-colors">
            <CardContent className="pt-6 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">For Mentors</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <FileCheck className="h-5 w-5 mt-0.5 text-secondary" />
                  <span>Review and approve documents efficiently</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="h-5 w-5 mt-0.5 text-secondary" />
                  <span>Monitor all assigned students in one place</span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageSquare className="h-5 w-5 mt-0.5 text-secondary" />
                  <span>Provide detailed feedback when needed</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent/50 transition-colors">
            <CardContent className="pt-6 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">For Admins</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Users className="h-5 w-5 mt-0.5 text-accent" />
                  <span>Manage users and assignments</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileCheck className="h-5 w-5 mt-0.5 text-accent" />
                  <span>Configure document categories</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 mt-0.5 text-accent" />
                  <span>View system-wide analytics</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students and mentors already using MentorLink to streamline their 
              document management and build transparency in education.
            </p>
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
              Create Your Account
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Index;
