Hooks.once('ready', () => {
  console.log('Petra Module initialized');
  
  const MODULE_ID = '1-in-10000-petra-jumpscare';
  const CHANCE = 1 / 1; //Debug be sure to change this to the actual 1 in 10000
  const CHECK_INTERVAL = 60000;
  
  // Asset paths (relative to module directory)
  const FRAMES_PATH = `modules/${MODULE_ID}/SkeletonAssets/running_skeleton_frames`;
  const AUDIO_PATH = `modules/${MODULE_ID}/SkeletonAssets/badtotheboneriff.wav`;
  const FIRST_FRAME = 1;
  const LAST_FRAME = 43;
  const MAX_DISPLAY_TIME = 15000;
  const FRAME_RATE = 33; // Milliseconds per frame

  function triggerJumpscare() {
    if (document.getElementById('jumpscare-container')) {
      return;
    }
    
    console.log('Skrull mentioned');
    
    // Create container with proper Foundry z-index (ui layer)
    const container = document.createElement('div');
    container.id = 'jumpscare-container';
    container.className = 'jumpscare-overlay';
    
    // Create image element for animation
    const img = document.createElement('img');
    img.className = 'jumpscare-image';
    img.src = `${FRAMES_PATH}/frame${FIRST_FRAME}.png`;
    img.alt = 'Jumpscare animation';
    
    // Create audio element
    const audio = document.createElement('audio');
    audio.src = AUDIO_PATH;
    audio.autoplay = true;
    audio.muted = false;
    
    container.appendChild(img);
    container.appendChild(audio);
    document.body.appendChild(container);
    
    // Animate through frames
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
    
    // Remove overlay function
    const removeOverlay = () => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
    
    // Cleanup when audio ends
    audio.addEventListener('ended', () => {
      clearInterval(animationInterval);
      removeOverlay();
    }, { once: true });
    
    // Fallback: remove after max display time
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
  
  // Start periodic chance checking
  setInterval(checkChance, CHECK_INTERVAL);
});
