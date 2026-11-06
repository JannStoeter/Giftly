/*
 * Erzeugt aus den Folien ein Reel als MP4 (H.264), direkt im Browser: Folien als Canvas zeichnen, mit sanftem Zoom und Überblendung
 * in Einzelbilder verwandeln, per WebCodecs kodieren und mit mp4-muxer verpacken. Optional mit Musik (AAC).
 * Läuft in Chrome, Edge und Safari am Computer. Ein Server wird nicht gebraucht.
 */
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { drawSlide } from './canvas.js';

const W = 1080, H = 1920;
const H264 = ['avc1.640033', 'avc1.64002A', 'avc1.4D0033', 'avc1.42E01F'];

const ease = t => t * t * (3 - 2 * t);

export async function makeReel({ slides, imageFor = () => null, secondsPerSlide = 3, fps = 30, audioFile = null, codecs = H264, onProgress = () => {} }) {
  if (typeof VideoEncoder === 'undefined') throw new Error('Dein Browser kann keine Videos erzeugen. Bitte nutze Chrome, Edge oder Safari am Computer.');
  const warnings = [];
  const cvs = slides.map((s, i) => { const c = document.createElement('canvas'); drawSlide(c, s, i, slides.length, { format: 'reel', image: imageFor(i) }); return c; });
  const out = document.createElement('canvas'); out.width = W; out.height = H;
  const ctx = out.getContext('2d');

  let cfg = null;
  for (const codec of codecs) {
    try { const r = await VideoEncoder.isConfigSupported({ codec, width: W, height: H, bitrate: 5_000_000, framerate: fps }); if (r.supported) { cfg = r.config; break; } } catch { /* nächster Codec */ }
  }
  if (!cfg) throw new Error('Dein Browser kann kein MP4-Video (H.264) erzeugen. Bitte nutze Chrome oder Edge am Computer.');

  const total = Math.round(slides.length * secondsPerSlide * fps), duration = total / fps;

  // Musik vorbereiten (falls möglich)
  let pcm = null; const SR = 44100;
  if (audioFile && typeof AudioEncoder !== 'undefined') {
    try {
      const ac = new AudioContext({ sampleRate: SR });
      const buf = await ac.decodeAudioData(await audioFile.arrayBuffer()); await ac.close();
      const ok = await AudioEncoder.isConfigSupported({ codec: 'mp4a.40.2', sampleRate: SR, numberOfChannels: 2, bitrate: 128000 });
      if (ok.supported) pcm = buf; else warnings.push('Dein Browser kann die Musik nicht einbauen. Das Reel wird ohne Ton erzeugt. Du kannst in der Instagram-App Musik ergänzen.');
    } catch { warnings.push('Die Musikdatei konnte nicht gelesen werden. Das Reel wird ohne Ton erzeugt.'); }
  } else if (audioFile) warnings.push('Dein Browser kann keine Musik einbauen. Das Reel wird ohne Ton erzeugt.');

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: cfg.codec.startsWith('avc') ? 'avc' : cfg.codec.startsWith('vp09') ? 'vp9' : 'av1', width: W, height: H },
    ...(pcm ? { audio: { codec: 'aac', numberOfChannels: 2, sampleRate: SR } } : {}),
    fastStart: 'in-memory',
  });
  let failure = null;
  const venc = new VideoEncoder({ output: (c, m) => muxer.addVideoChunk(c, m), error: e => { failure = e; } });
  venc.configure(cfg);

  const per = secondsPerSlide * fps, fade = Math.round(fps * 0.4);
  for (let f = 0; f < total; f++) {
    if (failure) throw failure;
    const si = Math.min(slides.length - 1, Math.floor(f / per)), local = (f - si * per) / per;
    const zoom = 1 + 0.04 * ease(local);
    ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const draw = (i, alpha, z) => { ctx.globalAlpha = alpha; ctx.setTransform(z, 0, 0, z, (W - W * z) / 2, (H - H * z) / 2); ctx.drawImage(cvs[i], 0, 0); ctx.setTransform(1, 0, 0, 1, 0, 0); };
    const into = f - si * per; // Bilder seit Beginn dieser Folie
    if (si > 0 && into < fade) { draw(si - 1, 1, 1 + 0.04); draw(si, ease(into / fade), zoom); }
    else if (si === 0 && into < fade) draw(si, ease(into / fade), zoom);
    else draw(si, 1, zoom);
    ctx.globalAlpha = 1;
    const frame = new VideoFrame(out, { timestamp: Math.round(f * 1e6 / fps), duration: Math.round(1e6 / fps) });
    venc.encode(frame, { keyFrame: f % (fps * 2) === 0 }); frame.close();
    while (venc.encodeQueueSize > 8) await new Promise(r => setTimeout(r, 4));
    if (f % 10 === 0) { onProgress(f / total * (pcm ? 0.9 : 1)); await new Promise(r => setTimeout(r)); }
  }
  await venc.flush(); venc.close();

  if (pcm) {
    const aenc = new AudioEncoder({ output: (c, m) => muxer.addAudioChunk(c, m), error: e => { failure = e; } });
    aenc.configure({ codec: 'mp4a.40.2', sampleRate: SR, numberOfChannels: 2, bitrate: 128000 });
    const n = Math.round(duration * SR), step = 4096, L = pcm.getChannelData(0), R = pcm.numberOfChannels > 1 ? pcm.getChannelData(1) : L;
    for (let off = 0; off < n; off += step) {
      const len = Math.min(step, n - off), data = new Float32Array(len * 2);
      for (let i = 0; i < len; i++) {
        const t = (off + i) / SR, g = Math.min(1, Math.max(0, (duration - t) / 1.2)); // 1,2 Sekunden Ausblenden am Ende
        const k = (off + i) % L.length; data[i] = L[k] * g; data[len + i] = R[k] * g;
      }
      const ad = new AudioData({ format: 'f32-planar', sampleRate: SR, numberOfFrames: len, numberOfChannels: 2, timestamp: Math.round(off / SR * 1e6), data });
      aenc.encode(ad); ad.close();
      while (aenc.encodeQueueSize > 8) await new Promise(r => setTimeout(r, 4));
    }
    await aenc.flush(); aenc.close(); onProgress(0.97);
  }
  if (failure) throw failure;
  muxer.finalize(); onProgress(1);
  return { blob: new Blob([muxer.target.buffer], { type: 'video/mp4' }), seconds: duration, warnings };
}
