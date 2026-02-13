import { ProjectStatus, BuildStep, ProofItem, Job, TestItem } from './types';

export const SPACING = {
  S: '8px',
  M: '16px',
  L: '24px',
  XL: '40px',
  XXL: '64px',
};

export const INITIAL_STEPS: BuildStep[] = [
  {
    id: 1,
    title: "Define Architecture",
    description: "Establish the core data structures and service patterns for the high-end build environment.",
    prompt: "Generate a robust TypeScript interface for a multi-tenant SaaS architecture following premium design patterns.",
    isCompleted: true
  },
  {
    id: 2,
    title: "Configure Design System",
    description: "Initialize the KodNest visual language, ensuring all components adhere to the strict 4-color palette.",
    prompt: "Create a Tailwind configuration that implements a 4-color limited palette and a fixed 8px grid system.",
    isCompleted: true
  },
  {
    id: 3,
    title: "Core Job Engine",
    description: "Build the underlying logic for parsing and managing job entities with consistent data structures.",
    prompt: "Implement a data management layer for job listings with localStorage persistence.",
    isCompleted: true
  },
  {
    id: 4,
    title: "Match Scoring Logic",
    description: "Develop the deterministic scoring algorithm for weighing candidate-to-job relevance.",
    prompt: "Create a weighted scoring function based on skills, role keywords, and experience levels.",
    isCompleted: true
  },
  {
    id: 5,
    title: "Status Persistence",
    description: "Ensure job application states (Applied, Rejected, Selected) persist across sessions.",
    prompt: "Add status tracking to job cards and link to global state management.",
    isCompleted: true
  },
  {
    id: 6,
    title: "Daily Digest Simulation",
    description: "Automate the 9AM briefing generation logic for prioritized matching.",
    prompt: "Implement a daily digest generator that picks top 10 relevant roles based on user score.",
    isCompleted: true
  },
  {
    id: 7,
    title: "Test Suite Implementation",
    description: "Configure a 10-point validation checklist to enforce product quality.",
    prompt: "Build an internal test runner to verify UI and business logic integrity.",
    isCompleted: true
  },
  {
    id: 8,
    title: "Final Submission Protocol",
    description: "Establish artifact collection and shipment rules for the production launch.",
    prompt: "Finalize the proof collection page and validation rules for project shipping.",
    isCompleted: true
  }
];

export const INITIAL_PROOF_CHECKLIST: ProofItem[] = [
  { id: 'ui-built', label: 'UI Built', completed: false, proofValue: '' },
  { id: 'logic-working', label: 'Logic Working', completed: false, proofValue: '' },
  { id: 'test-passed', label: 'Test Passed', completed: false, proofValue: '' },
  { id: 'deployed', label: 'Deployed', completed: false, proofValue: '' },
];

export const INITIAL_TEST_CHECKLIST: TestItem[] = [
  { id: 't1', label: 'Preferences persist after refresh', howToTest: 'Change settings, refresh browser, and verify values remain.', passed: false },
  { id: 't2', label: 'Match score calculates correctly', howToTest: 'Update skills in Settings and verify Match % changes on Dashboard.', passed: false },
  { id: 't3', label: '"Show only matches" toggle works', howToTest: 'Toggle visibility and verify jobs below threshold disappear.', passed: false },
  { id: 't4', label: 'Save job persists after refresh', howToTest: 'Save a job, refresh, and check the Saved tab.', passed: false },
  { id: 't5', label: 'Apply opens in new tab', howToTest: 'Click Apply on any job card and verify a new tab opens.', passed: false },
  { id: 't6', label: 'Status update persists after refresh', howToTest: 'Change status to "Applied", refresh, and verify badge color.', passed: false },
  { id: 't7', label: 'Status filter works correctly', howToTest: 'Filter by "Applied" and verify only applied jobs show.', passed: false },
  { id: 't8', label: 'Digest generates top 10 by score', howToTest: 'Generate digest and verify it lists top 10 relevant roles.', passed: false },
  { id: 't9', label: 'Digest persists for the day', howToTest: 'Generate digest, refresh, and verify it stays generated.', passed: false },
  { id: 't10', label: 'No console errors on main pages', howToTest: 'Open DevTools and browse all routes checking for red errors.', passed: false },
];

