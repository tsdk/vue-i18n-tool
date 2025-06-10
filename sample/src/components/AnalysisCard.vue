<template>
  <div ref="analysisCardRef" class="container">
    <div class="flex-row">
      <img :src="URL_MAP[props.icon]" width="20" height="20" />
      <h3 class="ml10">{{ props.title }}</h3>
      <!-- <img :src="starImg" alt=""> -->
      <el-tooltip v-if="props.tooltip" :content="props.tooltip">
        <svg-icon name="switch" className="ml10" />
      </el-tooltip>
        <span  class="ml10 tips">最近更新：{{}}</span>
        <svg-icon name="smc-tip" className="ml20" style="margin-top:0px;margin-right:4px;"/>
      <span class=" tips">带
       <img :src="STAR_SVG_BLUE" width="18" style="vertical-align: middle;"/>
        标记的标签代表卖点标签</span> 
      
    </div>
  
    <div class="flex-row mt30">
      <span class="ml10">机型:</span>
      <el-select class="w-200 ml10 mr10" v-model="state.model" @change="getAllData">
        <el-option v-for="item in getCompares(props.type)" :label="item.label" :value="item.value" />
      </el-select>
      <span>分析指标:</span>
      <el-radio-group v-model="state.indicator" class="ml10" @change="getAllData">
        <template v-for="item in props.indicators">
          <el-radio-button :label="item.label" :value="item.value"
            v-if="!(item.value == 'selling_overflow_rate' && $props.capturewebsite != '')" />
        </template>
      </el-radio-group>
    </div>
    <div class="flex-row mt10" style="width: 100%; height:690px; overflow:hidden;   box-sizing: border-box;">
      <div class="card-container">
        <el-skeleton class="card" :loading="state.loadingBar" animated :throttle="1000">
          <template #default>
            <div class="card" style="width: 100%; height: 100%;padding:0;">
              <div ref="barChartDom" style="width: 100%; height: 100%;"></div>
            </div>
          </template>
          <template #template>
            <el-skeleton-item style="width: 100%; height: 800px; margin-top: 20px" />
          </template>
        </el-skeleton>

      </div>
      <div class="card-container next-container">
        <!-- 词云 -->
        <div class="title-bar">
          <!-- <svg-icon name="frame" /> -->
          <!-- {{ICON_MAP[state.selling]}} -->
          <img :src="ICON_MAP[state.selling]||ICON_MAP['其他']" class="ml5" width="20" />
          <span> {{ `${state.selling || '--'}` }}</span>
         <img :src="STAR_SVG_BLUE" class="ml5" />
        </div>

        <el-skeleton class="card" :loading="state.loadingWord" animated :throttle="1000">
          <template #default>
            <div class="card" style="padding-top:0;gap:0">
              <div style="height:64px;" class="flex-row">
                <p class="card-title" style="font-size: 14px;">词云TOP30</p>
                <div class="card-title" style="margin-left:16px;">
                  <span class="card-title">情感:</span>
                  <el-select v-model="state.mood" class="ml10 w-150" clearable multiple collapse-tags
                    collapse-tags-tooltip @change="handleChangeMood">
                    <el-option label="正向" value="positive"></el-option>
                    <el-option label="负向" value="negative"></el-option>
                    <el-option label="中性" value="neutral"></el-option>
                  </el-select>
                </div>
              </div>

              <div class="flex-between">


              </div>
              <div ref="wordCloudDom" style="width: 100%; height: 276px"></div>
            </div>
          </template>
          <template #template>
            <el-skeleton-item style="width: 84px; height: 16px" />
            <div class="flex-between">
              <el-skeleton-item style="width: 80px; height: 16px" />
              <el-skeleton-item style="width: 230px; height: 16px" />
            </div>
            <el-skeleton-item style="width: 100%; height: 275px; margin-top: 10px" />
          </template>
        </el-skeleton>

        <!--热门评论  -->
        <el-skeleton class="card" :loading="state.loadingPopular" animated>
          <template #default>
            <div class="card" style="padding-top:0;">
              <div class="flex-between" style="height:16px;margin:26px 0 14px 0; ">
                <p class="card-title" style="font-size: 14px;">{{ props.type.indexOf('content') > -1 ? '热门内容' : '热门评论'
                }}</p>
                <p v-if="state.populars.length" @click="handle2Opinion" class="more-link">
                  查看全部 <svg-icon name="smc-arrow-right" className="icon-arrow-right ml5" />
                </p>
              </div>

              <!-- <span>{{ `已选: ${selected} ` }}</span> -->
              <el-empty v-if="state.populars.length == 0" style="flex-grow: 1"></el-empty>
              <div v-else v-for="(item, index) in state.populars.slice(0, 5)" class="flex-between"
                style="gap:0;height:44px;display:flex;">

                <NoWrapText class="flex-row" :index="index + 1" style="width:calc(100% - 152px);" :text="item.title"
                  className="a" @click="handleClickItem(item)" />

                <div class="text_nowrap" style="width:142px;text-align: right;">
                  <div>
                    <svg-icon name="smc-information-hudong" className="ml10" />
                    互动量: {{ `${countFormatter(item.inter, 'cn')}` }}
                  </div>

                </div>
              </div>

            </div>
          </template>
          <template #template>
            <el-skeleton-item style="width: 84px; height: 16px;margin:26px 0 14px 0" />
            <el-skeleton-item style="width: 100%; height: 20px;margin-top:20px" />
            <el-skeleton-item style="width: 100%; height: 20px;margin-top:20px" />
            <el-skeleton-item style="width: 100%; height: 20px;margin-top:20px" />
            <el-skeleton-item style="width: 100%; height: 20px;margin-top:20px" />
            <el-skeleton-item style="width: 100%; height: 20px;margin-top:20px" />

          </template>
        </el-skeleton>

      </div>



    </div>
  </div>
