declare module 'js-interpreter' {
  export default class Interpreter {
    constructor(code: string, initialise?: (interpreter: Interpreter, global: object) => void);
    step(): boolean;
    setProperty(object: object, name: string, value: unknown): void;
    createNativeFunction(callback: (...args: unknown[]) => unknown): object;
  }
}
