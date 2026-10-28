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
    category('Choices (if)', '#3730a3', ['controls_if', 'logic_compare', 'logic_operation', 'logic_boolean']),
    category('Repeat (loops)', '#854d0e', level === 'beginner' ? ['controls_repeat_ext'] : ['controls_repeat_ext', 'controls_whileUntil', 'controls_for']),
  ];
  contents.push({ kind: 'category', name: 'Remember (variables)', colour: '#9a3412', custom: 'VARIABLE' });
  if (level !== 'beginner') contents.push(category('Lists', '#86198f', ['lists_create_with', 'lists_length', 'lists_getIndex', 'lists_setIndex']));
  if (level === 'expert') contents.push({ kind: 'category', name: 'My own blocks (functions)', colour: '#6b21a8', custom: 'PROCEDURE' });
  return { kind: 'categoryToolbox', contents };
}

export function BlocklyEditor({ initial, level = 'beginner', readOnly = false, drawers = true, onChange }: {
  initial?: BlocklyProgram | null; level?: LearningLevel; readOnly?: boolean;
  /** false: no block drawers on the left; learners change the starter blocks only and cannot delete them. */
  drawers?: boolean;
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
    const ws = Blockly.inject(host.current, { toolbox: readOnly || !drawers ? undefined : toolbox(level), readOnly,
      renderer: 'zelos', media: '/blockly-media/', maxBlocks: 200, sounds: false, trashcan: !readOnly && drawers, modalInputs: false,
      horizontalLayout: host.current.clientWidth < 600,
      move: { scrollbars: true, drag: true, wheel: false }, zoom: { controls: true, wheel: false, startScale: 0.85 },
      grid: { spacing: 25, length: 3, colour: '#cbd5e1', snap: true } });
    workspace.current = ws;
    Blockly.Events.disable();
    try {
      Blockly.serialization.workspaces.load(initialRef.current?.workspace ?? (readOnly ? {} : starterWorkspace), ws);
      // Without drawers a deleted block could not come back, so blocks stay put.
      if (!drawers && !readOnly) ws.getAllBlocks(false).forEach((block) => block.setDeletable(false));
    }
    catch { setError("We couldn't open your saved blocks, but don't worry, they're still safe."); }
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
      } catch { setError("Hmm, one of your blocks isn't quite finished. Take a look and try again."); }
    }
    changed(); ws.addChangeListener(changed);
    const observer = new ResizeObserver(() => Blockly.svgResize(ws));
    observer.observe(host.current);
    return () => { observer.disconnect(); stopWorker(); ws.removeChangeListener(changed); ws.dispose(); workspace.current = null; };
  }, [level, readOnly, drawers]);

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
    activeWorker.onerror = () => finish({ output: '', error: "Oops, that didn't run. Give it another try." });
    timer.current = setTimeout(() => finish({ output: '', error: 'Your program ran for a long time, so we paused it. Check if a repeat never ends.' }), 3000);
    activeWorker.postMessage(code);
  }
  return <section className="space-y-3 min-w-0" aria-label={readOnly ? 'Submitted Blockly program' : 'Blockly coding workspace'}>
    {!readOnly && <>
      <p className="sr-only">{drawers ? 'Drag blocks out of the drawers, snap them together, then press Run.' : 'Change the words in the blocks, then press Run.'} The print block shows words on the screen.</p>
      <details className="text-sm"><summary className="cursor-pointer underline"><span aria-hidden="true">⌨️ </span>Using the keyboard</summary>
        <p className="mt-2">{drawers
          ? 'Tab to the workspace. Press T for the toolbox, arrow keys to navigate, Enter to add a block or edit a value, M to move a block, and Delete to remove it. Tab leaves the workspace.'
          : 'Tab to the workspace. Use the arrow keys to reach the words in a block, press Enter to change them, then Enter again. Tab leaves the workspace.'}</p></details>
    </>}
    <div ref={host} className="blockly-editor h-[420px] sm:h-[480px] w-full border border-gray-400 rounded-md overflow-hidden" />
    {!readOnly && <div className="flex gap-3 flex-wrap">
      <button type="button" className="btn-play" onClick={run} disabled={running || !blockCount}>{running ? 'Running…' : <><span aria-hidden="true">▶ </span>Run</>}</button>
      {running && <button type="button" className="btn-secondary" onClick={() => { stopWorker(); setRunning(false); setError('Stopped.'); }}>Stop program</button>}
    </div>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <div><h3 className="text-base">{readOnly ? 'Output' : 'Your program shows'}</h3><pre role="status" aria-live="polite" className="bg-slate-900 text-white rounded-md p-3 text-base whitespace-pre-wrap break-words max-h-56 overflow-auto">{output || (readOnly ? '' : 'Press Run to see what it shows.')}</pre></div>
    {readOnly && <details className="text-sm"><summary className="cursor-pointer underline">Submitted JavaScript</summary><pre className="bg-gray-50 p-3 whitespace-pre-wrap break-words">{code || '…'}</pre></details>}
  </section>;
}
