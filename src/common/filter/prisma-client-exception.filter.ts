import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    console.log('Prisma Exception Filter:', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const formattedMessage = this.formatErrorMessage(exception);

      switch (exception.code) {
        // 중복된 데이터일 경우
        case 'P2002':
          response.status(HttpStatus.CONFLICT).json({
            statusCode: HttpStatus.CONFLICT,
            message: formattedMessage,
            detail: exception.meta,
          });
          break;
        // 유효하지 않는 외래키일 경우
        case 'P2003':
          // 422 에러 처리
          response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            message: formattedMessage,
            detail: exception.meta,
          });
          break;
        // 유효하지 않는 ID일 경우
        case 'P2025':
          response.status(HttpStatus.NOT_FOUND).json({
            statusCode: HttpStatus.NOT_FOUND,
            message: formattedMessage,
            detail: exception.meta,
          });
          break;
        default:
          response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: formattedMessage,
            detail: exception.meta,
          });
      }
    } else {
      // PrismaClientValidationError 처리
      const cleanMessage = (
        exception.message || '유효하지 않은 데이터입니다.'
      ).replace(/\n/g, ' ');
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: cleanMessage,
      });
    }
  }

  private formatErrorMessage(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string {
    const meta = exception.meta;
    const baseMessage = exception.message.replace(/\n/g, ' ');

    switch (exception.code) {
      case 'P2002': {
        const fields = (meta?.target as string[]) || [];
        return `중복된 ${fields.join(', ')} 값이 존재합니다.`;
      }
      case 'P2003': {
        const field = meta?.field_name as string;
        return `연결된 ${field} 데이터를 찾을 수 없습니다.`;
      }
      case 'P2025': {
        if (meta?.cause) {
          return `요청한 데이터를 찾을 수 없습니다: ${meta.cause}`;
        }
        return '요청한 데이터를 찾을 수 없습니다.';
      }
      default:
        return baseMessage;
    }
  }
}
