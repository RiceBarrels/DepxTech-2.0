import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reforkit.depxtech',
  appName: 'DepxTech',
  webDir: 'out',
  server: {
    url: 'http://192.168.1.108:3000',
    cleartext: true,
  },
};

export default config;
