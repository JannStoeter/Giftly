import './styles/main.css';
import { loadState } from './state.js';
import { route } from './render.js';
import './actions.js';

loadState();
window.addEventListener('hashchange',route);
route();
