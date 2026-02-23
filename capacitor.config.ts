import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reforkit.depxtech',
  appName: 'DepxTech',
  webDir: 'out',
  server: {
    // url: 'https://cbt.depxtech.com',
    url: 'http://192.168.1.108:3000',
    cleartext: true,
  },
  plugins: {
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
