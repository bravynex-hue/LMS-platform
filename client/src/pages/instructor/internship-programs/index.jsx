import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Users, Calendar, DollarSign, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { createInternshipProgramService, listInstructorProgramsService } from "@/services";
import { useToast } from "@/hooks/use-toast";

function InternshipProgramsPage() {
  const { auth } = useAuth();
  const { toast } = useToast();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    pricing: 0,
  });

  useEffect(() => {
    loadPrograms();
  }, [auth?.user?._id]);

  async function loadPrograms() {
    if (!auth?.user?._id) return;
    setLoading(true);
    try {
      const res = await listInstructorProgramsService(auth.user._id);
      if (res?.success) {
        setPrograms(res.data || []);
      }
    } catch (error) {
      console.error("Error loading programs:", error);
      toast({
        title: "Error",
        description: "Failed to load internship programs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProgram(e) {
    e.preventDefault();
    if (!auth?.user?._id) return;

    try {
      const payload = {
        ...formData,
        instructorId: auth.user._id,
        instructorName: auth.user.userName,
        pricing: Number(formData.pricing) || 0,
      };
      const res = await createInternshipProgramService(payload);
      if (res?.success) {
        toast({
          title: "Success",
          description: "Internship program created successfully",
        });
        setShowCreateForm(false);
        setFormData({ title: "", description: "", startDate: "", endDate: "", pricing: 0 });
        loadPrograms();
      } else {
        throw new Error(res?.message || "Failed to create program");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create internship program",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Internship Programs</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Create and manage internship programs for your interns
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Program
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Internship Program</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProgram} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Full Stack Development Internship"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Program description..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pricing ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.pricing}
                  onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Program</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ title: "", description: "", startDate: "", endDate: "", pricing: 0 });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Internship Programs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : programs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No internship programs yet. Create your first program!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Program Title</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow key={program._id}>
                      <TableCell className="font-medium">{program.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>{program.students?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {program.startDate
                          ? new Date(program.startDate).toLocaleDateString()
                          : "Not set"}
                      </TableCell>
                      <TableCell>
                        {program.endDate
                          ? new Date(program.endDate).toLocaleDateString()
                          : "Not set"}
                      </TableCell>
                      <TableCell>${program.pricing || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
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
    </div>
  );
}

export default InternshipProgramsPage;

