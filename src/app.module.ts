import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule], // 다른 곳에서 불러온다.
  exports: [], // 다른 곳에서 사용할 수 있도록 내보낸다.
})
export class AppModule {}
