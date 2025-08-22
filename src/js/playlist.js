        // ---- Playlist data ----
        const PLAYLIST = [
            { id: '#t0', title: 'Cyber Stroll' },
            { id: '#t1', title: 'Electric Neon Heart' },
            { id: '#t2', title: 'Neon Streets' },
            { id: '#t3', title: 'Synth Beat' },
        ];

        // Utility: toggle A-Frame <a-sound>
        export function toggleSound(soundEl) {
            const sound = soundEl.components.sound;
            if (!sound) return;
            if (sound.isPlaying) sound.stopSound(); else sound.playSound();
        }

        export function setTrack(soundEl, idx) {
            const clamped = ((idx % PLAYLIST.length) + PLAYLIST.length) % PLAYLIST.length; // wrap both directions
            const track = PLAYLIST[clamped];
            soundEl.setAttribute('src', track.id);
            // Force reload to avoid stale buffer
            const comp = soundEl.components.sound;
            if (comp && comp.pool && comp.pool.children.length) {
                comp.pool.children.forEach((a) => { a.pause(); a.currentTime = 0; });
            }
            const title = document.querySelector('#trackTitle');
            if (title) title.textContent = `${clamped + 1}/${PLAYLIST.length} — ${track.title}`;
            soundEl.emit('trackchanged', { index: clamped }, false);
            return clamped;
        }

        document.addEventListener('DOMContentLoaded', () => {
            const scene = document.querySelector('a-scene');
            const box = document.querySelector('#jukebox');
            const music = document.querySelector('#music'); // БЫЛО #t0 — теперь верно
            const left = document.querySelector('#leftHand');
            const right = document.querySelector('#rightHand');
            const prevBtn = document.querySelector('#prevBtn');
            const nextBtn = document.querySelector('#nextBtn');

            let index = 0;
            index = setTrack(music, index);

            // Desktop interactions
            box.addEventListener('click', () => toggleSound(music));
            prevBtn.addEventListener('click', () => { index = setTrack(music, index - 1); music.components.sound.playSound(); });
            nextBtn.addEventListener('click', () => { index = setTrack(music, index + 1); music.components.sound.playSound(); });

            // Hover highlight for better UX
            const hover = (el, base, over) => {
                el.addEventListener('mouseenter', () => el.setAttribute('color', over));
                el.addEventListener('mouseleave', () => el.setAttribute('color', base));
            };
            hover(box, '#4CC3D9', '#26a8d8');
            hover(prevBtn, '#FFC65D', '#ffd588');
            hover(nextBtn, '#FFC65D', '#ffd588');

            // Keyboard shortcuts (desktop): J = prev, K = play/pause, L = next
            window.addEventListener('keydown', (e) => {
                if (e.repeat) return;
                if (e.key === 'k' || e.key === 'K') toggleSound(music);
                if (e.key === 'j' || e.key === 'J') { index = setTrack(music, index - 1); music.components.sound.playSound(); }
                if (e.key === 'l' || e.key === 'L') { index = setTrack(music, index + 1); music.components.sound.playSound(); }
            });

            // VR controller trigger logic with raycaster hit-test
            const attachTrigger = (hand) => {
                if (!hand) return;
                const ready = () => {
                    hand.addEventListener('triggerdown', () => {
                        const ray = hand.components.raycaster; if (!ray) return;
                        const hits = ray.intersectedEls || [];
                        if (hits.includes(box)) toggleSound(music);
                        if (hits.includes(prevBtn)) { index = setTrack(music, index - 1); music.components.sound.playSound(); }
                        if (hits.includes(nextBtn)) { index = setTrack(music, index + 1); music.components.sound.playSound(); }
                    });
                };
                if (hand.hasLoaded) ready(); else hand.addEventListener('loaded', ready, { once: true });
            };

            scene.addEventListener('loaded', () => { attachTrigger(left); attachTrigger(right); });
        });