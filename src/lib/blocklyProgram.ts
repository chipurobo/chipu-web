export interface BlocklyProgram {
  workspace: Record<string, unknown>;
  code: string;
  output: string;
}

export const starterWorkspace = {
  blocks: { languageVersion: 0, blocks: [{ type: 'text_print', x: 30, y: 30,
    inputs: { TEXT: { block: { type: 'text', fields: { TEXT: 'Hello, ChipuRobo!' } } } } }] },
};
