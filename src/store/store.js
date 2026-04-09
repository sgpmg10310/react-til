import { create } from 'zustand';

// 전역 스토어 생성
const useCounterStore = create((set) => ({
  count: 0,
  // set 함수를 사용해 상태를 변경합니다.
  increase: () => set((state) => ({ count: state.count + 1 })),
  decrease: () => set((state) => ({ count: state.count - 1 })),
}));

export default useCounterStore;