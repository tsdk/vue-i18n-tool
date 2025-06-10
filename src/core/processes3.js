const compiler = require('@vue/compiler-sfc');
const vuetemplatei18n = require('../plugins/vuetemplatei18n3');
const vuejsi18n = require('../plugins/vuejsi18n3');

const Processes = {
  vue: compileVueMiddleware,
  js: function (file) {
    const i18nList = [];
    const [updated, originList] = vuejsi18n(file.content, file.key);
    file.content = updated;
    i18nList.push(...originList);

    file.i18nList = i18nList;
    return file;
  },
};

// 需多次解析，避免错误
let parse;
function compileVueMiddleware(file) {
  const i18nList = [];
  console.log('current parse: ', file.filePath);
  parse = compiler.parse(file.content, {
    // expressionPlugins: ['typescript', 'jsx'],
  }).descriptor;
  // Template
  if (parse.template) {
    const [updated, originList = []] = vuetemplatei18n(
      parse.template.content,
      file.key
    );
    file.content =
      file.content.slice(0, parse.template.loc.start.offset) +
      updated +
      file.content.slice(parse.template.loc.end.offset);
    i18nList.push(...originList);
  }
  // Script
  parse = compiler.parse(file.content, {
    // expressionPlugins: ['typescript', 'jsx'],
  }).descriptor;
  if (parse.script) {
    const [updated, originList] = vuejsi18n(parse.script.content, file.key);
    file.content =
      file.content.slice(0, parse.script.loc.start.offset) +
      updated +
      file.content.slice(parse.script.loc.end.offset);
    i18nList.push(...originList);
  }
  parse = compiler.parse(file.content, {
    // expressionPlugins: ['typescript', 'jsx'],
  }).descriptor;
  if (parse.scriptSetup) {
    const [updated, originList] = vuejsi18n(
      parse.scriptSetup.content,
      file.key
    );
    file.content =
      file.content.slice(0, parse.scriptSetup.loc.start.offset) +
      updated +
      file.content.slice(parse.scriptSetup.loc.end.offset);
    i18nList.push(...originList);
  }
  file.i18nList = i18nList;
  return file;
}

module.exports = Processes;
