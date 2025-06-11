<template>
  <div class="common-content">
    <div class="material-filter">
      <div>
        <span style="white-space: nowrap">营销素材分发</span>
        <el-tooltip
          class="box-item"
          effect="dark"
          content="导入针对特定场景设计的优质营销素材，提供给到在“企微端”有 营销助手-笔记助手权限的导购认领后使用"
          placement="top-start"
        >
          <svg-icon name="smc-question-solid" className="ml5 mr20 pointer custom-info-color"></svg-icon>
        </el-tooltip>
      </div>
      <!-- <div style="display: flex; flex-direction: column; align-items: flex-end"> -->
      <div
        style="
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: flex-end;
          align-items: flex-end;
          gap: 10px;
        "
      >
        <div class="inline-block">
          <span class="filter-title">素材领取状态：</span>
          <el-select
            placeholder="请选择素材领取状态"
            v-model="queryParams.receiveStatus"
            clearable
            filterable
            @change="searchData"
          >
            <el-option
              v-for="item in options.receiveStatusList"
              :key="item.value"
              :value="item.value"
              :label="item.name"
            />
          </el-select>
        </div>
        <div class="inline-block">
          <span class="filter-title">关联机型：</span>
          <el-select placeholder="请选择关联机型" v-model="queryParams.model" clearable filterable @change="searchData">
            <el-option v-for="item in options.models" :key="item.value" :value="item.value" :label="item.name" />
          </el-select>
        </div>
        <div class="inline-block">
          <span class="filter-title">内容生成状态：</span>
          <el-select
            placeholder="请选择内容生成状态"
            v-model="queryParams.generateStatus"
            clearable
            @change="searchData"
          >
            <el-option
              v-for="item in options.generateStatusList"
              :key="item.value"
              :value="item.value"
              :label="item.name"
            />
          </el-select>
        </div>
        <div class="inline-block">
          <span class="filter-title">关联内容场景：</span>
          <el-select
            placeholder="请选择关联内容场景"
            v-model="queryParams.sceneIdList"
            clearable
            filterable
            multiple
            remote
            :remote-method="(keyword: string) => handleGetScenes(keyword)"
            :loading="options.loading"
            collapse-tags
            collapse-tags-tooltip
            @change="searchData"
          >
            <el-option v-for="item in options.sceneList" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>
        </div>
        <div class="inline-block">
          <span class="filter-title">生成模式：</span>
          <el-select
            placeholder="请选择生成模式"
            v-model="queryParams.generationScheme"
            clearable
            filterable
            @change="searchData"
          >
            <el-option v-for="item in options.generationScheme" :key="item" :value="item" :label="item" />
          </el-select>
        </div>
        <div class="inline-block">
          <span class="filter-title">是否关联发文：</span>
          <el-select
            placeholder="请选择是否关联发文"
            v-model="queryParams.relateContent"
            clearable
            @change="searchData"
          >
            <el-option :value="1" label="是" />
            <el-option :value="0" label="否" />
          </el-select>
        </div>
        <div class="inline-block" v-if="queryParams.relateContent == 1">
          <span>相似度值 >=</span>
          <el-select
            placeholder="相似度值大于等于"
            v-model="queryParams.similarThreshold"
            clearable
            @change="searchData"
          >
            <el-option
              v-for="item in options.similarThresholdList"
              :key="item.value"
              :value="item.value"
              :label="item.name"
            />
          </el-select>
        </div>
        <div class="inline-block">
          <el-input v-model="queryParams.text" placeholder="分组名称" clearable @change="searchData"></el-input>
        </div>
        <div class="inline-block">
          <el-button
            type="primary"
            plain
            @click="openDialog('scene')"
            v-permission="{
              permissionKey: 'KOS_MATERIAL_OPERATE'
            }"
            >新建内容场景</el-button
          >
          <el-button
            type="primary"
            plain
            @click="handleOpenImport"
            v-permission="{
              permissionKey: 'KOS_MATERIAL_OPERATE'
            }"
            >导入新素材</el-button
          >
          <el-button
            type="primary"
            @click="downloadFile"
            v-permission="{
              permissionKey: 'KOS_MATERIAL_OPERATE'
            }"
            :loading="downloadRef"
            >导出数据</el-button
          >
        </div>
      </div>
      <!-- </div> -->
    </div>

    <div class="table">
      <el-table
        ref="table"
        :data="tableData"
        show-summary
        :summary-method="getSummaries"
        style="width: 100%"
        tooltip-effect="dark"
        @sort-change="handleSortChange"
        v-loading="loading"
      >
        <el-table-column fixed property="groupId" label="分组ID" width="140" show-overflow-tooltip />
        <el-table-column fixed property="groupName" label="分组名称" min-width="160" show-overflow-tooltip />
        <el-table-column fixed label="素材缩略图" min-width="300">
          <template #default="scope">
            <Lightbox :showMax="6" :resourceList="scope.row.downloadUrlList" />
          </template>
        </el-table-column>
        <el-table-column label="关联内容场景" min-width="120" property="sceneName">
          <template #default="scope">
            <el-tooltip class="box-item" effect="dark" :content="scope.row.scence || '暂无文案'" placement="top-start">
              <el-text tag="ins">{{ scope.row.sceneName }}</el-text>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="关联机型" min-width="100" property="model" />
        <el-table-column label="开放时间" min-width="160" property="openTime" />
        <el-table-column label="带AI文案" min-width="100" property="needAi">
          <template #default="scope">{{ scope.row.needAi ? '是' : '否' }} </template>
        </el-table-column>
        <el-table-column
          label="内容生成状态"
          min-width="120"
          :formatter="(row: any) => formatterStatus(row, 'generate')"
        >
        </el-table-column>
        <el-table-column
          label="素材领取状态"
          min-width="120"
          :formatter="(row: any) => formatterStatus(row, 'receive')"
        >
        </el-table-column>
        <el-table-column label="领取人（企业微信）" min-width="160">
          <template #default="scope">
            <el-tooltip class="box-item" effect="dark" placement="top-start">
              <el-text>{{ scope.row.wechatName || '--' }}</el-text>
              <template #content>
                <p>{{ scope.row.wechatId || '暂无微信ID' }}</p>
                <p v-for="item in scope.row.userLinkList">{{ item }}</p>
              </template>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column property="title" label="领取时间" min-width="180">
          <template #default="scope">{{ `${scope.row.receiveDate || '--'}` }}</template>
        </el-table-column>
        <el-table-column property="relationCount" label="关联发文" min-width="360">
          <template #default="scope">
            <div v-if="scope.row.relationContent?.length">
              <div v-for="(item, index) in scope.row.relationContent" class="flex-row mt5">
                <div v-for="(similarData, idx) in item.similarData" class="flex-row" style="width: 100%">
                  <el-image
                    style="width: 50px; height: auto"
                    :src="similarData.tempFileLink"
                    :preview-src-list="[similarData.tempFileLink]"
                    preview-teleported
                    close-on-press-escape
                    hide-on-click-modal
                    :zoom-rate="1.2"
                    :max-scale="7"
                    :min-scale="0.2"
                    :initial-index="4"
                    fit="cover"
                  />
                  <span style="white-space: nowrap">{{ `【${item.channel}】` }}</span>
                  <el-tooltip :content="item.link">
                    <el-text
                      style="cursor: pointer; text-overflow: ellipsis; white-space: nowrap; overflow: hidden"
                      type="primary"
                      @click="handleClickUrl(item.link)"
                    >
                      {{ item.link }}
                    </el-text>
                  </el-tooltip>
                </div>
              </div>
            </div>
            <div v-else>
              <!-- <el-tooltip></el-tooltip> -->
              暂无数据
            </div>
          </template>
        </el-table-column>
        <el-table-column property="similarThreshold" sortable="custom" label="相似度值" min-width="140">
          <template #default="scope">
            <div v-if="scope.row.relationContent?.length">
              <div v-for="(item, index) in scope.row.relationContent" class="flex-row mt5">
                <div v-for="(similarData, idx) in item.similarData" class="flex-row" style="width: 100%">
                  <span style="white-space: nowrap">{{ similarData.score }}</span>
                </div>
              </div>
            </div>
            <div v-else>暂无数据</div>
          </template>
        </el-table-column>
        <el-table-column property="fanCount" sortable="custom" label="账号粉丝数" min-width="160">
          <template #default="scope">
            <div v-if="scope.row.relationContent?.length">
              <div v-for="(item, index) in scope.row.relationContent" class="flex-row mt5">
                <div v-for="(similarData, idx) in item.similarData" class="flex-row" style="width: 100%">
                  <span style="white-space: nowrap">{{ item.fans }}</span>
                </div>
              </div>
            </div>
            <div v-else>暂无数据</div>
          </template>
        </el-table-column>
        <el-table-column property="likedCount" sortable="custom" label="点赞数" min-width="100">
          <template #default="scope">
            <div v-if="scope.row.relationContent?.length">
              <div v-for="(item, index) in scope.row.relationContent" class="flex-row mt5">
                <span style="white-space: nowrap">{{ item.likedCount.toLocaleString() }}</span>
              </div>
            </div>
            <div v-else>暂无数据</div>
          </template>
        </el-table-column>
        <el-table-column property="collectedCount" sortable="custom" label="收藏数" min-width="100">
          <template #default="scope">
            <div v-if="scope.row.relationContent?.length">
              <div v-for="(item, index) in scope.row.relationContent" class="flex-row mt5">
                <span style="white-space: nowrap">{{ item.collectedCount.toLocaleString() }}</span>
              </div>
            </div>
            <div v-else>暂无数据</div>
          </template>
        </el-table-column>
        <el-table-column property="commentCount" sortable="custom" label="评论数" min-width="100">
          <template #default="scope">
            <div v-if="scope.row.relationContent?.length">
              <div v-for="(item, index) in scope.row.relationContent" class="flex-row mt5">
                <span style="white-space: nowrap">{{ item.commentCount.toLocaleString() }}</span>
              </div>
            </div>
            <div v-else>暂无数据</div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination
      class="pd20"
      background
      :page-size="page.pageSize"
      @size-change="handleSizeChange"
      :page-sizes="[10, 15, 20, 50, 100]"
      @current-change="handlePageChange"
      layout="->,total,quickPrev,prev,pager,next,quickNext,sizes,jumper"
      :total="page.totalRecords"
    />
  </div>

  <el-dialog v-model="materialDialog.show" title="导入新素材" width="700" align-center @close="handleCloseImport">
    <template #default>
      <el-text type="warning">素材导入后,生产内容需要一定时间,建议提前1天进行分发素材导入哦!!</el-text>

      <el-form
        ref="materialFormInstance"
        :model="materialDialog"
        label-width="auto"
        class="mt20"
        :rules="materialDialog.rules"
      >
        <el-form-item label="导入方式：" required prop="uploadType">
          <el-select class="w-200 mr10" v-model="materialDialog.uploadType">
            <el-option :value="0" label="本地文件导入" />
            <el-option :value="1" label="OCS链接同步" />
          </el-select>
          <el-text v-if="materialDialog.uploadType == 0" type="primary">单个zip包大小不可超过500M</el-text>
        </el-form-item>
        <el-upload
          v-if="materialDialog.uploadType == 0"
          ref="uploadInstance"
          class="mt10"
          drag
          accept=".zip"
          :auto-upload="false"
          :on-change="handleUploadChange"
        >
          <img src="@/assets/images/upload.svg" class="upload-icon" />
          <div>上传需要导入的图片/视频 zip包</div>
          <template #tip>
            <div class="mt10">
              注：在 zip 包中，每组素材必须放在1个文件夹中，请
              <el-button type="primary" link @click="handleDownload">下载示例zip包</el-button>
              进行借鉴，且图片、视频素材需要分开导入
            </div>
          </template>
        </el-upload>
        <el-form-item v-else required prop="url">
          <template #label>
            <div style="display: flex; align-items: center">
              <span>OCS链接</span>
              <el-tooltip class="box-item" effect="dark" placement="top-start">
                <template #content>
                  <p>XXXXXXXXXXXXXXXXXXX</p>
                </template>
                <svg-icon name="smc-question-solid" className="ml5 pointer custom-info-color"></svg-icon>
              </el-tooltip>
              <span>：</span>
            </div>
          </template>
          <el-input v-model="materialDialog.url" />
        </el-form-item>
        <el-form-item label="关联内容场景：" required prop="sceneId">
          <el-select
            class="w-200"
            placeholder="请选择关联场景"
            v-model="materialDialog.sceneId"
            clearable
            filterable
            remote
            :remote-method="(keyword: string) => handleGetScenes(keyword)"
            :loading="options.loading"
            @change="handleChangeScene"
          >
            <el-option v-for="item in options.sceneList" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="生成模式：" required prop="type">
          <el-radio-group v-model="materialDialog.type" @change="handleChangeUploadType">
            <el-radio v-for="item in options.materialUploadTypeList" :key="item.type" :value="item.type">
              <span>{{ item.typeName }}</span>
              <el-tooltip :content="item.description">
                <svg-icon name="smc-question" className="ml5"></svg-icon>
              </el-tooltip>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="策略组：" required prop="typeTags" v-if="options.materialUploadTypeExpTags.length > 0">
          <el-radio-group v-model="materialDialog.typeTags">
            <el-radio v-for="item in options.materialUploadTypeExpTags" :key="item.expTagId" :value="item.expTagId">
              <span>{{ item.expTagName }}</span>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="素材类型：" prop="materialSceneType">
          <el-radio-group v-model="materialDialog.materialSceneType">
            <el-radio v-for="item in MATERIAL_VIDEO_TYPE" :key="item.value" :value="item.value" :label="item.label">
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="texts" v-if="showText">
          <template #label>
            <div class="flex-row">
              <span>专属参考文案</span>
              <el-tooltip>
                <template #content>
                  <p>为当前导入的素材，设置专属的参考文案。</p>
                  <p>若不设置则默认用 “关联内容场景” 所设置的参考文案</p>
                </template>
                <svg-icon name="smc-question" className="ml5"></svg-icon>
              </el-tooltip>
            </div>
          </template>
          <div
            v-for="(item, index) in materialDialog.texts"
            :key="index"
            class="flex-row"
            style="align-items: flex-start; width: 100%"
          >
            <div>
              <el-input v-model="item.title" clearable placeholder="标题" />
              <el-input
                v-model="item.content"
                clearable
                placeholder="文案内容"
                type="textarea"
                :rows="4"
                class="mt10 mb10"
              />
            </div>
            <el-button
              v-if="materialDialog.texts.length > 1"
              type="danger"
              size="small"
              class="ml10 mt5"
              circle
              @click="removeText(index)"
            >
              <template #icon>
                <svg-icon name="smc-close" />
              </template>
            </el-button>
          </div>
          <el-button style="display: block" type="primary" size="small" circle @click="addText">
            <svg-icon name="smc-add"
          /></el-button>
        </el-form-item>
        <el-form-item label="文案必带话题：" prop="activityTopic">
          <el-tag
            v-for="(tag, index) in materialDialog.activityTopic"
            :key="index"
            @close="handleDeleteTopicTagMaterial(index)"
            style="margin-left: 0; margin-right: 8px; margin-bottom: 4px"
            :closable="tag.isDelete"
            type="danger"
            >#{{ tag.name }}
          </el-tag>

          <el-input
            v-if="topicInputVisibleMaterial"
            v-model="topicInputValueMaterial"
            class="w-200"
            placeholder="输入话题，回车确认"
            @keyup.enter="handleInputConfirmMaterial"
            @blur="handleInputConfirmMaterial"
          />
          <el-button v-else type="primary" plain @click="handleOpenTopicInputMaterial">
            <template #icon>
              <svg-icon name="smc-add" />
            </template>
            话题
          </el-button>
          <span style="width: 100%; color: #888; margin-left: 5px">
            默认带出关联内容场景对应的话题，可以新增话题。
          </span>
        </el-form-item>
        <el-form-item label="重复上传次数：" required prop="count">
          <template #label>
            <div style="display: flex; align-items: center">
              <span>重复上传次数</span>
              <el-tooltip class="box-item" effect="dark" placement="top-start">
                <template #content>
                  <p>设置每个文件夹被重复导入多少次，每次任务最多能重复导入100次。</p>
                </template>
                <svg-icon name="smc-question-solid" className="ml5 pointer custom-info-color"></svg-icon>
              </el-tooltip>
              <span>：</span>
            </div>
          </template>
          <el-input
            class="w-200"
            v-model="materialDialog.count"
            placeholder="请输入重复上传次数"
            :formatter="formatNumber"
          />
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCloseImport">取消</el-button>
        <el-button type="primary" @click="handleImport" :loading="materialDialog.loading"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog
    v-model="sceneDialog.show"
    title="新建内容场景"
    width="800"
    align-center
    @closed="sceneFormInstance?.resetFields()"
  >
    <template #default>
      <span class="custom-info-color mr10">
        新建素材分发的新场景,新建的场景将在企业微信的“营销助手”-“笔记助手”中展示
      </span>
      <el-form
        ref="sceneFormInstance"
        :model="sceneDialog"
        label-width="auto"
        class="mt10 hideScrollbar mr10"
        :rules="sceneDialog.rules"
      >
        <el-form-item label="场景名称：" prop="name">
          <el-input v-model="sceneDialog.name" placeholder="请输入场景名称" :maxlength="100"></el-input>
        </el-form-item>
        <el-form-item label="关联机型：" prop="model">
          <el-select
            v-model="sceneDialog.model"
            placeholder="请选择关联机型"
            filterable
            allow-create
            @change="handleChangeModel"
          >
            <el-option
              v-for="item in options.models"
              :key="item.value"
              :value="item.value"
              :label="item.name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="needAi">
          <template #label>
            <div style="display: flex; align-items: center">
              <span>是否带AI文案</span>
              <el-tooltip class="box-item" effect="dark" placement="top-start">
                <template #content>
                  <p>设置素材生成的内容,是否带上AI仿写的场景文案。</p>
                  <p>注意AI仿写文案每条生成的平均耗时为1min,若为紧急需要分发的素材,建议不要开启AI文案</p>
                </template>
                <svg-icon name="smc-question-solid" className="ml5 pointer custom-info-color"></svg-icon>
              </el-tooltip>
              <span>：</span>
            </div>
          </template>
          <div class="flex">
            <el-radio-group v-model="sceneDialog.needAi">
              <el-radio :value="1">是</el-radio>
              <el-radio :value="0">否</el-radio>
            </el-radio-group>
            <el-text type="info" style="margin-left: 20px">
              AI文案每条生成平均耗时1min,若为紧急分发素材,建议不要带AI文案
            </el-text>
          </div>
        </el-form-item>
        <el-form-item prop="openTime">
          <template #label>
            <div style="display: flex; align-items: center">
              <span>场景开放时间</span>
              <el-tooltip class="box-item" effect="dark" placement="top-start">
                <template #content>
                  <p>到达开放时间，场景下的素材才会在 企微端“营销助手”-“笔记助手”中展示</p>
                </template>
                <svg-icon name="smc-question-solid" className="ml5 pointer custom-info-color"></svg-icon>
              </el-tooltip>
              <span>：</span>
            </div>
          </template>
          <el-date-picker
            v-model="sceneDialog.openTime"
            type="datetime"
            placeholder="请选择场景开放时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="文案必带话题：" prop="activityTopic">
          <el-tag
            v-for="(tag, index) in sceneDialog.activityTopic"
            :key="index"
            @close="handleDeleteTopicTag(index)"
            style="margin-left: 0; margin-right: 8px; margin-bottom: 4px"
            :closable="tag.isDelete"
            type="danger"
            >#{{ tag.name }}
          </el-tag>

          <el-input
            v-if="topicInputVisible"
            v-model="topicInputValue"
            class="w-200"
            placeholder="输入话题，回车确认"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else type="primary" plain @click="handleOpenTopicInput">
            <template #icon>
              <svg-icon name="smc-add" />
            </template>
            话题
          </el-button>
          <span style="width: 100%; color: #888; margin-left: 5px"> 默认带出关联机型对应的话题，可以新增话题。 </span>
        </el-form-item>
        <el-form-item v-if="sceneDialog.needAi == 1" label="场景参考文案：" prop="pointList">
          <div
            v-for="(copywriting, idx) in sceneDialog.pointList"
            :key="idx"
            class="flex"
            style="width: 100%; margin-bottom: 20px"
          >
            <div style="margin-right: 10px">
              <el-input
                style="width: 100%; margin-right: 10px"
                v-model="copywriting.title"
                placeholder="标题"
              ></el-input>
              <el-input
                style="width: 100%; margin-top: 10px"
                v-model="copywriting.content"
                :rows="7"
                type="textarea"
                :placeholder="idx == 0 ? placeholderTips : '请输入场景参考文案'"
                :maxlength="500"
              />
            </div>

            <div class="material-flex-column">
              <el-button type="primary" v-if="idx == 0" plain @click="handleAddWriting">
                <svg-icon name="smc-add" />
              </el-button>
              <el-button
                type="danger"
                v-if="(sceneDialog.pointList as Array<any>).length > 1"
                plain
                class="mt10"
                style="margin-left: 0px"
                @click="handleDeleteWriting(idx)"
              >
                <svg-icon name="smc-delete" />
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="sceneDialog.show = false">取消</el-button>
        <el-button type="primary" @click="handleCreateScene" :loading="sceneDialog.loading">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { IOption } from '@/types/common'
