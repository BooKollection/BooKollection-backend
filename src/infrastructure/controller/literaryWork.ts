import {
  JwtAuthGuard,
  RolesGuard,
  Roles,
  Role,
  CurrentUser,
} from '@domain/jwt';
import {
  GetLiteraryWorkDTO,
  CreateLiteraryWorkDTO,
  UpdateLiteraryWorkDTO,
  GetUserLiteraryWorksDTO,
  LiteraryWorkDTO,
} from '@domain/literaryWork/dto';
import { UserTokenDTO } from '@domain/user/dto';
import { LiteraryWorkServiceImpl } from '@domain/literaryWork/interfaces';
import {
  Controller,
  Logger,
  Inject,
  Body,
  Get,
  UseGuards,
  Post,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { Language } from '@shared/enum';
import { LITERARY_WORK_SERVICE } from '@shared/utils/constants';

@Controller('literaryWork')
export class LiteraryWorkController {
  private readonly logger = new Logger(LiteraryWorkController.name);
  constructor(
    @Inject(LITERARY_WORK_SERVICE)
    private readonly literaryWorkService: LiteraryWorkServiceImpl,
  ) {}

  @Get('getAll')
  async getAllLiteraryWorkDTOs(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Query('language') language: Language,
    @Query('name') name?: Language,
  ): Promise<LiteraryWorkDTO[]> {
    this.logger.log('LiteraryWork');

    return this.literaryWorkService.getAllLiteraryWork({
      language,
      limit,
      offset,
      name,
    });
  }

  @Get('getUserLiteraryWorks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  async getUserLiteraryWorks(
    @CurrentUser() { id },
    @Query('language') language: Language,
  ): Promise<GetUserLiteraryWorksDTO> {
    this.logger.log('getUserLiteraryWorks');

    return this.literaryWorkService.getUserLiteraryWorks(id, language);
  }

  @Get()
  async getLiteraryWork(
    @Body() literaryWork: GetLiteraryWorkDTO,
  ): Promise<LiteraryWorkDTO> {
    this.logger.log('LiteraryWork');

    return this.literaryWorkService.getLiteraryWork(literaryWork);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async createLiteraryWork(
    @Body() input: CreateLiteraryWorkDTO,
    @CurrentUser() { id }: UserTokenDTO,
  ): Promise<LiteraryWorkDTO> {
    this.logger.log('Update LiteraryWork');

    return this.literaryWorkService.createLiteraryWork({
      ...input,
      adminId: id,
    });
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  async updateLiteraryWork(
    @Body() input: UpdateLiteraryWorkDTO,
    @CurrentUser() { id }: UserTokenDTO,
  ): Promise<string> {
    this.logger.log('Update LiteraryWork');

    return this.literaryWorkService.updateLiteraryWork({
      ...input,
      adminId: id,
    });
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  async deleteLiteraryWork(@Body('id') id: string): Promise<boolean> {
    this.logger.log('Delete LiteraryWork');

    return this.literaryWorkService.deleteLiteraryWork(id);
  }
}
