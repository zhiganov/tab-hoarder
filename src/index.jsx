import { render } from 'preact';
import { App } from './app';
import { initSettings } from './store/settings';
import './styles/variables.css';
import './styles/global.css';

initSettings();
render(<App />, document.getElementById('app'));
