// prisma/validation.pipe.ts
import { ValidationPipe, ValidationError, BadRequestException } from '@nestjs/common';

export const CustomValidationPipe = new ValidationPipe({
  whitelist: true,
  exceptionFactory: (errors: ValidationError[]) => {
    const formattedErrors: Record<string, { messages: string[] }> = {};

    errors.forEach((err) => {
      formattedErrors[err.property] = {
        messages: Object.values(err.constraints ?? {}),
      };
    });

    return new BadRequestException({
      message: 'Erreur de validation',
      errors: formattedErrors,
    });
  },
});