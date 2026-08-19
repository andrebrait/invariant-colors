const { Language, Parser } = require('@vscode/tree-sitter-wasm');

const set = values => new Set(values);
const fieldName = node => {
  const parent = node.parent;
  if (!parent) return undefined;
  for (let index = 0; index < parent.childCount; index++) {
    if (parent.child(index)?.equals(node)) return parent.fieldNameForChild(index) || undefined;
  }
};
const hasAncestor = (node, scope, types) => {
  for (let parent = node.parent; parent && parent !== scope; parent = parent.parent) {
    if (types.has(parent.type)) return true;
  }
  return false;
};
const isAssigned = (node, scope, types) => {
  for (let parent = node.parent; parent && parent !== scope; parent = parent.parent) {
    if (types.has(parent.type)) {
      const left = parent.childForFieldName('left');
      return left ? left.startIndex <= node.startIndex && left.endIndex >= node.endIndex : false;
    }
    if (parent.type === 'update_expression') return true;
  }
  return false;
};

const adapters = {
  php: {
    wasm: 'php',
    scopes: set(['program', 'function_definition', 'anonymous_function', 'arrow_function']),
    variable: node => node.type === 'variable_name',
    parameter: (node, scope) => hasAncestor(node, scope,
      set(['simple_parameter', 'variadic_parameter', 'property_promotion_parameter'])),
    write: (node, scope) => isAssigned(node, scope,
      set(['assignment_expression', 'augmented_assignment_expression'])),
    publishParameters: true
  },
  python: {
    wasm: 'python',
    scopes: set(['module', 'function_definition', 'lambda']),
    variable: (node, scope) => {
      if (node.type !== 'identifier' || hasAncestor(node, scope, set(['type', 'import_statement', 'import_from_statement']))) {
        return false;
      }
      const field = fieldName(node);
      if (field === 'name' && set(['function_definition', 'class_definition', 'attribute', 'keyword_argument']).has(node.parent?.type)) {
        return false;
      }
      return !(field === 'function' && node.parent?.type === 'call');
    },
    parameter: (node, scope) => node.parent?.type === 'parameters' || hasAncestor(node, scope,
      set(['typed_parameter', 'typed_default_parameter', 'default_parameter', 'list_splat_pattern', 'dictionary_splat_pattern'])),
    write: (node, scope) => isAssigned(node, scope,
      set(['assignment', 'augmented_assignment', 'named_expression'])),
    publishParameters: false
  },
  java: {
    wasm: 'java',
    scopes: set(['program', 'class_declaration', 'method_declaration', 'constructor_declaration', 'lambda_expression']),
    variable: node => {
      if (node.type !== 'identifier') return false;
      const field = fieldName(node);
      return !(field === 'name' && set([
        'class_declaration', 'interface_declaration', 'enum_declaration', 'method_declaration',
        'constructor_declaration', 'method_invocation', 'object_creation_expression'
      ]).has(node.parent?.type));
    },
    parameter: (node, scope) => hasAncestor(node, scope,
      set(['formal_parameter', 'spread_parameter', 'catch_formal_parameter', 'receiver_parameter'])),
    write: (node, scope) => {
      if (node.parent?.type === 'variable_declarator' && fieldName(node) === 'name') return true;
      return isAssigned(node, scope, set(['assignment_expression']));
    },
    publishParameters: false
  },
  shellscript: {
    wasm: 'bash',
    scopes: set(['program', 'function_definition', 'subshell']),
    variable: node => node.type === 'variable_name',
    parameter: () => false,
    write: node => node.parent?.type === 'variable_assignment' && fieldName(node) === 'name',
    publishParameters: false
  }
};

function pointAt(text, index) {
  const lines = text.slice(0, index).split('\n');
  return { row: lines.length - 1, column: Buffer.byteLength(lines.at(-1)) };
}
function advance(point, text) {
  const lines = text.split('\n');
  return lines.length === 1
    ? { row: point.row, column: point.column + Buffer.byteLength(text) }
    : { row: point.row + lines.length - 1, column: Buffer.byteLength(lines.at(-1)) };
}
const byteOffset = (text, utf16Offset) => Buffer.byteLength(text.slice(0, utf16Offset));

