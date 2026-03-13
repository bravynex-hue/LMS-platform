import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, Plus, Eye, HelpCircle } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Feedback & Support</h1>
            <p className="text-xs text-gray-500">Submit feedback or support requests to admin</p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm px-5 shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Tickets Table */}
      <div className="border border-white/5 bg-[#0f172a]/60 backdrop-blur rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">My Tickets ({tickets.length})</h2>
        </div>
        
        <div className="p-5">
          {loading ? (
            <div className="text-center py-14 text-sm text-gray-600">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-14 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-700 opacity-30" />
              <h3 className="text-gray-500 font-medium text-sm">No tickets yet</h3>
              <p className="text-xs text-gray-600 mt-1">Click "New Ticket" to submit feedback</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-white/10 rounded-xl bg-black/20 custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/5 border-b border-white/10 hover:bg-white/5">
                    <TableHead className="px-5 py-3.5 font-semibold text-gray-500 text-xs">Subject</TableHead>
                    <TableHead className="px-5 py-3.5 font-semibold text-gray-500 text-xs">Status</TableHead>
                    <TableHead className="px-5 py-3.5 font-semibold text-gray-500 text-xs">Date</TableHead>
                    <TableHead className="px-5 py-3.5 font-semibold text-gray-500 text-xs text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-white/[0.03]">
                  {tickets.map((ticket) => (
                    <TableRow key={ticket._id} className="hover:bg-white/[0.02] transition-colors group">
                      <TableCell className="px-5 py-4">
                         <span className="font-medium text-white text-sm group-hover:text-blue-400 transition-colors">
                            {ticket.subject}
                         </span>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                         {ticket.status === 'resolved' ? (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                             <div className="w-1 h-1 rounded-full bg-emerald-400" />
                             Resolved
                           </span>
                         ) : ticket.status === 'in-progress' ? (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                             <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                             In Progress
                           </span>
                         ) : (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                             <div className="w-1 h-1 rounded-full bg-amber-400" />
                             Open
                           </span>
                         )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-sm">
                        {new Date(ticket.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(ticket)}
                          className="h-8 w-8 p-0 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10 transition-all"
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

      {/* Create Ticket Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg bg-[#0f172a] border-white/10 text-white rounded-2xl overflow-hidden shadow-2xl">
          <DialogHeader className="p-5 border-b border-white/5 bg-white/[0.02]">
            <DialogTitle className="text-lg font-bold text-white">
              Create Support Ticket
            </DialogTitle>
            <p className="text-xs text-gray-500 mt-1">Describe your issue or feedback</p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Subject</label>
              <Input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief description of your issue"
                maxLength={200}
                className="h-11 bg-white/5 border-white/10 rounded-xl text-white text-sm placeholder-gray-600 transition-all focus:ring-blue-500/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Message</label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Provide details about your issue or feedback..."
                rows={5}
                maxLength={2000}
                className="bg-white/5 border-white/10 rounded-xl text-white text-sm placeholder-gray-600 transition-all focus:ring-blue-500/30 resize-none p-3"
              />
              <div className="flex justify-end">
                 <p className="text-xs text-gray-600">
                   {formData.message.length} / 2000
                 </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl text-sm font-medium"
                onClick={() => {
                  setShowCreateDialog(false);
                  setFormData({ subject: "", message: "" });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold px-6 shadow-lg shadow-blue-500/20 transition-all">
                Submit Ticket
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg bg-[#0f172a] border-white/10 text-white rounded-2xl overflow-hidden shadow-2xl">
          <DialogHeader className="p-5 border-b border-white/5 bg-white/[0.02]">
            <DialogTitle className="text-lg font-bold text-white truncate pr-8">
              {selectedTicket?.subject}
            </DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500 font-medium">Status</span>
                  <div className="mt-1">
                    {selectedTicket.status === 'resolved' ? (
                       <span className="text-emerald-400 font-bold text-sm">Resolved</span>
                    ) : selectedTicket.status === 'in-progress' ? (
                       <span className="text-blue-400 font-bold text-sm">In Progress</span>
                    ) : (
                       <span className="text-amber-400 font-bold text-sm">Open</span>
                    )}
                  </div>
                </div>
                <div>
                   <span className="text-xs text-gray-500 font-medium">Created</span>
                   <p className="text-white text-sm mt-1">
                     {new Date(selectedTicket.createdAt).toLocaleString()}
                   </p>
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-500 font-medium">Your Message</span>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl mt-1.5 text-sm text-gray-300 leading-relaxed">
                  {selectedTicket.message}
                </div>
              </div>

              {selectedTicket.adminResponse && (
                <div>
                  <span className="text-xs text-blue-400 font-medium">Admin Response</span>
                  <div className="mt-1.5 bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl text-sm text-blue-100 leading-relaxed">
                    {selectedTicket.adminResponse}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetailsDialog(false)}
                  className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl text-sm font-medium"
                >
                  Close
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
