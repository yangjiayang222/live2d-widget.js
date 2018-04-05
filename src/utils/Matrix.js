/* eslint-disable no-magic-numbers */

import {
  create,
  multiply,
  identity,
  clone,
  copy,
} from 'gl-matrix/src/gl-matrix/mat4';

import {
  ARRAY_TYPE,
} from 'gl-matrix/src/gl-matrix/common';

// HACK ENDS

class MatrixStack {

  constructor () {

    this.currentMatrix = create();
    this.depth = 0;
    this.matrixStack = create();

  }

  /**
   * Reset current matrix stack.
   * @return  {Function}  The instance function itself.
   */
  reset () {

    this.depth = 0;
    return this;

  }

  /**
   * Set current matrix to the identity matrix.
   * @return  {Function}  The instance function itself.
   */
  loadIdentity () {

    this.currentMatrix = create();
    return this;

  }

  /**
   * Adds a matrix to the stack.
   *
   * This method increments the count of items on the stack by 1.
   * The stack grows dynamically as more items are added.
   *
   * @return  {Function}  The instance function itself.
   */
  push () {

    // Not using push() because Float32Array doesn't support it.
    const offset = (this.depth + 1) * 16;
    if(this.matrixStack.length < offset + 16) {

      // TypedArray.length is read only.
      const newLength = offset + 16;
      const newMatrixStack = new ARRAY_TYPE(newLength);
      newMatrixStack.set(this.matrixStack);
      this.matrixStack = newMatrixStack;

    }
    this.matrixStack.set(this.currentMatrix, offset);
    this.depth++;
    return this;

  }

  /**
   * Removes the current matrix from the top of the stack.
   *
   * This method decrements the count of items on the stack by 1,
   * effectively removing the current matrix from the top of the stack and promoting a different matrix to that position.
   * If the depth of the stack belows 0,
   * this method logs an error in console and empties the stack.
   * If the current count of items is 1,
   * the method empties the stack.
   *
   * @return  {Function}  The instance function itself.
   */
  pop () {

    this.depth--;
    if(this.depth < 0) {

      console.error('Matrix stack underflow.');
      this.depth = 0;
      return this;

    }
    const offset = (this.depth + 1) * 16;
    this.currentMatrix = this.matrixStack.slice(offset, offset + 16);
    return this;

  }

  /**
   * Returns current staging matrix.
   * @return  {Array}  Current staging matrix.
   */
  getMatrix () {

    return this.currentMatrix;

  }

  /**
   * Determines the product of the current matrix and a given matrix.
   * @param   {Array}     operMat  A matrix to multiply with the current matrix.
   * @return  {Function}           The instance function itself.
   */
  multMatrix (operMat) {

    this.currentMatrix = multiply(this.currentMatrix, this.currentMatrix, operMat);
    return this;

  }

}

class Matrix44 {

  constructor () {

    this.tr = new glMatrix.ARRAY_TYPE(16);
    this.identity();
    return this;

  }

  /**
   * Multplies two matrix44.
   * @param   {Array}  a    The first operand.
   * @param   {Array}  b    The second operand.
   * @param   {Array}  out  The receiving matrix.
   * @return  {Array}       Matrix multiplied.
   */
  static mul (a, b, out) {

    return multiply(out, a, b);

  }

  /**
   * Set current matrix44 to identity matrix.
   * @return  {Function}  The instance function itself.
   */
  identity () {

    this.tr = identity(this.tr);
    return this;

  }

  /**
   * Returns current matrix44.
   * @return  {Array}  Current matrix44.
   */
  getArray () {

    return this.tr;

  }

  /**
   * Creates a new matrix44 initalized with values from current matrix44.
   * @return  {Array}  Matrix copied.
   */
  getCopyMatrix () {

    return clone(this.tr);

  }
  /**
   * Copy the value from provided matrix44 to current one.
   * @param  {Array}  tr  The source matrix44.
   * @return {Function} The instance function itself.
   */
  setMatrix (tr) {

    this.tr = copy(this.tr, tr);
    return this;

  }