</template>

<script setup lang="ts">
import NoWrapText from '@/components/NoWrapText.vue'
import { ElMessage, dayjs } from 'element-plus'
import { countFormatter } from '../utils/index'
import { userLazyLoad } from '@/hooks/use-lazyLoad'
import * as echarts from 'echarts'
import { initAnalysisFunc, EMPTY_CHART } from '../constant/structure'
import type { IQueryParams, Capturewebsite, Mood, Indicator } from '../models/index'
import { URL_MAP, brandColor,ICON_MAP } from '../constant/index'

const router = useRouter()
const STAR_SVG = new URL(`assets/images/information/star.svg`, import.meta.url).href
const STAR_SVG_BLUE = new URL(`assets/images/information/star-blue.svg`, import.meta.url).href
const STAR_SVG_WHITE = new URL(`assets/images/information/star-white.svg`, import.meta.url).href
const SEL_BAR = new URL(`assets/images/information/sel-bar-bg.svg`, import.meta.url).href
import starImg from '~/assets/images/information/sel-bar-bg.png';


interface IProps {
  type: '' // 用于判断组件渲染以及调用哪些接口
  title: string
  icon: string
  tooltip?: string
  indicators: any[]
  capturewebsite: string
}
const props = withDefaults(defineProps<IProps>(), {
  title: '',
  icon: '',
  capturewebsite: ''
})
const { queryBarChartData, queryWordChartData, queryRankData } = initAnalysisFunc(props.type)
const { getCompares } = inject<any>('compares')
const { getFilterParams } = inject<any>('filterParams')

const analysisCardRef = ref()
const barChartDom = ref()
let barChartInstance: any = null //  echarts.ECharts | null
const wordCloudDom = ref()
let wordCloudInstance: any = null

const state = reactive({
  model: null,
  indicator: 'content' as Indicator,
  selling: null as null | string,
  mood: [] as Mood[],
  keyword: '',
  populars: [] as any[],
  loadingBar: false,
  loadingWord: false,
  loadingPopular: false
})

