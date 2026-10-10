import packageInfo from '../../package.json';

/**
 * Dynamically extracted App Version from package.json
 */
export const APP_VERSION_RAW = packageInfo.version || '1.0.0';
export const APP_VERSION = `v${APP_VERSION_RAW}`;

export default APP_VERSION;
