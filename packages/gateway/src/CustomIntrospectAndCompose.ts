import { Console } from 'console';

import {
  IntrospectAndCompose,
  ServiceEndpointDefinition,
  SupergraphManager,
} from '@apollo/gateway';
import { SupergraphSdlHookOptions } from '@apollo/gateway/dist/config';
import { IntrospectAndComposeOptions } from '@apollo/gateway/dist/supergraphManagers/IntrospectAndCompose';
import { Logger as AplloLogger } from '@apollo/utils.logger';

import { Injectable } from '@nestjs/common';
import {
  ApolloGatewayDriverConfigFactory,
  ApolloGatewayDriverConfig,
} from '@nestjs/apollo';

import { CommonLogger } from './modules/logger/CommonLogger';

import { ServiceBroker } from 'moleculer';

/**
 * Custom implementation of the supergraph manager based on the official @apollo/gateway IntrospectAndCompose class
 * to handle failure of initial fetch of schemas. This will retry indefinitely until it succeeds.
 *
 * It will also expose a method to update the options i.e: for changes on the subgraph list.
 */
export class CustomIntrospectAndCompose implements SupergraphManager {
  private logger: AplloLogger;
  constructor(
    private instrospectAndComposeOptions: IntrospectAndComposeOptions,
    private broker: ServiceBroker,
  ) {
    this.logger =
      instrospectAndComposeOptions.logger ||
      (Console as unknown as AplloLogger);
  }

  async updateOptions(options: IntrospectAndComposeOptions) {
    // await this.cleanup?.();
    this.instrospectAndComposeOptions = {
      ...this.instrospectAndComposeOptions,
      ...options,
    };
  }

  async initialize(options: SupergraphSdlHookOptions): Promise<{
    supergraphSdl: string;
    cleanup?: () => Promise<void>;
  }> {
    await this.broker.waitForServices('schema');
    this.logger.debug('Supergraph manager init...');
    this.logger.debug(this.instrospectAndComposeOptions.subgraphs);

    return new Promise(async (resolve) => {
      // retry until it succeeds.
      const clear = setInterval(async () => {
        const subgraphs = await this.broker.call<ServiceEndpointDefinition[]>(
          'schema.endpoints',
        );
        this.updateOptions({ subgraphs });

        if (this.instrospectAndComposeOptions?.subgraphs?.length) {
          try {
            // init official gateway apollo supergraph manager
            const result = await new IntrospectAndCompose(
              this.instrospectAndComposeOptions,
            ).initialize(options);
            // when succeedes log it and clear interval.
            this.logger.info('Supergraph manager initialized successfully');
            clearInterval(clear);
            resolve(result);
          } catch (error) {
            // If fails log warning fetch updated list of subgraph endpoints
            this.logger.warn('Failed to init supergraph manager, retrying...');
          }
        } else {
          this.logger.info('Wating for nodes to connect...');
          this.broker.call('schema.discover');
        }
      }, this.instrospectAndComposeOptions.pollIntervalInMs || 1000);
    });
  }
}

@Injectable()
export class IntrospectAndComposeFactory
  implements ApolloGatewayDriverConfigFactory
{
  constructor(private logger: CommonLogger, private broker: ServiceBroker) {}

  async createGqlOptions(): Promise<ApolloGatewayDriverConfig> {
    // TODO: fetch this values from config service
    return {
      server: {
        // ... Apollo server options
        cors: true,
      },
      gateway: {
        supergraphSdl: new CustomIntrospectAndCompose(
          {
            subgraphs: [],
            logger: this.logger,
            pollIntervalInMs: 1000,
          },
          this.broker,
        ),
      },
    };
  }
}

// async function supergraphSdl({ update, getDataSource, healthCheck }) {
//   const manager = new IntrospectAndCompose({
//     subgraphs: [
//       { name: 'users', url: 'http://localhost:3001/graphql' },
//       { name: 'posts', url: 'http://localhost:3002/graphql' },
//     ],
//     pollIntervalInMs: 1000,
//   });

//   return manager.initialize({
//     update,
//     getDataSource({ name, url }) {
//       return {
//         async process(options) {
//           return new Promise((resolve) => {
//             const clear = setInterval(() => {
//               getDataSource({ name, url })
//                 .process(options)
//                 .then((res) => {
//                   console.log('Got schema from', name, url);
//                   clearInterval(clear);
//                   resolve(res);
//                 })
//                 .catch(() =>
//                   console.warn('Failed to fetch schema from', name, url),
//                 );
//             }, 1000);
//           });
//         },
//       };
//     },
//     healthCheck,
//   });
// }
