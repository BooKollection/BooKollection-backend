import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Coin } from '@shared/enum/';
import { Volume } from './volume';
import { User } from '@infrastructure/database/model';

@Entity('userVolumes')
export class UserVolume {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  purchasedPrice: number;

  @Column()
  purchasedDate: Date;

  @Column({
    type: 'enum',
    enum: Coin,
  })
  purchasedPriceUnit: Coin;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.volumes)
  user: User;

  @ManyToOne(() => Volume, (volume) => volume.userVolumes)
  volume: Volume;
}
