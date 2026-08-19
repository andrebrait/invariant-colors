const vscode = require('vscode');
const { createIndex, initializeLanguages } = require('./language-index');

const SUPPORTED = ['php', 'python', 'java', 'shellscript'];
const phpLegend = new vscode.SemanticTokensLegend(['parameter']);

function position(document, point) {
  const line = document.lineAt(point.row).text;
  let bytes = 0;
  let utf16 = 0;
  for (const character of line) {
    if (bytes >= point.column) break;
    bytes += Buffer.byteLength(character);
    utf16 += character.length;
  }
  return new vscode.Position(point.row, utf16);
}

function range(document, token) {
  return new vscode.Range(position(document, token.startPosition), position(document, token.endPosition));
}

exports.activate = async context => {
  await initializeLanguages(SUPPORTED);
  const changed = new vscode.EventEmitter();
  const modified = vscode.window.createTextEditorDecorationType({ textDecoration: 'underline' });
  const states = new Map();
  const enabled = languageId => vscode.workspace
    .getConfiguration('invariantHighlighter')
    .get('languages', SUPPORTED)
    .includes(languageId);
  const stateFor = document => {
    const key = document.uri.toString();
    let state = states.get(key);
    if (!state) {
      state = { version: document.version, index: createIndex(document.languageId, document.getText()) };
      states.set(key, state);
    } else if (state.version !== document.version) {
      state.index.replace(document.getText());
      state.version = document.version;
    }
    return state;
  };
  const decorate = document => {
    if (!SUPPORTED.includes(document.languageId)) return;
    const ranges = enabled(document.languageId)
      ? stateFor(document).index.tokens
        .filter(token => token.modifiers.includes('modification'))
        .map(token => range(document, token))
      : [];
    for (const editor of vscode.window.visibleTextEditors) {
      if (editor.document === document) editor.setDecorations(modified, ranges);
    }
  };

  const phpProvider = {
    onDidChangeSemanticTokens: changed.event,
    provideDocumentSemanticTokens(document) {
      const builder = new vscode.SemanticTokensBuilder(phpLegend);
      if (!enabled('php')) return builder.build();
      for (const token of stateFor(document).index.tokens) {
        if (token.type === 'parameter') builder.push(range(document, token), 'parameter', []);
      }
      return builder.build();
    }
  };

  context.subscriptions.push(
    changed,
    modified,
    vscode.languages.registerDocumentSemanticTokensProvider('php', phpProvider, phpLegend),
    vscode.workspace.onDidChangeTextDocument(({ document, contentChanges }) => {
      if (!SUPPORTED.includes(document.languageId) || !enabled(document.languageId)) return;
      const state = states.get(document.uri.toString());
      if (!state) return;
      const tokensChanged = state.version + 1 === document.version
        ? state.index.update(document.getText(), contentChanges)
        : (state.index.replace(document.getText()), true);
      state.version = document.version;
      if (tokensChanged) {
        decorate(document);
        if (document.languageId === 'php') changed.fire();
      }
    }),
    vscode.window.onDidChangeVisibleTextEditors(editors => {
      for (const editor of editors) decorate(editor.document);
    }),
    vscode.workspace.onDidChangeConfiguration(event => {
      if (!event.affectsConfiguration('invariantHighlighter.languages')) return;
      for (const { index } of states.values()) index.delete();
      states.clear();
      for (const editor of vscode.window.visibleTextEditors) decorate(editor.document);
      changed.fire();
    }),
    vscode.workspace.onDidCloseTextDocument(document => {
      const key = document.uri.toString();
      states.get(key)?.index.delete();
      states.delete(key);
    }),
    { dispose: () => {
      for (const { index } of states.values()) index.delete();
      states.clear();
    } }
  );

  for (const editor of vscode.window.visibleTextEditors) decorate(editor.document);
};
