export interface Education {
  qualification: string;
  institution: string;
  year: string;
  percentage: string;
}

export interface Project {
  name: string;
  description: string;
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
}

export interface ResumeAnalysis {
  name: string;
  email: string;
  phone: string;

  resume_score: number;
  strengths: string[];
  improvements: string[];

  skills: string[];

  education: Education[];
  projects: Project[];
  experience: Experience[];
  certifications: Certification[];
}

export interface Resume {
  id: number;
  filename: string;
  filepath: string;
  resume_text: string;
  analysis_json: ResumeAnalysis;
  user_id: number;
}