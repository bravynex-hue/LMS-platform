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
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Feedback & Support</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Submit feedback or report issues to the admin team
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-800 hover:to-black text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Support Tickets ({tickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No tickets yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket._id}>
                      <TableCell className="font-medium">{ticket.subject}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(ticket)}
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
        </CardContent>
      </Card>

      {/* Create Ticket Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Subject</label>
              <Input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief description of your issue"
                maxLength={200}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Message</label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your issue or feedback in detail..."
                rows={6}
                maxLength={2000}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.message.length}/2000 characters
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setFormData({ subject: "", message: "" });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Submit Ticket</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Your Message:</label>
                <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {selectedTicket.message}
                </p>
              </div>
              {selectedTicket.adminResponse && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Admin Response:</label>
                  <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap bg-blue-50 p-3 rounded border border-blue-200">
                    {selectedTicket.adminResponse}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Created:</label>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(selectedTicket.createdAt).toLocaleString()}
                </p>
              </div>
              {selectedTicket.resolvedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Resolved At:</label>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(selectedTicket.resolvedAt).toLocaleString()}
                  </p>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
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
