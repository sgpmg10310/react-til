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

        // Rasengan (V9.2)
        PixelRenderer.generateFromMap(scene, 'rasengan', 4, ART.rasengan, { 'W': 0xffffff, 'L': 0xb0e2ff, 'D': 0x3b82f6 });
        // Scratched Headband (V9.2)
        PixelRenderer.generateFromMap(scene, 'headband', 4, ART.headband, { 'X': 0x111111, 'G': 0xc0c0c0, 'S': 0x444444 });
        // Mangekyou Sharingan (V9.3)
        PixelRenderer.generateFromMap(scene, 'sharingan', 4, ART.sharingan, { 'R': 0xcc0000, 'K': 0x000000 });

        scene.make.graphics({add: false}).fillStyle(0x8b4513).fillRect(0,0,16,16).generateTexture('rope_anchor', 16, 16);
        scene.make.graphics({add: false}).fillStyle(0xffffff, 0.9).fillRoundedRect(0, 0, 100, 25, 12).generateTexture('cloud_plat', 100, 25);
        scene.make.graphics({add: false}).fillStyle(0x3b82f6).fillCircle(15, 5, 5).generateTexture('kunai_n', 30, 10);
        scene.make.graphics({add: false}).fillStyle(0x8b5cf6).fillCircle(15, 5, 5).generateTexture('kunai_s', 30, 10);
        scene.make.graphics({add: false}).fillStyle(0xf472b6).fillCircle(15, 5, 5).generateTexture('kunai_sa', 30, 10);
        scene.make.graphics({add: false}).fillStyle(0xe5e7eb).fillCircle(15, 5, 5).generateTexture('kunai_k', 30, 10);
        scene.make.graphics({add: false}).fillStyle(0xffffff, 0.4).fillCircle(10, 10, 10).generateTexture('enemy_bullet', 20, 20);

        const mg = scene.make.graphics({add: false});
        mg.fillStyle(0x7b92a6, 1).fillPoints([{x:0,y:400}, {x:200,y:100}, {x:400,y:300}, {x:600,y:50}, {x:800,y:400}], true).generateTexture('bg_mountains', 800, 400);
    }
}

class PreloadScene extends Phaser.Scene {
    constructor() { super('PreloadScene'); }
    preload() { this.load.on('complete', () => { TextureGenerator.generate(this); this.scene.start('TitleScene'); }); }
}

class TitleScene extends Phaser.Scene {
    constructor() { super('TitleScene'); }
    create() {
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
        this.add.graphics().fillGradientStyle(0x1e293b, 0x1e293b, 0x0f172a, 0x0f172a, 1).fillRect(0, 0, 800, 600);
        this.add.text(400, 80, 'CHOOSE YOUR NINJA', { fontSize: '48px', fontStyle: 'bold', fill: '#fff' }).setOrigin(0.5);
        const chars = [{id:'n', name:'NARUTO'}, {id:'s', name:'SASUKE'}, {id:'sa', name:'SAKURA'}, {id:'k', name:'KAKASHI'}];
        chars.forEach((c, i) => {
            const x = 120 + i*185;
            const img = this.add.image(x, 300, `${c.id}_idle`).setScale(3).setInteractive({ useHandCursor: true });
            img.on('pointerdown', () => this.scene.start('StoryScene', { char: c }));
            this.add.text(x, 420, c.name, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        });
    }
}

class StoryScene extends Phaser.Scene {
    constructor() { super('StoryScene'); }
    init(data) { this.charData = data.char; }
    create() {
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
        this.isRoping = false; this.ropeTarget = null;
        this.isBossActive = false; this.bossTriggerScore = Phaser.Math.Between(800, 900);
        this.isPausedForStory = false;
    }

