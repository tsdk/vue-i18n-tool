<template>
  <div class="flex-row">
    <CreateStep :steps="page.steps" />
    <div class="common-content is-full-right">
      <el-page-header class="custom-page-header" @back="handleGoBack(false)">
        <template #icon>
          <svg-icon name="smc-arrow-left" />
        </template>
        <template #content>
          <div class="header-title">
            <div class="title">创建子品牌预估规则 | 发布于</div>
            <div class="tips"></div>
          </div>
        </template>
      </el-page-header>
      <div class="is-scroll-content">
        <div class="custom-detail-content pd20" v-show="'one' === step">
          <h4 class="custom-title-line">基础参数配置</h4>
          <el-form ref="baseFormRef" :model="baseForm" :rules="baseFormRules" label-width="200px" class="mt20">
            <el-row :gutter="20">
              <el-col :span="11">
                <el-form-item label="子品牌ID:" prop="subBrandIds">
                  <el-select
                    v-model="baseForm.subBrandIds"
                    multiple
                    placeholder="请选择"
                    style="width: 100%"
                    :disabled="isEdit"
                    clearable
                    collapse-tags
                    collapse-tags-tooltip
                    :max-collapse-tags="3"
                    @change="handleSubBrandIdsChange"
                  >
                    <el-option
                      v-for="item in base.brandList"
                      :key="item.id"
                      :label="`${item.name}（${item.id}）`"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="11">
                <el-form-item label="子品牌名称:" prop="subBrandName">
                  <el-input v-model="baseForm.subBrandName" placeholder="请输入" />
                </el-form-item>
              </el-col>

              <el-col :span="11">
                <el-form-item label="开始日期:" prop="startDate">
                  <el-date-picker
                    v-model="baseForm.startDate"
                    type="date"
                    placeholder="请选择"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="11">
                <el-form-item label="千川人群包ID:" prop="qianchuanPackageId">
                  <el-input v-model="baseForm.qianchuanPackageId" placeholder="请输入" />
                </el-form-item>
              </el-col>

              <el-col :span="11">
                <el-form-item label="品牌ID:" prop="brandId">
                  <el-input v-model="baseForm.brandId" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item label="品牌名称:" prop="brandName">
                  <el-input v-model="baseForm.brandName" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item label="A3互动(内容广告ID)人群包ID:" prop="a3InteractiveContentAdPackageId">
                  <el-input v-model="baseForm.a3InteractiveContentAdPackageId" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item label="A3互动(全内容大盘)人群包ID:" prop="a3InteractiveContentAllPackageId">
                  <el-input v-model="baseForm.a3InteractiveContentAllPackageId" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item label="竞价广告主ID:" prop="advertiserIds">
                  <el-input
                    v-model="base.advertiserIds"
                    placeholder="一行一个数字ID"
                    type="textarea"
                    rows="5"
                    @input="handleNumLinesChange(base, baseForm, 'advertiserIds')"
                  />
                  <el-text class="mx-1" type="info" v-if="baseForm.advertiserIds.length > 0"
                    >共{{ baseForm.advertiserIds.length }}行有效数据</el-text
                  >
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item label="合约广告计划ID:" prop="contractAdIds">
                  <el-input
                    v-model="base.contractAdIds"
                    placeholder="一行一个数字ID"
                    type="textarea"
                    rows="5"
                    @input="handleNumLinesChange(base, baseForm, 'contractAdIds')"
                  />
                  <el-text class="mx-1" type="info" v-if="baseForm.contractAdIds.length > 0"
                    >共{{ baseForm.contractAdIds.length }}行有效数据</el-text
                  >
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item label="预估类型:" prop="estimateTypeList">
                  <el-select
                    v-model="baseForm.estimateTypeList"
                    multiple
                    placeholder="请选择"
                    style="width: 240px"
                    clearable
                    collapse-tags
                  >
                    <el-option v-for="item in base.typeList" :key="item.type" :label="item.name" :value="item.type" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item label="激活人群包id" prop="activePackageId">
                  <el-input v-model="baseForm.activePackageId" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item label="是否分资源和分竞价目标预估:" prop="needDivideResourcesAndGoals">
                  <el-switch v-model="baseForm.needDivideResourcesAndGoals" />
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item label="是否开启:" prop="syncSwitch">
                  <el-switch v-model="baseForm.syncSwitch" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div class="pd20" style="text-align: center">
            <el-button @click="handleGoBack(false)">返回</el-button>
            <el-button
              type="primary"
              @click="handleToSubmit(baseFormRef, 'two')"
              v-permission="{ permissionKey: 'STRATEGY_CLOUD_ATLAS_OPERATE' }"
              >提交（下一步）</el-button
            >
          </div>
        </div>
        <div class="custom-detail-content pd20" v-show="'two' === step">
          <h4 class="custom-title-line">内容配置</h4>

          <el-form ref="contentFormRef" :model="contentForm" :rules="contentFormRules" label-width="152px" class="mt20">
            <el-row :gutter="20">
              <el-col :span="11">
                <el-form-item label="内容广告ID【抖音】:" prop="a3InteractiveContentAdIds">
                  <el-input
                    v-model="content.a3InteractiveContentAdIds"
                    placeholder="一行一个数字ID"
                    type="textarea"
                    rows="9"
                    @input="handleNumLinesChange(content, contentForm, 'a3InteractiveContentAdIds')"
                  />
                  <el-text class="mx-1" type="info" v-if="contentForm.a3InteractiveContentAdIds.length > 0"
                    >共{{ contentForm.a3InteractiveContentAdIds.length }}行有效数据</el-text
                  >
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item label="内容广告ID【头条】:" prop="a3InteractiveContentToutiaoAdIds">
                  <el-input
                    v-model="content.a3InteractiveContentToutiaoAdIds"
                    placeholder="一行一个数字ID"
                    type="textarea"
                    rows="9"
                    @input="handleNumLinesChange(content, contentForm, 'a3InteractiveContentToutiaoAdIds')"
                  />
                  <el-text class="mx-1" type="info" v-if="contentForm.a3InteractiveContentToutiaoAdIds.length > 0"
                    >共{{ contentForm.a3InteractiveContentToutiaoAdIds.length }}行有效数据</el-text
                  >
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item label="全内容ID【抖音】:" prop="a3InteractiveContentAllIds">
                  <el-input
                    v-model="content.a3InteractiveContentAllIds"
                    placeholder="一行一个数字ID"
                    type="textarea"
                    rows="8"
                    @input="handleNumLinesChange(content, contentForm, 'a3InteractiveContentAllIds')"
                  />
                  <el-text class="mx-1" type="info" v-if="contentForm.a3InteractiveContentAllIds.length > 0"
                    >共{{ contentForm.a3InteractiveContentAllIds.length }}行有效数据</el-text
                  >
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item label="全内容ID【头条】:" prop="a3InteractiveContentAllToutiaoIds">
                  <el-input
                    v-model="content.a3InteractiveContentAllToutiaoIds"
                    placeholder="一行一个数字ID"
                    type="textarea"
                    rows="8"
                    @input="handleNumLinesChange(content, contentForm, 'a3InteractiveContentAllToutiaoIds')"
                  />
                  <el-text class="mx-1" type="info" v-if="contentForm.a3InteractiveContentAllToutiaoIds.length > 0"
                    >共{{ contentForm.a3InteractiveContentAllToutiaoIds.length }}行有效数据</el-text
                  >
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div class="pd20" style="text-align: center">
            <el-button @click="handleToPrevious('one')">上一步</el-button>
            <el-button
              type="primary"
              @click="handleToSubmit(contentFormRef, 'three')"
              v-permission="{ permissionKey: 'STRATEGY_CLOUD_ATLAS_OPERATE' }"
              >提交（下一步）</el-button
            >
          </div>
        </div>
        <div class="custom-detail-content pd20" v-show="'three' === step">
          <h4 class="custom-title-line">关键字配置</h4>
          <el-form ref="keywordFormRef" :model="keywordForm" :rules="keywordFormRules" label-width="152px" class="mt20">
            <el-row :gutter="20">
              <el-col :span="11">
                <el-form-item label="A3搜索关键词:" prop="a3SearchKeys">
                  <el-input
                    v-model="keyword.a3SearchKeys"
                    placeholder="一行一个关键字"
                    type="textarea"
                    rows="20"
                    @input="handleStrLinesChange(keyword, keywordForm, 'a3SearchKeys')"
                  />
                  <el-text class="mx-1" type="info" v-if="keywordForm.a3SearchKeys.length > 0"
                    >共{{ keywordForm.a3SearchKeys.length }}行有效数据</el-text
                  >
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div class="pd20" style="text-align: center">
            <el-button @click="handleToPrevious('two')">上一步</el-button>
            <el-button
              type="primary"
              @click="handleToSubmit(keywordFormRef, 'four')"
              v-permission="{ permissionKey: 'STRATEGY_CLOUD_ATLAS_OPERATE' }"
              >提交（下一步）</el-button
            >
          </div>
        </div>
        <div class="custom-detail-content pd20" v-show="'four' === step">
          <h4 class="custom-title-line">分资源和类型</h4>
          <el-tabs v-model="activeName" ref="resourceFormRef">
            <el-tab-pane label="分资源" name="分资源">
              <FormTable
                :modelValue="resource['分资源']"
                :form-rules="resourceFormRules"
                @waiting="handleWaiting1"
                @change="(v) => (resourceForm['分资源'] = v)"
              />
            </el-tab-pane>
            <el-tab-pane label="分竞价目标" name="分竞价目标">
              <FormTable
                :modelValue="resource['分竞价目标']"
                :form-rules="resourceFormRules"
                @waiting="handleWaiting2"
                @change="(v) => (resourceForm['分竞价目标'] = v)"
              />
            </el-tab-pane>
            <el-tab-pane label="分素材效果" name="分素材效果">
              <FormTable
                :modelValue="resource['分素材效果']"
                :form-rules="resourceFormRules"
                @waiting="handleWaiting3"
                @change="(v) => (resourceForm['分素材效果'] = v)"
              />
            </el-tab-pane>
            <el-tab-pane label="分关键字" name="分关键字">
              <FormTable
                :modelValue="resource['分关键字']"
                :form-rules="resourceFormRules"
                @waiting="handleWaiting4"
                @change="(v) => (resourceForm['分关键字'] = v)"
              />
            </el-tab-pane>
          </el-tabs>
          <div class="pd20" style="text-align: center">
            <el-button @click="handleToPrevious('three')">上一步</el-button>
            <el-button
              type="primary"
              @click="handleToSubmit(resourceFormRef)"
              :disabled="waiting1 || waiting2 || waiting3 || waiting4"
              v-permission="{ permissionKey: 'STRATEGY_CLOUD_ATLAS_OPERATE' }"
              >提交完成</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useCurrentInstance } from '@/hooks'