import type { FormInstance, UploadFile, UploadFiles } from 'element-plus'
import {
  getFilters,
  getMaterialList,
  getModelList,
  createScene,
  getSceneList,
  getStatistics,
  uploadFile,
  uploadByOCS,
  materialUploadTypes,
  downloadExcel,
  materialQueryNeedTags
} from '@/api/assistant/material'
import { IScene } from './models'
import { useCurrentInstance, useTable } from '@/hooks'
import Lightbox from '@/components/Lightbox/index.vue'
import { VNode } from 'vue'
import { customDownload } from '@/utils'
import { MATERIAL_VIDEO_TYPE } from './constant'

const { globalProperties } = useCurrentInstance()

const placeholderTips = `请输入场景参考文案，以便于“笔记助手”在生成分发内容时,生成类似的文案建议。\n
eg:OPPO Find X7 Ultra 卫星通信版相比于普通版,加500块钱,上了1TB存储还送个卫星通信,对想买Ultra又正好想要大存储的用户来说挺香的。OPPO Find X7 Ultra卫星通信版,就当买一部1TB手机,卫星通话是送的`

const downloadRef = ref(false)
const queryParams = reactive<Record<string, any>>({
  generateStatus: null,
  model: '',
  order: 1,
  receiveStatus: null,
  sceneIdList: [],
  similarThreshold: 0.9, //相似度值
  targetAttribute: 'id',
  relateContent: null,
  text: null,
  createUserId: null,
  generationScheme: null
})
const { tableData, page, loading, loadList, handleSizeChange, handlePageChange, searchData } = useTable(
  getMaterialList,
  queryParams,
  () => {
    return getStatistics(queryParams as any).then((res) => {
      Object.assign(tableSummary, res)
    })
  }
)
const table = ref()
const tableSummary = reactive<Record<string, number | string>>({})
const getSummaries = (params: { columns: any; data: any[] }) => {
  // 在这里计算合计，可以使用this.total
  const { columns, data } = params
  const sums: Array<string | number | VNode> = []
  columns.forEach((column: any, index: number) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    const property = column.property
    if (Number.isInteger(tableSummary[property])) {
      sums[index] = tableSummary[property]
    } else if (property === 'fanCount') {
      sums[index] = tableSummary.fansCountTotal || '--'
    } else {
      sums[index] = ''
    }
  })
  return sums
}

