import { ILiteraryWorkRepository } from '@domain/literaryWork/interfaces';
import { UserTokenDTO } from '@domain/user/dto';
import { UserServiceImp } from '@domain/user/interfaces';
import { GetAllVolumeDTO } from '@domain/userVolume/dto';
import { UserVolumeRepositoryImpl } from '@domain/userVolume/interfaces';
import {
  VolumeDTO,
  CreateVolumeDTO,
  UpdateVolumeDTO,
} from '@domain/volume/dto';
import {
  VolumeServiceImpl,
  VolumeRepositoryImpl,
} from '@domain/volume/interfaces';
import { User, Volume } from '@infrastructure/database/model';
import {
  Injectable,
  Logger,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Language } from '@shared/enum';
import {
  VOLUME_REPOSITORY,
  USER_VOLUME_REPOSITORY,
  USER_SERVICE,
  LITERARY_WORK_REPOSITORY,
} from '@shared/utils/constants';

@Injectable()
export class VolumeService implements VolumeServiceImpl {
  private readonly logger = new Logger(VolumeService.name);
  constructor(
    @Inject(VOLUME_REPOSITORY)
    private readonly volumeRepository: VolumeRepositoryImpl,
    @Inject(USER_VOLUME_REPOSITORY)
    private readonly iUserVolumeRepository: UserVolumeRepositoryImpl,
    @Inject(USER_SERVICE)
    private readonly userService: UserServiceImp,
    @Inject(LITERARY_WORK_REPOSITORY)
    private readonly literaryWorkRepository: ILiteraryWorkRepository,
  ) {}
  async getLastAddedVolumes(language: Language): Promise<VolumeDTO[]> {
    this.logger.log('getLastAddedVolumes');
    const volumes = await this.volumeRepository.getLastAddedVolumes();

    return volumes.map((volume) =>
      this.mapperVolumeEntityToDTO(volume, language),
    );
  }

  private readonly addUserVolume = async (
    userToken: UserTokenDTO,
    volumesMapped: VolumeDTO[],
  ) => {
    const user = await this.userService.getUser(userToken.id);

    const userVolumes = await this.iUserVolumeRepository.getAllUserVolume({
      language: Language.ptBR,
      limit: 0,
      offset: 0,
      user: new User(user),
    });

    const userVolumesId = userVolumes.map(
      (userVolume) => userVolume.volume + ``,
    );

    return volumesMapped.map((volume) => {
      volume.haveVolume = userVolumesId.includes(volume.id);
      if (volume.haveVolume) {
        const userVolume = userVolumes.filter(
          (userVolume) => userVolume.volume + '' === volume.id,
        )[0];
        volume.purchasedDate = userVolume.purchasedDate;
        volume.purchasedPrice =
          userVolume.purchasedPriceUnit + ' ' + userVolume.purchasedPrice;
        volume.userVolumeId = userVolume.id;
      }
      return volume;
    });
  };
  async getAllVolume(
    data: GetAllVolumeDTO,
    userToken?: UserTokenDTO,
  ): Promise<VolumeDTO[]> {
    let volumes = [];
    if (data.literaryWork) {
      this.logger.log('GetAllVolumeDTO - getAllLiteraryWorkVolumes');

      const literaryWork = await this.literaryWorkRepository.getLiteraryWork(
        data.literaryWork,
      );
      if (!literaryWork) {
        throw new BadRequestException('literaryWork not found');
      }
      const databaseVolumes =
        await this.volumeRepository.getAllLiteraryWorkVolumes(
          data,
          literaryWork,
        );
      volumes = databaseVolumes.map((volume) => {
        volume.literaryWork = literaryWork;
        return volume;
      });
    } else {
      this.logger.log('GetAllVolumeDTO');

      volumes = await this.volumeRepository.getAllVolume(data);
    }

    const volumesMapped = volumes.map((Volume) =>
      this.mapperVolumeEntityToDTO(Volume, data.language),
    );
    if (userToken) {
      return this.addUserVolume(userToken, volumesMapped);
    }

    return volumesMapped;
  }
  async createVolume(data: CreateVolumeDTO): Promise<VolumeDTO> {
    this.logger.log('createVolume');
    const user = await this.userService.getUser(data.adminId);
    const literaryWork = await this.literaryWorkRepository.getLiteraryWork(
      data.literaryWork,
    );
    if (!data.dimensions) {
      data.dimensions = literaryWork.dimensions;
    }
    if (!data.paperType) {
      data.paperType = literaryWork.paperType;
    }

    const volumeSaved = await this.volumeRepository.createAndSaveVolume({
      ...data,
      language: literaryWork.language,
      updatedBy: new User(user),
      registeredBy: new User(user),
      literaryWork: literaryWork,
    });

    return this.mapperVolumeEntityToDTO(volumeSaved, null);
  }
  async getVolume(id: string, language: Language): Promise<VolumeDTO> {
    this.logger.log('getVolume' + id);
    const Volume = await this.volumeRepository.getVolume(id);

    if (!Volume) {
      throw new NotFoundException('Volume not found');
    }
    return this.mapperVolumeEntityToDTO(Volume, language);
  }
  async updateVolume(updateVolumeData: UpdateVolumeDTO): Promise<string> {
    this.logger.log('updateVolume');

    const Volume = await this.volumeRepository.getVolume(updateVolumeData.id);
    const user = await this.userService.getUser(updateVolumeData.adminId);

    const data = Object.assign(Volume, updateVolumeData);
    if (Volume && user) {
      await this.volumeRepository.updateVolume({
        ...data,
        registeredBy: Volume.registeredBy,
        updatedBy: new User(user),
      });
      return 'Volume updated';
    }
    throw new NotFoundException('Cant update Volume');
  }
  async deleteVolume(VolumeId: string): Promise<boolean> {
    this.logger.log('deleteVolume');
    const Volume = await this.getVolume(VolumeId, null);
    if (!Volume) {
      throw new NotFoundException('Volume not found');
    }
    const isDeleted = await this.volumeRepository.deleteVolume(Volume.id);

    return isDeleted;
  }

  mapperVolumeEntityToDTO = (volume: Volume, language: Language): VolumeDTO => {
    let internationalization = {
      synopsis: '',
    };
    const literaryWork = volume.literaryWork;
    delete volume.literaryWork;
    if (
      language &&
      volume.internationalization &&
      volume.internationalization.length > 0
    ) {
      const filteredInter = volume.internationalization.filter(
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

    const volumeMapped: VolumeDTO = {
      ...volume,
      registeredBy: volume.registeredBy.name,
      updatedBy: volume.updatedBy.name,
      ...internationalization,
      name: literaryWork.name,
      type: literaryWork.type,
      edition: literaryWork.edition,
      country: literaryWork.country,
      categories: literaryWork.categories,
      coverPrice: volume.coverPriceUnit + ' ' + volume.coverPrice,
    };

    return volumeMapped;
  };
}
