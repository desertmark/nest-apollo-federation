import { Console } from 'console';

import { IntrospectAndCompose } from '@apollo/gateway';
import { SupergraphSdlHookOptions } from '@apollo/gateway/dist/config';
import { IntrospectAndComposeOptions } from '@apollo/gateway/dist/supergraphManagers/IntrospectAndCompose';
import { Logger as AplloLogger } from '@apollo/utils.logger';

import { Injectable } from '@nestjs/common';
import {
  ApolloGatewayDriverConfigFactory,
  ApolloGatewayDriverConfig,
} from '@nestjs/apollo';

import { CommonLogger } from './modules/logger/CommonLogger';

/**
 * Custom override of the official @apollo/gateway IntrospectAndCompose class
 * to handle failure of initial fetch of schemas. This will retry indefinitely until it succeeds.
 *
 * It will also expose a method to update the options i.e: for changes on the subgraph list.
 */
export class CustomIntrospectAndCompose extends IntrospectAndCompose {
  private supergraphSdlHookOptions: SupergraphSdlHookOptions;
  private logger: AplloLogger;
  constructor(
    private instrospectAndComposeOptions: IntrospectAndComposeOptions,
  ) {
    super(instrospectAndComposeOptions);
    this.logger =
      instrospectAndComposeOptions.logger ||
      (Console as unknown as AplloLogger);
  }

  async updateInstrospectAndComposeOptions(
    instrospectAndComposeOptions: IntrospectAndComposeOptions,
  ) {
    this.logger.info('Updating options to:');
    this.logger.info(instrospectAndComposeOptions);

    this.instrospectAndComposeOptions = {
      ...this.instrospectAndComposeOptions,
      ...instrospectAndComposeOptions,
    };
    (this as any).config = this.instrospectAndComposeOptions;
    return await this.initialize(this.supergraphSdlHookOptions);
  }

  async initialize(
    supergraphSdlHookOptions: SupergraphSdlHookOptions,
  ): Promise<{
    supergraphSdl: string;
    cleanup: () => Promise<void>;
  }> {
    this.supergraphSdlHookOptions = supergraphSdlHookOptions;
    return new Promise(async (resolve) => {
      const clear = setInterval(async () => {
        try {
          const result = await super.initialize(supergraphSdlHookOptions);

          this.logger.info('Got schemas');
          this.logger.info(this.instrospectAndComposeOptions.subgraphs);

          clearInterval(clear);
          resolve(result);
        } catch (error) {
          this.logger.warn(error.message);
        }
      }, this.instrospectAndComposeOptions.pollIntervalInMs);
    });
  }
}

@Injectable()
export class IntrospectAndComposeFactory
  implements ApolloGatewayDriverConfigFactory
{
  constructor(private logger: CommonLogger) {}
  async createGqlOptions(): Promise<ApolloGatewayDriverConfig> {
    return {
      server: {
        // ... Apollo server options
        cors: true,
      },
      gateway: {
        supergraphSdl: new CustomIntrospectAndCompose({
          subgraphs: [
            { name: 'users', url: 'http://localhost:3001/graphql' },
            { name: 'posts', url: 'http://localhost:3002/graphql' },
          ],
          logger: this.logger,
          pollIntervalInMs: 1000,
        }),
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
