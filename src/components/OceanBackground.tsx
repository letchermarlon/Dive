'use client'

import { useEffect, useRef } from 'react'

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_mouseInfluence;
uniform float u_waves;
uniform vec3 u_c0, u_c1, u_c2, u_c3, u_c4;

vec3 hash3(vec2 p) {
  vec3 q = vec3(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)), dot(p,vec2(419.2,371.9)));
  return fract(sin(q)*43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  float a = dot(hash3(i+vec2(0,0)), vec3(1,0,0));
  float b = dot(hash3(i+vec2(1,0)), vec3(1,0,0));
  float c = dot(hash3(i+vec2(0,1)), vec3(1,0,0));
  float d = dot(hash3(i+vec2(1,1)), vec3(1,0,0));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}

float fbm(vec2 p, float octaves) {
  float v = 0.0; float a = 0.5;
  for(int i=0;i<6;i++){
    if(float(i)>=octaves) break;
    v += a*noise(p);
    p = p*2.1 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 aspect = vec2(u_res.x/u_res.y, 1.0);
  vec2 p = uv * aspect;

  vec2 mpos = u_mouse * aspect;
  vec2 toMouse = mpos - p;
  float mouseDist = length(toMouse);
  float mouseWarp = u_mouseInfluence * 0.18 * exp(-mouseDist * 2.2);
  vec2 warped = p + toMouse * mouseWarp;

  float t = u_time;
  float n1 = fbm(warped * 1.4 + vec2(t*0.18, t*0.09), u_waves);
  float n2 = fbm(warped * 2.1 + vec2(-t*0.12, t*0.15) + n1*0.5, u_waves - 1.0);
  float n3 = fbm(warped * 0.8 + vec2(t*0.07, -t*0.11), 2.0);

  float ripple = sin(mouseDist * 14.0 - t * 3.5) * exp(-mouseDist * 3.5) * u_mouseInfluence * 0.12;
  float blend = clamp(n1 * 0.55 + n2 * 0.30 + n3 * 0.15 + ripple, 0.0, 1.0);

  vec3 col;
  float b4 = blend * 4.0;
  if(b4 < 1.0)      col = mix(u_c0, u_c1, b4);
  else if(b4 < 2.0) col = mix(u_c1, u_c2, b4-1.0);
  else if(b4 < 3.0) col = mix(u_c2, u_c3, b4-2.0);
  else               col = mix(u_c3, u_c4, b4-3.0);

  float vig = 1.0 - smoothstep(0.4, 1.2, length(uv - 0.5) * 1.5);
  col *= mix(0.55, 1.0, vig);

  float foam = exp(-mouseDist * 5.0) * u_mouseInfluence * 0.12;
  col += foam * vec3(0.7, 1.0, 0.95);

  gl_FragColor = vec4(col, 1.0);
}
`

const PALETTE = [
  [0.04, 0.09, 0.14],
  [0.02, 0.24, 0.36],
  [0.04, 0.55, 0.65],
  [0.25, 0.92, 0.88],
  [0.70, 1.00, 0.92],
]

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  return s
}

export default function OceanBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null
    if (!gl) return

    const prog = gl.createProgram()!
    gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const u = {
      res: gl.getUniformLocation(prog, 'u_res'),
      time: gl.getUniformLocation(prog, 'u_time'),
      mouse: gl.getUniformLocation(prog, 'u_mouse'),
      mouseInfluence: gl.getUniformLocation(prog, 'u_mouseInfluence'),
      waves: gl.getUniformLocation(prog, 'u_waves'),
      c0: gl.getUniformLocation(prog, 'u_c0'),
      c1: gl.getUniformLocation(prog, 'u_c1'),
      c2: gl.getUniformLocation(prog, 'u_c2'),
      c3: gl.getUniformLocation(prog, 'u_c3'),
      c4: gl.getUniformLocation(prog, 'u_c4'),
    }

    PALETTE.forEach((color, i) => {
      gl.uniform3fv(u[`c${i}` as keyof typeof u], color)
    })

    const mouse = { x: 0.5, y: 0.5 }
    const smooth = { x: 0.5, y: 0.5 }

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth
      mouse.y = 1 - e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMouseMove)

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    window.addEventListener('resize', resize)
    resize()

    const start = performance.now()
    let rafId: number

    const render = (ts: number) => {
      rafId = requestAnimationFrame(render)
      smooth.x += (mouse.x - smooth.x) * 0.04
      smooth.y += (mouse.y - smooth.y) * 0.04

      gl.uniform2f(u.res, canvas.width, canvas.height)
      gl.uniform1f(u.time, ((ts - start) / 1000) * 0.7)
      gl.uniform2f(u.mouse, smooth.x, smooth.y)
      gl.uniform1f(u.mouseInfluence, 0)
      gl.uniform1f(u.waves, 3)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  )
}
