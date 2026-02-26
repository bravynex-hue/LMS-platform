import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Eye, Zap, ArrowRight, ShieldCheck, Mail, AlertCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  submitFeedbackService,
  getMyFeedbackTicketsService,
} from "@/services";

function StudentFeedbackSupportPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({ subject: "", message: "" });

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    setLoading(true);
    try {
      const res = await getMyFeedbackTicketsService();
      if (res?.success) setTickets(res.data || []);
    } catch (error) {
      console.error("Error loading tickets:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({ title: "Validation Error", description: "Subject and message are required", variant: "destructive" });
      return;
    }
    try {
      const res = await submitFeedbackService(formData);
      if (res?.success) {
        toast({ title: "Ticket Submitted", description: "Your support request has been logged." });
        setFormData({ subject: "", message: "" });
        setShowCreateDialog(false);
        loadTickets();
      }
    } catch (error) {
      toast({ title: "Submission Failed", description: "Could not submit ticket at this time.", variant: "destructive" });
    }
  }

  function handleViewDetails(ticket) {
    setSelectedTicket(ticket);
    setShowDetailsDialog(true);
  }

  function getStatusBadge(status) {
    const styles = {
      resolved: "bg-green-500/10 text-green-400 border-green-500/20",
      "in-progress": "bg-blue-500/10 text-blue-400 border-blue-500/20",
      open: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    };
    return (
      <Badge className={`${styles[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"} border font-bold uppercase tracking-tighter hover:bg-transparent`}>
        {status}
      </Badge>
    );
  }

  return (
    <div className="min-h-screen text-gray-200" style={{ background: "var(--bg-dark)" }}>
      {/* Background elements */}
      <div className="orb orb-purple absolute w-[600px] h-[600px] -top-80 -left-20 opacity-[0.03] pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-[0.05] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-24 space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <span className="section-badge">
              <ShieldCheck className="w-3 h-3" />
              Support Center
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Feedback & <br />
              <span style={{ background: "linear-gradient(135deg, #a855f7, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Technical Support
              </span>
            </h1>
            <p className="text-gray-400 max-w-md">
              Need help? Log a support ticket or share your feedback. Our admin team will review and respond promptly.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Ticket
          </Button>
        </div>

        {/* Tickets Grid/Table */}
        <div className="glass-card overflow-hidden border-white/10">
          <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
             <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
               <Mail className="w-4 h-4 text-blue-400" />
               Support History
             </h3>
             <span className="text-xs font-bold text-gray-500 uppercase">{tickets.length} Registered Records</span>
          </div>
          
          <div className="p-0 overflow-x-auto">
            {loading ? (
              <div className="text-center py-20">
                 <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                 <p className="text-xs font-bold text-gray-600 tracking-widest uppercase">Fetching Tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-24 text-gray-500">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-8 h-8 text-gray-700" />
                </div>
                <h4 className="text-white font-bold mb-2">No Support Records</h4>
                <p className="text-sm text-gray-600 max-w-xs mx-auto mb-8">You haven't submitted any support requests yet. Click the button above to start.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-white/[0.01]">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-gray-500 font-black uppercase text-[10px] tracking-widest h-14 px-8">Subject</TableHead>
                    <TableHead className="text-gray-500 font-black uppercase text-[10px] tracking-widest h-14">Status</TableHead>
                    <TableHead className="text-gray-500 font-black uppercase text-[10px] tracking-widest h-14">Timestamp</TableHead>
                    <TableHead className="text-gray-500 font-black uppercase text-[10px] tracking-widest h-14 text-right px-8">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((t) => (
                    <TableRow key={t._id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <TableCell className="font-bold text-white px-8 truncate max-w-[300px]">{t.subject}</TableCell>
                      <TableCell>{getStatusBadge(t.status)}</TableCell>
                      <TableCell className="text-gray-500 font-medium text-xs">
                        {new Date(t.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(t)}
                          className="w-10 h-10 rounded-xl hover:bg-white/10 hover:text-blue-400 group-hover:scale-110 transition-all text-gray-500"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-[#0a0a0c] border-white/10 text-gray-200 p-0 overflow-hidden rounded-2xl max-w-xl">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-8 py-6 border-b border-white/5">
               <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">Submit Support Request</DialogTitle>
               <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Encrypted direct channel to admin team</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Inquiry Subject</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Access issue with React module"
                  className="bg-white/5 border-white/10 rounded-xl h-12 text-gray-100 placeholder:text-gray-600 focus:border-blue-500/50"
                  maxLength={150}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Detailed Message</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your problem or feedback in detail..."
                  rows={5}
                  className="bg-white/5 border-white/10 rounded-xl text-gray-100 placeholder:text-gray-600 focus:border-blue-500/50 resize-none"
                  maxLength={1500}
                />
              </div>
              
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="ghost" type="button" onClick={() => setShowCreateDialog(false)} className="text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:bg-white/5">Cancel</Button>
                <Button type="submit" className="bg-white text-black hover:bg-gray-200 px-8 font-black uppercase tracking-widest text-[10px]">Log Ticket</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
           <DialogContent className="bg-[#0a0a0c] border-white/10 text-gray-200 p-0 overflow-hidden rounded-2xl max-w-2xl">
              <div className="bg-white/[0.02] border-b border-white/5 px-8 pt-10 pb-6 flex items-start justify-between">
                 <div className="space-y-2">
                   {getStatusBadge(selectedTicket?.status)}
                   <DialogTitle className="text-2xl font-black text-white leading-tight">{selectedTicket?.subject}</DialogTitle>
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                     Ticket ID: {selectedTicket?._id?.slice(-8).toUpperCase()} • Created on {new Date(selectedTicket?.createdAt).toLocaleDateString()}
                   </p>
                 </div>
                 <Button variant="ghost" onClick={() => setShowDetailsDialog(false)} className="rounded-full w-8 h-8 p-0 hover:bg-white/5 text-gray-500">
                    <X className="w-4 h-4" />
                 </Button>
              </div>
              
              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                 <div className="space-y-3">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">User Message</span>
                    <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl text-sm leading-relaxed text-gray-300 italic">
                       "{selectedTicket?.message}"
                    </div>
                 </div>

                 {selectedTicket?.adminResponse && (
                   <div className="space-y-3 animate-slide-up">
                      <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Zap className="w-3 h-3" /> Admin Response
                      </span>
                      <div className="bg-purple-500/5 border border-purple-500/20 p-6 rounded-2xl text-sm leading-relaxed text-gray-200 relative">
                         <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 bg-purple-600 rounded-full text-[8px] font-black uppercase tracking-widest text-white shadow-lg">Official Response</div>
                         {selectedTicket.adminResponse}
                      </div>
                   </div>
                 )}
                 
                 {!selectedTicket?.adminResponse && (
                    <div className="flex items-center gap-3 bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-xl">
                       <AlertCircle className="w-4 h-4 text-yellow-500" />
                       <span className="text-xs font-bold text-yellow-500/70 uppercase tracking-widest">Awaiting Admin Review</span>
                    </div>
                 )}
              </div>
              
              <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-end">
                 <Button onClick={() => setShowDetailsDialog(false)} className="bg-white/5 border border-white/10 hover:border-white/20 text-gray-300 px-8 font-black uppercase tracking-widest text-[10px]">Close Archive</Button>
              </div>
           </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}

export default StudentFeedbackSupportPage;
