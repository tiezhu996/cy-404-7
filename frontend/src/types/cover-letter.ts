export interface CoverLetter {
  id: string;
  resumeId: string;
  targetPosition: string;
  targetCompany: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type CoverLetterCollection = CoverLetter[];
