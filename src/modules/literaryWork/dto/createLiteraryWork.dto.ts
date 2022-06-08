import { Edition, Language, PaperType, Status, Type } from '@shared/enum';

export interface CreateLiteraryWorkDTO {
  name: string;
  bagShape: string;
  language: Language;
  publisher: string;
  dimensions: string;
  imageUrl: string;
  status: Status;
  country: string;
  categories: string;
  adminId: string;
  edition: Edition;
  type: Type;
  paperType: PaperType;
}