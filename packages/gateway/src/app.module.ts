import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { IntrospectAndComposeFactory } from './CustomIntrospectAndCompose';
import { LoggerModule } from './modules/logger/logger.module';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      imports: [LoggerModule],
      driver: ApolloGatewayDriver,
      useClass: IntrospectAndComposeFactory,
    }),
  ],
})
export class AppModule {}
