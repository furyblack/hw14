import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import { ValidationPipe } from '@nestjs/common';
import { DomainExceptionsFilter } from './core/exceptions/filters/domain-exceptions-filter';
import { AllExceptionsFilter } from './core/exceptions/filters/all-exceptions-filter';
import { BadRequestDomainException } from './core/exceptions/domain-exceptions';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSetup(app); //глобальные настройки приложения
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: false,
      exceptionFactory: (errors) => {
        const errorsForResponse = [];

        errors.forEach((e) => {
          // @ts-ignore
          const constraintsKeys = Object.keys(e.constraints);
          constraintsKeys.forEach((constraintsKey) => {
            // @ts-ignore
            errorsForResponse.push({
              message: e.constraints![constraintsKey],
              field: e.property,
            });
          });
        });
        throw new BadRequestDomainException(errorsForResponse);
      },
    }),
  );
  app.useGlobalFilters(new DomainExceptionsFilter(), new AllExceptionsFilter());
  const PORT = process.env.PORT || 3000; //TODO: move to configService. will be in the following lessons

  await app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
  });
}

bootstrap();
