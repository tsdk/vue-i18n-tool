<template>
  <div>
    <div class="common-content">
      <div class="pd20">
        <span>评论打标</span>
        <el-tooltip
          class="box-item"
          effect="dark"
          content="记录用户反馈的评论打标错误，及 提报/修正 等操作"
          placement="top-start"
        >
          <svg-icon name="smc-question-solid" className="ml5 pointer"></svg-icon>
        </el-tooltip>
      </div>
      <div class="flex-row" style="padding: 0 20px 20px 20px">
        <div class="flex-row" style="flex-wrap: wrap; gap: 15px">
          <div class="flex-row">
            <span class="mr10">发文平台:</span>
            <el-select
              class="w-200"
              placeholder="请选择"
              v-model="instance.queryParams.platform"
              clearable
              filterable
              collapse-tags
              collapse-tags-tooltip
              multiple
            >
              <el-option
                v-for="(item, key) in instance.filterObj.platformList"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              />
            </el-select>
          </div>
          <div class="flex-row">
            <span class="mr10">操作类型:</span>
            <el-select
              class="w-200"
              placeholder="请选择"
              v-model="instance.queryParams.fixTypeList"
              collapse-tags
              collapse-tags-tooltip
              clearable
              multiple
              filterable
            >
              <el-option
                v-for="(item, key) in instance.filterObj.operateTypeList"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              />
            </el-select>
          </div>
          <div class="flex-row">
            <span class="mr10">当前状态:</span>
            <el-select
              class="w-200"
              placeholder="请选择"
              v-model="instance.queryParams.statusList"
              collapse-tags
              collapse-tags-tooltip
              multiple
              clearable
              filterable
            >
              <el-option
                v-for="(item, key) in instance.filterObj.statusOptions"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              />
            </el-select>
          </div>
          <el-input class="w-200 w-search" placeholder="评论内容" v-model="instance.queryParams.text" clearable>
            <template #suffix>
              <svg-icon name="smc-search" className="pointer" />
            </template>
          </el-input>
          <el-input class="w-200 w-search" placeholder="评论ID" v-model="instance.queryParams.itemId" clearable>
            <template #suffix>
              <svg-icon name="smc-search" className="pointer" />
            </template>
          </el-input>
        </div>
      </div>

      <div class="table">
        <el-table
          ref="platformTableRef"
          :data="tableData"
          style="width: 100%"
          tooltip-effect="dark"
          v-loading="loading"
        >
          <el-table-column label="记录ID" width="200">
            <template #default="scope">
              {{ scope.row.recordId }}
            </template>
          </el-table-column>
          <el-table-column label="平台" width="70">
            <template #default="scope">
              {{ PLATFORM_MAP[scope.row.platform as 'douyin' | 'redbook' | 'toutiao' | 'weibo' | 'bilibili'] }}
            </template>
          </el-table-column>
          <el-table-column label="评论信息" property="title" min-width="440" show-overflow-tooltip>
            <template #default="scope">
              <div v-if="scope.row.itemId" class="desc" style="font-size: 13px">评论ID:{{ scope.row.itemId }}</div>
              <div v-if="scope.row.title">{{ scope.row.title }}</div>
            </template>
          </el-table-column>
          <el-table-column label="提报/修改人" min-width="180">
            <template #default="scope">
              <span v-if="scope.row.fixType === 'fix'">{{ scope.row.fixUser }}</span>
              <span v-else>{{ scope.row.createUser }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作类型" min-width="100">
            <template #default="scope">
              <span>{{ FIX_TYPE_MAP[scope.row.fixType] }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作时间" property="fixTime" min-width="180">
            <template #default="scope">
              <span v-if="scope.row.fixType === 'fix'">{{ scope.row.fixTime }}</span>
              <span v-else>{{ scope.row.createTime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="当前状态" min-width="100">
            <template #default="scope">
              <span :class="STATUS_MAP[scope.row.status]?.type || 'info'">
                {{ STATUS_MAP[scope.row.status].text || '--' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作记录" min-width="240">
            <template #default="scope">
              <ul>
                <li v-for="item in fixLogs(scope.row)">
                  <el-link @click="handleRecordDetail(scope.row)">{{ item }}</el-link>
                </li>
              </ul>
            </template>
          </el-table-column>
          <!-- <el-table-column label="操作" min-width="170" fixed="right">
            <template #default="scope">
              <div v-if="scope.row.status === 'wait_fix'">
                <el-button
                  class="mr5"
                  link
                  type="primary"
                  @click="handleFixIt(scope.row, 'fix')"
                  v-permission="{
                    permissionKey: 'COMMENT_TAG_OPERATE_FIX'
                  }"
                >
                  立即修正
                </el-button>
                <el-button
                  link
                  type="primary"
                  @click="handleFixIt(scope.row, 'ignore')"
                  v-permission="{
                    permissionKey: 'COMMENT_TAG_OPERATE_FIX'
                  }"
                >
                  暂不修正
                </el-button>
              </div>
            </template>
          </el-table-column> -->
        </el-table>
      </div>
      <el-pagination
        class="pd20"
        background
        :page-size="page.pageSize"
        :current-page="page.pageNumber"
        @size-change="handleSizeChange"
        :page-sizes="[10, 15, 20, 50, 100]"
        @current-change="handlePageChange"
        layout="->,total,quickPrev,prev,pager,next,quickNext,sizes,jumper"
        :total="page.totalRecords"
      />
    </div>

    <LogDialog
      type="comment"
      :isShowDialog="instance.logDialogVisible"
      :rowItem="instance.editItem"
      @clickClose="handleCloseLogDialog"
    />
    <SecondCorrection
      type="comment"
      :rowItem="instance.editItem"
      :isShowDialog="instance.scDialogVisible"
      :filterBrandList="instance.filterObj.filterBrandList"
      :filterQQMoodList="instance.filterObj.filterContentQQList"
      @clickClose="handleCloseScDialog"
    />
  </div>
</template>

<script lang="ts" setup>
import LogDialog from './components/LogDialog.vue'
import SecondCorrection from './components/SecondCorrection.vue'
import { getCommentBadcaseList, commentSubmit } from '@/api/content/badcase/index'
import { sentimentFilterDim } from '@/api/information/opinion'
import { useCurrentInstance, useTable } from '@/hooks'
import { ElTable } from 'element-plus'
// import LogDialog from './components/LogDialog.vue'
import {
  OPERATE_TYPE_OPTIONS,
  STATUS_OPTIONS,
  PLATFORM_OPTIONS,
  PLATFORM_MAP,
  STATUS_MAP,
  FIX_TYPE_MAP
} from './constant/index'
import { BadCaseItem } from './models/index'
import { useClipboard } from '@/utils'

const { toClipboard } = useClipboard()
const { globalProperties } = useCurrentInstance()

const platformTableRef = ref<null | typeof ElTable>(null)
const instance = reactive<any>({
  logDialogVisible: false,
  scDialogVisible: false,
  editItem: {} as BadCaseItem,

  queryParams: {
    platform: [],
    fixTypeList: [],
    statusList: [],
    itemId: '',
    text: '',
    type: 'comment'
  },

  filterObj: {
    operateTypeList: OPERATE_TYPE_OPTIONS,
    platformList: PLATFORM_OPTIONS,
    statusOptions: STATUS_OPTIONS,
    filterBrandList: [],
    filterContentQQList: []
  }
})
const { tableData, loading, page, loadList, handleSizeChange, handlePageChange } = useTable(
  getCommentBadcaseList,
  instance.queryParams
)

onMounted(() => {
  getQQMoodOptions()
  loadList()
})

watch(
  () => instance.queryParams,
  () => {
    page.value.pageNumber = 1
    loadList()
  },
  {
    deep: true
  }
)

const getQQMoodOptions = async () => {
  const params: any = {}
  const res = await sentimentFilterDim(params)
  if (res) {
    // 数据解析
    const brands: any = []
    const _brands = {
      未知: ['未知']
    }
    if (res.all_brand) {
      res.all_brand = { ...res.all_brand, ..._brands }
      Object.keys(res.all_brand).forEach((item: any) => {
        brands.push({
          name: item,
          value: item,
          list: res.all_brand[item] || []
        })
      })
    }
    instance.filterObj.filterBrandList = brands
    instance.filterObj.filterContentQQList = ['正向', '负向', '不明确', '中性']
  }
}

const handleCloseLogDialog = () => {
  instance.logDialogVisible = false
}
const handleCloseScDialog = (refresh: boolean) => {
  instance.scDialogVisible = false
  instance.editItem = {}

  if (refresh) {
    loadList()
  }
}

const fixLogs = computed(() => {
  return (row: any) => {
    const arr = []
    if (row?.fixUser) {
      arr.push(`${row.status === 'ignore_fix' ? '暂不修正：' : '立即修正：'}${row.fixUser}`)
    }
    if (row?.createUser && row.fixType === 'report') {
      arr.push(`提报信息：${row.createUser}`)
    }
    return arr
  }
})

const handleRecordDetail = (data: BadCaseItem) => {
  instance.editItem = data
  instance.logDialogVisible = true
}

// 立即修正
const handleFixIt = (item: any, type: string = 'fix') => {
  if (type === 'ignore') {
    globalProperties
      .$confirm('确认不修正？', '提示')
      .then(() => {
        commentSubmit({ recordId: item.recordId, fixType: 'ignore_fix' }).then(() => {
          globalProperties.$message.success('操作成功')
          loadList()
        })
      })
      .catch()
  } else {
    instance.editItem = item
    nextTick(() => {
      instance.scDialogVisible = true
    })
  }
}
</script>

<style lang="scss" scope>
.desc {
  align-self: flex-start;
  color: $custom-color-primary;
}
.success {
  color: $custom-color-success;
}
.warning {
  color: $custom-color-warning;
}
.primary {
  color: $custom-color-primary;
}
</style>
