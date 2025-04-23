import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { BearerTokenMiddleware } from './user/middleware/bearer-token.middleware';
import { ImageModule } from './image/image.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
@Module({
  imports: [
    UserModule,
    ImageModule,
    PostModule,
    CommentModule,
    ConfigModule.forRoot({
      isGlobal: true, // 전역에서 환경 변수 사용.
      validationSchema: Joi.object({
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'), // public 폴더만 외부에 노출
      serveRoot: '/public/', // 위에rootPath를 지정하면 위 경로를 생략함, 외부에서 접근할 때 해당 경로를 앞에 붙여줘야 함.
    }),
  ], // 다른 곳에서 불러온다.
  exports: [],
  controllers: [],
  providers: [], // 다른 곳에서 사용할 수 있도록 내보낸다.
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BearerTokenMiddleware)
      .exclude(
        {
          path: 'user/login',
          method: RequestMethod.POST,
        },
        {
          path: 'user/signup',
          method: RequestMethod.POST,
        },
      )
      .forRoutes('*');
  }
}
