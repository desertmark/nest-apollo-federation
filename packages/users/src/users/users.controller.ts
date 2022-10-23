import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @MessagePattern('users.findById')
  async findById(@Payload() userId: number) {
    return await this.usersService.findById(userId);
  }
}