const selected = computed(() => {
  const map = {
    positive: '正向',
    negative: '负向',
    neutral: '中性'
  }
  return (
    [
      state.selling,
      state.mood
        .map((item) => map[item])
        .filter((item) => item)
        .join('、'),
      state.keyword
    ]
      .filter((item) => item)
      .join('-') || '--'
  )
})

watch(
  () => getCompares(props.type),
  (newV) => {
    if (newV?.length) {
      state.model = newV[0].value
    }
  }
)

watch(
  () => getFilterParams(),
  () => {
    state.loadingBar = true
    state.loadingWord = true
    state.loadingPopular = true
    // 优先加载首屏、
    userLazyLoad(analysisCardRef.value, getAllData)
  }
)
watch(
  () => props.capturewebsite,
  (newV) => {
    if (state.indicator == 'selling_overflow_rate' && newV != '') {
      state.indicator = 'content'
    }
    state.loadingBar = true
    state.loadingWord = true
    state.loadingPopular = true
    // 优先加载首屏、
    userLazyLoad(analysisCardRef.value, getAllData)
  }
)
const computedParams = (): IQueryParams & { dt: string } => {
  const params = getFilterParams('single')
  params.capturewebsite = props.capturewebsite
  // 机型筛选器覆盖外层筛选项
  if (state.model) {
    params.series = [state.model]
  }
  if (state.indicator) {
    params.indicator = state.indicator
  }

  return params
}

