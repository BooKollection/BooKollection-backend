import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDTO, UpdateUserDTO, UserTokenDTO } from '../Dto';
import { IUserRepository, IUserService } from '../interfaces';
import { User } from '../infra/database';
import { I_USER_REPOSITORY } from '@shared/utils/constants';

@Injectable()
export class UserService implements IUserService {
  private readonly logger = new Logger('User service');
  constructor(
    @Inject(I_USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}
  async createUser({ id, email, name }: CreateUserDTO): Promise<User> {
    this.logger.log('createUser');
    const user = await this.userRepository.createAndSaveUser({
      id,
      email,
      name,
    });

    return user;
  }
  async getUser(userId: string): Promise<User> {
    this.logger.log('getUser ' + userId);
    const user = await this.userRepository.getUser(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async updateUser(
    updateUserData: UpdateUserDTO,
    userTokenData: UserTokenDTO,
  ): Promise<string> {
    this.logger.log('updateUser');

    if (updateUserData.id !== userTokenData.id) {
      throw new UnauthorizedException('You cant update another  user');
    }
    const user = await this.getUser(userTokenData.id);

    const data = Object.assign(user, updateUserData);

    await this.userRepository.updateUser(data);
    return 'User updated';
  }
  async deleteUser(userId: string): Promise<boolean> {
    this.logger.log('deleteUser');
    const user = await this.getUser(userId);

    const isDeleted = await this.userRepository.deleteUser(user);

    return isDeleted;
  }
}
