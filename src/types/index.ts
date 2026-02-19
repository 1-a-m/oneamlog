export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail_url?: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  view_count: number;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface PostTag {
  post_id: string;
  tag_id: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface Work {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url?: string;
  project_url?: string;
  github_url?: string;
  technologies: string[];
  period?: string;
  position?: string;
  category?: string;
  languages?: string[];
  libraries?: string[];
  environments?: string[];
  tools?: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Time {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  author_id: string;
}

export interface User {
  id: string;
  email: string;
}

export type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};
