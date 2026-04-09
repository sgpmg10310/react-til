export default function LikeButton({ username, likes, onAddLike }) {
  return (
    <button 
      onClick={() => onAddLike(username)}
      style={{
        padding: '10px 20px',
        backgroundColor: '#ff69b4',
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      ❤️ {username} 님의 게시물 좋아요 ({likes})
    </button>
  );
}