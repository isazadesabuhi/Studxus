export interface UserProfile {
  id: string;
  email: string;
  name: string;
  surname: string;
  user_type: "Professeur" | "Etudiant";
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  postal_code?: string;
  created_at: string;
}