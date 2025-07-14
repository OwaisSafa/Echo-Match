
export default class AudioSystem {
  private audioContext: AudioContext | null = null;
  private oscillators: Map<string, OscillatorNode> = new Map();

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext) return null;
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    return this.audioContext;
  }

  async playWaveSound(waveType: string, frequency: number, duration: number = 0.5) {
    const context = await this.ensureAudioContext();
    if (!context) return;

    try {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // Set wave type
      switch (waveType) {
        case 'sine':
          oscillator.type = 'sine';
          break;
        case 'square':
          oscillator.type = 'square';
          break;
        case 'triangle':
          oscillator.type = 'triangle';
          break;
        case 'sawtooth':
          oscillator.type = 'sawtooth';
          break;
        case 'pulse':
          oscillator.type = 'square';
          frequency *= 1.5; // Modify frequency for pulse effect
          break;
        case 'echo':
          oscillator.type = 'sine';
          // Create echo effect with multiple frequencies
          this.createEchoEffect(context, frequency, duration);
          return;
        default:
          oscillator.type = 'sine';
      }

      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      
      // Envelope for smooth attack and decay
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration);
    } catch (error) {
      console.warn('Error playing wave sound:', error);
    }
  }

  private async createEchoEffect(context: AudioContext, baseFrequency: number, duration: number) {
    const delays = [0, 0.1, 0.2, 0.3];
    const volumes = [0.3, 0.2, 0.15, 0.1];

    delays.forEach((delay, index) => {
      setTimeout(() => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(baseFrequency * (1 - index * 0.1), context.currentTime);
        
        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(volumes[index], context.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration * 0.8);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + duration * 0.8);
      }, delay * 1000);
    });
  }

  async playSuccessSound() {
    const context = await this.ensureAudioContext();
    if (!context) return;

    try {
      // Play a pleasant chord
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 major chord
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = context.createOscillator();
          const gainNode = context.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(context.destination);

          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(freq, context.currentTime);
          
          gainNode.gain.setValueAtTime(0, context.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.8);

          oscillator.start(context.currentTime);
          oscillator.stop(context.currentTime + 0.8);
        }, index * 50);
      });
    } catch (error) {
      console.warn('Error playing success sound:', error);
    }
  }

  async playErrorSound() {
    const context = await this.ensureAudioContext();
    if (!context) return;

    try {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, context.currentTime);
      oscillator.frequency.linearRampToValueAtTime(100, context.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, context.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.3);
    } catch (error) {
      console.warn('Error playing error sound:', error);
    }
  }
}
