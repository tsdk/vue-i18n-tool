<template>
  <div>
    <div class="">
      <div class="pd20 common-content">
        <div class="flex-between">
          <h1 style="white-space: nowrap">机型维表</h1>
          <el-button
            type="primary"
            plain
            @click="handleToCreate"
            v-permission="{
              permissionKey: 'INFORMATION_MANAGER_MODEL_OPERATE'
            }"
            >新增机型
          </el-button>
        </div>
        <div class="mt15">
          <div class="flex-between">
            <div class="flex-row" style="min-width: 150px">
              <span class="text-label no-wrap mr5">品牌:</span>
              <el-select
                class="w-250"
                placeholder="请选择"
                v-model="page.brand"
                collapse-tags
                collapse-tags-tooltip
                multiple
                clearable
                filterable
                @change="handleChangBrand"
              >
                <el-option
                  v-for="(item, key) in page.brandList"
                  :key="item.value"
                  :value="item.value"
                  :label="item.name"
                />
              </el-select>
            </div>
            <div class="flex-row" style="min-width: 150px">
              <span class="text-label no-wrap mr5">机型:</span>
              <el-select
                class="w-250"
                placeholder="请选择"
                v-model="page.phone"
                collapse-tags
                collapse-tags-tooltip
                clearable
                multiple
                filterable
                @change="handleChangeFilter"
              >
                <el-option v-for="(item, key) in page.phoneList" :key="item" :value="item" :label="item" />
              </el-select>
            </div>
            <div class="flex-row" style="min-width: 150px">
              <span class="text-label no-wrap mr5">机型系列:</span>
              <el-select
                class="w-250"
                placeholder="请选择"
                v-model="page.model"
                collapse-tags
                collapse-tags-tooltip
                clearable
                filterable
                multiple
                @change="handleChangeFilter"
              >
                <el-option v-for="(item, key) in page.modelList" :key="item" :value="item" :label="item" />
              </el-select>
            </div>
            <div class="flex-row" style="min-width: 150px">
              <span class="text-label no-wrap mr5">界面显示开关:</span>
              <el-select
                class="w-250"
                placeholder="请选择"
                v-model="page.page_displays"
                multiple
                @change="handleChangeFilter"
              >
                <el-option value="是" label="是" />
                <el-option value="否" label="否" />
              </el-select>
            </div>
          </div>
          <div class="flex-between mt10">
            <div class="flex-row" style="min-width: 150px">
              <span class="text-label no-wrap mr5">抽样状态:</span>
              <el-select
                class="w-250"
                placeholder="请选择"
                v-model="page.sample_status"
                collapse-tags
                collapse-tags-tooltip
                clearable
                filterable
                multiple
                @change="handleChangeFilter"
              >
                <el-option
                  v-for="(item, key) in page.sample_status_list"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                />
              </el-select>
            </div>
            <div class="flex-row" style="min-width: 150px">
              <span class="text-label no-wrap mr5">抽样关键词:</span>
              <el-select
                class="w-250"
                placeholder="请选择"
                v-model="page.sample_words"
                collapse-tags
                collapse-tags-tooltip
                clearable
                filterable
                multiple
                @change="handleChangeFilter"
              >
                <el-option v-for="(item, key) in page.sample_words_list" :key="item" :value="item" :label="item" />
              </el-select>
            </div>
            <div class="flex-row" style="min-width: 150px">
              <span class="text-label no-wrap mr5">采集状态:</span>
              <el-select
                class="w-250"
                placeholder="请选择"
                v-model="page.collect_status"
                clearable
                filterable
                multiple
                @change="handleChangeFilter"
              >
                <el-option
                  v-for="(item, key) in page.collect_status_list"
                  :key="item.value"
                  :value="item.value"
                  :label="item.name"
                />
              </el-select>
            </div>
            <div class="flex-row" style="min-width: 150px">
              <span class="text-label no-wrap mr5">爬取状态:</span>
              <el-select
                class="w-250"
                placeholder="请选择"
                v-model="page.crawler_status"
                clearable
                filterable
                multiple
                @change="handleChangeFilter"
              >
                <el-option
                  v-for="(item, key) in page.crawler_status_list"
                  :key="item.value"
                  :value="item.value"
                  :label="item.name"
                />
              </el-select>
            </div>
          </div>
          <div class="flex-between mt10">
            <div class="flex-row" style="min-width: 150px">
              <span class="text-label no-wrap mr5">理解状态:</span>
              <el-select
                class="w-250"
                placeholder="请选择"
                v-model="page.nlp_status"
                clearable
                filterable
                multiple
                @change="handleChangeFilter"
              >
                <el-option
                  v-for="(item, key) in page.nlp_status_list"
                  :key="item.value"
                  :value="item.value"
                  :label="item.name"
                />
              </el-select>
            </div>
          </div>
        </div>
      </div>

      <div class="mt15 table common-content">
        <div class="flex-between" style="padding: 15px">
          <div>{{ page.totalRecords }}条数据</div>
          <el-button size="small" type="primary" disabled v-if="page.pageTotal > 10000">
            导出结果
            <el-tooltip
              effect="dark"
              placement="top"
              popper-class="custom-popper-note"
              content="页面匹配数据过多，暂不支持下载。
