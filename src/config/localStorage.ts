import { StorageService } from '../constants/StorageService';
import { STORAGE_KEYS } from '../constants/storage';

export const getUserId = (): Promise<string | number | null> => StorageService.getItem(STORAGE_KEYS.USER_ID);
export const getUserName = (): Promise<string | null> => StorageService.getItem(STORAGE_KEYS.USER_NAME);
export const getUserMobile = (): Promise<string | null> => StorageService.getItem(STORAGE_KEYS.USER_MOBILE);

export default StorageService;
