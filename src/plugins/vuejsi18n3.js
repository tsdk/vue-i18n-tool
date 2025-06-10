const babelParser = require('@babel/parser');
const types = require('@babel/types');
const traverse = require('@babel/traverse').default;
const hasChinese = /[\u4e00-\u9fa5]/;
const regChinese = /[\u4e00-\u9fa5]+/g;
const { decodeOriginString } = require('./utils');

module.exports = vuejsi18n;
function vuejsi18n(js, key) {
  let isObject = false;
  try {
    if (JSON.stringify(js) && js[0] === '{' && js[js.length - 1] === '}') {
      js = `(${js})`;
      isObject = true;
    }
  } catch (error) {
    // console.log(error);
  }
  const ast = babelParser.parse(js, {
    range: true,
    sourceType: 'module',
    plugins: ['typescript'],
  });

  const nodeList = [];
  traverse(ast, {
    enter(path) {
      if (!path.isIdentifier({ name: '$t' })) {
        if (
          types.isTSUnionType(path.node) ||
          types.isTSConditionalType(path.node) ||
          types.isTSConstructorType(path.node) ||
          types.isTSFunctionType(path.node) ||
          types.isTSImportType(path.node) ||
          types.isTSIndexedAccessType(path.node) ||
          types.isTSInferType(path.node) ||
          types.isTSIntersectionType(path.node) ||
          types.isTSLiteralType(path.node) ||
          types.isTSMappedType(path.node) ||
          types.isTSOptionalType(path.node) ||
          types.isTSParenthesizedType(path.node) ||
          types.isTSRestType(path.node) ||
          types.isTSTemplateLiteralType(path.node) ||
          types.isTSThisType(path.node) ||
          types.isTSTupleType(path.node) ||
          types.isTSInterfaceBody(path.node) ||
          types.isTSEnumBody(path.node) ||
          types.isTSConstructSignatureDeclaration(path.node) ||
          types.isTSCallSignatureDeclaration(path.node) ||
          types.isTSInterfaceDeclaration(path.node) ||
          types.isTSModuleDeclaration(path.node) ||
          types.isTSEnumDeclaration(path.node) ||
          types.isTSImportEqualsDeclaration(path.node) ||
          types.isTSNamespaceExportDeclaration(path.node) ||
          types.isTSTypeAliasDeclaration(path.node) ||
          types.isTSTypeParameterDeclaration(path.node) ||
          types.isTSPropertySignature(path.node) ||
          types.isTSMethodSignature(path.node) ||
          types.isTSIndexSignature(path.node) ||
          types.isTSStringKeyword(path.node) ||
          types.isTSModuleBlock(path.node)
        ) {
          // ts类型跳过
          // path.stop();
          return path.skip();
        }

        if (
          path.isStringLiteral() ||
          path.isDirectiveLiteral() ||
          path.isTemplateElement()
        ) {
          const node = path.node;
          let start = node.start;
          let end = node.end;
          if (isObject) {
            start--;
            end--;
          }
          nodeList.push({
            type: node.type,
            start,
            end,
          });
        }
      }
    },
  });
  if (isObject) {
    js = js.slice(1, -1);
  }
  let transformedContent = '';
  let transformedString = '';
  const originStringList = [];
  nodeList
    .sort((a, b) => a.start - b.start)
    .map((node, i) => {
      let originString = js.slice(node.start, node.end);
      if (hasChinese.test(originString)) {
        if (node.type === 'TemplateElement') {
          const tokens = originString.match(regChinese);
          if (tokens && tokens.length > 0) {
            const strs = [];
            let str = originString;
            tokens.forEach((token) => {
              const arr = str.split(token);
              strs.push(arr[0]);
              str = arr.slice(1).join(token);
            }); // 有序切片，防止前后替换重名
            tokens.forEach((token, i) => {
              strs.splice(
                2 * i + 1,
                0,
                `\${$t('${key}.${decodeOriginString(token)}')}`
              );
              originStringList.push(token);
            });
            transformedString = strs.join('');
          } else {
            transformedString = `\${$t('${key}.${decodeOriginString(
              originString
            )}')}`;
            originStringList.push(originString);
          }
        } else {
          originString = originString.replace(/'/g, '');
          transformedString = `$t('${key}.${decodeOriginString(
            originString
          )}')`;
          originStringList.push(originString);
        }
      } else {
        transformedString = originString;
      }
      const preNode = nodeList[i - 1] || {
        end: 0,
      };
      transformedContent += `${js.slice(
        preNode.end,
        node.start
      )}${transformedString}`;
      if (i === nodeList.length - 1) {
        transformedContent += js.slice(node.end);
      }
    });

  transformedContent = transformedContent || js;
  return [transformedContent, originStringList];
}