补充筛选条件后，数据< 1万 条，即可下载哦～"
            >
              <svg-icon name="smc-question-solid" className="ml5" />
            </el-tooltip>
          </el-button>
          <el-button size="small" type="primary" @click="handleToDownload" v-else> 导出结果 </el-button>
        </div>
        <el-table
          :data="page.tableData"
          tooltip-effect="dark"
          v-loading="page.loading"
          @sort-change="handleChangeSort"
          :default-sort="{ prop: page.sortValue, order: page.order }"
          scrollbar-always-on
          v-table-sticky-header
          v-table-sticky-scroller
        >
          <el-table-column property="id" label="品牌" min-width="120" show-overflow-tooltip>
            <template #default="scope">
              {{ scope.row.brand }}
            </template>
          </el-table-column>
          <el-table-column property="activityType" label="机型" min-width="180" show-overflow-tooltip :align="'center'">
            <template #default="scope">
              {{ scope.row.phone }}
            </template>
          </el-table-column>
          <el-table-column label="机型系列" min-width="180" show-overflow-tooltip :align="'center'">
            <template #default="scope"> {{ scope.row.model || '--' }}</template>
          </el-table-column>
          <el-table-column label="谷歌机型系列" min-width="180" show-overflow-tooltip :align="'center'">
            <template #default="scope"> {{ scope.row.google_model || '--' }}</template>
          </el-table-column>
          <el-table-column label="谷歌机型" min-width="180" show-overflow-tooltip :align="'center'">
            <template #default="scope"> {{ scope.row.google_phone || '--' }}</template>
          </el-table-column>
          <el-table-column label="界面显示开关" min-width="180" :align="'center'">
            <template #default="scope">
              <el-tag effect="plain" :type="scope.row.pageDisplay == '是' ? 'danger' : 'info'" round>
                <div class="flex-row">
                  <span class="ml10 mr10">{{ scope.row.pageDisplay || '--' }}</span>
                </div>
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="抽样状态" min-width="100" show-overflow-tooltip>
            <template #default="scope">
              <el-tag effect="plain" :type="scope.row.sampleStatus == '是' ? 'danger' : 'info'" round>
                <div class="flex-row">
                  <span class="ml10 mr10">{{ scope.row.sampleStatus || '--' }}</span>
                </div>
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="抽样关键词" min-width="180" show-overflow-tooltip>
            <template #default="scope"> {{ scope.row.sampleWord || '--' }}</template>
          </el-table-column>
          <el-table-column label="采集状态" min-width="100" show-overflow-tooltip>
            <template #default="scope">
              <el-tag effect="plain" :type="scope.row.collectStatus == '是' ? 'danger' : 'info'" round>
                <div class="flex-row">
                  <span class="ml10 mr10">{{ scope.row.collectStatus || '--' }}</span>
                </div>
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="采集时间" min-width="140" property="collect_date" sortable="custom">
            <template #default="scope">
              {{ scope.row.collectDate || '--' }}
            </template>
          </el-table-column>

          <el-table-column label="爬取状态" min-width="100">
            <template #default="scope">
              <el-tag effect="plain" :type="scope.row.crawlerStatus == '是' ? 'danger' : 'info'" round>
                <div class="flex-row">
                  <span class="ml10 mr10">{{ scope.row.crawlerStatus || '--' }}</span>
                </div>
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column property="title" label="理解状态" min-width="100">
            <template #default="scope">
              <el-tag effect="plain" :type="scope.row.nlpStatus == '是' ? 'danger' : 'info'" round>
                <div class="flex-row">
                  <span class="ml10 mr10">{{ scope.row.nlpStatus || '--' }}</span>
                </div>
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="机型超前预热时间" min-width="180" property="ahead_hot_date" sortable="custom">
            <template #default="scope">{{ scope.row.aheadHotDate || '--' }}</template>
          </el-table-column>
          <el-table-column label="机型正式预热时间" min-width="180" property="hot_date" sortable="custom">
            <template #default="scope">{{ scope.row.hotDate || '--' }}</template>
          </el-table-column>
          <el-table-column label="机型发布时间" min-width="180" property="publish_date" sortable="custom">
            <template #default="scope">{{ scope.row.publishDate || '--' }}</template>
          </el-table-column>
          <el-table-column label="机型发售时间" min-width="180" property="online_time" sortable="custom">
            <template #default="scope">{{ scope.row.onlineTime || '--' }}</template>
          </el-table-column>

          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                link
                @click="handleEdit(scope.row)"
                v-permission="{
                  permissionKey: 'INFORMATION_MANAGER_MODEL_OPERATE'
                }"
                >修改
              </el-button>
              <el-button
                link
                type="danger"
                @click="handleToDelete(scope.row)"
                v-permission="{
                  permissionKey: 'INFORMATION_MANAGER_MODEL_OPERATE'
                }"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="pd20"
          background
          :current-page="page.pageNumber"
          :page-size="page.pageSize"
          @size-change="handleSizeChange"
          :page-sizes="[10, 15, 20, 50, 100]"
          @current-change="handlePageChange"
          layout="->,total,quickPrev,prev,pager,next,quickNext,sizes,jumper"
          :total="page.totalRecords"
        />
      </div>
      <CreateModelDialog
        :visible="page.createVisible"
        :currentId="page.currentId"
        :currentRow="page.currentRow"
        @clickClose="handleCloseCreateDialog"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  getBrandPhoneModel,
  getBrandDimensionList,
  downloadBrandDimensionList,
  brandDimDelete
} from '@/api/information/manager'
import { useCurrentInstance, useTable } from '@/hooks'
import CreateModelDialog from './components/CreateModelDialog.vue'
import { customDownload } from '@/utils/commonUtils'
const { globalProperties } = useCurrentInstance()
const router = useRouter()

