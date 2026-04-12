import React from 'react';

/**
 * 우주 톤 배경: 단일 고정 레이어(App.css .cosmos-bg)만 사용합니다.
 * 예전처럼 perspective·궤도·코드 위성·스크롤 연동 변수는 두지 않아 폴드 펼침·스크롤 시 GPU 부담을 줄입니다.
 */
export default function CosmosBackground() {
  return <div className="cosmos-bg" aria-hidden="true" />;
}
