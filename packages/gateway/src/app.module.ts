import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { IntrospectAndComposeFactory } from './CustomIntrospectAndCompose';
import { LoggerModule } from './modules/logger/logger.module';
import { MouleculerModule } from './modules/moleculer/moleculer.module';

const moleculerModule = MouleculerModule.forRoot({
  brokerOptions: {
    transporter: {
      type: 'NATS',
      options: {
        servers: ['https://localhost:4222'],
      },
    },
  },
});

@Module({
  imports: [
    moleculerModule,
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      imports: [LoggerModule, moleculerModule],
      driver: ApolloGatewayDriver,
      useClass: IntrospectAndComposeFactory,
    }),
  ],
})
export class AppModule {}
