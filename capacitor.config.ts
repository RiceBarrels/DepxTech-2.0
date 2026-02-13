import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reforkit.depxtech',
  appName: 'DepxTech',
  webDir: 'out',
  server: {
    url: 'https://cbt.depxtech.com',
    cleartext: true,
  },
};

export default config;
