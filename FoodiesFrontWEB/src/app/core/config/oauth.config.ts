import { environment } from '../../../environments/environment';

function buildTokenUrl(base: string, path: string): string {
  if (!base) return path;
  if (!path) return base;
  return base.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}

export const OAUTH_CONFIG = {
  tokenUrl: buildTokenUrl(environment.apiBaseUrl, environment.oauth.tokenUrl),
  clientId: environment.oauth.clientId,
  clientSecret: environment.oauth.clientSecret,
  scope: environment.oauth.scope,
};
