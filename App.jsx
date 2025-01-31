/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, { useState, useEffect } from 'react';
import {
  LogBox,
  View
} from 'react-native';
LogBox.ignoreLogs(["Warning: ..."]);
LogBox.ignoreAllLogs();
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './src/screens/Home';
import Login from './src/screens/Login';
import MyAccount from './src/screens/MyAccount';
import Transaction from './src/screens/Transaction';
import Collection from './src/screens/Collection';
import AsyncStorage from '@react-native-async-storage/async-storage';

function App() {
  const Stack = createNativeStackNavigator();
  const [local, setLocal] = useState(null);

  useEffect(() => {
    loadStoredValue();
  }, []);

  const loadStoredValue = async () => {
    try {
      const value = await AsyncStorage.getItem('user_id');
      if (value) {
        setLocal(value);
      } else {
        setLocal(false)
      }
    } catch (error) {
      console.error('Error loading stored value:', error);
    }
  };

  const screens = [
    { name: 'Home', component: Home },
    { name: 'Login', component: Login },
    { name: 'MyAccount', component: MyAccount },
    { name: 'Transaction', component: Transaction },
    { name: 'Collection', component: Collection }
  ];
  if (local === null) {
    return <View />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationTypeForReplace: 'pop',
          gestureEnabled: true,
        }}
        initialRouteName={local ? "Home" : "Login"}
      >
        {screens.map((item) => (
          <Stack.Screen key={item.name} name={item.name} component={item.component} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  ); 
}


export default App;
