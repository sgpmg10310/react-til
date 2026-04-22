/* global Phaser */
/**
 * NH Ninja 모바일 터치 하네스
 * - 조이스틱(이동): 드래그로 좌/우 입력을 가상키 LEFT/RIGHT에 매핑합니다.
 * - 액션 패드: 점프·공격·기술·유물(ITEM) 버튼 레이아웃을 한 파일에서 관리합니다.
 * - GameScene은 scrollFactor 0 고정 UI 좌표계(800x600 기준)를 그대로 사용합니다.
 */

(function attachNinjaTouchHarness(global) {
    /** @type {typeof Phaser} */
    const PhaserRef = global.Phaser;
    if (!PhaserRef) return;

    /** 논리 해상도 기준 레이아웃(변경 시 한곳만 수정) */
    const DESIGN = {
        joystick: {
            cx: 132,
            cy: 474,
            outerR: 94,
            knobR: 36,
            /** 최대 당김 반경 대비 데드존 비율(이 안에서는 이동 입력 없음) */
            deadZoneRatio: 0.12,
            /** 좌우 판정: 수평 단위 벡터가 이 값보다 왼쪽이면 왼쪽 이동 */
            axisThreshold: 0.22,
        },
        /** 우측 엄지 영역: 큰 점프 + 2단 액션 그리드 */
        actions: [
            { key: 'JUMP', x: 642, y: 416, r: 52, color: 0x0891b2, label: '점프', sub: 'JUMP', hold: false, labelFont: '20px' },
            { key: 'S', x: 598, y: 498, r: 46, color: 0x475569, label: 'S', sub: 'ATTACK', hold: false },
            { key: 'Q', x: 706, y: 498, r: 46, color: 0xdb2777, label: 'Q', sub: 'ULT', hold: false },
            { key: 'E', x: 598, y: 572, r: 44, color: 0x7c3aed, label: 'E', sub: 'TECH', hold: false },
            { key: 'ITEM', x: 706, y: 572, r: 44, color: 0xd97706, label: '유물', sub: 'RELIC', hold: false, labelFont: '17px' },
        ],
    };

    /**
     * @param {Phaser.Scene} scene
     * @param {Phaser.GameObjects.Container} container scrollFactor 0 루트
     * @param {{ setVirtualKey: (key: string, down: boolean) => void }} api
     */
    function mountJoystick(scene, container, api) {
        const { cx, cy, outerR, knobR, deadZoneRatio, axisThreshold } = DESIGN.joystick;
        const maxPull = Math.max(12, outerR - knobR - 6);
        const deadDist = maxPull * deadZoneRatio;

        const ring = scene.add.circle(cx, cy, outerR, 0x0f172a, 0.28).setStrokeStyle(4, 0x93c5fd, 0.5);
        const knob = scene.add.circle(cx, cy, knobR, 0x2563eb, 0.52).setStrokeStyle(3, 0xf8fafc, 0.85);
        const hint = scene.add
            .text(cx, cy + outerR + 14, '이동', { fontSize: '13px', fill: '#94a3b8', fontStyle: 'bold' })
            .setOrigin(0.5);
        container.add([ring, knob, hint]);

        let dragging = false;
        let activePointerId = null;

        function releaseAxes() {
            api.setVirtualKey('LEFT', false);
            api.setVirtualKey('RIGHT', false);
            knob.setPosition(cx, cy);
        }

        function applyFromDelta(dx, dy) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < deadDist) {
                releaseAxes();
                return;
            }
            const nx = dx / dist;
            const ny = dy / dist;
            const pull = Math.min(dist, maxPull);
            knob.setPosition(cx + nx * pull, cy + ny * pull);

            if (nx < -axisThreshold) {
                api.setVirtualKey('LEFT', true);
                api.setVirtualKey('RIGHT', false);
            } else if (nx > axisThreshold) {
                api.setVirtualKey('RIGHT', true);
                api.setVirtualKey('LEFT', false);
            } else {
                api.setVirtualKey('LEFT', false);
                api.setVirtualKey('RIGHT', false);
            }
        }

        function readPointerVector(pointer) {
            const dx = pointer.worldX - cx;
            const dy = pointer.worldY - cy;
            return { dx, dy };
        }

        const hitPad = scene.add.circle(cx, cy, outerR + 36, 0x000000, 0.001).setInteractive({ draggable: false });
        container.add(hitPad);

        hitPad.on('pointerdown', (pointer) => {
            dragging = true;
            activePointerId = pointer.id;
            const { dx, dy } = readPointerVector(pointer);
            applyFromDelta(dx, dy);
        });

        const onMove = (pointer) => {
            if (!dragging || pointer.id !== activePointerId) return;
            const { dx, dy } = readPointerVector(pointer);
            applyFromDelta(dx, dy);
        };

        const onUp = (pointer) => {
            if (!dragging || pointer.id !== activePointerId) return;
            dragging = false;
            activePointerId = null;
            releaseAxes();
        };

        scene.input.on('pointermove', onMove);
        scene.input.on('pointerup', onUp);
        scene.input.on('pointerupoutside', onUp);

        return {
            reset: releaseAxes,
            destroy: () => {
                scene.input.off('pointermove', onMove);
                scene.input.off('pointerup', onUp);
                scene.input.off('pointerupoutside', onUp);
                hitPad.removeInteractive();
            },
        };
    }

    /**
     * @param {Phaser.Scene} scene
     * @param {Phaser.GameObjects.Container} container
     * @param {{ setVirtualKey: (k: string, v: boolean) => void; touchButtons: Record<string, unknown> }} api
     */
    function mountActionPad(scene, container, api) {
        const cleanup = [];
        DESIGN.actions.forEach((def) => {
            const box = scene.add.circle(def.x, def.y, def.r, def.color, 0.48).setStrokeStyle(3, 0xe2e8f0, 0.72);
            const labelSize = def.labelFont || (def.key === 'JUMP' ? '22px' : '24px');
            const label = scene.add.text(def.x, def.y - 11, def.label, {
                fontSize: labelSize,
                fill: '#ffffff',
                fontStyle: 'bold',
            }).setOrigin(0.5);
            const sub = scene.add.text(def.x, def.y + 17, def.sub, {
                fontSize: '11px',
                fill: '#dbeafe',
                fontStyle: 'bold',
            }).setOrigin(0.5);
            const hitW = def.r * 2 + (def.key === 'JUMP' ? 36 : 28);
            const hit = scene.add.zone(def.x, def.y, hitW, hitW).setInteractive({ useHandCursor: true });

            const press = () => {
                box.setScale(0.93);
                api.setVirtualKey(def.key, true);
            };
            const release = () => {
                box.setScale(1);
                api.setVirtualKey(def.key, false);
            };

            hit.on('pointerdown', press);
            hit.on('pointerup', release);
            hit.on('pointerout', release);
            hit.on('pointerupoutside', release);
            hit.on('pointercancel', release);

            api.touchButtons[def.key] = { box, label, sub, hold: def.hold };
            container.add([box, label, sub, hit]);
        });

        return {
            reset: () => {
                DESIGN.actions.forEach((def) => {
                    const b = api.touchButtons[def.key];
                    if (b?.box) b.box.setScale(1);
                });
            },
            destroy: () => {
                cleanup.forEach((fn) => fn());
            },
        };
    }

    /**
     * @param {Phaser.Scene} scene GameScene 인스턴스
     * @param {Phaser.GameObjects.Container} root
     * @param {{ setVirtualKey: Function; touchButtons: Record<string, unknown> }} api
     */
    function mountGameTouch(scene, root, api) {
        const joy = mountJoystick(scene, root, api);
        const pad = mountActionPad(scene, root, api);
        return {
            reset: () => {
                joy.reset();
                pad.reset();
            },
            destroy: () => {
                joy.destroy();
                pad.destroy();
            },
        };
    }

    global.NinjaTouchHarness = {
        DESIGN,
        mountGameTouch,
    };
})(typeof window !== 'undefined' ? window : globalThis);
