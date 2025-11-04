import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  fetchInstructorCourseListService,
  fetchInstructorCourseDetailsService,
  listApprovedCertificatesService,
  approveCertificateService,
  revokeCertificateService,
} from "@/services";
import { useNavigate } from "react-router-dom";

function InstructorCertificatesPage() {

  
  const navigate = useNavigate();
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
  const approvedCount = useMemo(() => students.filter((s) => approvedMap[s.studentId]).length, [students, approvedMap]);

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

      // Merge email from approval snapshot when Course.students lacks it
      const merged = baseStudents.map((s) => ({
        ...s,
        studentEmail: s.studentEmail || emailFromApproval[s.studentId] || s.email || "",
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
        const res = await revokeCertificateService({ courseId, studentId: student.studentId });
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
      await Promise.allSettled(ids.map((sid) => revokeCertificateService({ courseId, studentId: sid })));
      await loadCourseStudentsAndApprovals(courseId);
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <h1 className="text-xl font-semibold">Certificate Approvals</h1>
          <p className="text-xs text-gray-600">Approve or revoke student certificates for your courses.</p>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="grid gap-3 mb-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Select Course</label>
              <select className="border p-2 rounded" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                <option value="">Choose a course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-700 bg-gray-50 border rounded px-3 py-2">Total: {students.length}</div>
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">Approved: {students.filter((s)=>approvedMap[s.studentId]).length}</div>
            </div>
          </div>

          {courseId && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={toggleSelectAll}>{allSelected ? 'Clear Selection' : 'Select All'}</Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" disabled={!anySelected || working} onClick={bulkApprove}>Approve Selected</Button>
                  <Button size="sm" variant="outline" disabled={!anySelected || working} onClick={bulkRevoke}>Revoke Selected</Button>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 w-10" />
                        <th className="text-left px-3 py-2">Student</th>
                        <th className="text-left px-3 py-2">Email</th>
                        <th className="text-left px-3 py-2">Status</th>
                        <th className="text-left px-3 py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td className="px-3 py-4" colSpan={5}>Loading...</td></tr>
                      ) : students.length === 0 ? (
                        <tr><td className="px-3 py-4" colSpan={5}>No students enrolled.</td></tr>
                      ) : (
                        students.map((s, i) => (
                          <tr key={`${s.studentId}-${i}`} className="border-t">
                            <td className="px-3 py-2" />
                            <td className="px-3 py-2 cursor-pointer" onClick={() => setSelected((prev)=>({ ...prev, [s.studentId]: !prev[s.studentId] }))}>
                              <span className={`${selected[s.studentId] ? 'underline' : ''}`}>{s.studentName || s.studentId}</span>
                            </td>
                            <td className="px-3 py-2">{s.studentEmail || '-'}</td>
                            <td className="px-3 py-2">
                              {approvedMap[s.studentId] ? (
                                <span className="inline-flex items-center text-xs px-2 py-1 rounded bg-green-100 text-green-800 border border-green-200">Approved</span>
                              ) : (
                                <span className="inline-flex items-center text-xs px-2 py-1 rounded bg-gray-100 text-gray-800 border border-gray-200">Not Approved</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <Button size="sm" onClick={() => toggleApproval(s)} disabled={working}>
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