import type { FormInstance, FormRules } from 'element-plus'
import CreateStep from '@/views/marketing/strategy/cloud_atlas_tools/estimate/components/CreateStep.vue'
import FormTable from '@/views/marketing/strategy/cloud_atlas_tools/estimate/components/FormTable.vue'
import {
  subBrandQuery,
  yuntuTypeListQuery,
  yuntuSave,
  yuntuResourceSave,
  yuntuDetailQuery,
  yuntuTypeDetailQuery
} from '@/api/marketing/cloud_atlas/api'

const { globalProperties } = useCurrentInstance()
const router = useRouter(),
  route = useRoute()

const isEdit = ref(false)
const data = ref<Record<string, any>>({})
const activeName = ref('分资源')
const step = ref('one')

const base = reactive<Record<string, any>>({
  brandList: [],
  typeList: [],
  advertiserIds: '',
  contractAdIds: ''
})
const baseForm = reactive<Record<string, any>>({
  subBrandIds: [],
  subBrandName: '',
  startDate: '',
  qianchuanPackageId: '',
  brandId: '',
  brandName: '',
  a3InteractiveContentAdPackageId: '',
  a3InteractiveContentAllPackageId: '',
  advertiserIds: [],
  contractAdIds: [],
  estimateTypeList: [],
  needDivideResourcesAndGoals: 0,
  syncSwitch: 0
})
const baseFormRef = ref<FormInstance>()
const baseDirty = ref(false)
watch(
  baseForm,
  () => {
    baseDirty.value = true
  },
  {
    deep: true
  }
)

