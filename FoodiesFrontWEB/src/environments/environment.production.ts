export const environment = {
  production: true,
  apiBaseUrl: 'https://foodies-gateway.onrender.com',
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
