import {
  vec3,
  mat4,
  MatrIdentity,
  MatrTranspose,
  MatrMulMatr,
} from "../mth/math.js";
export { vec3, mat4, MatrIdentity };

class _prim {
  constructor(gl, V, NumofV, I, shd) {
    this.Trans = mat4().setIdentity();
    if (I != undefined) {
      this.NumofElements = I.length;
      this.IBuf = gl.createBuffer();
    } else {
      if (V != undefined) {
        this.NumofElements = V.length;
      }
    }
    this.NV = NumofV;
    this.VBuf = gl.createBuffer();
    this.VA = gl.createVertexArray();
    gl.bindVertexArray(this.VA);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.VBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(V), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int32Array(I), gl.STATIC_DRAW);

    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 10 * 4, 0);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 10 * 4, 4 * 3);

    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 10 * 4, 4 * 7);
    
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);

    
    gl.bindVertexArray(null);
    this.shader = shd;
    this.gl = gl;
  }
}
export function prim(...args) {
  return new _prim(...args);
} // End of 'prim' function

export function primDraw(Pr, cam, World) {
  let w = MatrMulMatr(Pr.Trans, World);
  let winw = MatrTranspose(mat4(w).inverse());
  let wvp = mat4(w).mul(cam.matrVP);
  Pr.gl.useProgram(Pr.shader);
  Pr.gl.bindVertexArray(Pr.VA);
  let loc1 = Pr.gl.getUniformLocation(Pr.shader, "MatrWVP");
  if (loc1 != null)
    Pr.gl.uniformMatrix4fv(loc1, false, new Float32Array(wvp.toArray()));
  let loc2 = Pr.gl.getUniformLocation(Pr.shader, "MatrW");
  if (loc2 != null)
    Pr.gl.uniformMatrix4fv(loc2, false, new Float32Array(w.toArray()));
  let loc3 = Pr.gl.getUniformLocation(Pr.shader, "MatrInv");
  if (loc3 != null)
    Pr.gl.uniformMatrix4fv(loc3, false, new Float32Array(winw.toArray()));

  if (Pr.IBuf != undefined) {
    Pr.gl.bindBuffer(Pr.gl.ELEMENT_ARRAY_BUFFER, Pr.IBuf);
    Pr.gl.drawElements(
      Pr.gl.TRIANGLE_STRIP,
      Pr.NumofElements,
      Pr.gl.UNSIGNED_INT,
      0
    );
    Pr.gl.bindBuffer(Pr.gl.ELEMENT_ARRAY_BUFFER, null);
  } else {
    Pr.gl.drawArrays(Pr.gl.TRIANGLES, 0, Pr.NumofElements);
  }

  Pr.gl.bindVertexArray(null);
  Pr.gl.useProgram(null);
}
