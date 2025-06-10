<template>
  <div>
    <div class="pd20 flex-between">
      <div>
        <el-button
          type="primary"
          @click="handleToCreate"
          v-permission="{
            permissionKey: 'KOS_ACCOUNT_OPERATE'
          }"
        >
          新建账号
        </el-button>
      </div>
      <div class="flex-end" style="flex-wrap: wrap; gap: 10px">
        <div class="flex-row">
          <span style="white-space: nowrap">区域:</span>
          <el-cascader
            v-model="filter.areaName"
            :options="filter.areaInfo"
            :props="{ checkStrictly: true, value: 'areaName', label: 'areaName', children: 'nextAreaInfo' }"
            @change="handleChangeFilter"
            clearable
            filterable
            class="mr10 ml10"
          />
          <span class="mr10" style="white-space: nowrap">账号类型:</span>
          <el-select
            class="w-200 mr10"
            placeholder="请选择"
            v-model="page.filterType"
            clearable
            filterable
            @change="handleChangeFilter"
          >
            <el-option v-for="(value, key) in REDBOOK_USER_TYPE_MAP" :key="key" :value="key" :label="value" />
          </el-select>
        </div>
        <div class="flex-row">
          <span style="white-space: nowrap">获取方式:</span>
          <el-select
            class="w-200 mr10 ml10"
            placeholder="请选择"
            v-model="page.filterSource"
            clearable
            filterable
            @change="handleChangeFilter"
          >
            <el-option v-for="(value, key) in REDBOOK_SOURCE_TYPE_MAP" :key="key" :value="key" :label="value" />
          </el-select>
        </div>
        <div class="flex-row">
          <span style="white-space: nowrap">账号等级:</span>
          <el-select
            class="w-200 ml10"
            placeholder="请选择"
            v-model="page.level"
            clearable
            @change="handleChangeFilter"
          >
            <el-option value="S" label="S" />
            <el-option value="A" label="A" />
            <el-option value="B" label="B" />
            <el-option value="C" label="C" />
            <el-option value="D" label="D" />
          </el-select>
        </div>
        <el-input
          class="w-350 ml10"
          :placeholder="page.searchType ? '请输入主页链接' : '账号ID/账号名称/企业微信ID'"
          v-model.trim="page.filterKeyword"
          clearable
          @change="handleChangeFilter"
        >
          <template #prepend>
            <el-select v-model="page.searchType" style="width: 100px" @change="handleChangeSearchType">
              <el-option label="账号信息" :value="0" />
              <el-option label="主页链接" :value="1" />
            </el-select>
          </template>
          <template #suffix>
            <svg-icon name="smc-search" className="pointer" @click="handleChangeFilter" />
          </template>
        </el-input>
        <slot></slot>
      </div>
    </div>

    <div class="table">
      <el-table
        :data="page.tableData"
        style="width: 100%"
        tooltip-effect="dark"
        v-loading="page.loading"
        @sort-change="handleChangeSort"
        scrollbar-always-on
        v-table-sticky-header
        v-table-sticky-scroller
      >
        <el-table-column property="accountId" label="账号ID-渠道端" width="150" fixed="left" show-overflow-tooltip />
        <el-table-column property="accountName" label="账号名称" min-width="150" fixed="left">
          <template #default="scope">
            <span class="link pointer" @click.native="handleToLink(scope.row.pcLink)" v-if="scope.row.accountName">
              {{ scope.row.accountName }}
            </span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column property="accountDesc" label="账号简介" min-width="150" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.accountDesc || '--' }}</template>
        </el-table-column>
        <el-table-column property="accountType" label="账号类型" min-width="160">
          <template #default="scope">
            <el-select
              class="w-150"
              placeholder="请选择"
              v-model="scope.row.accountTypeText"
              @change="(e: any) => handleChangeAccountType(e, scope.row)"
              :disabled="!globalProperties.$globalPermission({ permissionKey: 'KOS_ACCOUNT_OPERATE' })"
            >
              <el-option v-for="(value, key) in REDBOOK_USER_TYPE_MAP" :key="key" :value="key" :label="value" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column property="source" label="获取方式" min-width="100">
          <template #default="scope">{{ scope.row.source || '--' }}</template>
        </el-table-column>
        <el-table-column property="createUser" label="创建人" min-width="140">
          <template #default="scope">{{ scope.row.createUser || '--' }}</template>
        </el-table-column>
        <el-table-column property="createTime" label="创建时间" min-width="150">
          <template #default="scope">{{ scope.row.createTime || '--' }}</template>
        </el-table-column>
        <el-table-column property="createTime" label="关联企业微信号（手机号）" min-width="220">
          <template #default="scope">
            <el-select
              class="w-200"
              placeholder="请选择"
              :model-value="scope.row.wechatId"
              @change="(e: any) => handleChangeTelephone(e, scope.row)"
              clearable
              filterable
              remote
              :remote-method="handleRemoteMethod"
              remote-show-suffix
              :disabled="!globalProperties.$globalPermission({ permissionKey: 'KOS_ACCOUNT_OPERATE' })"
            >
              <el-option
                v-if="scope.row.wechatId"
                :value="scope.row.wechatId"
                :label="scope.row.userPhone + '（' + scope.row.wechatName + '）'"
              />
              <el-option
                v-for="(value, key) in page.webcomTelephoneList"
                :key="key"
                :value="value.wechatId"
                :label="value.userPhone + '（' + value.wechatName + '）'"
              />
              <!-- :label="maskData(value.userPhone, { maskLength: 4, startFrom: 4 }) + '（' + value.wechatName + '）'" -->
            </el-select>
          </template>
        </el-table-column>
        <el-table-column property="pcLink" label="主页链接" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            <span class="link pointer" @click.native="handleToLink(scope.row.pcLink)" v-if="scope.row.pcLink">
              {{ scope.row.pcLink }}
            </span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column property="level" min-width="160" sortable="custom">
          <template #header>
            <span>账号等级</span>
            <el-tooltip>
              <template #content>
                <p>系统自动识别，规则如下</p>
                <p>S级:粉丝量>=10000 & 抖音月均发文>8</p>
                <p>A级:粉丝量>=1000 & 抖音月均发文>4</p>
                <p>B级:抖音月均发文>2</p>
              </template>
              <svg-icon name="smc-question-solid" className=" ml5"></svg-icon>
            </el-tooltip>
          </template>
          <template #default="scope">{{ scope.row.level || '0' }}</template>
        </el-table-column>
        <el-table-column property="fanCount" label="粉丝数" min-width="100" sortable="custom">
          <template #default="scope">{{ scope.row.fanCount || '0' }}</template>
        </el-table-column>

        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination
      class="pd20"
      background
      :page-size="page.pageSize"
      @size-change="handleChangeSize"
      :page-sizes="[10, 20, 50, 100]"
      :current-page="page.pageNumber"
      @current-change="handleChangeCurrent"
      layout="->,total,quickPrev,prev,pager,next,quickNext,sizes,jumper"
      :total="page.pageTotal"
    />

    <CreateDialog
      :isShowDialog="page.isShowDialog"
      :areaInfo="filter.areaInfo"
      formType="douyin"
      @clickClose="handleCloseDialog"
    />
  </div>
