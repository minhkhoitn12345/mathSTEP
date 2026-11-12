import * as THREE from "three";

/** Creates a camera-facing, high-contrast point label that also survives XR rendering. */
export function createVertexSprite(text: string, color = "#ffffff"): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    context.beginPath();
    context.arc(64, 64, 60, 0, Math.PI * 2);
    context.fillStyle = "rgba(15, 23, 42, 0.8)";
    context.fill();
    context.font = "bold 54px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = color;
    context.fillText(text, 64, 66, 108);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false, sizeAttenuation: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.34, 0.34, 1);
  sprite.renderOrder = 20;
  return sprite;
}
