import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Post } from './post.entity';
const posts = [
  {
    title: 'non, dapibus rutrum, justo. Praesent luctus. Curabitur',
    id: 1,
    authorId: 5,
  },
  {
    title: 'ac mattis velit justo nec ante.',
    id: 2,
    authorId: 3,
  },
  {
    title: 'a purus. Duis elementum, dui quis',
    id: 3,
    authorId: 5,
  },
  {
    title: 'vestibulum lorem, sit amet ultricies sem magna nec quam. Curabitur',
    id: 4,
    authorId: 2,
  },
  {
    title: 'Suspendisse ac metus',
    id: 5,
    authorId: 4,
  },
];

@Injectable()
export class PostsService {
  constructor(@Inject('serviceMesh') private serviceMesh: ClientProxy) {
    console.log(posts);
  }

  private _posts: Post[] = posts;

  async all(): Promise<Post[]> {
    const tasks = this._posts.map(async (p) => {
      p.user = await lastValueFrom(
        this.serviceMesh.send('users.findById', p.authorId),
      );
      return p;
    });
    return await Promise.all(tasks);
  }

  async findByUserId(userId: number): Promise<Post[]> {
    return this._posts.filter((p) => p.authorId === userId);
  }
}
