import Interpreter from 'js-interpreter';

// Programs have no DOM, network, storage or authentication APIs. A dedicated
// worker also lets the dashboard terminate a slow native operation.
self.onmessage = (event: MessageEvent<string>) => {
  const lines: string[] = [];
  let length = 0;
  try {
    const interpreter = new Interpreter(event.data, (instance, global) => {
      instance.setProperty(global, 'alert', instance.createNativeFunction((value) => {
        const line = String(value ?? '');
        length += line.length + 1;
        if (length > 10000 || lines.length >= 200) throw new Error('Output limit reached. Try fewer repetitions.');
        lines.push(line);
      }));
    });
    let steps = 0;
    while (interpreter.step()) {
      if (++steps > 100000) throw new Error('Program stopped after too many steps. Check your loops.');
    }
    self.postMessage({ output: lines.join('\n') || 'Program finished with no output.', error: null });
  } catch (error) {
    self.postMessage({ output: lines.join('\n'), error: error instanceof Error ? error.message : String(error) });
  }
};
