import { createContext, useState, useMemo, useContext } from "react";

export const StudentContext = createContext(null);

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent must be used within a StudentProvider");
  }
  return context;
}

export default function StudentProvider({ children }) {
  const [studentViewCoursesList, setStudentViewCoursesList] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1
  });
  const [loadingState, setLoadingState] = useState(true);
  const [studentViewCourseDetails, setStudentViewCourseDetails] =
    useState(null);
  const [currentCourseDetailsId, setCurrentCourseDetailsId] = useState(null);
  const [studentBoughtCoursesList, setStudentBoughtCoursesList] = useState([]);
  const [studentCurrentCourseProgress, setStudentCurrentCourseProgress] =
    useState({});

  const contextValue = useMemo(() => {
    return {
      studentViewCoursesList,
      setStudentViewCoursesList,
      paginationInfo,
      setPaginationInfo,
      loadingState,
      setLoadingState,
      studentViewCourseDetails,
      setStudentViewCourseDetails,
      currentCourseDetailsId,
      setCurrentCourseDetailsId,
      studentBoughtCoursesList,
      setStudentBoughtCoursesList,
      studentCurrentCourseProgress,
      setStudentCurrentCourseProgress,
    };
  }, [
    studentViewCoursesList,
    paginationInfo,
    loadingState,
    studentViewCourseDetails,
    currentCourseDetailsId,
    studentBoughtCoursesList,
    studentCurrentCourseProgress
  ]);

  return (
    <StudentContext.Provider value={contextValue}>
      {children}
    </StudentContext.Provider>
  );
}