const page = reactive({
  brand: [],
  brandList: [] as any[],
  model: [],
  page_displays: [] as Array<'是' | '否'>,
  modelList: [] as any[],
  phone: [],
  phoneList: [] as any[],
  collect_status: [],
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
  //抽样状态
  sample_status: [],
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
  sample_words: [],
  sample_words_list: [] as any[],
  crawler_status: [],
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
  nlp_status: '',
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
  loading: false,
  createVisible: false,
  tableData: [] as any[],
  totalRecords: 0,
  pageSize: 20,
  pageNumber: 1,
  pageTotal: 0,
  currentId: '',
  currentRow: {},
  sortValue: '',
  order: '' as any,
  allPhoneList: [] as any[],
  allBrandModelList: [] as any[]
})

const handleSizeChange = (val: number) => {
  page.pageSize = val
  getTableData()
}

const handlePageChange = (val: number) => {
  page.pageNumber = val
  getTableData()
}
const handleChangeFilter = () => {
  page.pageNumber = 1
  getTableData()
}
const getCommonParams = () => {
  const params: any = {
    pageSize: page.pageSize,
    pageNumber: page.pageNumber,
    brand: page.brand,
    collect_status: page.collect_status,
    crawler_status: page.crawler_status,
    model: page.model,
    page_displays: page.page_displays,
    nlp_status: page.nlp_status,
    sample_status: page.sample_status,
    sample_words: page.sample_words,
    phone: page.phone,
    // 排序字段:collect_date-采集时间，online_time-上线时间，publish_date-发布时间
    orderByColumn: page.sortValue,
    // 排序 DESC-降序 ASC-升序
    ascDesc: page.order
  }
  return params
}
const getTableData = () => {
  page.loading = true
  const params = getCommonParams()
  getBrandDimensionList(params)
    .then((res) => {
      if (res) {
        page.tableData = res.data || []
        page.totalRecords = res.totalRecords
      } else {
        page.tableData = []
        page.totalRecords = 0
      }
    })
    .finally(() => {
      page.loading = false
    })
}
const getPhoneBrandList = () => {
  getBrandPhoneModel().then((res) => {
    if (res) {
      // 数据解析
      const brands: any = []
      if (res.brand) {
        Object.keys(res.brand).forEach((item: any) => {
          brands.push({
            name: item,
            value: item,
            list: res.brand[item] || [],
            model: res.brandModel[item] || []
          })
        })
      }
      res.brand = brands
      page.allPhoneList = [] as any[]
      page.allBrandModelList = [] as any[]
      brands.forEach((item: any) => {
        page.allPhoneList.push(...item.list)
        page.allBrandModelList.push(...item.model)
      })
      page.allPhoneList = [...new Set(page.allPhoneList)]
      page.allBrandModelList = [...new Set(page.allBrandModelList)]
      page.brandList = [...new Set(res.brand)]
      page.phoneList = [...new Set(page.allPhoneList)]
      page.modelList = [...new Set(page.allBrandModelList)]
      page.sample_words_list = res.sampleWords.filter(Boolean) || []
    }
  })
}
// 品牌查找机型系列
const handleChangBrand = (val: any[]) => {
  let phoneList: any = []
  let modelList: any = []
  if (Array.isArray(val) && val.length) {
    page.brandList.forEach((item: any) => {
      val.forEach((innerItem: string) => {
        if (item.name === innerItem) {
          phoneList.push(...item.list)
          modelList.push(...item.model)
        }
      })
    })
    page.phoneList = [...new Set(phoneList)]
    page.modelList = [...new Set(modelList)]
  } else {
    page.phoneList = page.allPhoneList
    page.modelList = page.allBrandModelList
  }

  page.phone = []
  page.model = []

  handleChangeFilter()
}