const content = reactive<Record<string, any>>({
  a3InteractiveContentAdIds: '',
  a3InteractiveContentToutiaoAdIds: '',
  a3InteractiveContentAllIds: '',
  a3InteractiveContentAllToutiaoIds: ''
})
const contentForm = reactive<Record<string, any>>({
  a3InteractiveContentAdIds: [],
  a3InteractiveContentToutiaoAdIds: [],
  a3InteractiveContentAllIds: [],
  a3InteractiveContentAllToutiaoIds: []
})
const contentFormRef = ref<FormInstance>()
const contentDirty = ref(false)
watch(
  contentForm,
  () => {
    contentDirty.value = true
  },
  {
    deep: true
  }
)

const keyword = reactive<Record<string, any>>({
  a3SearchKeys: ''
})
const keywordForm = reactive<Record<string, any>>({
  a3SearchKeys: []
})
const keywordFormRef = ref<FormInstance>()
const keywordDirty = ref(false)
watch(
  keywordForm,
  () => {
    keywordDirty.value = true
  },
  {
    deep: true
  }
)

const resource = reactive<Record<string, any>>({
  分资源: [],
  分竞价目标: [],
  分素材效果: [],
  分关键字: []
})
const resourceForm = reactive<Record<string, any>>({
  分资源: [],
  分竞价目标: [],
  分素材效果: [],
  分关键字: []
})
const resourceFormRef = ref<FormInstance>()

