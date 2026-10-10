import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storage';

export class StorageService {
  static async setItem<T>(key: STORAGE_KEYS | string, value: T): Promise<boolean> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error(`[StorageService] Error saving ${key}:`, error);
      return false;
    }
  }

  static async getItem<T>(key: STORAGE_KEYS | string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) {return null;}
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      console.error(`[StorageService] Error reading ${key}:`, error);
      return null;
    }
  }

  static async removeItem(key: STORAGE_KEYS | string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[StorageService] Error removing ${key}:`, error);
      return false;
    }
  }

  static async multiRemove(keys: (STORAGE_KEYS | string)[]): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove(keys as string[]);
      return true;
    } catch (error) {
      console.error('[StorageService] Error multi removing keys:', error);
      return false;
    }
  }

  static async clearAuth(): Promise<void> {
    await this.multiRemove([
      STORAGE_KEYS.USER_ID,
      STORAGE_KEYS.USER_NAME,
      STORAGE_KEYS.USER_MOBILE,
      STORAGE_KEYS.AGENT_DATA,
      STORAGE_KEYS.AUTH_TOKEN,
    ]);
  }

  static async getUserId(): Promise<string | number | null> {
    return await this.getItem<string | number>(STORAGE_KEYS.USER_ID);
  }

  static async getUserName(): Promise<string | null> {
    return await this.getItem<string>(STORAGE_KEYS.USER_NAME);
  }

  static async getUserMobile(): Promise<string | null> {
    return await this.getItem<string>(STORAGE_KEYS.USER_MOBILE);
  }
}

export default StorageService;
