import 'react-native-gesture-handler';
import * as React from 'react';
import {
  NativeBaseProvider,
  extendTheme,
  StatusBar
} from 'native-base';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import DrawerContent from './src/screens/drawercontent/index'
import HomeScreen from './src/screens/home/index'

import { SCREENS } from './src/config/constants'
import { colors } from './src/config/styles'

const Drawer = createDrawerNavigator();

const theme = extendTheme({ colors: colors });

const config = {
  dependencies: {
    // For Expo projects (Bare or managed workflow)
    'linear-gradient': require('expo-linear-gradient').LinearGradient,
    // For non expo projects
    // 'linear-gradient': require('react-native-linear-gradient').default,
  },
};

export default function App() {
  return (
    <NativeBaseProvider config={config} theme={theme}>
      <StatusBar backgroundColor={colors.primary[600]} barStyle="light-content" />
      <NavigationContainer>
        <Drawer.Navigator initialRouteName={SCREENS.HOME} drawerContentOptions={SCREENS} drawerContent={props => <DrawerContent {...props} />}>
          <Drawer.Screen name={SCREENS.HOME} component={HomeScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>

  );
}