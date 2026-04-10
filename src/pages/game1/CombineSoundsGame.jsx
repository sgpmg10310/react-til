import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Game.module.css';

const CONSONANTS = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ'.split('');
const VOWELS = 'ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ'.split('');

// 실제 구현 시에는 더 많은 이미지와 정확한 한글 조합 로직이 필요합니다.
const SIMPLE_IMAGES = {
  '가': 'https://via.placeholder.com/150/FF0000/FFFFFF?Text=가위',
  '나': 'https://via.placeholder.com/150/00FF00/FFFFFF?Text=나비',
  '다': 'https://via.placeholder.com/150/0000FF/FFFFFF?Text=다리',
};

export default function CombineSoundsGame() {
  const navigate = useNavigate();
  const [selectedConsonant, setSelectedConsonant] = useState(null);
  const [selectedVowel, setSelectedVowel] = useState(null);
  const [result, setResult] = useState('');
  const [image, setImage] = useState('');

  const handleSelect = (type, value) => {
    // TODO: value에 해당하는 소리 재생
    console.log(`Play sound for: ${value}`);

    let consonant = selectedConsonant;
    let vowel = selectedVowel;

    if (type === 'consonant') {
      setSelectedConsonant(value);
      consonant = value;
    } else {
      setSelectedVowel(value);
      vowel = value;
    }

    if (consonant && vowel) {
      // 이 부분은 데모를 위한 매우 단순화된 조합 로직입니다.
      const combined = combineHangul(consonant, vowel);
      setResult(combined);
      setImage(SIMPLE_IMAGES[combined] || `https://via.placeholder.com/150/EEEEEE/000000?Text=${combined}`);
      // 다음 선택을 위해 초기화
      setSelectedConsonant(null);
      setSelectedVowel(null);
    }
  };
  
  // 데모용 한글 조합 함수
  function combineHangul(consonant, vowel) {
    const conIndex = CONSONANTS.indexOf(consonant);
    const vowIndex = VOWELS.indexOf(vowel);
    // 실제 유니코드 조합 대신 간단한 매핑으로 대체
    if (conIndex === 0 && vowIndex === 0) return '가';
    if (conIndex === 1 && vowIndex === 0) return '나';
    if (conIndex === 2 && vowIndex === 0) return '다';
    return `${consonant}${vowel}`; // 조합 실패 시
  }

  return (
    <div className={styles.gameContainer}>
      <h2>1. 자음 + 모음 합치기</h2>
      <div className={styles.selectionArea}>
        <p>선택된 자음: <strong>{selectedConsonant || '?'}</strong></p>
        <p>선택된 모음: <strong>{selectedVowel || '?'}</strong></p>
      </div>
      
      <div className={styles.resultArea}>
        {result ? (
          <>
            <h3>결과: {result}</h3>
            <img src={image} alt={result} />
          </>
        ) : (
          <p>자음과 모음을 순서대로 선택해주세요.</p>
        )}
      </div>

      <h4>자음</h4>
      <div className={styles.buttonGrid}>{CONSONANTS.map(c => (<button key={c} onClick={() => handleSelect('consonant', c)}>{c}</button>))}</div>
      <h4>모음</h4>
      <div className={styles.buttonGrid}>{VOWELS.map(v => (<button key={v} onClick={() => handleSelect('vowel', v)}>{v}</button>))}</div>
      <button className={styles.backBtn} onClick={() => navigate('/hangul-game')}>게임 목록으로</button>
    </div>
  );
}