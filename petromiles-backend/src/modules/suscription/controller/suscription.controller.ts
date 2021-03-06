import {
  Controller,
  Post,
  UseGuards,
  Body,
  ParseIntPipe,
  Inject,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { GetUser } from '@/modules/auth/decorators/get-user.decorator';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';

// INTERFACES
import { ApiModules } from '@/logger/api-modules.enum';
import { HttpRequest } from '@/logger/http-requests.enum';

// SERVICES
import { SuscriptionService } from '@/modules/suscription/service/suscription.service';
import { Suscription } from '@/entities/suscription.entity';

const baseEndpoint = 'suscription';
@UseGuards(AuthGuard('jwt'))
@Controller(baseEndpoint)
export class SuscriptionController {
  constructor(
    private suscriptionService: SuscriptionService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Roles()
  @UseGuards(RolesGuard)
  @Post('upgrade-to-premium')
  async upgradeToPremiumSuscription(
    @GetUser() user,
    @Body('idBankAccount', ParseIntPipe) idBankAccount,
  ) {
    this.logger.http(
      `[${ApiModules.SUSCRIPTION}] (${HttpRequest.POST})  ${user?.email} asks /${baseEndpoint}/upgrade-to-premium`,
    );
    await this.suscriptionService.upgradeToPremium(user.email, idBankAccount);
  }

  @Get('actual')
  getActualSuscription(@GetUser() user): Promise<Suscription> {
    this.logger.http(
      `[${ApiModules.SUSCRIPTION}] (${HttpRequest.GET}) ${user?.email} asks /${baseEndpoint}/actual`,
    );
    return this.suscriptionService.getActualSubscription(user.email);
  }
}
