export default function CustomEditor({ title, onTitleChange, content, onContentChange }) {
  // Vue의 v-model:title, v-model:content를 React에서는 상태(Value)와 변경 함수(Callback)로 분리해서 받습니다.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <input 
        type="text" 
        value={title} 
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="제목을 입력하세요"
        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      
      <textarea 
        value={content} 
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="내용을 입력하세요"
        rows="4"
        style={{ 
          padding: '8px', 
          borderRadius: '4px', 
          border: '1px solid #ccc',
          resize: 'vertical',
          fontFamily: 'inherit'
        }}
      />
    </div>
  );
}