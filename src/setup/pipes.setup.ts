import { INestApplication, ValidationPipe } from '@nestjs/common';
import { BadRequestDomainException } from '../core/exceptions/domain-exceptions';

export function pipesSetup(app: INestApplication) {
  //Глобальный пайп для валидации и трансформации входящих данных.
  //На следующем занятии рассмотрим подробнее
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      transform: true,
      exceptionFactory: (errors) => {
        console.log(123);
        const errorsForResponse = [];
        errors.forEach((e) => {
          // @ts-ignore
          const constraintsKeys = Object.keys(e.constraints);
          constraintsKeys.forEach((constraintsKey) => {
            // @ts-ignore
            errorsForResponse.push({
              message: e.constraints![constraintsKey],
              key: e.property,
            });
          });
        });
        console.log('+++++++++++++++++++++++++++++++++++++++++');
        console.log(errorsForResponse);
        console.log('+++++++++++++++++++++++++++++++++++++++++');
        throw new BadRequestDomainException(errorsForResponse);
      },
    }),
  );
}
