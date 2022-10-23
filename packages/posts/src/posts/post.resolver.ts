import { Query, Resolver } from '@nestjs/graphql';
import { PostsService } from './post.service';
import { Post } from './post.entity';

@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return this.postsService.all();
  }
}