const getBarChartData = () => {
  state.loadingBar = true
  const params = computedParams()
  return queryBarChartData(params)
    .then((res) => {
      state.loadingBar = false
      if (!res?.trend?.length) {
        return null
      }
      state.selling = res.trend[0].label
      const dataSet = {
        dimensions: ['label', 'y'],
        source: res.trend
      }
      return dataSet
    })
    .then((dataSet: any | null) => {
      return nextTick(() => {
        yAxisData=dataSet.source.map(item=>item.label) ;
        if (!barChartInstance) {
          barChartInstance = echarts.init(barChartDom.value, null)
        }
        // 骨架屏切换导致dom节点更新  需要销毁重新实例化
        if (barChartDom.value !== barChartInstance.getDom()) {
          barChartInstance.dispose()
          barChartInstance = echarts.init(barChartDom.value, null)
        }
        const option = formatBarOpt(dataSet)
        barChartInstance.setOption(option, true)
        barChartInstance.getZr().off('click')
        barChartInstance.getZr().on('click', (params: any) => {
          if (!barChartInstance) {
            return
          }
          const pointInPixel = [params.offsetX, params.offsetY];
          
  const pointInGrid = barChartInstance.convertFromPixel('grid', pointInPixel);





  // const chart = barChartInstance;
  //   // 获取Y轴和网格信息
  //   const yAxisModel = chart.getModel().getComponent('yAxis', 0);
  // const gridModel = chart.getModel().getComponent('grid');
  // const gridRect = gridModel.coordinateSystem.getRect();
  
  // // 获取Y轴配置
  // const yAxisOption = chart.getOption().yAxis[0];
  // const yAxisData = yAxisOption.data || [];
  // const yAxisPosition = yAxisOption.position || 'left';
  
  // // 智能计算Y轴标签区域宽度
  // let yAxisWidth;
  // const axisLabelModel = yAxisModel.getModel('axisLabel');
  
  // // 尝试通过多种方式获取标签宽度
  // if (axisLabelModel.get('width')) {
  //   yAxisWidth = axisLabelModel.get('width'); // 优先使用明确设置的宽度
  // } else {
  //   // 估算标签宽度 (取字体大小的8倍作为经验值)
  //   const fontSize = parseInt(axisLabelModel.get('fontSize')) || 12;
  //   yAxisWidth = Math.max(50, fontSize * 8); // 最小50像素
  // }
  
  // // 计算Y轴区域位置
  // const yAxisLeft = yAxisPosition === 'left' 
  //   ? gridRect.x - yAxisWidth 
  //   : gridRect.x + gridRect.width;
  
  // // 检查点击是否在Y轴标签区域内
  // if (
  //   pointInPixel[0] >= yAxisLeft &&
  //   pointInPixel[0] <= yAxisLeft + yAxisWidth &&
  //   pointInPixel[1] >= gridRect.y &&
  //   pointInPixel[1] <= gridRect.y + gridRect.height
  // ) {
  //   // 计算点击的Y轴标签索引
  //   const labelHeight = gridRect.height / (yAxisData.length - 1 || 1);
  //   const yIndex = Math.min(
  //     yAxisData.length - 1,
  //     Math.max(0, Math.round((pointInPixel[1] - gridRect.y) / labelHeight))
  //   );
    
  //   const yLabel = yAxisData[yIndex];
  //   console.log('点击了Y轴第', yIndex, '个标签:',  parseInt(axisLabelModel.get('fontSize')) );
    
  //   // 执行自定义操作
  //   // ...
  // }

  

          // if (params.target == null) {
          //   return
          // }
       
          const yIndex = pointInGrid[1]
          const option = barChartInstance.getOption() as any
          const source = option.dataset[0].source
          const item = source[yIndex] as any
          if (!item || item.label === state.selling) return
          const oldIndex = barChartInstance.dataIndex
          state.selling = item.label
          barChartInstance.dataIndex = yIndex

          // 取消以前的高亮
          if (Number.isInteger(oldIndex)) {
            barChartInstance.dispatchAction({
              type: 'downplay',
              seriesIndex: 0
              // dataIndex: oldIndex
            })
          }
          // 高亮


          barChartInstance.dispatchAction({
            type: 'highlight',
            seriesIndex: 0,
            dataIndex: yIndex
          })
          updateChart(barChartInstance)
          state.mood = []
          state.keyword = ''
          handleChangeMood()
        })


        // 高亮默认第一行
        barChartInstance.dataIndex = 0
        barChartInstance.dispatchAction({
          type: 'downplay',
          seriesIndex: 0
        })
        barChartInstance.dispatchAction({
          type: 'highlight',
          seriesIndex: 0,
          dataIndex: 0
        })
        state.mood = []
        state.keyword = ''
        updateChart(barChartInstance)
        // addStar(barChartInstance)
      
      })
    })
}
// 更新图表状态
const updateChart = (chartInstance: any) => {
  if (!chartInstance) return
  const option = chartInstance.getOption();
  const sourceData = option.dataset[0].source;
  const max=sourceData.map(item => item.y).reduce((a, b) => Math.max(a, b), 0)
  chartInstance.setOption({
    series: [
      {},
      {
        data: sourceData.map((item, index) =>
        barChartInstance.dataIndex === index ? max * 1.2 : 0
        )
      }
    ]
  })
  chartInstance.setOption({
    yAxis:{
      data: sourceData.map((item)=>item.label).map((cat,index) => {
        // barChartInstance.dataIndex = 0
          const isSelected =barChartInstance.dataIndex===index;
          console.log(isSelected,870,index,barChartInstance.dataIndex)
          const style = isSelected
            ? {
              fontSize: 14,
              color: '#fff',
              borderColor: '#2C7BFF',
              backgroundColor: '#2C7BFF',
              fontWeight: 'normal',
              lineHeight: 20,
            }
            : {
              fontSize: 14,
              color: 'rgba(0,0,0,0.85)',
              borderColor: '#8C929A',
              backgroundColor: 'transparent',
              lineHeight: 20,
            }
           
            const data={
            value: cat,
            textStyle: {
              borderWidth: 0.5,
              borderRadius: 4,
              padding: [6, 12],
              textAlign:'center',
              cusor: 'pointer',
              ...style
            }
          }
          console.log(123,data)
          return data
        }),
    }
  })
  
}
let yAxisData: string[] = []

