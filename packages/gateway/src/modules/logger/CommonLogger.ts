import { ConsoleLogger, Injectable } from '@nestjs/common';
import { Logger as AplloLogger } from '@apollo/utils.logger';

@Injectable()
export class CommonLogger extends ConsoleLogger implements AplloLogger {
  info(message?: any): void {
    this.log(message);
  }
}
