import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { listProgramSessionsStudentService, joinLiveSessionService, fetchStudentViewCourseDetailsService } from "@/services";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

function StudentLiveSessionsPage() {
  const { auth } = useAuth();
  const { programId } = useParams();
  const [searchParams] = useSearchParams();
  const courseIdFromQuery = searchParams.get("courseId");
  const effectiveProgramId = programId || courseIdFromQuery || "";
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courseDetails, setCourseDetails] = useState(null);
  const navigate = useNavigate();

  async function fetchSessions() {
    if (!effectiveProgramId) return; // wait for courseId
    setLoading(true);
    
    try {
      const res = await listProgramSessionsStudentService(effectiveProgramId);
      if (res?.success) setSessions(res.data || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(session) {
    try {
      const res = await joinLiveSessionService(session._id, {
        studentId: auth?.user?._id,
        studentName: auth?.user?.userName,
        studentEmail: auth?.user?.userEmail,
      });
      if (res?.success && res.meetingLink) {
        window.open(res.meetingLink, "_blank", "noopener,noreferrer");
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchSessions();
    async function fetchCourse() {
      if (!effectiveProgramId) return;
      try {
        const res = await fetchStudentViewCourseDetailsService(effectiveProgramId);
        if (res?.success) setCourseDetails(res.data);
        else setCourseDetails(null);
      } catch {
        setCourseDetails(null);
      }
    }
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveProgramId]);

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Live Sessions {courseDetails ? `— ${courseDetails.title}` : ""}</h2>
          <p className="text-xs text-gray-600">Join upcoming sessions or continue your course.</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
      </div>
      <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-2">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Live Sessions</h2>
          {loading ? (
            <p>Loading...</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-gray-600">No sessions scheduled yet.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s._id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{s.topic}</p>
                      <p className="text-xs text-gray-600">{new Date(s.startTime).toLocaleString()}</p>
                    </div>
                    <div className="space-x-2">
                      {s.meetingLink && (
                        <Button onClick={() => handleJoin(s)}>Join</Button>
                      )}
                    </div>
                  </div>
                  {s.recordingUrl && (
                    <a className="text-sm text-blue-600" href={s.recordingUrl} target="_blank" rel="noreferrer">
                      Watch Recording
                    </a>
                  )}
                  {Array.isArray(s.resources) && s.resources.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Resources</p>
                      <ul className="list-disc pl-5">
                        {s.resources.map((r, idx) => (
                          <li key={idx}>
                            <a href={r.url} target="_blank" rel="noreferrer" className="text-blue-600">
                              {r.title || r.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Course Content {courseDetails ? `— ${courseDetails.title}` : ""}</h3>
            {courseDetails && (
              <Button onClick={() => navigate(`/course-progress/${courseDetails._id}`)}>Open Course Progress</Button>
            )}
          </div>
          {courseDetails ? (
            Array.isArray(courseDetails.curriculum) && courseDetails.curriculum.length > 0 ? (
              <ul className="grid sm:grid-cols-2 gap-2">
                {courseDetails.curriculum.map((lec, idx) => (
                  <li key={idx} className="text-sm text-gray-800 border rounded p-2 flex items-center justify-between">
                    <span className="truncate mr-3">{lec.title}</span>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/course-progress/${courseDetails._id}`)}>Watch</Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">No lectures found.</p>
            )
          ) : (
            <p className="text-sm text-gray-600">Select a course via URL to see its content.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentLiveSessionsPage;


