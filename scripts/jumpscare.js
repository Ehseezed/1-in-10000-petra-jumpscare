const MODULE_ID = '1-in-10000-petra-jumpscare';
const CHECK_INTERVAL = 1000;
const DEFAULT_IMAGE_PATH = `modules/${MODULE_ID}/SkeletonAssets/gifs/skeleton.webp`;
const DEFAULT_AUDIO_PATH = `modules/${MODULE_ID}/SkeletonAssets/sounds/skeleton.wav`;

Hooks.once('init', () => {
  game.settings.register(MODULE_ID, 'enabled', {
    name: 'Petra Jumpscare Enabled',
    hint: 'Enable the random jumpscare.',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, 'chance', {
    name: 'Petra Jumpscare Chance',
    hint: 'The chance of the jumpscare happening every second expressed as a 1/[value] chance. Default is 1/10000.',
    scope: 'world',
    config: true,
    type: Number,
    default: 10000,
    range: {
      min: 1,
      max: 10000,
      step: 1
    }
  });

  game.settings.register(MODULE_ID, 'imagePath', {
    name: 'Jumpscare gif',
    hint: 'A path to an image or animated WebP file. For example: modules/my-module/jumpscare.webp',
    scope: 'world',
    config: true,
    type: String,
    default: DEFAULT_IMAGE_PATH
  });

  game.settings.register(MODULE_ID, 'audioPath', {
    name: 'Jumpscare Audio',
    hint: 'A path to the audio file played with the jumpscare.',
    scope: 'world',
    config: true,
    type: String,
    default: DEFAULT_AUDIO_PATH
  });

  game.settings.register(MODULE_ID, 'volume', {
    name: 'Audio Volume',
    hint: 'The jumpscare audio volume.',
    scope: 'world',
    config: true,
    type: Number,
    default: 0.15,
    range: {
      min: 0,
      max: 1,
      step: 0.05
    }
  });

  game.settings.register(MODULE_ID, 'displayTime', {
    name: 'Max Display Time',
    hint: 'Max time until the overlay is forcibly removed as a safety measure. The default is 15 seconds extend it if you have a really long animation.',
    scope: 'world',
    config: true,
    type: Number,
    default: 15,
    range: {
      min: 1,
      max: 300,
      step: 1
    }
  });
});

Hooks.once('ready', () => {
  console.log('Petra Module initialized');

  function getAnimatedImageDuration(data) {
    const bytes = new Uint8Array(data);
    const view = new DataView(data);
    const signature = String.fromCharCode(...bytes.slice(0, 4));

    if (signature === 'GIF8') {
      let offset = 13;
      const packed = bytes[10];
      if (packed & 0x80) offset += 3 * (2 ** ((packed & 0x07) + 1));

      let duration = 0;
      while (offset < bytes.length) {
        if (bytes[offset] === 0x21 && bytes[offset + 1] === 0xf9) {
          duration += Math.max(view.getUint16(offset + 4, true) * 10, 10);
          offset += 8;
        } else if (bytes[offset] === 0x2c) {
          const imagePacked = bytes[offset + 9];
          offset += 10;
          if (imagePacked & 0x80) offset += 3 * (2 ** ((imagePacked & 0x07) + 1));
          offset++;
          while (offset < bytes.length && bytes[offset] !== 0) {
            offset += bytes[offset] + 1;
          }
          offset++;
        } else if (bytes[offset] === 0x3b) {
          break;
        } else if (bytes[offset] === 0x21) {
          offset += 2;
          while (offset < bytes.length && bytes[offset] !== 0) {
            offset += bytes[offset] + 1;
          }
          offset++;
        } else {
          offset++;
        }
      }
      return duration || null;
    }

    if (signature === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') {
      let offset = 12;
      let duration = 0;
      while (offset + 8 <= bytes.length) {
        const chunk = String.fromCharCode(...bytes.slice(offset, offset + 4));
        const size = view.getUint32(offset + 4, true);
        if (chunk === 'ANMF' && size >= 19) {
          duration += Math.max(
            bytes[offset + 20] | (bytes[offset + 21] << 8) | (bytes[offset + 22] << 16),
            10
          );
        }
        offset += 8 + size + (size % 2);
      }
      return duration || null;
    }

    return null;
  }

  async function getFirstLoopDuration(imagePath) {
    try {
      const response = await fetch(imagePath);
      if (!response.ok) {
        console.warn(`Unable to read jumpscare animation metadata: ${response.status} ${response.statusText}`);
        return null;
      }
      return getAnimatedImageDuration(await response.arrayBuffer());
    } catch (error) {
      console.warn('Unable to read gif/webp animation metadata.', error);
      console.warn('Unable to read  animation metadata.', error);
      return null;
    }
  }

  function getPlaybackUrl(imagePath) {
    const separator = imagePath.includes('?') ? '&' : '?';
    return `${imagePath}${separator}play=${Date.now()}`;
  }

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
    // Use a fresh URL so the browser restarts animated images on every play.
    img.src = getPlaybackUrl(game.settings.get(MODULE_ID, 'imagePath').trim());
    img.alt = 'Jumpscare animation';

    const audio = document.createElement('audio');
    audio.src = game.settings.get(MODULE_ID, 'audioPath').trim();
    audio.autoplay = true;
    audio.muted = false;
    audio.volume = game.settings.get(MODULE_ID, 'volume');
    
    container.appendChild(img);
    container.appendChild(audio);
    document.body.appendChild(container);

    let removeTimer;
    let overlayRemoved = false;
    const removeOverlay = () => {
      overlayRemoved = true;
      if (removeTimer) {
        clearTimeout(removeTimer);
      }
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
    audio.addEventListener('ended', () => {
      removeOverlay();
    }, { once: true });

    getFirstLoopDuration(img.src).then((duration) => {
      const fallbackDuration = game.settings.get(MODULE_ID, 'displayTime') * 1000;
      if (!overlayRemoved) {
        removeTimer = setTimeout(
          removeOverlay,
          Math.min(duration ?? fallbackDuration, fallbackDuration)
        );
      }
    });
  }

  function checkChance() {
    var chance = game.settings.get(MODULE_ID, 'chance');
    chance = 1 / chance; // Convert to a probability between 0 and 1
    if (game.settings.get(MODULE_ID, 'enabled')
      && Math.random() < chance) {
      triggerJumpscare();
    }
  }

  setInterval(checkChance, CHECK_INTERVAL);
});