const baseFormRules = reactive<FormRules>({
  subBrandIds: [{ required: true, message: '请选择子品牌', trigger: 'blur' }]
})
const contentFormRules = reactive<FormRules>({})
const keywordFormRules = reactive<FormRules>({})
const resourceFormRules = reactive<FormRules>({})

const page = reactive<{
  steps: Array<string>
}>({
  steps: ['one']
})

/** 返回 */
const handleGoBack = (tag: boolean) => {
  if (tag) {
    router.push('/marketing/tactic/cloud_atlas_tools/estimate')
  } else {
    globalProperties
      .$confirm('确定退出？', '提示')
      .then(async () => {
        router.push('/marketing/tactic/cloud_atlas_tools/estimate')
      })
      .catch((e: Error) => {
        console.log(e)
      })
  }
}

const initData = async (id: number) => {
  yuntuDetailQuery({ id: id }).then((res: any) => {
    data.value = res
    Object.keys(baseForm).forEach((key: string) => {
      if (null !== res[key]) baseForm[key] = res[key]
    })
    Object.keys(contentForm).forEach((key: string) => {
      if (null !== res[key]) contentForm[key] = res[key]
    })
    Object.keys(keywordForm).forEach((key: string) => {
      if (null !== res[key]) keywordForm[key] = res[key]
    })

    if (baseForm.advertiserIds) base.advertiserIds = baseForm.advertiserIds.join('\n')
    if (baseForm.contractAdIds) base.contractAdIds = baseForm.contractAdIds.join('\n')
    if (contentForm.a3InteractiveContentAdIds)
      content.a3InteractiveContentAdIds = contentForm.a3InteractiveContentAdIds.join('\n')
    if (contentForm.a3InteractiveContentToutiaoAdIds)
      content.a3InteractiveContentToutiaoAdIds = contentForm.a3InteractiveContentToutiaoAdIds.join('\n')
    if (contentForm.a3InteractiveContentAllIds)
      content.a3InteractiveContentAllIds = contentForm.a3InteractiveContentAllIds.join('\n')
    if (contentForm.a3InteractiveContentAllToutiaoIds)
      content.a3InteractiveContentAllToutiaoIds = contentForm.a3InteractiveContentAllToutiaoIds.join('\n')
    if (keywordForm.a3SearchKeys) keyword.a3SearchKeys = keywordForm.a3SearchKeys.join('\n')

    yuntuTypeDetailQuery({ id: id }).then((res: any) => {
      if (res?.divideResourceParams && res.divideResourceParams.length > 0) {
        res.divideResourceParams.forEach((item: any) => {
          resource[item.divideType] = item.resourceAndGoalEstimateParamsROS
        })
      }
      baseDirty.value = false
      contentDirty.value = false
      keywordDirty.value = false
    })
  })
}

