<template>
  <el-dialog
    v-model="form.visible"
    :title="currentId ? '编辑机型' : '新增机型'"
    width="800"
    destroy-on-close
    :before-close="() => handleClose(false)"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="form.loading" label-width="150px" style="padding: 0 10px">
      <div class="flex-between">
        <el-form-item label="品牌:" prop="brand">
          <el-select
            class="w-200"
            placeholder="请选择"
            v-model="form.brand"
            clearable
            filterable
            :disabled="currentId ? true : false"
          >
            <el-option v-for="(item, key) in form.brandList" :key="item.value" :value="item.value" :label="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="机型:" prop="phone">
          <el-input
            class="w-200"
            placeholder=""
            v-model="form.phone"
            clearable
            @blur="getSeriesName"
            :disabled="currentId ? true : false"
          >
          </el-input>
        </el-form-item>
      </div>
      <div class="flex-between">
        <el-form-item label="机型系列:">
          <el-input class="w-200" placeholder="" v-model="form.model" clearable> </el-input>
        </el-form-item>
        <el-form-item label="界面显示开关:" prop="page_display">
          <el-select class="w-200" placeholder="请选择" v-model="form.page_display">
            <el-option value="是" label="是" />
            <el-option value="否" label="否" />
          </el-select>
        </el-form-item>
      </div>
      <fieldset class="box-line">
        <legend>关联谷歌设定:</legend>
        <div class="flex-between">
          <!-- <el-form-item label="谷歌品牌:" prop="google_brand">
            <el-select class="w-200" placeholder="请选择" v-model="form.google_brand" clearable 
              collapse-tags
              collapse-tags-tooltip 
              filterable
              remote
              reserve-keyword
              :remote-method="google.seeks.getPhoneBrandByGoogleList"
              disabled
            >
              <template #header>
                <el-checkbox
                  v-model="google.checkAllBrand"
                  :indeterminate="google.indeterminateBrand"
                  @change="google.actions.handleCheckAllBrand"
                >
                  All
                </el-checkbox>
              </template>
              <el-option
                v-for="item in google.brandOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item> -->
          <el-form-item label="谷歌机型系列:" prop="google_model">
            <el-select class="w-200" placeholder="请选择" v-model="form.google_model" clearable 
              filterable
              remote
              reserve-keyword
              :remote-method="google.seeks.queryPhoneModelByGoogleList"
              allow-create
            >
              <!-- <template #header>
                <el-checkbox
                  v-model="google.checkAllModel"
                  :indeterminate="google.indeterminateModel"
                  @change="google.actions.handleCheckAllModel"
                >
                  All
                </el-checkbox>
              </template> -->
              <el-option
                v-for="item in google.modelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </div>
        <div class="">
          <el-form-item label="谷歌机型:" prop="google_phone">
            <el-select placeholder="请选择" v-model="form.google_phone" clearable 
              multiple
              filterable
              remote
              reserve-keyword
              :remote-method="google.seeks.queryPhoneByGoogleList"
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="3"
              style="width: 100%"
              allow-create
            >
              <template #header>
                <el-checkbox
                  v-model="google.checkAllPhone"
                  :indeterminate="google.indeterminatePhone"
                  @change="google.actions.handleCheckAllPhone"
                >
                  All
                </el-checkbox>
              </template>
              <el-option
                v-for="item in google.phoneOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </div>
      </fieldset>
      <div class="flex-between">
        <el-form-item label="抽样状态:">
          <el-select class="w-200" placeholder="请选择" v-model="form.sample_status" clearable>
            <el-option
              v-for="(item, key) in form.sample_status_list"
              :key="item.value"
              :value="item.value"
              :label="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="抽样关键词:">
          <el-input class="w-200" placeholder="" v-model="form.sample_word" clearable maxlength="20"> </el-input>
        </el-form-item>
      </div>
      <div class="flex-between">
        <el-form-item label="采集状态:">
          <el-select class="w-200" placeholder="请选择" v-model="form.collect_status" clearable>
            <el-option
              v-for="(item, key) in form.collect_status_list"
              :key="item.value"
              :value="item.value"
              :label="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="爬取状态:">
          <el-select class="w-200" placeholder="请选择" v-model="form.crawler_status" clearable>
            <el-option
              v-for="(item, key) in form.crawler_status_list"
              :key="item.value"
              :value="item.value"
              :label="item.name"
            />
          </el-select>
        </el-form-item>
      </div>
      <div class="flex-between">
        <el-form-item label="理解状态:">
          <el-select class="w-200" placeholder="请选择" v-model="form.nlp_status" clearable>
            <el-option
              v-for="(item, key) in form.nlp_status_list"
              :key="item.value"
              :value="item.value"
              :label="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="采集时间:">
          <el-date-picker
            class="w-200"
            v-model="form.collect_date"
            type="date"
            placeholder=""
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </div>
      <div class="flex-between">
        <el-form-item label="超前预热时间:">
          <el-date-picker
            class="w-200"
            v-model="form.ahead_hot_date"
            type="date"
            placeholder=""
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="正式预热时间:">
          <el-date-picker class="w-200" v-model="form.hot_date" type="date" placeholder="" value-format="YYYY-MM-DD" />
        </el-form-item>
      </div>
      <div class="flex-between">
        <el-form-item label="发布时间:">
          <el-date-picker
            class="w-200"
            v-model="form.publish_date"
            type="date"
            placeholder=""
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="发售时间:">
          <el-date-picker
            class="w-200"
            v-model="form.online_time"
            type="date"
            placeholder=""
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose(false)">取消</el-button>
        <el-button type="primary" @click="submit">{{ currentId ? '立即修改' : '立即新增' }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { getBrandPhoneModel, updateModel, getPhoneBrandByGoogle, queryPhoneModelByGoogle, queryPhoneByGoogle } from '@/api/information/manager'
import type { FormRules, FormInstance } from 'element-plus'

import { useCurrentInstance } from '@/hooks'
const { globalProperties } = useCurrentInstance()

const emit = defineEmits(['clickClose'])
const formRef = ref<FormInstance>()

const props = defineProps({
  //是否展示
  visible: {
    type: Boolean,
    default: false
  },
  currentId: {
    type: [String, Number],
    default: ''
  },
  currentRow: {
    type: Object,
    default: () => {
      {
      }
    }
  }
})

const rules = reactive<FormRules>({
  brand: [{ required: true, message: '请选择品牌', trigger: 'change' }],
  phone: [{ required: true, message: '请填写机型', trigger: 'blur' }],
  page_display: [{ required: true, message: '请选择界面显示开关', trigger: 'change' }],
  google_phone: [{ required: true, message: '请填写谷歌机型', trigger: 'blur' }],
  google_model: [{ required: true, message: '请填写谷歌机型系列', trigger: 'blur' }],
})
const form = reactive({
  visible: false,
  brand: '',
  brandList: [] as any[],
  model: '',
  page_display: null as null | '是' | '否',
  phone: '',
  collect_status: '否',
  collect_status_list: [
    {
      value: '是',
      name: '是'
    },
    {
      value: '否',
      name: '否'
    }
  ] as any[],
  crawler_status: '否',
  crawler_status_list: [
    {
      value: '是',
      name: '是'
    },
    {
      value: '否',
      name: '否'
    }
  ] as any[],
  nlp_status: '否',
  nlp_status_list: [
    {
      value: '是',
      name: '是'
    },
    {
      value: '否',
      name: '否'
    }
  ] as any[],
  collect_date: '',
  online_time: '',
  publish_date: '',
  sample_status: '否',
  sample_status_list: [
    {
      value: '是',
      name: '是'
    },
    {
      value: '否',
      name: '否'
    }
  ] as any[],
  sample_word: '',
  ahead_hot_date: '',
  hot_date: '',
  google_brand: '',
  google_model: '',
  google_phone: [],
  loading: false
})
watch(
  () => props.visible,
  (newValue) => {
    form.visible = newValue
    if (newValue) {
      getFormDetail()
      google.seeks.getPhoneBrandByGoogleList()
      // getPhoneBrandList()
    }
  }
)

let editId: string | number = 0
watch(
  () => props.currentId,
  (newValue) => {
    if (newValue) {
      form.brand = props.currentRow.brand
      form.phone = props.currentRow.phone
      form.model = props.currentRow.model
      form.page_display = props.currentRow.pageDisplay
      form.collect_status = props.currentRow.collectStatus
      form.crawler_status = props.currentRow.crawlerStatus
      form.nlp_status = props.currentRow.nlpStatus
      form.collect_date = props.currentRow.collectDate
      form.online_time = props.currentRow.onlineTime
      form.publish_date = props.currentRow.publishDate
      form.sample_status = props.currentRow.sampleStatus
      form.sample_word = props.currentRow.sampleWord
      form.ahead_hot_date = props.currentRow.aheadHotDate
      form.hot_date = props.currentRow.hotDate
      form.google_model = props.currentRow.google_model
      form.google_phone = props.currentRow.google_phone
      editId = props.currentId
      formRef.value?.clearValidate()
    }
  }
)
const getPhoneBrandList = () => {
  getBrandPhoneModel().then((res) => {
    const brandList: any = []
    if (res && res.brand) {
      Object.keys(res.brand).forEach((item: any) => {
        brandList.push({
          name: item,
          value: item,
          list: res.brand[item] || []
        })
      })
    }
    form.brandList = brandList
  })
}
const getSeriesName = () => {
  form.phone = form.phone.trim()
  if (!form.phone) {
    form.model = ''
  } else {
    form.model = form.phone + ' Series'
  }
}
const getFormDetail = () => {}
const resetForm = () => {
  form.brand = ''
  form.phone = ''
  form.model = ''
  form.page_display = '否'
  form.collect_status = '否'
  form.crawler_status = '否'
  form.nlp_status = '否'
  form.collect_date = ''
  form.online_time = ''
  form.publish_date = ''
  form.sample_status = '否'
  form.sample_word = ''
  form.ahead_hot_date = ''
  form.hot_date = ''
  form.google_brand = ''
  form.google_model = ''
  form.google_phone = []
  formRef.value?.clearValidate()
}
const handleClose = (tag = false) => {
  resetForm()
  emit('clickClose', tag)
}
const submit = () => {
  formRef.value?.validate(async (validate) => {
    if (validate) {
      const params: any = {
        brand: form.brand,
        collect_date: form.collect_date,
        collect_status: form.collect_status,
        crawler_status: form.crawler_status,
        google_model: form.google_model,
        google_phone: form.google_phone,
        model: form.model,
        page_display: form.page_display,
        nlp_status: form.nlp_status,
        online_time: form.online_time,
        phone: form.phone,
        publish_date: form.publish_date,
        sample_status: form.sample_status,
        sample_word: form.sample_word,
        ahead_hot_date: form.ahead_hot_date,
        hot_date: form.hot_date
      }
      if (props.currentId) {
        params.id = props.currentId
      }
      form.loading = true

      updateModel(params)
        .then((res) => {
          if (res) {
            let message = `${props.currentId ? '编辑' : '新增'}成功！<br/><br/>10秒后对应标签将更新，刷新页面即可查看`
            globalProperties.$message({
              dangerouslyUseHTMLString: true,
              message,
              type: 'success'
            })
            handleClose(true)
          }
        })
        .finally(() => {
          form.loading = false
        })
    }
  })
}

const google = shallowReactive({
  brandOptions: [] as Dict,
  modelOptions: [] as Dict,
  phoneOptions: [] as Dict,
  checkAllBrand: false,
  checkAllModel: false,
  checkAllPhone: false,
  indeterminateBrand: false,
  indeterminateModel: false,
  indeterminatePhone: false,
  actions: {
    handleCheckAllPhone: () => {
      if (google.checkAllPhone) {
        form.google_phone = google.phoneOptions.map((el: Dict) => el.value)
      } else {
        form.google_phone = []
      }
    },
  },
  seeks: {
    getPhoneBrandByGoogleList: (keyword?: string) => {
      if (keyword) {
        // 本地搜索
        google.brandOptions = google.brandOptions.filter((brand: Dict) => {
          if (brand.label.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
            return true
          }
          return false
        })
      } else {
        getPhoneBrandByGoogle().then(res => {
          if (Array.isArray(res)) {
            google.brandOptions = res.map(brand => ({
              name: brand,
              label: brand,
              value: brand,
            }))
            form.brandList = [...google.brandOptions as any]
          }
        })
      }
    },
    queryPhoneModelByGoogleList: (keyword?: string) => {
      if (!form.brand) {
        google.modelOptions = []
        return globalProperties.$message.error(`请先选择谷歌品牌`)
      }

      if (keyword) {
        // 本地搜索
        google.modelOptions = google.modelOptions.filter((item: Dict) => {
          if (item.label.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
            return true
          }
          return false
        })
      } else {
        const params = {
          brand: form.brand,
        }
        queryPhoneModelByGoogle(params).then(res => {
          if (Array.isArray(res)) {
            google.modelOptions = res.map(item => {
              if (item) {
                return {
                  label: item,
                  value: item,
                }
              }
              return false
            }).filter(Boolean)
          }
        })    
      }
    },
    queryPhoneByGoogleList: (keyword?: string) => {
      if (!form.brand) {
        google.modelOptions = []
        google.phoneOptions = []
        return globalProperties.$message.error(`请先选择谷歌品牌`)
      }
      if (!form.google_model) {
        google.phoneOptions = []
        return globalProperties.$message.error(`谷歌机型系列必填`)
      }

      if (keyword) {
        // 本地搜索
        google.phoneOptions = google.phoneOptions.filter((item: Dict) => {
          if (item.label.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
            return true
          }
          return false
        })
      } else {
        const params = {
          brand: form.brand,
          googleModel: form.google_model,
        }
        queryPhoneByGoogle(params).then(res => {
          if (Array.isArray(res)) {
            google.phoneOptions = res.map(item => {
              if (item) {
                return {
                  label: item,
                  value: item,
                }
              }
              return false
            }).filter(Boolean)
            form.google_phone = [...form.google_phone] //重刷checkbox
          }
        })    
      }
    }
  }
})

watch(() => form.google_phone, () => {
  if (form.google_phone.length > 0) {
    if (form.google_phone.length != google.phoneOptions.length) {
      google.indeterminatePhone = true
      return
    } else {
      google.checkAllPhone = true
    }
  } else {
    google.checkAllPhone = false
  }
  google.indeterminatePhone = false
  
})
watch(() => form.brand, () => {
  if (!form.brand) {
    form.google_model = ''
    form.google_phone = []
  }
})
watch(() => form.google_model, () => {
  if (!form.google_model) form.google_phone = []
  if (!form.brand) {
    if (!editId)
      form.google_phone = []
  }
  editId = 0
})
</script>
<style lang="scss" scoped>
.box-line {
  border-radius: 5px;
  border: 1px dashed #CCC;
  margin: 0 -10px 20px -10px;
  padding: 5px 10px 0 10px;
}
</style>