const formatBarOpt = (dataset: any | null): echarts.EChartsCoreOption => {
  if (!dataset) {
    return EMPTY_CHART
  }
  const option = {
    grid: {
      left: '35',
      right: '10%',
      top: '10',
      bottom: '10',
      containLabel: true
    },
    tooltip: {
      show: false
    },
    legend: {
      show: false
    },
    xAxis: {
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed', // 设置为虚线样式
          color: '#e8e8e8', // 分割线颜色
          width: 1,       // 分割线宽度
        }
      }
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: dataset.source.map((item)=>item.label),
      axisLabel: {
        triggerEvent:true,
        formatter: function (label: string) {
          const selIndex=barChartInstance.dataIndex||0
          const selData=dataset.source[selIndex]['label']
          const item = dataset.source.find((item: any) => item.label == label)
          const isSelected = selData===item.label;
          if (item.tag == 'star') {
            if(isSelected){
            return `${label} {selectedStar|}`
          }else{
            return `${label} {star|}`
          }
          return `{|${label}}{star|}`;
          } else if (item.tag == 's') {
          return `{s|S级}\t${label}`
          } else if (item.tag == 'a') {
            return `{a|A级}\t${label}`
          } else if (item.tag == 'b') {
            return `{b|B级}\t${label}`
          }
          return `${label}`
        },
        rich: {
          star: {
            fontSize: 16,
            lineHeight: 12,
            verticalAlign: 'middle',
            backgroundColor: {
              image: STAR_SVG_BLUE
            },
            marginTop:'-10px',
          },
          selectedStar: {
            fontSize: 16,
            lineHeight: 12,
            verticalAlign: 'middle',
              backgroundColor: {
                image: STAR_SVG_WHITE
              }
            },
          s: {
            width: 20,
            height: 16,
            fontSize: 12,
            // align: 'left',
            color: '#FFFFFF',
            backgroundColor: '#337CEB',
            borderRadius: 2,
            padding: [2, 5, 1, 5]
          },
          a: {
            width: 20,
            height: 16,
            fontSize: 12,
            // align: 'left',
            color: '#FFFFFF',
            backgroundColor: ' #28CEF2',
            borderRadius: 2,
            padding: [2, 5, 1, 5]
          },
          b: {
            width: 20,
            height: 16,
            fontSize: 12,
            // align: 'left',
            color: '#FFFFFF',
            backgroundColor: '#5EECE3',
            borderRadius: 2,
            padding: [2, 5, 1, 5]
          }
        },
       
      },
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false,
        color: '#A7ABB2'
      }
    },
    series: [
      {
        symbolSize: 100,
        type: 'bar',
        xAxisIndex: 0,
        yAxisIndex: 0,
        barMaxWidth: 21,
        barwidth: 21, // 柱子宽度
        z: 2,  // 确保在主图层
        label: {
          show: true,
          position: 'right',
          formatter: (params: any): string => {
            const { data, seriesName } = params
            const num = data[seriesName]
            return Number.isInteger(num) ? num.toLocaleString() : `${(num * 100).toFixed(2)}%`
          }
        },
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#2C7BFF' },
            { offset: 1, color: '#2C7BFF' }
          ])
        },
        emphasis: {
          itemStyle: {
            // color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            //   { offset: 0, color: '#11CDAE' },
            //   { offset: 1, color: '#60E5D0' }
            // ]),
            // shadowBlur: 10,
            // shadowColor: 'rgba(0,0,0,0.3)',
          }
        },
      },
      // 背景图片系列
      {
        type: 'pictorialBar',
        symbol: `image://${SEL_BAR}`,
        symbolSize: ['100%', 42], // 宽度100%填充
        symbolOffset: [0, 0],
        symbolPosition: 'start',
        z: -1,
        // label: {
        //   show: true,
        //   position: 'right',
        //   formatter: (params: any): string => {
        //     const { data, seriesName } = params
        //     const num = data[seriesName]
        //     return Number.isInteger(num) ? num.toLocaleString() : `${(num * 100).toFixed(2)}%`
        //   }
        // },
        silent: true,
        xAxisIndex: 0, // 使用相同x轴
        yAxisIndex: 0, // 使用相同y轴
        data: dataset.source.map(item => ({
          value: item.y,
          name: item.label  // 保持分类名称一致
        })),
        animation: false
      }

    ],
    dataset
  }
  return option
}

