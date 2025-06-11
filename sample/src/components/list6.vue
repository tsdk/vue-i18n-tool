<template>
  <div>
    <div class="common-content">
      <div class="pd20 flex-between" style="align-items: flex-start">
        <div style="display: flex; flex-wrap: nowrap; align-items: center; line-height: 32px">
          <span style="white-space: nowrap">活动管理</span>
          <el-tooltip
            class="box-item"
            effect="dark"
            content="发布并管理 门店导购新媒体营销相关活动"
            placement="top-start"
          >
            <svg-icon name="smc-question-solid" className="ml5 pointer"></svg-icon>
          </el-tooltip>
        </div>
        <div class="flex-row" style="justify-content: flex-end; flex-wrap: wrap; gap: 15px">
          <div class="flex-row">
            <span class="mr10">活动渠道:</span>
            <el-select
              class="w-200"
              placeholder="请选择"
              v-model="queryParams.activityChannelList"
              collapse-tags
              collapse-tags-tooltip
              multiple
              clearable
              filterable
              @change="searchData"
            >
              <el-option
                v-for="(item, key) in options.activityChannelList"
                :key="item.value"
                :value="item.value"
                :label="item.name"
              />
            </el-select>
          </div>
          <div class="flex-row">
            <span class="mr10">活动状态:</span>
            <el-select
              class="w-200"
              placeholder="请选择"
              v-model="queryParams.statusList"
              collapse-tags
              collapse-tags-tooltip
              clearable
              multiple
              filterable
              @change="searchData"
            >
              <el-option
                v-for="(item, key) in options.statusList"
                :key="item.value"
                :value="item.value"
                :label="item.name"
              />
            </el-select>
          </div>
          <div class="flex-row">
            <span class="mr10">创建人:</span>
            <el-select
              class="w-200"
              placeholder="请选择"
              v-model="queryParams.createUserId"
              clearable
              filterable
              remote
              :remote-method="getUserList"
              @change="searchData"
              remote-show-suffix
            >
              <el-option
                v-for="(item, key) in options.createUserList"
                :key="item.userId"
                :value="item.userId"
                :label="item.userName"
              />
            </el-select>
          </div>
          <el-input
            class="w-200 w-search"
            placeholder="活动名称|活动ID"
            v-model="queryParams.keyword"
            clearable
            @change="searchData"
          >
            <template #suffix>
              <svg-icon name="smc-search" className="pointer" @click="searchData" />
            </template>
          </el-input>

          <el-button
            type="primary"
            plain
            @click="handleToCreate"
            v-permission="{
              permissionKey: 'KOS_ACTIVITY_OPERATE_BASE'
            }"
            >新建活动
          </el-button>
          <el-button
            type="primary"
            plain
            @click="checkDialogVisible = true"
            v-permission="{
              permissionKey: 'KOS_ACTIVITY_OPERATE_BASE'
            }"
            >发文回收检查
          </el-button>
        </div>
      </div>

      <el-table
        :data="tableData"
        style="width: 100%"
        tooltip-effect="dark"
        v-loading="loading"
        @sort-change="handleSortChange"
      >
        <el-table-column property="id" label="活动ID" width="140" show-overflow-tooltip />
        <el-table-column property="activityType" label="活动渠道" min-width="160" show-overflow-tooltip>
          <template #default="scope">{{
            scope.row.activityChannelList.map((item: any) => item.name).join('/') || '--'
          }}</template>
        </el-table-column>
        <el-table-column label="活动区域" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            <span>
              {{
                scope.row.areaName
                  ? scope.row.secondAreaName
                    ? `${scope.row.areaName}-${scope.row.secondAreaName}`
                    : scope.row.areaName
                  : '--'
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="活动名称" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            <span
              class="text-ellipsis"
              style="color: #2c7bff; cursor: pointer"
              @click="handleToDetail(scope.row)"
              v-if="
                globalProperties.$globalPermission({ permissionKey: 'KOS_ACTIVITY_OPERATE_COMMON_BUTTON' }) ||
                (globalProperties.$globalPermission({ permissionKey: 'KOS_ACTIVITY_OPERATE_AGENT' }) &&
                  scope.row.agentVisible === 1)
              "
            >
              {{ scope.row.activityName || '暂无活动名称' }}
            </span>
            <span class="text-ellipsis" v-else>
              {{ scope.row.activityName || '暂无活动名称' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="活动简介" min-width="250" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.activityDesc || '暂无活动简介' }}</template>
        </el-table-column>
        <el-table-column label="可参与人群" min-width="140" property="estimatedNumber" :formatter="columnFmt" />

        <el-table-column label="有效时间" min-width="320" :formatter="columnFmt">
          <template #default="scope">
            <span v-if="scope.row.startDate && scope.row.endDate">
              {{
                `${dayjs(scope.row.startDate).format('YYYY-MM-DD HH:mm:ss')} ~ ${dayjs(scope.row.endDate).format(
                  'YYYY-MM-DD HH:mm:ss'
                )}`
              }}
            </span>
            <span v-else>不限</span>
          </template>
        </el-table-column>
        <el-table-column label="活动状态" min-width="100">
          <template #default="scope">
            <span :class="statusMap[scope.row.status.value]?.type || 'info'">{{ scope.row.status.name || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column property="title" label="创建人" min-width="180">
          <template #default="scope">{{
            `${scope.row.createUserName || '--'}(${scope.row.createUserId || '--'})`
          }}</template>
        </el-table-column>
        <el-table-column property="title" label="创建时间" min-width="180">
          <template #default="scope">{{ scope.row.createTime || '--' }}</template>
        </el-table-column>
        <el-table-column property="actualNumber" label="参与人数" :formatter="columnFmt" min-width="100" />

        <el-table-column
          property="contentCount"
          label="总关联内容数"
          min-width="160"
          :formatter="columnFmt"
          sortable="custom"
        />

        <el-table-column
          property="likedCount"
          label="内容总点赞数"
          min-width="160"
          :formatter="columnFmt"
          sortable="custom"
        />

        <el-table-column
          property="collectedCount"
          label="内容总收藏数"
          min-width="160"
          :formatter="columnFmt"
          sortable="custom"
        />

        <el-table-column
          property="commentCount"
          label="内容总评论数"
          min-width="160"
          :formatter="columnFmt"
          sortable="custom"
        />

        <el-table-column label="操作" min-width="220" fixed="right">
          <template #default="scope">
            <div class="custom-activity-button">
              <!-- 判断是否是自己的 -->
              <el-button
                v-if="
                  scope.row.status.value === 0 &&
                  globalProperties.$globalPermission({ permissionKey: 'KOS_ACTIVITY_OPERATE_SSO' })
                "
                link
                type="primary"
                @click="handleClickSubmit(scope.row)"
              >
                提交审核
              </el-button>
              <el-button
                v-if="
                  scope.row.status.value === 1 &&
                  globalProperties.$globalPermission({ permissionKey: 'KOS_ACTIVITY_OPERATE_WHITE' }) &&
                  globalProperties.$globalPermission({ permissionKey: 'KOS_ACTIVITY_OPERATE_SSO' })
                "
                link
                type="primary"
                @click="clickReview(scope.row, 3)"
              >
                审核通过
              </el-button>
              <el-button
                v-if="
                  scope.row.status.value === 1 &&
                  globalProperties.$globalPermission({ permissionKey: 'KOS_ACTIVITY_OPERATE_WHITE' }) &&
                  globalProperties.$globalPermission({ permissionKey: 'KOS_ACTIVITY_OPERATE_SSO' })
                "
                link
                type="primary"
                @click="clickReview(scope.row, 2)"
              >
                审核不通过
              </el-button>
              <el-button
                v-if="
                  [0, 1, 2].includes(scope.row.status.value) &&
                  scope.row.activityCreateOrAreaAccount &&
                  globalProperties.$globalPermission({ permissionKey: 'KOS_ACTIVITY_OPERATE_ADMIN' })
                "
                link
                type="primary"
                @click="handleClickEdit(scope.row)"
                >编辑</el-button
              >
              <el-button
                v-if="
                  ![4].includes(scope.row.status.value) &&
                  (scope.row.activityCreateOrAreaAccount ||
                    globalProperties.$globalPermission({
                      permissionKey: ['KOS_ACTIVITY_OPERATE_DELETE', 'KOS_ACTIVITY_OPERATE_WHITE']
                    }))
                "
                link
                type="primary"
                @click="handleDelete(scope.row)"
                >删除</el-button
              >
              <!-- 非草稿态都支持打回草稿 -->
              <el-button
                v-if="
                  (globalProperties.$globalPermission({ permissionKey: 'KOS_ACTIVITY_OPERATE_WHITE' }) ||
                    isCreator(scope.row.createUserId)) &&
                  globalProperties.$globalPermission({ permissionKey: 'KOS_ACTIVITY_OPERATE_BASE' }) &&
                  scope.row.status.value !== 0
                "
                link
                type="primary"
                @click="handleToDraft(scope.row)"
                >打回草稿
              </el-button>
              <el-button
                v-if="
                  [4, 5].includes(scope.row.status.value) &&
                  globalProperties.$globalPermission({ permissionKey: 'KOS_ACTIVITY_OPERATE_COMMON_BUTTON' })
                "
                link
                type="primary"
                @click="handleClickRank(scope.row)"
                >排名榜单</el-button
              >
              <el-button
                link
                type="primary"
                v-if="
                  [4].includes(scope.row.status.value) &&
                  scope.row.activityCreateOrAreaAccount &&
                  globalProperties.$globalPermission({ permissionKey: 'KOS_ACTIVITY_OPERATE_ADMIN' })
                "
                @click="handleClickParticipator(scope.row)"
                >添加参与者</el-button
              >
              <el-button
                link
                type="primary"
                v-if="
                  [4, 5].includes(scope.row.status.value) &&
                  scope.row.activityCreateOrAreaAccount &&
                  globalProperties.$globalPermission({ permissionKey: 'KOS_ACTIVITY_OPERATE_ADMIN' })
                "
                @click="handleToRefresh(scope.row)"
                >刷新数据</el-button
              >
              <el-tooltip
                effect="dark"
                placement="top"
                popper-class="custom-popper-note"
                content="点击可取消提频"
                v-if="
                  scope.row.freqInc &&
                  [4].includes(scope.row.status.value) &&
                  globalProperties.$globalPermission({ permissionKey: 'KOS_ACTIVITY_OPERATE_COMMON_FREQUENCY' })
                "
              >
                <el-button link type="info" @click="handleToUpdateFrequency(scope.row, scope.$index)">已提频</el-button>
              </el-tooltip>
              <el-tooltip
                effect="dark"
                placement="top"
                popper-class="custom-popper-note"
                content="提频后，该活动每天4次更新互动数据（9:00 12:00 17:00 20:00）"
                v-if="
                  !scope.row.freqInc &&
                  [4].includes(scope.row.status.value) &&
                  globalProperties.$globalPermission({ permissionKey: 'KOS_ACTIVITY_OPERATE_COMMON_FREQUENCY' })
                "
              >
                <el-button link type="warning" @click="handleToUpdateFrequency(scope.row, scope.$index)"
                  >提升更新频率</el-button
                >
              </el-tooltip>
              <el-tooltip
                effect="dark"
                placement="top"
                popper-class="custom-popper-note"
                content="点击可关闭ASR解析"
                v-if="
                  scope.row.asr &&
                  [4].includes(scope.row.status.value) &&
                  globalProperties.$globalPermission({ permissionKey: 'KOS_ACTIVITY_OPERATE_COMMON_ASR' })
                "
              >
                <el-button link type="info" @click="handleToDoAsr(scope.row, scope.$index)">已开启ASR解析</el-button>
              </el-tooltip>
              <el-tooltip
                effect="dark"
                placement="top"
                popper-class="custom-popper-note"
                content="点击可开启ASR解析"
                v-if="
                  !scope.row.asr &&
                  [4].includes(scope.row.status.value) &&
                  globalProperties.$globalPermission({ permissionKey: 'KOS_ACTIVITY_OPERATE_COMMON_ASR' })
                "
              >
                <el-button link type="warning" @click="handleToDoAsr(scope.row, scope.$index)">开启ASR解析</el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
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

    <ActivityDetailDrawer
      :isShowDrawer="drawer.drawerVisible"
      :currentObj="drawer.currentObj"
      :activeTab="drawer.activeTab"
      @clickClose="handleCloseDrawer"
    />
    <ActivityRecoveryCheckDialog :visible="checkDialogVisible" @clickClose="handleCloseCheckDialog" />

    <ParticipatorDialog
      :visible="dialog.participatorVisible"
      :currentId="dialog.currentId"
      @clickClose="handleCloseParticipatorDialog"
    />
  </div>
</template>
<script lang="ts" setup>
import ActivityDetailDrawer from './components/ActivityDetailDrawer.vue'
import ActivityRecoveryCheckDialog from './components/ActivityRecoveryCheckDialog.vue'
import ParticipatorDialog from './components/ParticipatorDialog.vue'
import { useCurrentInstance, useTable } from '@/hooks'
import {
  getActivities,
  submitActivity,
  reviewActivity,
  deleteActivity,
  draftActivity,
  getMapping,
  getUserList as getUsers,
  refreshActivityData,
  refreshActivityIncFreq,
  activityKosDoAsr
} from '@/api/activity'
import type { IMapping } from './models'
import { dayjs } from 'element-plus'
import { useCommonStore } from '@/stores/common'

const { globalProperties } = useCurrentInstance()
const router = useRouter()
const commonStore = useCommonStore()

const checkDialogVisible = ref(false)
const participatorVisible = ref(false)
const statusMap = readonly<Record<number, any>>({
  0: { type: 'info', text: '草稿' },
  1: { type: 'primary', text: '审核中' },
  2: { type: 'danger', text: '审核不通过' },
  3: { type: 'primary', text: '未开始' },
  4: { type: 'success', text: '进行中' },
  5: { type: 'warning', text: '已结束' }
})

const options = reactive<IMapping & { createUserList: Array<Record<string, string>> }>({
  activityChannelList: [],
  activityTypeList: [],
  sortByList: [],
  statusList: [],
  createUserList: []
})

const queryParams = reactive<Record<string, any>>({
  activityChannelList: [],
  statusList: [],
  createUserId: null,
  keyword: null,
  targetAttribute: null,
  order: null
})
const { tableData, page, loading, loadList, handleSizeChange, handlePageChange, searchData } = useTable(
  getActivities,
  queryParams
)

onMounted(() => {
  loadList()
  getMapping().then((res) => {
    if (res) {
      const { activityChannelList, activityTypeList, statusList, sortByList } = res
      Object.assign(options, { activityChannelList, activityTypeList, statusList, sortByList })
    }
  })
  getUserList()
})

const getUserList = (keyword?: string) => {
  getUsers({ keyword }).then((res) => {
    options.createUserList = res && res.length > 0 ? res.filter((item) => item.userId) : []
  })
}

const handleSortChange = (data: { column: any; prop: string; order: any }) => {
  queryParams.targetAttribute = data.prop
  switch (data.order) {
    case 'ascending':
      queryParams.order = 0
      break
    case 'descending':
      queryParams.order = 1
      break
    default:
      queryParams.targetAttribute = null
      queryParams.order = null
      break
  }

  loadList()
}

const isCreator = (userId: string): boolean => {
  const data = window.sessionStorage.getItem('system_user')
  if (data == null) {
    return false
  }
  return JSON.parse(data)?.userId == userId
}

const columnFmt = (row: any, column: any, cellValue: any): string => {
  if (column.property == 'estimatedNumber') {
    if (cellValue == null || cellValue == undefined) {
      return '全部'
    } else if (cellValue == 'all') {
      return '全部'
    }
    return `预估${Number(cellValue).toLocaleString()}人`
  } else if (
    ['actualNumber', 'contentCount', 'likedCount', 'collectedCount', 'commentCount'].includes(column.property)
  ) {
    if (cellValue == null || cellValue == undefined) {
      return '--'
    }
    return Number(cellValue).toLocaleString()
  } else {
    if (cellValue == null || cellValue == undefined) {
      return '--'
    }
    return cellValue
  }
}

const handleClickSubmit = (row: any) => {
  const { id, activityName } = row
  globalProperties
    .$confirm(
      `<div>
      <p>确认提交审核  “「${activityName}」” 活动？</p>
      <p style='margin-top:20px'>活动审核通过后，将在企业微信“活动中心”对可参与人群展示</p>
    </div>`,
      '提交审核',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )
    .then(() => {
      submitActivity({ id }).then((res) => {
        if (res) {
          globalProperties.$message.success('提交成功...')
          loadList()
        }
      })
    })
    .catch(() => {
      globalProperties.$message.info('点击了取消...')
    })
}

// status: 1 通过，0拒绝
const clickReview = (row: any, status: 2 | 3) => {
  const { id, activityName } = row
  globalProperties
    .$confirm(
      `<div>
      <p>确认是否${status == 2 ? ' 拒绝' : '通过'}  “「${activityName}」” 活动的审核？</p>
      <p style='margin-top:20px'>活动审核通过后，将在企业微信“活动中心”对可参与人群展示</p>
    </div>`,
      '审核',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )
    .then(() => {
      reviewActivity({ id, status }).then((res) => {
        if (res) {
          globalProperties.$message.success('操作成功...')
          loadList()
        }
      })
    })
    .catch(() => {
      globalProperties.$message.info('点击了取消...')
    })
}

const handleClickEdit = (row: any) => {
  router.push({ path: '/content/kos/activity/create', query: { id: row.id } })
}

const handleToCreate = () => {
  router.push('/content/kos/activity/create')
}

const handleDelete = (row: any) => {
  const { id, activityName } = row
  globalProperties
    .$confirm(
      `<div>
      <p>确认删除  “「${activityName}」” 活动？</p>
      </div>`,
      '提示',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '删除',
        type: 'warning'
      }
    )
    .then(() => {
      deleteActivity({ activityIdList: [id] }).then((res) => {
        if (res) {
          globalProperties.$message.success('操作成功...')
          loadList()
        }
      })
    })
    .catch(() => {})
}

const handleToDraft = (row: any) => {
  const { id, activityName } = row
  globalProperties
    .$confirm(
      `<div>
      <p>打回草稿后会清除历史数据，请谨慎操作。</p>
      <p>确认将  “「${activityName}」” 活动打回草稿状态？</p>
      </div>`,
      '提示',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '打回草稿',
        type: 'warning'
      }
    )
    .then(() => {
      draftActivity({ activityIdList: [id] }).then((res) => {
        if (res) {
          globalProperties.$message.success('操作成功...')
          loadList()
        }
      })
    })
    .catch(() => {})
}

