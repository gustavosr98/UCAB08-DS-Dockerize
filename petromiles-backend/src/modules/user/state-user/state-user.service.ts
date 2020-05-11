import { Injectable } from '@nestjs/common';
import { StateUser } from './state-user.entity';
import { getConnection } from 'typeorm';
import { StateService } from '../../management/state/state.service';
import { UserClient } from '../../client/user-client/user-client.entity';
import { StateName } from '../../management/state/state.enum';

@Injectable()
export class StateUserService {
  private connection = getConnection();

  constructor(private stateService: StateService) {}

  async createStateUserClient(
    user: UserClient,
    stateName: StateName,
    description: string,
  ): Promise<StateUser> {
    const userState = new StateUser();
    userState.userClient = user;
    userState.initialDate = new Date();
    userState.description = description;
    userState.state = await this.stateService.getState(stateName);

    return await this.connection.manager.save(userState);
  }
}