import { describe, expect, it } from 'vitest';
import {
  getEmojiForWord,
  getKoreanWordBank,
  getRawWordPairsForTest,
} from './hangulMassWordBank.js';

describe('한글 게임 단어장', () => {
  it('그림 하나에는 단어 하나만 붙는다', () => {
    const byEmoji = {};
    for (const { word, emoji } of getKoreanWordBank()) {
      byEmoji[emoji] = byEmoji[emoji] || [];
      byEmoji[emoji].push(word);
    }
    const shared = Object.entries(byEmoji)
      .filter(([, words]) => words.length > 1)
      .map(([emoji, words]) => `${emoji} ${words.join(',')}`);
    expect(shared).toEqual([]);
  });

  it('원본 목록(HAND 문자열 + JSON)에 같은 단어가 두 번 나오지 않는다', () => {
    const counts = {};
    for (const [word] of getRawWordPairsForTest()) {
      counts[word] = (counts[word] || 0) + 1;
    }
    expect(Object.keys(counts).filter((w) => counts[w] > 1)).toEqual([]);
  });

  it('모든 단어는 한글 1~8자이고 그림이 있다', () => {
    const bad = getKoreanWordBank().filter(
      ({ word, emoji }) => !/^[가-힣]{1,8}$/u.test(word) || !emoji,
    );
    expect(bad).toEqual([]);
  });

  it('사전에 없는 말은 그림이 없고, 있는 말은 맞는 그림이 나온다', () => {
    expect(getEmojiForWord('없는말')).toBeNull();
    expect(getEmojiForWord('')).toBeNull();
    expect(getEmojiForWord('고양이')).toBe('🐱');
    expect(getEmojiForWord('배')).toBe('🍐');
    expect(getEmojiForWord('밤')).toBe('🌰');
  });

  it('게임4가 첫 글자가 서로 다른 단어 8개를 뽑을 수 있다', () => {
    const firstChars = new Set(getKoreanWordBank().map(({ word }) => word.charAt(0)));
    expect(firstChars.size).toBeGreaterThanOrEqual(8);
  });

  it('포함 관계인 단어(상위어·하위어)는 함께 있지 않다', () => {
    // [남긴 단어, 같이 있으면 안 되는 단어]
    const CONFUSABLE_PAIRS = [
      ['비둘기', '새'],
      ['장미', '꽃'],
      ['상어', '물고기'],
      ['곰', '북극곰'],
      ['곰', '판다'],
      ['나무', '숲'],
      ['치킨', '고기'],
      ['주먹밥', '밥'],
      ['책', '이야기'],
      ['책', '도서관'],
      ['경찰차', '자동차'],
      ['티셔츠', '셔츠'],
      ['바지', '반바지'],
      ['사탕', '막대사탕'],
      ['새우', '새우튀김'],
      ['학생', '졸업'],
      ['전화', '스마트폰'],
      ['별', '별똥별'],
      ['신발', '장화'],
      ['비', '천둥'],
      ['원숭이', '고릴라'],
      ['원숭이', '오랑우탄'],
      ['지구', '행성'],
      ['피아노', '음악'],
      ['농구', '공'],
    ];
    const words = new Set(getKoreanWordBank().map(({ word }) => word));
    const together = CONFUSABLE_PAIRS.filter(([a, b]) => words.has(a) && words.has(b));
    expect(together).toEqual([]);
  });
});
