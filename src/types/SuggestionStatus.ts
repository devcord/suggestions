export enum SuggestionStatus {
  NEW = 'NEW',
  IN_REVIEW = 'IN_REVIEW',
  POSTED = 'POSTED',
  PENDING = 'PENDING',
  DENIED = 'DENIED',
  COMPLETED = 'COMPLETED',
  ACCEPTED = 'ACCEPTED',
}

export type SuggestionType = {
  suggestor: string;
  description: string;
  title: string;
  up: number;
  down: number;
  date: Date;
  status: SuggestionStatus;
}