const handleSortChange = (params: any) => {
  const { prop, order } = params
  // 默认按ID降序
  if (order == null) {
    Object.assign(queryParams, { targetAttribute: 'id', order: 1 })
  } else {
    queryParams.targetAttribute = prop
    queryParams.order = order === 'ascending' ? 0 : 1
  }
  loadList()
}

const showText = computed(() => {
  const scence = options.sceneList.find((item: IOption) => item.value == materialDialog.sceneId)
  if (!scence?.needAi) {
    materialDialog.texts = [{ title: '', content: '' }]
  }
  return scence?.needAi == 1
})

const addText = () => {
  materialDialog.texts.push({ title: null, content: null })
}
const removeText = (index: number) => {
  if (materialDialog.texts.length <= 1) {
    globalProperties.message.warning('专属参考文案列表长度不能低于1')
    return
  }
  materialDialog.texts.splice(index, 1)
}

const options = reactive<Record<string, any>>({
  loading: false,
  sceneList: [],
  models: [],
  receiveStatusList: [],
  generateStatusList: [],
  generationScheme: [],
  similarThresholdList: [],
  materialUploadTypeList: [] as any[],
  materialUploadTypeExpTags: [] as any[]
})
// 获取筛选项列表数据
const getOptions = () => {
  getModelList().then((res) => {
    options.models =
      res?.map((item) => {
        return { value: item, name: item }
      }) || []
  })
  handleGetScenes()
  getFilters().then((res) => {
    const { generateStatusList, receiveStatusList, generationScheme } = res
    Object.assign(options, { generateStatusList, receiveStatusList, generationScheme })
  })
  const similarThresholdList = []
  for (let temp = 80; temp < 100; temp += 1) {
    similarThresholdList.push({ value: temp / 100, label: temp / 100 })
  }
  options.similarThresholdList = similarThresholdList
}

