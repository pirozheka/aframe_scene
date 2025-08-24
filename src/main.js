import AFRAME from 'aframe';
import 'aframe-extras';
import './js/playlist.js';
import './js/droide.js';


// улучшить карту теней
const sceneEl = document.querySelector('a-scene');
sceneEl.addEventListener('loaded', () => {
    const sun = document.querySelector('#sun').getObject3D('light');
    if (sun && sun.shadow) {
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.bias = -0.0001;
    }
});