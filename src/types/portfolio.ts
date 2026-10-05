export interface Project {
  id: string;
  title: string;
  category: 'Brand Identity' | 'Print & Packaging' | 'Social Media' | 'Photo Retouching' | 'Vector & Illustration';
  client: string;
  year: string;
  imageUrl: string;
  description: string;
  tools: string[];
  link?: string;
  featured?: boolean;
}

export interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  iconName: string;
  deliverables: string[];
}

export interface SkillItem {
  id: string;
  name: string;
  proficiency: number;
  category: 'Software' | 'Print & Production' | 'Creative';
}

export interface WorkExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  description: string;
  current: boolean;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  board: string;
  group: string;
  result: string;
  passingYear: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
  designation: string;
  phone: string;
  address: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

export interface PortfolioProfile {
  name: string;
  roleTitle: string;
  tagline: string;
  kicker: string;
  bio: string;
  aboutText: string;
  mission: string;
  vision: string;
  experienceYears: number;
  completedProjects: number;
  satisfiedClients: number;
  designAwards: number;
  photoUrl: string;
  aboutPhotoUrl: string;
  cvPdfUrl: string; // URL or base64 data URI
  cvFileName: string;
  email: string;
  phone: string;
  address: string;
  facebookUrl: string;
  behanceUrl: string;
  dateOfBirth: string;
  fatherName: string;
  motherName: string;
  nationality: string;
  maritalStatus: string;
  religion: string;
  bloodGroup: string;
  languages: string[];
  hobbies: string[];
}

export interface SiteData {
  profile: PortfolioProfile;
  projects: Project[];
  services: Service[];
  skills: SkillItem[];
  experience: WorkExperience[];
  education: EducationItem[];
  references: ReferenceItem[];
  adminPin: string;
}