const getMaterialUploadTypes = () => {
  materialUploadTypes().then((res: any) => {
    const resultArr: any = []
    if (res && res.length > 0) {
      res.forEach((item: any) => {
        if (item.permissionAll) {
          resultArr.push(item)
        } else if (
          !item.permissionAll &&
          globalProperties.$globalPermission({ permissionKey: 'KOS_MATERIAL_ALGORITHM' })
        ) {
          resultArr.push(item)
        }
      })
    }
    options.materialUploadTypeList = resultArr
    materialDialog.type = resultArr.length === 0 ? '' : resultArr[0].type
  })
}

const handleChangeUploadType = (val: any) => {
  let expTags: any = []
  const uploadTypes = options.materialUploadTypeList
  for (let i = 0; i < uploadTypes.length; i++) {
    if (val === uploadTypes[i].type && uploadTypes[i].expTags?.length > 0) {
      expTags = uploadTypes[i].expTags
      break
    }
  }
  options.materialUploadTypeExpTags = expTags
  materialDialog.typeTags = expTags.length === 0 ? '' : expTags[0].expTagId
}

const handleGetScenes = (keyword?: string) => {
  options.loading = true
  const params = { keyword: keyword }
  getSceneList(params)
    .then((res) => {
      options.sceneList = res?.map((item) => {
        return { value: item.id, label: item.name, needAi: item.needAi }
      })
      options.loading = false
    })
    .finally(() => {
      options.loading = false
    })
}

