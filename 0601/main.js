import {
  vec3,
  mat4,
  MatrIdentity,
  MatrTranspose,
  MatrMulMatr,
} from "../mth/math.js";
export { vec3, mat4, MatrIdentity };


function loadShader(gl, type, sourse) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, sourse);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("!!!!!");
  }

  return shader;
}

function InitGL() {
  const canvas = document.getElementById("glCanvas");
  const gl = canvas.getContext("webgl2");
  gl.clearColor(1, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const vs = `#version 300 es
        precision highp float;
        in vec4 in_pos;
        out vec4 color;
        out vec2 tpos;
        uniform float Time;
        void main()
        {
            gl_Position = in_pos;
            tpos = in_pos.xy;
            color = vec4(in_pos.xy, 0.7, 1);
        }
    `;

  const fs = `#version 300 es
        precision highp float;
        out vec4 o_color;
        in vec4 color;
        in vec2 tpos;
        uniform float Time;
        vec2 mul( vec2 z1, vec2 z2 ) {
          return vec2(z1.x * z2.x - z1.y * z2.y, z1.x * z2.y + z1.y * z2.x);
        }

        float Jul( vec2 z, vec2 z0 ) {
          for (int i = 0; i < 256; i++)
          {
            if (dot(z, z) > 4.0)
              return float(i);
            z = mul(z, z) + z0;
          }
          return 256.0;
        }
        void main()
        {
          float X0 = -2.0, X1 = 2.0, Y0 = -2.0, Y1 = 2.0, n;
          vec2 Z, C;
          C = vec2(0.35 +  0.8 * sin(Time), 0.38 + sin(Time * 1.1 - 0.3));
          Z = vec2(gl_FragCoord.x * (X1 - X0) / 500.0 + X0, gl_FragCoord.y * (Y1 - Y0) / 500.0 + Y0);

          n = Jul(Z, C) / 256.0;
          
          
          o_color = vec4(n * 16.0, n / 128.0, n * 2.0, 1);
        }
    `;
// color * Jul(tpos, vec2(0.35 + sin(Time), 0.38)) / 256.0
  const vertexsh = loadShader(gl, gl.VERTEX_SHADER, vs);
  const fragmentsh = loadShader(gl, gl.FRAGMENT_SHADER, fs);
  const program = gl.createProgram();
  const start = Date.now();
  
  
  gl.attachShader(program, vertexsh);
  gl.attachShader(program, fragmentsh);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert("!!!!");
  }

  const posLoc = gl.getAttribLocation(program, "in_pos");

  const posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  // const pos = [0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1,];
  const x = 1;
  const pos = [-x, x, 0, -x, -x, 0, x, x, 0, x, -x, 0];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
  gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(posLoc);
  gl.useProgram(program);

  const timeFromStart = Date.now() - start;
  const loc = gl.getUniformLocation(program, "Time");
  gl.uniform1f(loc, timeFromStart / 1000);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  const draw = () => {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posLoc);
    gl.useProgram(program);
    const timeFromStart = Date.now() - start;
    gl.uniform1f(loc, timeFromStart / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    window.requestAnimationFrame(draw);
  };
  draw();
}