onMounted(() => {
  getChannelOptions()
  nextTick(() => {
    baseFormRef?.value?.resetFields()
    contentFormRef?.value?.resetFields()
    keywordFormRef?.value?.resetFields()
    Object.keys(resourceForm).forEach((key: string) => {
      resource[key] = []
      resourceForm[key] = []
    })
    if (route.query.paramId) {
      isEdit.value = true
      initData(+route.query.paramId)
    }
  })
})

const getChannelOptions = () => {
  subBrandQuery({}).then((res) => {
    base.brandList = res || []
  })
  yuntuTypeListQuery({}).then((res) => {
    base.typeList = res || []
  })
}
/**选项联动 */
const handleSubBrandIdsChange = (vals: any) => {
  if (vals.length > 0) {
    const brand = base.brandList.find((item: any) => item.id === vals[0])
    baseForm.subBrandName = brand.name
  } else {
    baseForm.subBrandName = ''
  }
}

const getParams = () => {
  switch (step.value) {
    case 'one':
      if (!baseDirty.value) return null
      return {
        ...baseForm,
        updateRegion: 'BASIC',
        paramId: data.value.paramId || +(route.query.paramId as string),
        a5StageSwitch: false,
        a5AudienceStageSwitch: false
      }
      break
    case 'two':
      if (!contentDirty.value) return null
      return {
        subBrandIds: baseForm.subBrandIds,
        ...contentForm,
        updateRegion: 'CONTENT',
        paramId: data.value.paramId || +(route.query.paramId as string),
        a5StageSwitch: false,
        a5AudienceStageSwitch: false
      }
      break
    case 'three':
      if (!keywordDirty.value) return null
      return {
        subBrandIds: baseForm.subBrandIds,
        ...keywordForm,
        updateRegion: 'KEYWORD',
        paramId: data.value.paramId || +(route.query.paramId as string),
        a5StageSwitch: false,
        a5AudienceStageSwitch: false
      }
      break
    case 'four':
      const arr = [] as Record<string, any>[]
      Object.keys(resourceForm).map((key) => {
        if (resourceForm[key].length > 0) {
          const obj = { divideType: key, resourceAndGoalEstimateParamsROS: resourceForm[key] }
          arr.push(obj)
        }
      })
      return {
        subBrandId: baseForm.subBrandIds[0],
        paramId: data.value.paramId || +(route.query.paramId as string),
        divideResourceParams: arr
      }
      break
    default:
      return {}
      break
  }
}

const handleToSubmit = async (EL: FormInstance | undefined, next?: string) => {
  if (!EL) return
  if (EL === resourceFormRef.value) {
    const params = getParams()
    yuntuResourceSave(params).then((res) => {
      if (res) {
        globalProperties.$message.success('提交成功')
        setTimeout(() => {
          handleGoBack(true)
          step.value = 'one'
          page.steps = ['one']
        }, 300)
      }
    })
  } else {
    await EL.validate((valid) => {
      if (valid) {
        const params = getParams()
        if (next) {
          if (!params) {
            // 没有脏数据，不用提交
            page.steps.push(next)
            step.value = next
            return
          }
          yuntuSave(params).then((res) => {
            if (res) {
              if ('two' === next) {
                // 过了第一步就变成修改模式，而不是新增
                data.value.paramId = res // 主键设置
                isEdit.value = true
              }
              setTimeout(() => {
                page.steps.push(next)
                step.value = next
              }, 300)
            }
          })
        }
      }
    })
  }
}