    create() {
        const worldWidth = 100000;
        this.physics.world.setBounds(0, 0, worldWidth, 600);
        this.cameras.main.setBounds(0, 0, worldWidth, 600);
        this.bgRect = this.add.graphics().setScrollFactor(0).fillGradientStyle(0x0f172a, 0x0f172a, 0x334155, 0x334155, 1).fillRect(0, 0, 800, 600);
        this.bgMountains = this.add.tileSprite(0, 200, 800, 400, 'bg_mountains').setOrigin(0).setScrollFactor(0);

        this.platforms = this.physics.add.staticGroup();
        for(let i=0; i<300; i++) {
            const texKey = `g${i}`;
            if (!this.textures.exists(texKey)) {
                let g = this.add.graphics();
                g.fillStyle(0x32cd32).fillRect(0, 0, 600, 20); 
                g.fillStyle(0x8b4513).fillRect(0, 20, 600, 60);
                g.generateTexture(texKey, 600, 80);
                g.destroy();
            }
            this.platforms.create(300 + i*600, 560, texKey).refreshBody();
        }

        this.player = this.physics.add.sprite(200, 400, `${this.charData.id}_idle`).setDepth(10);
        this.player.setBodySize(32, 50).setOffset(16, 14);
        this.player.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.enemies = this.physics.add.group();
        this.kunais = this.physics.add.group();
        this.bullets = this.physics.add.group();
        this.anchors = this.physics.add.staticGroup();
        this.clouds = this.physics.add.staticGroup();

        for(let i=0; i<400; i++) {
            this.anchors.create(1000 + i*400, 150, 'rope_anchor');
            this.clouds.create(800 + i*350, 400 - (i%4)*80, 'cloud_plat').refreshBody();
        }

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.clouds);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.overlap(this.player, this.enemies, this.handleDamage, null, this);
        this.physics.add.overlap(this.player, this.bullets, this.handleDamage, null, this);
        
        this.physics.add.overlap(this.kunais, this.enemies, (k, e) => {
            if (e.type === 'boss') {
                e.hp -= 10;
                k.destroy();
                JuiceManager.shake(this, 0.01, 100);
                JuiceManager.emitParticles(this, e.x, e.y, 'EXPLOSION', 0xff0000);
                if (e.hp <= 0) {
                    this.score = 1000;
                    e.destroy();
                    this.isBossActive = false;
                    this.transitionToStage2();
                }
            } else {
                e.destroy(); k.destroy(); this.score += 100; JuiceManager.emitParticles(this, e.x, e.y, 'EXPLOSION');
            }
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,Q,E,SPACE');
        this.ropeLine = this.add.graphics().setDepth(5);

        this.ui = this.add.container(0, 0).setScrollFactor(0).setDepth(2000);
        this.scoreText = this.add.text(20, 20, 'SCORE: 0 | STAGE 1', { fontSize: '28px', fill: '#fff', fontStyle: 'bold' });
        this.hpBar = this.add.graphics();
        this.skillCdText = this.add.text(780, 20, '', { fontSize: '24px', fill: '#ff0' }).setOrigin(1, 0);
        this.ui.add([this.scoreText, this.hpBar, this.skillCdText]);

        this.enemySpawnTimer = this.time.addEvent({ delay: 2000, callback: this.spawnEnemy, callbackScope: this, loop: true });
    }

    update(time, delta) {
        if (this.isGameOver || this.isPausedForStory) return;

        // Fall to Death (V9.2.1)
        if (this.player.y > 600) {
            this.handleDamage(this.player, { type: 'abyss' });
            return;
        }
        
        this.scoreText.setText(`SCORE: ${this.score} | STAGE ${this.stage}`);
        this.bgMountains.tilePositionX = this.cameras.main.scrollX * 0.1;

        if (this.score >= this.bossTriggerScore && !this.isBossActive && this.stage === 1) {
            this.triggerBossFight();
        }

        if (this.skillCooldown > 0) {
            this.skillCooldown -= delta;
            this.skillCdText.setText(`SKILL READY: ${Math.ceil(this.skillCooldown/1000)}s`);
        } else {
            this.skillCdText.setText('SKILL READY!');
        }

        this.updateHPBar(); this.handleMovement(); this.handleRope(); this.handleEnemyAI();
    }

    triggerBossFight() {
        this.isBossActive = true;
        this.enemySpawnTimer.remove(); // Stop normal spawns
        
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("보스 등장! 긴장해라!"));

        const boss = this.enemies.create(this.player.x + 600, 400, 'm2').setScale(3.5).setTint(0xff0000);
        boss.type = 'boss';
        boss.hp = 100;
        boss.lastShot = 0;
        this.boss = boss;

        const bossText = this.add.text(400, 100, 'BOSS BATTLE', { fontSize: '64px', fill: '#f00', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0);
        this.tweens.add({ targets: bossText, alpha: 0, duration: 2000, onComplete: () => bossText.destroy() });
    }

    transitionToStage2() {
        this.stage = 2;
        this.cameras.main.flash(1000, 255, 255, 255);
        JuiceManager.shake(this, 0.05, 500);

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("스테이지 1 클리어! 뇌우 치는 밤으로 진입한다!"));

        // Change Theme to Stormy Night
        this.bgMountains.setTint(0x4b0082);
        this.bgRect.clear();
        this.bgRect.fillGradientStyle(0x1e1b4b, 0x1e1b4b, 0x000000, 0x000000, 1).fillRect(0, 0, 800, 600);

        // Resume spawning with increased difficulty
        this.enemySpawnTimer = this.time.addEvent({ delay: 1500, callback: this.spawnEnemy, callbackScope: this, loop: true });

        // Add Lightning Effect
        this.time.addEvent({ delay: 5000, callback: this.flashLightning, callbackScope: this, loop: true });
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
            this.hpBar.fillStyle(0xff0000).fillRect(20, 80, (this.boss.hp / 100) * 200, 10);
        }
    }

