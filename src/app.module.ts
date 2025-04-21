import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true, // 전역에서 환경 변수 사용.
      validationSchema: Joi.object({
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
      }),
    }),
  ], // 다른 곳에서 불러온다.
  exports: [], // 다른 곳에서 사용할 수 있도록 내보낸다.
})
export class AppModule {}
