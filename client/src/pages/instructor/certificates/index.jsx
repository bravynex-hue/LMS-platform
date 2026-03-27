import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, CheckCircle, XCircle, Users } from "lucide-react";
import {
  fetchInstructorCourseListService,
  fetchInstructorCourseDetailsService,
  listApprovedCertificatesService,
  approveCertificateService,
  approveCertificatesBulkService,
  instructorRevokeCertificateService,
  revokeCertificatesBulkService,
} from "@/services";

function InstructorCertificatesPage() {
  const { auth } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [students, setStudents] = useState([]);
  const [approvedMap, setApprovedMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [selected, setSelected] = useState({});

  const allSelected = useMemo(() => {
    if (!students.length) return false;
    return students.every((s) => selected[s.studentId]);
  }, [students, selected]);

  const anySelected = useMemo(() => Object.values(selected).some(Boolean), [selected]);

  async function loadCourses() {
    const res = await fetchInstructorCourseListService();
    if (res?.success) setCourses(res.data || []);
  }

  async function loadCourseStudentsAndApprovals(id) {
    if (!id) return;
    setLoading(true);
    try {
      const [details, approvals] = await Promise.all([
        fetchInstructorCourseDetailsService(id),
        listApprovedCertificatesService(id),
      ]);

      const baseStudents = details?.success ? (details.data?.students || []) : [];

      const map = {};
      const emailFromApproval = {};
      if (approvals?.success) {
        (approvals.data || []).forEach((a) => {
          map[a.studentId] = true;
          if (a.studentEmail) emailFromApproval[a.studentId] = a.studentEmail;
        });
      }
      setApprovedMap(map);

      const nameFromApproval = {};
      if (approvals?.success) {
        (approvals.data || []).forEach((a) => {
          if (a.studentName) nameFromApproval[a.studentId] = a.studentName;
        });
      }
      
      const merged = baseStudents.map((s) => ({
        ...s,
        studentName: s.studentName || nameFromApproval[s.studentId] || s.userName || s.studentId || "",
        studentEmail: s.studentEmail || emailFromApproval[s.studentId] || s.userEmail || s.email || "",
        userName: s.userName || nameFromApproval[s.studentId] || "",
        userEmail: s.userEmail || emailFromApproval[s.studentId] || "",
      })).sort((a, b) => new Date(b.enrollmentDate || 0) - new Date(a.enrollmentDate || 0));
      setStudents(merged);
      setSelected({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => { loadCourseStudentsAndApprovals(courseId); }, [courseId]);

  function toggleSelectAll() {
    if (allSelected) {
      setSelected({});
    } else {
      const next = {};
      students.forEach((s) => { next[s.studentId] = true; });
      setSelected(next);
    }
  }

  async function toggleApproval(student) {
    if (!courseId || !student?.studentId) return;
    const isApproved = approvedMap[student.studentId];
    setWorking(true);
    try {
      if (isApproved) {
        const res = await instructorRevokeCertificateService({ courseId, studentId: student.studentId });
        if (res?.success) setApprovedMap((m) => ({ ...m, [student.studentId]: false }));
      } else {
        const res = await approveCertificateService({ courseId, studentId: student.studentId, approverId: auth?.user?._id });
        if (res?.success) setApprovedMap((m) => ({ ...m, [student.studentId]: true }));
      }
      await loadCourseStudentsAndApprovals(courseId);
    } finally {
      setWorking(false);
    }
  }

  async function bulkApprove() {
    if (!courseId) return;
    const ids = students.filter((s) => selected[s.studentId] && !approvedMap[s.studentId]).map((s) => s.studentId);
    if (!ids.length) return;
    setWorking(true);
    try {
      const payload = { courseId, studentIds: ids, approverId: auth?.user?._id };
      console.log("Bulk approve payload being sent:", payload);
      const res = await approveCertificatesBulkService(payload);
      if (res?.success) toast({ title: "Success", description: `${res.count || ids.length} certificates approved` });
      await loadCourseStudentsAndApprovals(courseId);
    } catch (err) {
      console.error("Bulk approve error:", err);
      toast({ title: "Error", description: err?.response?.data?.message || "Bulk approval failed", variant: "destructive" });
    } finally {
      setWorking(false);
    }
  }

  async function bulkRevoke() {
    if (!courseId) return;
    const ids = students.filter((s) => selected[s.studentId] && approvedMap[s.studentId]).map((s) => s.studentId);
    if (!ids.length) return;
    setWorking(true);
    try {
      const res = await revokeCertificatesBulkService({ courseId, studentIds: ids });
      if (res?.success) toast({ title: "Success", description: "Certificates revoked successfully" });
      await loadCourseStudentsAndApprovals(courseId);
    } catch (err) {
      console.error("Bulk revoke error:", err);
      toast({ title: "Error", description: err?.response?.data?.message || "Bulk revocation failed", variant: "destructive" });
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="border border-white/5 bg-[#0f172a]/60 backdrop-blur rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 sm:p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Certificate Management</h1>
              <p className="text-xs text-gray-500">Approve or revoke certificates for enrolled students</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Select Course</label>
              <Select value={courseId || undefined} onValueChange={(value) => setCourseId(value)}>
                <SelectTrigger className="w-full h-11 bg-white/5 border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm text-white hover:bg-white/10 px-4">
                  <SelectValue placeholder="Choose a course" className="text-gray-500" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/10 rounded-xl shadow-2xl text-gray-300">
                  {courses.length === 0 ? (
                    <div className="px-2 py-6 text-center text-xs text-gray-500">No courses available</div>
                  ) : (
                    courses.map((c) => (
                      <SelectItem 
                        key={c._id} 
                        value={c._id}
                        className="cursor-pointer hover:bg-white/5 focus:bg-white/5 text-gray-300 py-3"
                      >
                        {c.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">Total Students</p>
                <p className="text-lg font-bold text-white">{students.length}</p>
              </div>
              <div className="flex-1 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center">
                <p className="text-xs text-emerald-500/70 mb-1">Approved</p>
                <p className="text-lg font-bold text-emerald-400">{students.filter((s)=>approvedMap[s.studentId]).length}</p>
              </div>
            </div>
          </div>

          {courseId && (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={toggleSelectAll}
                  className="w-full sm:w-auto border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl text-xs font-medium h-9"
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </Button>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button 
                    size="sm" 
                    disabled={!anySelected || working} 
                    onClick={bulkApprove}
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold h-9 shadow-lg shadow-blue-500/20"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    disabled={!anySelected || working} 
                    onClick={bulkRevoke}
                    className="flex-1 sm:flex-none border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-bold h-9"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                    Revoke
                  </Button>
                </div>
              </div>

              <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10">
                        <th className="px-5 py-3.5 w-12" />
                        <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs">Student Name</th>
                        <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs">Email</th>
                        <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs">Enrollment Date</th>
                        <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs">Status</th>
                        <th className="text-right px-5 py-3.5 font-semibold text-gray-500 text-xs">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {loading ? (
                        <tr><td className="px-5 py-10 text-center text-gray-600 text-sm" colSpan={5}>Loading students...</td></tr>
                      ) : students.length === 0 ? (
                        <tr><td className="px-5 py-10 text-center text-gray-600 text-sm" colSpan={5}>No students enrolled in this course</td></tr>
                      ) : (
                        students.map((s, i) => (
                          <tr key={`${s.studentId}-${i}`} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-5 py-4">
                              <div 
                                className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${selected[s.studentId] ? 'bg-blue-600 border-blue-600' : 'border-white/20 bg-white/5'}`}
                                onClick={() => setSelected((prev)=>({ ...prev, [s.studentId]: !prev[s.studentId] }))}
                              >
                                {selected[s.studentId] && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-white text-sm group-hover:text-blue-400 transition-colors">
                                  {s.studentName || s.userName || s.studentId || 'Unknown'}
                                </span>
                                <span className="text-xs text-gray-600 mt-0.5">ID: {s.studentId?.slice(-8)}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-gray-400 text-sm">
                              {s.studentEmail || s.userEmail || 'N/A'}
                            </td>
                            <td className="px-5 py-4 text-gray-500 text-xs">
                              {s.enrollmentDate ? new Date(s.enrollmentDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-5 py-4">
                              {approvedMap[s.studentId] ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                                  <div className="w-1 h-1 rounded-full bg-emerald-400" />
                                  Approved
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-500/10 border border-white/10 text-gray-500 text-xs font-medium">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <Button 
                                size="sm" 
                                variant={approvedMap[s.studentId] ? "outline" : "default"}
                                onClick={() => toggleApproval(s)} 
                                disabled={working}
                                className={`h-8 px-4 rounded-lg text-xs font-medium transition-all ${approvedMap[s.studentId] ? 'border-white/10 text-gray-400 hover:text-white hover:bg-white/10' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20'}`}
                              >
                                {approvedMap[s.studentId] ? 'Revoke' : 'Approve'}
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstructorCertificatesPage;