</template>
<script lang="ts" setup>
import {
  userRedBookAndDouYinPageInfo,
  userRelationChange,
  userWechatUnbindPageList,
  getAreaList,
  deleteUserExt
} from '@/api/account'
import { useCurrentInstance } from '@/hooks'
import { REDBOOK_USER_TYPE_MAP, REDBOOK_SOURCE_TYPE_MAP } from '../constant'
import CreateDialog from './CreateDialog.vue'
import { maskData } from '@/views/content/kos/account/insight/utils'

const { globalProperties } = useCurrentInstance()

onMounted(() => {
  getTableData()
  getMapping()
})

// const findKey = (obj: any, value: any) => {
// 根据对象value找到key
const findKeyByValue = (obj: any = {}, value: any = '') => {
  if (value) {
    for (let key in obj) {
      if (obj[key] === value) {
        return key
      }
    }
  }
  return null
}
// 修改账号类型

const page = reactive({
  filterType: '',
  filterSource: '',
  level: null,
  filterKeyword: '',
  searchType: 0,
  pageSize: 20,
  pageNumber: 1,
  pageTotal: 0,
  tableData: [] as any,
  loading: false,
  // 排序
  sortValue: '',
  order: 0,
  // 企业账号
  webcomTelephoneList: [] as any[],
  // 弹出框
  isShowDialog: false
})

const filter = reactive({
  systemAdmin: false as boolean,
  areaName: undefined as string[] | undefined,
  areaInfo: [] as any[]
})

