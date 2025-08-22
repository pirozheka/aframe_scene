const robot = document.querySelector('#robot');

robot.addEventListener('model-loaded', () => {
  const comp = robot.components['animation-mixer'];
  const root = robot.getObject3D('mesh');

  const clip = THREE.AnimationClip.findByName(root.animations, 'motion');
  if (!clip) { console.warn('Клип "motion" не найден'); return; }

  const action = comp.mixer.clipAction(clip, root);
  action.clampWhenFinished = true;
  action.enabled = true;
  action.setEffectiveWeight(1.0);
  action.setLoop(THREE.LoopOnce, 0);

  comp.mixer.timeScale = 0;   // стопаем миксер

  const desired = 11;        // твоя целевая поза (сек)
  const eps = 1e-3;
  const t = Math.max(0, Math.min(desired, clip.duration - eps));

  action.play();
  action.paused = true;
  action.time = t;
  comp.mixer.update(0);       // применяем сразу
});