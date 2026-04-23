(() => {
    const THEMES = {
        battle: [
            {
                melody: [329.63, 392.0, 440.0, 493.88, 440.0, 392.0, 329.63, 293.66],
                melodyInterval: 220,
                accentEvery: 4,
                accentOffset: 0,
                accentDuration: 0.2,
                baseDuration: 0.14,
                accentType: 'sawtooth',
                baseType: 'triangle',
                accentVolume: 0.4,
                baseVolume: 0.28,
                beat: [110, 82.41, 110, 98],
                beatInterval: 440,
                beatDuration: 0.11,
                beatType: 'square',
                beatVolume: 0.2,
            },
            {
                melody: [293.66, 329.63, 392.0, 440.0, 392.0, 349.23, 329.63, 261.63],
                melodyInterval: 240,
                accentEvery: 3,
                accentOffset: 1,
                accentDuration: 0.19,
                baseDuration: 0.15,
                accentType: 'triangle',
                baseType: 'sine',
                accentVolume: 0.33,
                baseVolume: 0.24,
                beat: [98.0, 110.0, 82.41, 123.47],
                beatInterval: 480,
                beatDuration: 0.13,
                beatType: 'square',
                beatVolume: 0.17,
            },
            {
                melody: [440.0, 523.25, 493.88, 440.0, 392.0, 349.23, 392.0, 329.63],
                melodyInterval: 210,
                accentEvery: 5,
                accentOffset: 2,
                accentDuration: 0.18,
                baseDuration: 0.13,
                accentType: 'sawtooth',
                baseType: 'triangle',
                accentVolume: 0.36,
                baseVolume: 0.25,
                beat: [123.47, 98.0, 82.41, 98.0],
                beatInterval: 420,
                beatDuration: 0.11,
                beatType: 'square',
                beatVolume: 0.16,
            },
        ],
        stage2: [
            {
                melody: [220.0, 246.94, 261.63, 246.94, 220.0, 196.0, 174.61, 196.0],
                melodyInterval: 260,
                accentEvery: 2,
                accentOffset: 0,
                accentDuration: 0.22,
                baseDuration: 0.17,
                accentType: 'sawtooth',
                baseType: 'triangle',
                accentVolume: 0.34,
                baseVolume: 0.24,
                beat: [73.42, 82.41, 65.41, 82.41],
                beatInterval: 520,
                beatDuration: 0.15,
                beatType: 'square',
                beatVolume: 0.17,
            },
            {
                melody: [196.0, 220.0, 246.94, 293.66, 246.94, 220.0, 174.61, 164.81],
                melodyInterval: 250,
                accentEvery: 4,
                accentOffset: 1,
                accentDuration: 0.2,
                baseDuration: 0.16,
                accentType: 'triangle',
                baseType: 'sine',
                accentVolume: 0.29,
                baseVolume: 0.2,
                beat: [65.41, 73.42, 87.31, 73.42],
                beatInterval: 500,
                beatDuration: 0.14,
                beatType: 'square',
                beatVolume: 0.15,
            },
            {
                melody: [233.08, 261.63, 233.08, 196.0, 174.61, 196.0, 220.0, 174.61],
                melodyInterval: 270,
                accentEvery: 3,
                accentOffset: 2,
                accentDuration: 0.23,
                baseDuration: 0.17,
                accentType: 'sawtooth',
                baseType: 'triangle',
                accentVolume: 0.31,
                baseVolume: 0.22,
                beat: [82.41, 65.41, 73.42, 65.41],
                beatInterval: 540,
                beatDuration: 0.16,
                beatType: 'square',
                beatVolume: 0.16,
            },
        ],
        stage3: [
            {
                melody: [261.63, 311.13, 392.0, 466.16, 392.0, 311.13, 293.66, 261.63],
                melodyInterval: 230,
                accentEvery: 4,
                accentOffset: 1,
                accentDuration: 0.24,
                baseDuration: 0.18,
                accentType: 'sawtooth',
                baseType: 'triangle',
                accentVolume: 0.36,
                baseVolume: 0.26,
                beat: [98.0, 123.47, 98.0, 146.83],
                beatInterval: 460,
                beatDuration: 0.12,
                beatType: 'sine',
                beatVolume: 0.16,
            },
            {
                melody: [293.66, 349.23, 415.3, 523.25, 415.3, 349.23, 311.13, 293.66],
                melodyInterval: 240,
                accentEvery: 3,
                accentOffset: 0,
                accentDuration: 0.22,
                baseDuration: 0.17,
                accentType: 'triangle',
                baseType: 'sawtooth',
                accentVolume: 0.34,
                baseVolume: 0.24,
                beat: [110.0, 146.83, 123.47, 98.0],
                beatInterval: 480,
                beatDuration: 0.12,
                beatType: 'sine',
                beatVolume: 0.15,
            },
            {
                melody: [246.94, 293.66, 369.99, 440.0, 369.99, 293.66, 261.63, 246.94],
                melodyInterval: 220,
                accentEvery: 5,
                accentOffset: 2,
                accentDuration: 0.24,
                baseDuration: 0.18,
                accentType: 'sawtooth',
                baseType: 'triangle',
                accentVolume: 0.35,
                baseVolume: 0.25,
                beat: [92.5, 123.47, 110.0, 146.83],
                beatInterval: 440,
                beatDuration: 0.12,
                beatType: 'sine',
                beatVolume: 0.15,
            },
        ],
        menu: [
            {
                melody: [329.63, 369.99, 392.0, 440.0, 392.0, 369.99],
                melodyInterval: 360,
                accentEvery: 0,
                accentOffset: 0,
                accentDuration: 0.2,
                baseDuration: 0.2,
                accentType: 'triangle',
                baseType: 'triangle',
                accentVolume: 0.24,
                baseVolume: 0.24,
                beat: [82.41, 98, 110, 98],
                beatInterval: 720,
                beatDuration: 0.12,
                beatType: 'sine',
                beatVolume: 0.13,
            },
            {
                melody: [261.63, 329.63, 349.23, 392.0, 349.23, 329.63],
                melodyInterval: 340,
                accentEvery: 0,
                accentOffset: 0,
                accentDuration: 0.18,
                baseDuration: 0.18,
                accentType: 'triangle',
                baseType: 'triangle',
                accentVolume: 0.22,
                baseVolume: 0.22,
                beat: [73.42, 82.41, 98, 82.41],
                beatInterval: 680,
                beatDuration: 0.12,
                beatType: 'sine',
                beatVolume: 0.12,
            },
        ],
    };

    class NinjaBgmManager {
        static ctx = null;
        static masterGain = null;
        static melodyTimer = null;
        static beatTimer = null;
        static melodyStep = 0;
        static beatStep = 0;
        static isPlaying = false;
        static mode = 'none';
        static stageToken = null;
        static currentVariantIndex = -1;
        static lastVariantIndexByMode = {};

        static ensureContext() {
            if (!this.ctx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioContextClass();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.value = 0.08;
                this.masterGain.connect(this.ctx.destination);
            }
            if (this.ctx.state === 'suspended') this.ctx.resume();
        }

        static playTone(freq, duration = 0.14, type = 'triangle', volume = 0.35) {
            if (!this.ctx || !this.masterGain) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + duration + 0.02);
        }

        static start(options = {}) {
            this.startMode('battle', options);
        }

        static startStormStage(options = {}) {
            this.startMode('stage2', options);
        }

        static startCrimsonStage(options = {}) {
            this.startMode('stage3', options);
        }

        static startMenu(options = {}) {
            this.startMode('menu', options);
        }

        static startMode(mode, { forceRestart = false, stageNumber = null } = {}) {
            this.ensureContext();
            if (!THEMES[mode]) mode = 'battle';
            if (!forceRestart && this.isPlaying && this.mode === mode && this.stageToken === stageNumber) return;

            this.stop();
            const selection = this.pickThemeVariant(mode);
            this.isPlaying = true;
            this.mode = mode;
            this.stageToken = stageNumber;
            this.currentVariantIndex = selection.index;

            this.melodyTimer = window.setInterval(() => {
                const note = selection.theme.melody[this.melodyStep % selection.theme.melody.length];
                const accentEvery = selection.theme.accentEvery || 0;
                const isAccent = accentEvery > 0 && (this.melodyStep + (selection.theme.accentOffset || 0)) % accentEvery === 0;
                this.playTone(
                    note,
                    isAccent ? selection.theme.accentDuration : selection.theme.baseDuration,
                    isAccent ? selection.theme.accentType : selection.theme.baseType,
                    isAccent ? selection.theme.accentVolume : selection.theme.baseVolume
                );
                this.melodyStep += 1;
            }, selection.theme.melodyInterval);

            this.beatTimer = window.setInterval(() => {
                const note = selection.theme.beat[this.beatStep % selection.theme.beat.length];
                this.playTone(note, selection.theme.beatDuration, selection.theme.beatType, selection.theme.beatVolume);
                this.beatStep += 1;
            }, selection.theme.beatInterval);
        }

        static pickThemeVariant(mode) {
            const variants = THEMES[mode] || THEMES.battle;
            if (variants.length === 1) {
                this.lastVariantIndexByMode[mode] = 0;
                return { theme: variants[0], index: 0 };
            }

            const previousIndex = this.lastVariantIndexByMode[mode];
            let nextIndex = Math.floor(Math.random() * variants.length);
            if (typeof previousIndex === 'number' && nextIndex === previousIndex) {
                nextIndex = (nextIndex + 1 + Math.floor(Math.random() * (variants.length - 1))) % variants.length;
            }
            this.lastVariantIndexByMode[mode] = nextIndex;
            return { theme: variants[nextIndex], index: nextIndex };
        }

        static stop() {
            if (this.melodyTimer) window.clearInterval(this.melodyTimer);
            if (this.beatTimer) window.clearInterval(this.beatTimer);
            this.melodyTimer = null;
            this.beatTimer = null;
            this.melodyStep = 0;
            this.beatStep = 0;
            this.isPlaying = false;
            this.mode = 'none';
            this.stageToken = null;
            this.currentVariantIndex = -1;
        }
    }

    window.NinjaBgmManager = NinjaBgmManager;
})();
