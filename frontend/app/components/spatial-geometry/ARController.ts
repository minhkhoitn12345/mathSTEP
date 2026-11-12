import type * as THREE from "three";

type XRNavigator = Navigator & {
  xr?: {
    isSessionSupported?: (mode: string) => Promise<boolean>;
    requestSession?: (mode: string, options?: Record<string, unknown>) => Promise<XRSession>;
  };
};

type HitTestSourceLike = { cancel: () => void };

/** Owns device AR capabilities and all long-lived browser resources for one AR visit. */
export class ARController {
  session: XRSession | null = null;
  hitTestSource: HitTestSourceLike | null = null;
  cameraStream: MediaStream | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private urls = new Set<string>();

  async supportsWebXR(): Promise<boolean> {
    const xr = (navigator as XRNavigator).xr;
    if (!xr?.isSessionSupported) return false;
    try { return await xr.isSessionSupported("immersive-ar"); } catch { return false; }
  }

  async startWebXR(renderer: THREE.WebGLRenderer, overlayRoot: HTMLElement): Promise<XRSession> {
    const xr = (navigator as XRNavigator).xr;
    if (!xr?.requestSession) throw new Error("Trình duyệt này chưa hỗ trợ WebXR.");
    this.renderer = renderer;
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType("local");
    const session = await xr.requestSession("immersive-ar", {
      optionalFeatures: ["hit-test", "dom-overlay"],
      domOverlay: { root: overlayRoot },
    });
    this.session = session;
    try { await renderer.xr.setSession(session); }
    catch (error) { this.session = null; renderer.xr.enabled = false; throw error; }
    return session;
  }

  async startCamera(video: HTMLVideoElement): Promise<MediaStream> {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("Thiết bị không hỗ trợ Camera thường.");
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
    this.cameraStream = stream;
    video.srcObject = stream;
    try { await video.play(); }
    catch { this.stopCamera(video); throw new Error("Chưa thể mở hình Camera. Hãy cấp quyền Camera rồi thử lại."); }
    return stream;
  }

  trackHitTestSource(source: HitTestSourceLike) { this.hitTestSource = source; }
  trackObjectUrl(url: string) { this.urls.add(url); }
  revokeObjectUrl(url: string) { if (this.urls.delete(url)) URL.revokeObjectURL(url); }

  stopCamera(video?: HTMLVideoElement | null) {
    this.cameraStream?.getTracks().forEach(track => track.stop());
    this.cameraStream = null;
    if (video) video.srcObject = null;
  }

  async endSession() {
    const session = this.session;
    this.session = null;
    this.hitTestSource?.cancel();
    this.hitTestSource = null;
    if (session) {
      try { await session.end(); } catch { /* The browser may already have ended the session. */ }
    }
    if (this.renderer) this.renderer.xr.enabled = false;
    this.renderer = null;
  }

  async dispose(video?: HTMLVideoElement | null) {
    await this.endSession();
    this.stopCamera(video);
    for (const url of this.urls) URL.revokeObjectURL(url);
    this.urls.clear();
  }
}
