Hooks.once('ready', () => {
  console.log('Petra Module initialized');
  
  const MODULE_ID = '1-in-10000-petra-jumpscare';
  const CHANCE = 1 / 10000;
  const CHECK_INTERVAL = 1000; // 1000 milleseconds = 1 second

  const FRAMES_PATH = `modules/${MODULE_ID}/SkeletonAssets/running_skeleton_frames`;
  const AUDIO_PATH = `modules/${MODULE_ID}/SkeletonAssets/badtotheboneriff.wav`;
  const FIRST_FRAME = 1;
  const LAST_FRAME = 43;
  const MAX_DISPLAY_TIME = 15000; // milliseconds for max timeout
  const FRAME_RATE = 33; // Milliseconds per frame

  function triggerJumpscare() {
    if (document.getElementById('jumpscare-container')) {
      return;
    }
    
    console.log('Skrull mentioned');

    const container = document.createElement('div');
    container.id = 'jumpscare-container';
    container.className = 'jumpscare-overlay';

    const img = document.createElement('img');
    img.className = 'jumpscare-image';
    img.src = `${FRAMES_PATH}/frame${FIRST_FRAME}.png`;
    img.alt = 'Jumpscare animation';

    const audio = document.createElement('audio');
    audio.src = AUDIO_PATH;
    audio.autoplay = true;
    audio.muted = false;
    audio.volume = 0.15;
    
    container.appendChild(img);
    container.appendChild(audio);
    document.body.appendChild(container);

    let currentFrame = FIRST_FRAME;
    const animationInterval = setInterval(() => {
      currentFrame++;
      if (currentFrame > LAST_FRAME) {
        clearInterval(animationInterval);
        removeOverlay();
      } else {
        img.src = `${FRAMES_PATH}/frame${currentFrame}.png`;
      }
    }, FRAME_RATE);

    const removeOverlay = () => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };

    audio.addEventListener('ended', () => {
      clearInterval(animationInterval);
      removeOverlay();
    }, { once: true });

    setTimeout(() => {
      clearInterval(animationInterval);
      removeOverlay();
    }, MAX_DISPLAY_TIME);
  }

  function checkChance() {
    if (Math.random() < CHANCE) {
      triggerJumpscare();
    }
  }

  setInterval(checkChance, CHECK_INTERVAL);
});
