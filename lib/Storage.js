import Cookies from "universal-cookie";

const browser = typeof window !== "undefined";
const data = browser ? new Cookies() : new Map();

export default class Storage {
  set(key, value) {
    data.set(key, value);
    return this;
  }

  get(key) {
    return data.get(key);
  }

  delete(key) {
    if (data instanceof Map) data.delete(key);
    else data.remove(key);
    return this;
  }
}