const validateWritings = (rule: any, value: any, callback: any) => {
  let writings =
    sceneDialog.pointList?.map((item: { title: string; content: string }) => `${item.title}::${item.content}`) || []
  if (writings.some((item: string) => item !== '')) {
    callback()
  } else {
    callback(new Error('请填写场景参考文案'))
  }
}
const validateModel = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('关联机型不能为空'))
  } else if (value.length > 30) {
    callback(new Error('关联机型名称长度不能大于30'))
  } else {
    callback()
  }
}

const validateTime = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('场景开放时间不能为空'))
  } else if (globalProperties.$dayjs().isAfter(globalProperties.$dayjs(value))) {
    callback(new Error('场景开放时间必须大于当前时间'))
  } else {
    callback()
  }
}

const validateActivityTopic = (rule: any, value: any, callback: any) => {
  if (!value || value.length === 0) {
    callback(new Error('文案必带话题不能为空'))
  } else {
    callback()
  }
}

const sceneFormInstance = ref<FormInstance>()

const sceneDialog = reactive<IScene & Record<string, any>>({
  show: false,
  name: '',
  model: '',
  needAi: 1,
  openTime: '',
  pointList: [{ title: '', content: '' }],
  activityTopic: [],
  loading: false,
  rules: {
    name: [{ required: true, message: '场景名称不能为空', trigger: 'blur' }],
    model: [{ required: true, validator: validateModel, trigger: 'change' }],
    needAi: [{ required: true, message: '请选择是否带AI文案', trigger: 'blur' }],
    openTime: [{ required: true, validator: validateTime, trigger: 'change' }],
    pointList: [{ required: true, validator: validateWritings, trigger: 'blur' }],
    activityTopic: [{ required: true, validator: validateActivityTopic, trigger: 'blur' }]
  }
})

