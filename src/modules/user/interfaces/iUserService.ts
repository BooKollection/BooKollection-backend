import { User } from '../infra/database';
import {
  CreateUserDTO,
  UpdateUserDTO,
  DeleteUserDTO,
  UserTokenDTO,
} from '../Dto';

export interface IUserService {
  createUser(data: CreateUserDTO): Promise<User>;
  getUser(
    data: { id?: string; email?: string },
    userTokenData: UserTokenDTO,
  ): Promise<User>;
  updateUser(
    updateUserData: UpdateUserDTO,
    userTokenData?: UserTokenDTO,
  ): Promise<string>;
  deleteUser(data: DeleteUserDTO): Promise<boolean>;
}
