import { PostsService } from './post.service';
import { Post } from './post.entity';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @MessagePattern('posts.getByUserId')
  public posts(@Payload() userId: number): Promise<Post[]> {
    return this.postsService.findByUserId(userId);
  }
}
