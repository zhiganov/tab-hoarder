import { signal } from '@preact/signals';

const API_URL = 'https://navidrome-jam-production.up.railway.app/api/rooms';
const POLL_INTERVAL = 2 * 60 * 1000; // 2 minutes

export const jamRooms = signal([]);

let pollTimer = null;

async function fetchRooms() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) return [];
    const data = await res.json();
    return data.rooms || [];
  } catch {
    return [];
  }
}

async function loadRooms() {
  jamRooms.value = await fetchRooms();
}

export function startJamPolling() {
  stopJamPolling();
  loadRooms();
  pollTimer = setInterval(loadRooms, POLL_INTERVAL);
}

export function stopJamPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  jamRooms.value = [];
}