const formatWordOpt = (data: Array<{ name: string; value: string }>): echarts.EChartsCoreOption => {
  if (!data?.length) {
    return EMPTY_CHART
  }
  const option = {
    tooltip: {
      formatter: (block: any) => {
        const { data } = block
        const { name, value } = data
        if (name == undefined) {
          return null
        }
        return `
          <div style="padding: 15px;">
            <div class="mb15" style="color: #303133">${name}</div>
            <div>           
              <span style="color: #303133">${value.toLocaleString()}</span>
            </div>
          </div>
        `
      }
    },
    series: [
      {
        type: 'treemap',
        data: data,
        leafDepth: undefined,
        roam: false,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,

        // 内容块
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          borderRadius: 4, // 设置边框圆角
          // color: 'rgba(44,123,255,0.25)' // 设置方格颜色
          // color:'red'
        },

        // 文字
        label: {
          color: '#303133',
          backgroundColor: '#C4D9FC',
          borderRadius: 4, // 设置圆角
          fontWeight: 'bold', // 设置字体加粗
          // fontSize: 16, // 设置字体加粗
          // align: 'left', // 设置文字左对齐
          // verticalAlign: 'top', // 设置文字顶端对齐
          formatter: function (params: any) {
            // 自定义文字内容
            return `${params.name}：${params.value.toLocaleString()}`;
          },

        },

        // 高亮
        emphasis: {
          disabled: false,
          label: {
            show: true,
            color: '#fff',
            backgroundColor: '#1A90FC',
            borderWidth: 1,
            borderColor: '#156DF3'
          }
        },

        // 选择模式
        selectedMode: 'single',
        // 点击事件
        nodeClick: false,
        // 点击-块样式
        select: {
          disabled: true,
          label: {
            color: '#156DF2',
            backgroundColor: '#FFF'
          },
          itemStyle: {
            color: '#FFF',
            borderColor: '#156DF2',
            borderWidth: 2
          }
        },
        // 底部面包屑隐藏
        breadcrumb: {
          show: false
        }
      }
    ]
  }

  return option
}

