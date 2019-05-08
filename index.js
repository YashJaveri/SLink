/** @format */

import {AppRegistry, StatusBar, Platform, YellowBox } from 'react-native';
import App from './App';
import {name as appName} from './app.json';

YellowBox.ignoreWarnings = ([
  'Task orphaned for request ',
  'Remote debugger is in a background tab which may cause apps to perform slowly',
]);

Platform.OS==="android"?StatusBar.setBackgroundColor("#211E20"):(null);
StatusBar.setBarStyle('light-content', true);

AppRegistry.registerComponent(appName, () => App);
