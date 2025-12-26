
export interface Stage {
  ref: number;
  titre: string;
  description: string;
  entreprise: string;
  disponible: boolean;
  nbrInteresse: number;

  // Attributs avancés pour filtrer et recommander
  location?: string; // Ville ou région
  mode?: 'onsite' | 'remote' | 'hybrid';
  durationMonths?: number;
  startDate?: string; // ISO string
  domain?: string; // Ex: web, data, cloud
  educationLevel?: string; // Ex: Licence, Master
  minExperienceYears?: number;
  requiredSkills: string[]; // Compétences indispensables
  niceToHaveSkills?: string[]; // Bonus
  languages?: string[]; // Langues requises
  salaryRange?: string; // Optionnel pour la fiche
  calendarLink?: string; // Lien Calendly/iCal pour planifier un entretien
}