    handleMovement() {
        if (this.isRoping) return;
        const speed = 450 + (this.stage * 20);
        if (this.cursors.left.isDown || this.keys.A.isDown) { this.player.setVelocityX(-speed); this.player.flipX = true; }
        else if (this.cursors.right.isDown || this.keys.D.isDown) { this.player.setVelocityX(speed); this.player.flipX = false; }
        else this.player.setVelocityX(0);

        const isJumpDown = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                           Phaser.Input.Keyboard.JustDown(this.keys.W) || 
                           Phaser.Input.Keyboard.JustDown(this.keys.SPACE);

        if (isJumpDown && this.player.body.touching.down) this.player.setVelocityY(-950);
        if (Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.keys.S)) this.fireKunai();
        if (Phaser.Input.Keyboard.JustDown(this.keys.Q) && this.skillCooldown <= 0) this.useSkill();
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
                    if (e.type === 'boss') e.hp -= 40; else { e.destroy(); this.score += 150; }
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
                if (e.type === 'boss') {
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
                    if (e.type === 'boss') e.hp -= 20; else e.destroy();
                }
            });
        }
    }

    handleRope() {
        this.ropeLine.clear();
        if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
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
        const speed = -250 - (this.stage * 50);
        e.setVelocityX(speed);
    }

    handleEnemyAI() {
        this.enemies.getChildren().forEach(e => {
            if(e.type === 'jumper' && Math.abs(e.x - this.player.x) < 300 && e.body.touching.down) e.setVelocityY(-800);
            
            if(e.type === 'boss') {
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
            } else if(e.type === 'shooter') {
                if(this.time.now - e.lastShot > 2500) {
                    e.lastShot = this.now;
                    const b = this.bullets.create(e.x, e.y, 'enemy_bullet');
                    b.body.setAllowGravity(false);
                    this.physics.moveToObject(b, this.player, 400);
                }
            }
        });
    }

    handleDamage(p, e) {
        if (this.isGameOver) return;

        if (e.type === 'abyss') {
            this.hp = 0; // Immediate death on falling
        } else if (e.type === 'boss') {
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
            window.speechSynthesis.speak(new SpeechSynthesisUtterance("미션 실패. 머리띠를 두고 떠납니다."));

            this.time.delayedCall(2000, () => this.scene.start('TitleScene'));
        }
    }
}

const config = {
    type: Phaser.AUTO, width: 800, height: 600, parent: 'game-container',
    physics: { default: 'arcade', arcade: { gravity: { y: 2400 } } },
    scene: [PreloadScene, TitleScene, SelectScene, StoryScene, GameScene]
};
new Phaser.Game(config);