const handleToCreate = () => {
  page.currentId = ''
  page.currentRow = {}
  page.createVisible = true
}
const handleEdit = (row: any) => {
  page.currentId = row.id
  page.currentRow = JSON.parse(JSON.stringify(row))
  page.createVisible = true
}
const handleCloseCreateDialog = (tag = false) => {
  page.createVisible = false
  page.currentId = ''
  page.currentRow = {}
  if (tag) {
    getTableData()
    //可能新增了抽样关键词故重新请求
    handleChangeFilter()
  }
}
//修改排序
const handleChangeSort = (item: any) => {
  if (item.order) {
    page.sortValue = item.prop
    page.order = item.order === 'descending' ? 'DESC' : 'ASC'
  } else {
    page.sortValue = ''
    page.order = ''
  }
  getTableData()
}
const handleToDownload = () => {
  const params: any = getCommonParams()
  params.download = true
  params.totalRecords = page.pageTotal
  page.loading = true
  downloadBrandDimensionList(params)
    .then((blob: Blob) => {
      if (blob instanceof Blob) {
        const blobUrl = URL.createObjectURL(blob)
        customDownload(blobUrl, '机型维表Excel.xlsx')
      }
    })
    .finally(() => {
      page.loading = false
    })
}
const handleToDelete = (row: any) => {
  globalProperties
    .$confirm('确认删除？', '提示')
    .then(async () => {
      const params = {
        id: row.id
      }
      brandDimDelete(params).then((res) => {
        if (res) {
          globalProperties.$message({
            message: '操作成功',
            type: 'success'
          })
          getTableData()
        }
      })
    })
    .catch((e: Error) => {
      console.log(e)
    })
}

onMounted(() => {
  getPhoneBrandList()
  getTableData()
})
</script>

<style lang="scss" scoped>
:deep(.#{$namespace}-table__empty-block) {
  height: 250px !important;
  border: none;
}
:deep(.#{$namespace}-tag) {
  white-space: normal;
  height: auto;
  line-height: 20px;
  // padding: 5px;
}
.info {
  color: $custom-color-info;
}
.primary {
  color: $custom-color-primary;
}
.success {
  color: $custom-color-success;
}
.warning {
  color: $custom-color-warning;
}
.danger {
  color: $custom-color-danger;
}

// .flex-row {
//   & > div {
//     flex-shrink: 0;
//   }
// }
.text-label {
  width: 100px;
  text-align: right;
}
.no-wrap {
  white-space: nowrap;
}
</style>