const materialFormInstance = ref<FormInstance>()

const validateCount = (rule: any, value: any, callback: any) => {
  if (!Number.isInteger(Number(value))) {
    callback(new Error('请输入1~100的整数'))
  } else if (Number(value) < 1) {
    callback(new Error('重复上传次数不能小于1'))
  } else if (Number(value) > 100) {
    callback(new Error('重复上传次数不能大于100'))
  } else {
    callback()
  }
}

const validateText = (rule: any, value: any, callback: any) => {
  // 不能存在只写标题不写内容的情况
  const isError = value.some((item: any) => {
    return item.title && !item.content
  })
  if (isError) {
    callback(new Error('文案内容不能为空'))
  } else {
    callback()
  }
}
const validateActivityTopic2 = (rule: any, value: any, callback: any) => {
  if (!value || value.length === 0) {
    callback(new Error('文案必带话题不能为空'))
  } else {
    callback()
  }
}
const materialDialog = reactive<Record<string, any>>({
  show: false,
  uploadType: 0, // 导入类型  0文件导入  1外链导入
  file: '' as any, // 保存文件
  url: '',
  sceneId: null,
  count: 1,
  type: '',
  typeTags: '',
  materialSceneType: 2,
  texts: [{ title: null, content: null }],
  loading: false,
  activityTopic: [],
  rules: {
    sceneId: [{ required: true, message: '关联内容场景不能为空', trigger: 'change' }],
    count: [{ required: true, message: '重复上传次数不能为空', validator: validateCount, trigger: 'blur' }],
    texts: [{ required: false, validator: validateText, trigger: 'blur' }],
    url: [{ required: false, message: 'OCS外链不能为空', trigger: 'blur' }],
    materialSceneType: [{ required: true, message: '视频类型不能为空', trigger: 'change' }],
    activityTopic: [{ required: true, validator: validateActivityTopic2, trigger: 'blur' }]
  }
})

const uploadInstance = ref()

