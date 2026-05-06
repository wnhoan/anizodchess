import { Animal } from '../types';

const ANIMAL_SOUNDS: Partial<Record<Animal, string>> = {
  // Jungle & Zodiac Shared/Similar
  [Animal.MOUSE]: 'https://assets.mixkit.co/active_storage/sfx/2281/2281-preview.mp3', // Squeak
  [Animal.RAT]: 'https://assets.mixkit.co/active_storage/sfx/2281/2281-preview.mp3',
  [Animal.CAT]: 'https://assets.mixkit.co/active_storage/sfx/2261/2261-preview.mp3', // Meow
  [Animal.PIG]: 'https://assets.mixkit.co/active_storage/sfx/2253/2253-preview.mp3', // Oink
  [Animal.DOG]: 'https://assets.mixkit.co/active_storage/sfx/2266/2266-preview.mp3', // Bark
  [Animal.WOLF]: 'https://assets.mixkit.co/active_storage/sfx/2275/2275-preview.mp3', // Howl
  [Animal.TIGER]: 'https://assets.mixkit.co/active_storage/sfx/2271/2271-preview.mp3', // Roar
  [Animal.LION]: 'https://assets.mixkit.co/active_storage/sfx/2271/2271-preview.mp3', // Roar
  [Animal.ELEPHANT]: 'https://assets.mixkit.co/active_storage/sfx/2282/2282-preview.mp3', // Trumpet
  
  // Zodiac Specific
  [Animal.OX]: 'https://assets.mixkit.co/active_storage/sfx/2251/2251-preview.mp3', // Moo/Bellow
  [Animal.HORSE]: 'https://assets.mixkit.co/active_storage/sfx/2268/2268-preview.mp3', // Neigh
  [Animal.GOAT]: 'https://assets.mixkit.co/active_storage/sfx/2265/2265-preview.mp3', // Bleat
  [Animal.ROOSTER]: 'https://assets.mixkit.co/active_storage/sfx/2284/2284-preview.mp3', // Crow
  [Animal.SNAKE]: 'https://assets.mixkit.co/active_storage/sfx/2287/2287-preview.mp3', // Hiss
  [Animal.MONKEY]: 'https://assets.mixkit.co/active_storage/sfx/2285/2285-preview.mp3', // Chatter
  [Animal.DRAGON]: 'https://assets.mixkit.co/active_storage/sfx/2271/2271-preview.mp3', // Dragon use roar
  [Animal.RABBIT]: 'https://assets.mixkit.co/active_storage/sfx/2281/2281-preview.mp3', // Soft squeak
};

const MOVE_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'; // Swoosh
const CAPTURE_SOUND = 'https://assets.mixkit.co/active_storage/sfx/1110/1110-preview.mp3'; // Strike

let soundEnabled = false;

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

export const isSoundPlaying = () => soundEnabled;

export const playAnimalSound = (animal: Animal) => {
  if (!soundEnabled) return;
  const url = ANIMAL_SOUNDS[animal];
  if (url) {
    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play().catch(e => console.log('Audio playback prevented', e));
  }
};

export const playMoveSound = () => {
  if (!soundEnabled) return;
  const audio = new Audio(MOVE_SOUND);
  audio.volume = 0.2;
  audio.play().catch(e => console.log('Audio playback prevented', e));
};

export const playCaptureSound = () => {
  if (!soundEnabled) return;
  const audio = new Audio(CAPTURE_SOUND);
  audio.volume = 0.5;
  audio.play().catch(e => console.log('Audio playback prevented', e));
};
