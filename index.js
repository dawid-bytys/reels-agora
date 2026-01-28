import { AppRegistry } from 'react-native';
import { App } from './src/App';
import { name as appName } from './app.json';
import Reactotron from 'reactotron-react-native';

Reactotron.configure().useReactNative().connect();

AppRegistry.registerComponent(appName, () => App);
