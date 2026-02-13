import clickSound from "@/assests/sound/mouse_click.mp3";

let clickAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;

export function unlockAudio() {
  if (audioUnlocked) return;

  clickAudio = new Audio(clickSound);
  clickAudio.volume = 0.2;

  clickAudio.muted = true;
  clickAudio.play().then(() => {
    clickAudio!.pause();
    clickAudio!.currentTime = 0;
    clickAudio!.muted = false;
    audioUnlocked = true;
  }).catch(() => {});
}

export function playClickSound() {
  if (!audioUnlocked || !clickAudio) return;
  clickAudio.currentTime = 0;
  clickAudio.play().catch(() => {});
}
