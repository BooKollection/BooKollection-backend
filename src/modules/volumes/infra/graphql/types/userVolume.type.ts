import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Coin } from '@shared/enum';
import { IsDate } from 'class-validator';

@ObjectType()
export class UserVolumeType {
  @Field(() => ID)
  id: string;

  @Field()
  purchasedPrice: number;

  @Field()
  purchasedDate: Date;

  @Field(() => Coin)
  purchasedPriceUnit: Coin;

  @Field({ nullable: true })
  userAcquisitionDifficulty?: number;

  @Field({ nullable: true })
  userClassification?: number;

  @Field()
  @IsDate()
  createdAt: Date;

  @Field()
  @IsDate()
  updatedAt: Date;
}