// 详情
const drawer = reactive({
  currentObj: {},
  activeTab: '',
  drawerVisible: false
})
const dialog = reactive({
  currentId: '',
  participatorVisible: false
})
const handleClickRank = (row: Record<string, any>) => {
  drawer.currentObj = row
  drawer.activeTab = 'second'
  drawer.drawerVisible = true
}
const handleToRefresh = (row: Record<string, any>) => {
  const params = {
    activityId: row.id
  }
  refreshActivityData(params).then((res) => {
    if (res) {
      globalProperties.$message.success(`${row.activityName}，活动数据已执行刷新，估计 10min后 更新最新数据`)
      loadList()
    }
  })
}
const handleClickParticipator = (row: Record<string, any>) => {
  dialog.participatorVisible = true
  dialog.currentId = row.id
}

const handleToDetail = (item: Record<string, any>) => {
  drawer.currentObj = item
  if (
    commonStore.systemUser.userIsAdmin !== 'ADMIN' &&
    globalProperties.$globalPermission({ permissionKey: 'KOS_ACTIVITY_OPERATE_AGENT' }) &&
    item.agentVisible === 1
  ) {
    drawer.activeTab = 'third'
  } else {
    drawer.activeTab = 'first'
  }
  drawer.drawerVisible = true
}
const handleCloseDrawer = () => {
  drawer.currentObj = {}
  drawer.activeTab = ''
  drawer.drawerVisible = false
}

