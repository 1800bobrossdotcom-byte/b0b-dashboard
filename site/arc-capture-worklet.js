/* arc-capture-worklet.js - hands the raw microphone samples to ARC Shield's
 * evidence recorder, in blocks of 4,096, unprocessed. The page keeps a rolling
 * 30-second pre-roll from these blocks so a recording includes what happened
 * just before the record button was pressed. */
class ArcCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buf = new Float32Array(4096);
    this.n = 0;
  }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch) {
      for (let i = 0; i < ch.length; i++) {
        this.buf[this.n++] = ch[i];
        if (this.n === this.buf.length) {
          this.port.postMessage(this.buf);
          this.buf = new Float32Array(4096);
          this.n = 0;
        }
      }
    }
    return true;
  }
}
registerProcessor('arc-capture', ArcCapture);
