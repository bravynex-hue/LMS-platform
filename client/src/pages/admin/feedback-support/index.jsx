import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllFeedbackTicketsService,
  resolveFeedbackTicketService,
} from "@/services";

function FeedbackSupportPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadTickets() {
    setLoading(true);
    try {
      const res = await getAllFeedbackTicketsService();
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

  async function handleResolve(e, ticketId) {
    e?.preventDefault();
    e?.stopPropagation();
    
    try {
      const res = await resolveFeedbackTicketService(ticketId);
      if (res?.success) {
        toast({
          title: "Success",
          description: res.message || "Ticket marked as resolved",
        });
        loadTickets();
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to resolve ticket",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error resolving ticket:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to resolve ticket",
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

  const filteredTickets = statusFilter === "all" 
    ? tickets 
    : tickets.filter(t => t.status === statusFilter);

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Feedback & Support</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Handle complaints and support tickets from students and instructors
        </p>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No tickets found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="font-medium">{ticket.userName}</div>
                            <div className="text-sm text-gray-500">{ticket.userEmail}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {ticket.userType}
                        </span>
                      </TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(ticket)}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          {ticket.status !== "resolved" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleResolve(e, ticket._id)}
                            >
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">From:</label>
                <p className="text-sm text-gray-900">{selectedTicket.userName} ({selectedTicket.userEmail})</p>
                <p className="text-xs text-gray-500">{selectedTicket.userType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Message:</label>
                <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>
              {selectedTicket.adminResponse && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Admin Response:</label>
                  <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                    {selectedTicket.adminResponse}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
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
                {selectedTicket.status !== "resolved" && (
                  <Button
                    type="button"
                    onClick={async () => {
                      await handleResolve(null, selectedTicket._id);
                      setShowDetailsDialog(false);
                    }}
                  >
                    Mark as Resolved
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FeedbackSupportPage;

