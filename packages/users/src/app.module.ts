import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersResolver } from './users/user.resolver';
import { UsersService } from './users/users.service';
import { MouleculerModule } from './moleculer/moleculer.module';
@Module({
  imports: [
    MouleculerModule.forRoot({
      endpoint: { name: 'users', url: 'http://localhost:3001/graphql' },
      brokerOptions: {
        transporter: {
          type: 'NATS',
          options: {
            servers: ['https://localhost:4222'],
          },
        },
      },
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: true,
    }),
  ],
  providers: [UsersService, UsersResolver],
})
export class AppModule {}
