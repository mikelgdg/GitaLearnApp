import { Audio } from 'expo-av';

interface SoundCache {
  [key: string]: Audio.Sound;
}

class AudioService {
  private correctSound: Audio.Sound | null = null;
  private incorrectSound: Audio.Sound | null = null;
  private verseAudioCache: SoundCache = {};
  private isAudioEnabled: boolean = true;

  constructor() {
    this.loadSounds();
  }

  private async loadSounds() {
    try {
      // Configurar modo de audio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Por ahora, creamos sonidos sintéticos de prueba
      console.log("AudioService initialized - using placeholder sounds");
      
      // Aquí cargaríamos los archivos reales cuando estén disponibles:
      // const { sound: correctSound } = await Audio.Sound.createAsync(
      //   require('../../assets/audio/correct.mp3')
      // );
      // this.correctSound = correctSound;
      
    } catch (error) {
      console.error("Error loading sounds", error);
    }
  }

  async playCorrectSound() {
    if (!this.isAudioEnabled) return;
    
    try {
      if (this.correctSound) {
        await this.correctSound.replayAsync();
      } else {
        // Sonido sintético de prueba para "correcto"
        console.log("🎵 CORRECT SOUND: Ding! ✅");
      }
    } catch (error) {
      console.error("Error playing correct sound", error);
    }
  }

  async playIncorrectSound() {
    if (!this.isAudioEnabled) return;
    
    try {
      if (this.incorrectSound) {
        await this.incorrectSound.replayAsync();
      } else {
        // Sonido sintético de prueba para "incorrecto"
        console.log("🎵 INCORRECT SOUND: Buzz! ❌");
      }
    } catch (error) {
      console.error("Error playing incorrect sound", error);
    }
  }

  // ✨ Nuevos sonidos tipo Duolingo
  async playBubbleTap() {
    if (!this.isAudioEnabled) return;
    console.log("🎵 BUBBLE TAP: Pop! 🫧");
  }

  async playLessonComplete() {
    if (!this.isAudioEnabled) return;
    console.log("🎵 LESSON COMPLETE: Ta-da! 🎉");
  }

  async playHeartLoss() {
    if (!this.isAudioEnabled) return;
    console.log("🎵 HEART LOSS: Oh no! 💔");
  }

  async playGemEarned() {
    if (!this.isAudioEnabled) return;
    console.log("🎵 GEM EARNED: Cha-ching! 💎");
  }

  async playStreakAchieved() {
    if (!this.isAudioEnabled) return;
    console.log("🎵 STREAK: Fire! 🔥");
  }

  async playLevelUp() {
    if (!this.isAudioEnabled) return;
    console.log("🎵 LEVEL UP: Fanfare! 🎺");
  }

  async playCheckpointUnlocked() {
    if (!this.isAudioEnabled) return;
    console.log("🎵 CHECKPOINT UNLOCKED: Victory! 🏆");
  }

  async playVerseAudio(audioUrl: string): Promise<void> {
    try {
      // Verificar si ya tenemos el audio en caché
      if (this.verseAudioCache[audioUrl]) {
        await this.verseAudioCache[audioUrl].replayAsync();
        return;
      }

      // Por ahora, simular reproducción de audio del verso
      console.log(`🎵 PLAYING VERSE AUDIO: ${audioUrl}`);
      
      // En implementación real:
      // const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      // this.verseAudioCache[audioUrl] = sound;
      // await sound.playAsync();
      
    } catch (error) {
      console.error("Error playing verse audio", error);
    }
  }

  async stopAllAudio(): Promise<void> {
    try {
      // Parar todos los audios de versos en caché
      for (const sound of Object.values(this.verseAudioCache)) {
        await sound.stopAsync();
      }
    } catch (error) {
      console.error("Error stopping audio", error);
    }
  }

  async unloadSounds() {
    try {
      await this.correctSound?.unloadAsync();
      await this.incorrectSound?.unloadAsync();
      
      // Limpiar caché de audios de versos
      for (const sound of Object.values(this.verseAudioCache)) {
        await sound.unloadAsync();
      }
      this.verseAudioCache = {};
    } catch (error) {
      console.error("Error unloading sounds", error);
    }
  }

  // ✨ Control de audio
  enableAudio() {
    this.isAudioEnabled = true;
    console.log("🔊 Audio enabled");
  }

  disableAudio() {
    this.isAudioEnabled = false;
    console.log("🔇 Audio disabled");
  }

  isEnabled(): boolean {
    return this.isAudioEnabled;
  }
}

export const audioService = new AudioService();
