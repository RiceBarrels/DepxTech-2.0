import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reforkit.app',
  appName: 'Sanus Space',
  webDir: 'out',
  server: {
    url: 'http://192.168.156.48:3000',
    cleartext: true,
  },
};

export default config;
