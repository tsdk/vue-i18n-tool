const I18n = require('../../src')

const i18n = new I18n({
  vue3: true,
  basePath: './src',
  filePaths: [],
  skipFiles: [],
  keyReplace: {
    'src/': '',
  },
  dictPath: './config',
  from: 'zh',
  to: 'en',
  appid: '',
  token: '',
});

i18n.start()
