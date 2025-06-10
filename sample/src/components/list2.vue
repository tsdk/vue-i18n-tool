<template>
  <div class="common-content">
    <div class="flex-between" style="padding: 20px 20px 0 20px">
      <div class="flex-row">
        <h1>内容维护列表</h1>
      </div>
      <div class="flex-row ml5">
        <el-tooltip
          effect="dark"
          placement="top"
          popper-class="custom-popper-note"
          content="<p>内容TT用户访问请选择【内部分享】<br/>外部用户访问请选择【外部分享】</p>"
          raw-content
        >
          <svg-icon name="smc-question-solid" className="mr15 pointer" />
        </el-tooltip>
        <el-button type="primary" size="small" @click="getShareLink">内部分享</el-button>
        <el-button type="success" size="small" @click="handleToShareOuter">外部分享</el-button>
      </div>
    </div>
    <ComposeFilter ref="composeFilterRef" />

    <div class="custom-filter">
      <div class="flex-row" style="align-items: flex-start">
        <h3 class="mr20">基础筛选</h3>
        <div class="custom-comment-box" style="gap: 15px">
          <!--平台-->
          <div class="flex-row">
            <CommonFilterPopover v-model="platformRef" :modelList="PLATFORM_MEDIA_MAP" :defaultExpandedFirst="true">
              <el-button link :type="platformRef.length ? 'primary' : ''">
                平台
                <svg-icon name="smc-arrow-down" className="icon-arrow" />
              </el-button>
            </CommonFilterPopover>
          </div>
          <div class="flex-row">
            <CommonPopoverCheckbox
              v-model="dataFilterResult.recordOrigin"
              :modelList="INFORMATION_CONTENT_FILTER_RECORD_ORIGIN"
              :width="200"
            >
              <el-button link :type="dataFilterResult.recordOrigin.length ? 'primary' : ''">
                收录来源
                <svg-icon name="smc-arrow-down" className="icon-arrow" />
              </el-button>
            </CommonPopoverCheckbox>
          </div>

          <div class="flex-row">
            <CommonPopoverCheckbox
              v-model="dataFilterResult.taskIds"
              :modelList="filterCondition.ruleNameList"
              :width="300"
              :filterable="true"
            >
              <el-button link :type="dataFilterResult.taskIds.length ? 'primary' : ''">
                任务名称
                <svg-icon name="smc-arrow-down" className="icon-arrow" />
              </el-button>
            </CommonPopoverCheckbox>
          </div>
          <div class="flex-row">
            <CommonPopoverCheckbox
              v-model="dataFilterResult.status"
              :modelList="INFORMATION_CONTENT_FILTER_STATUS"
              :width="200"
            >
              <el-button link :type="dataFilterResult.status.length ? 'primary' : ''">
                数据状态
                <svg-icon name="smc-arrow-down" className="icon-arrow" />
              </el-button>
            </CommonPopoverCheckbox>
          </div>

          <div class="flex-row">
            <CommonPopoverCheckbox
              v-model="dataFilterResult.isOriginal"
              :modelList="INFORMATION_CONTENT_FILTER_IS_ORIGINAL"
              :width="200"
            >
              <el-button link :type="dataFilterResult.isOriginal.length ? 'primary' : ''">
                是否原贴
                <svg-icon name="smc-arrow-down" className="icon-arrow" />
              </el-button>
            </CommonPopoverCheckbox>
          </div>
          <div class="flex-row">
            <el-popover placement="bottom" :width="300" trigger="click">
              <div class="flex-between">
                <span class="mr5" style="width: 74px; text-align: right">敏感性分类</span>
                <el-select
                  v-model="dataFilterResult.sensitivityType"
                  style="width: 190px"
                  size="small"
                  placeholder="请选择"
                  :teleported="false"
                  multiple
                  clearable
                  filterable
                  collapse-tags
                  collapse-tags-tooltip
                >
                  <el-option
                    v-for="(item, index) in INFORMATION_CONTENT_FILTER_SENSITIVITY_TYPE"
                    :key="index"
                    :value="item.value"
                    :label="item.label"
                  >
                  </el-option>
                </el-select>
              </div>
              <div class="flex-between mt10">
                <span class="mr5" style="width: 74px; text-align: right"> 敏感性分值 </span>
                <el-input
                  v-model="dataFilterResult.sensitivityScore[0]"
                  size="small"
                  placeholder=""
                  style="width: 80px"
                  oninput="value=value.replace(/[^0-9]/g,'')"
                  type="number"
                />
                <span class="ml5 mr5">-</span>
                <el-input
                  v-model="dataFilterResult.sensitivityScore[1]"
                  size="small"
                  placeholder=""
                  style="width: 80px"
                  oninput="value=value.replace(/[^0-9]/g,'')"
                  @focus="getLeftValue(dataFilterResult.sensitivityScore)"
                  type="number"
                />
              </div>
              <template #reference>
                <el-button
                  link
                  :type="dataFilterResult.sensitivityType.length || computedSensitivityScore.length ? 'primary' : ''"
                >
                  供应商敏感性判定
                  <svg-icon name="smc-arrow-down" className="icon-arrow" />
                </el-button>
              </template>
            </el-popover>
          </div>

          <!--品牌-->
          <div class="flex-row">
            <CommonPopoverCheckbox
              v-model="dataFilterResult.brand"
              :modelList="filterCondition.brandList"
              @change="handleChangeContentBrand"
              :width="220"
            >
              <el-button link :type="dataFilterResult.brand.length ? 'primary' : ''">
                品牌
                <svg-icon name="smc-arrow-down" className="icon-arrow" />
              </el-button>
            </CommonPopoverCheckbox>
          </div>

          <!--机型-->
          <div class="flex-row">
            <CommonPopoverCheckbox
              v-model="dataFilterResult.contentModel"
              :modelList="filterCondition.contentModelList"
              :filterable="true"
              :width="220"
            >
              <el-button link :type="dataFilterResult.contentModel.length ? 'primary' : ''">
                机型
                <svg-icon name="smc-arrow-down" className="icon-arrow" />
              </el-button>
            </CommonPopoverCheckbox>
          </div>

          <!--品牌情感-->
          <div class="flex-row">
            <CommonPopoverCheckbox
              v-model="dataFilterResult.brandEmotion"
              :modelList="filterCondition.brandEmotionList"
            >
              <el-button link :type="dataFilterResult.brandEmotion.length ? 'primary' : ''">
                品牌情感
                <svg-icon name="smc-arrow-down" className="icon-arrow" />
              </el-button>
            </CommonPopoverCheckbox>
          </div>

          <!--机型情感-->
          <div class="flex-row">
            <CommonPopoverCheckbox
              v-model="dataFilterResult.modelEmotion"
              :modelList="filterCondition.modelEmotionList"
            >
              <el-button link :type="dataFilterResult.modelEmotion.length ? 'primary' : ''">
                机型情感
                <svg-icon name="smc-arrow-down" className="icon-arrow" />
              </el-button>
            </CommonPopoverCheckbox>
          </div>

          <div class="flex-row">
            <CommonPopoverCheckbox
              v-model="dataFilterResult.taskStatus"
              :modelList="INFORMATION_CONTENT_FILTER_TASK_STATUS"
            >
              <el-button link :type="dataFilterResult.taskStatus.length ? 'primary' : ''">
                任务状态
                <svg-icon name="smc-arrow-down" className="icon-arrow" />
              </el-button>
            </CommonPopoverCheckbox>
          </div>
          <div class="flex-row">
            <CommonPopoverCheckbox v-model="dataFilterResult.followOrgs" :modelList="filterCondition.followOrgsList">
              <el-button link :type="dataFilterResult.followOrgs.length ? 'primary' : ''">
                跟进部门
                <svg-icon name="smc-arrow-down" className="icon-arrow" />
              </el-button>
            </CommonPopoverCheckbox>
          </div>
          <div class="flex-row">
            <CommonPopoverCheckbox
              v-model="dataFilterResult.serverStatus"
              :modelList="filterCondition.serverStatusList"
            >
              <el-button link :type="dataFilterResult.serverStatus.length ? 'primary' : ''">
                服务跟进状态
                <svg-icon name="smc-arrow-down" className="icon-arrow" />
              </el-button>
            </CommonPopoverCheckbox>
          </div>
          <div class="flex-row">
            <CommonPopoverCheckbox v-model="dataFilterResult.serverCases" :modelList="filterCondition.serverCasesList">
              <el-button link :type="dataFilterResult.serverCases.length ? 'primary' : ''">
                服务处理方案
                <svg-icon name="smc-arrow-down" className="icon-arrow" />
              </el-button>
            </CommonPopoverCheckbox>
          </div>
          <div class="flex-row">
            <CommonPopoverCheckbox
              v-model="dataFilterResult.serverTeam"
              :modelList="INFORMATION_CONTENT_FILTER_SERVER_TEAM"
              :width="300"
            >
              <el-button link :type="dataFilterResult.serverTeam.length ? 'primary' : ''">
                服务部门协作
                <svg-icon name="smc-arrow-down" className="icon-arrow" />
              </el-button>
            </CommonPopoverCheckbox>
          </div>
          <div class="flex-row">
            <CommonPopoverCheckbox
              v-model="dataFilterResult.followStatus"
              :modelList="filterCondition.followStatusList"
            >
              <el-button link :type="dataFilterResult.followStatus.length ? 'primary' : ''">
                公关跟进状态
                <svg-icon name="smc-arrow-down" className="icon-arrow" />
              </el-button>
            </CommonPopoverCheckbox>
          </div>
          <div class="flex-row">
            <CommonPopoverCheckbox
              v-model="dataFilterResult.followCases"
              :modelList="filterCondition.followCasesList"
              :width="220"
            >
              <el-button link :type="dataFilterResult.followCases.length ? 'primary' : ''">
                公关处理方案
                <svg-icon name="smc-arrow-down" className="icon-arrow" />
              </el-button>
            </CommonPopoverCheckbox>
          </div>
          <div class="flex-row">
            <CommonPopoverCheckbox
              v-model="dataFilterResult.followTeam"
              :modelList="INFORMATION_CONTENT_FILTER_FOLLOW_TEAM"
              :width="300"
            >
              <el-button link :type="dataFilterResult.followTeam.length ? 'primary' : ''">
                公关部门协作
                <svg-icon name="smc-arrow-down" className="icon-arrow" />
              </el-button>
            </CommonPopoverCheckbox>
          </div>
          <div class="flex-row">
            <CommonPopoverCheckbox
              v-model="dataFilterResult.labels"
              :modelList="filterCondition.labelList"
              :width="300"
              :filterable="true"
            >
              <el-button link :type="dataFilterResult.labels.length ? 'primary' : ''">
                关注标签
                <svg-icon name="smc-arrow-down" className="icon-arrow" />
              </el-button>
            </CommonPopoverCheckbox>
          </div>

          <!--发布时间-->
          <div class="flex-row">
            <span
              class="mr10"
              :class="{ 'custom-primary-color': dataFilterResult.publicTime && dataFilterResult.publicTime.length > 0 }"
              >发布时间:</span
            >
            <el-date-picker
              v-model="dataFilterResult.publicTime"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              type="datetimerange"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              :default-time="[new Date(0, 0, 0, 0, 0, 0), new Date(0, 0, 0, 23, 59, 59)]"
              size="small"
              :disabled-date="dateOptions"
              style="width: 325px"
              :shortcuts="shortcuts"
              clearable
            />
          </div>

          <div class="flex-row">
            <span
              class="mr10"
              :class="{ 'custom-primary-color': dataFilterResult.alarmTime && dataFilterResult.alarmTime.length > 0 }"
              >告警时间:</span
            >
            <el-date-picker
              v-model="dataFilterResult.alarmTime"
              @change="handleChangeFilter"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              type="datetimerange"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              :shortcuts="shortcuts"
              :default-time="[new Date(0, 0, 0, 0, 0, 0), new Date(0, 0, 0, 23, 59, 59)]"
              style="width: 325px"
              size="small"
              :disabled-date="dateOptions"
              clearable
            />
          </div>
        </div>
      </div>
    </div>
    <TemplateFilter @clickSelect="handleChangeTemplateId" ref="templateFilterRef" />
    <div class="custom-comment-box" style="padding: 10px 20px 15px 20px">
      <!-- <div>已勾选筛选项 ：</div> -->
      <el-tag
        v-if="getPlatformName.length > 0 && getPlatformName.length <= 8"
        type="primary"
        class="mr10 mt5"
        closable
        @close="deleteFilterTag('platform', '')"
        style="cursor: pointer; padding: 5px"
      >
        平台：{{ getPlatformName.join('，') }}
      </el-tag>
      <el-tooltip
        v-else-if="getPlatformName.length > 8"
        effect="dark"
        placement="bottom"
        popper-class="custom-popper-note"
      >
        <template #content>
          {{ getPlatformName.join('，') }}
        </template>
        <el-tag
          type="primary"
          class="mr10 mt5"
          closable
          @close="deleteFilterTag('platform', '')"
          style="cursor: pointer; padding: 5px"
        >
          平台：{{ getPlatformName.slice(0, 8).join('，') }} + {{ getPlatformName.length - 8 }}
        </el-tag>
      </el-tooltip>

      <template v-for="(item, key) in dataFilterResult" :key="key">
        <el-tag
          v-if="
            item &&
            item.length &&
            getLabelName(item, key, 'data').length > 0 &&
            getLabelName(item, key, 'data').length <= 8
          "
          type="primary"
          class="mr10 mt5"
          closable
          @close="deleteFilterTag('data', key)"
          style="cursor: pointer; padding: 5px"
        >
          {{ dataFilterMap[key] }}：{{ getLabelName(item, key, 'data').join('，') }}
        </el-tag>
        <el-tooltip
          v-else-if="getLabelName(item, key, 'data').length > 8"
          effect="dark"
          placement="bottom"
          popper-class="custom-popper-note"
        >
          <template #content>
            {{ getLabelName(item, key, 'data').join('，') }}
          </template>
          <el-tag
            type="primary"
            class="mr10 mt5"
            closable
            @close="deleteFilterTag('data', key)"
            style="cursor: pointer; padding: 5px"
          >
            {{ dataFilterMap[key] }}：{{ getLabelName(item, key, 'data').slice(0, 8).join('，') }} +
            {{ getLabelName(item, key, 'data').length - 8 }}
          </el-tag>
        </el-tooltip>
      </template>

      <el-button class="mt5" type="primary" link @click="handleClearFilterCondition"> 清空筛选 </el-button>
      <el-button class="mt5" type="success" size="small" @click="handleSaveFilterCondition('save')">
        保存检索方案
      </el-button>
      <el-button class="mt5" type="success" size="small" @click="handleSaveFilterCondition('copy')">
        另存为检索方案
      </el-button>
    </div>
  </div>
  <div class="common-content mt20">
    <div class="flex-between custom-total-top-scroll" style="padding: 10px 10px 0 10px">
      <div class="flex-row">
        <span>共 {{ page.pageTotal }} 篇内容</span>
        <el-button
          type="primary"
          @click="handleToBatch()"
          class="ml15"
          size="small"
          :disabled="page.multipleSelection.length === 0"
          v-if="
            globalProperties.$globalPermission({
              permissionKey: [
                'INFORMATION_ALARM_SENTIMENT_OPERATE_ORG',
                'INFORMATION_ALARM_SENTIMENT_OPERATE_SERVICE',
                'INFORMATION_ALARM_SENTIMENT_OPERATE_FOLLOW'
              ]
            })
          "
          >批量操作</el-button
        >
        <el-button
          type="primary"
          @click="handleToImport()"
          class="ml15"
          size="small"
          v-if="
            globalProperties.$globalPermission({
              permissionKey: 'INFORMATION_ALARM_SENTIMENT_OPERATE_IMPORT'
            })
          "
          >导入</el-button
        >
      </div>

      <div>
        <el-button size="small" type="primary" @click="handleChangeFilter"> 查询 </el-button>
        <!-- <el-button size="small" type="primary" disabled v-if="page.pageTotal > 10000">
          导出结果
          <el-tooltip
            effect="dark"
            placement="top"
            popper-class="custom-popper-note"
            content="页面匹配数据过多，暂不支持下载，您可使用页面分享功能。补充筛选条件后，数据< 1万 条，即可下载哦～"
          >
            <svg-icon name="smc-question-solid" className="ml5" />
          </el-tooltip>
        </el-button> -->
        <el-button size="small" type="primary" @click="handleToDownload"> 导出结果 </el-button>
      </div>
    </div>
    <div class="mt10">
      <el-table
        ref="tableRef"
        :data="page.tableData"
        style="width: 100%"
        tooltip-effect="dark"
        v-loading="page.loading"
        @sort-change="handleChangeSort"
        scrollbar-always-on
        v-table-sticky-header
        v-table-sticky-scroller
        @selection-change="handleSelectionChange"
        row-key="alarmRecordId"
      >
        <el-table-column type="selection" width="55" align="center" fixed="left" />
        <el-table-column label="内容信息">
          <template #header>
            <div class="flex-between">
              <span>内容信息</span>
              <div class="flex-row">
                <el-select
                  v-model="page.customSort"
                  placeholder=""
                  size="small"
                  style="width: 160px"
                  @change="handleChangeCustomSort"
                >
                  <el-option
                    v-for="(item, index) in CUSTOM_SORT_LIST"
                    :key="index"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <div class="sort-button">
                  <svg-icon
                    name="smc-arrow-up-solid "
                    style="width: 10px; height: 10px"
                    @click="handleCustomSort('ASC')"
                    :class="page.customSortBy === 'ASC' ? 'custom-select-color' : ''"
                  ></svg-icon>
                  <svg-icon
                    name="smc-arrow-down-solid"
                    style="width: 10px; height: 10px"
                    @click="handleCustomSort('DESC')"
                    :class="page.customSortBy === 'DESC' ? 'custom-select-color' : ''"
                  ></svg-icon>
                </div>
              </div>
            </div>
          </template>

          <template #default="scope">
            <div class="flex-row custom-row-top">
              <span class="desc" @click="handleToLink(scope.row.homePage)" style="font-size: 12px">
                {{ scope.row.contentAuthor || '--' }}
              </span>
              <span class="ml15 mr15">|</span>
              <span
                >粉丝数：{{
                  scope.row.contentAuthorFans || scope.row.contentAuthorFans === 0 ? scope.row.contentAuthorFans : '--'
                }}</span
              >
              <span class="ml15 mr15">|</span>
              <span>平台：{{ scope.row.capturewebsite }}</span>
              <span class="ml15 mr15">|</span>
              <span>发布时间：{{ scope.row.contentPublishTime || '--' }}</span>
              <span class="time ml15 mr15">入库时间：{{ scope.row.contentSaveTime || '--' }}</span>
              <span>收录时间：{{ scope.row.alarmTime || '--' }}</span>
            </div>
            <div class="custom-row-content mt10">
              <div class="custom-row-content-left">
                <div class="flex-between">
                  <div class="flex-row">
                    <span>匹配到的内容：</span>
                    <span>{{ scope.row.match_info_detail || '--' }}</span>
                    <span style="margin-left: 30px">采集供应商敏感判定：</span>
                    <span
                      :class="{
                        'custom-danger-color': scope.row.sensitivityType === 1,
                        'custom-primary-color': scope.row.sensitivityType === 2,
                        'custom-success-color': scope.row.sensitivityType === 3
                      }"
                      >{{
                        scope.row.sensitivityType === 1
                          ? '敏感'
                          : scope.row.sensitivityType === 2
                            ? '非敏感'
                            : scope.row.sensitivityType === 3
                              ? '中性'
                              : '--'
                      }}</span
                    >
                  </div>

                  <div @click="handleCopyTxt(scope.row.matchId)" class="flex-row pointer" style="flex-shrink: 0">
                    内容ID <DocumentCopy class="ml5 smc-copy" style="width: 14px" />
                  </div>
                </div>

                <div v-if="scope.row.contentTitle" class="flex-row mt10">
                  <el-tooltip effect="dark" placement="bottom" popper-class="custom-popper-note">
                    <template #content>
                      {{ scope.row.contentTitle }}
                    </template>
                    <el-text
                      :line-clamp="2"
                      class="desc"
                      @click="handleToLink(scope.row.contentUrl)"
                      style="font-size: 16px; font-weight: 700"
                      >{{ scope.row.contentTitle }}</el-text
                    >
                  </el-tooltip>
                </div>
                <div class="desc mt10" v-else @click="handleToLink(scope.row.contentUrl)">--</div>

                <div class="mt10">
                  <!--如果contentText不等于contentTitle则展示contentText-->
                  <el-tooltip effect="dark" placement="bottom" popper-class="custom-popper-note">
                    <template #content>
                      {{ scope.row.contentText }}
                    </template>
                    <el-text :line-clamp="2" v-if="scope.row.contentText !== scope.row.contentTitle">{{
                      scope.row.contentText || '--'
                    }}</el-text>
                  </el-tooltip>

                  <!--如果contentText等于contentTitle并且contentSummary不等于contentTitle则展示contentSummary-->
                  <el-tooltip effect="dark" placement="bottom" popper-class="custom-popper-note">
                    <template #content>
                      {{ scope.row.contentSummary }}
                    </template>
                    <el-text
                      :line-clamp="2"
                      v-if="
                        scope.row.contentText === scope.row.contentTitle &&
                        scope.row.contentSummary !== scope.row.contentTitle
                      "
                      >{{ scope.row.contentSummary || '--' }}
                    </el-text>
                  </el-tooltip>

                  <!--如果contentText等于contentTitle并且contentSummary等于contentTitle则不展示-->
                </div>
                <div>
                  <div
                    class="flex-row"
                    style="flex-wrap: wrap; gap: 15px; margin-top: 10px"
                    v-if="scope.row.picUrls && scope.row.picUrls.length > 0"
                  >
                    <div
                      v-for="(item, index) in scope.row.picUrls"
                      :key="index"
                      style="position: relative; width: 150px; height: 180px"
                    >
                      <el-image
                        style="width: 150px; height: 180px; cursor: pointer"
                        :src="item"
                        :zoom-rate="1.2"
                        :max-scale="7"
                        :min-scale="0.2"
                        preview-teleported
                        fit="cover"
                        :preview-src-list="scope.row.picUrls"
                        :initial-index="index"
                        lazy
                      >
                        <template #error>
                          <div
                            style="
                              display: flex;
                              justify-content: center;
                              align-items: center;
                              width: 100%;
                              height: 100%;
                              font-size: 14px;
                              background: #f6f6fb;
                              color: #808291;
                              vertical-align: middle;
                            "
                          >
                            加载失败
                          </div>
                        </template>
                      </el-image>
                    </div>
                  </div>
                  <div style="margin-top: 30px" v-else>
                    <!-- <ImagePreview :srcList="[]" :width="150" :height="180" :srcError="scope.row.srcError" /> -->
                  </div>
                </div>
                <div class="flex-row mt10" style="gap: 15px; flex-wrap: wrap">
                  <span>品牌情感：</span>
                  <template v-if="scope.row.brandEmotions && scope.row.brandEmotions.length > 0">
                    <el-tag
                      effect="light"
                      round
                      v-for="(tag, key) in scope.row.brandEmotions"
                      :key="key"
                      :type="
                        tag.includes('负向')
                          ? 'danger'
                          : tag.includes('不明确')
                            ? 'warning'
                            : tag.includes('中性')
                              ? 'info'
                              : 'success'
                      "
                    >
                      <div class="flex-row">
                        <span class="mr10">{{ tag }}</span>
                        <el-tooltip effect="dark" content="打标错误 提报/修正" placement="top">
                          <svg-icon
                            class="pointer"
                            style="outline: none"
                            name="smc-edit"
                            @click="handleEditBadCase(scope.row)"
                            v-permission="{
                              permissionKey: 'INFORMATION_ALARM_SENTIMENT_OPERATE'
                            }"
                          />
                        </el-tooltip>
                      </div>
                    </el-tag>
                  </template>
                  <span v-else>--</span>
                  <span>|</span>
                  <span>机型情感：</span>
                  <template v-if="scope.row.phoneEmotions && scope.row.phoneEmotions.length > 0">
                    <el-tag
                      effect="light"
                      round
                      v-for="(tag, key) in scope.row.phoneEmotions"
                      :key="key"
                      :type="
                        tag.includes('负向')
                          ? 'danger'
                          : tag.includes('不明确')
                            ? 'warning'
                            : tag.includes('中性')
                              ? 'info'
                              : 'success'
                      "
                    >
                      <div class="flex-row">
                        <span class="mr10">{{ tag }}</span>
                        <el-tooltip effect="dark" content="打标错误 提报/修正" placement="top">
                          <svg-icon
                            class="pointer"
                            style="outline: none"
                            name="smc-edit"
                            @click="handleEditBadCase(scope.row)"
                            v-permission="{
                              permissionKey: 'INFORMATION_ALARM_SENTIMENT_OPERATE'
                            }"
                          />
                        </el-tooltip>
                      </div>
                    </el-tag>
                  </template>
                  <span v-else>--</span>
                </div>
                <div style="display: flex; margin-top: 10px">
                  <span style="flex-shrink: 0"
                    >收录来源：{{
                      scope.row.recordOrigin === 0 ? '监控告警' : scope.row.recordOrigin === 1 ? '人工导入' : '--'
                    }}</span
                  >
                  <span style="margin: 0 30px; flex-shrink: 0">任务名称：{{ scope.row.alarmRuleName }}</span>
                  <span style="flex-shrink: 0">关注标签：</span>
                  <p
                    v-if="scope.row.labels && scope.row.labels.length > 0"
                    style="display: flex; flex-wrap: wrap; gap: 10px"
                  >
                    <el-tag
                      v-for="(tag, tagIndex) in scope.row.labels"
                      :key="tag"
                      closable
                      :disable-transitions="false"
                      @close="handleDeleteTag(tagIndex, scope.row)"
                      style="line-height: 24px"
                    >
                      {{ tag }}
                    </el-tag>
                    <svg-icon
                      name="smc-edit"
                      className="pointer custom-primary-color ml10 mt5"
                      @click="handleLabel(scope.row, scope.$index)"
                    />
                  </p>
                  <template v-else>
                    <span>--</span>
                    <svg-icon
                      name="smc-edit"
                      className="pointer custom-primary-color ml10 mt5"
                      @click="handleLabel(scope.row, scope.$index)"
                    />
                  </template>
                </div>
              </div>
              <div class="custom-row-content-right">
                <div style="display: flex">
                  <span style="width: 80px; text-align: right; flex-shrink: 0">任务状态：</span>
                  <div class="flex-column" style="align-items: flex-start">
                    <el-select
                      v-if="
                        globalProperties.$globalPermission({
                          permissionKey: 'INFORMATION_ALARM_SENTIMENT_OPERATE_TASK'
                        })
                      "
                      placeholder=""
                      v-model="scope.row.taskStatus"
                      filterable
                      allow-create
                      default-first-option
                      style="width: 150px; cursor: pointer"
                      @change="(val: any) => handleChangeOrg(val, scope.row, scope.$index, 11)"
                    >
                      <el-option
                        v-for="(item, key) in INFORMATION_CONTENT_FILTER_TASK_STATUS"
                        :key="key"
                        :value="item.value"
                        :label="item.label"
                      />
                    </el-select>
                    <span v-else>{{ scope.row.taskStatus }}</span>

                    <p class="flex-row mt10">
                      <span
                        class="desc"
                        style="flex-shrink: 0"
                        @click="handleFollowup(scope.row, scope.$index, 12)"
                        v-if="
                          globalProperties.$globalPermission({
                            permissionKey: 'INFORMATION_ALARM_SENTIMENT_OPERATE_TASK'
                          })
                        "
                        >备注：</span
                      >
                      <span class="desc" style="color: #666; flex-shrink: 0" v-else>备注：</span>
                      <span> {{ scope.row.taskStatusRemark || '--' }}</span>
                    </p>
                  </div>
                </div>
                <div style="display: flex; margin-top: 15px">
                  <span style="width: 80px; text-align: right; flex-shrink: 0">跟进部门：</span>
                  <div class="flex-column" style="align-items: flex-start">
                    <el-select
                      v-if="
                        globalProperties.$globalPermission({
                          permissionKey: 'INFORMATION_ALARM_SENTIMENT_OPERATE_ORG'
                        })
                      "
                      placeholder=""
                      v-model="scope.row.followOrg"
                      filterable
                      allow-create
                      default-first-option
                      style="width: 150px; cursor: pointer"
                      @change="(val: any) => handleChangeOrg(val, scope.row, scope.$index, 1)"
                    >
                      <el-option
                        v-for="(value, key) in ALARM_TASK_FOLLOW_ORG"
                        :key="key"
                        :value="value"
                        :label="value"
                      />
                    </el-select>
                    <span v-else>{{ scope.row.followOrg }}</span>

                    <p class="flex-row mt10">
                      <span
                        class="desc"
                        style="flex-shrink: 0"
                        @click="handleFollowup(scope.row, scope.$index, 2)"
                        v-if="
                          globalProperties.$globalPermission({
                            permissionKey: 'INFORMATION_ALARM_SENTIMENT_OPERATE_ORG'
                          })
                        "
                        >备注：</span
                      >
                      <span class="desc" style="color: #666; flex-shrink: 0" v-else>备注：</span>
                      <span> {{ scope.row.orgRemark || '--' }}</span>
                    </p>
                  </div>
                </div>
                <div style="margin-top: 15px">
                  <div style="display: flex">
                    <span style="width: 80px; text-align: right; flex-shrink: 0">服务跟进：</span>
                    <div class="flex-column" style="align-items: flex-start">
                      <el-select
                        v-if="
                          globalProperties.$globalPermission({
                            permissionKey: 'INFORMATION_ALARM_SENTIMENT_OPERATE_SERVICE'
                          })
                        "
                        placeholder=""
                        v-model="scope.row.serverStatus"
                        filterable
                        allow-create
                        default-first-option
                        style="width: 150px; cursor: pointer"
                        @change="(val: any) => handleChangeOrg(val, scope.row, scope.$index, 3)"
                      >
                        <el-option
                          v-for="(value, key) in ALARM_TASK_FOLLOW_SERVICE_STATUS"
                          :key="key"
                          :value="value"
                          :label="value"
                        />
                      </el-select>
                      <span v-else>{{ scope.row.serverStatus }}</span>
                      <template v-if="scope.row.serverStatus === '已处理'">
                        <el-select
                          v-if="
                            globalProperties.$globalPermission({
                              permissionKey: 'INFORMATION_ALARM_SENTIMENT_OPERATE_SERVICE'
                            })
                          "
                          placeholder=""
                          v-model="scope.row.serverCase"
                          filterable
                          allow-create
                          default-first-option
                          style="width: 150px; cursor: pointer"
                          @change="(val: any) => handleChangeOrg(val, scope.row, scope.$index, 4)"
                          class="mt10"
                        >
                          <el-option
                            v-for="(value, key) in ALARM_TASK_FOLLOW_SERVICE_CASE"
                            :key="key"
                            :value="value"
                            :label="value"
                          />
                        </el-select>
                        <span v-else>{{ scope.row.serverCase }}</span>
                      </template>
                    </div>
                    <div class="ml10">
                      <el-select
                        v-if="
                          globalProperties.$globalPermission({
                            permissionKey: 'INFORMATION_ALARM_SENTIMENT_OPERATE_SERVICE'
                          })
                        "
                        placeholder="选择部门协作"
                        v-model="scope.row.serverTeam"
                        style="width: 150px; cursor: pointer"
                        @change="(val: any) => handleChangeOrg(val, scope.row, scope.$index, 9)"
                      >
                        <el-option
                          v-for="(item, key) in INFORMATION_CONTENT_FILTER_SERVER_TEAM"
                          :key="key"
                          :value="item.value"
                          :label="item.label"
                        />
                      </el-select>
                      <span v-else>{{ scope.row.serverTeam || '--' }}</span>
                    </div>
                  </div>
                  <p class="flex-row mt10" style="margin-left: 80px">
                    <span
                      class="desc"
                      style="flex-shrink: 0"
                      @click="handleFollowup(scope.row, scope.$index, 5)"
                      v-if="
                        globalProperties.$globalPermission({
                          permissionKey: 'INFORMATION_ALARM_SENTIMENT_OPERATE_SERVICE'
                        })
                      "
                      >备注：</span
                    >
                    <span class="desc" style="color: #666; flex-shrink: 0" v-else>备注：</span>
                    <span> {{ scope.row.serverRemark || '--' }}</span>
                  </p>
                </div>
                <div style="margin-top: 15px">
                  <div style="display: flex">
                    <span style="width: 80px; text-align: right; flex-shrink: 0">公关跟进：</span>
                    <div class="flex-column" style="align-items: flex-start">
                      <el-select
                        v-if="
                          globalProperties.$globalPermission({
                            permissionKey: 'INFORMATION_ALARM_SENTIMENT_OPERATE_FOLLOW'
                          })
                        "
                        placeholder=""
                        v-model="scope.row.followStatus"
                        filterable
                        allow-create
                        default-first-option
                        style="width: 150px; cursor: pointer"
                        @change="(val: any) => handleChangeOrg(val, scope.row, scope.$index, 6)"
                      >
                        <el-option
                          v-for="(value, key) in ALARM_TASK_FOLLOW_STATUS"
                          :key="key"
                          :value="value"
                          :label="value"
                        />
                      </el-select>
                      <span v-else>{{ scope.row.followStatus }}</span>
                      <template v-if="scope.row.followStatus === '已处理'">
                        <el-select
                          v-if="
                            globalProperties.$globalPermission({
                              permissionKey: 'INFORMATION_ALARM_SENTIMENT_OPERATE_FOLLOW'
                            })
                          "
                          placeholder=""
                          v-model="scope.row.followCase"
                          filterable
                          allow-create
                          default-first-option
                          style="width: 150px; cursor: pointer"
                          @change="(val: any) => handleChangeOrg(val, scope.row, scope.$index, 7)"
                          class="mt10"
                        >
                          <el-option
                            v-for="(value, key) in ALARM_TASK_FOLLOW_CASE"
                            :key="key"
                            :value="value"
                            :label="value"
                          />
                        </el-select>
                        <span v-else>{{ scope.row.followCase }}</span>
                      </template>
                    </div>
                    <div class="ml10">
                      <el-select
                        v-if="
                          globalProperties.$globalPermission({
                            permissionKey: 'INFORMATION_ALARM_SENTIMENT_OPERATE_FOLLOW'
                          })
                        "
                        placeholder="选择部门协作"
                        v-model="scope.row.followTeam"
                        style="width: 150px; cursor: pointer"
                        @change="(val: any) => handleChangeOrg(val, scope.row, scope.$index, 10)"
                      >
                        <el-option
                          v-for="(item, key) in INFORMATION_CONTENT_FILTER_FOLLOW_TEAM"
                          :key="key"
                          :value="item.value"
                          :label="item.label"
                        />
                      </el-select>
                      <span v-else>{{ scope.row.followTeam || '--' }}</span>
                    </div>
                  </div>
                  <p class="flex-row mt15" style="margin-left: 80px">
                    <span
                      class="desc"
                      style="flex-shrink: 0"
                      @click="handleFollowup(scope.row, scope.$index, 8)"
                      v-if="
                        globalProperties.$globalPermission({
                          permissionKey: 'INFORMATION_ALARM_SENTIMENT_OPERATE_FOLLOW'
                        })
                      "
                      >备注：</span
                    >
                    <span class="desc" style="color: #666; flex-shrink: 0" v-else>备注：</span>
                    <span> {{ scope.row.followRemark || '--' }}</span>
                  </p>
                </div>
              </div>
            </div>
            <div class="custom-row-content" style="padding-bottom: 10px; min-height: auto">
              <div class="custom-row-content-left" style="padding-top: 10px">
                <div class="flex-between">
                  <p class="time pointer flex-row">
                    <span><svg-icon name="smc-switch" />{{ scope.row.contentInterCnt }} |</span>
                    <span><svg-icon name="smc-heartline" />{{ scope.row.contentDiggCnt }} |</span>
                    <span @click="handleToCommentDetailList('contentId', scope.row)">
                      <svg-icon name="smc-chat" class="pointer" />
                      <span class="pointer" style="text-decoration: underline"
                        >{{ scope.row.contentCommentCnt }}
                      </span></span
                    >
                  </p>
                  <el-button
                    type="primary"
                    link
                    size="small"
                    style="margin-left: 0"
                    @click="handleToDetail(scope.row, 'first')"
                    >更多内容信息</el-button
                  >
                </div>
              </div>
              <div class="custom-row-content-right" style="padding-top: 10px">
                <div class="custom-handle-user">
                  <span class="time pointer flex-row"> 最近处理人：{{ scope.row.lastHandUser || '--' }} </span>
                  <el-button type="primary" link size="small" @click="handleToDetail(scope.row, 'second')"
                    >操作日志</el-button
                  >
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination
      class="pd20"
      background
      :page-size="page.pageSize"
      :current-page="page.pageNumber"
      @size-change="handleSizeChange"
      :page-sizes="[10, 15, 20, 50, 100, 200]"
      @current-change="handlePageChange"
      layout="->,total,quickPrev,prev,pager,next,quickNext,sizes,jumper"
      :total="page.pageTotal"
    />
    <el-backtop :bottom="100">
      <div
        style="
          height: 100%;
          width: 100%;
          background-color: #fff;
          box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.12);
          text-align: center;
          line-height: 40px;
          color: #1989fa;
          padding-top: 3px;
        "
      >
        <el-icon><Top /></el-icon>
      </div>
    </el-backtop>
  </div>
  <FollowupDialog
    :isShowDialog="page.followupVisible"
    :currentObj="page.currentObj"
    @clickClose="handleCloseFollowupDialog"
    @clickSubmit="handleChangeFollowup"
  />
  <LabelDialog
    :isShowDialog="page.labelVisible"
    :currentObj="page.currentObj"
    @clickClose="handleCloseLabelDialog"
    @clickSubmit="handleChangeLabel"
  />
  <BadCaseDialog
    :isShowDialog="page.dialogVisible"
    :platform="page.badItem.platform"
    :badItem="page.badItem"
    :filterBrandList="filterCondition.brandAllList"
    :filterOppoMoodList="filterCondition.brandEmotionList"
    @clickClose="handleCloseBadCaseDialog"
  />
  <CommonFilterTemplateDialog
    :isShowDialog="page.dialogVisibleFilter"
    :condition="page.filterTemplateCondition"
    :type="INFORMATION_ALARM_SENTIMENT_LIST"
    @clickClose="handleCloseDialogFilter"
  />
  <SentimentBatchDialog
    :isShowDialog="page.dialogVisibleBatch"
    @clickClose="handleCloseDialogBatch"
    @clickSubmit="handleSubmitDialogBatch"
  />
  <ContentDetailDrawer
    :isShowDrawer="page.detailDrawerVisible"
    :currentObj="page.detailObj"
    @clickClose="handleCloseDetail"
  />
  <ImportDialog :isShowDialog="page.isShowDialogImport" @clickClose="handleCloseDialogImport" />