  /**
   * Returns current X scale.
   * @return  {Number}  Current X scale.
   */
  getScaleX () {

    return this.tr[0];

  }

  /**
   * Returns current Y scale.
   * @return  {Number}  Current Y scale.
   */
  getScaleY () {

    return this.tr[5];

  }

  /**
   * Returns current X translate.
   * @return  {Number}  Current X translate.
   */
  getTransX () {

    return this.tr[12];

  }

  /**
   * Returns current Y translate.
   * @return  {Number}  Current Y translate.
   */
  getTransY () {

    return this.tr[13];

  }

  /**
   * Returns X transformed by current matrix.
   * @param   {Number}  src  Number to be transformed.
   * @return  {Number}       X-transformed number.
   */
  transformX (src) {

    const t = this.tr[0] * src;

    return this.tr[12] + t;

  }

  /**
   * Returns Y transformed by current matrix.
   * @param   {Number}  src  Number to be transformed.
   * @return  {Number}       Y-transformed number.
   */
  transformY (src) {

    const t = this.tr[5] * src;

    return this.tr[13] + t;

  }

  /**
   * Returns the X-invertTransformed X-operand;
   * @param   {Number}  src  Number to operate X.
   * @return  {Number}       X-invertTransformed result.
   */
  invertTransformX (src) {

    return (src - this.tr[12]) / this.tr[0];

  }
  /**
   * Returns the Y-invertTransformed Y-operand;
   * @param   {Number}  src  Number to operate Y.
   * @return  {Number}       Y-invertTransformed result.
   */
  invertTransformY (src) {

    return (src - this.tr[13]) / this.tr[5];

  }

  /**
   * Multiply current matrix44 by given X and Y translate.
   * @param   {Number}  shiftX  X Shift to translate.
   * @param   {Number}  shiftY  Y shift to translate.
   * @return  {Function}        The instance function itself.
   */
  multTranslate (shiftX, shiftY) {

    const oper = create();
    oper[12] = shiftX;
    oper[13] = shiftY;
    this.tr = Matrix44.mul(oper, this.tr, this.tr);
    return this;

  }

  /**
   * Set X and Y translate to current matrix44.
   * @param   {Number}  x  X operand.
   * @param   {Number}  y  Y operand.
   * @return  {Function}     The instance function itself.
   */
  translate (x, y) {

    return this.translateX(x).translateY(y);

  }

  /**
   * Set X translate to current matrix44.
   * @param   {Number}  x  X operand.
   * @return  {Function}     The instance function itself.
   */
  translateX (x) {

    this.tr[12] = x;
    return this;

  }

  /**
   * Set Y translate to current matrix44.
   * @param   {Number}  y  Y operand.
   * @return  {Function}     The instance function itself.
   */
  translateY (y) {

    this.tr[13] = y;
    return this;

  }

  /**
   * Multiply current matrix44 by given X and Y scale.
   * @param   {Number}  scaleX  X scale to multiply.
   * @param   {Number}  scaleY  Y scale to multiply.
   * @return  {Function}          The instance function itself.
   */
  multScale (scaleX, scaleY) {

    const oper = create();
    oper[0] = scaleX;
    oper[5] = scaleY;
    this.tr = Matrix44.mul(oper, this.tr, this.tr);
    return this;

  }

  /**
   * Scale X and Y scale to current matrix44.
   * @param   {Number}  x  X operand.
   * @param   {Number}  y  Y operand.
   * @return  {Function}     The instance function itself.
   */
  scale (x, y) {

    return this.scaleX(x).scaleY(y);

  }

  /**
   * Set Y scale to current matrix44.
   * @param   {Number}  x  X operand.
   * @return  {Function}     The instance function itself.
   */
  scaleX (x) {

    this.tr[0] = x;
    return this;

  }

  /**
   * Set Y scale to current matrix44.
   * @param   {Number}  y  Y operand.
   * @return  {Function}   The instance function itself.
   */
  scaleY (y) {

    this.tr[5] = y;
    return this;

  }

}

export {
  MatrixStack,
  Matrix44,
};