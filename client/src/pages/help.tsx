import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HelpCircle,
  MessageSquare,
  BookOpen,
  Search,
  Mail,
  Phone,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Send,
  Lightbulb,
  Shield,
  User,
  Settings,
  Bug
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: "open" | "pending" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: Date;
  lastUpdate: Date;
}

export default function Help() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [supportForm, setSupportForm] = useState({
    type: "general",
    subject: "",
    description: "",
    email: ""
  });

  const [supportTickets] = useState<SupportTicket[]>([
    {
      id: "NOCT-001",
      subject: "Unable to join night circles",
      status: "pending",
      priority: "medium",
      createdAt: new Date("2024-01-20"),
      lastUpdate: new Date("2024-01-21")
    },
    {
      id: "NOCT-002",
      subject: "Feature request: Dark mode themes",
      status: "resolved",
      priority: "low",
      createdAt: new Date("2024-01-15"),
      lastUpdate: new Date("2024-01-18")
    }
  ]);

  const faqData: FAQItem[] = [
    {
      category: "Getting Started",
      question: "What is Nocturne?",
      answer: "Nocturne is a social platform designed specifically for night owls, insomniacs, and deep thinkers who are most active during late-night hours. It's a digital sanctuary for meaningful conversations, anonymous sharing, and authentic connections."
    },
    {
      category: "Getting Started",
      question: "How do I create an account?",
      answer: "You can sign up using your Replit account or Google account. Simply click the 'Sign In' button on the homepage and follow the authentication process."
    },
    {
      category: "Features",
      question: "What are Whispers?",
      answer: "Whispers are anonymous short messages you can share with the community. They're perfect for sharing thoughts, feelings, or insights without revealing your identity."
    },
    {
      category: "Features",
      question: "How do Night Circles work?",
      answer: "Night Circles are themed group conversations where like-minded individuals can discuss specific topics. You can join existing circles or create your own based on your interests."
    },
    {
      category: "Features",
      question: "What is the Mind Maze?",
      answer: "The Mind Maze is a space for philosophical discussions, brain teasers, and intellectual challenges. It's designed to stimulate deep thinking and meaningful debates."
    },
    {
      category: "Privacy",
      question: "How anonymous are my posts?",
      answer: "When you post anonymously, your username and profile are not displayed. However, moderators can still identify users if needed for community safety purposes."
    },
    {
      category: "Privacy",
      question: "Can I control who sees my content?",
      answer: "Yes, you have granular privacy controls. You can set visibility for individual posts, control who can message you, and manage your profile visibility."
    },
    {
      category: "Privacy",
      question: "How is my data protected?",
      answer: "We use industry-standard encryption and security measures. Your personal information is never shared with third parties without your consent."
    },
    {
      category: "Account",
      question: "How do I change my password?",
      answer: "Since Nocturne uses external authentication (Replit/Google), password changes are managed through your authentication provider's account settings."
    },
    {
      category: "Account",
      question: "Can I delete my account?",
      answer: "Yes, you can request account deletion from the Settings page. This will permanently remove all your data and content from our platform."
    },
    {
      category: "Technical",
      question: "What browsers are supported?",
      answer: "Nocturne works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience."
    },
    {
      category: "Technical",
      question: "Why can't I see some features?",
      answer: "Some features may require specific permissions (like notifications) or may be gradually rolling out to users. Check your browser settings and ensure notifications are enabled."
    }
  ];

  const filteredFAQ = faqData.filter(item =>
    searchQuery === "" ||
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(faqData.map(item => item.category)));

  const handleSupportSubmit = () => {
    if (!supportForm.subject || !supportForm.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Support Request Submitted",
      description: "We'll get back to you within 24 hours.",
    });

    setSupportForm({
      type: "general",
      subject: "",
      description: "",
      email: ""
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-600";
      case "pending": return "bg-yellow-600";
      case "resolved": return "bg-green-600";
      default: return "bg-gray-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "text-green-400";
      case "medium": return "text-yellow-400";
      case "high": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <HelpCircle className="h-8 w-8 text-purple-400" />
            Help & Support
          </h1>
          <p className="text-gray-400">Get help with Nocturne and find answers to common questions</p>
        </div>

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="faq" className="data-[state=active]:bg-purple-600">
              <BookOpen className="h-4 w-4 mr-2" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-purple-600">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Support
            </TabsTrigger>
            <TabsTrigger value="tickets" className="data-[state=active]:bg-purple-600">
              <Clock className="h-4 w-4 mr-2" />
              My Tickets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-6">
            {/* Search */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search frequently asked questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Help Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <User className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">Getting Started</h3>
                  <p className="text-gray-400 text-sm">Learn the basics of using Nocturne</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">Privacy & Safety</h3>
                  <p className="text-gray-400 text-sm">Understand privacy controls and safety features</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Settings className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">Account Settings</h3>
                  <p className="text-gray-400 text-sm">Customize your profile and preferences</p>
                </CardContent>
              </Card>
            </div>

            {/* FAQ by Category */}
            <div className="space-y-6">
              {categories.map((category) => {
                const categoryFAQ = filteredFAQ.filter(item => item.category === category);
                if (categoryFAQ.length === 0) return null;

                return (
                  <Card key={category} className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="space-y-2">
                        {categoryFAQ.map((item, index) => (
                          <AccordionItem
                            key={index}
                            value={`${category}-${index}`}
                            className="border-slate-600"
                          >
                            <AccordionTrigger className="text-gray-300 hover:text-white">
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-400">
                              {item.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Form */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Submit a Support Request</CardTitle>
                  <CardDescription className="text-gray-400">
                    Describe your issue and we'll help you resolve it
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Request Type</label>
                    <select
                      value={supportForm.type}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                    >
                      <option value="general">General Question</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="account">Account Issue</option>
                      <option value="privacy">Privacy Concern</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Subject *</label>
                    <Input
                      value={supportForm.subject}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Description *</label>
                    <Textarea
                      value={supportForm.description}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Please provide detailed information about your issue..."
                      rows={5}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Contact Email</label>
                    <Input
                      type="email"
                      value={supportForm.email}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com (optional)"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <Button
                    onClick={handleSupportSubmit}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Other Ways to Reach Us</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <Mail className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="text-white">Email Support</p>
                        <p className="text-gray-400 text-sm">support@nocturne.app</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-white">Community Forum</p>
                        <p className="text-gray-400 text-sm">Join our community discussions</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <ExternalLink className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="text-white">Documentation</p>
                        <p className="text-gray-400 text-sm">Comprehensive guides and tutorials</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-900/20 border-blue-800/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-blue-300 font-semibold mb-2">Pro Tip</h3>
                        <p className="text-blue-200 text-sm">
                          For faster support, include your browser version, device type, and steps to reproduce the issue when reporting bugs.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Response Times</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">General Questions</span>
                      <span className="text-white">24-48 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Bug Reports</span>
                      <span className="text-white">12-24 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Account Issues</span>
                      <span className="text-white">6-12 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Privacy Concerns</span>
                      <span className="text-green-400">2-6 hours</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Your Support Tickets</CardTitle>
                <CardDescription className="text-gray-400">
                  Track the status of your support requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {supportTickets.length > 0 ? (
                  <div className="space-y-4">
                    {supportTickets.map((ticket) => (
                      <div key={ticket.id} className="p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-white font-medium">{ticket.subject}</h3>
                            <p className="text-gray-400 text-sm">Ticket #{ticket.id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getStatusColor(ticket.status)} text-white`}>
                              {ticket.status}
                            </Badge>
                            <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Created: {ticket.createdAt.toLocaleDateString()}</span>
                          <span>Updated: {ticket.lastUpdate.toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No support tickets found</p>
                    <p className="text-sm mt-2">Submit a support request if you need help!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}