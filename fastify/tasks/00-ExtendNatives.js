/* eslint-disable no-extend-native */
export default function task() {
  BigInt.prototype.toJSON = function toJSON() {
    return this.toString();
  };
}