</template>
<script lang="ts" setup>
import { sentimentFilterDim, saveFilterParams, getFilterParams } from '@/api/information/opinion'
import { alarmRecordRuleList } from '@/api/information/alarm'
import {
  sentimentPage,
  sentimentBatchEdit,
  sentimentDownload,
  sentimentLabels,
  sentimentUpdateLabels
} from '@/api/information/sentiment'
import { DocumentCopy } from '@element-plus/icons-vue'
import ImagePreview from '@/components/ImagePreview.vue'
import {
  dataFilterMap,
  CONTENT_DEFAULT_IMAGE_MAP,
  CUSTOM_SORT_LIST,
  INFORMATION_ALARM_SENTIMENT_LIST,
  INFORMATION_CONTENT_FILTER_STATUS,
  INFORMATION_CONTENT_FILTER_IS_ORIGINAL,
  INFORMATION_CONTENT_FILTER_SERVER_TEAM,
  INFORMATION_CONTENT_FILTER_FOLLOW_TEAM,
  INFORMATION_CONTENT_FILTER_RECORD_ORIGIN,
  INFORMATION_CONTENT_FILTER_TASK_STATUS
} from './constant'
import {
  ALARM_TASK_FOLLOW_ORG,
  ALARM_TASK_FOLLOW_SERVICE_STATUS,
  ALARM_TASK_FOLLOW_SERVICE_CASE,
  ALARM_TASK_FOLLOW_STATUS,
  ALARM_TASK_FOLLOW_CASE
} from '@/views/information/alarm/task/constant'
import FollowupDialog from './components/FollowupDialog.vue'
import LabelDialog from './components/LabelDialog.vue'
import BadCaseDialog from './components/BadCaseDialog.vue'
import ComposeFilter from './components/ComposeFilter.vue'
import TemplateFilter from './components/TemplateFilter.vue'
import ContentDetailDrawer from './components/ContentDetailDrawer.vue'
import SentimentBatchDialog from './components/SentimentBatchDialog.vue'
import ImportDialog from './components/ImportDialog.vue'
import { customDownload, objectToQueryString, useClipboard } from '@/utils'
import { useCurrentInstance } from '@/hooks'
import CommonPopoverCheckbox from '@/views/information/common/components/CommonPopoverCheckbox.vue'
import CommonFilterPopover from '@/views/information/common/components/CommonFilterPopover.vue'
import CommonFilterTemplateDialog from '@/views/information/common/components/CommonFilterTemplateDialog.vue'
import { PLATFORM_MEDIA_MAP } from '@/views/information/common/constant'
import { INFORMATION_CONTENT_FILTER_SENSITIVITY_TYPE } from '@/views/information/opinion/content/constant'
import otherError from '@/assets/images/content/other-error.jpg'
import { Top } from '@element-plus/icons-vue'

