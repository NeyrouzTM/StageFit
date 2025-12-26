export type ApplicationStatus = 'envoye' | 'entretien' | 'accepte';

export interface Application {
  id?: string;
  stageRef: number;
  candidatNom: string;
  candidatEmail: string;
  cvUrl?: string;
  portfolioUrl?: string;
  notes?: string;
  status: ApplicationStatus;
  createdAt: string; // ISO date
}
