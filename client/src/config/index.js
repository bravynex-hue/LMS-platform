export const signUpFormControls = [
  {
    name: "userName",
    label: "User Name",
    placeholder: "Enter your user name",
    type: "text",
    componentType: "input",
    minLength: 4,
    maxLength: 13,
  },
  {
    name: "userEmail",
    label: "User Email",
    placeholder: "Enter your user email",
    type: "email",
    componentType: "input",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    type: "password",
    componentType: "input",
  },
];

export const signInFormControls = [
  {
    name: "userEmail",
    label: "User Email",
    placeholder: "Enter your user email",
    type: "email",
    componentType: "input",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    type: "password",
    componentType: "input",
  },
];

export const initialSignInFormData = {
  userEmail: "",
  password: "",
};

export const initialSignUpFormData = {
  userName: "",
  userEmail: "",
  password: "",
};

export const languageOptions = [
  { id: "english", label: "English" },
  { id: "malayalam", label: "Malayalam" },
  { id: "kannada", label: "Kannada" },
];

export const courseLevelOptions = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

export const internshipDurationOptions = [
  { id: "1-month", label: "1 Month" },
  { id: "2-months", label: "2 Months" },
  { id: "3-months", label: "3 Months" },
  { id: "4-months", label: "4 Months" },
  { id: "5-months", label: "5 Months" },
  { id: "6-months", label: "6 Months" },
];

export const courseCategories = [
  // Engineering & Technology
  { id: "vlsi", label: "VLSI", description: "Design complex integrated circuits and systems using advanced EDA tools." },
  { id: "python-programming", label: "Introduction to Python", description: "Master the fundamentals of Python for automation, scripting, and development." },
  { id: "embedded-software", label: "Embedded Software", description: "Develop low-level software for microcontrollers and real-time operating systems." },
  { id: "data-science", label: "Data Science", description: "Analyze large datasets and build predictive models using statistical techniques." },
  { id: "devops", label: "DevOps", description: "Bridge the gap between development and operations with CI/CD and automation." },
  { id: "cyber-security", label: "Cyber Security", description: "Protect networks and systems from digital attacks with offensive and defensive strategies." },
  { id: "frontend-development", label: "Front End Development", description: "Build stunning, responsive user interfaces using modern web technologies." },
  { id: "fullstack-development", label: "Full Stack Development", description: "Master both client-side and server-side development to build complete web applications." },
  { id: "ai-data-engineer", label: "AI Data Engineer", description: "Design and implement data pipelines for large-scale AI and ML systems." },
  { id: "web-development", label: "Web Development", description: "Learn the core languages and frameworks of the modern web ecosystem." },
  { id: "basic-cpp-programming", label: "Basic C++ Programming", description: "Understand object-oriented programming and memory management with C++." },
  { id: "cloud-computing", label: "Cloud Computing", description: "Architect and deploy scalable applications on AWS, Azure, or GCP." },
];

export const courseLandingPageFormControls = [
  {
    name: "title",
    label: "Title",
    componentType: "input",
    type: "text",
    placeholder: "Enter course title",
  },
  {
    name: "category",
    label: "Category",
    componentType: "select",
    type: "text",
    placeholder: "",
    options: courseCategories,
  },
  {
    name: "level",
    label: "Level",
    componentType: "select",
    type: "text",
    placeholder: "",
    options: courseLevelOptions,
  },
  {
    name: "primaryLanguage",
    label: "Primary Language",
    componentType: "select",
    type: "text",
    placeholder: "",
    options: languageOptions,
  },
  {
    name: "subtitle",
    label: "Subtitle",
    componentType: "input",
    type: "text",
    placeholder: "Enter course subtitle",
  },
  {
    name: "description",
    label: "Description",
    componentType: "textarea",
    type: "text",
    placeholder: "Enter course description",
  },
  {
    name: "pricing",
    label: "Pricing",
    componentType: "input",
    type: "number",
    placeholder: "Enter course pricing",
  },
  {
    name: "objectives",
    label: "Objectives",
    componentType: "textarea",
    type: "text",
    placeholder: "Enter course objectives",
  },
  {
    name: "welcomeMessage",
    label: "Welcome Message",
    componentType: "textarea",
    placeholder: "Welcome message for students",
  },
  {
    name: "whatsappLink",
    label: "WhatsApp Group Link",
    componentType: "input",
    type: "text",
    placeholder: "Enter WhatsApp group invite link",
  },
];

export const courseLandingInitialFormData = {
  title: "",
  category: "",
  level: "",
  primaryLanguage: "",
  subtitle: "",
  description: "",
  pricing: "",
  objectives: "",
  welcomeMessage: "",
  whatsappLink: "",
  duration: "",
  image: "",
  sequentialAccess: true,
  // Certificate defaults (optional)
  certificateEnabled: false,
  certificateGradeEnabled: false,
  certificateCourseName: "",
  certificateFrom: "BRAVYNEX ENGINEERING",
  defaultCertificateGrade: "A+",
};

export const courseCurriculumInitialFormData = [
  {
    title: "",
    videoUrl: "",
    freePreview: false,
    public_id: "",
  },
];

export const sortOptions = [
  { id: "price-lowtohigh", label: "Price: Low to High" },
  { id: "price-hightolow", label: "Price: High to Low" },
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
];

export const filterOptions = {
  category: courseCategories,
  duration: internshipDurationOptions,
  level: courseLevelOptions,
  primaryLanguage: languageOptions,
};

export const enrollmentFormControls = [
  {
    name: "certificateFullName",
    label: "Full Name (on certificate)",
    placeholder: "Enter exactly as it should appear",
    type: "text",
    componentType: "input",
  },
  {
    name: "certificateGuardianName",
    label: "Guardian / Father Name",
    placeholder: "Enter guardian name",
    type: "text",
    componentType: "input",
  },
  {
    name: "certificateEmail",
    label: "Email Address",
    placeholder: "Enter your email address",
    type: "email",
    componentType: "input",
  },
];

export const initialEnrollmentFormData = {
  certificateFullName: "",
  certificateGuardianName: "",
  certificateEmail: "",
  certificateOrganization: "",
  certificateCountry: "",
};
