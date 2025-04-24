import { WinstonModule } from "nest-winston";
import { utilities } from 'nest-winston';
import * as winston from 'winston';

export const winstonLogger = WinstonModule.createLogger({
    transports: [
        new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        utilities.format.nestLike('Panda', {
          prettyPrint: true,
        }),
      ),
    }),
  ],
});