const getWordChartData = () => {
  state.loadingWord = true
  const params = computedParams()
  let key: 'sellingtrack' | 'sellingpoint'
  if (props.type.indexOf('_track') > -1) {
    key = 'sellingtrack'
  } else {
    key = 'sellingpoint'
  }
  params[key] = [state.selling as string]
  params.mood = state.mood
  return queryWordChartData(params)
    .then((res) => {
      state.loadingWord = false
      if (!res?.word) {
        return
      }
      if (!Array.isArray(res.word)) {
        return
      }
      const data = res.word.map((item: any) => {
        return { value: item.y, name: item.label }
      })
      return data
    })
    .then((data) => {
      nextTick(() => {
        if (!wordCloudInstance) {
          wordCloudInstance = echarts.init(wordCloudDom.value, null)
        }
        // 骨架屏切换导致dom节点更新  需要销毁重新实例化
        if (wordCloudDom.value !== wordCloudInstance.getDom()) {
          wordCloudInstance.dispose()
          wordCloudInstance = echarts.init(wordCloudDom.value, null)
        }
        const option = formatWordOpt(data)
        wordCloudInstance.setOption(option, true)
        wordCloudInstance.off('click')
        wordCloudInstance.on('click', (val: any) => {
          let keyword = val?.data?.name
          if (keyword == null) {
            ElMessage.error('发生错误,获取关键词失败')
            return
          }
          const { dataIndex, seriesIndex } = val
          const label = data[dataIndex - 1]?.name // 下标从1开始算起
          if (state.keyword == label) {
            state.keyword = ''
            wordCloudInstance.dispatchAction({
              type: 'downplay',
              seriesIndex: 0
              // dataIndex: dataIndex
            })
          } else {
            state.keyword = label
            const oldIndex = wordCloudInstance.dataIndex
            wordCloudInstance.dataIndex = dataIndex
            // 取消以前的高亮
            if (Number.isInteger(oldIndex)) {
              wordCloudInstance.dispatchAction({
                type: 'downplay',
                seriesIndex: 0
                // dataIndex: oldIndex
              })
            }
            // 高亮
            wordCloudInstance.dispatchAction({
              type: 'highlight',
              seriesIndex: 0,
              dataIndex: dataIndex
            })
            getPopulars()
          }

          // if (dataIndex == wordCloudInstance.dataIndex && wordCloudInstance == oldLight.seriesIndex) {
          //   keyword = null
          // }
          // emit('click', { keyword })
          // updateHightList(val)
        })

        wordCloudInstance.dispatchAction({
          type: 'downplay',
          seriesIndex: 0
          // dataIndex: oldIndex
        })
      })
    })
    .finally(() => {
      state.loadingWord = false
    })
}

const getPopulars = () => {
  state.loadingPopular = true
  const params = computedParams()
  let key: 'sellingtrack' | 'sellingpoint'
  if (props.type.indexOf('_track') > -1) {
    key = 'sellingtrack'
  } else {
    key = 'sellingpoint'
  }
  params[key] = [state.selling as string]

  params.mood = state.mood
  if (state.keyword) {
    params.keyword = state.keyword
  }
  state.populars = []
  return queryRankData(params)
    .then((res) => {
      if (!res?.rank) {
        return
      }
      state.populars = res.rank
    })
    .finally(() => {
      state.loadingPopular = false
    })
}

const handleClickItem = (popular: any) => {
  window.open(popular.link, '_blank')
}

const handle2Opinion = () => {
  const params = computedParams()
  const { capturewebsite, diffStart, diffEnd, series, dt } = params
  const PLATFORM_MAP = {
    dy: '抖音',
    redbook: '小红书',
    weibo: '微博',
    bilibili: 'B站',
    toutiao: '头条',
    jd: '京东',
    wx: '微信',
    kuaishou: '快手'
  }
  const MODEL_MAP: any = {
    FINDX7: ['Find X7 Ultra', 'Find X7', 'Find X7 Ultra卫星通信版'],
    FINDX7系列: ['Find X7 Ultra', 'Find X7', 'Find X7 Ultra卫星通信版'],
    OPPOFINDX7系列: ['Find X7 Ultra', 'Find X7', 'Find X7 Ultra卫星通信版'],
    FINDX8系列: ['Find X8', 'Find X8 Ultra', 'Find X8 Pro'],
    FINDX8: ['Find X8', 'Find X8 Ultra', 'Find X8 Pro'],
    OPPOFINDX8系列: ['Find X8', 'Find X8 Ultra', 'Find X8 Pro'],
    VIVOX200系列: ['X200', 'X200 Pro', 'X200 mini', 'X200 Pro mini', 'X200 Ultra'],
    VIVOX200: ['X200', 'X200 Pro', 'X200 mini', 'X200 Pro mini', 'X200 Ultra'],
    荣耀MAGIC7系列: ['荣耀Magic7', '荣耀Magic7 Pro'],
    荣耀MAGIC7: ['荣耀Magic7', '荣耀Magic7 Pro'],
    小米15系列: ['小米15', '小米15 Pro', '小米15 Ultra'],
    小米15: ['小米15', '小米15 Pro', '小米15 Ultra'],
    一加13系列: ['一加 13'],
    IQOO13系列: ['iQOO 13'],
    RENO13系列: ['Reno 13 Pro', 'Reno 13'],
    荣耀300系列: ['荣耀300', '荣耀300 Pro'],
    VIVOS20系列: ['S20', 'S20 Pro'],
    NOVA13系列: ['nova 13', 'nova 13 pro']
  }
  const platform = capturewebsite ? PLATFORM_MAP[capturewebsite] : null
  const query: any = {
    from: 'outer',
    contentModel: MODEL_MAP[series[0]].join(','),
    publicStartTime: dayjs(dt)
      .add(diffStart as number, 'day')
      .format('YYYY-MM-DD HH:mm:ss'),
    publicEndTime: dayjs(dt)
      .add(diffEnd as number, 'day')
      .format('YYYY-MM-DD HH:mm:ss')
  }
  if (platform) {
    query.platform = platform
  }

  // 如果机型是VIVOS20 需要额外选中品牌  因为三星也有S20机型，只能额外增加字段区分
  if (series[0] == 'VIVOS20系列') {
    query.contentBrand = ['VIVO']
  }

  const path = props.type.indexOf('content') > -1 ? '/information/opinion/content' : '/information/opinion/comment'
  const href = router.resolve({
    path: path,
    query: query
  })
  window.open(href.href, '_blank')
}

