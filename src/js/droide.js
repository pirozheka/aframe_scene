const robot = document.querySelector('#robot');

robot.addEventListener('model-loaded', () => {
  // 1) прыгаем на 9.45 c (9450 мс) при ненулевой скорости
  robot.setAttribute('animation-mixer', 'clip: motion; startAt: 9450; timeScale: 1');

  // 2) в следующем тике ставим на паузу на нужном кадре
  requestAnimationFrame(() => {
    robot.setAttribute('animation-mixer', 'timeScale', 0);
  });
});
