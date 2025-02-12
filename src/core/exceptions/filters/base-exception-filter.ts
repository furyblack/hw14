import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorExtension } from '../domain-exceptions';
import { DomainExceptionCode } from '../domain-exception-codes';

export type HttpResponseBody = {
  timestamp: string;
  path: string | null;
  message: string;
  extensions: ErrorExtension[];
  code: DomainExceptionCode | null;
};
export type HttpResponseBodyForOther = {
  errorsMessages: { message: string; field: string }[];
};

export abstract class BaseExceptionFilter implements ExceptionFilter {
  abstract onCatch(exception: any, response: Response, request: Request): void;

  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    this.onCatch(exception, response, request);
  }

  getDefaultHttpBody(
    url: string,
    exception: unknown,
  ): HttpResponseBodyForOther {
    const extensions = (exception as any).extensions || [];
    console.log('gggg', extensions);
    return {
      errorsMessages: extensions.map((ext: ErrorExtension) => ({
        message: ext.message,
        field: ext.key || 'unknown',
      })),
    };
  }
}
