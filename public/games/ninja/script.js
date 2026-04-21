/* global Phaser */

/**
 * Nh Ninja "Relic War Protocol" Edition (V10.0)
 * Story Rooms | Item Skills | Mobile Touch Controls | Performance Patch
 */

/**
 * 사륜안 배경 텍스처를 고정 해상도(800x600)에 맞게 확대해 화면을 채웁니다.
 * UI 가독성을 위해 위에 별도 딤 레이어를 얹습니다.
 */
function createSaryunanBackdrop(scene, alpha = 1) {
    const img = scene.add.image(400, 300, 'saryunan_bg').setScrollFactor(0);
    const frame = scene.textures.getFrame('saryunan_bg');
    const scale = Math.max(800 / frame.width, 600 / frame.height);
    img.setScale(scale).setAlpha(alpha);
    return img;
}

function isCoarsePointerDevice() {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(pointer: coarse)').matches;
}

function createDeviceProfile() {
    const isTouch = isCoarsePointerDevice();
    return {
        isTouch,
        particleBurst: isTouch ? 14 : 30,
        particleMinor: isTouch ? 3 : 5,
        particleLife: isTouch ? 260 : 400,
        particleSpeedMin: isTouch ? 32 : 50,
        particleSpeedMax: isTouch ? 140 : 200,
        worldWidth: isTouch ? 30000 : 36000,
        anchorSpacing: isTouch ? 560 : 420,
        cloudSpacing: isTouch ? 520 : 360,
        heartCount: isTouch ? 18 : 36,
        enemyCap: isTouch ? 9 : 14,
        skyEnemyCap: isTouch ? 3 : 5,
        heartTweenDuration: isTouch ? 1100 : 780
    };
}

const DEVICE_PROFILE = createDeviceProfile();

const RELIC_SKILLS = {
    stage1: {
        itemName: '청람 구슬',
        skillName: '청람 나선옥',
        shortLabel: 'SPIRAL',
        charges: 3,
        cooldown: 5200,
        texture: 'rasengan',
        accent: 0x38bdf8
    },
    stage2: {
        itemName: '천뢰 인장',
        skillName: '천뢰 관통선',
        shortLabel: 'THUNDER',
        charges: 2,
        cooldown: 6800,
        texture: 'lightning_chidori',
        accent: 0x60a5fa
    },
    stage3: {
        itemName: '적월 가면',
        skillName: '적월 수호진',
        shortLabel: 'CRIMSON',
        charges: 2,
        cooldown: 9000,
        texture: 'sharingan',
        accent: 0xfb7185
    }
};

class NinjaVoiceManager {
    static enabled = !DEVICE_PROFILE.isTouch;
    static lastSpokenAt = 0;

    static speak(text, minGap = 1000) {
        if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
        const now = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
        if (now - this.lastSpokenAt < minGap) return;
        try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
            this.lastSpokenAt = now;
        } catch (_error) {
            this.enabled = false;
        }
    }

    static cancel() {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
    }
}

