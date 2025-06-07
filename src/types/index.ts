export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  image: string;
  imageUpload: File | null;
  features: string[];
  technical_details?: string;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  projectId: string;
  projectTitle: string;
  customerName: string;
  customerEmail: string;
  price: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}