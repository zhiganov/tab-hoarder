import { jamRooms } from '../store/jam';
import '../styles/jam.css';

export function JamBanner() {
  const rooms = jamRooms.value;
  if (rooms.length === 0) return null;

  return (
    <div class="jam-banner-container">
      {rooms.map((room) => {
        const trackText = room.currentTrack?.title
          ? `${room.currentTrack.title}${room.currentTrack.artist ? ` — ${room.currentTrack.artist}` : ''}`
          : null;

        return (
          <a
            key={room.id}
            class="jam-banner"
            href={`https://jam.zhgnv.com/room/${room.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="jam-banner-live">
              <span class="jam-banner-pulse" />
              <div class="jam-banner-eq">
                <span class="jam-banner-eq-bar" />
                <span class="jam-banner-eq-bar" />
                <span class="jam-banner-eq-bar" />
              </div>
            </div>
            <span class="jam-banner-label">Now listening</span>
            <span class="jam-banner-text">
              <strong>{room.hostName}</strong>
              {trackText ? <>{' — '}<em>{trackText}</em></> : ' has a room open'}
            </span>
            <span class="jam-banner-join">Join</span>
          </a>
        );
      })}
    </div>
  );
}
