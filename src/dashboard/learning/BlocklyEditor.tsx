import { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';
import { javascriptGenerator } from 'blockly/javascript';
import type { LearningLevel } from '../../lib/learningFramework';
import { starterWorkspace, type BlocklyProgram } from '../../lib/blocklyProgram';

const messages: Record<string, string> = {};
for (const [key, value] of Object.entries(En)) if (typeof value === 'string') messages[key] = value;
Blockly.setLocale(messages);
const category = (name: string, colour: string, types: string[]): Blockly.utils.toolbox.StaticCategoryInfo => ({ kind: 'category', name, colour,
  id: undefined, categorystyle: undefined, cssconfig: undefined, hidden: undefined,
  contents: types.map((type) => ({ kind: 'block', type })) });
function toolbox(level: LearningLevel): Blockly.utils.toolbox.ToolboxInfo {
  const contents: Blockly.utils.toolbox.ToolboxItemInfo[] = [
    category('Output and text', '#166534', ['text_print', 'text', 'text_join', 'text_length']),
    category('Numbers', '#1e40af', ['math_number', 'math_arithmetic', 'math_round', 'math_random_int']),
    category('Decisions', '#3730a3', ['controls_if', 'logic_compare', 'logic_operation', 'logic_boolean']),
    category('Loops', '#854d0e', level === 'beginner' ? ['controls_repeat_ext'] : ['controls_repeat_ext', 'controls_whileUntil', 'controls_for']),
  ];
  contents.push({ kind: 'category', name: 'Variables', colour: '#9a3412', custom: 'VARIABLE' });
  if (level !== 'beginner') contents.push(category('Lists', '#86198f', ['lists_create_with', 'lists_length', 'lists_getIndex', 'lists_setIndex']));
  if (level === 'expert') contents.push({ kind: 'category', name: 'Functions', colour: '#6b21a8', custom: 'PROCEDURE' });
  return { kind: 'categoryToolbox', contents };
}

export function BlocklyEditor({ initial, level = 'beginner', readOnly = false, onChange }: {
  initial?: BlocklyProgram | null; level?: LearningLevel; readOnly?: boolean;
  onChange?: (program: BlocklyProgram, blockCount: number) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  const callback = useRef(onChange);
  callback.current = onChange;
  const initialRef = useRef(initial);
  const worker = useRef<Worker | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const outputRef = useRef(initial?.output ?? '');
  const [code, setCode] = useState(initial?.code ?? '');
  const [output, setOutput] = useState(initial?.output ?? '');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockCount, setBlockCount] = useState(0);

  function stopWorker() {
    worker.current?.terminate(); worker.current = null;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }
  useEffect(() => {
    if (!host.current) return;
    const ws = Blockly.inject(host.current, { toolbox: readOnly ? undefined : toolbox(level), readOnly,
      renderer: 'zelos', media: '/blockly-media/', maxBlocks: 200, sounds: false, trashcan: !readOnly, modalInputs: false,
      horizontalLayout: host.current.clientWidth < 600,
      move: { scrollbars: true, drag: true, wheel: false }, zoom: { controls: true, wheel: false, startScale: 0.85 },
      grid: { spacing: 25, length: 3, colour: '#cbd5e1', snap: true } });
    workspace.current = ws;
    Blockly.Events.disable();
    try { Blockly.serialization.workspaces.load(initialRef.current?.workspace ?? (readOnly ? {} : starterWorkspace), ws); }
    catch { setError('This saved program could not be opened. Your saved work has not been changed.'); }
    finally { Blockly.Events.enable(); }
    function changed(event?: Blockly.Events.Abstract) {
      if (event?.isUiEvent) return;
      try {
        const generated = readOnly ? initialRef.current?.code ?? '' : javascriptGenerator.workspaceToCode(ws);
        const count = ws.getAllBlocks(false).length;
        if (event && worker.current) { stopWorker(); setRunning(false); }
        if (event) { outputRef.current = ''; setOutput(''); }
        setCode(generated); setBlockCount(count);
        callback.current?.({ workspace: Blockly.serialization.workspaces.save(ws), code: generated, output: outputRef.current }, count);
      } catch { setError('A block could not generate code. Check your program.'); }
    }
    changed(); ws.addChangeListener(changed);
    const observer = new ResizeObserver(() => Blockly.svgResize(ws));
    observer.observe(host.current);
    return () => { observer.disconnect(); stopWorker(); ws.removeChangeListener(changed); ws.dispose(); workspace.current = null; };
  }, [level, readOnly]);

  function run() {
    stopWorker(); setRunning(true); setError(null); setOutput(''); outputRef.current = '';
    const activeWorker = new Worker(new URL('../../lib/blocklyRunner.worker.ts', import.meta.url), { type: 'module' });
    worker.current = activeWorker;
    function finish(result: { output: string; error: string | null }) {
      if (worker.current !== activeWorker) return;
      stopWorker(); setRunning(false); setOutput(result.output); outputRef.current = result.output; setError(result.error);
      if (workspace.current) callback.current?.({ workspace: Blockly.serialization.workspaces.save(workspace.current), code, output: result.output }, blockCount);
    }
    activeWorker.onmessage = (event) => finish(event.data);
    activeWorker.onerror = () => finish({ output: '', error: 'The program could not run. Please try again.' });
    timer.current = setTimeout(() => finish({ output: '', error: 'Program stopped after 3 seconds. Check your loops.' }), 3000);
    activeWorker.postMessage(code);
  }
  return <section className="space-y-3 min-w-0" aria-label={readOnly ? 'Submitted Blockly program' : 'Blockly coding workspace'}>
    {!readOnly && <>
      <p className="text-sm text-gray-700">Choose blocks, connect them and run your program. Use the print block to show output.</p>
      <details className="text-sm"><summary className="cursor-pointer underline">Keyboard controls</summary>
        <p className="mt-2">Tab to the workspace. Press T for the toolbox, arrow keys to navigate, Enter to add a block or edit a value, M to move a block, and Delete to remove it. Tab leaves the workspace.</p></details>
    </>}
    <div ref={host} className="blockly-editor h-[420px] sm:h-[480px] w-full border border-gray-400 rounded-md overflow-hidden" />
    {!readOnly && <div className="flex gap-3 flex-wrap">
      <button type="button" className="btn-primary" onClick={run} disabled={running || !blockCount}>{running ? 'Running…' : 'Run program'}</button>
      {running && <button type="button" className="btn-secondary" onClick={() => { stopWorker(); setRunning(false); setError('Program stopped.'); }}>Stop program</button>}
    </div>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <div><h3 className="text-base">Program output</h3><pre role="status" aria-live="polite" className="bg-gray-50 border rounded-md p-3 text-sm whitespace-pre-wrap break-words max-h-56 overflow-auto">{output || 'Run your program to see its output.'}</pre></div>
    <details className="text-sm"><summary className="cursor-pointer underline">{readOnly ? 'Submitted JavaScript' : 'View generated JavaScript'}</summary><pre className="bg-gray-50 p-3 whitespace-pre-wrap break-words">{code || 'Add blocks to create a program.'}</pre></details>
    <p className="text-xs text-gray-600">Powered by <a href="https://blockly.com/" className="!text-teal-800 underline" target="_blank" rel="noopener noreferrer">Blockly</a>. Programs run in the browser; hardware connection is not available here yet.</p>
  </section>;
}
