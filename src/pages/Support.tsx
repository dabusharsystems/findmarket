import { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Send,
  Loader2,
  HelpCircle,
  FileText,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(1000),
});

const faqs = [
  {
    question: 'How does Findmarket work?',
    answer: 'Findmarket is a reverse marketplace where buyers post what they need and sellers compete to offer the best deals. Simply create a listing describing what you\'re looking for, and verified sellers will submit bids with their offers.',
  },
  {
    question: 'How much does it cost to post a listing?',
    answer: 'Posting listings is completely free for buyers. Sellers pay a small fee per bid (KES 10) or can subscribe to a monthly plan for unlimited or bulk bidding.',
  },
  {
    question: 'How do I become a seller?',
    answer: 'Register for an account and select "Seller" as your role. You can then browse listings and submit bids on items you can fulfill.',
  },
  {
    question: 'Is my contact information safe?',
    answer: 'Yes! Your contact details are hidden from sellers until you explicitly choose to connect with them. Only after you accept a bid will your information be shared.',
  },
  {
    question: 'How do I pay for a service or product?',
    answer: 'Findmarket facilitates connections between buyers and sellers. Once connected, you arrange payment directly with the seller. We recommend using secure payment methods.',
  },
  {
    question: 'What if I have issues with a seller?',
    answer: 'Contact our support team with details of the issue. We take all complaints seriously and will investigate. Repeated violations result in seller suspension.',
  },
];

const Support = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      toast({
        title: 'Validation Error',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    // Simulate sending message
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Message Sent!',
      description: 'We\'ll get back to you within 24 hours.',
    });
    
    setFormData({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-hero-gradient py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl font-bold text-white mb-4">How Can We Help?</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Our support team is here to assist you with any questions or concerns.
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-accent" />
              Send Us a Message
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-xl border border-border p-6">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select 
                  value={formData.subject} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, subject: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="account">Account Issues</SelectItem>
                    <SelectItem value="billing">Billing & Payments</SelectItem>
                    <SelectItem value="seller">Report a Seller</SelectItem>
                    <SelectItem value="bug">Report a Bug</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe your issue or question..."
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" className="w-full" variant="accent" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Contact Info & FAQ */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <Mail className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">support@findmarket.ke</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <Phone className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">+254 700 000 000</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">Nairobi, Kenya</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card rounded-xl border border-border p-4 text-center hover:shadow-soft transition-shadow">
                <div className="p-3 rounded-lg bg-product/10 inline-flex mb-2">
                  <HelpCircle className="h-5 w-5 text-product" />
                </div>
                <p className="text-sm font-medium">FAQs</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center hover:shadow-soft transition-shadow">
                <div className="p-3 rounded-lg bg-service/10 inline-flex mb-2">
                  <FileText className="h-5 w-5 text-service" />
                </div>
                <p className="text-sm font-medium">Guides</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center hover:shadow-soft transition-shadow">
                <div className="p-3 rounded-lg bg-accent/10 inline-flex mb-2">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <p className="text-sm font-medium">Community</p>
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="bg-card rounded-xl border border-border">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="px-4 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
