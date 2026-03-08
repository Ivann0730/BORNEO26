type FrameCallback = (currentTime: number) => void;

let rafHandle: number | null = null;
let startTime: number | null = null;
const subscribers = new Map<string, FrameCallback>();

export function subscribe(id: string, cb: FrameCallback): void {
  subscribers.set(id, cb);
  if (!rafHandle) startLoop();
}

export function unsubscribe(id: string): void {
  subscribers.delete(id);
  if (subscribers.size === 0) stopLoop();
}

function startLoop(): void {
  startTime = null;

  const tick = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    subscribers.forEach((cb) => cb(elapsed));
    rafHandle = requestAnimationFrame(tick);
  };

  rafHandle = requestAnimationFrame(tick);
}

function stopLoop(): void {
  if (rafHandle !== null) {
    cancelAnimationFrame(rafHandle);
    rafHandle = null;
    startTime = null;
  }
}
