/**
 * Nh Ninja "Uchiha's Awakening" Edition (V9.3)
 * Score-based Stages | Boss Fight | Weather Effects | Advanced AI
 */

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
        const particles = scene.add.particles(0, 0, 'pixel', {
            speed: { min: 50, max: 200 }, scale: { start: 0.8, end: 0 }, lifespan: 400, gravityY: 300,
            quantity: type === 'EXPLOSION' ? 30 : 5, tint: color || 0xffffff
        });
        particles.emitParticleAt(x, y);
        scene.time.delayedCall(500, () => particles.destroy());
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

        const mg = scene.make.graphics({add: false});
        mg.fillStyle(0x7b92a6, 1).fillPoints([{x:0,y:400}, {x:200,y:100}, {x:400,y:300}, {x:600,y:50}, {x:800,y:400}], true).generateTexture('bg_mountains', 800, 400);
    }
}

class PreloadScene extends Phaser.Scene {
    constructor() { super('PreloadScene'); }
    preload() {
        // 사쿠라 힐링 연출 이미지
        this.load.image('sakura_heal_img', '/src/assets/사쿠라힐링.png');
        this.load.on('complete', () => { TextureGenerator.generate(this); this.scene.start('TitleScene'); });
    }
}

class TitleScene extends Phaser.Scene {
    constructor() { super('TitleScene'); }
    create() {
        NinjaBgmManager.startMenu();
        this.add.graphics().fillGradientStyle(0x1e293b, 0x1e293b, 0x0f172a, 0x0f172a, 1).fillRect(0, 0, 800, 600);
        
        // Mangekyou Sharingan Intro (V9.3)
        const eye = this.add.image(400, 300, 'sharingan').setScale(0.1).setAlpha(0);
        this.tweens.add({
            targets: eye, scale: 1.5, alpha: 0.6, angle: 720, duration: 1500, ease: 'Cubic.out',
            onComplete: () => this.tweens.add({ targets: eye, alpha: 0.2, duration: 1000 })
        });

        this.add.text(400, 200, 'NH NINJA V9.3', { fontSize: '80px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(400, 280, 'UCHIHA\'S AWAKENING', { fontSize: '24px', fill: '#ef4444' }).setOrigin(0.5);
        const btn = this.add.text(400, 420, 'START MISSION', { fontSize: '32px', backgroundColor: '#ef4444', fill: '#fff', padding: 20 }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        btn.on('pointerdown', () => this.scene.start('SelectScene'));
    }
}

class SelectScene extends Phaser.Scene {
    constructor() { super('SelectScene'); }
    create() {
        NinjaBgmManager.startMenu();
        this.add.graphics().fillGradientStyle(0x1e293b, 0x1e293b, 0x0f172a, 0x0f172a, 1).fillRect(0, 0, 800, 600);
        this.add.text(400, 80, 'CHOOSE YOUR NINJA', { fontSize: '48px', fontStyle: 'bold', fill: '#fff' }).setOrigin(0.5);
        const chars = [{id:'n', name:'NARUTO'}, {id:'s', name:'SASUKE'}, {id:'sa', name:'SAKURA'}, {id:'k', name:'KAKASHI'}];
        this.selectedIdx = 0;
        this.selectChars = chars;
        this.selectSprites = [];
        this.selectLabels = [];
        chars.forEach((c, i) => {
            const x = 120 + i*185;
            const img = this.add.image(x, 300, `${c.id}_idle`).setScale(3).setInteractive({ useHandCursor: true });
            img.on('pointerdown', () => {
                this.selectedIdx = i;
                this.updateSelectionUI();
                this.scene.start('StoryScene', { char: c });
            });
            const label = this.add.text(x, 420, c.name, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
            this.selectSprites.push(img);
            this.selectLabels.push(label);
        });

        this.selectHint = this.add.text(400, 500, '←/→ 로 선택 · Enter로 시작', {
            fontSize: '22px',
            fill: '#cbd5e1'
        }).setOrigin(0.5);
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
        this.add.rectangle(0, 0, w, h, 0x000000).setOrigin(0);
        this.add.image(100, h/2 - 50, `${this.charData.id}_idle`).setScale(4);
        const box = this.add.rectangle(400, 500, 760, 160, 0x111111, 0.9).setStrokeStyle(4, 0xffffff);
        this.nameText = this.add.text(40, 430, '', { fontSize: '28px', fontStyle: 'bold', fill: '#ff0' });
        this.dialogueText = this.add.text(40, 470, '', { fontSize: '24px', fill: '#fff', wordWrap: { width: 720 } });
        this.dialogues = [
            { name: "HOKAGE", text: "탈주 닌자들이 1,000점 거점까지 점령했다. 중간 보스를 격파하고 밤의 국경을 넘어야 한다." },
            { name: this.charData.name, text: "제 이름에 걸린 긍지를 걸고 반드시 완수하겠습니다!" },
            { name: "SYSTEM", text: "(미션: 800~900점 사이 등장하는 보스를 격파하고 스테이지 2로 진입하십시오.)" }
        ];
        this.currentLine = 0; this.input.on('pointerdown', () => this.next()); this.next();
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
        this.charData = data.char; this.hp = 100; this.score = 0; this.dist = 0; this.stage = 1;
        this.isGameOver = false; this.skillCooldown = 0;
        this.cloneCooldown = 0;
        this.isRoping = false; this.ropeTarget = null;
        this.isBossActive = false; this.bossTriggerScore = Phaser.Math.Between(800, 900);
        this.isPausedForStory = false;
        this.stage2ClearScore = 2000;
        this.stage2StartedAt = null;
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
        this.touchControlsContainer = null;
        this.isTouchUIEnabled = false;
        this.activeHealFx = null;
        // 목숨(하트) 상태: 기본 2개, 사망 시 1개씩 차감
        this.lives = typeof data.lives === 'number' ? data.lives : 2;
    }

    create() {
        const worldWidth = 100000;
        // 낙사 판정을 위해 월드 하단을 넉넉히 열어둡니다.
        // (기존 600 높이에서는 바닥 경계에 막혀 y>600 조건이 잘 발생하지 않았음)
        this.physics.world.setBounds(0, 0, worldWidth, 2200);
        this.cameras.main.setBounds(0, 0, worldWidth, 600);
        this.bgRect = this.add.graphics().setScrollFactor(0).fillGradientStyle(0x0f172a, 0x0f172a, 0x334155, 0x334155, 1).fillRect(0, 0, 800, 600);
        this.bgMountains = this.add.tileSprite(0, 200, 800, 400, 'bg_mountains').setOrigin(0).setScrollFactor(0);
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

        // 초반 구간은 안전 지대로 두고, 중간부터 규칙적으로 구멍을 배치합니다.
        // 플레이어가 구멍으로 떨어지면 기존 y>600 낙사 판정으로 게임이 종료됩니다.
        this.abyssZones = [];
        for (let i = 0; i < groundSegments; i++) {
            const x = (groundWidth / 2) + i * groundWidth;
            const isSafeIntro = i < 8;
            const isHole = !isSafeIntro && i % 11 === 0;
            if (isHole) {
                this.abyssZones.push({ startX: i * groundWidth, width: groundWidth });
                continue;
            }
            this.platforms.create(x, 560, groundTextureKey).refreshBody();
        }

        // 구멍 위치가 눈에 보이도록 어두운 심연 레이어를 그려줍니다.
        this.abyssZones.forEach((zone) => {
            this.add.rectangle(zone.startX + (zone.width / 2), 585, zone.width, 120, 0x020617, 0.9).setDepth(0);
        });

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

        for(let i=0; i<400; i++) {
            this.anchors.create(1000 + i*400, 150, 'rope_anchor');
            this.clouds.create(800 + i*350, 400 - (i%4)*80, 'cloud_plat').refreshBody();
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
        this.physics.add.overlap(this.shadowClones, this.enemies, this.handleCloneHitEnemy, null, this);
        this.physics.add.overlap(this.susanooAvatars, this.enemies, this.handleSusanooHitEnemy, null, this);
        this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
            if (bullet.type !== 'playerLightning') return;
            if (enemy.type === 'boss' || enemy.type === 'dragonBoss' || enemy.type === 'nightmareBoss') enemy.hp -= 16;
            else {
                enemy.destroy();
                this.score += 110;
            }
            JuiceManager.emitParticles(this, enemy.x, enemy.y, 'EXPLOSION', 0x60a5fa);
            bullet.destroy();
        }, null, this);
        
        this.physics.add.overlap(this.kunais, this.enemies, (k, e) => {
            if (e.type === 'boss' || e.type === 'dragonBoss' || e.type === 'nightmareBoss') {
                const damage = e.type === 'nightmareBoss' ? 6 : (e.type === 'dragonBoss' ? 8 : 10);
                e.hp -= damage;
                k.destroy();
                JuiceManager.shake(this, 0.01, 100);
                JuiceManager.emitParticles(this, e.x, e.y, 'EXPLOSION', 0xff0000);
                if (e.hp <= 0) {
                    if (e.type === 'dragonBoss') {
                        this.score += 1000;
                        e.destroy();
                        this.handleDragonDefeat();
                    } else if (e.type === 'nightmareBoss') {
                        this.score += 1800;
                        e.destroy();
                        this.nightmareDefeated = true;
                        this.isBossActive = false;
                    } else {
                        // 점수는 누적으로 증가해야 하므로 고정 대입 대신 누적합니다.
                        this.score += 1000;
                        e.destroy();
                        this.isBossActive = false;
                        this.transitionToStage2();
                    }
                }
            } else {
                e.destroy(); k.destroy(); this.score += 100; JuiceManager.emitParticles(this, e.x, e.y, 'EXPLOSION');
            }
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,Q,E,R,SPACE');
        this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.ropeLine = this.add.graphics().setDepth(5);

        this.ui = this.add.container(0, 0).setScrollFactor(0).setDepth(2000);
        this.scoreText = this.add.text(20, 20, 'SCORE: 0 | STAGE 1', { fontSize: '28px', fill: '#fff', fontStyle: 'bold' });
        this.hpBar = this.add.graphics();
        this.skillCdText = this.add.text(780, 20, '', { fontSize: '24px', fill: '#ff0' }).setOrigin(1, 0);
        this.cloneCdText = this.add.text(780, 50, '', { fontSize: '20px', fill: '#93c5fd' }).setOrigin(1, 0);
        this.livesText = this.add.text(20, 86, '', { fontSize: '24px', fill: '#ff8fab', fontStyle: 'bold' });
        this.doorHintText = this.add.text(400, 540, '문 앞에서 ↑키를 누르면 입장', {
            fontSize: '22px', fill: '#f8fafc', stroke: '#000', strokeThickness: 5
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2100).setVisible(false);
        this.ui.add([this.scoreText, this.hpBar, this.skillCdText, this.cloneCdText]);
        this.ui.add(this.livesText);
        this.ui.add(this.doorHintText);
        this.updateLivesUI();
        this.createExitPromptUI();
        this.createTouchControls();

        this.enemySpawnTimer = this.time.addEvent({ delay: 2000, callback: this.spawnEnemy, callbackScope: this, loop: true });
        this.skyEnemySpawnTimer = this.time.addEvent({ delay: 1700, callback: this.spawnSkyNinja, callbackScope: this, loop: true });
        this.spawnHearts();

        // 게임 씬 진입 시 닌자풍 배경음악을 시작합니다.
        NinjaBgmManager.start();
    }

    /**
     * 모바일 터치 조작용 Q/W/E/A/S/D 버튼을 생성합니다.
     */
    createTouchControls() {
        const isCoarsePointer = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        const hasTouch = this.sys.game.device.input.touch || isCoarsePointer;
        this.isTouchUIEnabled = !!hasTouch;
        if (!this.isTouchUIEnabled) return;
        this.input.addPointer(4);

        this.touchControlsContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(4500);
        const defs = [
            { key: 'Q', x: 650, y: 500, color: 0x6366f1 },
            { key: 'W', x: 720, y: 455, color: 0x06b6d4 },
            { key: 'E', x: 790, y: 500, color: 0x8b5cf6 },
            { key: 'A', x: 60, y: 500, color: 0x2563eb },
            { key: 'S', x: 130, y: 555, color: 0x14b8a6 },
            { key: 'D', x: 200, y: 500, color: 0x2563eb },
        ];

        defs.forEach((def) => {
            const circle = this.add.circle(def.x, def.y, 30, def.color, 0.7).setStrokeStyle(3, 0xe2e8f0, 0.8);
            const label = this.add.text(def.x, def.y, def.key, {
                fontSize: '26px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            const hit = this.add.zone(def.x, def.y, 70, 70).setInteractive({ useHandCursor: true });
            hit.on('pointerdown', () => this.setVirtualKey(def.key, true));
            hit.on('pointerup', () => this.setVirtualKey(def.key, false));
            hit.on('pointerout', () => this.setVirtualKey(def.key, false));
            hit.on('pointerupoutside', () => this.setVirtualKey(def.key, false));
            this.touchControlsContainer.add([circle, label, hit]);
        });

        // 앱 전환/포커스 이탈 시 가상키가 눌린 상태로 남지 않도록 초기화
        this.input.on('gameout', () => {
            this.virtualHeld = {};
            this.virtualPressed = {};
        });
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
        for (let i = 0; i < 120; i++) {
            const heart = this.hearts.create(1200 + i * 800, 220 + (i % 3) * 70, 'heart_item').setDepth(15);
            heart.setCircle(8, 0, 0);
            heart.setScale(1.7);
            this.tweens.add({
                targets: heart,
                y: heart.y - 12,
                duration: 700,
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

        // Fall to Death (V9.2.1)
        if (this.player.y > 600) {
            this.handleDamage(this.player, { type: 'abyss' });
            return;
        }
        
        this.scoreText.setText(`SCORE: ${this.score} | STAGE ${this.stage}`);
        this.bgMountains.tilePositionX = this.cameras.main.scrollX * 0.1;
        this.updateSkyAtmosphere();

        if (this.score >= this.bossTriggerScore && !this.isBossActive && this.stage === 1) {
            this.triggerBossFight();
        }

        // 스테이지2는 성문 입장 후 용 보스를 쓰러뜨리면 클리어 처리합니다.
        if (this.stage === 2 && this.dragonDefeated && !this.isStageClear) {
            this.handleStage2Clear();
            return;
        }
        if (this.stage === 3 && this.nightmareDefeated && !this.isStageClear) {
            this.handleStage3Clear();
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

        this.updateHPBar();
        this.tryEnterCastleDoor();
        this.tryEnterStage3Portal();
        this.handleMovement();
        this.handleRope();
        this.handleEnemyAI();
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

    triggerBossFight() {
        this.isBossActive = true;
        this.enemySpawnTimer.remove(); // Stop normal spawns
        
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("경고! 보스가 나타났습니다. 준비하세요!"));

        const boss = this.enemies.create(this.player.x + 600, 400, 'm2').setScale(3.5).setTint(0xff0000);
        boss.type = 'boss';
        boss.hp = 130;
        boss.maxHp = 130;
        boss.lastShot = 0;
        this.boss = boss;

        const bossText = this.add.text(400, 100, 'BOSS BATTLE', { fontSize: '64px', fill: '#f00', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0);
        this.tweens.add({ targets: bossText, alpha: 0, duration: 2000, onComplete: () => bossText.destroy() });
    }

    transitionToStage2() {
        this.stage = 2;
        this.stage2StartedAt = this.time.now;
        this.cameras.main.flash(1000, 255, 255, 255);
        JuiceManager.shake(this, 0.05, 500);

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("스테이지 1 클리어! 폭풍의 밤으로 진입합니다."));

        // Change Theme to Stormy Night
        this.bgMountains.setTint(0x4b0082);
        this.bgRect.clear();
        this.bgRect.fillGradientStyle(0x1e1b4b, 0x1e1b4b, 0x000000, 0x000000, 1).fillRect(0, 0, 800, 600);

        // Resume spawning with increased difficulty
        this.enemySpawnTimer = this.time.addEvent({ delay: 1500, callback: this.spawnEnemy, callbackScope: this, loop: true });

        // Add Lightning Effect
        this.time.addEvent({ delay: 5000, callback: this.flashLightning, callbackScope: this, loop: true });

        // 스테이지2 진입 시 5층 성 1층 방문을 생성합니다.
        this.createCastleDoor();
    }

    /**
     * 스테이지2의 성(5층) 1층 방문을 생성합니다.
     */
    createCastleDoor() {
        const doorX = this.player.x + 2200;
        const doorY = 438;
        const castle = this.add.container(doorX, doorY).setDepth(12);
        const wallColor = 0x64748b;
        const lineColor = 0x1e293b;

        // 성 본체
        castle.add(this.add.rectangle(0, 0, 300, 260, wallColor, 0.95).setStrokeStyle(6, lineColor));
        // 5층 느낌을 내는 층 구분선
        for (let i = 1; i <= 4; i++) {
            castle.add(this.add.rectangle(0, -130 + i * 52, 300, 4, lineColor, 0.9));
        }
        // 좌우 탑 구조
        castle.add(this.add.rectangle(-120, -80, 60, 120, wallColor, 0.95).setStrokeStyle(5, lineColor));
        castle.add(this.add.rectangle(120, -80, 60, 120, wallColor, 0.95).setStrokeStyle(5, lineColor));
        // 1층 성문
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
        if (this.stage !== 2 || !this.castleDoor || this.inDragonRoom || this.dragonDefeated) {
            this.doorHintText.setVisible(false);
            return;
        }

        const isNearX = Math.abs(this.player.x - this.castleDoor.x) < 110;
        const isNearY = Math.abs(this.player.y - this.castleDoor.y) < 150;
        const isNearDoor = isNearX && isNearY;
        this.doorHintText.setVisible(isNearDoor);

        if (isNearDoor && (Phaser.Input.Keyboard.JustDown(this.cursors.up) || this.consumeVirtualPress('W'))) {
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

        const roomStartX = 93000;
        const roomWidth = 1400;
        this.cameras.main.setBounds(roomStartX, 0, roomWidth, 600);
        this.player.setPosition(roomStartX + 220, 420);
        this.player.setVelocity(0, 0);

        // 보스룸 배경/바닥 생성
        for (let i = 0; i < 7; i++) {
            this.platforms.create(roomStartX + 110 + i * 220, 560, 'ground_segment').refreshBody();
        }
        this.add.rectangle(roomStartX + (roomWidth / 2), 300, roomWidth, 600, 0x0b1020, 0.45).setDepth(1);
        this.add.text(roomStartX + (roomWidth / 2), 100, 'DRAGON ROOM', {
            fontSize: '52px', fill: '#f97316', fontStyle: 'bold', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(20);

        const dragon = this.enemies.create(roomStartX + 1040, 360, 'dragon_boss').setScale(2.7).setDepth(18).setTint(0xff6b35);
        dragon.type = 'dragonBoss';
        dragon.hp = 300;
        dragon.maxHp = 300;
        dragon.lastShot = 0;
        this.boss = dragon;
        this.isBossActive = true;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("성문이 열렸습니다! 거대 용이 깨어났습니다."));
    }

    /**
     * 용 보스 처치 후 스테이지2 클리어 가능 상태로 전환합니다.
     */
    handleDragonDefeat() {
        this.dragonDefeated = true;
        this.isBossActive = false;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("거대 용 격파! 미션 완료."));
    }

    handleStage2Clear() {
        if (this.isStageClear) return;
        this.isStageClear = true;
        this.isPausedForStory = true;
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        this.enemies.clear(true, true);
        this.bullets.clear(true, true);

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("미션 완료."));

        const clearText = this.add.text(400, 240, 'STAGE 2 CLEAR', {
            fontSize: '56px',
            fill: '#22c55e',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);

        const subText = this.add.text(400, 310, '스테이지 3으로 이동합니다', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);

        this.tweens.add({
            targets: [clearText, subText],
            alpha: { from: 0, to: 1 },
            duration: 300,
            yoyo: false
        });

        this.time.delayedCall(2600, () => {
            clearText.destroy();
            subText.destroy();
            this.startStage3();
        });
    }

    /**
     * 스테이지3 시작: 1/2 스테이지 모티브를 섞은 랜덤 포털 구역
     */
    startStage3() {
        this.stage = 3;
        this.isStageClear = false;
        this.isPausedForStory = false;
        this.isBossActive = false;
        this.nightmareDefeated = false;
        this.isInStage3Room = false;
        this.stage3Portals = [];
        this.enemies.clear(true, true);
        this.bullets.clear(true, true);
        this.player.setPosition(this.player.x + 900, 420);
        this.player.setVelocity(0, 0);
        this.bgMountains.setTint(0x1f2937);
        this.bgRect.clear();
        this.bgRect.fillGradientStyle(0x0f172a, 0x111827, 0x000000, 0x020617, 1).fillRect(0, 0, 800, 600);

        const randomRooms = Phaser.Utils.Array.Shuffle(['stage1_motif', 'stage2_castle', 'prison']);
        randomRooms.forEach((roomType, idx) => {
            const px = this.player.x + 650 + idx * 520;
            const base = this.add.rectangle(px, 455, 180, 210, 0x0f172a, 0.9).setStrokeStyle(5, 0x64748b).setDepth(14);
            const gate = this.add.rectangle(px, 500, 88, 120, 0x1e293b, 1).setStrokeStyle(4, 0x94a3b8).setDepth(15);
            const labelMap = {
                stage1_motif: '폐허 전장',
                stage2_castle: '붉은 성채',
                prison: '심연 감옥'
            };
            const label = this.add.text(px, 405, labelMap[roomType], {
                fontSize: '21px',
                fill: '#f8fafc',
                stroke: '#000',
                strokeThickness: 4
            }).setOrigin(0.5).setDepth(16);
            this.stage3Portals.push({ x: px, y: 500, roomType, visuals: [base, gate, label] });
        });

        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        this.enemySpawnTimer = this.time.addEvent({ delay: 1100, callback: this.spawnEnemy, callbackScope: this, loop: true });
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("스테이지 3 시작! 포털이 무작위로 열립니다."));
    }

    /**
     * 스테이지3 포털 앞에서 위 키를 누르면 랜덤 방으로 입장
     */
    tryEnterStage3Portal() {
        if (this.stage !== 3 || this.isInStage3Room || this.nightmareDefeated) return;
        let nearPortal = null;
        this.stage3Portals.forEach((portal) => {
            if (Math.abs(this.player.x - portal.x) < 110 && Math.abs(this.player.y - portal.y) < 150) nearPortal = portal;
        });
        this.doorHintText.setVisible(!!nearPortal);
        this.doorHintText.setText(nearPortal ? '포털 앞에서 ↑키를 누르면 입장' : '문 앞에서 ↑키를 누르면 입장');
        if (nearPortal && (Phaser.Input.Keyboard.JustDown(this.cursors.up) || this.consumeVirtualPress('W'))) {
            this.enterStage3Room(nearPortal.roomType);
        }
    }

    /**
     * 스테이지3 방 입장: 더 무서운 최종 보스 소환
     */
    enterStage3Room(roomType) {
        this.isInStage3Room = true;
        this.isBossActive = true;
        this.enemies.clear(true, true);
        this.bullets.clear(true, true);
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();

        const roomStartX = 96500;
        const roomWidth = 1600;
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

        const nightmare = this.enemies.create(roomStartX + 1180, 340, 'nightmare_boss').setScale(2.9).setDepth(18).setTint(0x7f1d1d);
        nightmare.type = 'nightmareBoss';
        nightmare.hp = 460;
        nightmare.maxHp = 460;
        nightmare.lastShot = 0;
        this.boss = nightmare;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("경고! 악몽의 보스가 등장했습니다."));
    }

    handleStage3Clear() {
        if (this.isStageClear) return;
        this.isStageClear = true;
        this.isPausedForStory = true;
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        this.enemies.clear(true, true);
        this.bullets.clear(true, true);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("미션 완료! 스테이지 3까지 돌파했습니다."));

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
    }

    updateHPBar() {
        this.hpBar.clear();
        this.hpBar.fillStyle(0x000000, 0.5).fillRect(20, 60, 200, 15);
        this.hpBar.fillStyle(this.hp > 30 ? 0x2ecc71 : 0xe74c3c).fillRect(20, 60, this.hp * 2, 15);
        
        if (this.isBossActive && this.boss && this.boss.active) {
            this.hpBar.fillStyle(0x000000, 0.5).fillRect(20, 80, 200, 10);
            const bossMaxHp = this.boss.maxHp || 100;
            this.hpBar.fillStyle(0xff0000).fillRect(20, 80, (this.boss.hp / bossMaxHp) * 200, 10);
        }
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
        const leftDown = this.cursors.left.isDown || this.keys.A.isDown || !!this.virtualHeld.A;
        const rightDown = this.cursors.right.isDown || this.keys.D.isDown || !!this.virtualHeld.D;
        if (leftDown) { this.player.setVelocityX(-speed); this.player.flipX = true; }
        else if (rightDown) { this.player.setVelocityX(speed); this.player.flipX = false; }
        else this.player.setVelocityX(0);

        const isJumpDown = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                           Phaser.Input.Keyboard.JustDown(this.keys.W) || 
                           Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
                           this.consumeVirtualPress('W');

        if (isJumpDown && this.player.body.touching.down) this.player.setVelocityY(-950);
        if (Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.keys.S) || this.consumeVirtualPress('S')) this.fireKunai();
        if ((Phaser.Input.Keyboard.JustDown(this.keys.E) || this.consumeVirtualPress('E')) && this.cloneCooldown <= 0) this.useCharacterETechnique();
        if ((Phaser.Input.Keyboard.JustDown(this.keys.Q) || this.consumeVirtualPress('Q')) && this.skillCooldown <= 0) this.useSkill();
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
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("그림자 분신술!"));
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
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("뇌절!"));
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
                        JuiceManager.emitParticles(this, enemy.x, enemy.y, 'EXPLOSION', 0xa855f7);
                        if (enemy.type === 'boss' || enemy.type === 'dragonBoss' || enemy.type === 'nightmareBoss') {
                            enemy.hp -= 10;
                        } else {
                            enemy.destroy();
                            this.score += 120;
                        }
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

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("스사노오!"));
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
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("힐링!"));
    }

    /**
     * 분신이 적과 닿으면 적에게 피해를 줍니다.
     */
    handleCloneHitEnemy(clone, enemy) {
        if (!clone?.active || !enemy?.active) return;
        if (enemy.type === 'boss' || enemy.type === 'dragonBoss' || enemy.type === 'nightmareBoss') {
            enemy.hp -= 12;
        } else {
            enemy.destroy();
            this.score += 80;
        }
        JuiceManager.emitParticles(this, enemy.x, enemy.y, 'EXPLOSION', 0xdbeafe);
        clone.destroy();
    }

    /**
     * 스사노오 본체 충돌 피해 처리
     */
    handleSusanooHitEnemy(susanoo, enemy) {
        if (!susanoo?.active || !enemy?.active) return;
        if (enemy.type === 'boss' || enemy.type === 'dragonBoss' || enemy.type === 'nightmareBoss') enemy.hp -= 4;
        else {
            enemy.destroy();
            this.score += 60;
        }
        JuiceManager.emitParticles(this, enemy.x, enemy.y, 'EXPLOSION', 0xc084fc);
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
                    JuiceManager.emitParticles(this, e.x, e.y, 'EXPLOSION', 0x000000); // Amaterasu Black Flame
                    if (e.type === 'boss' || e.type === 'dragonBoss' || e.type === 'nightmareBoss') e.hp -= 40; else { e.destroy(); this.score += 150; }
                }
            });
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(new SpeechSynthesisUtterance("만화경 사륜안, 환술의 세계로."));
        } else if (this.charData.id === 'n') {
            // Naruto: Rasengan (V9.2)
            const r = this.physics.add.sprite(this.player.x, this.player.y, 'rasengan').setScale(1.5).setDepth(20);
            r.body.setAllowGravity(false);
            r.setVelocityX(this.player.flipX ? -1500 : 1500);
            this.tweens.add({ targets: r, angle: 360, duration: 500, loop: -1 });
            
            this.physics.add.overlap(r, this.enemies, (ras, e) => {
                JuiceManager.emitParticles(this, e.x, e.y, 'EXPLOSION', 0x3b82f6);
                if (e.type === 'boss' || e.type === 'dragonBoss' || e.type === 'nightmareBoss') {
                    e.hp -= 5; // Multi-hit potential
                } else {
                    e.destroy();
                    this.score += 100;
                }
            });
            this.time.delayedCall(1000, () => r.destroy());
        } else {
            const color = this.charData.id === 'sa' ? 0xf472b6 : 0x2ecc71;
            let ring = this.add.circle(this.player.x, this.player.y, 10, color, 0.3).setStrokeStyle(3, 0xffffff);
            this.tweens.add({ targets: ring, radius: 450, alpha: 0, duration: 600, onComplete: () => ring.destroy() });
            this.enemies.getChildren().forEach(e => {
                if(Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y) < 450) {
                    JuiceManager.emitParticles(this, e.x, e.y, 'EXPLOSION', color);
                    if (e.type === 'boss' || e.type === 'dragonBoss' || e.type === 'nightmareBoss') e.hp -= 20; else e.destroy();
                }
            });
        }
    }

    handleRope() {
        this.ropeLine.clear();
        // E 키는 그림자분신술로 재할당되어, 밧줄은 R 키로 사용합니다.
        if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
            if (this.isRoping) { this.isRoping = false; this.player.body.setAllowGravity(true); }
            else {
                let near = Phaser.Actions.GetClosest(this.player, this.anchors.getChildren());
                if (near && Phaser.Math.Distance.BetweenPoints(this.player, near) < 400) {
                    this.isRoping = true; this.ropeTarget = near; this.player.body.setAllowGravity(false);
                }
            }
        }
        if (this.isRoping) {
            let angle = Phaser.Math.Angle.BetweenPoints(this.ropeTarget, this.player);
            this.player.x = this.ropeTarget.x + Math.cos(angle + 0.05) * 250;
            this.player.y = this.ropeTarget.y + Math.sin(angle + 0.05) * 250;
            this.player.setVelocity(0,0);
            this.ropeLine.lineStyle(3, 0x8b4513, 1).beginPath().moveTo(this.ropeTarget.x, this.ropeTarget.y).lineTo(this.player.x, this.player.y).strokePath();
        }
    }

    spawnEnemy() {
        if (this.isBossActive) return;
        const x = this.player.x + 900;
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
    spawnSkyNinja() {
        if (this.isBossActive || this.isGameOver) return;
        if (this.player.y > 330) return; // 충분히 높이 올라갔을 때만 등장
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
            if(e.type === 'jumper' && Math.abs(e.x - this.player.x) < 300 && e.body.touching.down) e.setVelocityY(-800);
            
            if(e.type === 'nightmareBoss') {
                // 최종 보스: 빠른 이동 + 확산 탄막
                const dist = e.x - this.player.x;
                if (dist > 560) e.setVelocityX(-260);
                else if (dist < 240) e.setVelocityX(320);
                else e.setVelocityX(0);

                if(this.time.now - e.lastShot > 900) {
                    e.lastShot = this.time.now;
                    for (let i = -2; i <= 2; i++) {
                        const orb = this.bullets.create(e.x - 70, e.y - 40 + i * 45, 'enemy_bullet').setTint(0x7f1d1d).setScale(1.7);
                        orb.body.setAllowGravity(false);
                        this.physics.moveTo(orb, this.player.x, this.player.y + i * 26, 560);
                    }
                }
            } else if(e.type === 'dragonBoss') {
                // 용 보스는 중거리 간격을 유지하며 화염탄 3발을 발사합니다.
                const dist = e.x - this.player.x;
                if (dist > 500) e.setVelocityX(-180);
                else if (dist < 260) e.setVelocityX(220);
                else e.setVelocityX(0);

                if(this.time.now - e.lastShot > 1200) {
                    e.lastShot = this.time.now;
                    for (let i = -1; i <= 1; i++) {
                        const fireball = this.bullets.create(e.x - 60, e.y - 20 + i * 70, 'enemy_bullet').setTint(0xff6b35).setScale(1.4);
                        fireball.body.setAllowGravity(false);
                        this.physics.moveTo(fireball, this.player.x, this.player.y + i * 30, 480);
                    }
                }
            } else if(e.type === 'boss') {
                // Boss Movement: Maintain distance
                const dist = e.x - this.player.x;
                if (dist > 400) e.setVelocityX(-200);
                else if (dist < 200) e.setVelocityX(300);
                else e.setVelocityX(0);

                // Boss Shooting
                if(this.time.now - e.lastShot > 1500) {
                    e.lastShot = this.time.now;
                    for(let i=0; i<3; i++) {
                        const b = this.bullets.create(e.x, e.y, 'enemy_bullet');
                        b.body.setAllowGravity(false);
                        this.physics.moveTo(b, this.player.x, this.player.y - 100 + i*100, 400);
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
        const isAbyssDeath = e.type === 'abyss';

        if (isAbyssDeath) {
            this.hp = 0; // Immediate death on falling
        } else if (e.type === 'boss' || e.type === 'dragonBoss' || e.type === 'nightmareBoss') {
            this.hp -= 5;
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

            window.speechSynthesis.cancel();
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
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(deathVoice));
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

                window.speechSynthesis.speak(new SpeechSynthesisUtterance("게임 오버. 하트가 모두 소진되어 메인 화면으로 이동합니다."));
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
    type: Phaser.AUTO, width: 800, height: 600, parent: 'game-container',
    physics: { default: 'arcade', arcade: { gravity: { y: 2400 } } },
    scene: [PreloadScene, TitleScene, SelectScene, StoryScene, GameScene]
};
new Phaser.Game(config);
