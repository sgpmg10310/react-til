# Cursor 운영 구조 (NH 워크플로우)

## 폴더 구조
- `.cursor/agents/`: 서브에이전트 역할 정의
- `.cursor/rules/`: 단계별/공통 규칙 정의
- `.cursor/hooks/`: 자동 검증 스크립트

## NH 단계별 매핑
- `plan`  
  - agent: `.cursor/agents/plan-agent.md`  
  - rule: `.cursor/rules/nh-plan-rules.mdc`
- `add`  
  - agent: `.cursor/agents/add-agent.md`  
  - rule: `.cursor/rules/nh-add-rules.mdc`
- `make`  
  - agent: `.cursor/agents/make-agent.md`  
  - rule: `.cursor/rules/nh-make-rules.mdc`
- `fun`  
  - agent: `.cursor/agents/fun-agent.md`  
  - rule: `.cursor/rules/nh-fun-rules.mdc`
- `qa`  
  - agent: `.cursor/agents/qa-agent.md`  
  - rule: `.cursor/rules/nh-qa-rules.mdc`
- `result`  
  - agent: `.cursor/agents/result-agent.md`  
  - rule: `.cursor/rules/nh-result-rules.mdc`

## 공통 규칙
- `.cursor/rules/nh-workflow.mdc`
