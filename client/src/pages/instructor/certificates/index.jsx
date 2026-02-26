import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  fetchInstructorCourseListService,
  fetchInstructorCourseDetailsService,
  listApprovedCertificatesService,
  approveCertificateService,
  instructorRevokeCertificateService,
} from "@/services";
function InstructorCertificatesPage() {
  const { auth } = useAuth();
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

      // Build approval + email maps from approvals snapshot
      const map = {};
      const emailFromApproval = {};
      if (approvals?.success) {
        (approvals.data || []).forEach((a) => {
          map[a.studentId] = true;
          if (a.studentEmail) emailFromApproval[a.studentId] = a.studentEmail;
        });
      }
      setApprovedMap(map);

      // Merge email and fetch usernames from approval snapshot when Course.students lacks it
      const nameFromApproval = {};
      if (approvals?.success) {
        (approvals.data || []).forEach((a) => {
          if (a.studentName) nameFromApproval[a.studentId] = a.studentName;
        });
      }
      
      // Enrich students with user details - prioritize: course data > approval snapshot > user data
      const merged = baseStudents.map((s) => ({
        ...s,
        // Username: prefer studentName from course, then from approval, then userName from user, fallback to studentId
        studentName: s.studentName || nameFromApproval[s.studentId] || s.userName || s.studentId || "",
        // Email: prefer studentEmail from course, then from approval, then userEmail from user
        studentEmail: s.studentEmail || emailFromApproval[s.studentId] || s.userEmail || s.email || "",
        // Also keep userName and userEmail for fallback
        userName: s.userName || nameFromApproval[s.studentId] || "",
        userEmail: s.userEmail || emailFromApproval[s.studentId] || "",
      }));
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
      // Refresh emails/status after toggle
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
      await Promise.allSettled(ids.map((sid) => approveCertificateService({ courseId, studentId: sid, approverId: auth?.user?._id })));
      await loadCourseStudentsAndApprovals(courseId);
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
      await Promise.allSettled(ids.map((sid) => instructorRevokeCertificateService({ courseId, studentId: sid })));
      await loadCourseStudentsAndApprovals(courseId);
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 relative">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="fade-in">
          <h1 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter uppercase leading-tight">
            Certificate <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">Verification</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mt-2">
            Credential Authorization Module v2.4
          </p>
        </div>

        <div className="glass-card border-white/5 bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Authority Domain</label>
                <Select value={courseId || undefined} onValueChange={(value) => setCourseId(value)}>
                  <SelectTrigger className="w-full h-12 bg-white/5 border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm text-white hover:bg-white/10 shadow-inner px-4">
                    <SelectValue placeholder="Identify Module Repository" className="text-gray-500" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-white/10 rounded-xl shadow-2xl text-gray-300">
                    {courses.length === 0 ? (
                      <div className="px-2 py-6 text-center text-[10px] font-bold text-gray-500 italic uppercase tracking-widest">No Operational Modules</div>
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
              <div className="flex gap-4">
                <div className="flex-1 p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center group">
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1 group-hover:text-gray-400 transition-colors">Detected Nodes</p>
                  <p className="text-lg font-black text-white italic">{students.length}</p>
                </div>
                <div className="flex-1 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center group">
                  <p className="text-[8px] font-black text-emerald-500/70 uppercase tracking-widest mb-1 group-hover:text-emerald-400 transition-colors">Verified</p>
                  <p className="text-lg font-black text-emerald-500 italic drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">{students.filter((s)=>approvedMap[s.studentId]).length}</p>
                </div>
              </div>
            </div>

            {courseId && (
              <div className="space-y-6 fade-in pt-4 border-t border-white/5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={toggleSelectAll}
                    className="w-full sm:w-auto border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-black uppercase tracking-widest text-[9px] h-9"
                  >
                    {allSelected ? 'De-Select All Nodes' : 'Select All Subjects'}
                  </Button>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button 
                      size="sm" 
                      disabled={!anySelected || working} 
                      onClick={bulkApprove}
                      className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[9px] h-9 shadow-lg shadow-blue-500/20"
                    >
                      Authorize
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      disabled={!anySelected || working} 
                      onClick={bulkRevoke}
                      className="flex-1 sm:flex-none border-red-500/20 text-red-500/70 hover:bg-red-500 hover:text-white rounded-xl font-black uppercase tracking-widest text-[9px] h-9"
                    >
                      Revoke
                    </Button>
                  </div>
                </div>

                <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                          <th className="px-6 py-4 w-12" />
                          <th className="text-left px-6 py-4 font-black uppercase tracking-widest text-gray-500 text-[9px]">Subject Identity</th>
                          <th className="text-left px-6 py-4 font-black uppercase tracking-widest text-gray-500 text-[9px]">Interface Email</th>
                          <th className="text-left px-6 py-4 font-black uppercase tracking-widest text-gray-500 text-[9px]">Verification Status</th>
                          <th className="text-right px-6 py-4 font-black uppercase tracking-widest text-gray-500 text-[9px]">Action Node</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {loading ? (
                          <tr><td className="px-6 py-12 text-center text-gray-600 font-bold italic" colSpan={5}>Synchronizing Node Data...</td></tr>
                        ) : students.length === 0 ? (
                          <tr><td className="px-6 py-12 text-center text-gray-600 font-bold italic uppercase tracking-widest text-xs" colSpan={5}>Empty Module: No Students Detected</td></tr>
                        ) : (
                          students.map((s, i) => (
                            <tr key={`${s.studentId}-${i}`} className="hover:bg-white/[0.02] transition-colors group">
                              <td className="px-6 py-4">
                                <div 
                                  className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${selected[s.studentId] ? 'bg-blue-600 border-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'border-white/20 bg-white/5'}`}
                                  onClick={() => setSelected((prev)=>({ ...prev, [s.studentId]: !prev[s.studentId] }))}
                                >
                                  {selected[s.studentId] && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="font-bold text-white italic group-hover:text-blue-400 transition-colors">
                                    {s.studentName || s.userName || s.studentId || 'Unknown'}
                                  </span>
                                  <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-0.5">ID: {s.studentId?.slice(-8)}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-400 font-medium">
                                {s.studentEmail || s.userEmail || 'N/A'}
                              </td>
                              <td className="px-6 py-4">
                                {approvedMap[s.studentId] ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    Authorized
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-500/10 border border-white/10 text-gray-500 text-[9px] font-black uppercase tracking-widest">
                                    Pending
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Button 
                                  size="sm" 
                                  variant={approvedMap[s.studentId] ? "outline" : "default"}
                                  onClick={() => toggleApproval(s)} 
                                  disabled={working}
                                  className={`h-8 px-4 rounded-xl font-black uppercase tracking-widest text-[8px] transition-all transform active:scale-90 ${approvedMap[s.studentId] ? 'border-white/10 text-gray-400 hover:text-white hover:bg-white/10' : 'bg-white text-black hover:bg-gray-200 shadow-xl shadow-white/5'}`}
                                >
                                  {approvedMap[s.studentId] ? 'Revoke Protocol' : 'Issue Credential'}
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
    </div>
  );
}

export default InstructorCertificatesPage;


