export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5111',
  keycloak: {
    authority: 'http://localhost:8080/realms/proyecto-seguro',
    clientId: 'foodies-angular'
  },
  oauth: {
    tokenUrl: '/connect/token',
    clientId: 'gateway',
    clientSecret: 'super-secreto',
    scope: 'mi-api offline_access'
  }
};
