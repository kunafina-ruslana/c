import { useEffect, useRef } from 'react';

const RutubePlayer = ({ videoId, startTime = 0, endTime, onTimeUpdate, onEnded }) => {
  const iframeRef = useRef(null);

  const embedUrl = `https://rutube.ru/play/embed/${videoId}?t=${startTime}${endTime ? `&end=${endTime}` : ''}`;

  return (
    <div style={styles.container}>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        frameBorder="0"
        allow="clipboard-write; autoplay; fullscreen"
        allowFullScreen
        style={styles.iframe}
        title="Rutube video player"
      />
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%',
    backgroundColor: '#000',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  iframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none'
  }
};

export default RutubePlayer;