class PixelRenderer {
    static generateFromMap(scene, key, pixelSize, map, colors) {
        const g = scene.make.graphics({add: false});
        for (let y = 0; y < map.length; y++) {
            const row = map[y];
            for (let x = 0; x < row.length; x++) {
                const symbol = row[x];
                if (symbol !== '.' && colors[symbol] !== undefined) {
                    g.fillStyle(colors[symbol]);
                    g.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }
        g.generateTexture(key, map[0].length * pixelSize, map.length * pixelSize);
    }
}

/**
 * 외부 음원 파일 없이도 닌자 분위기의 배경음악을 재생하기 위한 간단한 Web Audio 매니저입니다.
 * - 사용자 클릭 이후에만 시작되며(브라우저 정책), 씬 재시작 시 중복 루프를 막습니다.
 */
class NinjaBgmManager {
    static ctx = null;
    static masterGain = null;
    static melodyTimer = null;
    static beatTimer = null;
    static melodyStep = 0;
    static beatStep = 0;
    static isPlaying = false;
    static mode = 'none';

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

    static start() {
        this.ensureContext();
        if (this.isPlaying && this.mode === 'battle') return;
        this.stop();
        this.isPlaying = true;
        this.mode = 'battle';

        // 일본풍 오음계 느낌의 반복 멜로디 (E minor pentatonic 중심)
        const melody = [329.63, 392.0, 440.0, 493.88, 440.0, 392.0, 329.63, 293.66];
        this.melodyTimer = window.setInterval(() => {
            const note = melody[this.melodyStep % melody.length];
            const accent = this.melodyStep % 4 === 0;
            this.playTone(note, accent ? 0.2 : 0.14, accent ? 'sawtooth' : 'triangle', accent ? 0.4 : 0.28);
            this.melodyStep += 1;
        }, 220);

        // 저음 비트로 리듬감을 추가
        const beat = [110, 82.41, 110, 98];
        this.beatTimer = window.setInterval(() => {
            const note = beat[this.beatStep % beat.length];
            this.playTone(note, 0.11, 'square', 0.2);
            this.beatStep += 1;
        }, 440);
    }

    /**
     * 타이틀/캐릭터 선택 화면용 가벼운 메뉴 BGM
     */
    static startMenu() {
        this.ensureContext();
        if (this.isPlaying && this.mode === 'menu') return;
        this.stop();
        this.isPlaying = true;
        this.mode = 'menu';

        const menuMelody = [329.63, 369.99, 392.0, 440.0, 392.0, 369.99];
        this.melodyTimer = window.setInterval(() => {
            const note = menuMelody[this.melodyStep % menuMelody.length];
            this.playTone(note, 0.2, 'triangle', 0.24);
            this.melodyStep += 1;
        }, 360);

        const menuBeat = [82.41, 98, 110, 98];
        this.beatTimer = window.setInterval(() => {
            const note = menuBeat[this.beatStep % menuBeat.length];
            this.playTone(note, 0.12, 'sine', 0.13);
            this.beatStep += 1;
        }, 720);
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
    }
}

const ART = {
    char_idle: [
        "....XXXXXXX.....", "...XXHHHHHXX....", "..XHHHHHHHHHX...", "..XHHSSSSSXHX...",
        "..XXSWWEWWEHX...", "..X.SWEEWEESX...", "....XSSSSSX.....", "...XXCCCCCXX....",
        "..X.CXXXXXC.X...", "..X.CCCCCCC.X...", "..X.XXCCCXX.X...", "..X.XXCCCXX.X...",
        "...XX.XXX.XX....", "...XS.X.X.SX....", "...XX.X.X.XX....", "......X.X......."
    ],
    char_run: [
        "....XXXXXXX.....", "...XXHHHHHXX....", "..XHHHHHHHHHX...", "..XHHSSSSSXHX...",
        "..XXSWWEWWEHX...", "..X.SWEEWEESX...", "....XSSSSSX.....", "...XXCCCCCXX....",
        "..X.CXXXXXC.....", "..X.CCCCCCCXX...", "...XXXCCCXX.X...", "..XX.XCCCXX.X...",
        "..XS.X.XXX......", "..XX.X.X.XX.....", ".......X.XS.....", ".......X.XX....."
    ],
    monster: [
        "..XXXXXXXX..", ".XRRRRRRRRX.", "XRRRRRRRRRRX", "XRXXRRRRXXRX", "XRWWXRRXWWRX",
        "XXWWXRRXWWXX", "XRXXRRRRXXRX", "XRRRRRRRRRRX", ".XXRRRRRRXX.", "..XRRRRRRX.."
    ],
    monster_alt: [
        "....XXXX....", "...XRRRRX...", "..XRRRRRRX..", ".XRRXXXXRRX.", ".XRXRRRRXRX.",
        ".XRXRRRRXRX.", ".XRRXXXXRRX.", "..XRRRRRRX..", "...XRRRRX...", "....XXXX...."
    ],
    rasengan: [
        "......DDDD......", "....DDLLLLDD....", "...DLLLLLLLLD...", "..DLLLLWWLLLLD..",
        ".DLLLLWWWWLLLLD.", ".DLLLWWWWWWLLLD.", "DLLLLWWWWWWLLLLD", "DLLLWWWWWWWWLLLD",
        "DLLLWWWWWWWWLLLD", "DLLLLWWWWWWLLLLD", ".DLLLWWWWWWLLLD.", ".DLLLLWWWWLLLLD.",
        "..DLLLLWWLLLLD..", "...DLLLLLLLLD...", "....DDLLLLDD....", "......DDDD......"
    ],
    headband: [
        "XXXX..........XXXX", "XXXXXXXXXXXXXXXXXX", "XXGGGGGGGGGGGGGGXX", "XXGGGGGSGGGGGSGGXX",
        "XXXXXXXXXXXXXXXXXX", "XXXX..........XXXX"
    ],
    sharingan: [
        "........KKKKKKKK........", "......KKRRRRRRRRKK......", "....KKRRRRRRRRRRRRKK....",
        "...KRRRRRRKKKKRRRRRRK...", "..KRRRRRKKKKKKKKRRRRRK..", "..KRRRRKKKK..KKKKRRRRK..",
        ".KRRRRRKK......KKRRRRRK.", ".KRRRRKK........KKRRRRK.", "KRRRRRKK........KKRRRRRK",
        "KRRRKKKK...KK...KKKKRRRK", "KRRRKKKK..KKKK..KKKKRRRK", "KRRRRKKK..KKKK..KKKRRRRK",
        "KRRRRKKK..KKKK..KKKRRRRK", "KRRRKKKK..KKKK..KKKKRRRK", "KRRRKKKK...KK...KKKKRRRK",
        "KRRRRRKK........KKRRRRRK", ".KRRRRKK........KKRRRRK.", ".KRRRRRKK......KKRRRRRK.",
        "..KRRRRKKKK..KKKKRRRRK..", "..KRRRRRKKKKKKKKRRRRRK..", "...KRRRRRRKKKKRRRRRRK...",
        "....KKRRRRRRRRRRRRKK....", "......KKRRRRRRRRKK......", "........KKKKKKKK........"
    ],
    dragon: [
        "...........GGGGGGGGGGG..........",
        ".......GGGGGDDDDDDDDDDGGG.......",
        "....GGGDDDDDDDDDDDDDDDDDDGG.....",
        "...GDDDDDDRRRRRRRRDDDDDDDDDG....",
        "..GDDDDDRRYYYYYYRRRDRDDDDDDDG...",
        "..GDDDDRRYYYYYYYYYRRRDDDDDDDG...",
        "..GDDDRRYYYYWWWWYYYRRRDDDDDDG...",
        "...GDDRYYYYYWWWWYYYYRRGGGGGG....",
        "....GDRYYYYYYYYYYYYRRG..........",
        ".....GDRRRYYYYYYRRRRG...........",
        "......GGDDRRRRRRDDGG............",
        "........GGGGGGGGGG.............."
    ],
    lightning: [
        "....BBBB....",
        "...BWWWB....",
        "..BWWWBB....",
        ".BWWWBB.....",
        ".BWWBB......",
        "..BBB.......",
        "..BWWB......",
        ".BWWWB......",
        "BWWWWB......",
        ".BBBB......."
    ],
    susanoo: [
        "..........PPPPPPPPPP..........",
        ".......PPPPKKKKKKKKPPPP.......",
        ".....PPKKKKRRRRRRRRKKKKPP.....",
        "....PKKRRRRRRRRRRRRRRRRKKP....",
        "...PKRRRWWWWRRRRRRWWWWRRRKP...",
        "..PKRRRRWWWWRRRRRRWWWWRRRRKP..",
        "..PKRRRRRRRRBBBBRRRRRRRRRRKP..",
        "..PKRRRRRRRBBBBBBRRRRRRRRRKP..",
        "...PKRRRRRRRBBBBRRRRRRRRRKP...",
        "....PKRRRRRRRRRRRRRRRRRRKP....",
        ".....PKKRRRRRRRRRRRRRRKKP.....",
        "......PPKKKKRRRRRRKKKKPP......",
        "........PPPPPPPPPPPPPP........"
    ],
    nightmare: [
        "...........ZZZZZZZZZZ...........",
        ".......ZZZZRRRRRRRRZZZZ........",
        ".....ZZRRRRRRRRRRRRRRRRZZ......",
        "...ZZRRRRWWWWRRRRWWWWRRRRZZ....",
        "..ZRRRRRWWWWWWRRWWWWWWRRRRRZ...",
        "..ZRRRRRRRRRRBBBBRRRRRRRRRRRZ..",
        ".ZRRRRRRRRRBBBBBBBBRRRRRRRRRRZ.",
        ".ZRRRRRRRRBBBBBBBBBBRRRRRRRRRZ.",
        ".ZRRRRRRRRRBBBBBBBBRRRRRRRRRRZ.",
        "..ZRRRRRRRRRRBBBBRRRRRRRRRRRZ..",
        "..ZRRRRRWWWWWWRRWWWWWWRRRRRZ...",
        "...ZZRRRRWWWWRRRRWWWWRRRRZZ....",
        ".....ZZRRRRRRRRRRRRRRRRZZ......",
        ".......ZZZZRRRRRRRRZZZZ........",
        "...........ZZZZZZZZZZ..........."
    ],
    sky_ninja: [
        "....XXXX....",
        "...XHHHHX...",
        "..XHSSSSHX..",
        "..XSWWEWHX..",
        "...XSSSSX...",
        "..XXCCCCXX..",
        "..X..CC..X..",
        "...X.XX.X..."
    ],
    heal_orb: [
        "....PPPP....",
        "..PPWWWWPP..",
        ".PWWWWWWWWP.",
        ".PWWPPPPWWP.",
        ".PWWPPPPWWP.",
        ".PWWWWWWWWP.",
        "..PPWWWWPP..",
        "....PPPP...."
    ]
};

class JuiceManager {
    static shake(scene, intensity = 0.02, duration = 200) { scene.cameras.main.shake(duration, intensity); }
    static emitParticles(scene, x, y, type, color) {
        const profile = scene?.performanceProfile || DEVICE_PROFILE;
        const particles = scene.add.particles(0, 0, 'pixel', {
            speed: { min: profile.particleSpeedMin, max: profile.particleSpeedMax },
            scale: { start: 0.8, end: 0 },
            lifespan: profile.particleLife,
            gravityY: 300,
            quantity: type === 'EXPLOSION' ? profile.particleBurst : profile.particleMinor,
            tint: color || 0xffffff
        });
        particles.emitParticleAt(x, y);
        scene.time.delayedCall(profile.particleLife + 80, () => particles.destroy());
    }
}

class TextureGenerator {
    static generate(scene) {
        const pg = scene.make.graphics({add: false});
        for(let i=0; i<5; i++) pg.fillStyle(0xffffff, 0.15).fillCircle(16, 16, 16 - i*3);
        pg.fillStyle(0xffffff, 1).fillCircle(16, 16, 3);
        pg.generateTexture('pixel', 32, 32);

        const lg = scene.make.graphics({add: false});
        lg.fillStyle(0x2ecc71, 1).beginPath().moveTo(10, 0).lineTo(20, 10).lineTo(10, 20).lineTo(0, 10).closePath().fillPath();
        lg.generateTexture('leaf', 20, 20);

        const palettes = {
            'n': { 'X': 0x111111, 'S': 0xffdbac, 'W': 0xffffff, 'E': 0x3b82f6, 'H': 0xffd700, 'C': 0xffa500 },
            's': { 'X': 0x111111, 'S': 0xffdbac, 'W': 0xffffff, 'E': 0xef4444, 'H': 0x111827, 'C': 0x1e1b4b },
            'sa': { 'X': 0x111111, 'S': 0xffdbac, 'W': 0xffffff, 'E': 0x22c55e, 'H': 0xfbcfe8, 'C': 0xdb2777 },
            'k': { 'X': 0x111111, 'S': 0xffdbac, 'W': 0xffffff, 'E': 0x111111, 'H': 0xe5e7eb, 'C': 0x166534 }
        };
        for (const [key, colors] of Object.entries(palettes)) {
            PixelRenderer.generateFromMap(scene, `${key}_idle`, 4, ART.char_idle, colors);
            PixelRenderer.generateFromMap(scene, `${key}_run`, 4, ART.char_run, colors);
        }

        PixelRenderer.generateFromMap(scene, 'm1', 4, ART.monster, { 'X': 0x111111, 'R': 0xffffff, 'W': 0x000000 });
        PixelRenderer.generateFromMap(scene, 'm2', 4, ART.monster_alt, { 'X': 0x111111, 'R': 0xffffff });
        PixelRenderer.generateFromMap(scene, 'sky_ninja', 4, ART.sky_ninja, { 'X': 0x111111, 'H': 0x64748b, 'S': 0xffdbac, 'W': 0x93c5fd, 'E': 0x38bdf8, 'C': 0x1e293b });

        // Rasengan (V9.2)
        PixelRenderer.generateFromMap(scene, 'rasengan', 4, ART.rasengan, { 'W': 0xffffff, 'L': 0xb0e2ff, 'D': 0x3b82f6 });
        // Scratched Headband (V9.2)
        PixelRenderer.generateFromMap(scene, 'headband', 4, ART.headband, { 'X': 0x111111, 'G': 0xc0c0c0, 'S': 0x444444 });
        // Mangekyou Sharingan (V9.3)
        PixelRenderer.generateFromMap(scene, 'sharingan', 4, ART.sharingan, { 'R': 0xcc0000, 'K': 0x000000 });
        // 스테이지2 보스룸에서 사용하는 거대 용 보스 스프라이트
        PixelRenderer.generateFromMap(scene, 'dragon_boss', 4, ART.dragon, { 'G': 0x111827, 'D': 0x6b7280, 'R': 0x374151, 'Y': 0xf59e0b, 'W': 0xffffff });
        // E키 캐릭터 전용 기술(도트)
        PixelRenderer.generateFromMap(scene, 'lightning_chidori', 4, ART.lightning, { 'B': 0x2563eb, 'W': 0xffffff });
        PixelRenderer.generateFromMap(scene, 'susanoo_avatar', 4, ART.susanoo, { 'P': 0x7c3aed, 'K': 0x4c1d95, 'R': 0xa855f7, 'W': 0xf5f3ff, 'B': 0x1f2937 });
        PixelRenderer.generateFromMap(scene, 'nightmare_boss', 4, ART.nightmare, { 'Z': 0x111111, 'R': 0x7f1d1d, 'W': 0xffffff, 'B': 0x000000 });
        PixelRenderer.generateFromMap(scene, 'heal_orb', 4, ART.heal_orb, { 'P': 0xec4899, 'W': 0xfce7f3 });

        scene.make.graphics({add: false}).fillStyle(0x8b4513).fillRect(0,0,16,16).generateTexture('rope_anchor', 16, 16);
        scene.make.graphics({add: false}).fillStyle(0xffffff, 0.9).fillRoundedRect(0, 0, 100, 25, 12).generateTexture('cloud_plat', 100, 25);
        scene.make.graphics({add: false}).fillStyle(0x3b82f6).fillCircle(15, 5, 5).generateTexture('kunai_n', 30, 10);
        scene.make.graphics({add: false}).fillStyle(0x8b5cf6).fillCircle(15, 5, 5).generateTexture('kunai_s', 30, 10);
        scene.make.graphics({add: false}).fillStyle(0xf472b6).fillCircle(15, 5, 5).generateTexture('kunai_sa', 30, 10);
        scene.make.graphics({add: false}).fillStyle(0xe5e7eb).fillCircle(15, 5, 5).generateTexture('kunai_k', 30, 10);
        scene.make.graphics({add: false}).fillStyle(0xffffff, 0.4).fillCircle(10, 10, 10).generateTexture('enemy_bullet', 20, 20);
        // 체력 회복 아이템: 캔디 모양 도트 텍스처
        const candy = scene.make.graphics({ add: false });
        candy.fillStyle(0xf59e0b, 1).fillTriangle(2, 9, 6, 5, 6, 13);   // 왼쪽 포장지
        candy.fillStyle(0xf59e0b, 1).fillTriangle(22, 9, 18, 5, 18, 13); // 오른쪽 포장지
        candy.fillStyle(0xec4899, 1).fillRoundedRect(6, 4, 12, 10, 3);   // 캔디 본체
        candy.fillStyle(0xfbcfe8, 0.9).fillRect(8, 6, 8, 2);             // 하이라이트
        candy.generateTexture('heart_item', 24, 18);
        candy.destroy();

        const spiralRelic = scene.make.graphics({ add: false });
        spiralRelic.fillStyle(0x1d4ed8, 1).fillCircle(18, 18, 18);
        spiralRelic.lineStyle(4, 0xe0f2fe, 0.95);
        spiralRelic.strokeCircle(18, 18, 11);
        spiralRelic.lineStyle(3, 0x93c5fd, 0.9);
        spiralRelic.strokeCircle(18, 18, 6);
        spiralRelic.fillStyle(0xffffff, 0.95).fillCircle(18, 18, 3);
        spiralRelic.generateTexture('relic_spiral', 36, 36);
        spiralRelic.destroy();

        const thunderRelic = scene.make.graphics({ add: false });
        thunderRelic.fillStyle(0x1e293b, 1).fillRoundedRect(0, 0, 36, 36, 8);
        thunderRelic.fillStyle(0x60a5fa, 1).fillTriangle(20, 4, 10, 22, 18, 22);
        thunderRelic.fillStyle(0xbfdbfe, 1).fillTriangle(18, 18, 28, 18, 14, 32);
        thunderRelic.generateTexture('relic_thunder', 36, 36);
        thunderRelic.destroy();

        const crimsonRelic = scene.make.graphics({ add: false });
        crimsonRelic.fillStyle(0x111827, 1).fillCircle(18, 18, 18);
        crimsonRelic.fillStyle(0x991b1b, 1).fillCircle(18, 18, 12);
        crimsonRelic.fillStyle(0x111827, 1).fillCircle(18, 18, 5);
        crimsonRelic.fillStyle(0xffffff, 1).fillCircle(18, 11, 2.2);
        crimsonRelic.fillStyle(0xffffff, 1).fillCircle(25, 20, 2.2);
        crimsonRelic.fillStyle(0xffffff, 1).fillCircle(11, 20, 2.2);
        crimsonRelic.generateTexture('relic_crimson', 36, 36);
        crimsonRelic.destroy();

        const commander = scene.make.graphics({ add: false });
        commander.fillStyle(0x111827, 1).fillRoundedRect(12, 4, 40, 56, 8);
        commander.fillStyle(0xb91c1c, 1).fillRoundedRect(16, 8, 32, 18, 6);
        commander.fillStyle(0xf8fafc, 1).fillCircle(24, 18, 3);
        commander.fillStyle(0xf8fafc, 1).fillCircle(40, 18, 3);
        commander.fillStyle(0x94a3b8, 1).fillRect(18, 28, 28, 18);
        commander.fillStyle(0x7f1d1d, 1).fillRect(8, 18, 8, 28);
        commander.fillStyle(0x7f1d1d, 1).fillRect(48, 18, 8, 28);
        commander.fillStyle(0xeab308, 1).fillTriangle(12, 8, 20, 0, 28, 8);
        commander.fillStyle(0xeab308, 1).fillTriangle(36, 8, 44, 0, 52, 8);
        commander.generateTexture('field_commander', 64, 64);
        commander.destroy();

        const mg = scene.make.graphics({add: false});
        mg.fillStyle(0x7b92a6, 1).fillPoints([{x:0,y:400}, {x:200,y:100}, {x:400,y:300}, {x:600,y:50}, {x:800,y:400}], true).generateTexture('bg_mountains', 800, 400);
    }
}

class PreloadScene extends Phaser.Scene {
    constructor() { super('PreloadScene'); }
    preload() {
        // 사쿠라 힐링 연출 이미지
        this.load.image('sakura_heal_img', '/src/assets/사쿠라힐링.png');
        // 타이틀·스테이지 공통 사륜안 배경 (public/games/ninja/assets 기준 상대 경로)
        this.load.image('saryunan_bg', 'assets/saryunan.png');
        this.load.on('complete', () => { TextureGenerator.generate(this); this.scene.start('TitleScene'); });
    }
}

class TitleScene extends Phaser.Scene {
    constructor() { super('TitleScene'); }
    create() {
        NinjaBgmManager.startMenu();
        createSaryunanBackdrop(this, 0.92).setDepth(-20);
        this.add.rectangle(400, 300, 800, 600, 0x020617, 0.48).setScrollFactor(0).setDepth(-19);

        this.add.text(400, 200, 'NH NINJA V10.0', { fontSize: '76px', fill: '#fff', fontStyle: 'bold', stroke: '#000', strokeThickness: 10 }).setOrigin(0.5).setDepth(10);
        this.add.text(400, 280, 'RELIC WAR PROTOCOL', { fontSize: '24px', fill: '#ef4444', stroke: '#000', strokeThickness: 6 }).setOrigin(0.5).setDepth(10);
        const btn = this.add.text(400, 420, 'START MISSION', { fontSize: '32px', backgroundColor: '#ef4444', fill: '#fff', padding: 20 }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);
        btn.on('pointerdown', () => this.scene.start('SelectScene'));
    }
}

class SelectScene extends Phaser.Scene {
    constructor() { super('SelectScene'); }
    create() {
        NinjaBgmManager.startMenu();
        createSaryunanBackdrop(this, 0.88).setDepth(-20);
        this.add.rectangle(400, 300, 800, 600, 0x0f172a, 0.42).setScrollFactor(0).setDepth(-19);
        this.add.text(400, 80, 'CHOOSE YOUR NINJA', { fontSize: '48px', fontStyle: 'bold', fill: '#fff', stroke: '#000', strokeThickness: 8 }).setOrigin(0.5).setDepth(10);
        const chars = [{id:'n', name:'NARUTO'}, {id:'s', name:'SASUKE'}, {id:'sa', name:'SAKURA'}, {id:'k', name:'KAKASHI'}];
        this.selectedIdx = 0;
        this.selectChars = chars;
        this.selectSprites = [];
        this.selectLabels = [];
        chars.forEach((c, i) => {
            const x = 120 + i*185;
            const img = this.add.image(x, 300, `${c.id}_idle`).setScale(3).setInteractive({ useHandCursor: true }).setDepth(10);
            img.on('pointerdown', () => {
                this.selectedIdx = i;
                this.updateSelectionUI();
                this.scene.start('StoryScene', { char: c });
            });
            const label = this.add.text(x, 420, c.name, { fontSize: '24px', fill: '#fff', stroke: '#000', strokeThickness: 5 }).setOrigin(0.5).setDepth(10);
            this.selectSprites.push(img);
            this.selectLabels.push(label);
        });

        this.selectHint = this.add.text(400, 500, '←/→ 로 선택 · Enter로 시작', {
            fontSize: '22px',
            fill: '#cbd5e1',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(10);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.updateSelectionUI();
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
            this.selectedIdx = (this.selectedIdx - 1 + this.selectChars.length) % this.selectChars.length;
            this.updateSelectionUI();
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
            this.selectedIdx = (this.selectedIdx + 1) % this.selectChars.length;
            this.updateSelectionUI();
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
            this.scene.start('StoryScene', { char: this.selectChars[this.selectedIdx] });
        }
    }

    /**
     * 방향키 선택 상태를 카드 UI에 반영합니다.
     */
    updateSelectionUI() {
        this.selectSprites.forEach((sprite, idx) => {
            const selected = idx === this.selectedIdx;
            sprite.setTint(selected ? 0xfacc15 : 0xffffff);
            sprite.setScale(selected ? 3.5 : 3);
            this.selectLabels[idx].setColor(selected ? '#facc15' : '#ffffff');
        });
    }
}

class StoryScene extends Phaser.Scene {
    constructor() { super('StoryScene'); }
    init(data) { this.charData = data.char; }
    create() {
        NinjaBgmManager.startMenu();
        const w = 800, h = 600;
        createSaryunanBackdrop(this, 0.91).setDepth(-15);
        this.add.rectangle(0, 0, w, h, 0x020617, 0.52).setOrigin(0).setDepth(-14);
        this.add.image(100, h/2 - 50, `${this.charData.id}_idle`).setScale(4).setDepth(5);
        this.add.rectangle(400, 500, 760, 160, 0x111111, 0.9).setStrokeStyle(4, 0xffffff).setDepth(6);
        this.nameText = this.add.text(40, 430, '', { fontSize: '28px', fontStyle: 'bold', fill: '#ff0', stroke: '#000', strokeThickness: 6 }).setDepth(8);
        this.dialogueText = this.add.text(40, 470, '', { fontSize: '22px', fill: '#fff', wordWrap: { width: 720 }, stroke: '#000', strokeThickness: 4 }).setDepth(8);
        this.dialogues = [
            {
                name: '호카게',
                text: '봉인된 전쟁 유물이 국경 전역으로 흩어졌습니다. 초원 전선, 폭풍 성채, 적월의 금단실을 돌며 유물을 회수해야 이번 침공을 막을 수 있습니다.'
            },
            {
                name: '호카게',
                text: '스테이지 1에서는 소용돌이 제단 방을 찾아 청람 구슬을 확보하십시오. 푸른 나선 구슬을 얻으면 ITEM 기술인 청람 나선옥을 쓸 수 있습니다.'
            },
            {
                name: this.charData.name,
                text: '청람 구슬, 천뢰 인장, 적월 가면. 세 유물의 힘을 순서대로 이어 붙이면 제 전투 리듬도 더 거칠어집니다. 길목마다 아이템과 방을 놓치지 않겠습니다.'
            },
            {
                name: '호카게',
                text: '스테이지 2는 폭풍 성채입니다. 성문에 도달하기 전에 천뢰 인장을 확보하면 ITEM 버튼이 천뢰 관통선으로 바뀝니다. 스마트폰에서는 좌우, 점프, 기술 버튼이 모두 터치로 작동합니다.'
            },
            {
                name: '호카게',
                text: '스테이지 3의 포털 방에서는 먼저 적월 가면을 회수해야 최종 보스의 봉인이 해제됩니다. 적월 수호진은 탄환을 걷어내고 방 전체를 뒤흔드는 마지막 카드가 될 것입니다.'
            },
            {
                name: '시스템 브리핑',
                text: '점수로 보스를 호출하고, 방과 아이템으로 전투 수단을 해금하며, 목숨 두 개 안에 임무를 끝내야 합니다. 클릭 또는 스페이스·엔터로 작전을 시작하십시오.'
            }
        ];
        this.currentLine = 0;
        this.input.on('pointerdown', () => this.next());
        this.keyAdvance = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.next();
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.keyAdvance) || Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
            this.next();
        }
    }

    next() {
        if (this.currentLine >= this.dialogues.length) return this.scene.start('GameScene', { char: this.charData });
        this.nameText.setText(this.dialogues[this.currentLine].name);
        this.dialogueText.setText(this.dialogues[this.currentLine].text);
        this.currentLine++;
    }
}

class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }
    init(data) {
        this.charData = data.char; 
        this.hp = 100; 
        this.score = data.score || 0; 
        this.dist = 0; 
        this.stage = data.stage || 1;
        this.performanceProfile = DEVICE_PROFILE;
        this.worldWidth = this.performanceProfile.worldWidth;
        this.isGameOver = false; 
        this.skillCooldown = 0;
        this.relicCooldown = 0;
        this.cloneCooldown = 0;
        this.isRoping = false; 
        this.ropeTarget = null;
        // 로프 관련 안전 상태: 일정 시간 후 자동 해제해 입력 잠김을 방지합니다.
        this.ropeAttachedAt = 0;
        this.ropeMaxDuration = 2200;
        this.isBossActive = false; 
        this.bossTriggerScore = this.score + Phaser.Math.Between(800, 900);
        this.isPausedForStory = false;
        this.isStageClear = false;
        this.hasEnteredCastle = false;
        this.inDragonRoom = false;
        this.dragonDefeated = false;
        this.castleDoor = null;
        this.stage3Portals = [];
        this.isInStage3Room = false;
        this.nightmareDefeated = false;
        this.skyCloudDecor = [];
        this.isExitPromptOpen = false;
        this.exitChoiceIndex = 0;
        this.virtualHeld = {};
        this.virtualPressed = {};
        this.touchButtons = {};
        this.touchControlsContainer = null;
        this.isTouchUIEnabled = false;
        this.activeHealFx = null;
        this.protectedUntil = 0;
        this.roomTransitionLocked = false;
        this.relicsCollected = data.relicsCollected || { stage1: false, stage2: false, stage3: false };
        this.activeRelicSkill = data.activeRelicSkill || null;
        if (this.activeRelicSkill && RELIC_SKILLS[this.activeRelicSkill.stageKey]) {
            this.activeRelicSkill.charges = RELIC_SKILLS[this.activeRelicSkill.stageKey].charges;
        }
        this.stage1ShrineDoor = null;
        this.inStage1Shrine = false;
        this.stage1ShrineReturnX = 0;
        this.stage1LandingPadX = 0;
        this.stage1LandingPadY = 438;
        this.stage2RelicPickup = null;
        this.stage3RelicPickup = null;
        this.stage3RoomType = null;
        this.stage3BossSpawned = false;
        this.dragonRoomBounds = null;
        this.stage3RoomBounds = null;
        this._objectiveText = '';
        // 목숨(하트) 상태: 기본 2개, 사망 시 1개씩 차감
        this.lives = typeof data.lives === 'number' ? data.lives : 2;
        // 사륜안 배경 강도가 바뀌는 조건(스테이지·보스방)을 문자열로 비교합니다.
        this._saryunanSig = '';
    }

    create() {
        const worldWidth = this.worldWidth;
        // 낙사 판정을 위해 월드 하단을 넉넉히 열어둡니다.
        // (기존 600 높이에서는 바닥 경계에 막혀 y>600 조건이 잘 발생하지 않았음)
        this.physics.world.setBounds(0, 0, worldWidth, 2200);
        this.cameras.main.setBounds(0, 0, worldWidth, 600);
        // 스테이지 전역: 사륜안 이미지 + 기존 그라데이션·산 레이어(카메라 고정)
        this.bgSaryunan = createSaryunanBackdrop(this, this.getSaryunanStageAlpha());
        this.bgSaryunan.setDepth(-12);
        this.bgRect = this.add.graphics().setScrollFactor(0).setDepth(-11).setAlpha(0.58);
        this.bgRect.fillGradientStyle(0x0f172a, 0x0f172a, 0x334155, 0x334155, 1).fillRect(0, 0, 800, 600);
        this.bgMountains = this.add.tileSprite(0, 200, 800, 400, 'bg_mountains').setOrigin(0).setScrollFactor(0).setDepth(-10);
        this.createSkyCloudDecor();

        this.platforms = this.physics.add.staticGroup();
        // 구멍(낙사 지형)을 만들기 위해 땅을 짧은 타일로 구성합니다.
        const groundWidth = 220;
        const groundHeight = 80;
        const groundSegments = Math.ceil(worldWidth / groundWidth) + 20;
        const groundTextureKey = 'ground_segment';
        if (!this.textures.exists(groundTextureKey)) {
            const groundGraphic = this.add.graphics();
            groundGraphic.fillStyle(0x32cd32).fillRect(0, 0, groundWidth, 20);
            groundGraphic.fillStyle(0x8b4513).fillRect(0, 20, groundWidth, groundHeight - 20);
            groundGraphic.generateTexture(groundTextureKey, groundWidth, groundHeight);
            groundGraphic.destroy();
        }
        // 좁은 다리·가시 스프라이트(도트 느낌의 단순 도형)
        if (!this.textures.exists('bridge_plank')) {
            const g = this.add.graphics();
            g.fillStyle(0x78350f).fillRect(0, 12, 168, 16);
            g.fillStyle(0xfbbf24).fillRect(0, 8, 168, 8);
            g.lineStyle(2, 0x451a03, 1).strokeRect(1, 8, 166, 20);
            g.generateTexture('bridge_plank', 168, 32);
            g.destroy();
        }
        if (!this.textures.exists('bridge_narrow')) {
            const g = this.add.graphics();
            g.fillStyle(0x57534e).fillRect(0, 8, 76, 14);
            g.fillStyle(0xd6d3d1).fillRect(0, 4, 76, 6);
            g.generateTexture('bridge_narrow', 76, 24);
            g.destroy();
        }
        if (!this.textures.exists('spike_strip')) {
            const g = this.add.graphics();
            g.fillStyle(0x7f1d1d).fillRect(0, 18, 56, 8);
            g.fillStyle(0xdc2626);
            for (let t = 0; t < 6; t++) {
                g.fillTriangle(t * 9 + 1, 18, t * 9 + 9, 18, t * 9 + 5, 4);
            }
            g.generateTexture('spike_strip', 56, 26);
            g.destroy();
        }

        this.abyssZones = [];
        // 초반은 안전 지대, 이후 단일 구멍·넓은 협곡(연속 구멍+중앙 다리)·공중 발판으로 난이도 곡선을 만듭니다.
        for (let i = 0; i < groundSegments; i++) {
            const x = (groundWidth / 2) + i * groundWidth;
            const isSafeIntro = i < 12;
            const isWideChasm = !isSafeIntro && i >= 18 && i % 47 === 0 && i + 1 < groundSegments;
            if (isWideChasm) {
                this.abyssZones.push({ startX: i * groundWidth, width: groundWidth * 2 });
                const bridgeCenterX = groundWidth * (i + 1);
                this.platforms.create(bridgeCenterX, 524, 'bridge_plank').refreshBody();
                i++;
                continue;
            }
            const isHole = !isSafeIntro && i % 13 === 0;
            if (isHole) {
                this.abyssZones.push({ startX: i * groundWidth, width: groundWidth });
                if (i % 23 === 0) {
                    this.platforms.create(x, 530, 'bridge_narrow').refreshBody();
                }
                continue;
            }
            this.platforms.create(x, 560, groundTextureKey).refreshBody();
            if (i > 24 && i % 43 === 9) {
                this.platforms.create(x, 336, 'bridge_narrow').refreshBody();
            }
        }

        // 구멍 위치가 눈에 보이도록 어두운 심연 레이어를 그려줍니다.
        this.abyssZones.forEach((zone) => {
            this.add.rectangle(zone.startX + (zone.width / 2), 585, zone.width, 120, 0x020617, 0.9).setDepth(0);
        });

        this.createGroundSpikes(groundWidth, groundSegments);
        this.createRouteMilestones(groundWidth, groundSegments);

        this.player = this.physics.add.sprite(200, 400, `${this.charData.id}_idle`).setDepth(10);
        this.player.setBodySize(32, 50).setOffset(16, 14);
        this.player.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.enemies = this.physics.add.group();
        this.kunais = this.physics.add.group();
        this.bullets = this.physics.add.group();
        this.shadowClones = this.physics.add.group();
        this.susanooAvatars = this.physics.add.group({ allowGravity: false, immovable: true });
        this.anchors = this.physics.add.staticGroup();
        this.clouds = this.physics.add.staticGroup();
        this.hearts = this.physics.add.group({ allowGravity: false, immovable: true });
        this.relics = this.physics.add.group({ allowGravity: false, immovable: true });

        const anchorCount = Math.ceil(worldWidth / this.performanceProfile.anchorSpacing);
        const cloudCount = Math.ceil(worldWidth / this.performanceProfile.cloudSpacing);
        for (let i = 0; i < anchorCount; i++) {
            this.anchors.create(1000 + i * this.performanceProfile.anchorSpacing, 150, 'rope_anchor');
        }
        for (let i = 0; i < cloudCount; i++) {
            this.clouds.create(820 + i * this.performanceProfile.cloudSpacing, 410 - (i % 4) * 82, 'cloud_plat').refreshBody();
        }

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.clouds);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.overlap(this.player, this.enemies, this.handleDamage, null, this);
        this.physics.add.overlap(this.player, this.bullets, (player, bullet) => {
            // 플레이어가 발사한 뇌절 탄환은 자기 자신에게 피격되지 않도록 제외합니다.
            if (bullet.type === 'playerLightning') return;
            this.handleDamage(player, bullet);
        }, null, this);
        this.physics.add.overlap(this.player, this.hearts, this.collectHeart, null, this);
        this.physics.add.overlap(this.player, this.relics, this.collectRelic, null, this);
        this.physics.add.overlap(this.shadowClones, this.enemies, this.handleCloneHitEnemy, null, this);
        this.physics.add.overlap(this.susanooAvatars, this.enemies, this.handleSusanooHitEnemy, null, this);
        this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
            if (bullet.type !== 'playerLightning') return;
            this.damageEnemy(enemy, 16, { normalScore: 110, particleColor: 0x60a5fa });
            bullet.destroy();
        }, null, this);
        
        this.physics.add.overlap(this.kunais, this.enemies, (k, e) => {
            const damage = e.type === 'nightmareBoss' ? 6 : (e.type === 'dragonBoss' ? 8 : 10);
            this.damageEnemy(e, damage, { normalScore: 100, particleColor: 0xff0000 });
            JuiceManager.shake(this, 0.01, 100);
            k.destroy();
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,Q,E,R,F,SPACE');
        this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.ropeLine = this.add.graphics().setDepth(5);

        this.ui = this.add.container(0, 0).setScrollFactor(0).setDepth(2000);
        this.scoreText = this.add.text(20, 20, 'SCORE: 0 | STAGE 1', { fontSize: '28px', fill: '#fff', fontStyle: 'bold' });
        this.hpBar = this.add.graphics();
        this.bossNameText = this.add.text(230, 78, '', {
            fontSize: '18px',
            fill: '#fca5a5',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4
        });
        this.skillCdText = this.add.text(780, 20, '', { fontSize: '24px', fill: '#ff0' }).setOrigin(1, 0);
        this.cloneCdText = this.add.text(780, 50, '', { fontSize: '20px', fill: '#93c5fd' }).setOrigin(1, 0);
        this.relicCdText = this.add.text(780, 78, '', { fontSize: '20px', fill: '#7dd3fc' }).setOrigin(1, 0);
        this.livesText = this.add.text(20, 86, '', { fontSize: '24px', fill: '#ff8fab', fontStyle: 'bold' });
        this.objectiveText = this.add.text(20, 116, '', {
            fontSize: '18px',
            fill: '#e2e8f0',
            wordWrap: { width: 760 },
            stroke: '#000',
            strokeThickness: 4
        });
        this.doorHintText = this.add.text(400, 540, '문 앞에서 JUMP를 누르면 입장', {
            fontSize: '22px', fill: '#f8fafc', stroke: '#000', strokeThickness: 5
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2100).setVisible(false);
        this.ui.add([this.scoreText, this.hpBar, this.bossNameText, this.skillCdText, this.cloneCdText, this.relicCdText, this.objectiveText]);
        this.ui.add(this.livesText);
        this.ui.add(this.doorHintText);
        this.updateLivesUI();
        this.createExitPromptUI();
        this.createTouchControls();
        this.bindLifecycleGuards();
        this.createStage1ShrineDoor();

        this.enemySpawnTimer = this.time.addEvent({ delay: 2000, callback: this.spawnEnemy, callbackScope: this, loop: true });
        this.skyEnemySpawnTimer = this.time.addEvent({ delay: 1700, callback: this.spawnSkyNinja, callbackScope: this, loop: true });
        this.spawnHearts();

        // 게임 씬 진입 시 닌자풍 배경음악을 시작합니다.
        NinjaBgmManager.start();

        // 플레이 중 주기적으로 사륜안 배경이 잠깐 밝아졌다 어두워지며 긴장감을 줍니다.
        this.time.addEvent({
            delay: 40000,
            loop: true,
            callback: () => this.pulseSaryunanBackdrop(),
            callbackScope: this
        });
    }

    /**
     * 스테이지·특수 방에 따라 사륜안 배경의 기본 투명도를 정합니다.
     */
    getSaryunanStageAlpha() {
        if (this.stage === 3 && this.isInStage3Room) return 0.34;
        if (this.stage === 3) return 0.27;
        if (this.stage === 2 && this.inDragonRoom) return 0.32;
        if (this.stage === 2) return 0.23;
        return 0.19;
    }

    /** 짧게 사륜안 배경을 강조합니다(보스 등). */
    pulseSaryunanBackdrop() {
        if (!this.bgSaryunan?.active || this.isExitPromptOpen || this.isGameOver) return;
        const base = this.getSaryunanStageAlpha();
        this.tweens.add({
            targets: this.bgSaryunan,
            alpha: Math.min(0.46, base + 0.16),
            duration: 650,
            ease: 'Sine.easeInOut',
            yoyo: true
        });
    }

    pulseSaryunanBrief() {
        if (!this.bgSaryunan?.active) return;
        const base = this.getSaryunanStageAlpha();
        this.tweens.add({
            targets: this.bgSaryunan,
            alpha: Math.min(0.52, base + 0.2),
            duration: 280,
            ease: 'Quad.easeOut',
            yoyo: true
        });
    }

    /**
     * 모바일 터치 조작용 이동/점프/공격/기술 버튼을 생성합니다.
     */
    createTouchControls() {
        const hasTouch = this.sys.game.device.input.touch || this.performanceProfile.isTouch;
        this.isTouchUIEnabled = !!hasTouch;
        if (!this.isTouchUIEnabled) return;
        this.input.addPointer(4);

        this.touchControlsContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(4500);
        const defs = [
            { key: 'LEFT', x: 90, y: 520, w: 92, h: 86, color: 0x1d4ed8, label: 'BACK', sub: 'MOVE', hold: true },
            { key: 'JUMP', x: 192, y: 450, w: 98, h: 86, color: 0x0891b2, label: 'JUMP', sub: 'UP', hold: false },
            { key: 'RIGHT', x: 294, y: 520, w: 92, h: 86, color: 0x1d4ed8, label: 'GO', sub: 'MOVE', hold: true },
            { key: 'ATTACK', x: 606, y: 520, w: 92, h: 86, color: 0x475569, label: 'KUNAI', sub: 'S', hold: false },
            { key: 'ITEM', x: 708, y: 420, w: 98, h: 86, color: 0x0284c7, label: 'ITEM', sub: 'LOCKED', hold: false },
            { key: 'SKILL', x: 708, y: 520, w: 98, h: 86, color: 0xdb2777, label: 'ULT', sub: this.getUltimateSkillLabel(), hold: false },
            { key: 'TECH', x: 708, y: 584, w: 98, h: 60, color: 0x7c3aed, label: 'TECH', sub: this.getETechLabel(), hold: false }
        ];

        defs.forEach((def) => {
            const box = this.add.rectangle(def.x, def.y, def.w, def.h, def.color, 0.82).setStrokeStyle(3, 0xe2e8f0, 0.78);
            const label = this.add.text(def.x, def.y - 10, def.label, {
                fontSize: '20px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            const sub = this.add.text(def.x, def.y + 16, def.sub, {
                fontSize: '13px',
                fill: '#dbeafe',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            const hit = this.add.zone(def.x, def.y, def.w + 18, def.h + 18).setInteractive({ useHandCursor: true });
            const press = () => {
                box.setScale(0.94);
                this.setVirtualKey(def.key, true);
            };
            const release = () => {
                box.setScale(1);
                this.setVirtualKey(def.key, false);
            };
            hit.on('pointerdown', press);
            hit.on('pointerup', release);
            hit.on('pointerout', release);
            hit.on('pointerupoutside', release);
            hit.on('pointercancel', release);
            this.touchButtons[def.key] = { box, label, sub, hold: def.hold };
            this.touchControlsContainer.add([box, label, sub, hit]);
        });

        // 앱 전환/포커스 이탈 시 가상키가 눌린 상태로 남지 않도록 초기화
        this.input.on('gameout', () => this.clearVirtualInputs());
        this.refreshTouchButtonLabels();
    }

    clearVirtualInputs() {
        this.virtualHeld = {};
        this.virtualPressed = {};
        Object.values(this.touchButtons).forEach((button) => {
            if (!button?.box) return;
            button.box.setScale(1);
        });
    }

    bindLifecycleGuards() {
        this.handleVisibilityChange = () => {
            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
                this.clearVirtualInputs();
                NinjaVoiceManager.cancel();
                return;
            }
            this.clearVirtualInputs();
            if (NinjaBgmManager.ctx?.state === 'suspended') NinjaBgmManager.ctx.resume();
        };

        this.handleWindowBlur = () => {
            this.clearVirtualInputs();
            NinjaVoiceManager.cancel();
        };

        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', this.handleVisibilityChange);
        }
        if (typeof window !== 'undefined') {
            window.addEventListener('blur', this.handleWindowBlur);
            window.addEventListener('pagehide', this.handleWindowBlur);
        }

        this.events.once('shutdown', () => {
            this.clearVirtualInputs();
            NinjaVoiceManager.cancel();
            if (typeof document !== 'undefined') {
                document.removeEventListener('visibilitychange', this.handleVisibilityChange);
            }
            if (typeof window !== 'undefined') {
                window.removeEventListener('blur', this.handleWindowBlur);
                window.removeEventListener('pagehide', this.handleWindowBlur);
            }
        });
    }

    createStage1ShrineDoor() {
        const doorX = 2860;
        const doorY = 430;
        const shrine = this.add.container(doorX, doorY).setDepth(12);
        shrine.add(this.add.rectangle(0, -74, 210, 18, 0xb91c1c, 1));
        shrine.add(this.add.rectangle(-78, -10, 24, 140, 0x7c2d12, 1));
        shrine.add(this.add.rectangle(78, -10, 24, 140, 0x7c2d12, 1));
        shrine.add(this.add.rectangle(0, 18, 104, 98, 0x111827, 1).setStrokeStyle(4, 0xfacc15));
        shrine.add(this.add.text(0, -118, '소용돌이 제단', {
            fontSize: '22px',
            fill: '#dbeafe',
            stroke: '#000',
            strokeThickness: 5
        }).setOrigin(0.5));

        const landingPadX = doorX + 360;
        this.platforms.create(landingPadX, 520, 'bridge_plank').refreshBody();
        this.add.text(landingPadX, 468, '귀환 발판', {
            fontSize: '18px',
            fill: '#fde68a',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(11);
        this.stage1ShrineDoor = { x: doorX, y: doorY + 12, ui: shrine };
        this.stage1LandingPadX = landingPadX;
        this.stage1LandingPadY = 438;
    }

    /**
     * 상공(사다리/발판 상단)에서 더 잘 보이는 구름 레이어를 만듭니다.
     */
    createSkyCloudDecor() {
        const cloudY = [90, 130, 170, 210];
        cloudY.forEach((y, idx) => {
            const cloud = this.add.tileSprite(0, y, 800, 30 + idx * 5, 'cloud_plat')
                .setOrigin(0)
                .setScrollFactor(0)
                .setAlpha(0.08)
                .setDepth(2);
            this.skyCloudDecor.push(cloud);
        });
    }

    /**
     * ESC 종료 확인창 UI를 생성합니다.
     */
    createExitPromptUI() {
        this.exitPromptContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(5000).setVisible(false);
        const dim = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.65);
        const panel = this.add.rectangle(400, 300, 520, 250, 0x111827, 0.95).setStrokeStyle(4, 0x94a3b8);
        const title = this.add.text(400, 250, '게임을 종료할까요?', {
            fontSize: '40px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        const hint = this.add.text(400, 340, '←/→ 또는 ↑/↓ 로 선택, Enter 로 확인', {
            fontSize: '18px',
            fill: '#cbd5e1'
        }).setOrigin(0.5);
        this.exitYesText = this.add.text(330, 300, 'YES', { fontSize: '32px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.exitNoText = this.add.text(470, 300, 'NO', { fontSize: '32px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.exitPromptContainer.add([dim, panel, title, hint, this.exitYesText, this.exitNoText]);
        this.updateExitChoiceUI();
    }

    /**
     * 가상 버튼 상태를 업데이트합니다.
     */
    setVirtualKey(keyName, isDown) {
        if (!this.isTouchUIEnabled) return;
        if (isDown) {
            if (!this.virtualHeld[keyName]) this.virtualPressed[keyName] = true;
            this.virtualHeld[keyName] = true;
        } else {
            this.virtualHeld[keyName] = false;
        }
    }

    /**
     * 가상 버튼의 JustDown(한 번 클릭) 상태를 소비합니다.
     */
    consumeVirtualPress(keyName) {
        if (!this.virtualPressed[keyName]) return false;
        this.virtualPressed[keyName] = false;
        return true;
    }

    getUltimateSkillLabel() {
        if (this.charData.id === 's') return 'EYE';
        if (this.charData.id === 'n') return 'ORB';
        if (this.charData.id === 'sa') return 'BLOOM';
        if (this.charData.id === 'k') return 'FIELD';
        return 'ULT';
    }

    refreshTouchButtonLabels() {
        if (!this.isTouchUIEnabled) return;
        if (this.touchButtons.SKILL?.sub) this.touchButtons.SKILL.sub.setText(this.getUltimateSkillLabel());
        if (this.touchButtons.TECH?.sub) this.touchButtons.TECH.sub.setText(this.getETechLabel());
        if (this.touchButtons.ITEM?.sub) {
            const itemText = this.activeRelicSkill
                ? `${this.activeRelicSkill.shortLabel} x${this.activeRelicSkill.charges}`
                : 'LOCKED';
            this.touchButtons.ITEM.sub.setText(itemText);
            this.touchButtons.ITEM.box.setFillStyle(this.activeRelicSkill ? 0x0284c7 : 0x334155, this.activeRelicSkill ? 0.82 : 0.66);
        }
    }

    createRelicPickup({ stageKey, x, y, texture, label, accent }) {
        const pedestal = this.add.rectangle(x, y + 34, 86, 16, 0x1f2937, 0.94).setStrokeStyle(3, accent || 0xe2e8f0).setDepth(16);
        const relic = this.relics.create(x, y, texture).setDepth(20).setScale(1.45);
        relic.stageKey = stageKey;
        relic.baseY = y;
        relic.itemLabel = label;
        relic.pedestal = pedestal;
        relic.caption = this.add.text(x, y - 42, label, {
            fontSize: '20px',
            fill: '#f8fafc',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(21);
        relic.body.setCircle(12, 6, 6);
        relic.floatTween = this.tweens.add({
            targets: relic,
            y: y - 10,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        return relic;
    }

    unlockRelicSkill(stageKey) {
        const nextSkill = RELIC_SKILLS[stageKey];
        if (!nextSkill) return;
        this.activeRelicSkill = { ...nextSkill, stageKey };
        this.relicCooldown = 0;
        this.refreshTouchButtonLabels();
        this.pulseSaryunanBrief();
    }

    collectRelic(_player, relic) {
        if (!relic?.active || this.isGameOver) return;
        const stageKey = relic.stageKey;
        if (this.relicsCollected[stageKey]) return;

        this.relicsCollected[stageKey] = true;
        relic.floatTween?.remove();
        if (relic.caption?.active) relic.caption.destroy();
        if (relic.pedestal?.active) relic.pedestal.destroy();
        const pickupX = relic.x;
        const pickupY = relic.y;
        relic.destroy();

        this.unlockRelicSkill(stageKey);
        JuiceManager.emitParticles(this, pickupX, pickupY, 'EXPLOSION', RELIC_SKILLS[stageKey].accent);
        const toast = this.add.text(pickupX, pickupY - 70, `${RELIC_SKILLS[stageKey].itemName} 확보`, {
            fontSize: '24px',
            fill: '#fef3c7',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(2200);
        this.tweens.add({
            targets: toast,
            y: toast.y - 28,
            alpha: 0,
            duration: 900,
            onComplete: () => toast.destroy()
        });

        if (stageKey === 'stage1') {
            NinjaVoiceManager.speak('청람 구슬 확보. 아이템 버튼이 활성화됩니다.', 700);
            this.time.delayedCall(850, () => this.leaveStage1Shrine());
            return;
        }
        if (stageKey === 'stage2') {
            NinjaVoiceManager.speak('천뢰 인장 확보. 천뢰 관통선을 사용할 수 있습니다.', 700);
            return;
        }
        NinjaVoiceManager.speak('적월 가면 확보. 최종 봉인이 해제됩니다.', 700);
        this.time.delayedCall(650, () => this.spawnStage3Boss());
    }

    damageEnemy(enemy, damage, { normalScore = 100, particleColor = 0xffffff } = {}) {
        if (!enemy?.active) return;
        if (this.isBossEnemy(enemy)) {
            enemy.hp -= damage;
            JuiceManager.emitParticles(this, enemy.x, enemy.y, 'EXPLOSION', particleColor);
            if (enemy.hp <= 0) this.handleEnemyDefeat(enemy);
            return;
        }
        JuiceManager.emitParticles(this, enemy.x, enemy.y, 'EXPLOSION', particleColor);
        this.handleEnemyDefeat(enemy, normalScore);
    }

    isBossEnemy(enemy) {
        return enemy.type === 'boss' || enemy.type === 'dragonBoss' || enemy.type === 'nightmareBoss';
    }

    handleEnemyDefeat(enemy, normalScore = 100) {
        if (!enemy?.active) return;
        if (enemy.type === 'dragonBoss') {
            this.score += 1000;
            enemy.destroy();
            this.handleDragonDefeat();
            return;
        }
        if (enemy.type === 'nightmareBoss') {
            this.score += 1800;
            enemy.destroy();
            this.nightmareDefeated = true;
            this.isBossActive = false;
            return;
        }
        if (enemy.type === 'boss') {
            this.score += 1000;
            enemy.destroy();
            this.isBossActive = false;
            this.transitionToStage2();
            return;
        }
        this.score += normalScore;
        enemy.destroy();
    }

    /**
     * 종료 선택 하이라이트를 갱신합니다.
     */
    updateExitChoiceUI() {
        const isYes = this.exitChoiceIndex === 0;
        this.exitYesText.setColor(isYes ? '#facc15' : '#ffffff');
        this.exitNoText.setColor(isYes ? '#ffffff' : '#facc15');
        this.exitYesText.setText(`${isYes ? '▶ ' : ''}YES`);
        this.exitNoText.setText(`${!isYes ? '▶ ' : ''}NO`);
    }

    /**
     * ESC로 종료 확인창을 열거나 닫습니다.
     */
    toggleExitPrompt() {
        this.isExitPromptOpen = !this.isExitPromptOpen;
        this.exitPromptContainer.setVisible(this.isExitPromptOpen);
        if (this.isExitPromptOpen) {
            this.exitChoiceIndex = 0;
            this.updateExitChoiceUI();
            this.player.setVelocity(0, 0);
        }
    }

    /**
     * 종료 확인창에서 키보드 선택을 처리합니다.
     */
    handleExitPromptInput() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.exitChoiceIndex = 0;
            this.updateExitChoiceUI();
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            this.exitChoiceIndex = 1;
            this.updateExitChoiceUI();
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
            if (this.exitChoiceIndex === 0) {
                NinjaBgmManager.stop();
                this.scene.start('TitleScene');
            } else {
                this.toggleExitPrompt();
            }
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
            this.toggleExitPrompt();
        }
    }

    /**
     * 난간/구름 발판 위주로 하트 아이템을 배치합니다.
     * 점프와 로프를 활용해야 닿는 높이에 배치해 탐험 보상을 줍니다.
     */
    spawnHearts() {
        const heartCount = this.performanceProfile.heartCount;
        const spacing = Math.floor((this.worldWidth - 3600) / heartCount);
        for (let i = 0; i < heartCount; i++) {
            const heart = this.hearts.create(1200 + i * spacing, 220 + (i % 3) * 70, 'heart_item').setDepth(15);
            heart.setCircle(8, 0, 0);
            heart.setScale(1.7);
            this.tweens.add({
                targets: heart,
                y: heart.y - 12,
                duration: this.performanceProfile.heartTweenDuration,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    /**
     * 하트 획득 시 체력을 회복하고 이펙트를 표시합니다.
     */
    collectHeart(player, heart) {
        if (!heart.active || this.isGameOver) return;
        heart.destroy();
        const prevHp = this.hp;
        this.hp = Math.min(100, this.hp + 20);
        if (this.hp > prevHp) {
            JuiceManager.emitParticles(this, player.x, player.y - 20, 'EXPLOSION', 0xff4d6d);
            const healText = this.add.text(player.x, player.y - 60, `+${this.hp - prevHp} HP`, {
                fontSize: '22px',
                fill: '#ff8fab',
                fontStyle: 'bold',
                stroke: '#000',
                strokeThickness: 4
            }).setOrigin(0.5).setDepth(2100);
            this.tweens.add({
                targets: healText,
                y: healText.y - 40,
                alpha: 0,
                duration: 800,
                onComplete: () => healText.destroy()
            });
        }
    }

    update(time, delta) {
        if (this.isGameOver || this.isPausedForStory) return;
        if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
            this.toggleExitPrompt();
        }
        if (this.isExitPromptOpen) {
            this.handleExitPromptInput();
            return;
        }

        const themeType = (this.stage - 1) % 3;
        const sarySig = `${this.stage}|${this.inDragonRoom ? 1 : 0}|${this.isInStage3Room ? 1 : 0}`;
        if (sarySig !== this._saryunanSig) {
            this._saryunanSig = sarySig;
            if (this.bgSaryunan) {
                this.tweens.add({
                    targets: this.bgSaryunan, alpha: this.getSaryunanStageAlpha(), duration: 500, ease: 'Sine.easeOut'
                });
            }
        }

        if (this.player.y > 600) {
            this.handleDamage(this.player, { type: 'abyss' });
            return;
        }

        if (time < this.protectedUntil) {
            this.player.setAlpha(Math.floor(time / 80) % 2 === 0 ? 0.58 : 1);
        } else {
            this.player.setAlpha(1);
            this.player.clearTint();
        }
        
        this.scoreText.setText(`SCORE: ${this.score} | STAGE ${this.stage}`);
        this.bgMountains.tilePositionX = this.cameras.main.scrollX * 0.1;
        this.updateSkyAtmosphere();

        if (themeType === 0 && this.score >= this.bossTriggerScore && !this.isBossActive) {
            this.triggerBossFight();
        }

        if (themeType === 1 && this.dragonDefeated && !this.isStageClear) {
            this.goToNextStage();
            return;
        }
        if (themeType === 2 && this.nightmareDefeated && !this.isStageClear) {
            this.goToNextStage();
            return;
        }

        if (this.skillCooldown > 0) {
            this.skillCooldown -= delta;
            this.skillCdText.setText(`SKILL READY: ${Math.ceil(this.skillCooldown/1000)}s`);
        } else {
            this.skillCdText.setText('SKILL READY!');
        }

        if (this.cloneCooldown > 0) {
            this.cloneCooldown -= delta;
            this.cloneCdText.setText(`E TECH: ${Math.ceil(this.cloneCooldown/1000)}s`);
        } else {
            this.cloneCdText.setText(`${this.getETechLabel()} READY (E)`);
        }

        if (this.relicCooldown > 0) {
            this.relicCooldown -= delta;
            const skillName = this.activeRelicSkill ? this.activeRelicSkill.skillName : 'ITEM SKILL';
            this.relicCdText.setText(`${skillName}: ${Math.ceil(this.relicCooldown / 1000)}s`);
        } else if (this.activeRelicSkill) {
            this.relicCdText.setText(`ITEM READY: ${this.activeRelicSkill.skillName} x${this.activeRelicSkill.charges}`);
        } else {
            this.relicCdText.setText('ITEM SKILL LOCKED');
        }

        this.updateHPBar();
        this.updateObjectiveText();
        this.cleanupFarObjects();
        this.tryEnterStage1Shrine();
        this.tryEnterCastleDoor();
        this.tryEnterStage3Portal();
        this.handleMovement();
        this.handleRope();
        this.handleEnemyAI();
    }

    goToNextStage() {
        if (this.isStageClear) return;
        this.isStageClear = true;
        this.isPausedForStory = true;
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        this.enemies.clear(true, true);
        this.bullets.clear(true, true);

        const nextStage = this.stage + 1;
        const isFinal = nextStage > 20;
        const mainText = isFinal ? 'MISSION ACCOMPLISHED' : `STAGE ${this.stage} CLEAR`;
        const subText = isFinal ? '전설의 닌자가 되었습니다!' : `스테이지 ${nextStage}로 이동합니다`;

        NinjaVoiceManager.speak(isFinal ? '전설의 닌자가 되었습니다. 임무 완료.' : `스테이지 ${this.stage} 돌파. 다음 구역으로 진입합니다.`, 600);

        const clearText = this.add.text(400, 240, mainText, {
            fontSize: '56px', fill: isFinal ? '#facc15' : '#22c55e', fontStyle: 'bold', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);

        const stText = this.add.text(400, 310, subText, {
            fontSize: '24px', fill: '#fff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);

        this.time.delayedCall(3000, () => {
            if (isFinal) {
                NinjaBgmManager.stop();
                this.scene.start('TitleScene');
            } else {
                this.scene.start('GameScene', { 
                    char: this.charData, 
                    stage: nextStage, 
                    score: this.score, 
                    lives: this.lives,
                    relicsCollected: this.relicsCollected,
                    activeRelicSkill: this.activeRelicSkill
                });
            }
        });
    }

    /**
     * 플레이어가 높이 올라갈수록 하늘 구름 연출을 더 강하게 보여줍니다.
     */
    updateSkyAtmosphere() {
        const altitudeFactor = Phaser.Math.Clamp((560 - this.player.y) / 340, 0, 1);
        this.skyCloudDecor.forEach((cloud, idx) => {
            cloud.alpha = 0.08 + altitudeFactor * (0.22 + idx * 0.03);
            cloud.tilePositionX = this.cameras.main.scrollX * (0.14 + idx * 0.03);
        });
    }

    updateObjectiveText() {
        const themeType = (this.stage - 1) % 3;
        let nextObjective = 'MISSION: 전장 정보를 불러오는 중';
        
        if (themeType === 0) {
            if (!this.relicsCollected.stage1) nextObjective = 'MISSION: 소용돌이 제단에 들어가 청람 구슬을 확보하세요';
            else if (!this.isBossActive) nextObjective = 'MISSION: 적을 처치해 전선 보스를 호출하세요';
            else nextObjective = 'MISSION: 전선 보스를 격파하세요';
        } else if (themeType === 1) {
            if (!this.relicsCollected.stage2) nextObjective = 'MISSION: 천뢰 병기고에서 천뢰 인장을 확보하세요';
            else if (!this.inDragonRoom) nextObjective = 'MISSION: 성문 앞에서 JUMP를 눌러 드래곤 방으로 입장하세요';
            else nextObjective = 'MISSION: 거대 용을 격파하세요';
        } else {
            if (!this.isInStage3Room) nextObjective = 'MISSION: 포털을 선택해 마지막 시험의 방으로 들어가세요';
            else if (!this.relicsCollected.stage3) nextObjective = 'MISSION: 적월 가면을 회수해 최종 보스를 깨우세요';
            else nextObjective = 'MISSION: 최종 보스를 쓰러뜨리세요';
        }

        if (nextObjective === this._objectiveText) return;
        this._objectiveText = nextObjective;
        this.objectiveText.setText(nextObjective);
    }

    showBossBanner(title, color = '#ffffff') {
        const bossText = this.add.text(400, 100, title, {
            fontSize: '56px',
            fill: color,
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 8
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3200);
        this.tweens.add({
            targets: bossText,
            alpha: 0,
            duration: 2100,
            onComplete: () => bossText.destroy()
        });
    }

    cleanupFarObjects() {
        const leftBound = this.player.x - 1200;
        const rightBound = this.player.x + 1800;

        this.kunais.getChildren().forEach((kunai) => {
            if (!kunai.active) return;
            if (kunai.x < leftBound || kunai.x > rightBound) kunai.destroy();
        });
        this.bullets.getChildren().forEach((bullet) => {
            if (!bullet.active) return;
            if (bullet.x < leftBound - 180 || bullet.x > rightBound || bullet.y > 900 || bullet.y < -200) bullet.destroy();
        });
    }

    triggerBossFight() {
        this.isBossActive = true;
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        
        NinjaVoiceManager.speak('경고. 철갑 전선대장이 등장합니다. 근거리 돌진과 표창 난사에 대비하십시오.', 500);

        this.pulseSaryunanBrief();

        const boss = this.enemies.create(this.player.x + 620, 398, 'field_commander').setScale(1.7).setDepth(19);
        boss.type = 'boss';
        boss.hp = 190 + (this.stage * 20);
        boss.maxHp = boss.hp;
        boss.lastShot = 0;
        boss.lastDash = 0;
        boss.lastShockwave = 0;
        boss.enraged = false;
        boss.body.setSize(42, 52).setOffset(11, 8);
        this.boss = boss;

        this.showBossBanner('FIELD COMMANDER', '#f87171');
    }

    tryEnterStage1Shrine() {
        const themeType = (this.stage - 1) % 3;
        if (themeType !== 0 || !this.stage1ShrineDoor || this.relicsCollected.stage1 || this.isBossActive || this.inStage1Shrine) {
            this.doorHintText.setVisible(false);
            return;
        }

        const isNearDoor = Math.abs(this.player.x - this.stage1ShrineDoor.x) < 120 && Math.abs(this.player.y - this.stage1ShrineDoor.y) < 160;
        this.doorHintText.setVisible(isNearDoor);
        this.doorHintText.setText(isNearDoor ? '제단 앞에서 JUMP를 누르면 입장' : '문 앞에서 JUMP를 누르면 입장');

        if (isNearDoor && (Phaser.Input.Keyboard.JustDown(this.cursors.up) || this.consumeVirtualPress('JUMP'))) {
            this.enterStage1Shrine();
        }
    }

    enterStage1Shrine() {
        this.inStage1Shrine = true;
        this.stage1ShrineReturnX = this.stage1ShrineDoor.x + 320;
        this.doorHintText.setVisible(false);
        this.enemies.clear(true, true);
        this.bullets.clear(true, true);
        if (this.enemySpawnTimer) this.enemySpawnTimer.paused = true;
        if (this.skyEnemySpawnTimer) this.skyEnemySpawnTimer.paused = true;

        const roomWidth = 1160;
        const roomStartX = this.worldWidth - 5600;
        this.cameras.main.setBounds(roomStartX, 0, roomWidth, 600);
        this.player.setPosition(roomStartX + 180, 420);
        this.player.setVelocity(0, 0);

        for (let i = 0; i < 6; i++) {
            this.platforms.create(roomStartX + 110 + i * 220, 560, 'ground_segment').refreshBody();
        }

        this.add.rectangle(roomStartX + (roomWidth / 2), 300, roomWidth, 600, 0x082f49, 0.42).setDepth(1);
        this.add.text(roomStartX + (roomWidth / 2), 110, 'WHIRLING SHRINE', {
            fontSize: '50px',
            fill: '#e0f2fe',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(22);
        this.add.text(roomStartX + (roomWidth / 2), 166, '푸른 나선 구슬을 회수하면 ITEM 기술이 해금됩니다', {
            fontSize: '22px',
            fill: '#bae6fd',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(22);

        this.createRelicPickup({
            stageKey: 'stage1',
            x: roomStartX + 820,
            y: 340,
            texture: 'relic_spiral',
            label: RELIC_SKILLS.stage1.itemName,
            accent: RELIC_SKILLS.stage1.accent
        });
    }

    leaveStage1Shrine() {
        this.inStage1Shrine = false;
        this.roomTransitionLocked = true;
        this.isPausedForStory = true;
        this.player.setVelocity(0, 0);
        this.player.body.setAllowGravity(false);
        this.cameras.main.fadeOut(180, 8, 47, 73);

        this.time.delayedCall(210, () => {
            this.cameras.main.setBounds(0, 0, this.worldWidth, 600);
            this.player.setPosition(this.stage1LandingPadX || this.stage1ShrineReturnX || (this.stage1ShrineDoor.x + 320), this.stage1LandingPadY);
            this.player.setVelocity(0, 0);
            this.player.body.setAllowGravity(true);
            this.player.setTint(0x93c5fd);
            this.protectedUntil = this.time.now + 1400;
            this.cameras.main.fadeIn(220, 8, 47, 73);
            this.cameras.main.flash(180, 147, 197, 253);

            const notice = this.add.text(400, 120, '청람 구슬 확보. 전선으로 복귀합니다.', {
                fontSize: '28px',
                fill: '#e0f2fe',
                fontStyle: 'bold',
                stroke: '#000',
                strokeThickness: 6
            }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
            this.tweens.add({
                targets: notice,
                alpha: 0,
                duration: 1200,
                onComplete: () => notice.destroy()
            });
        });

        this.time.delayedCall(520, () => {
            if (this.enemySpawnTimer) this.enemySpawnTimer.paused = false;
            if (this.skyEnemySpawnTimer) this.skyEnemySpawnTimer.paused = false;
            this.roomTransitionLocked = false;
            this.isPausedForStory = false;
        });
    }

    createStage2RelicCache() {
        const baseX = this.player.x + 1180;
        this.add.rectangle(baseX, 480, 190, 120, 0x0f172a, 0.82).setStrokeStyle(4, 0x60a5fa).setDepth(13);
        this.add.text(baseX, 420, '천뢰 병기고', {
            fontSize: '24px',
            fill: '#dbeafe',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(14);
        this.stage2RelicPickup = this.createRelicPickup({
            stageKey: 'stage2',
            x: baseX,
            y: 360,
            texture: 'relic_thunder',
            label: RELIC_SKILLS.stage2.itemName,
            accent: RELIC_SKILLS.stage2.accent
        });
    }

    /**
     * 스테이지2의 성(5층) 1층 방문을 생성합니다.
     */
    createCastleDoor() {
        const doorX = 2200;
        const doorY = 438;
        const castle = this.add.container(doorX, doorY).setDepth(12);
        const wallColor = 0x64748b;
        const lineColor = 0x1e293b;

        castle.add(this.add.rectangle(0, 0, 300, 260, wallColor, 0.95).setStrokeStyle(6, lineColor));
        for (let i = 1; i <= 4; i++) {
            castle.add(this.add.rectangle(0, -130 + i * 52, 300, 4, lineColor, 0.9));
        }
        castle.add(this.add.rectangle(-120, -80, 60, 120, wallColor, 0.95).setStrokeStyle(5, lineColor));
        castle.add(this.add.rectangle(120, -80, 60, 120, wallColor, 0.95).setStrokeStyle(5, lineColor));
        castle.add(this.add.rectangle(0, 54, 110, 120, 0x3f3f46, 1).setStrokeStyle(5, 0x111827));
        castle.add(this.add.rectangle(0, 20, 110, 8, 0x111827, 1));
        castle.add(this.add.circle(0, 62, 7, 0xfacc15, 1));

        this.castleDoor = {
            x: doorX,
            y: doorY + 54,
            width: 120,
            height: 130,
            ui: castle
        };
    }

    /**
     * 성문 근처에서 ↑키를 누르면 용 보스룸으로 입장합니다.
     */
    tryEnterCastleDoor() {
        const themeType = (this.stage - 1) % 3;
        if (themeType !== 1 || !this.castleDoor || this.inDragonRoom || this.dragonDefeated) {
            this.doorHintText.setVisible(false);
            return;
        }

        const isNearDoor = Math.abs(this.player.x - this.castleDoor.x) < 110 && Math.abs(this.player.y - this.castleDoor.y) < 150;
        this.doorHintText.setVisible(isNearDoor);

        if (isNearDoor && (Phaser.Input.Keyboard.JustDown(this.cursors.up) || this.consumeVirtualPress('JUMP'))) {
            this.enterDragonRoom();
        }
    }

    /**
     * 실내 보스룸을 연출하고 커다란 용 보스를 소환합니다.
     */
    enterDragonRoom() {
        this.inDragonRoom = true;
        this.hasEnteredCastle = true;
        this.doorHintText.setVisible(false);
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        this.enemies.clear(true, true);
        this.bullets.clear(true, true);

        const roomStartX = this.worldWidth - 3200;
        const roomWidth = 1400;
        this.dragonRoomBounds = { minX: roomStartX + 220, maxX: roomStartX + roomWidth - 220 };
        this.cameras.main.setBounds(roomStartX, 0, roomWidth, 600);
        this.player.setPosition(roomStartX + 220, 420);
        this.player.setVelocity(0, 0);

        for (let i = 0; i < 7; i++) {
            this.platforms.create(roomStartX + 110 + i * 220, 560, 'ground_segment').refreshBody();
        }
        this.add.rectangle(roomStartX + (roomWidth / 2), 300, roomWidth, 600, 0x0b1020, 0.45).setDepth(1);
        this.add.text(roomStartX + (roomWidth / 2), 100, 'DRAGON ROOM', {
            fontSize: '52px', fill: '#f97316', fontStyle: 'bold', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(20);

        const dragon = this.enemies.create(roomStartX + 1040, 340, 'dragon_boss').setScale(2.7).setDepth(18).setTint(0xff8a3d);
        dragon.type = 'dragonBoss';
        dragon.hp = 340 + (this.stage * 30);
        dragon.maxHp = dragon.hp;
        dragon.lastShot = 0;
        dragon.lastBreath = 0;
        dragon.lastRush = 0;
        dragon.baseY = 340;
        dragon.enraged = false;
        dragon.body.setAllowGravity(false);
        this.boss = dragon;
        this.isBossActive = true;

        NinjaVoiceManager.speak('침묵하던 성문이 열렸습니다. 거대 용이 복도 끝에서 깨어납니다.', 600);

        this.pulseSaryunanBrief();
        this.showBossBanner('STORM DRAGON', '#fb923c');
    }

    /**
     * 용 보스 처치 후 스테이지2 클리어 가능 상태로 전환합니다.
     */
    handleDragonDefeat() {
        this.dragonDefeated = true;
        this.isBossActive = false;
        NinjaVoiceManager.speak('거대 용 격파. 미션 완료.', 600);
    }

    /**
     * 스테이지3 포털 앞에서 위 키를 누르면 랜덤 방으로 입장
     */
    tryEnterStage3Portal() {
        const themeType = (this.stage - 1) % 3;
        if (themeType !== 2 || this.isInStage3Room || this.nightmareDefeated) return;
        let nearPortal = null;
        this.stage3Portals.forEach((portal) => {
            if (Math.abs(this.player.x - portal.x) < 110 && Math.abs(this.player.y - portal.y) < 150) nearPortal = portal;
        });
        this.doorHintText.setVisible(!!nearPortal);
        this.doorHintText.setText(nearPortal ? '포털 앞에서 JUMP를 누르면 입장' : '문 앞에서 JUMP를 누르면 입장');
        if (nearPortal && (Phaser.Input.Keyboard.JustDown(this.cursors.up) || this.consumeVirtualPress('JUMP'))) {
            this.enterStage3Room(nearPortal.roomType);
        }
    }

    /**
     * 스테이지3 방 입장: 더 무서운 최종 보스 소환
     */
    enterStage3Room(roomType) {
        this.isInStage3Room = true;
        this.isBossActive = true;
        this.stage3RoomType = roomType;
        this.stage3BossSpawned = false;
        this.enemies.clear(true, true);
        this.bullets.clear(true, true);
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();

        const roomStartX = this.worldWidth - 1700;
        const roomWidth = 1600;
        this.stage3RoomBounds = { minX: roomStartX + 220, maxX: roomStartX + roomWidth - 220 };
        this.cameras.main.setBounds(roomStartX, 0, roomWidth, 600);
        this.player.setPosition(roomStartX + 220, 420);
        this.player.setVelocity(0, 0);

        for (let i = 0; i < 8; i++) {
            this.platforms.create(roomStartX + 100 + i * 220, 560, 'ground_segment').refreshBody();
        }

        const roomTheme = {
            stage1_motif: { color: 0x3f6212, title: '폐허 전장' },
            stage2_castle: { color: 0x4c1d95, title: '붉은 성채 내부' },
            prison: { color: 0x1f2937, title: '심연 감옥' }
        }[roomType] || { color: 0x111827, title: '금단의 방' };

        this.add.rectangle(roomStartX + (roomWidth / 2), 300, roomWidth, 600, roomTheme.color, 0.35).setDepth(1);
        this.add.text(roomStartX + (roomWidth / 2), 95, roomTheme.title, {
            fontSize: '48px', fill: '#f8fafc', fontStyle: 'bold', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(21);

        this.createRelicPickup({
            stageKey: 'stage3',
            x: roomStartX + 760,
            y: 330,
            texture: 'relic_crimson',
            label: RELIC_SKILLS.stage3.itemName,
            accent: RELIC_SKILLS.stage3.accent
        });

        this.add.text(roomStartX + (roomWidth / 2), 148, '먼저 적월 가면을 회수하면 최종 봉인이 풀립니다', {
            fontSize: '22px',
            fill: '#fecdd3',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(21);

        NinjaVoiceManager.speak('적월의 방입니다. 먼저 가면을 회수하십시오.', 600);

        this.pulseSaryunanBrief();
    }

    spawnStage3Boss() {
        if (this.stage3BossSpawned || !this.isInStage3Room) return;
        const roomStartX = this.worldWidth - 1700;
        const nightmare = this.enemies.create(roomStartX + 1180, 332, 'nightmare_boss').setScale(2.95).setDepth(18).setTint(0x9f1239);
        nightmare.type = 'nightmareBoss';
        nightmare.hp = 520 + (this.stage * 40);
        nightmare.maxHp = nightmare.hp;
        nightmare.lastShot = 0;
        nightmare.lastTeleport = 0;
        nightmare.lastRing = 0;
        nightmare.baseY = 332;
        nightmare.enraged = false;
        nightmare.body.setAllowGravity(false);
        this.boss = nightmare;
        this.stage3BossSpawned = true;
        this.isBossActive = true;
        NinjaVoiceManager.speak('경고! 악몽의 보스가 등장했습니다.', 600);
        this.showBossBanner('CRIMSON NIGHTMARE', '#fb7185');
    }

    handleStage3Clear() {
        if (this.isStageClear) return;
        this.isStageClear = true;
        this.isPausedForStory = true;
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        this.enemies.clear(true, true);
        this.bullets.clear(true, true);
        NinjaVoiceManager.speak('미션 완료. 스테이지 3까지 돌파했습니다.', 600);

        const clearText = this.add.text(400, 240, 'STAGE 3 COMPLETE', {
            fontSize: '54px', fill: '#facc15', fontStyle: 'bold', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
        const subText = this.add.text(400, 310, '잠시 후 타이틀로 돌아갑니다', {
            fontSize: '24px', fill: '#fff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
        this.time.delayedCall(3200, () => {
            NinjaBgmManager.stop();
            clearText.destroy();
            subText.destroy();
            this.scene.start('TitleScene');
        });
    }

    flashLightning() {
        if (this.stage !== 2) return;
        const flash = this.add.rectangle(0, 0, 800, 600, 0xffffff, 0.3).setOrigin(0).setScrollFactor(0);
        this.tweens.add({ targets: flash, alpha: 0, duration: 200, onComplete: () => flash.destroy() });
        JuiceManager.shake(this, 0.01, 100);
        if (this.bgSaryunan?.active) {
            const base = this.getSaryunanStageAlpha();
            this.tweens.add({
                targets: this.bgSaryunan,
                alpha: Math.min(0.44, base + 0.1),
                duration: 90,
                yoyo: true
            });
        }
    }

    updateHPBar() {
        this.hpBar.clear();
        this.hpBar.fillStyle(0x000000, 0.5).fillRect(20, 60, 200, 15);
        this.hpBar.fillStyle(this.hp > 30 ? 0x2ecc71 : 0xe74c3c).fillRect(20, 60, this.hp * 2, 15);
        
        if (this.isBossActive && this.boss && this.boss.active) {
            this.hpBar.fillStyle(0x000000, 0.5).fillRect(20, 80, 200, 10);
            const bossMaxHp = this.boss.maxHp || 100;
            this.hpBar.fillStyle(0xff0000).fillRect(20, 80, (this.boss.hp / bossMaxHp) * 200, 10);
            this.bossNameText.setText(this.getBossDisplayName(this.boss));
        } else {
            this.bossNameText.setText('');
        }
    }

    getBossDisplayName(boss) {
        if (!boss) return '';
        if (boss.type === 'dragonBoss') return 'BOSS: 폭풍룡 카이라';
        if (boss.type === 'nightmareBoss') return 'BOSS: 적월의 악몽';
        return 'BOSS: 철갑 전선대장';
    }

    /**
     * 좌측 상단에 남은 목숨(하트)을 표시합니다.
     */
    updateLivesUI() {
        const heartIcon = '♥';
        const emptyHeartIcon = '♡';
        const maxLives = 2;
        const filled = heartIcon.repeat(Math.max(0, this.lives));
        const empty = emptyHeartIcon.repeat(Math.max(0, maxLives - this.lives));
        this.livesText.setText(`LIFE: ${filled}${empty}`);
    }

    handleMovement() {
        if (this.isRoping) return;
        const speed = 450 + (this.stage * 20);
        const leftDown = this.cursors.left.isDown || this.keys.A.isDown || !!this.virtualHeld.LEFT;
        const rightDown = this.cursors.right.isDown || this.keys.D.isDown || !!this.virtualHeld.RIGHT;
        if (leftDown) { this.player.setVelocityX(-speed); this.player.flipX = true; }
        else if (rightDown) { this.player.setVelocityX(speed); this.player.flipX = false; }
        else this.player.setVelocityX(0);

        const isJumpDown = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                           Phaser.Input.Keyboard.JustDown(this.keys.W) || 
                           Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
                           this.consumeVirtualPress('JUMP');

        if (isJumpDown && this.player.body.touching.down) this.player.setVelocityY(-950);
        if (Phaser.Input.Keyboard.JustDown(this.keys.S) || this.consumeVirtualPress('ATTACK')) this.fireKunai();
        if ((Phaser.Input.Keyboard.JustDown(this.keys.E) || this.consumeVirtualPress('TECH')) && this.cloneCooldown <= 0) this.useCharacterETechnique();
        if ((Phaser.Input.Keyboard.JustDown(this.keys.Q) || this.consumeVirtualPress('SKILL')) && this.skillCooldown <= 0) this.useSkill();
        if ((Phaser.Input.Keyboard.JustDown(this.keys.F) || this.consumeVirtualPress('ITEM')) && this.activeRelicSkill && this.activeRelicSkill.charges > 0 && this.relicCooldown <= 0) {
            this.useRelicSkill();
        }
    }

    /**
     * 캐릭터별 E 기술 이름을 반환합니다.
     */
    getETechLabel() {
        if (this.charData.id === 'k') return 'LIGHTNING';
        if (this.charData.id === 's') return 'SUSANOO';
        if (this.charData.id === 'sa') return 'HEAL';
        if (this.charData.id === 'n') return 'CLONE';
        return 'SPECIAL';
    }

    /**
     * E 키 공통 기술 진입점: 캐릭터별 기술로 분기합니다.
     */
    useCharacterETechnique() {
        if (this.charData.id === 'k') {
            this.useKakashiLightning();
            return;
        }
        if (this.charData.id === 's') {
            this.useSasukeSusanoo();
            return;
        }
        if (this.charData.id === 'sa') {
            this.useSakuraHealing();
            return;
        }
        this.useShadowCloneJutsu();
    }

    useRelicSkill() {
        if (!this.activeRelicSkill || this.activeRelicSkill.charges <= 0) return;
        const skillId = this.activeRelicSkill.stageKey;

        this.activeRelicSkill.charges -= 1;
        this.relicCooldown = this.activeRelicSkill.cooldown;
        this.refreshTouchButtonLabels();
        JuiceManager.shake(this, 0.05, 260);

        if (skillId === 'stage1') {
            const orb = this.physics.add.sprite(this.player.x, this.player.y - 10, 'rasengan').setScale(1.95).setDepth(28).setTint(0x7dd3fc);
            orb.body.setAllowGravity(false);
            orb.setVelocityX(this.player.flipX ? -1180 : 1180);
            this.tweens.add({ targets: orb, angle: 720, duration: 580, repeat: -1 });
            const orbCollider = this.physics.add.overlap(orb, this.enemies, (_orb, enemy) => this.damageEnemy(enemy, 12, { normalScore: 140, particleColor: 0x7dd3fc }));
            this.time.delayedCall(900, () => {
                orbCollider.destroy();
                if (orb.active) orb.destroy();
            });
            NinjaVoiceManager.speak('청람 나선옥!', 500);
        } else if (skillId === 'stage2') {
            const direction = this.player.flipX ? -1 : 1;
            [-52, 0, 52].forEach((offsetY, index) => {
                const bolt = this.bullets.create(this.player.x + direction * 40, this.player.y + offsetY, 'lightning_chidori')
                    .setDepth(28)
                    .setScale(1.3 + index * 0.06)
                    .setTint(0x93c5fd);
                bolt.type = 'playerLightning';
                bolt.body.setAllowGravity(false);
                bolt.setVelocityX(direction * 1450);
                bolt.setAngularVelocity(direction * 760);
                this.time.delayedCall(460, () => {
                    if (bolt.active) bolt.destroy();
                });
            });
            NinjaVoiceManager.speak('천뢰 관통선!', 500);
        } else {
            const filter = this.add.rectangle(400, 300, 800, 600, 0x7f1d1d, 0.28).setScrollFactor(0).setDepth(1000);
            this.tweens.add({ targets: filter, alpha: 0, duration: 850, onComplete: () => filter.destroy() });
            const guardian = this.susanooAvatars.create(this.player.x, this.player.y - 20, 'susanoo_avatar');
            guardian.body.setAllowGravity(false);
            guardian.setDepth(26);
            guardian.setScale(2.8);
            guardian.setAlpha(0.68);
            this.bullets.clear(true, true);
            this.enemies.getChildren().forEach((enemy) => {
                if (!enemy?.active) return;
                if (Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y) < 620) {
                    this.damageEnemy(enemy, 26, { normalScore: 180, particleColor: 0xfb7185 });
                }
            });
            this.tweens.add({
                targets: guardian,
                alpha: 0,
                y: guardian.y - 55,
                duration: 900,
                onComplete: () => {
                    if (guardian.active) guardian.destroy();
                }
            });
            NinjaVoiceManager.speak('적월 수호진!', 500);
        }
    }

    /**
     * E 키 전용: 도트 스타일 그림자분신술
     * - 나루토 캐릭터(`n`)는 분신 4개, 그 외 캐릭터는 분신 2개 생성
     */
    useShadowCloneJutsu() {
        this.cloneCooldown = 7000;
        const cloneCount = this.charData.id === 'n' ? 4 : 2;
        const direction = this.player.flipX ? -1 : 1;
        const baseTexture = `${this.charData.id}_run`;

        for (let i = 0; i < cloneCount; i++) {
            const offsetX = (i + 1) * 26 * direction;
            const offsetY = -10 + (i % 2) * 18;
            const clone = this.shadowClones.create(this.player.x + offsetX, this.player.y + offsetY, baseTexture);
            clone.setDepth(9);
            clone.setAlpha(0.45);
            clone.setTint(0x9ca3af);
            clone.body.setAllowGravity(false);
            clone.setVelocityX((950 + i * 70) * direction);
            clone.setVelocityY((i % 2 === 0 ? -40 : 40));
            clone.body.setSize(24, 38);
            clone.flipX = this.player.flipX;

            // 짧은 시간 유지 후 사라지는 분신 연출
            this.tweens.add({
                targets: clone,
                alpha: 0.05,
                duration: 850,
                onComplete: () => {
                    if (clone.active) clone.destroy();
                }
            });
        }

        JuiceManager.shake(this, 0.03, 220);
        NinjaVoiceManager.speak('그림자 분신술!', 500);
    }

    /**
     * 카카시 E 기술: 뇌절(치도리) 도트 번개 탄환
     */
    useKakashiLightning() {
        this.cloneCooldown = 6500;
        const direction = this.player.flipX ? -1 : 1;
        const bolt = this.bullets.create(this.player.x + (direction * 30), this.player.y - 10, 'lightning_chidori');
        bolt.type = 'playerLightning';
        bolt.body.setAllowGravity(false);
        bolt.setDepth(25);
        bolt.setScale(1.3);
        bolt.setVelocityX(direction * 1600);
        bolt.setAngularVelocity(direction * 720);
        JuiceManager.shake(this, 0.05, 260);
        this.time.delayedCall(520, () => {
            if (bolt.active) bolt.destroy();
        });
        NinjaVoiceManager.speak('뇌절!', 500);
    }

    /**
     * 사스케 E 기술: 스사노오 소환
     */
    useSasukeSusanoo() {
        this.cloneCooldown = 10000;
        const direction = this.player.flipX ? -1 : 1;
        const summonX = this.player.x + (direction * 120);
        const summonY = this.player.y - 25;
        const susanoo = this.susanooAvatars.create(summonX, summonY, 'susanoo_avatar');
        susanoo.type = 'susanoo';
        susanoo.body.setAllowGravity(false);
        susanoo.setDepth(24);
        susanoo.setScale(2.4);
        susanoo.setAlpha(0.85);
        susanoo.body.setSize(90, 120);
        JuiceManager.shake(this, 0.07, 320);

        // 짧은 유지 시간 동안 파동 피해
        const pulse = this.time.addEvent({
            delay: 180,
            repeat: 7,
            callback: () => {
                if (!susanoo.active) return;
                this.enemies.getChildren().forEach((enemy) => {
                    const dist = Phaser.Math.Distance.Between(susanoo.x, susanoo.y, enemy.x, enemy.y);
                    if (dist < 340) {
                        this.damageEnemy(enemy, 10, { normalScore: 120, particleColor: 0xa855f7 });
                    }
                });
            }
        });

        this.tweens.add({
            targets: susanoo,
            alpha: 0.1,
            duration: 1450,
            onComplete: () => {
                pulse.remove(false);
                if (susanoo.active) susanoo.destroy();
            }
        });

        NinjaVoiceManager.speak('스사노오!', 500);
    }

    /**
     * 사쿠라 E 기술: 힐링
     * 최대 체력(100)의 50%를 즉시 회복합니다.
     */
    useSakuraHealing() {
        this.cloneCooldown = 9000;
        const healAmount = 50;
        const prevHp = this.hp;
        this.hp = Math.min(100, this.hp + healAmount);
        const recovered = this.hp - prevHp;

        // 이전 힐링 이펙트가 남아 있으면 정리해 프레임 저하를 막습니다.
        if (this.activeHealFx && this.activeHealFx.active) {
            this.activeHealFx.destroy();
        }
        // 사쿠라 힐링은 가벼운 도트 오브 연출로 고정해 중간 멈춤을 방지합니다.
        this.activeHealFx = this.add.image(this.player.x, this.player.y - 34, 'heal_orb')
            .setDepth(30)
            .setScale(1.7)
            .setAlpha(0.92);
        this.tweens.add({
            targets: this.activeHealFx,
            y: this.activeHealFx.y - 72,
            alpha: 0,
            duration: 820,
            onComplete: () => {
                if (this.activeHealFx && this.activeHealFx.active) this.activeHealFx.destroy();
                this.activeHealFx = null;
            }
        });

        const healText = this.add.text(this.player.x, this.player.y - 85, `+${recovered} HP`, {
            fontSize: '26px',
            fill: '#f9a8d4',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(32);
        this.tweens.add({
            targets: healText,
            y: healText.y - 35,
            alpha: 0,
            duration: 900,
            onComplete: () => healText.destroy()
        });

        JuiceManager.emitParticles(this, this.player.x, this.player.y - 20, 'EXPLOSION', 0xf9a8d4);
        NinjaVoiceManager.speak('힐링!', 500);
    }

    /**
     * 분신이 적과 닿으면 적에게 피해를 줍니다.
     */
    handleCloneHitEnemy(clone, enemy) {
        if (!clone?.active || !enemy?.active) return;
        this.damageEnemy(enemy, 12, { normalScore: 80, particleColor: 0xdbeafe });
        clone.destroy();
    }

    /**
     * 스사노오 본체 충돌 피해 처리
     */
    handleSusanooHitEnemy(susanoo, enemy) {
        if (!susanoo?.active || !enemy?.active) return;
        this.damageEnemy(enemy, 4, { normalScore: 60, particleColor: 0xc084fc });
    }

    fireKunai() {
        const k = this.kunais.create(this.player.x, this.player.y, `kunai_${this.charData.id}`);
        k.body.setAllowGravity(false);
        k.setVelocityX(this.player.flipX ? -1200 : 1200);
        k.angle = this.player.flipX ? 180 : 0;
    }

    useSkill() {
        this.skillCooldown = 8000; // Increased cooldown for ultimate skill
        JuiceManager.shake(this, 0.08, 500);

        if (this.charData.id === 's') {
            // Sasuke: Mangekyou Sharingan (V9.3)
            const filter = this.add.rectangle(400, 300, 800, 600, 0xff0000, 0.5).setScrollFactor(0).setDepth(1000);
            this.tweens.add({ targets: filter, alpha: 0, duration: 1500, onComplete: () => filter.destroy() });

            const eye = this.physics.add.sprite(this.player.x, this.player.y, 'sharingan').setScale(2).setDepth(1001);
            eye.body.setAllowGravity(false);
            eye.setVelocityX(this.player.flipX ? -2000 : 2000);
            this.tweens.add({ targets: eye, angle: 1080, scale: 6, duration: 1000, onComplete: () => eye.destroy() });

            // Mass Kill Logic
            this.enemies.getChildren().forEach(e => {
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
                if (dist < 1000) { // Screen-wide range
                    this.damageEnemy(e, 40, { normalScore: 150, particleColor: 0x000000 });
                }
            });
            NinjaVoiceManager.speak('만화경 사륜안, 환술의 세계로.', 500);
        } else if (this.charData.id === 'n') {
            // Naruto: Rasengan (V9.2)
            const r = this.physics.add.sprite(this.player.x, this.player.y, 'rasengan').setScale(1.5).setDepth(20);
            r.body.setAllowGravity(false);
            r.setVelocityX(this.player.flipX ? -1500 : 1500);
            this.tweens.add({ targets: r, angle: 360, duration: 500, loop: -1 });
            
            const rasenganCollider = this.physics.add.overlap(r, this.enemies, (ras, e) => {
                this.damageEnemy(e, 5, { normalScore: 100, particleColor: 0x3b82f6 });
            });
            this.time.delayedCall(1000, () => {
                rasenganCollider.destroy();
                if (r.active) r.destroy();
            });
            NinjaVoiceManager.speak('나선환!', 500);
        } else {
            const color = this.charData.id === 'sa' ? 0xf472b6 : 0x2ecc71;
            let ring = this.add.circle(this.player.x, this.player.y, 10, color, 0.3).setStrokeStyle(3, 0xffffff);
            this.tweens.add({ targets: ring, radius: 450, alpha: 0, duration: 600, onComplete: () => ring.destroy() });
            this.enemies.getChildren().forEach(e => {
                if(Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y) < 450) {
                    this.damageEnemy(e, 20, { normalScore: 120, particleColor: color });
                }
            });
            NinjaVoiceManager.speak(this.charData.id === 'sa' ? '체술 해방!' : '번개 전개!', 500);
        }
    }

    handleRope() {
        this.ropeLine.clear();
        // E 키는 그림자분신술로 재할당되어, 밧줄은 R 키로 사용합니다.
        if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
            if (this.isRoping) {
                this.releaseRope(true);
            }
            else {
                let near = Phaser.Actions.GetClosest(this.player, this.anchors.getChildren());
                if (near && Phaser.Math.Distance.BetweenPoints(this.player, near) < 400) {
                    this.isRoping = true;
                    this.ropeTarget = near;
                    this.ropeAttachedAt = this.time.now;
                    this.player.body.setAllowGravity(false);
                }
            }
        }
        if (this.isRoping) {
            // 대상이 사라졌거나 오래 붙잡고 있으면 자동 해제해 멈춤 체감을 줄입니다.
            const isTargetInvalid = !this.ropeTarget || !this.ropeTarget.active;
            const isTimeout = (this.time.now - this.ropeAttachedAt) > this.ropeMaxDuration;
            const wantsRelease = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                Phaser.Input.Keyboard.JustDown(this.keys.W) ||
                Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
                Phaser.Input.Keyboard.JustDown(this.cursors.left) ||
                Phaser.Input.Keyboard.JustDown(this.cursors.right) ||
                this.consumeVirtualPress('JUMP') ||
                this.consumeVirtualPress('LEFT') ||
                this.consumeVirtualPress('RIGHT');
            if (isTargetInvalid || isTimeout || wantsRelease) {
                this.releaseRope(!isTargetInvalid && wantsRelease);
                return;
            }
            let angle = Phaser.Math.Angle.BetweenPoints(this.ropeTarget, this.player);
            this.player.x = this.ropeTarget.x + Math.cos(angle + 0.05) * 250;
            this.player.y = this.ropeTarget.y + Math.sin(angle + 0.05) * 250;
            this.player.setVelocity(0,0);
            this.ropeLine.lineStyle(3, 0x8b4513, 1).beginPath().moveTo(this.ropeTarget.x, this.ropeTarget.y).lineTo(this.player.x, this.player.y).strokePath();
        }
    }

    /**
     * 로프 상태를 안전하게 해제합니다.
     * applyMomentum=true면 해제 순간의 진행 방향으로 약간의 속도를 줘 움직임이 끊기지 않게 합니다.
     */
    releaseRope(applyMomentum = false) {
        if (!this.isRoping) return;
        let vx = 0;
        let vy = 0;
        if (applyMomentum && this.ropeTarget) {
            const dx = this.player.x - this.ropeTarget.x;
            const dy = this.player.y - this.ropeTarget.y;
            const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
            // 접선 방향(원운동 기준)으로 관성 부여
            vx = (-dy / len) * 420;
            vy = (dx / len) * 420;
        }
        this.isRoping = false;
        this.ropeTarget = null;
        this.ropeAttachedAt = 0;
        this.player.body.setAllowGravity(true);
        if (applyMomentum) {
            this.player.setVelocity(vx, vy - 120);
        }
    }

    spawnEnemy() {
        if (this.isBossActive) return;
        if (this.enemies.countActive(true) >= this.performanceProfile.enemyCap) return;
        const x = this.player.x + 900;
        if (x > this.worldWidth - 400) return;
        const type = Phaser.Utils.Array.GetRandom(['runner', 'jumper', 'shooter']);
        const texture = Phaser.Utils.Array.GetRandom(['m1', 'm2']);
        const e = this.enemies.create(x, 400, texture);
        e.type = type; e.lastShot = 0; e.setTint(Phaser.Display.Color.RandomRGB().color);
        const stageBonus = this.stage >= 3 ? 130 : 0;
        const speed = -250 - (this.stage * 50) - stageBonus;
        e.setVelocityX(speed);
    }

    /**
     * 상공 구간(발판/사다리 활용 구간)에서 등장하는 비행 닌자 적을 생성합니다.
     */
    /**
     * 바닥 가시 장식을 **같은 땅 타일 위**에 올려, 지나가는 길에서 발판처럼 밟을 수 있게 둡니다.
     * (지면 상단 y=520에 맞추어 충돌체가 잡히도록 배치합니다.)
     */
    createGroundSpikes(groundWidth, groundSegments) {
        const groundSurfaceY = 560 - 40;
        const spikeHalfH = 13;
        const spikeCenterY = groundSurfaceY + spikeHalfH;
        for (let i = 14; i < groundSegments - 6; i++) {
            const x = (groundWidth / 2) + i * groundWidth;
            const isHole = i >= 12 && i % 13 === 0;
            const isWideStart = i >= 18 && i % 47 === 0;
            const isWideTail = i >= 19 && (i - 1) % 47 === 0;
            if (isHole || isWideStart || isWideTail) continue;
            if (Phaser.Math.Between(0, 10) < 4) {
                const spike = this.platforms.create(x, spikeCenterY, 'spike_strip');
                spike.setDepth(6);
                spike.refreshBody();
            }
        }
    }

    /**
     * 일정 간격으로 구역 이름 표지를 세워 진행 방향과 위험 요소를 상기시킵니다.
     */
    createRouteMilestones(groundWidth, groundSegments) {
        const labels = ['초원 전선', '깊은 협곡', '구름 상층', '전초 요새'];
        let li = 0;
        for (let i = 38; i < groundSegments; i += 44) {
            const wx = i * groundWidth + 140;
            const tag = labels[li % labels.length];
            li++;
            this.add.text(wx, 392, `[진행] ${tag}`, {
                fontSize: '17px',
                fill: '#e2e8f0',
                stroke: '#000',
                strokeThickness: 4
            }).setDepth(4).setAlpha(0.88);
            this.add.text(wx, 418, '구덩이 · 가시 지대(발판) · 상공 매복', {
                fontSize: '14px',
                fill: '#94a3b8',
                stroke: '#000',
                strokeThickness: 3
            }).setDepth(4).setAlpha(0.75);
        }
    }

    spawnSkyNinja() {
        if (this.isBossActive || this.isGameOver) return;
        if (this.player.y > 330) return; // 충분히 높이 올라갔을 때만 등장
        if (this.enemies.getChildren().filter((enemy) => enemy.active && enemy.type === 'skyNinja').length >= this.performanceProfile.skyEnemyCap) return;
        const spawnX = this.player.x + Phaser.Math.Between(520, 860);
        const spawnY = Phaser.Math.Between(120, 290);
        const skyNinja = this.enemies.create(spawnX, spawnY, 'sky_ninja').setDepth(17).setScale(1.25);
        skyNinja.type = 'skyNinja';
        skyNinja.lastShot = 0;
        skyNinja.body.setAllowGravity(false);
        skyNinja.setVelocityX(-220 - (this.stage * 20));
    }

    handleEnemyAI() {
        this.enemies.getChildren().forEach(e => {
            if (!e.active) return;
            if (e.x < this.player.x - 1400 || e.y > 980) {
                e.destroy();
                return;
            }
            if(e.type === 'jumper' && Math.abs(e.x - this.player.x) < 300 && e.body.touching.down) e.setVelocityY(-800);
            
            if(e.type === 'nightmareBoss') {
                const dist = e.x - this.player.x;
                const roomBounds = this.stage3RoomBounds || { minX: e.x - 400, maxX: e.x + 400 };
                e.y = e.baseY + Math.sin((this.time.now + e.x) / 180) * 18;

                if (e.hp < 260 && !e.enraged) {
                    e.enraged = true;
                    e.setTint(0xe11d48);
                    JuiceManager.shake(this, 0.03, 260);
                    this.showBossBanner('NIGHTMARE RAGE', '#fda4af');
                }

                if(this.time.now - e.lastTeleport > (e.enraged ? 1800 : 2400)) {
                    e.lastTeleport = this.time.now;
                    e.x = Phaser.Math.Between(roomBounds.minX + 260, roomBounds.maxX - 120);
                    JuiceManager.emitParticles(this, e.x, e.y, 'EXPLOSION', 0xfb7185);
                }

                if (dist > 520) e.setVelocityX(-220);
                else if (dist < 200) e.setVelocityX(260);
                else e.setVelocityX(0);

                if(this.time.now - e.lastShot > (e.enraged ? 700 : 960)) {
                    e.lastShot = this.time.now;
                    for (let i = -2; i <= 2; i++) {
                        const orb = this.bullets.create(e.x - 70, e.y - 30 + i * 38, 'enemy_bullet').setTint(0x9f1239).setScale(e.enraged ? 1.8 : 1.55);
                        orb.body.setAllowGravity(false);
                        this.physics.moveTo(orb, this.player.x, this.player.y + i * 24, e.enraged ? 620 : 540);
                    }
                }

                if(this.time.now - e.lastRing > (e.enraged ? 2100 : 2800)) {
                    e.lastRing = this.time.now;
                    for (let angle = 0; angle < 360; angle += 45) {
                        const ringOrb = this.bullets.create(e.x, e.y, 'enemy_bullet').setTint(0xfda4af).setScale(1.15);
                        ringOrb.body.setAllowGravity(false);
                        this.physics.velocityFromAngle(angle, e.enraged ? 340 : 280, ringOrb.body.velocity);
                    }
                }
            } else if(e.type === 'dragonBoss') {
                const dist = e.x - this.player.x;
                const roomBounds = this.dragonRoomBounds || { minX: e.x - 400, maxX: e.x + 400 };
                e.y = e.baseY + Math.sin((this.time.now + e.x) / 260) * 16;

                if (e.hp < 170 && !e.enraged) {
                    e.enraged = true;
                    e.setTint(0xea580c);
                    this.showBossBanner('DRAGON RAGE', '#fdba74');
                }

                if (dist > 480) e.setVelocityX(-170);
                else if (dist < 220) e.setVelocityX(220);
                else e.setVelocityX(0);

                if(this.time.now - e.lastShot > (e.enraged ? 900 : 1200)) {
                    e.lastShot = this.time.now;
                    for (let i = -1; i <= 1; i++) {
                        const fireball = this.bullets.create(e.x - 60, e.y - 10 + i * 58, 'enemy_bullet').setTint(0xff6b35).setScale(e.enraged ? 1.55 : 1.35);
                        fireball.body.setAllowGravity(false);
                        this.physics.moveTo(fireball, this.player.x, this.player.y + i * 34, e.enraged ? 560 : 470);
                    }
                }

                if(this.time.now - e.lastBreath > (e.enraged ? 1800 : 2500)) {
                    e.lastBreath = this.time.now;
                    for (let i = 0; i < 4; i++) {
                        const flame = this.bullets.create(e.x - 70, 470 - i * 46, 'enemy_bullet').setTint(0xfb923c).setScale(1.2 + i * 0.08);
                        flame.body.setAllowGravity(false);
                        flame.setVelocityX(-420 - i * 40);
                    }
                }

                if(this.time.now - e.lastRush > (e.enraged ? 2400 : 3400)) {
                    e.lastRush = this.time.now;
                    e.x = Phaser.Math.Clamp(this.player.x + 360, roomBounds.minX + 200, roomBounds.maxX);
                    e.setVelocityX(-420);
                }
            } else if(e.type === 'boss') {
                const dist = e.x - this.player.x;

                if (e.hp < 90 && !e.enraged) {
                    e.enraged = true;
                    e.setTint(0xdc2626);
                    e.setScale(1.85);
                    this.showBossBanner('COMMANDER RAGE', '#fca5a5');
                }

                if (dist > 360) e.setVelocityX(-190);
                else if (dist < 180) e.setVelocityX(230);
                else e.setVelocityX(0);

                if(this.time.now - e.lastShot > (e.enraged ? 900 : 1300)) {
                    e.lastShot = this.time.now;
                    for(let i = -2; i <= 2; i++) {
                        const b = this.bullets.create(e.x, e.y - 10, 'enemy_bullet').setTint(0xf87171).setScale(0.95 + Math.abs(i) * 0.08);
                        b.body.setAllowGravity(false);
                        this.physics.moveTo(b, this.player.x, this.player.y + i * 40, e.enraged ? 480 : 400);
                    }
                }

                if(this.time.now - e.lastDash > (e.enraged ? 1300 : 1800)) {
                    e.lastDash = this.time.now;
                    e.setVelocityX(this.player.x < e.x ? -640 : 640);
                }

                if(this.time.now - e.lastShockwave > (e.enraged ? 1700 : 2400)) {
                    e.lastShockwave = this.time.now;
                    for (let i = 0; i < 2; i++) {
                        const wave = this.bullets.create(e.x + (i === 0 ? -12 : 12), 495, 'enemy_bullet').setTint(0xfca5a5).setScale(1.2);
                        wave.body.setAllowGravity(false);
                        wave.setVelocityX(i === 0 ? -360 : 360);
                    }
                }
            } else if(e.type === 'skyNinja') {
                // 공중 닌자: 상단에서 좌우 비행하며 쿠나이 탄을 발사
                if (e.x < this.player.x - 420) e.setVelocityX(240);
                if (e.x > this.player.x + 520) e.setVelocityX(-240);
                e.y += Math.sin((this.time.now + e.x) / 180) * 1.2;
                e.flipX = e.body.velocity.x > 0;

                if (this.time.now - e.lastShot > 1600) {
                    e.lastShot = this.time.now;
                    const shot = this.bullets.create(e.x, e.y + 8, 'enemy_bullet').setTint(0x38bdf8).setScale(1.1);
                    shot.body.setAllowGravity(false);
                    this.physics.moveTo(shot, this.player.x, this.player.y, 460);
                }
            } else if(e.type === 'shooter') {
                if(this.time.now - e.lastShot > 2500) {
                    e.lastShot = this.time.now;
                    const b = this.bullets.create(e.x, e.y, 'enemy_bullet');
                    b.body.setAllowGravity(false);
                    this.physics.moveToObject(b, this.player, 400);
                }
            }
        });
    }

    handleDamage(p, e) {
        if (this.isGameOver) return;
        if (this.roomTransitionLocked || this.time.now < this.protectedUntil) return;
        const isAbyssDeath = e.type === 'abyss';

        if (isAbyssDeath) {
            this.hp = 0;
        } else if (e.type === 'dragonBoss') {
            this.hp -= 14;
            p.setVelocityX(p.x < e.x ? -1200 : 1200);
        } else if (e.type === 'nightmareBoss') {
            this.hp -= 16;
            p.setVelocityX(p.x < e.x ? -1300 : 1300);
        } else if (e.type === 'boss') {
            this.hp -= 10;
            p.setVelocityX(p.x < e.x ? -1000 : 1000);
        } else {
            this.hp -= 10;
            e.destroy();
        }
        JuiceManager.shake(this);

        if (this.hp <= 0) {
            this.isGameOver = true;
            this.player.setVisible(false);
            
            // Drop Scratched Headband (V9.2)
            const h = this.physics.add.sprite(this.player.x, this.player.y, 'headband').setScale(2).setDepth(30);
            h.setVelocity(Phaser.Math.Between(-200, 200), -600);
            h.setBounce(0.5);
            h.setCollideWorldBounds(true);
            h.setDragX(100);
            this.physics.add.collider(h, this.platforms);

            this.lives = Math.max(0, this.lives - 1);
            this.updateLivesUI();

            const gameOverText = this.add.text(400, 220, '게임 오버', {
                fontSize: '64px',
                fill: '#ef4444',
                fontStyle: 'bold',
                stroke: '#000',
                strokeThickness: 8
            }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);

            if (this.lives > 0) {
                const restartText = this.add.text(400, 290, '처음부터 다시 시작합니다', {
                    fontSize: '28px',
                    fill: '#ffffff',
                    stroke: '#000',
                    strokeThickness: 5
                }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);

                const deathVoice = isAbyssDeath
                    ? "으악! 구덩이에 빠졌습니다. 하트가 하나 줄어들고 다시 시작합니다."
                    : "게임 오버. 하트가 하나 줄어들고 다시 시작합니다.";
                NinjaVoiceManager.speak(deathVoice, 500);
                this.time.delayedCall(1800, () => {
                    gameOverText.destroy();
                    restartText.destroy();
                    this.scene.start('GameScene', { char: this.charData, lives: this.lives });
                });
            } else {
                const titleText = this.add.text(400, 290, '하트가 모두 소진되어 메인 화면으로 이동합니다', {
                    fontSize: '24px',
                    fill: '#ffffff',
                    stroke: '#000',
                    strokeThickness: 5
                }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);

                NinjaVoiceManager.speak('게임 오버. 하트가 모두 소진되어 메인 화면으로 이동합니다.', 500);
                this.time.delayedCall(2200, () => {
                    NinjaBgmManager.stop();
                    gameOverText.destroy();
                    titleText.destroy();
                    this.scene.start('TitleScene');
                });
            }
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#020617',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    render: {
        pixelArt: true,
        antialias: false
    },
    physics: { default: 'arcade', arcade: { gravity: { y: 2400 } } },
    scene: [PreloadScene, TitleScene, SelectScene, StoryScene, GameScene]
};
new Phaser.Game(config);
