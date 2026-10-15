precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;
uniform float u_mouseAmt;
uniform vec2  u_dir;
uniform float u_light;
uniform float u_grain;
uniform float u_folds;
uniform float u_dpr;
uniform vec3  u_lo;
uniform vec3  u_hi;

// Dave Hoskins hash: no lattice artifacts at pixel scale.
float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }

float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++){ v += a * vnoise(p); p = p * 2.02 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 q = (uv - 0.5) * vec2(aspect, 1.0);
  vec2 m = (u_mouse - 0.5) * vec2(aspect, 1.0);
  float t = u_time;

  // Pointer gently bends the cloth toward itself.
  vec2 toM = m - q;
  q += toM * 0.18 * u_mouseAmt * exp(-dot(toM, toM) * 1.6);

  // Low-frequency warp: slow, never busy.
  vec2 w = vec2(fbm(q * 0.9 + vec2(t * 0.025, -t * 0.018)), fbm(q * 0.9 + vec2(-t * 0.02, t * 0.022) + 5.3)) - 0.5;
  vec2 qw = q + w * 0.65;

  vec2 dir = normalize(u_dir);
  vec2 perp = vec2(-dir.y, dir.x);
  float along = dot(qw, dir) / max(aspect, 1.0);
  float across = dot(qw, perp);

  // Base light ramp.
  float base = smoothstep(-0.55, 0.65, along + (u_light - 0.5) * 1.2);

  // Folds: two soft creases running across the light, drifting slowly.
  float f1 = sin(across * 3.1 + along * 1.4 + t * 0.12 + w.x * 3.0);
  float f2 = sin(across * 5.3 - along * 2.2 - t * 0.09 + w.y * 4.0);
  float fold = (f1 * 0.65 + f2 * 0.35) * 0.5 + 0.5;
  fold = smoothstep(0.15, 0.95, fold);

  float c = base * mix(1.0, 0.45 + 0.75 * fold, u_folds);

  // Pointer light.
  float pool = exp(-dot(q - m, q - m) * 2.4) * u_mouseAmt;
  c += pool * 0.28 * (1.0 - c * 0.5);

  c = clamp(c, 0.0, 1.0);
  c = c * c * (3.0 - 2.0 * c) * 0.85 + c * 0.15; // soft contrast

  // Static film grain, fixed to the pixel grid: texture, not static.
  float g = hash(floor(frag / u_dpr)) - 0.5;
  float g2 = hash(floor(frag / u_dpr) + 17.17) - 0.5;
  c += (g + g2) * u_grain * (0.35 + 0.65 * (4.0 * c * (1.0 - c)) + 0.25);

  vec3 col = mix(u_lo, u_hi, clamp(c, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
}