const handleToPrevious = (next: string) => {
  step.value = next
  page.steps.pop()
}

const handleNumLinesChange = (ctx, form, key) => {
  form[key] = ctx[key]
    .split('\n')
    .filter(Boolean)
    .map((el) => el.replace(/^\s+|\s+$/g, ''))
    .filter((el) => /^\d+$/.test(el)) // 剔除空行、非数字行
}

const handleStrLinesChange = (ctx, form, key) => {
  form[key] = ctx[key]
    .split('\n')
    .filter(Boolean)
    .map((el) => el.replace(/^\s+|\s+$/g, '')) // 剔除空行
}

const waiting1 = ref(false)
const waiting2 = ref(false)
const waiting3 = ref(false)
const waiting4 = ref(false)
const handleWaiting1 = (val) => {
  waiting1.value = val
}
const handleWaiting2 = (val) => {
  waiting2.value = val
}
const handleWaiting3 = (val) => {
  waiting3.value = val
}
const handleWaiting4 = (val) => {
  waiting4.value = val
}
</script>
<style lang="scss" scoped>
.f12 {
  font-size: 12px;
}
.flex-center {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.common-content {
  .#{$custom-namespace}-row {
    width: 100% !important;
  }
  .custom-detail-content {
    position: relative;
  }
  .header-title {
    display: flex;
  }
  .title {
    font-size: 16px;
  }
  .tips {
    margin-left: 15px;
    font-size: 14px;
    color: #666;
  }
  .preview-box {
    height: 337px;
    overflow-y: scroll;
    .block1,
    .block2 {
      height: 56px;
      width: 100%;
      display: flex;
      justify-content: flex-start;
      padding: 16px;
      border-bottom: 1px solid #eee;
    }
    .block2 {
      padding: 7px;
      .multi-text {
        width: 100%;
        overflow: hidden;
        /*文本不会换行*/
        white-space: nowrap;
        /*当文本溢出包含元素时，以省略号表示超出的文本*/
        text-overflow: ellipsis;
        display: flex;
        justify-content: flex-start;
        flex-direction: column;
        text-align: left;
      }
    }
  }
}
.no-data {
  text-align: center;
  height: 200px;
  line-height: 200px;
}
.custom-table-style {
  :deep(.#{$custom-namespace}-table__inner-wrapper) {
    // 表头样式
    .#{$custom-namespace}-table__fixed .#{$custom-namespace}-table__fixed-header-wrapper thead tr th,
    .#{$custom-namespace}-table__header-wrapper thead tr th,
    .#{$custom-namespace}-table__header thead tr th {
      border-right: 1px solid #eee;
    }
    .#{$custom-namespace}-table__fixed .#{$custom-namespace}-table__fixed-header-wrapper thead tr th:first-child,
    .#{$custom-namespace}-table__header-wrapper thead tr th:first-child,
    .#{$custom-namespace}-table__header thead tr th:first-child {
      border-left: 1px solid #eee;
    }
    // 单元格样式
    .#{$custom-namespace}-table__fixed .#{$custom-namespace}-table__fixed-body-wrapper .el-table__row td,
    .#{$custom-namespace}-table__body .#{$custom-namespace}-table__row td {
      border-right: 1px solid #eee;
    }

    .#{$custom-namespace}-table__fixed .#{$custom-namespace}-table__fixed-body-wrapper .el-table__row td:first-child,
    .#{$custom-namespace}-table__body .#{$custom-namespace}-table__row td:first-child {
      border-left: 1px solid #eee;
    }

    td {
      vertical-align: top !important;
    }

    .cell {
      padding: 0 !important;
    }
  }
}
</style>
