import Conf from 'conf';

import { Flow } from './flows/types';
import { Credentials, UserId } from './spotify-api-setup';

type ConfigSchema = {
  'podcast-flows': Flow[];
  credentials?: Record<UserId, Credentials>;
  currentUserId?: UserId;
};

export class Config {
  private conf: Conf<ConfigSchema>;

  constructor() {
    this.conf = new Conf<ConfigSchema>();
  }

  public getFlows(): Flow[] {
    return this.conf.get('podcast-flows') || [];
  }

  public setFlows(flows: Flow[]): void {
    this.conf.set('podcast-flows', flows);
  }

  public getCurrentUserId(): UserId | null {
    return this.conf.get('currentUserId') || null;
  }

  public getCredentialsByUserId(userId: string): Credentials | null {
    const credentials = this.conf.get('credentials');
    return credentials ? credentials[userId] : null;
  }

  public setCurrentUser(userId: UserId): void {
    this.conf.set('currentUserId', userId);
  }

  public saveCredentials(userId: UserId, newCredentials: Credentials): void {
    const savedCredentials = this.conf.get('credentials');
    this.conf.set('credentials', { ...savedCredentials, [userId]: newCredentials });
  }
}
