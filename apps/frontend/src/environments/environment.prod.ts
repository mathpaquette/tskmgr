// eslint-disable-next-line @nx/enforce-module-boundaries
import packageJson from '../../../../package.json';

export const environment = {
  production: true,
  version: packageJson.version,
};