const indianCompanies = [
  'Infosys', 'TCS', 'Wipro', 'Accenture', 'Capgemini', 'Cognizant', 'IBM', 'Oracle', 'SAP', 'Dell',
  'Amazon', 'Flipkart', 'Swiggy', 'Razorpay', 'PhonePe', 'Paytm', 'Zoho', 'Freshworks', 'Juspay', 'CRED',
  'Zomato', 'Ola Electric', 'Postman', 'BrowserStack', 'Unacademy', 'Groww', 'Nykaa', 'Lenskart', 'PhysicsWallah', 'Delhivery'
];

const locations = ['Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Mumbai', 'Gurgaon', 'Noida', 'Remote'];

const roles = [
  { title: 'SDE Intern', exp: 'Fresher', salary: '₹30k–₹45k/month Internship' },
  { title: 'Graduate Engineer Trainee', exp: 'Fresher', salary: '3.5–5.5 LPA' },
  { title: 'Junior Backend Developer', exp: '0-1', salary: '8–12 LPA' },
  { title: 'Frontend Intern', exp: 'Fresher', salary: '₹20k–₹35k/month Internship' },
  { title: 'QA Intern', exp: 'Fresher', salary: '₹15k–₹25k/month Internship' },
  { title: 'Data Analyst Intern', exp: 'Fresher', salary: '₹25k–₹40k/month Internship' },
  { title: 'Java Developer', exp: '0-1', salary: '6–10 LPA' },
  { title: 'Python Developer', exp: 'Fresher', salary: '4–7 LPA' },
  { title: 'React Developer', exp: '1-3', salary: '10–18 LPA' },
  { title: 'Node.js Developer', exp: '1-3', salary: '12–20 LPA' },
  { title: 'Mobile Developer', exp: '1-3', salary: '14–22 LPA' },
  { title: 'Senior Backend Engineer', exp: '3-5', salary: '18–35 LPA' },
  { title: 'Full Stack Engineer', exp: '3-5', salary: '22–45 LPA' }
];

const skillSets = [
  ['React', 'TypeScript', 'Tailwind', 'Next.js'],
  ['Node.js', 'PostgreSQL', 'Redis', 'Docker'],
  ['Java', 'Spring Boot', 'Microservices', 'AWS'],
  ['Python', 'Django', 'FastAPI', 'PostgreSQL'],
  ['Android', 'Kotlin', 'MVVM', 'Retrofit'],
  ['Flutter', 'Dart', 'Firebase', 'State Management'],
  ['Selenium', 'Java', 'Cucumber', 'JMeter'],
  ['SQL', 'Python', 'Tableau', 'Power BI'],
  ['C++', 'Data Structures', 'Algorithms', 'System Design']
];

const descriptions = [
  "Join our core engineering team to build scalable systems that handle millions of requests per second. You will be working on high-performance APIs and distributed storage solutions. We value clean code and robust architecture.",
  "We are looking for a passionate developer who loves building intuitive user experiences. You will collaborate closely with designers to implement pixel-perfect interfaces. Experience with modern frontend frameworks is essential.",
  "As a member of our data team, you will help us extract meaningful insights from massive datasets. Your work will directly impact product decisions and business growth. Proficiency in SQL and data visualization is required.",
  "Help us ensure the highest quality of our mobile and web applications. You will create automated test suites and participate in rigorous code reviews. A keen eye for detail and strong problem-solving skills are a must.",
  "Work in a fast-paced environment where innovation is key. You will take ownership of end-to-end features and deploy code daily. We offer a collaborative culture with plenty of opportunities for mentorship and growth.",
  "Be part of the digital transformation journey for our global clients. You will build enterprise-grade applications using the latest tech stacks. Excellent communication and teamwork skills are vital for this role."
];

export const JOBS_DATA: Job[] = Array.from({ length: 60 }).map((_, i) => {
  const company = indianCompanies[i % indianCompanies.length];
  const location = locations[i % locations.length];
  const roleInfo = roles[i % roles.length];
  const mode: ('Remote' | 'Hybrid' | 'Onsite')[] = ['Remote', 'Hybrid', 'Onsite'];
  const sources: ('LinkedIn' | 'Naukri' | 'Indeed')[] = ['LinkedIn', 'Naukri', 'Indeed'];
  
  return {
    id: `job-${i + 1}`,
    title: roleInfo.title,
    company: company,
    location: location,
    mode: mode[i % mode.length],
    experience: roleInfo.exp as any,
    skills: skillSets[i % skillSets.length],
    source: sources[i % sources.length],
    postedDaysAgo: Math.floor(Math.random() * 11),
    salaryRange: roleInfo.salary,
    applyUrl: `https://careers.${company.toLowerCase().replace(/\s+/g, '')}.com/jobs/${i + 100}`,
    description: descriptions[i % descriptions.length]
  };
});