const handleAddWriting = () => {
  const pointList = sceneDialog.pointList as { title: string; content: string }[]
  if (pointList.length >= 10) {
    globalProperties.message.warning('最多只支持10个文案')
    return
  }
  sceneDialog.pointList && sceneDialog.pointList.push({ title: '', content: '' })
}
const handleDeleteWriting = (index: number) => {
  const pointList = sceneDialog.pointList as { title: string; content: string }[]
  let writing = pointList[index]
  if (writing.title.trim() || writing.content.trim()) {
    globalProperties
      .$confirm(
        `<div>
      <p>确认删除文案  “「${writing.title.slice(0, 10)}...」” ？</p>
      <p style='margin-top:20px'>删除后不可恢复</p>
    </div>`,
        '删除文案',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      )
      .then(() => {
        pointList.splice(index, 1)
      })
      .catch(() => {
        globalProperties.$message.info('点击了取消...')
      })
  } else {
    pointList.splice(index, 1)
  }
}

const handleImport = () => {
  materialFormInstance.value?.validate((valid: boolean) => {
    if (!valid) {
      // globalProperties.$message.warning('请正确填写表单!')
      return
    }
    const fd = new FormData()
    let qry
    if (materialDialog.uploadType == 0) {
      if (!materialDialog.file) {
        globalProperties.message.warning('上传文件不能为空')
        return
      }
      fd.append('file', materialDialog.file)
      qry = uploadFile
    } else {
      fd.append('url', materialDialog.url)
      qry = uploadByOCS
    }
    fd.append('sceneId', materialDialog.sceneId)
    fd.append('count', materialDialog.count)
    fd.append('type', materialDialog.type)
    if (showText.value) {
      const points = materialDialog.texts.map((item: any) =>
        item.title ? `${item.title}::${item.content}` : item.content
      )
      points
        .filter((item: string) => item)
        .forEach((item: string) => {
          fd.append('points', item)
        })
    }
    if (materialDialog.typeTags) {
      fd.append('expTags', materialDialog.typeTags)
    }
    fd.append('materialSceneType', materialDialog.materialSceneType)

    const needTagList = materialDialog.activityTopic.map((item: any) => {
      return `#${item.name}`
    })
    fd.append('needTagList', needTagList.join(','))

    materialDialog.loading = true
    qry(fd)
      .then((res) => {
        if (res) {
          globalProperties.$message.success('导入新素材成功,解析完成后将TT通知您!')
          handleCloseImport()
        }
      })
      .finally(() => {
        materialDialog.loading = false
      })
  })
}

const handleOpenImport = () => {
  materialDialog.typeTags = ''
  options.materialUploadTypeExpTags = []
  materialDialog.show = true
}
const handleCloseImport = () => {
  materialFormInstance.value?.resetFields()
  uploadInstance.value?.clearFiles()
  sceneDialog.loading = false
  materialDialog.file = ''
  materialDialog.show = false
}

const handleClickUrl = (url: string) => {
  window.open(url, '_blank', 'noopener=yes,noreferrer=yes')
}

const handleUploadChange = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  // 添加文件
  if (uploadFile.status == 'ready') {
    if (uploadFile.size && uploadFile.size > 500 * 1024 * 1024) {
      globalProperties.$message.warning('上传ZIP最多不超过 500 MB')
      uploadInstance.value.handleRemove(uploadFile)
      return false
    }

    materialDialog.file = uploadFile.raw
  }
}

const handleDownload = () => {
  window.open('https://ocs-cn-south.oppoer.me/dev-marketing-assistant/手机砸坚果水果视频 10条-解禁时间9日.zip', '_self')
}

const handleCreateScene = () => {
  sceneFormInstance.value?.validate((res) => {
    if (res) {
      let { name, model, needAi, openTime, pointList } = sceneDialog
      if (pointList == null) {
        pointList = []
      }
      const needTagList = sceneDialog.activityTopic.map((item: any) => {
        return `#${item.name}`
      })
      let params: any = {
        name,
        model,
        needAi,
        openTime,
        pointList: needAi == 1 ? pointList.map((item) => `${item.title}::${item.content}`) : undefined,
        needTagList: needTagList
      }
      sceneDialog.loading = true
      createScene(params)
        .then((res) => {
          if (res) {
            // 新建成功
            globalProperties.$message.success('新建场景成功,稍后将自动关闭弹窗')
            sceneDialog.timer = setTimeout(() => {
              sceneDialog.show = false
            }, 2000)
            // TODO
            handleGetScenes()
            sceneDialog.loading = false
          }
        })
        .catch((e) => {
          globalProperties.$message.error('发生错误,请联系管理员进行排查')
          console.log('e: ', e)
          sceneDialog.loading = false
        })
    } else {
      globalProperties.$message.warning('请正确填写表单!')
    }
  })
}

const formatNumber = (str: string): number => {
  // 去除非数字部分
  let digitsOnly = Number(str.replace(/\D/g, ''))
  if (digitsOnly > 100) {
    digitsOnly = 100
  }
  // else if (digitsOnly < 1) {
  //   digitsOnly = 1
  // }
  return digitsOnly
}

