import {createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import BlePage from './src/pages/BlePage';
import LoginPage from './src/pages/LoginPage';

const AppNavigator = createStackNavigator(
  {
    'Login': {
      screen: LoginPage,
      navigationOptions: {
        title: 'Conectar',
        headerTitleStyle: {
          textAlign: 'center',
          fontSize: 20,
          color: 'green',
          // headerStyle: {
          //   backgroundColor: '#f4f2ff',
          //   borderBottomColor: '#008e00',
          // },
        },
      }
    },
    'BlePage': {
      screen: BlePage,
      navigationOptions: {
        title: 'Devices',
        headerTitleStyle: {
          textAlign: 'left',
          fontSize: 20,
        },
      }
    },
  },
  {
    defaultNavigationOptions: {
      title: 'PlantControl',
      headerTintColor: 'green',
      headerStyle: {
        backgroundColor: '#f4f2ff',
        borderBottomColor: '#008e00',
      },
      headerTitleStyle: {
        color: 'green',
        fontSize: 20,
        flexGrow: 1, 
        textAlign: 'center',
      }
    }
  }
);

const AppContainer = createAppContainer(AppNavigator);

export default AppContainer;