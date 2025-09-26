import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class TenantProvider {
  private tenant: string;

  constructor(@Inject(REQUEST) private request: any) {
    const user = this.request.user;
    this.tenant = user ? user.tenant : null;
  }

  getTenant(): string {
    return this.tenant;
  }
}