const handleCloseCheckDialog = () => {
  checkDialogVisible.value = false
}

const handleCloseParticipatorDialog = () => {
  dialog.participatorVisible = false
}

// 提示更新频率
const handleToUpdateFrequency = (row: Record<string, any>, index: number) => {
  const params = {
    id: row.id
  }
  refreshActivityIncFreq(params).then((res) => {
    if (res) {
      globalProperties.$message.success('操作成功')
      // loadList()
      tableData.value[index].freqInc = !row.freqInc as any
    }
  })
}

// ASR
const handleToDoAsr = (row: Record<string, any>, index: number) => {
  const params = {
    id: row.id
  }
  activityKosDoAsr(params).then((res) => {
    if (res) {
      globalProperties.$message.success('操作成功')
      // loadList()
      tableData.value[index].asr = !row.asr as any
    }
  })
}
</script>

<style lang="scss" scoped>
:deep(.#{$namespace}-table__empty-block) {
  height: 250px !important;
  border: none;
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

.flex-row {
  & > div {
    flex-shrink: 0;
  }
}

.custom-activity-button {
  display: flex;
  flex-wrap: wrap;

  .#{$namespace}-button {
    margin-left: 0;
    margin-right: 12px;
  }
}
</style>

<style lang="scss">
.wecom-popper {
  max-width: 50% !important;
}
</style>
