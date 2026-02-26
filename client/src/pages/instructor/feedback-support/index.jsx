import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  submitFeedbackService,
  getMyFeedbackTicketsService,
} from "@/services";

function InstructorFeedbackSupportPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    setLoading(true);
    try {
      const res = await getMyFeedbackTicketsService();
      if (res?.success) {
        setTickets(res.data || []);
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to load tickets",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading tickets:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to load tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.subject.trim()) {
      toast({
        title: "Error",
        description: "Subject is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      toast({
        title: "Error",
        description: "Message must be at least 10 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await submitFeedbackService(formData);
      if (res?.success) {
        toast({
          title: "Success",
          description: res.message || "Feedback submitted successfully",
        });
        setFormData({ subject: "", message: "" });
        setShowCreateDialog(false);
        loadTickets();
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to submit feedback",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to submit feedback",
        variant: "destructive",
      });
    }
  }

  function handleViewDetails(ticket) {
    setSelectedTicket(ticket);
    setShowDetailsDialog(true);
  }

  function getStatusBadge(status) {
    switch (status) {
      case "resolved":
        return <Badge className="bg-green-100 text-green-700">Resolved</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>;
      case "open":
        return <Badge className="bg-yellow-100 text-yellow-700">Open</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-8 relative">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 fade-in">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter uppercase leading-tight">
              Support <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">Terminal</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mt-2">
              Bravynex Core Assistance Protocol v1.9
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="w-full sm:w-auto h-12 px-6 bg-white text-black hover:bg-gray-200 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-white/5 transition-all active:scale-95 group"
          >
            <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
            Initialize Ticket
          </Button>
        </div>

        {/* Tickets Table */}
        <div className="glass-card border-white/5 bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 sm:p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <h2 className="text-lg font-black text-white italic uppercase tracking-widest">Active Requests ({tickets.length})</h2>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          </div>
          
          <div className="p-6 sm:p-8">
            {loading ? (
              <div className="text-center py-20 text-[10px] font-black text-gray-600 uppercase tracking-widest animate-pulse italic">Synchronizing with Support Core...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                <MessageSquare className="w-16 h-16 mx-auto mb-6 text-gray-700 opacity-20" />
                <h3 className="text-gray-500 font-black uppercase tracking-widest text-xs italic">Buffer Empty: No Active Tickets Found</h3>
              </div>
            ) : (
              <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/20 custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white/5 border-b border-white/10 hover:bg-white/5">
                      <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-gray-500 text-[9px]">Subject Identity</TableHead>
                      <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-gray-500 text-[9px]">Protocol Status</TableHead>
                      <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-gray-500 text-[9px]">Timestamp</TableHead>
                      <TableHead className="px-6 py-4 font-black uppercase tracking-widest text-gray-500 text-[9px] text-right">Access Node</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-white/[0.03]">
                    {tickets.map((ticket) => (
                      <TableRow key={ticket._id} className="hover:bg-white/[0.02] transition-colors group">
                        <TableCell className="px-6 py-5">
                           <span className="font-bold text-white italic group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                              {ticket.subject}
                           </span>
                        </TableCell>
                        <TableCell className="px-6 py-5">
                           {ticket.status === 'resolved' ? (
                             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
                               <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                               Resolved
                             </span>
                           ) : ticket.status === 'in-progress' ? (
                             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[8px] font-black uppercase tracking-widest">
                               <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                               Active
                             </span>
                           ) : (
                             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-widest">
                               <div className="w-1 h-1 rounded-full bg-amber-500" />
                               Pending
                             </span>
                           )}
                        </TableCell>
                        <TableCell className="px-6 py-5 text-gray-500 text-[10px] font-medium italic">
                          {new Date(ticket.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </TableCell>
                        <TableCell className="px-6 py-5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(ticket)}
                            className="h-9 w-9 p-0 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10 transition-all active:scale-90"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl bg-[#0f172a] border-white/10 text-white rounded-3xl overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
            <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase leading-tight">
              Initialize <span className="text-blue-500">Ticket Node</span>
            </DialogTitle>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Specify issue parameters for protocol analysis</p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Subject Identity</label>
              <Input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief decryption of issue"
                maxLength={200}
                className="h-12 bg-white/5 border-white/10 rounded-xl text-white font-bold placeholder-gray-700 transition-all focus:ring-blue-500/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Data Payload</label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Log detailed issue parameters here..."
                rows={6}
                maxLength={2000}
                className="bg-white/5 border-white/10 rounded-2xl text-white font-medium placeholder-gray-700 transition-all focus:ring-blue-500/30 resize-none p-4"
              />
              <div className="flex justify-end pr-1">
                 <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">
                   {formData.message.length} / 2000 bits
                 </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                className="h-12 px-6 border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-black uppercase tracking-widest text-[10px]"
                onClick={() => {
                  setShowCreateDialog(false);
                  setFormData({ subject: "", message: "" });
                }}
              >
                Sync Cancel
              </Button>
              <Button type="submit" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                Transmit Node
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl bg-[#0f172a] border-white/10 text-white rounded-3xl overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
            <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase text-white truncate pr-8">
              {selectedTicket?.subject}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-1 px-1">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Node Activity Log</p>
            </div>
          </DialogHeader>
          {selectedTicket && (
            <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">Protocol Status</span>
                  <div className="pt-1">
                    {selectedTicket.status === 'resolved' ? (
                       <span className="text-emerald-500 font-black italic uppercase tracking-widest text-[11px]">RESOLVED</span>
                    ) : (
                       <span className="text-blue-500 font-black italic uppercase tracking-widest text-[11px]">ACTIVE / PROCESSING</span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                   <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">Initialization Time</span>
                   <p className="text-white font-bold italic text-[11px] pt-1">
                     {new Date(selectedTicket.createdAt).toLocaleString()}
                   </p>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 px-1">Original Transmission</span>
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl shadow-inner italic leading-relaxed text-sm text-gray-300">
                  {selectedTicket.message}
                </div>
              </div>

              {selectedTicket.adminResponse && (
                <div className="space-y-3 relative group">
                  <div className="absolute -inset-1 bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-all rounded-3xl" />
                  <div className="relative">
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-500/80 px-1">Admin Resolution Node</span>
                    <div className="mt-3 bg-[#1e293b]/80 border border-blue-500/20 p-5 rounded-2xl shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 blur-2xl rounded-full" />
                       <div className="relative z-10 text-blue-100 italic leading-relaxed text-sm font-medium">
                        {selectedTicket.adminResponse}
                       </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetailsDialog(false)}
                  className="h-11 px-8 border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-black uppercase tracking-widest text-[10px]"
                >
                  Close Access
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InstructorFeedbackSupportPage;
