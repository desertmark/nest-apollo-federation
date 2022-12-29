import { Logger, Module, Provider } from '@nestjs/common';
import { CommonLogger } from './CommonLogger';

const providers: Provider[] = [{ provide: Logger, useClass: CommonLogger }, CommonLogger];

@Module({
  exports: providers,
  providers,
})
export class LoggerModule {}