const formatterStatus = (row: any, key: 'generate' | 'receive'): any => {
  if (key == 'generate') {
    const vnode = h(
      'span',
      {
        class: row.generateStatus ? 'green' : 'info'
      },
      options.generateStatusList.find((item: Record<string, any>) => item.value == row.generateStatus)?.name || '--'
    )
    return vnode
  } else if (key == 'receive') {
    const vnode = h(
      'span',
      {
        class: row.receiveStatus ? 'green' : 'info'
      },
      options.receiveStatusList.find((item: Record<string, any>) => item.value == row.receiveStatus)?.name || '--'
    )
    return vnode
  }
}

const openDialog = (key: 'scene') => {
  if (key == 'scene') {
    clearTimeout(sceneDialog.timer)
    sceneDialog.show = true
  }
}

const downloadFile = () => {
  downloadRef.value = true
  const params: any = toRaw(queryParams)
  let queryStr = Object.keys(params)
    .reduce((ary: any[], key) => {
      if (params[key] || params[key] === 0) {
        ary.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
      }
      return ary
    }, [])
    .join('&')
  queryStr = `?${queryStr}`
  downloadExcel(queryStr, {})
    .then((blob: any) => {
      if (blob && blob instanceof Blob) {
        const blobUrl = URL.createObjectURL(blob)
        customDownload(blobUrl, `素材分发数据导出.xlsx`)
      }
    })
    .finally(() => {
      downloadRef.value = false
    })
}

// topic
const handleChangeModel = (val: any) => {
  const params = {
    model: val
  }
  materialQueryNeedTags(params).then((res: any) => {
    if (res && res.length > 0) {
      res = res.map((item: any) => {
        return {
          name: item.replace('#', ''),
          isDelete: false
        }
      })
      sceneDialog.activityTopic = res
    } else {
      sceneDialog.activityTopic = []
    }
  })
}
const topicInputVisible = ref<any>(false)
const topicInputValue = ref<any>('')
// 话题处理
const handleDeleteTopicTag = (index: number) => {
  sceneDialog.activityTopic.splice(index, 1)
  globalProperties.$message.success('删除成功')
}
const handleOpenTopicInput = () => {
  topicInputVisible.value = true
}
const handleInputConfirm = () => {
  let topicInput = ''
  if (topicInputValue.value) {
    // 需要除去空格和#
    topicInput = topicInputValue.value.replace(/\s+/g, '')
    topicInput = topicInput.replace('#', '')
  }
  if (topicInput) {
    const includes = sceneDialog.activityTopic.some((item: any) => {
      if (item.name === topicInput) {
        return true
      }
    })
    if (!includes) {
      sceneDialog.activityTopic.push({
        name: topicInput,
        isDelete: true
      })
    }
  }
  topicInputValue.value = ''
  topicInputVisible.value = false
}

// material topic
const handleChangeScene = (val: any) => {
  let sceneName = ''
  for (let i = 0; i < options.sceneList.length; i++) {
    if (Number(options.sceneList[i].value) === Number(val)) {
      sceneName = options.sceneList[i].label
      break
    }
  }
  if (!sceneName) {
    return
  }

  const params = {
    sceneName: sceneName
  }
  materialQueryNeedTags(params).then((res: any) => {
    if (res && res.length > 0) {
      res = res.map((item: any) => {
        return {
          name: item.replace('#', ''),
          isDelete: false
        }
      })
      materialDialog.activityTopic = res
    } else {
      materialDialog.activityTopic = []
    }
  })
}
const topicInputVisibleMaterial = ref<any>(false)
const topicInputValueMaterial = ref<any>('')
// 话题处理
const handleDeleteTopicTagMaterial = (index: number) => {
  materialDialog.activityTopic.splice(index, 1)
  globalProperties.$message.success('删除成功')
}
const handleOpenTopicInputMaterial = () => {
  topicInputVisibleMaterial.value = true
}
const handleInputConfirmMaterial = () => {
  let topicInput = ''
  if (topicInputValueMaterial.value) {
    // 需要除去空格和#
    topicInput = topicInputValueMaterial.value.replace(/\s+/g, '')
    topicInput = topicInput.replace('#', '')
  }
  if (topicInput) {
    const includes = materialDialog.activityTopic.some((item: any) => {
      if (item.name === topicInput) {
        return true
      }
    })
    if (!includes) {
      materialDialog.activityTopic.push({
        name: topicInput,
        isDelete: true
      })
    }
  }
  topicInputValueMaterial.value = ''
  topicInputVisibleMaterial.value = false
}

onMounted(() => {
  loadList()
  getOptions()
  getMaterialUploadTypes()
})
</script>

<style scoped lang="scss">
.material-filter {
  padding: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  > div {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin-top: 5px;
    line-height: 36px;
    .filter-title {
      margin: 0px 5px;
    }
    @media screen and (max-width: 1900px) {
      .filter-title {
        display: none;
      }
    }
  }
}
.material-flex-column {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-end;
}

.hideScrollbar {
  height: 600px;
  overflow-y: auto;
  scrollbar-width: none; // 火狐隐藏   谷歌有全局样式
}

.info {
  color: $custom-color-info;
}
.green {
  color: $custom-color-success;
}

.upload-icon {
  width: 80px;
}

.inline-block {
  width: 360px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  > span {
    margin-right: 5px;
    display: inline-block;
    min-width: 100px;
    text-align: end;
    white-space: nowrap;
    line-height: 32px;
  }
}
</style>
