import { ServiceEndpointDefinition } from '@apollo/gateway';
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ServiceBroker, BrokerOptions, ServiceSchema } from 'moleculer';
import { SchemaService } from './schema.service';

export interface MoleculerModuleOptions {
  brokerOptions: BrokerOptions;
  services?: ServiceSchema[];
  endpoint?: ServiceEndpointDefinition;
}
@Module({})
export class MouleculerModule {
  static forRoot({
    brokerOptions,
    services,
    endpoint,
  }: MoleculerModuleOptions): DynamicModule {
    const broker = MouleculerModule.buildBroker(
      brokerOptions,
      services,
      endpoint,
    );
    const providers: Provider[] = [
      {
        provide: ServiceBroker,
        useValue: broker,
      },
    ];
    return {
      module: MouleculerModule,
      providers,
      exports: [...providers],
    };
  }

  private static buildBroker(
    brokerOptions: BrokerOptions,
    services?: ServiceSchema[],
    endpoint?: ServiceEndpointDefinition,
  ): ServiceBroker {
    const broker = new ServiceBroker(brokerOptions);
    services?.forEach((service) => broker.createService(service));
    try {
      broker.createService(SchemaService).settings.endpoint = endpoint;
      broker
        .start()
        .then(() => broker.logger.info('Moleculer started!'))
        .catch((error) =>
          broker.logger.error('Moleculer failed to start', error),
        );
      return broker;
    } catch (error) {}
  }
}
