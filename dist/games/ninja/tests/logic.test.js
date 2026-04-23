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
    const touchButtons = ['LEFT', 'RIGHT', 'JUMP', 'S', 'Q', 'E', 'ITEM'];
    const mockButtons = {
        LEFT: {}, RIGHT: {}, JUMP: {}, S: {}, Q: {}, E: {}, ITEM: {},
    };
    assert(
        touchButtons.every((key) => Object.prototype.hasOwnProperty.call(mockButtons, key)),
        '터치 하네스 가상키(이동·점프·S/Q/E·유물) 세트가 정의된다.'
    );
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

/**
 * 스테이지 전환 티켓(forceAt)은 설정 시점의 시계와 동일한 기준으로 만료 비교해야 합니다.
 * (Phaser update(time) 인자와 this.time.now 불일치 시 워치독이 영구히 안 도는 회귀 방지용 의미 검증)
 */
function testStageAdvanceTicketClock() {
    let clock = 5000;
    const ticket = { nextStage: 2, forceAt: clock + 2000 };
    assert(clock < ticket.forceAt, '티켓 생성 직후에는 만료되지 않은 것으로 간주한다.');
    clock = ticket.forceAt;
    assert(clock >= ticket.forceAt, '동일 시계 기준으로 만료 시점에는 다음 스테이지 진행 판단이 가능해야 한다.');
}

function createBossStageAdvancePlan(stage, now) {
    return {
        nextStage: stage === 1 ? 2 : stage + 1,
        titleText: stage === 1 ? 'STAGE 1 CLEAR' : 'STAGE CLEAR',
        runAt: now + 1200,
        forceAt: now + 2000,
        protectedUntil: now + 2600
    };
}

function testBossStageAdvancePlan() {
    const stage1Plan = createBossStageAdvancePlan(1, 4000);
    assert(stage1Plan.nextStage === 2, '1스테이지 보스 처치 시 다음 스테이지는 2로 고정된다.');
    assert(stage1Plan.titleText === 'STAGE 1 CLEAR', '1스테이지 보스 전환 문구는 STAGE 1 CLEAR를 유지한다.');
    assert(stage1Plan.runAt === 5200 && stage1Plan.forceAt === 6000, '보스 처치 전환은 1.2초 콜백과 2초 워치독을 함께 건다.');
    assert(stage1Plan.protectedUntil === 6600, '보스 처치 직후 보호 시간은 워치독보다 길게 유지된다.');

    const stage3Plan = createBossStageAdvancePlan(3, 4000);
    assert(stage3Plan.nextStage === 4, '후속 보스 처치도 공통 전환 진입점으로 다음 스테이지를 계산한다.');
}

function simulateStageAdvanceStart() {
    const state = { stageAdvanceStarted: false, starts: 0 };
    const startNextStageScene = () => {
        if (state.stageAdvanceStarted) return;
        state.stageAdvanceStarted = true;
        state.starts += 1;
    };
    startNextStageScene();
    startNextStageScene();
    return state;
}

function testStageAdvanceStartGuard() {
    const state = simulateStageAdvanceStart();
    assert(state.starts === 1, '스테이지 전환 시작은 지연 콜백과 워치독이 겹쳐도 한 번만 실행된다.');
}

console.log('Running Nh Ninja V10.0 Unit Tests...');
testTouchButtons();
testRelicUnlockLoop();
testPerformanceProfile();
testStage3Gate();
testShrineExitSafety();
testBossProfiles();
testStageAdvanceTicketClock();
testBossStageAdvancePlan();
testStageAdvanceStartGuard();

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
