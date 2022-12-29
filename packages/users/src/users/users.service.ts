import { Injectable } from '@nestjs/common';
import { ServiceBroker } from 'moleculer';
import { User } from './user.entity';
import { lastValueFrom } from 'rxjs';

const users = [
  {
    name: 'Brooke Stevenson',
    id: 4,
  },
  {
    name: 'Charissa Sloan',
    id: 5,
  },
  {
    name: 'Hillary Wilkerson',
    id: 1,
  },
  {
    name: 'Austin Bryant',
    id: 2,
  },
  {
    name: 'Brendan Stanton',
    id: 3,
  },
];

@Injectable()
export class UsersService {
  private _users: User[] = users;
  constructor(private broker: ServiceBroker) {}

  async all(): Promise<User[]> {
    const tasks = this._users.map(async (u) => {
      u.posts = await lastValueFrom(
        this.broker.send('posts.getByUserId', u.id),
      );
      return u;
    });
    return await Promise.all(tasks);
  }

  async findById(id: number): Promise<User> {
    return this._users.find((u) => u.id === id) || this._users[0];
  }
}
