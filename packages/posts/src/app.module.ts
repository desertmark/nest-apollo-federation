import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PostsResolver } from './posts/post.resolver';
import { PostsService } from './posts/post.service';
import { PostsController } from './posts/posts.controller';

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
  controllers: [PostsController],
  providers: [PostsResolver, PostsService],
})
export class AppModule {}
