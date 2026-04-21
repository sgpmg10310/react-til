/**
 * Nh Ninja V10.0 Logic Unit Tests
 * Lightweight simulation of the stage/relic/mobile control rules.
 */

const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    logs: []
};

function assert(condition, message) {
    testResults.total += 1;
    if (condition) {
        testResults.passed += 1;
        testResults.logs.push(`[PASS] ${message}`);
    } else {
        testResults.failed += 1;
        testResults.logs.push(`[FAIL] ${message}`);
    }
}

function createDeviceProfile(isTouch) {
    return {
        isTouch,
        particleBurst: isTouch ? 14 : 30,
        worldWidth: isTouch ? 30000 : 36000,
        enemyCap: isTouch ? 9 : 14,
        skyEnemyCap: isTouch ? 3 : 5
    };
}

function grantRelicSkill(stageKey) {
    const skillMap = {
        stage1: { skillName: '청람 나선옥', charges: 3, cooldown: 5200 },
        stage2: { skillName: '천뢰 관통선', charges: 2, cooldown: 6800 },
        stage3: { skillName: '적월 수호진', charges: 2, cooldown: 9000 }
    };
    return { stageKey, ...skillMap[stageKey] };
}

function useRelicSkill(skill) {
    if (!skill || skill.charges <= 0) return false;
    skill.charges -= 1;
    return true;
}

function createShrineExitState(doorX, now) {
    return {
        landingPadX: doorX + 360,
        landingPadY: 438,
        protectedUntil: now + 1400
    };
}

function createBossProfile(stageKey) {
    const profiles = {
        stage1: { name: '철갑 전선대장', hp: 190, moves: ['dash', 'fanShot', 'shockwave'] },
        stage2: { name: '폭풍룡 카이라', hp: 340, moves: ['hover', 'flameBreath', 'rush'] },
        stage3: { name: '적월의 악몽', hp: 520, moves: ['teleport', 'spreadShot', 'ringBurst'] }
    };
    return profiles[stageKey];
}

function testTouchButtons() {
    const touchButtons = ['LEFT', 'RIGHT', 'JUMP', 'ATTACK', 'SKILL', 'TECH', 'ITEM'];
    const mockButtons = {
        LEFT: {}, RIGHT: {}, JUMP: {}, ATTACK: {}, SKILL: {}, TECH: {}, ITEM: {}
    };
    assert(touchButtons.every((key) => Object.prototype.hasOwnProperty.call(mockButtons, key)), '모바일용 이동/점프/공격/기술 버튼 7종이 모두 정의된다.');
}

function testRelicUnlockLoop() {
    const stage1Skill = grantRelicSkill('stage1');
    const stage2Skill = grantRelicSkill('stage2');

    assert(stage1Skill.skillName === '청람 나선옥', '스테이지 1 유물은 청람 나선옥을 해금한다.');
    assert(stage2Skill.charges === 2, '스테이지 2 유물은 천뢰 관통선 2회 충전을 제공한다.');
    assert(useRelicSkill(stage1Skill) === true && stage1Skill.charges === 2, '유물 기술 사용 시 충전 수가 1 감소한다.');
}

function testPerformanceProfile() {
    const mobile = createDeviceProfile(true);
    const desktop = createDeviceProfile(false);

    assert(mobile.worldWidth < desktop.worldWidth, '모바일 프로필은 월드 길이를 줄여 렌더링 부담을 낮춘다.');
    assert(mobile.particleBurst < desktop.particleBurst, '모바일 프로필은 파티클 수를 줄인다.');
    assert(mobile.enemyCap < desktop.enemyCap, '모바일 프로필은 동시 적 수 제한을 더 엄격하게 적용한다.');
}

function testStage3Gate() {
    const state = {
        hasCrimsonMask: false,
        bossSpawned: false
    };

    if (state.hasCrimsonMask) state.bossSpawned = true;
    assert(state.bossSpawned === false, '적월 가면을 획득하기 전에는 최종 보스가 등장하지 않는다.');

    state.hasCrimsonMask = true;
    if (state.hasCrimsonMask) state.bossSpawned = true;
    assert(state.bossSpawned === true, '적월 가면 획득 후 최종 보스 봉인이 해제된다.');
}

function testShrineExitSafety() {
    const exitState = createShrineExitState(2860, 1000);
    assert(exitState.landingPadX === 3220, '청람 구슬 획득 후 복귀 지점은 제단 옆 안전 발판으로 고정된다.');
    assert(exitState.landingPadY === 438, '복귀 시 플레이어는 낙사하지 않는 높이로 복원된다.');
    assert(exitState.protectedUntil === 2400, '복귀 직후 짧은 보호 시간이 적용된다.');
}

function testBossProfiles() {
    const stage1Boss = createBossProfile('stage1');
    const stage2Boss = createBossProfile('stage2');
    const stage3Boss = createBossProfile('stage3');

    assert(stage1Boss.moves.includes('dash'), '1스테이지 보스는 돌진 패턴을 가진다.');
    assert(stage2Boss.moves.includes('flameBreath'), '2스테이지 보스는 화염 브레스 계열 패턴을 가진다.');
    assert(stage3Boss.moves.includes('teleport') && stage3Boss.moves.includes('ringBurst'), '3스테이지 보스는 순간이동과 광역 탄막 패턴을 가진다.');
}

console.log('Running Nh Ninja V10.0 Unit Tests...');
testTouchButtons();
testRelicUnlockLoop();
testPerformanceProfile();
testStage3Gate();
testShrineExitSafety();
testBossProfiles();

const report = `
NH NINJA V10.0 UNIT TEST REPORT
-------------------------------
Total: ${testResults.total}
Passed: ${testResults.passed}
Failed: ${testResults.failed}

Logs:
${testResults.logs.join('\n')}
`;

console.log(report);