const getMapping = () => {
  getAreaList().then((res) => {
    if (!res) {
      return
    }
    const { areaInfo, systemAdmin } = res
    filter.systemAdmin = systemAdmin
    filter.areaInfo = areaInfo.map((item: any) => {
      return { ...item, disabled: !item.areaAdmin }
    })
  })
}
const handleChangeSearchType = () => {
  if (page.filterKeyword) {
    handleChangeFilter()
  }
}
const handleChangeFilter = () => {
  page.pageNumber = 1
  getTableData()
}
const handleChangeSize = (val: number) => {
  page.pageSize = val
  getTableData()
}
const handleChangeCurrent = (val: number) => {
  page.pageNumber = val
  getTableData()
}
//修改排序
const handleChangeSort = (item: any) => {
  page.sortValue = item.prop
  page.order = item.order === 'descending' ? 1 : 0 //'desc' : 'asc'
  getTableData()
}
const getTableData = async () => {
  page.loading = true
  const params: any = {
    pageSize: page.pageSize,
    pageNumber: page.pageNumber,
    type: 1 // 0为小红书 1为抖音
  }
  console.log('filter.areaName: ', filter.areaName)
  if (Array.isArray(filter.areaName)) {
    params.firstAreaName = filter.areaName[0]
    if (filter.areaName.length > 1) {
      params.secondAreaName = filter.areaName[1]
    }
  }
  if (page.filterType) {
    params.accountType = REDBOOK_USER_TYPE_MAP[page.filterType]
  }
  if (page.filterSource) {
    params.sourceType = REDBOOK_SOURCE_TYPE_MAP[page.filterSource]
  }
  if (page.filterKeyword && !page.searchType) {
    params.text = page.filterKeyword
  }
  if (page.filterKeyword && page.searchType) {
    params.completeLink = page.filterKeyword
  }
  if (page.level) {
    params.level = page.level
  }
  if (page.sortValue) {
    params.targetAttribute = page.sortValue
    params.order = page.order
  }
  const res = await userRedBookAndDouYinPageInfo(params)
  if (res && res.data && res.data.length > 0) {
    res.data.forEach((item: any) => {
      // 主页链接
      item.pcLink = item.accountUserId ? 'https://www.douyin.com/user/' + item.accountUserId : ''
      // 账号类型
      item.accountTypeText = findKeyByValue(REDBOOK_USER_TYPE_MAP, item.accountType)
    })
    page.tableData = res.data
    page.pageTotal = res.totalRecords

    // getWecomTelephoneList()
  } else {
    page.tableData = []
    page.pageTotal = 0
  }
  page.loading = false
}

const handleToLink = (link: string) => {
  window.open(link, '_blank', 'noopener=yes,noreferrer=yes')
}

const handleChangeAccountType = async (target: any, item: any) => {
  const params = {
    type: 1, // 0为小红书 1为抖音
    accountId: item.accountId,
    accountType: REDBOOK_USER_TYPE_MAP[target]
  }
  const res = await userRelationChange(params)
  if (res) {
    globalProperties.$message({
      message: '操作成功',
      type: 'success'
    })
    getTableData()
  }
}

/** 关联企业微信号部分 */
const getWecomTelephoneList = async (query: string = '') => {
  const params: any = {
    pageNumber: 1,
    pageSize: 100,
    type: 1 // 0为小红书 1为抖音
  }
  if (query) {
    params.text = query
  }
  if (Array.isArray(filter.areaName)) {
    params.firstAreaName = filter.areaName[0]
    if (filter.areaName.length > 1) {
      params.secondAreaName = filter.areaName[1]
    }
  }
  const res = await userWechatUnbindPageList(params)
  if (res && res.data && res.data.length > 0) {
    page.webcomTelephoneList = res.data
  } else {
    page.webcomTelephoneList = []
  }
}
const handleRemoteMethod = (query: string) => {
  if (query) {
    setTimeout(() => {
      getWecomTelephoneList(query)
    }, 200)
  } else {
    getWecomTelephoneList()
  }
}
const handleChangeTelephone = async (target: any, item: any) => {
  const params = {
    type: 1, // 0为小红书 1为抖音
    accountId: item.accountId,
    wechatId: target || ''
  }
  if (!target) {
    globalProperties.$messageBox
      .confirm(`是否确定解除绑定`, '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      .then(async () => {
        const res = await userRelationChange(params)
        if (res) {
          globalProperties.$message({
            message: '操作成功',
            type: 'success'
          })
          getTableData()
          getWecomTelephoneList()
        }
      })
      .catch((res: any) => {
        console.log(res, 'res')
      })
  } else {
    const res = await userRelationChange(params)
    if (res) {
      globalProperties.$message({
        message: '操作成功',
        type: 'success'
      })
      getTableData()
      getWecomTelephoneList()
    }
  }
}

// 新建账号
const handleToCreate = () => {
  page.isShowDialog = true
}
const handleCloseDialog = (isResult = false) => {
  if (isResult) {
    handleChangeFilter()
  }
  page.isShowDialog = false
}
const handleDelete = async (item: any) => {
  globalProperties.$messageBox
    .confirm(
      `<div style="color:#2c7bff">确定删除如下 抖音账号？</div>
    <div style="color:#2c7bff;margin-top:5px">删除后，对应账号数据将不展示！</div>
    <div style="margin-top:10px;word-break: break-all;" title="${item.accountId}">账号ID-渠道端：${item.accountId}</div>
    <div style="margin-top:5px">账号名称：${item.accountName || '--'}</div>
    <div style="margin-top:5px">账号简介：${item.accountDesc || '--'}</div>
    <div style="margin-top:5px">账号类型：${item.accountType || '--'}</div>
    <div style="margin-top:5px;word-break: break-all;" title="${item.pcLink}">主页链接：${item.pcLink}</div>`,
      '删除 抖音账号',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        customStyle: {
          'min-width': '520px'
        }
      }
    )
    .then(() => {
      const params = {
        id: item.id
      }
      deleteUserExt(params).then((res) => {
        if (res) {
          globalProperties.$message.success('删除成功')
          getTableData()
        }
      })
    })
    .catch((res: any) => {
      console.log(res, 'res')
    })
}
</script>

<style lang="scss" scoped>
.flex-end {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
}
</style>