const handleChangeMood = () => {
  return getWordChartData().then(() => {
    return getPopulars()
  })
}

const getAllData = () => {
  return getBarChartData()
    .then(() => {
      return getWordChartData()
    })
    .then(() => {
      return getPopulars()
    })
}

onMounted(() => {
  const compares = getCompares(props.type)
  if (compares?.length) {
    state.model = compares[0].value
  }

  if (props.indicators?.length) {
    state.indicator = props.indicators[0].value
  }
  state.loadingBar = true
  state.loadingWord = true
  state.loadingPopular = true
  // 优先加载首屏、
  userLazyLoad(analysisCardRef.value, getAllData)

  window.addEventListener('resize', () => {
    barChartInstance && barChartInstance.resize()
    wordCloudInstance && wordCloudInstance.resize()
  })
})

onBeforeUnmount(() => {
  if (barChartInstance) {
    barChartInstance.dispose()
  }
  if (wordCloudInstance) {
    wordCloudInstance.dispose()
  }
  window.removeEventListener('resize', () => { })
})
</script>

<style lang="scss" scoped>
.container {
  height: 838px;
  width:100%;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 20px;
  overflow: hidden; 
  
}

.card {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  // gap: 10px;
  width: 100%;
  box-sizing:border-box;

  flex-grow: 1;
  padding: 0 20px;
  overflow-y: auto;

  >div {
    width: 100%;
  }

  &-title {
    font-family: PingFang SC;
    font-size: 14px;
    font-weight: 600;
    line-height: 16px;
    text-align: right;
  }
}

.text_nowrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
  margin-left: 20px;
  border-radius: 2px;
  padding: 3px 5px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
}

:deep(.a) {
  cursor: pointer;
}

:deep(.a):hover {
  color: #156df2;
}

.card-container {
  flex: 1;
  width:50%;
  // max-width: calc(50%);
  height: 100%;
  border-radius: 16px;
  overflow: hidden;

}

.next-container {
  background: #f7f9fb;
  border-radius: 16px;
  overflow: hidden;
  height: 690px;
}

.title-bar {
  width: 100%;
  height: 52px;
  line-height: 52px;
  background: linear-gradient(91deg, #c7d4ed 0%, #f7f9fb 100%);
  padding-left: 25px;
  font-weight: 500;
  display: flex;
  gap: 8px;
  align-items: center;
}

.more-link {
  font-size: 14px;
  color: #8c929a;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.tips{
  font-size: 14px;font-weight: normal;color: rgba(0,0,0,0.45);
}
</style>
