import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  LiteraryWorkDto,
  CreateLiteraryWorkDTO,
  UpdateLiteraryWorkDTO,
  getAllLiteraryWork,
  GetUserLiteraryWorksDTO,
} from '../dto';
import { ILiteraryWorkRepository, ILiteraryWorkService } from '../interfaces';
import { LiteraryWork } from '../infra/database';
import {
  USER_SERVICE,
  I_LITERARY_WORK_REPOSITORY,
  AUTHOR_REPOSITORY,
} from '@shared/utils/constants';
import { UserServiceImp } from '@domain/user/interfaces';
import { Language, Status } from '@shared/enum';
import { AuthorRepositoryImpl } from '@domain/author/interfaces';
import { LiteraryWorkDtoCollection } from '../dto';
import { User } from '@infrastructure/database/model';

@Injectable()
export class LiteraryWorkService implements ILiteraryWorkService {
  private readonly logger = new Logger('LiteraryWork service');
  constructor(
    @Inject(I_LITERARY_WORK_REPOSITORY)
    private readonly literaryWorkRepository: ILiteraryWorkRepository,
    @Inject(USER_SERVICE)
    private readonly userService: UserServiceImp,
    @Inject(AUTHOR_REPOSITORY)
    private readonly authorRepository: AuthorRepositoryImpl,
  ) {}
  async getUserLiteraryWorks(
    userId: string,
    language: Language,
  ): Promise<GetUserLiteraryWorksDTO> {
    const { id, createdAt } = await this.userService.getUser(userId);
    const literaryWorks =
      await this.literaryWorkRepository.getUserLiteraryWorks(id, language);

    const literaryWorkCollections = literaryWorks.map((literaryWork) => {
      const literaryWorkAux: LiteraryWorkDtoCollection = {
        ...literaryWork,
        adquiredVolumes: Number(literaryWork.adquiredVolumes),
        totalVolumes: Number(literaryWork.totalVolumes),
        status:
          literaryWork.adquiredVolumes === literaryWork.totalVolumes
            ? Status.Complete
            : Status.InProgress,
        language: language,
      };

      return literaryWorkAux;
    });

    const totalVolumes = literaryWorkCollections.reduce((acc, literaryWork) => {
      acc += literaryWork.adquiredVolumes;
      return acc;
    }, 0);
    const completeLiteraryWorks = literaryWorkCollections.reduce(
      (acc, { adquiredVolumes, totalVolumes }) => {
        if (adquiredVolumes === totalVolumes) {
          acc += 1;
        }
        return acc;
      },
      0,
    );
    return {
      literaryWorks: literaryWorkCollections,
      totalVolumes: totalVolumes,
      completeLiteraryWorks: completeLiteraryWorks,
      totalLiteraryWorks: literaryWorkCollections.length,
      memberSince: createdAt,
    };
  }

  async getAllLiteraryWork(
    data: getAllLiteraryWork,
  ): Promise<LiteraryWorkDto[]> {
    const literaryWorks =
      await this.literaryWorkRepository.getAllLiteraryWork(data);

    const literaryWorksMapped = literaryWorks.map((literaryWork) =>
      this.mapperLiteraryWorkEntityToDto(literaryWork, data.language),
    );

    return literaryWorksMapped;
  }
  async createLiteraryWork(
    data: CreateLiteraryWorkDTO,
  ): Promise<LiteraryWorkDto> {
    this.logger.log('createLiteraryWork');
    const user = await this.userService.getUser(data.adminId);
    const ilustratorBy = await this.authorRepository.get(data.ilustratorBy);
    const writterBy = await this.authorRepository.get(data.writterBy);

    const LiteraryWorkSaved =
      await this.literaryWorkRepository.createAndSaveLiteraryWork({
        ...data,
        updatedBy: new User(user),
        registeredBy: new User(user),
        writterBy: writterBy,
        ilustratorBy: ilustratorBy,
        categories: this.formatCategories(data.categories),
      });

    return this.mapperLiteraryWorkEntityToDto(LiteraryWorkSaved, null);
  }
  async getLiteraryWork(
    id: string,
    language: Language,
  ): Promise<LiteraryWorkDto> {
    this.logger.log('getLiteraryWork' + id);
    const literaryWork = await this.literaryWorkRepository.getLiteraryWork(id);

    if (!literaryWork) {
      throw new NotFoundException('LiteraryWork not found');
    }
    return this.mapperLiteraryWorkEntityToDto(literaryWork, language);
  }
  async updateLiteraryWork(
    updateLiteraryWorkData: UpdateLiteraryWorkDTO,
  ): Promise<string> {
    this.logger.log('updateLiteraryWork');

    const LiteraryWork = await this.literaryWorkRepository.getLiteraryWork(
      updateLiteraryWorkData.id,
    );
    const user = await this.userService.getUser(updateLiteraryWorkData.adminId);

    const data = Object.assign(LiteraryWork, updateLiteraryWorkData);
    if (LiteraryWork && user) {
      await this.literaryWorkRepository.updateLiteraryWork({
        ...data,
        registeredBy: LiteraryWork.registeredBy,
        updatedBy: new User(user),
        categories: this.formatCategories(data.categories),
      });
      return 'LiteraryWork updated';
    }
    throw new NotFoundException('Cant update LiteraryWork');
  }
  async deleteLiteraryWork(LiteraryWorkId: string): Promise<boolean> {
    this.logger.log('deleteLiteraryWork');
    const LiteraryWork = await this.getLiteraryWork(LiteraryWorkId, null);
    if (!LiteraryWork) {
      throw new NotFoundException('LiteraryWork not found');
    }
    const isDeleted = await this.literaryWorkRepository.deleteLiteraryWork(
      LiteraryWork.id,
    );

    return isDeleted;
  }

  mapperLiteraryWorkEntityToDto = (
    literaryWork: LiteraryWork,
    language: Language,
  ): LiteraryWorkDto => {
    let internationalization = {
      synopsis: '',
    };

    if (
      language &&
      literaryWork.internationalization &&
      literaryWork.internationalization.length > 0
    ) {
      const filteredInter = literaryWork.internationalization.filter(
        (inter) => inter.language === language,
      );
      if (filteredInter.length === 0) {
        internationalization.synopsis = 'notRegistered';
      } else {
        const { synopsis } = filteredInter[0];
        internationalization.synopsis = synopsis;
      }
    } else {
      internationalization = {
        synopsis: null,
        ...internationalization,
      };
    }

    const literaryWorkMapped: LiteraryWorkDto = {
      ...literaryWork,
      registeredBy: literaryWork.registeredBy.name,
      updatedBy: literaryWork.updatedBy.name,
      writterBy: literaryWork.writterBy.name,
      ilustratorBy: literaryWork.ilustratorBy.name,
      ...internationalization,
    };

    return literaryWorkMapped;
  };

  formatCategories = (data: string[]) => {
    const categories = data.reduce((acc, value, index) => {
      acc += index > 0 ? ',' + value : value;
      return acc;
    }, '');
    return categories;
  };
}
