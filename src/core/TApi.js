const Crypto = require('crypto')
const Axios = require('axios')
const ProgressBar = require('progress')
const { chunk } = require('lodash')

function sleep(d) {
  for (var t = Date.now(); Date.now() - t <= d;);
}

class TApi {
  from = 'zh'
  to = 'en'
  qtime = 20
  token = ''
  appid = ''

  constructor(options) {
    this.token = options.token
    this.appid = options.appid
    this.to = options.to
    this.from = options.from
    this.qtime = options.qtime || 20
  }

  async fetchBaidu(q) {
    const salt = Date.now()
    const sign = Crypto.createHash('md5').update(`${this.appid}${q}${salt}${this.token}`).digest('hex')
    const params = {
      q,
      from: this.from,
      to: this.to,
      appid: this.appid,
      salt,
      sign
    }

    const result = await Axios.get('http://api.fanyi.baidu.com/api/trans/vip/translate', {
      params
    })

    return result.data
  }

  async translateList(list) {
    if (!this.appid) return [];
    const queueList = chunk(list, this.qtime)
    const nList = []
    const total = queueList.length

    var bar = new ProgressBar('[ :bar ]', { total })
    for (let i = 0; i < total; i++) {
      bar.tick();
      nList.push(...(await this.fetchTranslateList(queueList[i])));
      sleep(1000);
      // console.log(Date.now())
    }
    return nList
  }

  async fetchTranslateList(list) {
    const strList = []
    const nList = []
  if (!list) return nList;
    list.forEach(item => {
      const [name] = item
      let [, str] = item
      if (!str) str = name.split('.').pop()
      str = str.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
      strList.push(str)
    })

    const q = strList.join('\n')
    const res = await this.fetchBaidu(q)

    const { trans_result = [], error_msg, error_code } = res;
    if (error_msg) {
      const tbl = {
        52001: {
          description: '请求超时',
          solution:
            '检查传入的 q 参数是否是正常文本，以及 from 或 to 参数是否在支持的语种列表中',
        },
        52002: {
          description: '系统错误',
          solution: '请重试',
        },
        52003: {
          description: '未授权用户',
          solution: '请检查appid是否正确，或是否已开通对应服务服务是否开通',
        },
        54000: {
          description: '必填参数为空',
          solution: '请检查是否漏传、误传参数',
        },
        54001: {
          description: '签名错误',
          solution: '请检查签名生成方法是否有误',
        },
        54003: {
          description: '访问频率受限',
          solution:
            '请降低您的调用频率，或在管理控制台进行身份认证后切换为高级版/尊享版',
        },
        54004: {
          description: '账户余额不足',
          solution:
            '请前往管理控制台为账户充值。如后台显示还有余额，说明当天用量计费金额已超过账户余额',
        },
        54005: {
          description: '长query请求频繁',
          solution: '请降低长度大于1万字节query的发送频率，3s后再试',
        },
        58000: {
          description: '客户端IP非法',
          solution:
            '检查开发者信息页面填写的对应服务器IP地址是否正确，如服务器为动态IP，建议留空不填',
        },
        58001: {
          description: '译文语言方向不支持',
          solution:
            '检查译文语言是否在语言列表里，个人标准版和高级版支持28个常见语种，企业尊享版支持全部语种',
        },
        58002: {
          description: '服务当前已关闭',
          solution: '请前往管理控制台开启服务',
        },
        58003: {
          description: '此IP已被封禁',
          solution:
            '同一IP当日使用多个APPID发送翻译请求，则该IP将被封禁当日请求权限，次日解封。请勿将APPID和密钥填写到第三方软件中',
        },
        90107: {
          description: '认证未通过或未生效',
          solution: '请前往我的认证查看认证进度',
        },
        20003: {
          description: '请求内容存在安全风险',
          solution: '请检查请求文本是否涉及反动，暴力等相关内容',
        },
      };
      console.log('error: ', [error_code, error_msg, tbl[error_code]]);
    } else {
      // console.log('##1', list)
      // console.log('##2', trans_result)
      trans_result.forEach((item, index) => {
        const [key] = list[index];
        nList.push([key, item.dst.replace(/\\n/g, '\n').replace(/\\r/g, '\r')]);
      });
    }

    return nList
  }
}

module.exports = TApi
