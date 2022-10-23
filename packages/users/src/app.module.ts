import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersResolver } from './users/user.resolver';
import { UsersService } from './users/users.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersController } from './users/users.controller';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: true,
    }),
    ClientsModule.register([
      {
        transport: Transport.NATS,
        name: 'serviceMesh',
        options: {
          servers: ['https://localhost:4222'],
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersResolver],
})
export class AppModule {}
