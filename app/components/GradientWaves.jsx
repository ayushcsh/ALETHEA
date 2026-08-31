"use client";

import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import styles from "./GradientWaves.module.css";

const hexToRgb = (hex) => {
  const value = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return value ? [parseInt(value[1], 16) / 255, parseInt(value[2], 16) / 255, parseInt(value[3], 16) / 255] : [1, 1, 1];
};

const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution, uMouse;
uniform float iTime, uSpeed, uAmplitude, uWaveScale, uWaveRatio, uSwell, uTurbulence, uTilt, uZoom, uHeight, uFogDepth, uSteps, uBrightness, uOpacity, uGrain, uGrainIntensity, uParallax;
uniform bool uEnableMouse;
uniform vec3 uHorizonColor, uWaveColor, uCrestColor;
out vec4 fragColor;
const float MAX_DIST = 20000.0;
float hash21(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float plasma(vec3 r, vec2 freq, vec4 tc) {
  float mx = r.x + tc.x; mx += uSwell * sin((r.y + mx) / 20. + tc.y);
  float my = r.y - tc.z; my += uTurbulence * cos(r.x / 23. + tc.w);
  return r.z - (sin(mx * freq.x) * uAmplitude + sin(my * freq.y) * uAmplitude + uHeight);
}
float raymarch(vec3 pos, vec3 dir, vec2 freq, vec4 tc) {
  float dist = 0.;
  for (int i = 0; i < 128; i++) { if (float(i) >= uSteps) break; float d = plasma(pos + dist * dir, freq, tc); if (abs(d) < .1) break; dist += .9 * d; if (!(abs(dist) < MAX_DIST)) return MAX_DIST; }
  return dist;
}
void main() {
  float T = iTime * uSpeed; vec2 freq = vec2(uWaveScale / 7., (uWaveScale * uWaveRatio) / 3.); vec4 tc = vec4(T / .130, T / .810, T / .200, T / .710);
  float c, s; float vfov = (3.14159 / 2.3) / max(uZoom, .05); vec3 cam = vec3(0., 0., 30.);
  vec2 uv = gl_FragCoord.xy / iResolution.xy - .5; uv.x *= iResolution.x / iResolution.y; uv.y *= -1.;
  vec3 dir = vec3(0., 0., -1.); float len = length(uv); float rot = vfov * len; c = cos(rot); s = sin(rot); dir = mat3(1.,0.,0., 0.,c,-s, 0.,s,c) * dir;
  vec2 nuv = len > .00001 ? uv / len : vec2(1., 0.); c = nuv.x; s = nuv.y; dir = mat3(c,-s,0., s,c,0., 0.,0.,1.) * dir;
  c = cos(uTilt); s = sin(uTilt); dir = mat3(c,0.,s, 0.,1.,0., -s,0.,c) * dir;
  if (uEnableMouse) { float yaw = (uMouse.x - .5) * uParallax * .4; float pitch = (uMouse.y - .5) * uParallax * .4; c = cos(yaw); s = sin(yaw); dir = mat3(c,0.,s, 0.,1.,0., -s,0.,c) * dir; c = cos(pitch); s = sin(pitch); dir = mat3(1.,0.,0., 0.,c,-s, 0.,s,c) * dir; }
  float dist = raymarch(cam, dir, freq, tc); vec3 pos = cam + dist * dir; float t = clamp(uFogDepth / max(dist, .001), 0., 1.);
  vec3 body = mix(uWaveColor, uCrestColor, clamp(pos.z * .08 + .5, 0., 1.)); vec3 col = clamp(mix(uHorizonColor, body, t) * uBrightness, 0., 1.);
  float alpha = clamp(t, 0., 1.) * uOpacity; if (uGrain > .5) alpha += (hash21(gl_FragCoord.xy + mod(iTime, 64.) * 11.) - .5) * uGrainIntensity;
  fragColor = vec4(col * clamp(alpha, 0., 1.), clamp(alpha, 0., 1.));
}`;

const stepsFor = (detail) => detail === "low" ? 40 : detail === "high" ? 110 : 70;

export default function GradientWaves({
  horizonColor = "#7c2500", waveColor = "#ff6600", crestColor = "#ffd3a3", speed = .32,
  amplitude = 2.2, waveScale = .6, waveRatio = .9, swell = 35, turbulence = 20, tilt = 1.11,
  zoom = 1, height = 5.5, fogDepth = 15, detail = "medium", brightness = 1.05, opacity = 1,
  mouseInteraction = true, parallaxStrength = .35, grain = true, grainIntensity = .035, className = ""
}) {
  const ref = useRef(null);
  const propsRef = useRef({});
  propsRef.current = { horizonColor, waveColor, crestColor, speed, amplitude, waveScale, waveRatio, swell, turbulence, tilt, zoom, height, fogDepth, detail, brightness, opacity, mouseInteraction, parallaxStrength, grain, grainIntensity };

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const renderer = new Renderer({ webgl: 2, alpha: true, premultipliedAlpha: true, antialias: false, dpr: Math.min(devicePixelRatio || 1, 2) });
    const gl = renderer.gl; gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas; container.appendChild(canvas);
    const uniforms = {
      iTime: { value: 0 }, iResolution: { value: new Float32Array([1, 1]) }, uMouse: { value: new Float32Array([.5, .5]) },
      uSpeed: { value: .32 }, uAmplitude: { value: 2.2 }, uWaveScale: { value: .6 }, uWaveRatio: { value: .9 }, uSwell: { value: 35 }, uTurbulence: { value: 20 }, uTilt: { value: 1.11 }, uZoom: { value: 1 }, uHeight: { value: 5.5 }, uFogDepth: { value: 15 }, uSteps: { value: 70 }, uBrightness: { value: 1.05 }, uOpacity: { value: 1 }, uGrain: { value: 1 }, uGrainIntensity: { value: .035 }, uParallax: { value: .35 }, uEnableMouse: { value: true }, uHorizonColor: { value: new Float32Array(3) }, uWaveColor: { value: new Float32Array(3) }, uCrestColor: { value: new Float32Array(3) }
    };
    const program = new Program(gl, { vertex, fragment, uniforms }); const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const update = () => { const p = propsRef.current; const map = { uSpeed: p.speed, uAmplitude: p.amplitude, uWaveScale: p.waveScale, uWaveRatio: p.waveRatio, uSwell: p.swell, uTurbulence: p.turbulence, uTilt: p.tilt, uZoom: p.zoom, uHeight: p.height, uFogDepth: p.fogDepth, uSteps: stepsFor(p.detail), uBrightness: p.brightness, uOpacity: p.opacity, uGrain: p.grain ? 1 : 0, uGrainIntensity: p.grainIntensity, uParallax: p.parallaxStrength, uEnableMouse: p.mouseInteraction }; Object.entries(map).forEach(([key, value]) => uniforms[key].value = value); [["uHorizonColor", p.horizonColor], ["uWaveColor", p.waveColor], ["uCrestColor", p.crestColor]].forEach(([key, value]) => uniforms[key].value.set(hexToRgb(value))); };
    const resize = () => { const r = container.getBoundingClientRect(); renderer.setSize(Math.max(1, r.width), Math.max(1, r.height)); uniforms.iResolution.value.set([gl.drawingBufferWidth, gl.drawingBufferHeight]); };
    const observer = new ResizeObserver(resize); observer.observe(container); resize(); update();
    const target = [.5, .5], current = [.5, .5]; const move = (event) => { const r = canvas.getBoundingClientRect(); target[0] = (event.clientX - r.left) / r.width; target[1] = 1 - (event.clientY - r.top) / r.height; };
    canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerleave", () => target.splice(0, 2, .5, .5));
    let id; const start = performance.now(); const frame = (now) => { update(); uniforms.iTime.value = (now - start) / 1000; current[0] += .05 * (target[0] - current[0]); current[1] += .05 * (target[1] - current[1]); uniforms.uMouse.value.set(current); renderer.render({ scene: mesh }); id = requestAnimationFrame(frame); }; id = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(id); observer.disconnect(); canvas.removeEventListener("pointermove", move); canvas.remove(); gl.getExtension("WEBGL_lose_context")?.loseContext(); };
  }, []);
  return <div ref={ref} className={`${styles.container} ${className}`.trim()} />;
}
