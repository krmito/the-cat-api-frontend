export interface Breed {
  id: string;
  name: string;
  origin?: string;
  temperament?: string;
  description?: string;
  life_span?: string;
  weight?: {
    imperial?: string;
    metric?: string;
  };
  adaptability?: number;
  affection_level?: number;
  child_friendly?: number;
  dog_friendly?: number;
  energy_level?: number;
  intelligence?: number;
  social_needs?: number;
  stranger_friendly?: number;
  wikipedia_url?: string;
  reference_image_id?: string;
  image?: {
    id: string;
    url: string;
    width?: number;
    height?: number;
  };
}

export interface BreedSearchResult extends Breed {
  image?: {
    id: string;
    url: string;
    width?: number;
    height?: number;
  };
}
