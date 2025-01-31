import AsyncStorage from "@react-native-async-storage/async-storage";

const getItem = async (key) => {
    try {
        const item = await AsyncStorage.getItem(key);
        return item;
    } catch (error) {
        console.error(`Error fetching ${key}:`, error);
    }
};

export const getUserId = () => getItem('user_id');
export const getUserName = () => getItem('name');
export const getUserMobile = () => getItem('mobile');