// 处理平台数据
const platformList = PLATFORM_MEDIA_MAP.slice()
platformList.splice(0, 1)

const router = useRouter()
const route = useRoute()
const { toClipboard } = useClipboard()
const { globalProperties } = useCurrentInstance()
const tableRef = ref()
const platformRef = ref<any[]>([])
const composeFilterRef = ref<any>()
const templateFilterRef = ref<any>()

const timeScopeObj: any = {
  twentyFour: () => {
    const currentTime = page.updateTime ? globalProperties.$dayjs(page.updateTime) : globalProperties.$dayjs()
    const previousDay = currentTime.subtract(24, 'hour')
    return [previousDay.format('YYYY-MM-DD HH:mm:ss'), currentTime.format('YYYY-MM-DD HH:mm:ss')]
  },
  yesterday: () => {
    const currentTime = globalProperties.$dayjs().subtract(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
    const previousDay = globalProperties.$dayjs().subtract(1, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss')
    return [currentTime, previousDay]
  },
  three: () => {
    const currentTime = page.updateTime ? globalProperties.$dayjs(page.updateTime) : globalProperties.$dayjs()
    const previousDay = currentTime.subtract(3, 'day')
    return [previousDay.format('YYYY-MM-DD HH:mm:ss'), currentTime.format('YYYY-MM-DD HH:mm:ss')]
  },
  seven: () => {
    const currentTime = page.updateTime ? globalProperties.$dayjs(page.updateTime) : globalProperties.$dayjs()
    const previousDay = currentTime.subtract(7, 'day')
    return [previousDay.format('YYYY-MM-DD HH:mm:ss'), currentTime.format('YYYY-MM-DD HH:mm:ss')]
  },
  fifteen: () => {
    const currentTime = page.updateTime ? globalProperties.$dayjs(page.updateTime) : globalProperties.$dayjs()
    const previousDay = currentTime.subtract(15, 'day')
    return [previousDay.format('YYYY-MM-DD HH:mm:ss'), currentTime.format('YYYY-MM-DD HH:mm:ss')]
  },
  thirty: () => {
    const currentTime = page.updateTime ? globalProperties.$dayjs(page.updateTime) : globalProperties.$dayjs()
    const previousDay = currentTime.subtract(30, 'day')
    return [previousDay.format('YYYY-MM-DD HH:mm:ss'), currentTime.format('YYYY-MM-DD HH:mm:ss')]
  }
}
const shortcuts = [
  {
    text: '24小时',
    value: () => {
      return timeScopeObj['twentyFour']()
    }
  },
  {
    text: '昨日',
    value: () => {
      return timeScopeObj['yesterday']()
    }
  },
  {
    text: '近3天',
    value: () => {
      return timeScopeObj['three']()
    }
  },
  {
    text: '近7天',
    value: () => {
      return timeScopeObj['seven']()
    }
  },
  {
    text: '近15天',
    value: () => {
      return timeScopeObj['fifteen']()
    }
  },
  {
    text: '近30天',
    value: () => {
      return timeScopeObj['thirty']()
    }
  }
]

const dateOptions = (time: any) => {
  return time.getTime() > new Date().getTime()
}

const page = reactive({
  expandedFilter: true,
  customSort: CUSTOM_SORT_LIST[0].value, //'content_title',
  customSortBy: '',
  tableData: [] as any[],
  pageSize: 20,
  pageNumber: 1,
  pageTotal: 0,
  // pageTotalContent: 0,
  // 详情
  currentObj: {},
  drawerVisible: false,
  badItem: {} as any,
  dialogVisible: false,
  followupVisible: false,
  followupIndex: 0,
  loading: false,
  labelVisible: false,
  // 排序
  sortValue: '',
  order: '' as any,
  updateTime: '',
  // 筛选条件
  dialogVisibleFilter: false,
  filterTemplateCondition: {} as any,
  filterTemplateConditionOrigin: {} as any, // 保存原来改变的
  // 记录是否刷新模板列表
  // refreshFilterTemplate: false,
  // 组合关键词
  composeVisible: false,
  // 统计分析
  // analysisObj: Object.create(null),
  // analysisDrawerVisible: false,
  // 详情
  detailObj: Object.create(null),
  detailDrawerVisible: false,
  // 批量
  dialogVisibleBatch: false,
  multipleSelection: [] as any[],
  // import
  isShowDialogImport: false,
  isChangePaged: false
})

const filterCondition = reactive<any>({
  brandList: [],
  brandAllList: [], // 打标弹出框使用
  commentAllModelList: [],
  contentAllModelList: [],
  contentModelList: [],
  brandEmotionList: [],
  modelEmotionList: [],
  followOrgsList: [],
  serverStatusList: [],
  serverCasesList: [],
  followStatusList: [],
  followCasesList: [],
  // PRFollowupList: [],
  // PRFollowupListCopy: [],
  allModelList: [],
  ruleNameList: [] as any[],
  labelList: []
})
const dataFilterResult = reactive<any>({
  // 基础筛选
  taskIds: [], // 任务名称
  status: [], // 数据状态
  isOriginal: [], // 是否原贴
  // 内容-品牌
  brand: [],
  // 内容-机型
  contentModel: [],
  // 内容-品牌情感
  brandEmotion: [],
  // 内容-机型情感
  modelEmotion: [],
  taskStatus: [],
  followOrgs: [],
  serverStatus: [],
  serverCases: [],
  followStatus: [],
  followCases: [],
  // 内容-内容发布日期
  publicTime: [],
  alarmTime: [
    globalProperties.$dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss'),
    globalProperties.$dayjs().format('YYYY-MM-DD HH:mm:ss')
  ],
  sensitivityType: [], // 敏感性判断分类
  sensitivityScore: [], // 敏感性分值，格式min_max
  recordOrigin: [],
  serverTeam: [],
  followTeam: [],
  labels: []
})

const getPlatformName = computed(() => {
  return platformRef.value
})
const computedSensitivityScore = computed(() => {
  const tmpResult: any = []
  if (dataFilterResult.sensitivityScore && dataFilterResult.sensitivityScore.length > 0) {
    dataFilterResult.sensitivityScore.forEach((item: any) => {
      if (item || item === 0) {
        tmpResult.push(item)
      }
    })
  }
  return tmpResult
})

// 全部返回数组
const computedLabelName = (result: any[], list: any[], type = 1) => {
  const tmpArr: any = []
  if (type === 1) {
    list.forEach((item: any) => {
      if (result.includes(item.value)) {
        tmpArr.push(item.label)
      }
    })
  } else {
    // 一维数组字符串
    list.forEach((item: any) => {
      if (result.includes(item)) {
        tmpArr.push(item)
      }
    })
  }
  return tmpArr
}

const getLabelName = (result: any[], key: any, type: string) => {
  if (key === 'taskIds') {
    return computedLabelName(result, filterCondition['ruleNameList'])
  }
  if (key === 'status') {
    return computedLabelName(result, INFORMATION_CONTENT_FILTER_STATUS)
  }
  if (key === 'isOriginal') {
    return computedLabelName(result, INFORMATION_CONTENT_FILTER_IS_ORIGINAL)
  }
  if (key === 'brand') {
    return computedLabelName(result, filterCondition['brandList'])
  }
  if (key === 'contentModel') {
    return computedLabelName(result, filterCondition['contentModelList'])
  }
  if (key === 'brandEmotion') {
    return computedLabelName(result, filterCondition['brandEmotionList'])
  }
  if (key === 'modelEmotion') {
    return computedLabelName(result, filterCondition['modelEmotionList'])
  }
  if (key === 'taskStatus') {
    return computedLabelName(result, INFORMATION_CONTENT_FILTER_TASK_STATUS)
  }
  if (key === 'followOrgs') {
    return computedLabelName(result, filterCondition['followOrgsList'])
  }
  if (key === 'serverStatus') {
    return computedLabelName(result, filterCondition['serverStatusList'])
  }
  if (key === 'serverCases') {
    return computedLabelName(result, filterCondition['serverCasesList'])
  }
  if (key === 'followStatus') {
    return computedLabelName(result, filterCondition['followStatusList'])
  }
  if (key === 'followCases') {
    return computedLabelName(result, filterCondition['followCasesList'])
  }
  if (key === 'publicTime') {
    return result && result.length > 0 ? [result.join(' 至 ')] : []
  }
  if (key === 'alarmTime') {
    return result && result.length > 0 ? [result.join(' 至 ')] : []
  }
  if (key === 'sensitivityType') {
    return computedLabelName(result, INFORMATION_CONTENT_FILTER_SENSITIVITY_TYPE)
  }
  if (key === 'sensitivityScore') {
    const tmpResult: any = []
    if (result && result.length > 0) {
      result.forEach((item: any) => {
        if (item || item === 0) {
          tmpResult.push(item)
        }
      })
    }
    return tmpResult && tmpResult.length > 0 ? [result.join(' - ')] : []
  }
  if (key === 'recordOrigin') {
    return computedLabelName(result, INFORMATION_CONTENT_FILTER_RECORD_ORIGIN)
  }
  if (key === 'serverTeam') {
    return computedLabelName(result, INFORMATION_CONTENT_FILTER_SERVER_TEAM)
  }
  if (key === 'followTeam') {
    return computedLabelName(result, INFORMATION_CONTENT_FILTER_FOLLOW_TEAM)
  }
  if (key === 'labels') {
    return computedLabelName(result, filterCondition['labelList'])
  }
}

const deleteFilterTag = (type: string, item: any) => {
  if (type === 'platform') {
    platformRef.value = []
  } else if (type === 'data') {
    dataFilterResult[item] = []
  }
}

const handleClearFilterCondition = () => {
  for (const key in dataFilterResult) {
    dataFilterResult[key] = []
  }
  platformRef.value = []
  getTableData()
}
// 筛选项
const getFilterList = async () => {
  const params: any = {}
  sentimentFilterDim(params).then((res) => {
    if (res) {
      // 数据解析
      const brands: any = []
      const _brands = {
        未知: ['未知']
      }
      if (res.brand) {
        res.brand = { ...res.brand, ..._brands }
        Object.keys(res.brand).forEach((item: any) => {
          brands.push({
            name: item,
            label: item,
            value: item,
            list: res.brand[item] || []
          })
        })
      }
      filterCondition.brandList = brands

      const allModelList = [] as any[]
      brands.forEach((item: any) => {
        allModelList.push(...item.list)
      })
      filterCondition.allModelList = [...new Set(allModelList)].map((item: any) => {
        return {
          name: item,
          label: item,
          value: item
        }
      })

      const brandAlls: any = []
      if (res.all_brand) {
        res.all_brand = { ...res.all_brand, ..._brands }
        Object.keys(res.all_brand).forEach((item: any) => {
          brandAlls.push({
            name: item,
            label: item,
            value: item,
            list: res.all_brand[item] || []
          })
        })
      }
      filterCondition.brandAllList = brandAlls

      filterCondition.commentAllModelList = filterCondition.allModelList
      filterCondition.contentAllModelList = filterCondition.allModelList
      filterCondition.contentModelList = filterCondition.allModelList

      const emotion: any = []
      if (Array.isArray(res.emotion)) {
        res.emotion.push('不明确')
        res.emotion.forEach((item: any) => {
          emotion.push({
            label: item,
            value: item
          })
        })
      }
      filterCondition.brandEmotionList = emotion
      filterCondition.modelEmotionList = emotion

      // const followups = Array.isArray(res.followups)
      //   ? res.followups.map((item: any) => {
      //       return {
      //         label: item,
      //         value: item
      //       }
      //     })
      //   : []
      // filterCondition.PRFollowupList = [
      //   ...followups,
      //   {
      //     label: '空白',
      //     value: '空白'
      //   }
      // ]
      // filterCondition.PRFollowupListCopy = followups
    }
  })

  let res2 = await alarmRecordRuleList({
    type: 'content',
    alarmType: 'sentiment'
  })
  if (res2 && res2.length > 0) {
    res2 = res2.map((item: any) => {
      return {
        label: item.name,
        value: item.id
      }
    })
    filterCondition.ruleNameList = res2
  }

  filterCondition.followOrgsList = ALARM_TASK_FOLLOW_ORG.map((item: any) => {
    return {
      label: item,
      value: item
    }
  })
  filterCondition.serverStatusList = ALARM_TASK_FOLLOW_SERVICE_STATUS.map((item: any) => {
    return {
      label: item,
      value: item
    }
  })
  filterCondition.serverCasesList = ALARM_TASK_FOLLOW_SERVICE_CASE.map((item: any) => {
    return {
      label: item,
      value: item
    }
  })
  filterCondition.followStatusList = ALARM_TASK_FOLLOW_STATUS.map((item: any) => {
    return {
      label: item,
      value: item
    }
  })
  filterCondition.followCasesList = ALARM_TASK_FOLLOW_CASE.map((item: any) => {
    return {
      label: item,
      value: item
    }
  })

  const res = await sentimentLabels({})
  let labelList: any = [{ label: '空', value: 'none' }]
  if (res && res.maintain_all_label && res.maintain_all_label.length > 0) {
    res.maintain_all_label.forEach((item: any) => {
      labelList.push({
        label: item,
        value: item
      })
    })
  }
  filterCondition.labelList = labelList
}

const handleToLink = (link: string) => {
  if (!link) {
    globalProperties.$message.warning('点击链接为空，不能跳转！')
    return
  }
  window.open(link, '_blank', 'noopener=yes,noreferrer=yes')
}

// 品牌查找机型系列
const handleChangeContentBrand = (val: any) => {
  let model: any = []
  if (Array.isArray(val) && val.length) {
    filterCondition.brandList.forEach((item: any) => {
      val.forEach((innerItem: string) => {
        if (item.name === innerItem) {
          model.push(...item.list)
        }
      })
    })
    filterCondition.contentModelList = [...new Set(model)].map((item: any) => {
      return {
        name: item,
        label: item,
        value: item
      }
    })
  } else {
    filterCondition.contentModelList = filterCondition.allModelList
  }
  dataFilterResult.contentModel = []
}

const getCommonParams = () => {
  const params: any = {
    // 排序 DESC-降序 ASC-升序
    ascDesc: page.order,
    orderByColumn: page.sortValue
  }

  // 关键词搜索
  const keywordList = handleGetCompose()
  if (keywordList && keywordList.length > 0) {
    params.searchGroups = keywordList
  }
  // 平台
  if (platformRef.value && platformRef.value.length > 0) {
    params.capturewebsite = platformRef.value
  }
  if (dataFilterResult.taskIds && dataFilterResult.taskIds.length > 0) {
    params.alarmRuleIds = dataFilterResult.taskIds
  }
  if (dataFilterResult.status && dataFilterResult.status.length > 0) {
    params.status = dataFilterResult.status
  }
  if (dataFilterResult.isOriginal && dataFilterResult.isOriginal.length > 0) {
    params.isOriginal = dataFilterResult.isOriginal
  }
  if (dataFilterResult.brand && dataFilterResult.brand.length > 0) {
    params.contentBrand = dataFilterResult.brand
  }
  if (dataFilterResult.contentModel && dataFilterResult.contentModel.length > 0) {
    params.contentPhone = dataFilterResult.contentModel
  }
  if (dataFilterResult.brandEmotion && dataFilterResult.brandEmotion.length > 0) {
    params.contentBrandEmotions = dataFilterResult.brandEmotion
  }
  if (dataFilterResult.modelEmotion && dataFilterResult.modelEmotion.length > 0) {
    params.contentPhoneEmotions = dataFilterResult.modelEmotion
  }
  if (dataFilterResult.taskStatus && dataFilterResult.taskStatus.length > 0) {
    params.taskStatus = dataFilterResult.taskStatus
  }
  if (dataFilterResult.followOrgs && dataFilterResult.followOrgs.length > 0) {
    params.followOrgs = dataFilterResult.followOrgs
  }
  if (dataFilterResult.serverStatus && dataFilterResult.serverStatus.length > 0) {
    params.serverStatus = dataFilterResult.serverStatus
  }
  if (dataFilterResult.serverCases && dataFilterResult.serverCases.length > 0) {
    params.serverCases = dataFilterResult.serverCases
  }
  if (dataFilterResult.followStatus && dataFilterResult.followStatus.length > 0) {
    params.followStatus = dataFilterResult.followStatus
  }
  if (dataFilterResult.followCases && dataFilterResult.followCases.length > 0) {
    params.followCases = dataFilterResult.followCases
  }
  if (dataFilterResult.publicTime && dataFilterResult.publicTime.length > 0) {
    params.contentPublishTimeFrom = dataFilterResult.publicTime[0]
    params.contentPublishTimeTo = dataFilterResult.publicTime[1]
  }
  if (dataFilterResult.alarmTime && dataFilterResult.alarmTime.length > 0) {
    params.alarmTimeFrom = dataFilterResult.alarmTime[0]
    params.alarmTimeTo = dataFilterResult.alarmTime[1]
  }
  if (dataFilterResult.sensitivityType && dataFilterResult.sensitivityType.length > 0) {
    params.sensitivityType = dataFilterResult.sensitivityType
  }
  if (dataFilterResult.sensitivityScore && dataFilterResult.sensitivityScore.length > 0) {
    const result = dataFilterResult.sensitivityScore
    const tmpResult: any = []
    if (result && result.length > 0) {
      result.forEach((item: any) => {
        if (item || item === 0) {
          tmpResult.push(item)
        }
      })
    }
    if (tmpResult.length > 0) {
      params.sensitivityScore = `${dataFilterResult.sensitivityScore[0]}_${dataFilterResult.sensitivityScore[1] || ''}`
    }
  }
  if (dataFilterResult.recordOrigin && dataFilterResult.recordOrigin.length > 0) {
    params.recordOrigin = dataFilterResult.recordOrigin
  }
  if (dataFilterResult.serverTeam && dataFilterResult.serverTeam.length > 0) {
    params.serverTeam = dataFilterResult.serverTeam
  }
  if (dataFilterResult.followTeam && dataFilterResult.followTeam.length > 0) {
    params.followTeam = dataFilterResult.followTeam
  }
  if (dataFilterResult.labels && dataFilterResult.labels.length > 0) {
    params.labels = dataFilterResult.labels
  }

  return params
}

const handleToDownload = () => {
  page.loading = true

  const params = getCommonParams() as any
  // 默认下载排序 内容评论量 降序
  if (!params.ascDesc) {
    params.ascDesc = 'DESC'
    params.orderByColumn = 'content_commentcnt'
  }

  params.download = true
  params.totalRecords = page.pageTotal

  sentimentDownload(params)
    .then((blob: Blob) => {
      if (blob instanceof Blob) {
        const blobUrl = URL.createObjectURL(blob)
        customDownload(blobUrl, '舆情维护Excel.xlsx')
      }
    })
    .finally(() => {
      page.loading = false
    })
}
const getTableData = async () => {
  page.loading = true

  const params = getCommonParams() as any
  params.pageSize = page.pageSize
  params.pageNumber = page.pageNumber

  const res = await sentimentPage(params)
  if (res && res.data && res.data.length > 0) {
    res.data.forEach((item: any) => {
      // 机型情感处理
      const brandEmotions: any = []
      const phoneEmotions: any = []
      if (item.brandInfo && item.brandInfo.length > 0) {
        item.brandInfo.forEach((brandItem: any) => {
          if (brandItem.last_brandemotion && !brandEmotions.includes(brandItem.last_brandemotion)) {
            brandEmotions.push(brandItem.last_brandemotion)
          }
          if (brandItem.last_phoneemotion && !phoneEmotions.includes(brandItem.last_phoneemotion)) {
            phoneEmotions.push(brandItem.last_phoneemotion)
          }
        })
      }
      item.brandEmotions = brandEmotions
      item.phoneEmotions = phoneEmotions

      item.taskStatus = item.taskStatus || '待跟进'
      item.followOrg = item.followOrg || '待分配'
      item.serverStatus = item.serverStatus || '待处理'
      item.serverCase = item.serverCase || '待选择'
      item.followStatus = item.followStatus || '待处理'
      item.followCase = item.followCase || '待选择'
      item.serverTeam = !item.serverTeam || item.serverTeam === 'follow_team' ? '待选择' : item.serverTeam
      item.followTeam = !item.followTeam || item.followTeam === 'server_team' ? '待选择' : item.followTeam

      item.contentTypes = item.contentType ? item.contentType.split(',') : []
      item.contentAuthorTags = item.contentAuthorTag ? item.contentAuthorTag.split(',') : []
      // 错误图片处理
      item.srcError = CONTENT_DEFAULT_IMAGE_MAP[item.platform] || otherError
    })
    page.tableData = res.data
    page.pageTotal = res.totalRecords

    if (page.isChangePaged) {
      page.isChangePaged = false

      nextTick(() => {
        let tmpTop = 0
        const firstRow: any = document.querySelector('.custom-total-top-scroll')
        if (firstRow) {
          tmpTop = firstRow.offsetTop - 64
        }
        window.scrollTo({
          left: 0,
          top: tmpTop,
          behavior: 'smooth'
        })
      })
    }
  } else {
    page.tableData = []
    page.pageTotal = 0
  }
  setTimeout(() => {
    page.loading = false
  }, 300)
}
const handleChangeFilter = () => {
  page.pageNumber = 1
  getTableData()
}

const handleSizeChange = (val: number) => {
  page.pageSize = val
  getTableData()
}
const handlePageChange = (val: number) => {
  page.pageNumber = val
  page.isChangePaged = true
  getTableData()
  // nextTick(() => {
  //   tableRef.value?.scrollTo(0, 0)
  // })
}

// badcase 提报/修正
const handleEditBadCase = (row: any) => {
  const { platform, matchId } = row
  page.badItem = {
    platform,
    commentId: matchId,
    type: 'content',
    ...row
  }
  page.dialogVisible = true
}
const handleCloseBadCaseDialog = (tag: boolean) => {
  page.dialogVisible = false
  if (tag) {
    getTableData()
  }
}

//修改排序
const handleChangeSort = (item: any) => {
  // 清空自定义排序状态
  page.customSortBy = ''

  if (item.order) {
    page.sortValue = item.prop
    page.order = item.order === 'descending' ? 'DESC' : 'ASC'
  } else {
    page.sortValue = ''
    page.order = ''
  }
  page.pageNumber = 1
  getTableData()
}
const handleChangeCustomSort = () => {
  if (page.customSortBy) {
    page.sortValue = page.customSort
    page.order = page.customSortBy
    getTableData()
  }
}
const handleCustomSort = (order: string) => {
  if (order === page.customSortBy) {
    tableRef.value?.clearSort()
    page.sortValue = ''
    page.order = ''
    page.customSortBy = ''
    getTableData()
  } else {
    tableRef.value?.clearSort()
    page.sortValue = page.customSort
    page.order = order
    page.customSortBy = order
    getTableData()
  }
}
const handleCopyTxt = async (txt: string) => {
  try {
    await toClipboard(txt)
    globalProperties.$message({
      message: '复制成功',
      type: 'success'
    })
  } catch (e) {
    console.error(e)
  }
}

const handleToCommentDetailList = (type: string, row: any) => {
  let queryParams: any = {
    platforms: row.platform,
    from: 'content',
    searchType: 'contentId',
    keywords: row.matchId,
    commentBrand: row.contentBrandemotion.split('-')[0],
    commentBrandEmotions: '负向'
  }
  if (type === 'global_hotnegativecnt') {
    // queryParams.maincommentRk = 0
    queryParams.maincommentCnt = true
  } else if (type === 'relative_hotnegativecnt') {
    // queryParams.samebrandCommentrk = 0
    queryParams.samebrandCommentcnt = true
  } else if (type === 'contentId') {
    ;(queryParams.commentBrand = ''), (queryParams.commentBrandEmotions = '')
  }
  const queryStr = objectToQueryString(queryParams)
  window.open('/information/opinion/comment?' + queryStr, '_blank', 'noopener=yes,noreferrer=yes')
}

// 用于计算左右侧输入值
const handleSetValue = (target: any[]) => {
  if (target.length === 2) {
    if (target[0] === '') {
      target[0] = 0
    }
    if (Number(target[0]) > Number(target[1])) {
      target[0] = target[1]
    }
  } else {
    if (target[0] === '') {
      target[0] = 0
    }
  }
}

// 用于计算左右侧输入值最小值0 最大值100
const handleMinMaxValue = (target: any[], type = '') => {
  if (target.length === 2) {
    if ((target[0] === '' || target[0] < 0) && type !== 'negative_infinity') {
      target[0] = 0
    }
    if (target[1] > 100) {
      target[1] = 100
    }
    if (Number(target[0]) > Number(target[1])) {
      target[0] = target[1]
    }
    if (type === 'negative_infinity') {
      if (Number(target[0]) < -100) {
        target[0] = -100
      }
      if (Number(target[0]) > Number(target[1])) {
        target[0] = target[1]
      }
    }
  } else {
    if (target[0] === '') {
      target[0] = 0
    }
    if (type === 'negative_infinity') {
      if (Number(target[0]) < -100) {
        target[0] = -100
      }
    } else {
      if (Number(target[0]) > 100) {
        target[0] = 100
      }
    }
  }
}

// 关键词组合条件
const handleGetCompose = (type = 1) => {
  if (type === 1) {
    return composeFilterRef?.value?.handleGetFilterContent()
  }
  if (type === 2) {
    return composeFilterRef?.value?.handleGetFilterContent2()
  }
  return null
}
const handleSetCompose = (res: any) => {
  const composeItem =
    res && res.composeItem && res.composeItem.length > 0 ? JSON.parse(JSON.stringify(res.composeItem)) : []

  composeFilterRef?.value?.handleSetComposeList({
    composeId: res?.composeId || '',
    composeName: res?.composeName || '',
    composeItem: composeItem
  })
}

const handleGetFilterCondition = () => {
  const params: any = {
    platformList: platformRef.value,
    dataFilterResult
  }

  // 处理关键词组合
  const compose = handleGetCompose(2)
  if (compose && compose.composeItem && compose.composeItem.length > 0) {
    params.compose = compose
  }

  return params
}
const handleSetFilterCondition = (res: any) => {
  if (res.dataFilterResult) {
    for (const key in res.dataFilterResult) {
      dataFilterResult[key] = res.dataFilterResult[key]
    }
  }

  if (res.platformList) {
    const platformOther: any = []
    res.platformList.forEach((item: any) => {
      platformOther.push(item)
    })
    platformRef.value = platformOther
  }

  // 加入排序
  if (res.orderByColumn && res.orderByAscDesc) {
    page.sortValue = res.orderByColumn
    page.order = res.orderByAscDesc
  }
}

// 筛选条件模板
const handleSaveFilterCondition = (type = '') => {
  // 方案不能超过100个
  const templateList = templateFilterRef?.value?.handleGetTemplateList()
  if (
    templateList &&
    templateList.length >= 100 &&
    ((type === 'save' && !page.filterTemplateConditionOrigin.templateId) || type === 'copy')
  ) {
    globalProperties.$message.error('当前检索方案已经100个，请删除后再新增!')
    return
  }
  const paramsCondition: any = JSON.parse(JSON.stringify(handleGetFilterCondition()))
  delete paramsCondition.dataFilterResult.publicTime
  delete paramsCondition.dataFilterResult.alarmTime

  // 处理关键词组合
  let searchLabel = ''
  const compose = paramsCondition.compose
  if (compose && compose.composeItem && compose.composeItem.length > 0) {
    const tmpArr: any = []
    compose.composeItem.forEach((item: any) => {
      tmpArr.push(...item.words)
    })
    searchLabel = tmpArr.join('，')
  }

  const filterCondition: any = [
    {
      name: '平台',
      type: 'platform',
      key: '',
      list: getPlatformName.value,
      deleteKeyList: '',
      deleteKeyListValue: []
    },
    {
      name: '搜索关键词',
      type: 'search',
      key: '',
      list: searchLabel ? [searchLabel] : [],
      deleteKeyList: '',
      deleteKeyListValue: []
    }
  ]

  Object.keys(dataFilterResult).forEach((key: any) => {
    // 排除数据
    if (!['publicTime', 'alarmTime'].includes(key)) {
      filterCondition.push({
        name: dataFilterMap[key],
        type: 'data',
        key: key,
        list: getLabelName(dataFilterResult[key], key, 'data'),
        deleteKeyList: 'dataFilterResult',
        deleteKeyListValue: []
      })
    }
  })

  const tmpCondition: any = {
    templateId: page.filterTemplateConditionOrigin?.id || '',
    templateName: page.filterTemplateConditionOrigin?.name || '',
    templateTime: page.filterTemplateConditionOrigin?.templateCondition?.templateTime || '',
    filterCondition: filterCondition,
    paramsCondition: paramsCondition,
    dialogType: type
  }
  if (type === 'copy') {
    tmpCondition.templateId = ''
  }
  page.filterTemplateCondition = tmpCondition
  page.dialogVisibleFilter = true
}
const handleCloseDialogFilter = (item: any) => {
  page.filterTemplateCondition = {}
  page.dialogVisibleFilter = false
  if (item) {
    // page.refreshFilterTemplate = true
    // 更新方案列表
    templateFilterRef?.value?.handleSetTemplateList(item)
  }
}

const handleChangeTemplateId = (item: any) => {
  page.filterTemplateConditionOrigin = item || {}

  const timeDefault = [
    globalProperties.$dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss'),
    globalProperties.$dayjs().format('YYYY-MM-DD HH:mm:ss')
  ]

  if (item) {
    // 处理时间
    if (item.templateCondition && item.templateCondition.templateTime) {
      const alarmTime = timeScopeObj[item.templateCondition.templateTime]
      if (alarmTime) {
        item.content.dataFilterResult.alarmTime = alarmTime()
      } else {
        // 默认时间
        item.content.dataFilterResult.alarmTime = timeDefault
      }
    }

    handleSetFilterCondition(item.content)
  } else {
    // 复原-初始化
    platformRef.value = []

    Object.keys(dataFilterResult).forEach((key: any) => {
      deleteFilterTag('data', key)
    })
  }

  // 关键词复原
  const compose = item && item.content && item.content.compose ? item.content.compose : ''
  handleSetCompose(compose)

  getTableData()
}

// // 多关键词添加
// const handleChangeSearchType = (val: any) => {
//   if (val !== 'contentTitle') {
//     page.keywordsTagList.length = 0
//   }
// }
// const handleAddKeyword = () => {
//   const keyword = page.keywords.trim()
//   if (keyword) {
//     page.keywordsTagList.push(keyword)
//   }
//   page.keywords = ''
// }
// const handleDeleteKeyword = (index: number) => {
//   page.keywordsTagList.splice(index, 1)
// }

// // 扩展外部跳转过来的
// const getFilterFromOuter = async () => {
//   // 包括日期范围、渠道、品牌、机型、互动降序
//   const {
//     publicStartTime,
//     publicEndTime,
//     platform,
//     contentBrand,
//     contentModel,
//     contentModelEmotion,
//     contentModelOtherEmotion,
//     orderByColumn,
//     orderByAscDesc
//   } = route.query as any

//   if (publicStartTime && publicEndTime) {
//     contentFilterResult.publicTime = [publicStartTime, publicEndTime]
//   }
//   // 品牌
//   if (contentBrand) {
//     const contentBrands = contentBrand.split(',')
//     if (contentBrands.length > 0) {
//       contentFilterResult.brand = contentBrands
//     }
//   }
//   // 机型
//   if (contentModel) {
//     const contentModels = contentModel.split(',')
//     if (contentModels.length > 0) {
//       contentFilterResult.contentModel = contentModels
//     }
//   }
//   // 机型情感
//   if (contentModelEmotion) {
//     const contentModelEmotions = contentModelEmotion.split(',')
//     if (contentModelEmotions.length > 0) {
//       contentFilterResult.modelEmotion = contentModelEmotions
//     }
//   }
//   // 其他机型情感
//   if (contentModelOtherEmotion) {
//     const contentModelOtherEmotions = contentModelOtherEmotion.split(',')
//     if (contentModelOtherEmotions.length > 0) {
//       contentFilterResult.otherModelEmotion = contentModelOtherEmotions
//     }
//   }
//   // 渠道
//   if (platform) {
//     const platforms = platform.split(',')
//     if (platforms.length > 0) {
//       const cores = platformFilterResult.platformList.map((item: any) => item.label)
//       const platformCore: any = []
//       const platformOther: any = []
//       for (let i = 0; i < platforms.length; i++) {
//         const platformsName = platforms[i]
//         if (cores.includes(platformsName)) {
//           // 核心渠道
//           platformCore.push(platformsName)
//         } else {
//           platformOther.push(platformsName)
//         }
//       }

//       if (platformCore.length > 0) {
//         platformFilterResult.platformList.forEach((item: any) => {
//           if (platformCore.includes(item.label)) {
//             item.checked = true
//           } else {
//             item.checked = false
//           }
//         })
//       }

//       platformRef.value = platformOther
//     }
//   } else {
//     // 如果没传都不选中
//     platformFilterResult.platformList.forEach((item: any) => {
//       item.checked = false
//     })
//     platformRef.value = []
//   }

//   // 排序
//   if (orderByColumn && orderByAscDesc) {
//     page.sortValue = orderByColumn
//     page.order = orderByAscDesc

//     // 下拉排序
//     const customSortList = CUSTOM_SORT_LIST.map((item: any) => item.value)
//     if (customSortList.includes(orderByColumn)) {
//       page.customSort = orderByColumn
//       page.customSortBy = orderByAscDesc

//       getTableData()
//     } else {
//       // 手动触发排序
//       const orderStr = orderByAscDesc === 'DESC' ? 'descending' : 'ascending'
//       // 动态数据，需要nextTick执行完了才能生效
//       await nextTick()
//       tableRef.value?.sort(page.sortValue, orderStr)
//     }
//   } else {
//     getTableData()
//   }
// }

// 组合关键词
// const handleOpenCompose = () => {
//   page.composeVisible = true
// }
// const handleCloseCompose = (type: boolean) => {
//   page.currentObj = {}
//   page.composeVisible = false
//   if (type) {
//     page.tableData[page.followupIndex].followup = type
//     // getTableData()
//     // getFilterList()
//   }
// }

// 批量操作
const handleSelectionChange = (val: any[]) => {
  page.multipleSelection = val
}
const handleToBatch = () => {
  page.dialogVisibleBatch = true
}
const handleCloseDialogBatch = () => {
  page.dialogVisibleBatch = false
}
const handleSubmitDialogBatch = (item: any) => {
  const alarmRecordIds: any = []
  for (let i = 0; i < page.multipleSelection.length; i++) {
    if (!page.multipleSelection[i].alarmRecordId) {
      globalProperties.$message.warning('操作成功')
      return
    }
    alarmRecordIds.push(page.multipleSelection[i].alarmRecordId)
  }
  const params: any = {
    alarmRecordIds: alarmRecordIds
  }

  if (item.taskStatus) {
    params.taskStatus = item.taskStatus
  }
  if (item.taskRemark) {
    params.taskStatusRemark = item.taskRemark
  }
  if (item.followOrg) {
    params.followOrg = item.followOrg
  }
  if (item.orgRemark) {
    params.orgRemark = item.orgRemark
  }
  if (item.serverStatus) {
    params.serverStatus = item.serverStatus
  }
  if (item.serverCase && item.serverStatus === '已处理') {
    params.serverCase = item.serverCase
  }
  if (item.serverRemark) {
    params.serverRemark = item.serverRemark
  }
  if (item.followStatus) {
    params.followStatus = item.followStatus
  }
  if (item.followCase && item.followStatus === '已处理') {
    params.followCase = item.followCase
  }
  if (item.followRemark) {
    params.followRemark = item.followRemark
  }
  if (item.allLabels.length > 0) {
    params.labels = item.allLabels
  }
  sentimentBatchEdit(params).then((res: any) => {
    if (res) {
      globalProperties.$message.success('操作成功')
      handleCloseDialogBatch()
      getTableData()
    }
  })
}

// type 1 跟进部门 2 跟进部门备注 3 服务跟进状态 4 服务处理方案 5 服务跟进备注 6 公关处理状态 7 公关处理方案 8 公关跟进备注 9 服务部门协作 10 公关部门协作 11 任务状态 12任务状态备注
const handleChangeOrg = (val: any, row: any, index: number, type = 1) => {
  const params: any = {
    alarmRecordIds: [row.alarmRecordId]
  }
  if (type === 1) {
    params.followOrg = val
  } else if (type === 2) {
    params.orgRemark = val
  } else if (type === 3) {
    params.serverStatus = val
  } else if (type === 4) {
    params.serverCase = val
  } else if (type === 5) {
    params.serverRemark = val
  } else if (type === 6) {
    params.followStatus = val
  } else if (type === 7) {
    params.followCase = val
  } else if (type === 8) {
    params.followRemark = val
  } else if (type === 9) {
    params.serverTeam = val
  } else if (type === 10) {
    params.followTeam = val
  } else if (type === 11) {
    params.taskStatus = val
  } else if (type === 12) {
    params.taskStatusRemark = val
  } else {
    globalProperties.$message.success('类型错误')
    return
  }

  sentimentBatchEdit(params).then((res: any) => {
    if (res) {
      globalProperties.$message.success('操作成功')

      // 更新列表
      if (type === 2) {
        page.tableData[index].orgRemark = val
        handleCloseFollowupDialog()
      } else if (type === 5) {
        page.tableData[index].serverRemark = val
        handleCloseFollowupDialog()
      } else if (type === 8) {
        page.tableData[index].followRemark = val
        handleCloseFollowupDialog()
      } else if (type === 12) {
        page.tableData[index].taskStatusRemark = val
        handleCloseFollowupDialog()
      } else {
        getTableData()
      }
    }
  })
}

// 备注修改
const handleFollowup = (row: any, index: number, type = 2) => {
  let mark = ''
  if (type === 2) {
    mark = row.orgRemark
  } else if (type === 5) {
    mark = row.serverRemark
  } else if (type === 12) {
    mark = row.taskStatusRemark
  } else {
    mark = row.followRemark
  }
  page.currentObj = {
    followIndex: index,
    followType: type,
    followMark: mark,
    platform: row.platform,
    commentId: row.matchId,
    type: 'content',
    ...row
  }
  page.followupVisible = true
}
const handleCloseFollowupDialog = () => {
  page.currentObj = {}
  page.followupVisible = false
}
const handleChangeFollowup = (val: any, row: any) => {
  handleChangeOrg(val, row, row.followIndex, row.followType)
}
// label
const handleLabel = (row: any, index: number) => {
  page.currentObj = {
    followIndex: index,
    platform: row.platform,
    commentId: row.matchId,
    type: 'content',
    ...row
  }
  page.labelVisible = true
}
const handleCloseLabelDialog = () => {
  page.currentObj = {}
  page.labelVisible = false
}
const handleChangeLabel = (item: any) => {
  const params: any = {
    alarmRecordIds: [item.alarmRecordId],
    labels: item.allLabels
  }
  sentimentBatchEdit(params).then((res: any) => {
    if (res) {
      globalProperties.$message.success('操作成功')
      handleCloseLabelDialog()
      getTableData()
    }
  })
}

// import
const handleToImport = () => {
  page.isShowDialogImport = true
}
const handleCloseDialogImport = () => {
  page.isShowDialogImport = false
}

// delete tag
const handleDeleteTag = (tagIndex: any, row: any) => {
  const restLabel = [...row.labels]
  restLabel.splice(tagIndex, 1)
  const params: any = {
    alarmRecordId: row.alarmRecordId,
    labels: restLabel
  }
  sentimentUpdateLabels(params).then((res: any) => {
    if (res) {
      row.labels.splice(tagIndex, 1)
      globalProperties.$message.success('操作成功')
    }
  })
}

// 查看详情
const handleToDetail = (item: any, type = 'first') => {
  page.detailObj = {
    contentId: item.matchId,
    platform: item.platform,
    publishTime: item.contentPublishTime,
    alarmRecordId: item.alarmRecordId,
    activeTab: type
  }
  page.detailDrawerVisible = true
}
const handleCloseDetail = () => {
  page.detailObj = {}
  page.detailDrawerVisible = false
}

// // 最近更新时间
// const getLastTime = async () => {
//   const params: any = {}
//   contentOpinionLastTime(params).then((res) => {
//     if (res) {
//       page.updateTime = res
//     }
//   })
// }

const getLeftValue = (arr: any[]) => {
  if (!arr[0]) {
    arr[0] = 0
  }
}

// 跟新url query参数
const updateParam = (shareId: string | number) => {
  // 获取当前 URL 的参数
  const currentParam = route.query.myParam

  // 使用 `push` 方法更新 URL 参数
  router.push({
    query: {
      ...route.query,
      shareId
    }
  })
}
// 分享
const getShareLink = () => {
  const params: any = handleGetFilterCondition()
  // 加入排序
  if (page.sortValue && page.order) {
    params.orderByColumn = page.sortValue
    params.orderByAscDesc = page.order
  }
  saveFilterParams(params).then(async (res) => {
    if (res && res.key) {
      const currentURL = window.location.href.split('?')[0]
      updateParam(res.key)
      try {
        await toClipboard(currentURL + '?shareId=' + res.key)
        globalProperties.$message({
          message: '分享链接已复制到粘贴板',
          type: 'success'
        })
      } catch (e) {
        console.error(e)
      }
    }
  })
}
const handleToShareOuter = () => {
  // 如果非开发就不能用
  if (!['martech.oppoer.me', 'martech.heytap.com'].includes(window.location.hostname)) {
    globalProperties.$message({
      message: '请在生产环境使用',
      type: 'warning'
    })
    return
  }

  const params: any = handleGetFilterCondition()
  // 加入排序
  if (page.sortValue && page.order) {
    params.orderByColumn = page.sortValue
    params.orderByAscDesc = page.order
  }
  saveFilterParams(params).then(async (res) => {
    if (res && res.key) {
      let currentURL = window.location.href.split('?')[0]
      // updateParam(res.key)
      currentURL = currentURL.replace('martech.oppoer.me', 'martech.heytap.com')
      try {
        const copyUrl = currentURL + '?shareId=' + res.key
        await toClipboard(copyUrl)
        globalProperties.$message({
          message: '分享链接已复制到粘贴板',
          type: 'success'
        })
      } catch (e) {
        console.error(e)
      }
    }
  })
}

const getFilterFromId = (id: number | string) => {
  getFilterParams(id).then((res) => {
    if (res) {
      handleSetFilterCondition(res)

      // 处理关键词组合
      const compose = res && res.compose ? res.compose : ''
      handleSetCompose(compose)
      // // 以图搜索
      // if (res.imageList?.length) {
      //   handleSetImageParams(res.imageSimilarity, res.imageList)
      // }

      // 默认排序
      if (page.sortValue && page.order) {
        // 下拉排序
        const customSortList = CUSTOM_SORT_LIST.map((item: any) => item.value)
        if (customSortList.includes(page.sortValue)) {
          page.customSort = page.sortValue
          page.customSortBy = page.order

          getTableData()
        } else {
          // 手动触发排序
          const orderStr = page.order === 'DESC' ? 'descending' : 'ascending'
          tableRef.value?.sort(page.sortValue, orderStr)
        }
      } else {
        getTableData()
      }
    }
  })
}

watch(
  () => dataFilterResult.brand,
  (val) => {
    if (!val.length) {
      filterCondition.contentModelList = filterCondition.commentAllModelList
    }
  }
)

onMounted(async () => {
  await getFilterList()
  const { shareId, from } = route.query as { shareId?: string | number; from?: string }
  if (shareId) {
    getFilterFromId(shareId)
  } else if (from === 'outer') {
    // getFilterFromOuter()
  } else {
    getTableData()
  }
})
</script>

<style lang="scss" scoped>
.custom-filter {
  padding: 15px 20px;
  border-bottom: 1px solid #f0f2f8;

  h3 {
    width: 70px;
    text-align: right;
    font-size: 14px;
  }
}

.custom-border-right {
  border-right: 1px solid #ebecf1;
}

.sort-button {
  margin-left: 5px;
  height: 20px;
  display: flex;
  flex-direction: column;

  svg {
    color: #808291;
    align-items: flex-start;
    cursor: pointer;
  }
}

.condition-filter {
  white-space: nowrap;
  cursor: pointer;
  color: $custom-color-primary;
}

.smc-copy {
  color: $custom-color-primary;
}

.custom-select-color {
  color: #2c7bff !important;
}

.no-wrap {
  white-space: nowrap;
}
.desc {
  align-self: flex-start;
  color: $custom-color-primary;
  cursor: pointer;
}

.custom-platform-tag {
  padding: 5px 10px;
  background: #dff4fd;
  border-radius: 4px;
  margin-right: 5px;
  cursor: pointer;
}

.excel-box {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: $custom-color-success;
  padding: 5px;
  // border: 1px solid $custom-color-success;
  border-radius: 8px;

  img {
    width: 25px;
    height: 25px;
  }
}

// 表格信息
.custom-row-top {
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}
.custom-row-content {
  display: flex;
  // padding-bottom: 10px;
  // min-height: 363px;

  .custom-row-content-left {
    position: relative;
    flex: 1;
    border-right: 1px solid #eee;
    padding-right: 15px;
    overflow: hidden;
  }
  .custom-row-content-right {
    position: relative;
    width: 400px;
    padding-left: 15px;

    .custom-handle-user {
      width: 370px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: absolute;
      bottom: 0;
      left: 15px;
      margin-top: 15px;
    }
  }

  .desc {
    align-self: flex-start;
    color: $custom-color-primary;
    cursor: pointer;
  }

  .time {
    font-size: 12px;
    color: #999;

    svg {
      margin-left: 2px;
      font-size: 14px;
      margin-right: 3px;
    }
  }
}

.icon-arrow {
  margin-left: 5px;
  font-size: 12px;
}

.custom-comment-box {
  flex: 1;
  display: flex;
  // width: calc(100vw - 330px);
  flex-wrap: wrap;
  align-items: center;
}

.custom-filter-box {
  border: 1px solid $custom-color-primary;
  border-radius: 8px;
  padding: 5px 10px;
  color: $custom-color-primary;
  cursor: pointer;
  font-size: 12px;
  // word-break: keep-all;
  // white-space: nowrap;
}

:deep(.#{$namespace}-table__empty-block) {
  height: 250px !important;
  border: none;
}

:deep(.#{$namespace}-input-group__append) {
  padding: 0px;
}

:deep(.#{$namespace}-tag) {
  white-space: normal;
  height: auto;
  line-height: 16px;
  // padding: 5px;
}

:deep(.#{$namespace}-table__body) td.#{$namespace}-table__cell.custom-cell-class {
  vertical-align: top;
  padding-top: 50px;
}
</style>
