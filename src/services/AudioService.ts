import { Audio } from 'expo-av';

class AudioService {
  private correctSound: Audio.Sound | null = null;
  private incorrectSound: Audio.Sound | null = null;

  constructor() {
    this.loadSounds();
  }

  private async loadSounds() {
    try {
      const { sound: correct } = await Audio.Sound.createAsync(
        require('../../assets/sounds/correct.wav')
      );
      this.correctSound = correct;

      const { sound: incorrect } = await Audio.Sound.createAsync(
        require('../../assets/sounds/incorrect.wav')
      );
      this.incorrectSound = incorrect;
    } catch (error) {
      console.error("Error loading sounds", error);
    }
  }

  async playCorrectSound() {
    try {
      await this.correctSound?.replayAsync();
    } catch (error) {
      console.error("Error playing correct sound", error);
    }
  }

  async playIncorrectSound() {
    try {
      await this.incorrectSound?.replayAsync();
    } catch (error) {
      console.error("Error playing incorrect sound", error);
    }
  }

  async unloadSounds() {
    await this.correctSound?.unloadAsync();
    await this.incorrectSound?.unloadAsync();
  }
}

export const audioService = new AudioService();
