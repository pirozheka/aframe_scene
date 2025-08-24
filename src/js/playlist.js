  // --- Разблокировка аудио по первому жесту
  function unlockAudio() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!AFRAME.audioContext) AFRAME.audioContext = new Ctx();
    if (AFRAME.audioContext.state === 'suspended') AFRAME.audioContext.resume();
  }

  // Ждём инициализации сцены (важно!)
  (function initPlaylist() {
    const scene = document.querySelector('a-scene');
    const onLoaded = () => {
      const musicEl   = document.querySelector('#music');
      const soundComp = musicEl?.components?.sound;
      const titleEl   = document.getElementById('trackTitle');
      const highlight = document.getElementById('holoHighlight');

      // Поддержка двух разметок: с hit‑плоскостями и без
      let lineEls = Array.from(document.querySelectorAll('.track-line-hit, .track-line'));
      if (!lineEls.length) return;

      // Утилиты: получить «текстовый» саб‑элемент и подпись
      const getTextEl = (lineEl) =>
        lineEl.querySelector('.track-text') || lineEl;

      const getLabel  = (lineEl) => {
        // приоритет data-label, иначе берём из text.value
        const dl = lineEl.getAttribute('data-label');
        if (dl) return dl;
        const txt = getTextEl(lineEl).getAttribute('text');
        // атрибут text в A-Frame сериализован; берём value через getAttribute('text').value, если поддерживается
        if (txt && typeof txt === 'object' && 'value' in txt) return txt.value;
        // на случай старых браузеров — вытаскиваем через dataset (необязательно)
        return getTextEl(lineEl).components?.text?.data?.value || '';
      };

      // Текущее состояние
      let current = 0;
      let isPlaying = false;

      function setHudTitle(fromLabel) {
        if (!titleEl) return;
        titleEl.textContent = (fromLabel || '').replace(/^\d+\.\s*/, '') || '—';
      }

      function colorizeActive() {
        lineEls.forEach((el, idx) => {
          const textEl = getTextEl(el);
          textEl.setAttribute('text', 'color', idx === current ? '#FFFFFF' : '#CFFFFF');
        });
      }

      function moveHighlightTo(idx) {
        if (!highlight || !lineEls[idx]) return;
        const y = lineEls[idx].object3D.position.y;
        highlight.object3D.position.y = y;
      }

      function setSourceTo(idx) {
        const trackId = lineEls[idx].getAttribute('data-track'); // "#t0" etc.
        if (trackId) {
          musicEl.setAttribute('sound', 'src', trackId);
        }
      }

      function stopPlayback() {
        if (!soundComp) return;
        soundComp.stopSound?.();
        isPlaying = false;
      }

      function playFromStart() {
        if (!soundComp) return;
        unlockAudio();
        soundComp.stopSound?.(); // сброс на начало
        soundComp.playSound?.();
        isPlaying = true;
      }

      function selectTrack(idx, opts = { autoplay: false }) {
        current = (idx + lineEls.length) % lineEls.length;
        setSourceTo(current);
        setHudTitle(getLabel(lineEls[current]));
        moveHighlightTo(current);
        colorizeActive();
        if (opts.autoplay) playFromStart();
      }

      // Навесить обработчики на строки
      lineEls.forEach((el, idx) => {
        // Клик: если это текущая и играет — остановить; иначе — выбрать и проиграть
        el.addEventListener('click', () => {
          if (!soundComp) return;
          const isSame = idx === current;
          const actuallyPlaying = soundComp.isPlaying && isPlaying;

          if (isSame && actuallyPlaying) {
            stopPlayback();
          } else {
            selectTrack(idx, { autoplay: true });
          }
        });

        // Лёгкий hover‑эффект
        el.addEventListener('mouseenter', () => {
          getTextEl(el).setAttribute('text', 'color', '#FFFFFF');
        });
        el.addEventListener('mouseleave', () => {
          getTextEl(el).setAttribute('text', 'color', idx === current ? '#FFFFFF' : '#CFFFFF');
        });
      });

      // Сбрасывать флаг после завершения трека
      musicEl.addEventListener('sound-ended', () => {
        isPlaying = false;
      });

      // Первичная инициализация UI/источника без автоплея
      selectTrack(0, { autoplay: false });
    };

    if (scene.hasLoaded) onLoaded();
    else scene.addEventListener('loaded', onLoaded);
  })();