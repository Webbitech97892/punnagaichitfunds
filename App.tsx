import React, { useState, useEffect } from 'react';
import { LogBox, View, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './src/screens/Home';
import Login from './src/screens/Login';
import MyAccount from './src/screens/MyAccount';
import Transaction from './src/screens/Transaction';
import Collection from './src/screens/Collection';
import { BottomTabBar } from './src/components';
import { StorageService } from './src/constants/StorageService';
import { colors } from './src/theme';
import { RootStackParamList } from './src/types';

LogBox.ignoreAllLogs();

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs(): React.JSX.Element {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      initialRouteName="Home"
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Collection" component={Collection} />
      <Tab.Screen name="Transaction" component={Transaction} />
      <Tab.Screen name="MyAccount" component={MyAccount} />
    </Tab.Navigator>
  );
}

function App(): React.JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userId = await StorageService.getUserId();
      setIsAuthenticated(Boolean(userId));
    } catch (error) {
      console.error('[App] Error checking stored auth:', error);
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    return <View style={styles.rootFallback} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} animated={true} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'none',
            contentStyle: { backgroundColor: colors.background },
          }}
          initialRouteName={isAuthenticated ? 'MainTabs' : 'Login'}
        >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootFallback: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default App;