function scopeNodes(root, adapter) {
  const scopes = [];
  const visit = node => {
    if (adapter.scopes.has(node.type)) scopes.push(node);
    for (const child of node.namedChildren) if (child) visit(child);
  };
  visit(root);
  return scopes;
}
function occurrences(scope, adapter) {
  const variables = [];
  const visit = node => {
    if (node !== scope && adapter.scopes.has(node.type)) return;
    if (adapter.variable(node, scope)) variables.push(node);
    for (const child of node.namedChildren) if (child) visit(child);
  };
  visit(scope);
  return variables;
}
function analyze(scope, adapter) {
  const parameters = new Set();
  const writes = new Map();
  for (const node of occurrences(scope, adapter)) {
    const name = node.text;
    if (adapter.parameter(node, scope)) parameters.add(name);
    if (adapter.write(node, scope)) writes.set(name, (writes.get(name) || 0) + 1);
  }
  const modified = new Set();
  for (const [name, count] of writes) {
    if (count >= (parameters.has(name) ? 1 : 2)) modified.add(name);
  }
  return { parameters, modified };
}
function indexTree(tree, adapter, previous = new Map()) {
  const cache = new Map();
  const tokens = [];
  let reused = 0;
  for (const scope of scopeNodes(tree.rootNode, adapter)) {
    const cached = previous.get(scope.id);
    const classification = cached && !scope.hasChanges ? cached : analyze(scope, adapter);
    if (classification === cached) reused++;
    cache.set(scope.id, classification);
    for (const node of occurrences(scope, adapter)) {
      const name = node.text;
      const parameter = classification.parameters.has(name);
      const modification = classification.modified.has(name);
      if (!modification && !(parameter && adapter.publishParameters)) continue;
      tokens.push({
        name,
        type: parameter ? 'parameter' : 'variable',
        modifiers: modification ? ['modification'] : [],
        startPosition: node.startPosition,
        endPosition: node.endPosition
      });
    }
  }
  return { cache, reused, tokens };
}
const tokenKey = token =>
  `${token.type}:${token.modifiers.join('.')}:${token.startPosition.row}:${token.startPosition.column}:${token.endPosition.row}:${token.endPosition.column}`;

class DocumentIndex {
  constructor(languageId, parser, text) {
    this.languageId = languageId;
    this.adapter = adapters[languageId];
    this.parser = parser;
    this.text = text;
    this.tree = parser.parse(text);
    this.index = indexTree(this.tree, this.adapter);
  }
  update(text, changes) {
    const before = this.index.tokens.map(tokenKey).join('|');
    if (!changes.length) return false;
    for (const change of [...changes].sort((left, right) => right.rangeOffset - left.rangeOffset)) {
      const startPosition = pointAt(this.text, change.rangeOffset);
      const startIndex = byteOffset(this.text, change.rangeOffset);
      this.tree.edit({
        startIndex,
        oldEndIndex: byteOffset(this.text, change.rangeOffset + change.rangeLength),
        newEndIndex: startIndex + Buffer.byteLength(change.text),
        startPosition,
        oldEndPosition: pointAt(this.text, change.rangeOffset + change.rangeLength),
        newEndPosition: advance(startPosition, change.text)
      });
    }
    const updated = this.parser.parse(text, this.tree);
    this.tree.delete();
    this.text = text;
    this.tree = updated;
    this.index = indexTree(updated, this.adapter, this.index.cache);
    return before !== this.index.tokens.map(tokenKey).join('|');
  }
  replace(text) {
    this.tree.delete();
    this.text = text;
    this.tree = this.parser.parse(text);
    this.index = indexTree(this.tree, this.adapter);
  }
  delete() { this.tree.delete(); }
  get tokens() { return this.index.tokens; }
}

let initialized;
const languages = new Map();
async function initializeLanguages(languageIds) {
  initialized ||= Parser.init({
    locateFile: () => require.resolve('@vscode/tree-sitter-wasm/wasm/tree-sitter.wasm')
  });
  await initialized;
  await Promise.all(languageIds.map(async languageId => {
    if (!languages.has(languageId)) {
      languages.set(languageId, await Language.load(require.resolve(
        `@vscode/tree-sitter-wasm/wasm/tree-sitter-${adapters[languageId].wasm}.wasm`
      )));
    }
  }));
}
function createIndex(languageId, text = '') {
  const language = languages.get(languageId);
  if (!language) throw new Error(`initializeLanguages() must load ${languageId} first`);
  const parser = new Parser();
  parser.setLanguage(language);
  return new DocumentIndex(languageId, parser, text);
}

module.exports = { adapters, createIndex, indexTree, initializeLanguages };
