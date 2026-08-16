" Invariant: a semantic dark color scheme based on Monokai.
" Derived from "Sublime Text 2" by Filip Minev, distributed with Eclipse Color Theme under EPL-1.0.
" Fixed surfaces copied from Islands Dark 2026.2:
" editor, console, and gutter #191a1c; documentation and completion popups #27282b.

highlight clear
if exists('syntax_on')
  syntax reset
endif

let g:colors_name = 'invariant'
set background=dark

highlight Normal       guifg=#cfbfad guibg=#191a1c ctermfg=250 ctermbg=235
highlight Comment      guifg=#ffffff guibg=NONE    ctermfg=231 ctermbg=NONE
highlight Constant     guifg=#ece47e guibg=NONE    ctermfg=186 ctermbg=NONE
highlight String       guifg=#ece47e guibg=NONE    ctermfg=186 ctermbg=NONE
highlight Number       guifg=#c48cff guibg=NONE    ctermfg=177 ctermbg=NONE
highlight Identifier   guifg=#cfbfad guibg=NONE    ctermfg=250 ctermbg=NONE
highlight Function     guifg=#a7ec21 guibg=NONE    ctermfg=154 ctermbg=NONE
highlight Statement    guifg=#ff007f guibg=NONE gui=bold ctermfg=198 ctermbg=NONE cterm=bold
highlight PreProc      guifg=#ff007f guibg=NONE gui=bold ctermfg=198 ctermbg=NONE cterm=bold
highlight Type         guifg=#52e3f6 guibg=NONE    ctermfg=81  ctermbg=NONE
highlight Special      guifg=#c48cff guibg=NONE    ctermfg=177 ctermbg=NONE
highlight Underlined   guifg=#589df6 guibg=NONE gui=underline ctermfg=75 ctermbg=NONE cterm=underline
highlight Error        guifg=#bc3f3c guibg=NONE    ctermfg=167 ctermbg=NONE
highlight Todo         guifg=#ffffff guibg=NONE gui=bold ctermfg=231 ctermbg=NONE cterm=bold

highlight Cursor       guifg=#191a1c guibg=#999999 ctermfg=235 ctermbg=246
highlight CursorLine   guifg=NONE    guibg=#5b5a4e ctermfg=NONE ctermbg=239
highlight LineNr       guifg=#999999 guibg=#191a1c ctermfg=246 ctermbg=235
highlight CursorLineNr guifg=#efefef guibg=#5b5a4e gui=bold ctermfg=255 ctermbg=239 cterm=bold
highlight Visual       guifg=#404040 guibg=#cc9900 ctermfg=238 ctermbg=172
highlight Search       guifg=NONE    guibg=#32593d ctermfg=NONE ctermbg=23
highlight IncSearch    guifg=#404040 guibg=#cc9900 ctermfg=238 ctermbg=172
highlight MatchParen   guifg=NONE    guibg=#3b514d ctermfg=NONE ctermbg=23
highlight ColorColumn  guifg=NONE    guibg=#3c3c3c ctermfg=NONE ctermbg=237
highlight VertSplit    guifg=#393a3c guibg=#191a1c ctermfg=237 ctermbg=235
highlight StatusLine   guifg=#efefef guibg=#3c3f41 ctermfg=255 ctermbg=237
highlight StatusLineNC guifg=#999999 guibg=#272822 ctermfg=246 ctermbg=235
highlight Pmenu        guifg=#cfbfad guibg=#27282b ctermfg=250 ctermbg=237
highlight PmenuSel     guifg=#efefef guibg=#5b5a4e ctermfg=255 ctermbg=239
highlight Folded       guifg=#999999 guibg=#3c3f41 ctermfg=246 ctermbg=237
highlight NonText      guifg=#7b7468 guibg=NONE    ctermfg=243 ctermbg=NONE
highlight SpecialKey   guifg=#7b7468 guibg=NONE    ctermfg=243 ctermbg=NONE

highlight DiffAdd      guifg=NONE guibg=#294436 ctermfg=NONE ctermbg=23
highlight DiffChange   guifg=NONE guibg=#374752 ctermfg=NONE ctermbg=24
highlight DiffDelete   guifg=NONE guibg=#484a4a ctermfg=NONE ctermbg=238
highlight DiffText     guifg=NONE guibg=#455663 ctermfg=NONE ctermbg=24
highlight DiagnosticError guifg=#ff6b68 guibg=NONE ctermfg=203 ctermbg=NONE
highlight DiagnosticWarn  guifg=#be9117 guibg=NONE ctermfg=178 ctermbg=NONE
highlight DiagnosticInfo  guifg=#589df6 guibg=NONE ctermfg=75  ctermbg=NONE
highlight DiagnosticHint  guifg=#659c6b guibg=NONE ctermfg=71  ctermbg=NONE

highlight SM2Parameter guifg=#79abff guibg=NONE ctermfg=111 ctermbg=NONE
highlight SM2Signature guifg=#bed6ff guibg=NONE ctermfg=153 ctermbg=NONE
highlight SM2Static    guifg=NONE    guibg=NONE gui=italic ctermfg=NONE ctermbg=NONE cterm=italic
highlight SM2Module    guifg=#fd971f guibg=NONE gui=italic ctermfg=208 ctermbg=NONE cterm=italic
highlight! link pythonClassVar Statement

if has('nvim')
  highlight! link @variable Identifier
  highlight! link @variable.builtin Statement
  highlight! link @variable.member Identifier
  highlight! link @variable.parameter SM2Parameter
  highlight! link @function Function
  highlight! link @function.method Function
  highlight! link @constructor Function
  highlight! link @type Type
  highlight! link @type.builtin Type
  highlight! link @lsp.type.class Type
  highlight! link @lsp.type.interface Type
  highlight! link @lsp.type.parameter SM2Parameter
  highlight! link @lsp.type.property Identifier
  highlight! link @lsp.type.variable Identifier
  highlight! link @lsp.type.function Function
  highlight! link @lsp.type.method Function
  highlight! link @lsp.mod.abstract SM2Signature
  highlight! link @lsp.mod.static SM2Static
  highlight! link @module.python SM2Module
  highlight! link @module.builtin.python SM2Module
  highlight! link @lsp.type.namespace.python SM2Module
endif

let g:terminal_ansi_colors = [
      \ '#191a1c', '#ff6b68', '#a8c023', '#d6bf55',
      \ '#5394ec', '#ae8abe', '#299999', '#bbbbbb',
      \ '#555555', '#ff8785', '#a7ec21', '#ffff00',
      \ '#7eaef1', '#ff99ff', '#6cdada', '#f9faf4'
      \ ]
