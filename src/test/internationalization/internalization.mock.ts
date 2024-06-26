import { Internationalization } from '@infrastructure/database/model/internationalization';
import { Language, Edition, PaperType, Status, Type } from '@shared/enum';

export const mockLiteraryWork = {
  registeredBy: null,
  updatedBy: null,
  ilustratorBy: null,
  writterBy: null,
  language: Language.ptBR,
  synopsis: '',
  edition: Edition.omnibus,
  type: Type.japaneseComicBook,
  paperType: PaperType.newsPrint,
  country: '',
  releaseFrequency: '',
  startOfPublication: new Date(),
  endOfPublication: new Date(),
  id: '123',
  name: '',
  bagShape: '',
  publisher: '',
  originalPublisher: '',
  dimensions: '',
  imageUrl: '',
  status: Status.Complete,
  categories: '',
  createdAt: new Date('2021-09-29T23:40:24.198Z'),
  updatedAt: new Date('2021-09-29T23:40:24.198Z'),
  internationalization: [],
  volumes: null,
};

export const createInternationalizationMock = {
  language: Language.ptBR,
  synopsis: 'opa',
  country: 'brazil',
  literaryWork: mockLiteraryWork.id,
};

export const createAndSaveInternationalization = {
  ...createInternationalizationMock,
  literaryWork: mockLiteraryWork,
  volume: null,
};

export const internationalizationMock: Internationalization = {
  id: 'ea957a2d-b91c-48b5-9d8b-05a4fa5e4c75',
  createdAt: new Date('2021-09-29T23:40:24.198Z'),
  updatedAt: new Date('2021-09-29T23:40:24.198Z'),
  ...createAndSaveInternationalization,
  literaryWork: mockLiteraryWork,
  volume: null,
};

export const updateInternationalizationData = {
  ...internationalizationMock,
  language: Language.ptBR,
  synopsis: 'opa1',
  literaryWork: '',
  volume: null,
};

export const MyCollectionMockUpdated = Object.assign(
  internationalizationMock,
  updateInternationalizationData,
);
