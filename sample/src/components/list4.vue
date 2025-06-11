<template>
  <div class="common-content">
    <div class="flex-between" style="padding: 20px 20px 0 20px">
      <div class="flex-row">
        <h1>内容实时舆情</h1>
        <span class="ml15">数据更新至：{{ page.updateTime || '--' }}</span>
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
      <div class="flex-row">
        <div class="flex-row" style="flex: 1">
          <h3 class="mr20">平台筛选</h3>
          <el-check-tag
            class="mr10"
            :checked="item.checked"
            v-for="(item, index) in platformFilterResult.platformList"
            :key="index"
            @click="changePlatformChecked(index)"
            >{{ item.label }}</el-check-tag
          >
          <CommonFilterPopover v-model="platformRef" :modelList="platformList">
            <el-check-tag class="mr10" :checked="platformRef.length ? true : false"
              >+{{ platformRef.length }}渠道</el-check-tag
            >
          </CommonFilterPopover>
        </div>
        <el-button
          type="primary"
          link
          class="custom-compose-expanded"
          @click="page.expandedFilter = !page.expandedFilter"
          >{{ page.expandedFilter ? '收起筛选' : '展开筛选' }}</el-button
        >
      </div>
      <div v-show="page.expandedFilter">
        <!-- <el-divider style="margin: 0" /> -->
        <div class="flex-row mt15">
          <div class="flex-row">
            <h3 class="mr20">基础筛选</h3>
            <div class="custom-comment-box">
              <!--发布时间-->
              <div class="flex-row mr15 mt5">
                <span class="custom-primary-color">发布时间：</span>
                <el-date-picker
                  v-model="contentFilterResult.publicTime"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  type="datetimerange"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  :default-time="[new Date(0, 0, 0, 0, 0, 0), new Date(0, 0, 0, 23, 59, 59)]"
                  size="small"
                  :disabled-date="dateOptions"
                  :clearable="false"
                  style="width: 325px"
                  :shortcuts="shortcuts"
                />
              </div>

              <div class="flex-row mr15 mt5">
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
              <!-- 内容来源 -->
              <div class="flex-row mr15 mt5">
                <CommonPopoverCheckbox
                  v-model="dataFilterResult.origins"
                  :modelList="INFORMATION_CONTENT_FILTER_ORIGINS"
                  :width="200"
                >
                  <el-button link :type="dataFilterResult.origins.length ? 'primary' : ''">
                    内容来源
                    <svg-icon name="smc-arrow-down" className="icon-arrow" />
                  </el-button>
                </CommonPopoverCheckbox>
              </div>

              <div class="flex-row mr15 mt5">
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

              <div class="flex-row mr15 mt5">
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
                      :type="
                        dataFilterResult.sensitivityType.length || computedSensitivityScore.length ? 'primary' : ''
                      "
                    >
                      供应商敏感性判定
                      <svg-icon name="smc-arrow-down" className="icon-arrow" />
                    </el-button>
                  </template>
                </el-popover>
              </div>

              <div class="flex-row mr15 mt5">
                <el-popover placement="bottom" :width="300" trigger="click">
                  <div class="flex-between">
                    <span class="mr5"> 相似内容数 </span>
                    <el-input
                      v-model="dataFilterResult.similarityNum[0]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      oninput="value=value.replace(/[^0-9]/g,'')"
                      type="number"
                    />
                    <span class="ml5 mr5">-</span>
                    <el-input
                      v-model="dataFilterResult.similarityNum[1]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      oninput="value=value.replace(/[^0-9]/g,'')"
                      @focus="getLeftValue(dataFilterResult.similarityNum)"
                      type="number"
                    />
                  </div>
                  <template #reference>
                    <el-button link :type="dataFilterResult.similarityNum.length ? 'primary' : ''">
                      相似内容数
                      <svg-icon name="smc-arrow-down" className="icon-arrow" />
                    </el-button>
                  </template>
                </el-popover>
              </div>

              <div class="flex-row mr15 mt5">
                <el-popover placement="bottom" :width="265" trigger="click">
                  <div class="flex-between">
                    <span class="mr5"> 省份 </span>
                    <el-select
                      v-model="dataFilterResult.publishProvinces"
                      class="w-200"
                      size="small"
                      placeholder="请选择"
                      :teleported="false"
                      clearable
                      multiple
                      collapse-tags
                      collapse-tags-tooltip
                      filterable
                    >
                      <el-option
                        v-for="(item, index) in filterCondition.provinceList"
                        :key="index"
                        :value="item"
                        :label="item"
                      />
                    </el-select>
                  </div>
                  <div class="flex-between mt10">
                    <span class="mr5"> 城市 </span>
                    <el-select
                      v-model="dataFilterResult.publishCitys"
                      class="w-200"
                      size="small"
                      placeholder="请选择"
                      :teleported="false"
                      clearable
                      multiple
                      collapse-tags
                      collapse-tags-tooltip
                      filterable
                    >
                      <el-option
                        v-for="(item, index) in filterCondition.publishCityList"
                        :key="index"
                        :value="item"
                        :label="item"
                      />
                    </el-select>
                  </div>
                  <template #reference>
                    <el-button
                      link
                      :type="
                        dataFilterResult.publishProvinces.length || dataFilterResult.publishCitys.length
                          ? 'primary'
                          : ''
                      "
                    >
                      内容发布者省市
                      <svg-icon name="smc-arrow-down" className="icon-arrow" />
                    </el-button>
                  </template>
                </el-popover>
              </div>

              <div class="flex-row mr15 mt5">
                <el-popover placement="bottom" :width="265" trigger="click">
                  <div class="flex-between">
                    <span class="mr5"> 品牌 </span>
                    <el-select
                      v-model="dataFilterResult.nlpBrands"
                      class="w-200"
                      size="small"
                      placeholder="请选择"
                      :teleported="false"
                      clearable
                      multiple
                      collapse-tags
                      collapse-tags-tooltip
                      filterable
                    >
                      <el-option
                        v-for="(item, index) in filterCondition.brandList"
                        :key="index"
                        :value="item.value"
                        :label="item.label"
                      />
                    </el-select>
                  </div>
                  <div class="flex-between mt10">
                    <span class="mr5"> 机型 </span>
                    <el-select
                      v-model="dataFilterResult.nlpModels"
                      class="w-200"
                      size="small"
                      placeholder="请选择"
                      :teleported="false"
                      clearable
                      multiple
                      collapse-tags
                      collapse-tags-tooltip
                      filterable
                    >
                      <el-option
                        v-for="(item, index) in filterCondition.contentModelList"
                        :key="index"
                        :value="item.value"
                        :label="item.label"
                      />
                    </el-select>
                  </div>
                  <template #reference>
                    <el-button
                      link
                      :type="dataFilterResult.nlpBrands.length || dataFilterResult.nlpModels.length ? 'primary' : ''"
                    >
                      主体预处理
                      <svg-icon name="smc-arrow-down" className="icon-arrow" />
                    </el-button>
                  </template>
                </el-popover>
              </div>
            </div>
          </div>
        </div>
        <!-- <el-divider style="margin: 0" class="mt15" /> -->
        <div class="flex-row mt15">
          <div class="flex-row">
            <h3 class="mr20">内容筛选</h3>
            <div class="custom-comment-box">
              <!--内容类型-->
              <div class="flex-row mr15 mt5">
                <el-popover placement="bottom" :width="300" trigger="click">
                  <div class="flex-between">
                    <span class="mr5" style="width: 140px; text-align: right"> 内容类型 </span>
                    <el-select
                      v-model="contentFilterResult.contentType"
                      :teleported="false"
                      multiple
                      clearable
                      filterable
                      placeholder="请选择"
                      size="small"
                      collapse-tags
                      collapse-tags-tooltip
                    >
                      <el-option
                        v-for="(item, index) in filterCondition.contentTypeList"
                        :value="item"
                        :label="item"
                        :key="index"
                      >
                      </el-option>
                    </el-select>
                  </div>
                  <div class="flex-between mt10">
                    <span class="mr5" style="width: 140px; text-align: right"> 内容多主体 </span>
                    <el-select v-model="contentFilterResult.multiAgentContents" size="small" :teleported="false">
                      <el-option
                        v-for="(item, index) in filterCondition.multiAgentContentsList"
                        :value="item"
                        :label="item"
                        :key="index"
                      >
                      </el-option>
                    </el-select>
                  </div>
                  <div class="flex-between mt10">
                    <span class="mr5" style="width: 140px; text-align: right"> 内容手机相关 </span>
                    <el-select v-model="contentFilterResult.contentAboutphone" size="small" :teleported="false">
                      <el-option
                        v-for="(item, index) in filterCondition.phoneRelatedCommentsList"
                        :value="item"
                        :label="item"
                        :key="index"
                      >
                      </el-option>
                    </el-select>
                  </div>

                  <template #reference>
                    <el-button
                      link
                      :type="
                        contentFilterResult.contentType.length ||
                        contentFilterResult.multiAgentContents ||
                        contentFilterResult.contentAboutphone
                          ? 'primary'
                          : ''
                      "
                    >
                      内容特征
                      <svg-icon name="smc-arrow-down" className="icon-arrow" />
                    </el-button>
                  </template>
                </el-popover>
              </div>

              <!--品牌-->
              <div class="flex-row mr15 mt5">
                <CommonPopoverCheckbox
                  v-model="contentFilterResult.brand"
                  :modelList="filterCondition.brandList"
                  @change="handleChangeContentBrand"
                  :width="220"
                >
                  <el-button link :type="contentFilterResult.brand.length ? 'primary' : ''">
                    品牌
                    <svg-icon name="smc-arrow-down" className="icon-arrow" />
                  </el-button>
                </CommonPopoverCheckbox>
              </div>

              <!--机型-->
              <div class="flex-row mr15 mt5">
                <CommonPopoverCheckbox
                  v-model="contentFilterResult.contentModel"
                  :modelList="filterCondition.contentModelList"
                  :filterable="true"
                  :width="220"
                >
                  <el-button link :type="contentFilterResult.contentModel.length ? 'primary' : ''">
                    机型
                    <svg-icon name="smc-arrow-down" className="icon-arrow" />
                  </el-button>
                </CommonPopoverCheckbox>
              </div>

              <!--品牌情感-->
              <div class="flex-row mr15 mt5">
                <CommonPopoverCheckbox
                  v-model="contentFilterResult.brandEmotion"
                  :modelList="filterCondition.brandEmotionList"
                >
                  <el-button link :type="contentFilterResult.brandEmotion.length ? 'primary' : ''">
                    品牌情感
                    <svg-icon name="smc-arrow-down" className="icon-arrow" />
                  </el-button>
                </CommonPopoverCheckbox>
              </div>

              <!--机型情感-->
              <div class="flex-row mr15 mt5">
                <CommonPopoverCheckbox
                  v-model="contentFilterResult.modelEmotion"
                  :modelList="filterCondition.modelEmotionList"
                >
                  <el-button link :type="contentFilterResult.modelEmotion.length ? 'primary' : ''">
                    机型情感
                    <svg-icon name="smc-arrow-down" className="icon-arrow" />
                  </el-button>
                </CommonPopoverCheckbox>
              </div>

              <!--提及其他机型-->
              <div class="flex-row mr15 mt5">
                <CommonPopoverCheckbox
                  v-model="contentFilterResult.contentOtherModel"
                  :modelList="filterCondition.allModelList"
                  :filterable="true"
                  :width="220"
                >
                  <el-button link :type="contentFilterResult.contentOtherModel.length ? 'primary' : ''">
                    提及其他机型
                    <svg-icon name="smc-arrow-down" className="icon-arrow" />
                  </el-button>
                </CommonPopoverCheckbox>
              </div>

              <!--其他机型情感-->
              <div class="flex-row mr15 mt5">
                <CommonPopoverCheckbox
                  v-model="contentFilterResult.otherModelEmotion"
                  :modelList="filterCondition.modelEmotionList"
                >
                  <el-button link :type="contentFilterResult.otherModelEmotion.length ? 'primary' : ''">
                    其他机型情感
                    <svg-icon name="smc-arrow-down" className="icon-arrow" />
                  </el-button>
                </CommonPopoverCheckbox>
              </div>

              <!--内容数据指标-->
              <div class="flex-row mr15 mt5">
                <el-popover placement="bottom" :width="260" trigger="click">
                  <div class="flex-between">
                    <span class="mr5"> 互动量 </span>
                    <el-input
                      v-model="dataFilterResult.contentIntercnt[0]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      :min="0"
                      oninput="value=value.replace(/[^0-9]/g,'')"
                      @blur="handleSetValue(dataFilterResult.contentIntercnt)"
                      type="number"
                    />
                    <span class="ml5 mr5">-</span>
                    <el-input
                      v-model="dataFilterResult.contentIntercnt[1]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      :min="0"
                      oninput="value=value.replace(/[^0-9]/g,'')"
                      @focus="getLeftValue(dataFilterResult.contentIntercnt)"
                      @blur="handleSetValue(dataFilterResult.contentIntercnt)"
                      type="number"
                    />
                  </div>
                  <div class="flex-between mt10">
                    <span class="mr5"> 点赞量 </span>
                    <el-input
                      v-model="dataFilterResult.contentDiggcnt[0]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      :min="0"
                      oninput="value=value.replace(/[^0-9]/g,'')"
                      @blur="handleSetValue(dataFilterResult.contentDiggcnt)"
                      type="number"
                    />
                    <span class="ml5 mr5">-</span>
                    <el-input
                      v-model="dataFilterResult.contentDiggcnt[1]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      :min="0"
                      oninput="value=value.replace(/[^0-9]/g,'')"
                      @focus="getLeftValue(dataFilterResult.contentDiggcnt)"
                      @blur="handleSetValue(dataFilterResult.contentDiggcnt)"
                      type="number"
                    />
                  </div>
                  <div class="flex-between mt10">
                    <span class="mr5"> 评论量 </span>
                    <el-input
                      v-model="dataFilterResult.contentCommentcnt[0]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      :min="0"
                      oninput="value=value.replace(/[^0-9]/g,'')"
                      @blur="handleSetValue(dataFilterResult.contentCommentcnt)"
                      type="number"
                    />
                    <span class="ml5 mr5">-</span>
                    <el-input
                      v-model="dataFilterResult.contentCommentcnt[1]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      :min="0"
                      oninput="value=value.replace(/[^0-9]/g,'')"
                      @focus="getLeftValue(dataFilterResult.contentCommentcnt)"
                      @blur="handleSetValue(dataFilterResult.contentCommentcnt)"
                      type="number"
                    />
                  </div>

                  <template #reference>
                    <el-button
                      link
                      :type="
                        dataFilterResult.contentIntercnt.length ||
                        dataFilterResult.contentDiggcnt.length ||
                        dataFilterResult.contentCommentcnt.length
                          ? 'primary'
                          : ''
                      "
                    >
                      内容数据指标
                      <svg-icon name="smc-arrow-down" className="icon-arrow" />
                    </el-button>
                  </template>
                </el-popover>
              </div>

              <!--内容评论区相关性-->
              <div class="flex-row mr15 mt5">
                <el-popover placement="bottom" width="280" trigger="click">
                  <div class="flex-between">
                    <span class="mr5"> 手机相关率 </span>
                    <el-input
                      v-model="dataFilterResult.commentPhonecntRatio[0]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      :min="0"
                      :max="100"
                      oninput="value=value.replace(/[^0-9]/g,'')"
                      @blur="handleMinMaxValue(dataFilterResult.commentPhonecntRatio)"
                      type="number"
                    >
                      <template #append><span class="mr5 ml5">%</span></template>
                    </el-input>
                    <span class="ml5 mr5">-</span>
                    <el-input
                      v-model="dataFilterResult.commentPhonecntRatio[1]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      :min="0"
                      :max="100"
                      oninput="value=value.replace(/[^0-9]/g,'')"
                      @focus="getLeftValue(dataFilterResult.commentPhonecntRatio)"
                      @blur="handleMinMaxValue(dataFilterResult.commentPhonecntRatio)"
                      type="number"
                    >
                      <template #append><span class="mr5 ml5">%</span></template>
                    </el-input>
                  </div>
                  <div class="flex-between mt10">
                    <span class="mr5"> 评论提及率 </span>
                    <el-input
                      v-model="dataFilterResult.samebrandCommentcntRatio[0]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      :min="0"
                      oninput="value=value.replace(/[^0-9]/g,'')"
                      @blur="handleMinMaxValue(dataFilterResult.samebrandCommentcntRatio)"
                      type="number"
                    >
                      <template #append><span class="mr5 ml5">%</span></template>
                    </el-input>
                    <span class="ml5 mr5">-</span>
                    <el-input
                      v-model="dataFilterResult.samebrandCommentcntRatio[1]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      :min="0"
                      oninput="value=value.replace(/[^0-9]/g,'')"
                      @focus="getLeftValue(dataFilterResult.samebrandCommentcntRatio)"
                      @blur="handleMinMaxValue(dataFilterResult.samebrandCommentcntRatio)"
                      type="number"
                    >
                      <template #append><span class="mr5 ml5">%</span></template>
                    </el-input>
                  </div>

                  <template #reference>
                    <el-button
                      link
                      :type="
                        dataFilterResult.commentPhonecntRatio.length || dataFilterResult.samebrandCommentcntRatio.length
                          ? 'primary'
                          : ''
                      "
                    >
                      内容评论区相关性
                      <svg-icon name="smc-arrow-down" className="icon-arrow" />
                    </el-button>
                  </template>
                </el-popover>
              </div>

              <!--内容评论区情感倾向-->
              <div class="flex-row mr15 mt5">
                <el-popover placement="bottom" width="340" trigger="click">
                  <div class="flex-between">
                    <span class="mr5" style="width: 126px; text-align: right"> 热门评论负向数 </span>
                    <el-input
                      v-model="dataFilterResult.globalHotnegativecnt[0]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      :min="0"
                      oninput="value=value.replace(/[^0-9]/g,'')"
                      @blur="handleSetValue(dataFilterResult.globalHotnegativecnt)"
                      type="number"
                    />
                    <span class="ml5 mr5">-</span>
                    <el-input
                      v-model="dataFilterResult.globalHotnegativecnt[1]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      :min="0"
                      oninput="value=value.replace(/[^0-9]/g,'')"
                      @focus="getLeftValue(dataFilterResult.globalHotnegativecnt)"
                      @blur="handleSetValue(dataFilterResult.globalHotnegativecnt)"
                      type="number"
                    />
                  </div>
                  <!-- <div class="flex-between mt10">
                  <span class="mr5" style="width: 126px; text-align: right"> 相对热门评论负向数 </span>
                  <el-input
                    v-model="dataFilterResult.relativeHotnegativecnt[0]"
                    size="small"
                    placeholder=""
                    style="width: 80px"
                    :min="0"
                    oninput="value=value.replace(/[^0-9]/g,'')"
                    @blur="handleSetValue(dataFilterResult.relativeHotnegativecnt)"
                    type="number"
                  />
                  <span class="ml5 mr5">-</span>
                  <el-input
                    v-model="dataFilterResult.relativeHotnegativecnt[1]"
                    size="small"
                    placeholder=""
                    style="width: 80px"
                    :min="0"
                    oninput="value=value.replace(/[^0-9]/g,'')"
                    @focus="getLeftValue(dataFilterResult.relativeHotnegativecnt)"
                    @blur="handleSetValue(dataFilterResult.relativeHotnegativecnt)"
                    type="number"
                  />
                </div> -->
                  <div class="flex-between mt10">
                    <span class="mr5" style="width: 126px; text-align: right"> 评论负向数 </span>
                    <el-input
                      v-model="dataFilterResult.samebrandNegativecnt[0]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      :min="0"
                      oninput="value=value.replace(/[^0-9]/g,'')"
                      @blur="handleSetValue(dataFilterResult.samebrandNegativecnt)"
                      type="number"
                    />
                    <span class="ml5 mr5">-</span>
                    <el-input
                      v-model="dataFilterResult.samebrandNegativecnt[1]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      :min="0"
                      oninput="value=value.replace(/[^0-9]/g,'')"
                      @focus="getLeftValue(dataFilterResult.samebrandNegativecnt)"
                      @blur="handleSetValue(dataFilterResult.samebrandNegativecnt)"
                      type="number"
                    />
                  </div>
                  <div class="flex-between mt10">
                    <span class="mr5" style="width: 126px; text-align: right"> 评论负向率 </span>
                    <el-input
                      v-model="dataFilterResult.samebrandNegativecntRatio[0]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      :min="0"
                      oninput="value=value.replace(/[^0-9]/g,'')"
                      @blur="handleMinMaxValue(dataFilterResult.samebrandNegativecntRatio)"
                      type="number"
                    >
                      <template #append><span class="mr5 ml5">%</span></template>
                    </el-input>
                    <span class="ml5 mr5">-</span>
                    <el-input
                      v-model="dataFilterResult.samebrandNegativecntRatio[1]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      :min="0"
                      oninput="value=value.replace(/[^0-9]/g,'')"
                      @focus="getLeftValue(dataFilterResult.samebrandNegativecntRatio)"
                      @blur="handleMinMaxValue(dataFilterResult.samebrandNegativecntRatio)"
                      type="number"
                    >
                      <template #append><span class="mr5 ml5">%</span></template>
                    </el-input>
                  </div>
                  <div class="flex-between mt10">
                    <span class="mr5" style="width: 126px; text-align: right"> 评论NPS值</span>
                    <el-input
                      v-model="dataFilterResult.samebrandCommentcntNps[0]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      :min="-100"
                      :max="100"
                      type="number"
                      @blur="handleMinMaxValue(dataFilterResult.samebrandCommentcntNps, 'negative_infinity')"
                    >
                      <template #append><span class="mr5 ml5">%</span></template>
                    </el-input>
                    <span class="ml5 mr5">-</span>
                    <el-input
                      v-model="dataFilterResult.samebrandCommentcntNps[1]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      :min="-100"
                      :max="100"
                      @focus="getLeftValue(dataFilterResult.samebrandCommentcntNps)"
                      @blur="handleMinMaxValue(dataFilterResult.samebrandCommentcntNps, 'negative_infinity')"
                      type="number"
                    >
                      <template #append><span class="mr5 ml5">%</span></template>
                    </el-input>
                  </div>

                  <template #reference>
                    <el-button
                      link
                      :type="
                        dataFilterResult.globalHotnegativecnt.length ||
                        dataFilterResult.relativeHotnegativecnt.length ||
                        dataFilterResult.samebrandNegativecnt.length ||
                        dataFilterResult.samebrandNegativecntRatio.length ||
                        dataFilterResult.samebrandCommentcntNps.length
                          ? 'primary'
                          : ''
                      "
                    >
                      内容评论区情感倾向
                      <svg-icon name="smc-arrow-down" className="icon-arrow" />
                    </el-button>
                  </template>
                </el-popover>
              </div>
            </div>
          </div>
        </div>
        <!-- <el-divider style="margin: 0" /> -->
        <div class="flex-row mt15">
          <div class="flex-row">
            <h3 class="mr20">发布者筛选</h3>
            <div class="custom-comment-box">
              <div class="flex-row mr15 mt5">
                <CommonPopoverCheckbox
                  v-model="dataFilterResult.contentAuthorTag"
                  :modelList="filterCondition.contentAuthorTagList"
                >
                  <el-button link :type="dataFilterResult.contentAuthorTag.length ? 'primary' : ''">
                    发布者标签
                    <svg-icon name="smc-arrow-down" className="icon-arrow" />
                  </el-button>
                </CommonPopoverCheckbox>
              </div>

              <!--发布者相关-->
              <div class="flex-row mr15 mt5">
                <el-popover placement="bottom" :width="300" trigger="click">
                  <div class="flex-between">
                    <span class="mr5"> 发布者粉丝量 </span>
                    <el-input
                      v-model="dataFilterResult.contentAuthorFans[0]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      :min="0"
                      oninput="value=value.replace(/[^0-9]/g,'')"
                      @blur="handleSetValue(dataFilterResult.contentAuthorFans)"
                      type="number"
                    />
                    <span class="ml5 mr5">-</span>
                    <el-input
                      v-model="dataFilterResult.contentAuthorFans[1]"
                      size="small"
                      placeholder=""
                      style="width: 80px"
                      :min="0"
                      oninput="value=value.replace(/[^0-9]/g,'')"
                      @focus="getLeftValue(dataFilterResult.contentAuthorFans)"
                      @blur="handleSetValue(dataFilterResult.contentAuthorFans)"
                      type="number"
                    />
                  </div>
                  <template #reference>
                    <el-button link :type="dataFilterResult.contentAuthorFans.length ? 'primary' : ''">
                      发布者粉丝量
                      <svg-icon name="smc-arrow-down" className="icon-arrow" />
                    </el-button>
                  </template>
                </el-popover>
              </div>

              <!--发布者常驻省市-->
              <div class="flex-row mr15 mt5">
                <el-popover placement="bottom" :width="265" trigger="click">
                  <div class="flex-between">
                    <span class="mr5"> 省份 </span>
                    <el-select
                      v-model="dataFilterResult.authorProvinces"
                      class="w-200"
                      size="small"
                      placeholder="请选择"
                      :teleported="false"
                      clearable
                      multiple
                      collapse-tags
                      collapse-tags-tooltip
                      filterable
                    >
                      <el-option
                        v-for="(item, index) in filterCondition.provinceList"
                        :key="index"
                        :value="item"
                        :label="item"
                      />
                    </el-select>
                  </div>
                  <div class="flex-between mt10">
                    <span class="mr5"> 城市 </span>
                    <el-select
                      v-model="dataFilterResult.authorCitys"
                      class="w-200"
                      size="small"
                      placeholder="请选择"
                      :teleported="false"
                      clearable
                      multiple
                      collapse-tags
                      collapse-tags-tooltip
                      filterable
                    >
                      <el-option
                        v-for="(item, index) in filterCondition.authorCityList"
                        :key="index"
                        :value="item"
                        :label="item"
                      />
                    </el-select>
                  </div>
                  <template #reference>
                    <el-button
                      link
                      :type="
                        dataFilterResult.authorProvinces.length || dataFilterResult.authorCitys.length ? 'primary' : ''
                      "
                    >
                      发布者常驻省市
                      <svg-icon name="smc-arrow-down" className="icon-arrow" />
                    </el-button>
                  </template>
                </el-popover>
              </div>
            </div>
          </div>
        </div>
        <!-- <el-divider style="margin: 0" /> -->
        <div class="flex-row mt15">
          <div class="custom-comment-box">
            <h3 class="mr20">人工标签</h3>
            <!--公关跟进-->
            <div class="flex-row mr15 mt5">
              <CommonPopoverCheckbox
                v-model="PRFollowFilterResult.PRFollowup"
                :modelList="filterCondition.PRFollowupList"
                :width="200"
              >
                <el-button link :type="PRFollowFilterResult.PRFollowup.length ? 'primary' : ''">
                  备注
                  <svg-icon name="smc-arrow-down" className="icon-arrow" />
                </el-button>
              </CommonPopoverCheckbox>
            </div>
          </div>
        </div>
        <!-- <el-divider style="margin: 0" /> -->
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

      <template v-for="(item, key) in contentFilterResult" :key="key">
        <el-tag
          v-if="
            item.length &&
            getLabelName(item, key, 'content').length > 0 &&
            getLabelName(item, key, 'content').length <= 8
          "
          type="primary"
          class="mr10 mt5"
          :closable="(key as unknown as string) === 'publicTime' ? false : true"
          @close="deleteFilterTag('content', key)"
          style="cursor: pointer; padding: 5px"
        >
          {{ contentFilterMap[key] }}：{{ getLabelName(item, key, 'content').join('，') }}
        </el-tag>
        <el-tooltip
          v-else-if="getLabelName(item, key, 'content').length > 8"
          effect="dark"
          placement="bottom"
          popper-class="custom-popper-note"
        >
          <template #content>
            {{ getLabelName(item, key, 'content').join('，') }}
          </template>
          <el-tag
            type="primary"
            class="mr10 mt5"
            :closable="true"
            @close="deleteFilterTag('content', key)"
            style="cursor: pointer; padding: 5px"
          >
            {{ contentFilterMap[key] }}：{{ getLabelName(item, key, 'content').slice(0, 8).join('，') }} +
            {{ getLabelName(item, key, 'content').length - 8 }}
          </el-tag>
        </el-tooltip>
      </template>

      <template v-for="(item, key) in dataFilterResult" :key="key">
        <el-tag
          v-if="
            item.length && getLabelName(item, key, 'data').length > 0 && getLabelName(item, key, 'data').length <= 8
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

      <template v-for="(item, key) in PRFollowFilterResult" :key="key">
        <el-tag
          v-if="item.length && getLabelName(item, key, 'PR').length > 0 && getLabelName(item, key, 'PR').length <= 8"
          type="primary"
          class="mr10 mt5"
          closable
          @close="deleteFilterTag('PR', key)"
          style="cursor: pointer; padding: 5px"
        >
          {{ PRFollowFilterMap[key] }}：{{ getLabelName(item, key, 'PR').join('，') }}
        </el-tag>
        <el-tooltip
          v-else-if="getLabelName(item, key, 'PR').length > 8"
          effect="dark"
          placement="bottom"
          popper-class="custom-popper-note"
        >
          <template #content>
            {{ getLabelName(item, key, 'PR').join('，') }}
          </template>
          <el-tag
            type="primary"
            class="mr10 mt5"
            closable
            @close="deleteFilterTag('PR', key)"
            style="cursor: pointer; padding: 5px"
          >
            {{ PRFollowFilterMap[key] }}：{{ getLabelName(item, key, 'PR').slice(0, 8).join('，') }} +
            {{ getLabelName(item, key, 'PR').length - 8 }}
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
    <div class="flex-between" style="padding: 10px 10px 0 10px">
      <div class="flex-row">
        <span>共 {{ page.pageTotalContent }} 篇内容</span>
        <el-button type="primary" @click="handleOpenAnalysis()" class="ml15" size="small">统计分析</el-button>
      </div>

      <div>
        <el-button size="small" type="primary" @click="handleChangeFilter"> 查询 </el-button>
        <!-- <el-button size="small" type="primary" disabled v-if="page.pageTotal > 10000">
          导出结果
          <el-tooltip
            effect="dark"
            placement="top"
            popper-class="custom-popper-note"
            content="页面匹配数据过多，暂不支持下载，您可使用页面分享功能。
补充筛选条件后，数据< 1万 条，即可下载哦～"
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
      >
        <el-table-column label="内容信息" width="450" fixed="left">
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
            <div class="custom-table-content">
              <ImagePreview
                :srcList="scope.row.contentPreviewurl ? [scope.row.contentPreviewurl] : []"
                :width="74"
                :height="94"
                :srcError="scope.row.srcError"
              />
              <div class="flex-column ml20" style="flex: 1">
                <div v-if="scope.row.contentTitle" class="flex-row">
                  <el-tooltip effect="dark" placement="bottom" popper-class="custom-popper-note">
                    <template #content>
                      {{ scope.row.contentTitle }}
                    </template>
                    <el-text :line-clamp="2" class="desc" @click="handleToLink(scope.row.contentUrl)">{{
                      scope.row.contentTitle
                    }}</el-text>
                  </el-tooltip>
                </div>
                <p class="desc" v-else @click="handleToLink(scope.row.contentUrl)">--</p>
                <p class="mt5 flex-row">
                  <el-tag v-if="scope.row.platform" type="info" effect="light" round class="mr5">
                    {{ platformMapping[scope.row.platform] ? platformMapping[scope.row.platform] : scope.row.platform }}
                  </el-tag>
                  <template v-if="scope.row.contentTypes && scope.row.contentTypes.length > 0">
                    <el-tag
                      type="info"
                      effect="light"
                      round
                      v-for="(tag, key) in scope.row.contentTypes"
                      :key="key"
                      class="mr5"
                    >
                      {{ tag }}
                    </el-tag>
                  </template>
                  <template v-if="scope.row.contentAuthorTags && scope.row.contentAuthorTags.length > 0">
                    <el-tag
                      type="danger"
                      effect="light"
                      round
                      v-for="(tag, key) in scope.row.contentAuthorTags"
                      :key="key"
                      class="mr5"
                    >
                      {{ tag }}
                    </el-tag>
                  </template>
                </p>

                <div class="time flex-row mt5">
                  <span class="desc pointer" @click="handleToLink(scope.row.home_page)" v-if="scope.row.home_page">
                    {{ scope.row.contentAuthor || '--' }} |
                  </span>
                  <span v-else> {{ scope.row.contentAuthor || '--' }} | </span>
                  <div class="flex-row">
                    <span><svg-icon name="smc-switch" />{{ scope.row.contentInterCnt }} |</span>
                    <span><svg-icon name="smc-heartline" />{{ scope.row.contentDiggCnt }} |</span>
                    <span @click="handleToCommentDetailList('contentId', scope.row)">
                      <svg-icon name="smc-chat" class="pointer" />
                      <span class="pointer" style="text-decoration: underline"
                        >{{ scope.row.contentCommentCnt }}
                      </span></span
                    >
                  </div>

                  <!-- <svg-icon className="smc-copy pointer" name="smc-copy" @click="handleCopyTxt(scope.row.matchId)" /> -->
                </div>

                <div class="time flex-row">
                  <div>发布于 {{ scope.row.contentPublishTime || '--' }}</div>
                  <div @click="handleCopyTxt(scope.row.matchId)" class="flex-row pointer">
                    ｜ 内容ID <DocumentCopy class="ml5 smc-copy" style="width: 14px" />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="150" label="品牌情感">
          <template #default="scope">
            <template v-if="scope.row.contentBrandemotions && scope.row.contentBrandemotions.length > 0">
              <el-tag
                :type="
                  tag.includes('负向')
                    ? 'danger'
                    : tag.includes('不明确')
                      ? 'warning'
                      : tag.includes('中性')
                        ? 'info'
                        : 'success'
                "
                effect="light"
                round
                v-for="(tag, key) in scope.row.contentBrandemotions"
                :key="key"
                class="mr5 mt5"
              >
                <div class="flex-row">
                  <span class="mr10">{{ tag }}</span>
                  <el-tooltip effect="dark" content="打标错误 提报/修正" placement="top">
                    <svg-icon
                      class="pointer"
                      name="smc-edit"
                      @click="handleEditBadCase(scope.row)"
                      v-permission="{
                        permissionKey: 'INFORMATION_OPINION_OPERATE'
                      }"
                    />
                  </el-tooltip>
                </div>
              </el-tag>
            </template>
            <template v-else>--</template>
          </template>
        </el-table-column>
        <el-table-column min-width="150" label="机型情感">
          <template #default="scope">
            <template v-if="scope.row.contentPhoneemotions && scope.row.contentPhoneemotions.length > 0">
              <el-tag
                :type="
                  tag.includes('负向')
                    ? 'danger'
                    : tag.includes('不明确')
                      ? 'warning'
                      : tag.includes('中性')
                        ? 'info'
                        : 'success'
                "
                effect="light"
                round
                v-for="(tag, key) in scope.row.contentPhoneemotions"
                :key="key"
                class="mr5 mt5"
              >
                <div class="flex-row">
                  <span class="mr10">{{ tag }}</span>
                  <el-tooltip effect="dark" content="打标错误 提报/修正" placement="top">
                    <svg-icon
                      class="pointer"
                      name="smc-edit"
                      @click="handleEditBadCase(scope.row)"
                      v-permission="{
                        permissionKey: 'INFORMATION_OPINION_OPERATE'
                      }"
                    />
                  </el-tooltip>
                </div>
              </el-tag>
            </template>
            <template v-else>--</template>
          </template>
        </el-table-column>
        <el-table-column min-width="150" label="提及其他机型情感">
          <template #default="scope">
            <template v-if="scope.row.contentOtherPhoneemotions && scope.row.contentOtherPhoneemotions.length > 0">
              <el-tag
                :type="
                  tag.includes('负向')
                    ? 'danger'
                    : tag.includes('不明确')
                      ? 'warning'
                      : tag.includes('中性')
                        ? 'info'
                        : 'success'
                "
                effect="light"
                round
                v-for="(tag, key) in scope.row.contentOtherPhoneemotions"
                :key="key"
                class="mr5 mt5"
              >
                <div class="flex-row">
                  <span class="mr10">{{ tag }}</span>
                  <el-tooltip effect="dark" content="打标错误 提报/修正" placement="top">
                    <svg-icon
                      class="pointer"
                      name="smc-edit"
                      @click="handleEditBadCase(scope.row)"
                      v-permission="{
                        permissionKey: 'INFORMATION_OPINION_OPERATE'
                      }"
                    />
                  </el-tooltip>
                </div>
              </el-tag>
            </template>
            <template v-else>--</template>
          </template>
        </el-table-column>
        <el-table-column
          property="comment_phonecnt_ratio"
          sortable="custom"
          label="评论手机相关率"
          min-width="150"
          :align="'center'"
        >
          <template #default="scope">{{
            scope.row.commentPhonecntRatio ? scope.row.commentPhonecntRatio + '%' : '--'
          }}</template>
        </el-table-column>
        <el-table-column
          property="samebrand_commentcnt_ratio"
          sortable="custom"
          label="评论提及率"
          width="150"
          :align="'center'"
        >
          <template #header>
            <el-popover
              effect="dark"
              placement="top"
              popper-class="custom-popper-note"
              content="受限于时效性，未抓取全部评论。此指标是本品牌在已抓取评论里的提及率。"
            >
              <template #reference>
                <span className="ml5">评论提及率<svg-icon name="smc-question-solid" className="ml5" /></span>
              </template>
            </el-popover>
          </template>
          <template #default="scope">{{
            scope.row.samebrandCommentcntRatio ? scope.row.samebrandCommentcntRatio + '%' : '--'
          }}</template>
        </el-table-column>
        <el-table-column
          property="global_hotnegativecnt"
          sortable="custom"
          label="热门评论负向数"
          width="170"
          :align="'center'"
        >
          <template #header>
            <el-popover
              effect="dark"
              placement="top"
              popper-class="custom-popper-note"
              content="指本内容全部评论里，热度排序前30中，本品牌相关负向评论的数量。"
            >
              <template #reference>
                <span className="ml5">热门评论负向数<svg-icon name="smc-question-solid" className="ml5" /></span>
              </template>
            </el-popover>
          </template>
          <template #default="scope">
            <!-- <el-text :line-clamp="2" class="desc" @click="handleToLink(scope.row.contentUrl)">{{
              scope.row.contentTitle
            }}</el-text> -->
            <span
              class="desc"
              v-if="scope.row.globalHotnegativecnt"
              @click="handleToCommentDetailList('global_hotnegativecnt', scope.row)"
            >
              {{ scope.row.globalHotnegativecnt }}
            </span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <!-- <el-table-column
          property="relative_hotnegativecnt"
          sortable="custom"
          label="相对热门评论负向数"
          width="200"
          :align="'center'"
        >
          <template #header>
            <el-popover
              effect="dark"
              placement="top"
              popper-class="custom-popper-note"
              content="指本内容主评论里，相对热度排序前30中，本品牌相关负向评论的数量。"
            >
              <template #reference>
                <span className="ml5">相对热门评论负向数<svg-icon name="smc-question-solid" className="ml5" /></span>
              </template>
            </el-popover>
          </template>
          <template #default="scope">
            <span
              class="desc"
              @click="handleToCommentDetailList('relative_hotnegativecnt', scope.row)"
              v-if="scope.row.relativeHotnegativecnt"
            >
              {{ scope.row.relativeHotnegativecnt || '--' }}
            </span>
            <span v-else>--</span>
          </template>
        </el-table-column> -->
        <el-table-column
          property="samebrand_negativecnt"
          sortable="custom"
          label="评论负向数"
          width="150"
          :align="'center'"
        >
          <template #header>
            <el-popover
              effect="dark"
              placement="top"
              popper-class="custom-popper-note"
              content="本内容下提到相关品牌的评论里，情感为负向的数量。"
            >
              <template #reference>
                <span className="ml5">评论负向数<svg-icon name="smc-question-solid" className="ml5" /></span>
              </template>
            </el-popover>
          </template>
          <template #default="scope">
            <span
              class="desc"
              @click="handleToCommentDetailList('samebrand_negativecnt', scope.row)"
              v-if="scope.row.samebrandNegativecnt"
            >
              {{ scope.row.samebrandNegativecnt || '--' }}
            </span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column
          property="samebrand_negativecnt_ratio"
          sortable="custom"
          label="评论负向率"
          width="150"
          :align="'center'"
        >
          <template #header>
            <el-popover
              effect="dark"
              placement="top"
              popper-class="custom-popper-note"
              content="本内容下相关品牌负向评论占总抓取到评论的比率。"
            >
              <template #reference>
                <span className="ml5">评论负向率<svg-icon name="smc-question-solid" className="ml5" /></span>
              </template>
            </el-popover>
          </template>
          <template #default="scope">{{
            scope.row.samebrandNegativecntRatio ? scope.row.samebrandNegativecntRatio + '%' : '--'
          }}</template>
        </el-table-column>
        <el-table-column
          property="samebrand_commentcnt_nps"
          sortable="custom"
          label="评论NPS值"
          width="150"
          :align="'center'"
        >
          <template #header>
            <el-popover
              effect="dark"
              placement="top"
              popper-class="custom-popper-note"
              content="本内容下提到相关机型&品牌的评论里，正向数减去负向数除以总提及数。"
            >
              <template #reference>
                <span className="ml5">评论NPS值<svg-icon name="smc-question-solid" className="ml5" /></span>
              </template>
            </el-popover>
          </template>
          <template #default="scope">{{
            scope.row.samebrandCommentcntNps ? scope.row.samebrandCommentcntNps + '%' : '--'
          }}</template>
        </el-table-column>

        <el-table-column property="commentCnt" label="操作" min-width="150" fixed="right">
          <template #default="scope">
            <div
              v-permission="{
                permissionKey: 'INFORMATION_OPINION_CONTENT_PUBLIC'
              }"
            >
              <div class="pointer custom-primary-color" @click="handleFollowup(scope.row, scope.$index)">
                <svg-icon name="smc-edit" className="mr5 " />
                <span v-if="scope.row.followup">{{ scope.row.followup }}</span>
                <el-select
                  v-else
                  placeholder="请选择备注"
                  v-model="scope.row.followupStatus"
                  filterable
                  allow-create
                  default-first-option
                  style="width: 100px"
                  size="small"
                  @change="(val: any) => handleChangeFollowup(val, scope.row, scope.$index)"
                >
                  <el-option
                    v-for="(item, key) in filterCondition.PRFollowupListCopy"
                    :key="key"
                    :value="item.value"
                    :label="item.label"
                  />
                </el-select>
              </div>
              <el-tooltip
                effect="dark"
                placement="bottom"
                popper-class="custom-popper-note"
                v-if="scope.row.followupInfo"
              >
                <template #content>
                  {{ scope.row.followupInfo }}
                </template>
                <el-text style="display: inline-block" truncated :line-clamp="1">{{
                  scope.row.followupInfo || ''
                }}</el-text>
              </el-tooltip>
            </div>
            <el-button type="primary" link size="small" class="mt10" @click="handleToDetail(scope.row)"
              >查看更多</el-button
            >
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
      :page-sizes="[10, 15, 20, 50, 100]"
      @current-change="handlePageChange"
      layout="->,total,quickPrev,prev,pager,next,quickNext,sizes,jumper"
      :total="page.pageTotal"
    />
  </div>
  <FollowupDialog
    :isShowDialog="page.followupVisible"
    :currentObj="page.currentObj"
    :filterContentFollowupList="filterCondition.PRFollowupListCopy"
    @clickClose="handleCloseFollowupDialog"
  />
  <BadCaseDialog
    :isShowDialog="page.dialogVisible"
    :platform="page.badItem.platform"
    :badItem="page.badItem"
    :filterBrandList="filterCondition.brandAllList"
    :filterQQMoodList="filterCondition.brandEmotionList"
    @clickClose="handleCloseBadCaseDialog"
  />
  <CommonFilterTemplateDialog
    :isShowDialog="page.dialogVisibleFilter"
    :condition="page.filterTemplateCondition"
    :type="INFORMATION_ALARM_OPINION_CONTENT"
    @clickClose="handleCloseDialogFilter"
  />
  <AnalysisDrawer
    :isShowDrawer="page.analysisDrawerVisible"
    :currentObj="page.analysisObj"
    @clickClose="handleCloseAnalysis"
  />

  <ContentDetailDrawer
    :isShowDrawer="page.detailDrawerVisible"
    :currentObj="page.detailObj"
    @clickClose="handleCloseDetail"
  />
</template>
<script lang="ts" setup>
import {
  saveFilterParams,
  getFilterParams,
  getOpinionContentList,
  sentimentFilterDim,
  downloadOpinionContentList,
  editOpinionFollowup,
  contentOpinionLastTime
} from '@/api/information/opinion'
import { DocumentCopy } from '@element-plus/icons-vue'
import ImagePreview from '@/components/ImagePreview.vue'
import {
  contentFilterMap,
  dataFilterMap,
  PRFollowFilterMap,
  filterMapping,
  CONTENT_DEFAULT_IMAGE_MAP,
  platformMapping,
  PLATFORM_CORE,
  CUSTOM_SORT_LIST,
  INFORMATION_ALARM_OPINION_CONTENT,
  INFORMATION_CONTENT_FILTER_STATUS,
  INFORMATION_CONTENT_FILTER_ORIGINS,
  INFORMATION_CONTENT_FILTER_IS_ORIGINAL,
  INFORMATION_CONTENT_FILTER_SENSITIVITY_TYPE
} from './constant'
import FollowupDialog from './components/FollowupDialog.vue'
import BadCaseDialog from './components/BadCaseDialog.vue'
import ComposeFilter from './components/ComposeFilter.vue'
import type { IOcsRes } from '@/components/UploadDialog.vue'
import TemplateFilter from './components/TemplateFilter.vue'
import AnalysisDrawer from './components/AnalysisDrawer.vue'
import ContentDetailDrawer from './components/ContentDetailDrawer.vue'
import { customDownload, objectToQueryString, useClipboard } from '@/utils'
import { useCurrentInstance } from '@/hooks'
import CommonPopoverCheckbox from '@/views/information/common/components/CommonPopoverCheckbox.vue'
import CommonFilterPopover from '@/views/information/common/components/CommonFilterPopover.vue'
import CommonFilterTemplateDialog from '@/views/information/common/components/CommonFilterTemplateDialog.vue'
import { PLATFORM_MEDIA_MAP } from '@/views/information/common/constant'

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
  // keywords: '',
  // keywordsTagList: [] as any,
  // searchType: 'contentTitle',
  expandedFilter: true,
  // searchTypeList: [
  //   {
  //     label: '内容标题',
  //     value: 'contentTitle'
  //   },
  //   {
  //     label: '内容发布者',
  //     value: 'contentAuthor'
  //   },
  //   {
  //     label: '内容ID',
  //     value: 'matchId'
  //   }
  // ],
  customSort: CUSTOM_SORT_LIST[0].value, //'content_title',
  customSortBy: '',
  // customSortList: [
  //   // {
  //   //   label: '内容标题',
  //   //   value: 'content_title'
  //   // },
  //   {
  //     label: '内容发布时间',
  //     value: 'content_publishtime'
  //   },
  //   {
  //     label: '内容互动量',
  //     value: 'content_intercnt'
  //   },
  //   {
  //     label: '内容点赞量',
  //     value: 'content_diggcnt'
  //   },
  //   {
  //     label: '内容评论量',
  //     value: 'content_commentcnt'
  //   },
  //   {
  //     label: '发布者粉丝量',
  //     value: 'content_authorfans'
  //   }
  // ],
  tableData: [] as any[],
  pageSize: 20,
  pageNumber: 1,
  pageTotal: 0,
  pageTotalContent: 0,
  // 详情
  currentObj: {},
  drawerVisible: false,
  badItem: {} as any,
  dialogVisible: false,
  followupVisible: false,
  followupIndex: 0,
  loading: false,
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
  analysisObj: Object.create(null),
  analysisDrawerVisible: false,
  // 详情
  detailObj: Object.create(null),
  detailDrawerVisible: false
})
const filterCondition = reactive<any>({
  contentTypeList: [],
  brandList: [],
  brandAllList: [], // 打标弹出框使用
  commentAllModelList: [],
  contentAllModelList: [],
  contentModelList: [],

  brandEmotionList: [],
  modelEmotionList: [],

  phoneRelatedCommentsList: [],

  PRFollowupList: [],
  PRFollowupListCopy: [],
  multiAgentContentsList: [],
  contentAuthorTagList: [],
  allModelList: [],
  // 省市
  provinceList: [],
  authorCityList: [],
  publishCityList: []
})
const platformFilterResult = reactive({
  platformList: JSON.parse(JSON.stringify(PLATFORM_CORE))
})

const contentFilterResult = reactive<any>({
  // 内容-内容发布日期
  publicTime: [
    globalProperties.$dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    globalProperties.$dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
  ],
  // 内容-内容类型
  contentType: [],
  // 内容-品牌
  brand: [],
  // 内容-机型
  contentModel: [],
  // 内容-品牌情感
  brandEmotion: [],
  // 内容-机型情感
  modelEmotion: [],
  // 内容-提及其他机型
  contentOtherModel: [],
  // 内容-其他机型情感
  otherModelEmotion: [],
  // 内容-多主体内容
  multiAgentContents: '',
  contentAboutphone: '是'
})
const dataFilterResult = reactive<any>({
  // 数据-发布者相关
  // 数据-内容发布者标签
  contentAuthorTag: [],
  // 数据-发布者粉丝量
  contentAuthorFans: [],
  // 数据-内容数据指标
  // 内容互动量，格式min_max
  contentIntercnt: [],
  // 内容点赞量，格式min_max
  contentDiggcnt: [],
  // 内容评论量，格式min_max
  contentCommentcnt: [],
  // 数据-内容评论区相关性
  // 手机评论相关率，格式min_max
  commentPhonecntRatio: [],
  // 评论提及率，格式min_max
  samebrandCommentcntRatio: [],

  // 数据- 内容评论区情感倾向
  // 热门评论负向数，格式min_max
  globalHotnegativecnt: [],
  // 相对热门评论负向数，格式min_max
  relativeHotnegativecnt: [],
  // 评论负向数，格式min_max
  samebrandNegativecnt: [],
  // 评论负向率，格式min_max
  samebrandNegativecntRatio: [],
  // 评论NPS值，格式min_max
  samebrandCommentcntNps: [],
  // // 数据-点赞量
  // likesRange: [],
  // // 数据-评论发布时间
  // publicTime: [
  //   globalProperties.$dayjs().subtract(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
  //   globalProperties.$dayjs().subtract(1, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss')
  // ] as any[],
  // // 数据-多主体评论
  // multiAgentContents: '',
  // // 数据-手机相关评论
  // phoneRelatedComments: '是',
  // // 数据-公关跟进进度
  // PRFollowup: [],
  // 基础筛选
  status: [], // 数据状态
  origins: [], // 来源
  isOriginal: [], // 是否原贴
  sensitivityType: [], // 敏感性判断分类
  sensitivityScore: [], // 敏感性分值，格式min_max
  similarityNum: [], // 相似内容数，格式min_max
  authorCitys: [], // 发布者常驻城市
  authorProvinces: [], // 发布者常驻省份
  publishProvinces: [], // 内容发布省份
  publishCitys: [], // 内容发布城市
  // 主体-品牌-机型
  nlpBrands: [],
  nlpModels: []
})
const PRFollowFilterResult = reactive<any>({
  // 公关处理-公关跟进进度
  PRFollowup: []
})

const changePlatformChecked = (index: number) => {
  platformFilterResult.platformList[index].checked = !platformFilterResult.platformList[index].checked
  // handleChangeFilter()
}

const getPlatformName = computed(() => {
  const platformName: any = platformFilterResult.platformList
    .filter((item: any) => item.checked)
    .map((item: any) => item.label)

  // 注入渠道平台
  if (platformRef.value && platformRef.value.length > 0) {
    platformName.push(...platformRef.value)
  }

  return platformName
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
      if (Array.isArray(item.value)) {
        if (item.value.some((child: string | number) => result.includes(child))) {
          tmpArr.push(item.label)
        }
      } else {
        if (result.includes(item.value)) {
          tmpArr.push(item.label)
        }
      }
    })
  } else {
    // 一维数组字符串
    list.forEach((item: any) => {
      if (Array.isArray(item)) {
        if (item.some((child) => result.includes(child))) {
          tmpArr.push(item)
        }
      } else {
        if (result.includes(item)) {
          tmpArr.push(item)
        }
      }
    })
  }

  return tmpArr
}
const getLabelName = (result: any[], key: any, type: string) => {
  // 新加的筛选部分
  if (key === 'status') {
    return computedLabelName(result, INFORMATION_CONTENT_FILTER_STATUS)
  }
  if (key === 'origins') {
    return computedLabelName(result, INFORMATION_CONTENT_FILTER_ORIGINS)
  }
  if (key === 'isOriginal') {
    return computedLabelName(result, INFORMATION_CONTENT_FILTER_IS_ORIGINAL)
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
  if (key === 'similarityNum') {
    return result && result.length > 0 ? [result.join(' - ')] : []
  }
  if (key === 'publishProvinces') {
    return computedLabelName(result, filterCondition.provinceList, 2)
  }
  if (key === 'publishCitys') {
    return computedLabelName(result, filterCondition.publishCityList, 2)
  }
  if (key === 'nlpBrands') {
    return computedLabelName(result, filterCondition.brandList)
  }
  if (key === 'nlpModels') {
    return computedLabelName(result, filterCondition.contentModelList)
  }
  if (key === 'authorProvinces') {
    return computedLabelName(result, filterCondition.provinceList, 2)
  }
  if (key === 'authorCitys') {
    return computedLabelName(result, filterCondition.authorCityList, 2)
  }

  // 老的部分-后续再来优化
  const strMap = [
    'publicTime',
    // 'likesRange',
    // 'interactionVolume',
    // 'commentRange',
    'multiAgentContents',
    'phoneRelatedComments',
    'contentAuthorFans',
    'contentAuthorTag',
    'contentIntercnt',
    'contentDiggcnt',
    'contentCommentcnt',
    'commentPhonecntRatio',
    'commentPhonecntRatio',
    'samebrandCommentcntRatio',
    'globalHotnegativecnt',
    'relativeHotnegativecnt',
    'samebrandNegativecnt',
    'samebrandNegativecntRatio',
    'samebrandCommentcntNps',
    'contentAboutphone'
  ]
  let arr = [] as any[]
  if (!strMap.includes(key)) {
    filterCondition[filterMapping[key]].forEach((item: any) => {
      result.forEach((innerItem, innerIndex) => {
        // 此处brand需特殊处理
        if (
          [
            'brand',
            'contentModel',
            'brandEmotion',
            'modelEmotion',
            'PRFollowup',
            'otherModelEmotion',
            'contentOtherModel'
          ].includes(key)
        ) {
          if (innerItem === item.label) {
            arr.push(item.label)
          }
        } else {
          if (innerItem === item) {
            arr.push(item)
          }
        }
      })
    })
    return arr
  } else {
    if (key === 'multiAgentContents' || key === 'contentAboutphone') {
      return result ? [result] : []
    }

    if (type === 'data') {
      arr = dataFilterResult[key]
    } else if (type === 'PR') {
      arr = PRFollowFilterResult[key]
    } else {
      arr = contentFilterResult[key]
    }
    if (key !== 'publicTime') {
      const mapping = [
        'commentPhonecntRatio',
        'samebrandCommentcntRatio',
        'samebrandNegativecntRatio',
        'samebrandCommentcntNps'
      ]
      if (mapping.includes(key)) {
        arr = arr.map((item) => `${item}%`)
      }
      return arr && arr.length > 0 ? [arr.join(' - ')] : []
    } else {
      return arr && arr.length > 0 ? [arr.join(' 至 ')] : []
    }
  }
}

const deleteFilterTag = (type: string, item: any) => {
  if (type === 'platform') {
    platformFilterResult.platformList.forEach((item: any) => {
      item.checked = false
    })
    platformRef.value = []
  } else if (type === 'data') {
    dataFilterResult[item] = []
  } else if (type === 'PR') {
    PRFollowFilterResult[item] = []
  } else {
    if (item === 'multiAgentContents' || item === 'contentAboutphone') {
      contentFilterResult[item] = ''
    } else {
      contentFilterResult[item] = []
    }
  }
  // getTableData()
}

const handleClearFilterCondition = () => {
  for (const key in dataFilterResult) {
    dataFilterResult[key] = []
  }
  for (const key in PRFollowFilterResult) {
    PRFollowFilterResult[key] = []
  }
  for (const key in contentFilterResult) {
    if (key !== 'publicTime') {
      if (key === 'multiAgentContents' || key === 'contentAboutphone') {
        contentFilterResult[key] = ''
      } else {
        contentFilterResult[key] = []
      }
    }
  }
  platformFilterResult.platformList.forEach((item: any) => {
    item.checked = false
  })
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
      filterCondition.contentTypeList = res.content_type || []
      filterCondition.phoneRelatedCommentsList = ['不限', '是', '否']
      filterCondition.multiAgentContentsList = ['不限', '是', '否']

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

      const followups = Array.isArray(res.followups)
        ? res.followups.map((item: any) => {
            return {
              label: item,
              value: item
            }
          })
        : []
      filterCondition.PRFollowupList = [
        ...followups,
        {
          label: '空白',
          value: '空白'
        }
      ]
      filterCondition.PRFollowupListCopy = followups

      const authorTag: any = []
      if (Array.isArray(res.authortag)) {
        res.authortag.forEach((item: any) => {
          authorTag.push({
            label: item,
            value: item
          })
        })
      }
      filterCondition.contentAuthorTagList = authorTag

      // 省市
      filterCondition.provinceList = res.provinces && res.provinces.length > 0 ? res.provinces : []
      filterCondition.authorCityList = res.authorCitys && res.authorCitys.length > 0 ? res.authorCitys : []
      filterCondition.publishCityList = res.publishCitys && res.publishCitys.length > 0 ? res.publishCitys : []
    }
  })
}

const handleToLink = (link: string) => {
  if (!link) {
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
  contentFilterResult.contentModel = []

  // handleChangeFilter()
}

const getLeftValue = (arr: any[]) => {
  if (!arr[0]) {
    arr[0] = 0
  }
}
const getCommonParams = () => {
  const platformList = platformFilterResult.platformList
    .filter((item: any) => item.checked)
    .map((item: any) => item.value)

  // 注入渠道平台
  if (platformRef.value && platformRef.value.length > 0) {
    platformList.push(...platformRef.value)
  }

  const params: any = {
    // 排序 DESC-降序 ASC-升序
    ascDesc: page.order,
    // 手机评论相关率，格式min_max
    commentPhonecntRatio: dataFilterResult.commentPhonecntRatio.length
      ? dataFilterResult.commentPhonecntRatio[0] + '_' + (dataFilterResult.commentPhonecntRatio[1] || '')
      : '',
    // 内容发布者标签
    contentAuthorTag: dataFilterResult.contentAuthorTag || [],
    // 发布者粉丝量，格式min_max
    contentAuthorFans: dataFilterResult.contentAuthorFans.length
      ? dataFilterResult.contentAuthorFans[0] + '_' + (dataFilterResult.contentAuthorFans[1] || '')
      : '',
    // 内容品牌
    contentBrand: contentFilterResult.brand || [],
    // 内容品牌情感
    contentBrandEmotions: contentFilterResult.brandEmotion || [],
    // 内容评论量，格式min_max
    contentCommentcnt: dataFilterResult.contentCommentcnt.length
      ? dataFilterResult.contentCommentcnt[0] + '_' + (dataFilterResult.contentCommentcnt[1] || '')
      : '',
    // 内容点赞量，格式min_max
    contentDiggcnt: dataFilterResult.contentDiggcnt.length
      ? dataFilterResult.contentDiggcnt[0] + '_' + (dataFilterResult.contentDiggcnt[1] || '')
      : '',
    // 内容互动量，格式min_max
    contentIntercnt: dataFilterResult.contentIntercnt.length
      ? dataFilterResult.contentIntercnt[0] + '_' + (dataFilterResult.contentIntercnt[1] || '')
      : '',
    // 内容是否多主体，是，否
    contentMultiphone:
      contentFilterResult.multiAgentContents === '是' || contentFilterResult.multiAgentContents === '否'
        ? [contentFilterResult.multiAgentContents]
        : [],
    // 内容手机相关，是，否
    contentAboutphone:
      contentFilterResult.contentAboutphone === '是' || contentFilterResult.contentAboutphone === '否'
        ? [contentFilterResult.contentAboutphone]
        : [],
    // 内容机型系列
    contentPhone: contentFilterResult.contentModel || [],
    // 内容机型情感
    contentPhoneEmotions: contentFilterResult.modelEmotion || [],
    //提及其他机型
    contentOtherPhone: contentFilterResult.contentOtherModel || [],
    //其他机型情感
    contentOtherPhoneEmotions: contentFilterResult.otherModelEmotion || [],
    // 内容开始发布日期：yyyy-MM-dd HH:mm:ss
    contentPublishTimeFrom: contentFilterResult.publicTime[0],
    // 内容结束发布日期：yyyy-MM-dd HH:mm:ss
    contentPublishTimeTo: contentFilterResult.publicTime[1],
    // 内容类型
    contentType: contentFilterResult.contentType,
    // 公关跟进状态
    followups: PRFollowFilterResult.PRFollowup || [],
    // 平台:toutiao,douyin,redbook,bilibili,weibo
    platform: platformList,
    orderByColumn: page.sortValue,
    // 热门评论负向数，格式min_max
    globalHotnegativecnt: dataFilterResult.globalHotnegativecnt.length
      ? dataFilterResult.globalHotnegativecnt[0] + '_' + (dataFilterResult.globalHotnegativecnt[1] || '')
      : '',
    // 相对热门评论负向数，格式min_max
    relativeHotnegativecnt: dataFilterResult.relativeHotnegativecnt.length
      ? dataFilterResult.relativeHotnegativecnt[0] + '_' + (dataFilterResult.relativeHotnegativecnt[1] || '')
      : '',
    // samebrandCommentcntNps
    samebrandCommentcntNps: dataFilterResult.samebrandCommentcntNps.length
      ? dataFilterResult.samebrandCommentcntNps[0] + '_' + (dataFilterResult.samebrandCommentcntNps[1] || '')
      : '',
    // samebrandCommentcntRatio
    samebrandCommentcntRatio: dataFilterResult.samebrandCommentcntRatio.length
      ? dataFilterResult.samebrandCommentcntRatio[0] + '_' + (dataFilterResult.samebrandCommentcntRatio[1] || '')
      : '',
    // 评论负向数
    samebrandNegativecnt: dataFilterResult.samebrandNegativecnt.length
      ? dataFilterResult.samebrandNegativecnt[0] + '_' + (dataFilterResult.samebrandNegativecnt[1] || '')
      : '',
    // 评论负向率
    samebrandNegativecntRatio: dataFilterResult.samebrandNegativecntRatio.length
      ? dataFilterResult.samebrandNegativecntRatio[0] + '_' + (dataFilterResult.samebrandNegativecntRatio[1] || '')
      : ''
  }

  // 关键词搜索
  const keywordList = handleGetCompose()
  if (keywordList && keywordList.length > 0) {
    params.searchGroups = keywordList
  }
  //  获取以图搜图参数
  const { imageSimilarity, imageList } = composeFilterRef?.value?.handleGetImageFilterContent()
  if (imageList.length) {
    Object.assign(params, { imageSimilarity, imageIdList: imageList.map((item: IOcsRes) => item.id) })
  }

  // 新加筛选条件
  if (dataFilterResult.status && dataFilterResult.status.length > 0) {
    params.status = dataFilterResult.status
  }
  if (dataFilterResult.origins && dataFilterResult.origins.length > 0) {
    params.origins = dataFilterResult.origins
  }
  if (dataFilterResult.isOriginal && dataFilterResult.isOriginal.length > 0) {
    params.isOriginal = dataFilterResult.isOriginal
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
  if (dataFilterResult.similarityNum && dataFilterResult.similarityNum.length > 0) {
    params.similarityNum = `${dataFilterResult.similarityNum[0]}_${dataFilterResult.similarityNum[1] || ''}`
  }
  if (dataFilterResult.publishProvinces && dataFilterResult.publishProvinces.length > 0) {
    params.publishProvinces = dataFilterResult.publishProvinces
  }
  if (dataFilterResult.publishCitys && dataFilterResult.publishCitys.length > 0) {
    params.publishCitys = dataFilterResult.publishCitys
  }
  if (dataFilterResult.nlpBrands && dataFilterResult.nlpBrands.length > 0) {
    params.nlpBrands = dataFilterResult.nlpBrands
  }
  if (dataFilterResult.nlpModels && dataFilterResult.nlpModels.length > 0) {
    params.nlpModels = dataFilterResult.nlpModels
  }
  if (dataFilterResult.authorProvinces && dataFilterResult.authorProvinces.length > 0) {
    params.authorProvinces = dataFilterResult.authorProvinces
  }
  if (dataFilterResult.authorCitys && dataFilterResult.authorCitys.length > 0) {
    params.authorCitys = dataFilterResult.authorCitys
  }

  return params
}

const handleToDownload = () => {
  const params = getCommonParams() as any
  // 默认下载排序 内容评论量 降序
  if (!params.ascDesc) {
    params.ascDesc = 'DESC'
    params.orderByColumn = 'content_commentcnt'
  }
  // if (page.searchType === 'contentTitle') {
  //   // 合并数组
  //   if (page.keywords && !page.keywordsTagList.includes(page.keywords)) {
  //     page.keywordsTagList.push(page.keywords)
  //     page.keywords = ''
  //   }
  //   params.contentTitles = page.keywordsTagList
  //   // params.contentTitle = page.keywords
  // } else if (page.searchType === 'contentAuthor') {
  //   params.contentAuthor = page.keywords
  // } else if (page.searchType === 'matchId') {
  //   params.matchIds = page.keywords ? page.keywords.split(',') : []
  // }

  params.download = true
  params.totalRecords = page.pageTotal
  page.loading = true
  downloadOpinionContentList(params)
    .then((blob: Blob) => {
      if (blob instanceof Blob) {
        const blobUrl = URL.createObjectURL(blob)
        customDownload(blobUrl, '内容实时舆情Excel.xlsx')
      }
    })
    .finally(() => {
      page.loading = false
    })
}
const getTableData = async () => {
  const params = getCommonParams() as any
  params.pageSize = page.pageSize
  params.pageNumber = page.pageNumber
  // if (page.searchType === 'contentTitle') {
  //   // 合并数组
  //   if (page.keywords && !page.keywordsTagList.includes(page.keywords)) {
  //     page.keywordsTagList.push(page.keywords)
  //     page.keywords = ''
  //   }
  //   params.contentTitles = page.keywordsTagList
  //   // params.contentTitle = page.keywords
  // } else if (page.searchType === 'contentAuthor') {
  //   params.contentAuthor = page.keywords
  // } else if (page.searchType === 'matchId') {
  //   params.matchIds = page.keywords ? page.keywords.split(',') : []
  // }
  page.loading = true
  const res = await getOpinionContentList(params)
  if (res && res.data && res.data.length > 0) {
    res.data.forEach((item: any) => {
      item.contentTypes = item.contentType ? item.contentType.split(',') : []
      item.contentBrandemotions = item.contentBrandemotion ? item.contentBrandemotion.split(',') : []
      item.contentOtherPhoneemotions = item.contentOtherPhoneemotion ? item.contentOtherPhoneemotion.split(',') : []
      item.contentPhoneemotions = item.contentPhoneemotion ? item.contentPhoneemotion.split(',') : []
      item.contentAuthorTags = item.contentAuthorTag ? item.contentAuthorTag.split(',') : []
      // 错误图片处理
      item.srcError = CONTENT_DEFAULT_IMAGE_MAP[item.platform]
      // 公关进度
      item.followupStatus = ''
    })
    page.tableData = res.data
    page.pageTotal = res.totalRecords
  } else {
    page.tableData = []
    page.pageTotal = 0
  }
  // page.updateTime = res && res.daynohr ? res.daynohr : ''
  page.pageTotalContent = res && res.totalContentNum ? res.totalContentNum : 0
  page.loading = false

  getLastTime()
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
  getTableData()
  nextTick(() => {
    tableRef.value?.scrollTo(0, 0)
  })
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

// 公关跟进
const handleFollowup = (row: any, index: number) => {
  const { platform, commentId, matchId } = row
  page.followupVisible = true
  page.currentObj = {
    platform,
    commentId: matchId,
    type: 'content',
    ...row
  }
  page.followupIndex = index
}
const handleCloseFollowupDialog = (type: boolean) => {
  page.currentObj = {}
  page.followupVisible = false
  if (type) {
    page.tableData[page.followupIndex].followup = type
    // getTableData()
    // getFilterList()
  }
}
const handleChangeFollowup = (val: any, row: any, index: number) => {
  const params = {
    followup: val,
    platform: row.platform,
    itemId: row.matchId,
    type: 'content'
  }
  editOpinionFollowup(params).then((res: any) => {
    if (res) {
      globalProperties.$message.success('操作成功')
      // getTableData()
      page.tableData[index].followup = val
    }
  })
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
//以图搜图  参数回显
const handleSetImageParams = (imageSimilarity: number, imageList: any[]) => {
  composeFilterRef.value?.handleSetImageFilterContent(imageSimilarity, imageList)
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
  const platformListArr: any = [...platformFilterResult.platformList]
  // 注入渠道平台
  if (platformRef.value && platformRef.value.length > 0) {
    platformRef.value.forEach((item: any) => {
      platformListArr.push({
        isOther: true, // 标识是其他非核心渠道
        checked: true,
        label: item,
        value: item
      })
    })
  }

  const params: any = {
    // keywords: page.keywords,
    // searchType: page.searchType,
    platformList: platformListArr,
    contentFilterResult: contentFilterResult,
    // contentModelList: filterCondition.contentModelList,
    dataFilterResult,
    PRFollowFilterResult
  }
  // // 判断下类型
  // if (page.searchType === 'contentTitle') {
  //   params.keywords = page.keywordsTagList
  // }

  // 处理关键词组合
  const compose = handleGetCompose(2)
  if (compose && compose.composeItem && compose.composeItem.length > 0) {
    params.compose = compose
  }

  //  获取以图搜图参数
  const { imageSimilarity, imageList } = composeFilterRef?.value?.handleGetImageFilterContent()
  if (imageList.length) {
    Object.assign(params, {
      imageSimilarity,
      imageList: imageList.map((item: filterCondition) => {
        return { id: item.id, name: item.name }
      })
    })
  }

  return params
}
const handleSetFilterCondition = (res: any) => {
  // page.searchType = res.searchType || 'contentTitle'
  // if (Array.isArray(res.keywords)) {
  //   page.keywordsTagList = JSON.parse(JSON.stringify(res.keywords))
  // } else {
  //   page.keywords = res.keywords || ''
  // }

  if (res.contentFilterResult) {
    for (const key in res.contentFilterResult) {
      contentFilterResult[key] = res.contentFilterResult[key]
    }
    // filterCondition.contentModelList = res.contentModelList || []
    // nextTick(() => {
    //   if (res.contentFilterResult.brand && res.contentFilterResult.brand.length > 0) {
    //     contentFilterResult['contentModel'] = res.contentFilterResult['contentModel'] || []
    //   }
    // })
  }
  if (res.dataFilterResult) {
    for (const key in res.dataFilterResult) {
      dataFilterResult[key] = res.dataFilterResult[key]
    }
  }
  if (res.PRFollowFilterResult) {
    for (const key in res.PRFollowFilterResult) {
      PRFollowFilterResult[key] = res.PRFollowFilterResult[key]
    }
  }
  if (res.platformList) {
    const platformCore: any = []
    const platformOther: any = []
    res.platformList.forEach((item: any) => {
      if (item.isOther) {
        platformOther.push(item.value)
      } else {
        platformCore.push(item)
      }
    })

    platformFilterResult.platformList = platformCore
    platformRef.value = platformOther
  }

  // 加入排序
  if (res.orderByColumn && res.orderByAscDesc) {
    page.sortValue = res.orderByColumn
    page.order = res.orderByAscDesc
  }
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
  if (!['martech.qqer.me', 'martech.heytap.com'].includes(window.location.hostname)) {
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
      currentURL = currentURL.replace('martech.qqer.me', 'martech.heytap.com')
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
      // 以图搜索
      if (res.imageList?.length) {
        handleSetImageParams(res.imageSimilarity, res.imageList)
      }

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
  delete paramsCondition.contentFilterResult.publicTime

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

  // // 搜索关键词
  // let searchLabel = ''
  // if (paramsCondition.searchType && paramsCondition.keywords) {
  //   for (let i = 0; i < page.searchTypeList.length; i++) {
  //     if (page.searchTypeList[i].value === paramsCondition.searchType) {
  //       searchLabel = page.searchTypeList[i].label
  //       break
  //     }
  //   }
  //   if (searchLabel) {
  //     searchLabel += `：${paramsCondition.keywords}`
  //   }
  // }

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
  if (paramsCondition.imageList?.length) {
    filterCondition.push({
      name: `图片搜索-相似度(${paramsCondition.imageSimilarity * 100}%)`,
      type: 'image',
      key: '',
      list: paramsCondition.imageList,
      deleteKeyList: '',
      deleteKeyListValue: []
    })
  }

  Object.keys(contentFilterResult).forEach((key: any) => {
    // 排除数据
    if (!['publicTime'].includes(key)) {
      filterCondition.push({
        name: contentFilterMap[key],
        type: 'content',
        key: key,
        list: getLabelName(contentFilterResult[key], key, 'content'),
        deleteKeyList: 'contentFilterResult',
        deleteKeyListValue: ['multiAgentContents', 'contentAboutphone'].includes(key) ? '' : []
      })
    }
  })

  Object.keys(dataFilterResult).forEach((key: any) => {
    filterCondition.push({
      name: dataFilterMap[key],
      type: 'data',
      key: key,
      list: getLabelName(dataFilterResult[key], key, 'data'),
      deleteKeyList: 'dataFilterResult',
      deleteKeyListValue: []
    })
  })

  Object.keys(PRFollowFilterResult).forEach((key: any) => {
    filterCondition.push({
      name: PRFollowFilterMap[key],
      type: 'PR',
      key: key,
      list: getLabelName(PRFollowFilterResult[key], key, 'PR'),
      deleteKeyList: 'PRFollowFilterResult',
      deleteKeyListValue: []
    })
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
  // page.refreshFilterTemplate = false
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

  const publicTimeDefault = [
    globalProperties.$dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    globalProperties.$dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
  ]

  // 初始搜索框
  // page.keywords = ''
  // page.keywordsTagList = []
  // page.searchType = 'contentTitle'

  if (item) {
    // 处理时间
    if (item.templateCondition && item.templateCondition.templateTime) {
      const publicTime = timeScopeObj[item.templateCondition.templateTime]
      if (publicTime) {
        item.content.contentFilterResult.publicTime = publicTime()
      } else {
        // 默认时间
        item.content.contentFilterResult.publicTime = publicTimeDefault
      }
    }

    handleSetFilterCondition(item.content)
  } else {
    // 复原-初始化
    platformFilterResult.platformList = JSON.parse(JSON.stringify(PLATFORM_CORE))
    platformRef.value = []
    // deleteFilterTag('platform', '')

    Object.keys(contentFilterResult).forEach((key: any) => {
      deleteFilterTag('content', key)
    })
    contentFilterResult.publicTime = publicTimeDefault
    contentFilterResult.contentAboutphone = '是'

    Object.keys(dataFilterResult).forEach((key: any) => {
      deleteFilterTag('data', key)
    })

    Object.keys(PRFollowFilterResult).forEach((key: any) => {
      deleteFilterTag('PR', key)
    })
  }

  // 关键词复原
  const compose = item && item.content && item.content.compose ? item.content.compose : ''
  handleSetCompose(compose)
  // 以图搜索
  if (item.content.imageList?.length) {
    handleSetImageParams(item.content.imageSimilarity, item.content.imageList)
  }

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

// 扩展外部跳转过来的
const getFilterFromOuter = async () => {
  // 包括日期范围、渠道、品牌、机型、互动降序
  const {
    publicStartTime,
    publicEndTime,
    platform,
    contentBrand,
    contentModel,
    contentModelEmotion,
    contentModelOtherEmotion,
    orderByColumn,
    orderByAscDesc
  } = route.query as any

  if (publicStartTime && publicEndTime) {
    contentFilterResult.publicTime = [publicStartTime, publicEndTime]
  }
  // 品牌
  if (contentBrand) {
    const contentBrands = contentBrand.split(',')
    if (contentBrands.length > 0) {
      contentFilterResult.brand = contentBrands
    }
  }
  // 机型
  if (contentModel) {
    const contentModels = contentModel.split(',')
    if (contentModels.length > 0) {
      contentFilterResult.contentModel = contentModels
    }
  }
  // 机型情感
  if (contentModelEmotion) {
    const contentModelEmotions = contentModelEmotion.split(',')
    if (contentModelEmotions.length > 0) {
      contentFilterResult.modelEmotion = contentModelEmotions
    }
  }
  // 其他机型情感
  if (contentModelOtherEmotion) {
    const contentModelOtherEmotions = contentModelOtherEmotion.split(',')
    if (contentModelOtherEmotions.length > 0) {
      contentFilterResult.otherModelEmotion = contentModelOtherEmotions
    }
  }
  // 渠道
  if (platform) {
    const platforms = platform.split(',')
    if (platforms.length > 0) {
      const cores = platformFilterResult.platformList.map((item: any) => item.label)
      const platformCore: any = []
      const platformOther: any = []
      for (let i = 0; i < platforms.length; i++) {
        const platformsName = platforms[i]
        if (cores.includes(platformsName)) {
          // 核心渠道
          platformCore.push(platformsName)
        } else {
          platformOther.push(platformsName)
        }
      }

      if (platformCore.length > 0) {
        platformFilterResult.platformList.forEach((item: any) => {
          if (platformCore.includes(item.label)) {
            item.checked = true
          } else {
            item.checked = false
          }
        })
      }

      platformRef.value = platformOther
    }
  } else {
    // 如果没传都不选中
    platformFilterResult.platformList.forEach((item: any) => {
      item.checked = false
    })
    platformRef.value = []
  }

  // 排序
  if (orderByColumn && orderByAscDesc) {
    page.sortValue = orderByColumn
    page.order = orderByAscDesc

    // 下拉排序
    const customSortList = CUSTOM_SORT_LIST.map((item: any) => item.value)
    if (customSortList.includes(orderByColumn)) {
      page.customSort = orderByColumn
      page.customSortBy = orderByAscDesc

      getTableData()
    } else {
      // 手动触发排序
      const orderStr = orderByAscDesc === 'DESC' ? 'descending' : 'ascending'
      // 动态数据，需要nextTick执行完了才能生效
      await nextTick()
      tableRef.value?.sort(page.sortValue, orderStr)
    }
  } else {
    getTableData()
  }
}

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
// 统计分析
const handleOpenAnalysis = () => {
  const params = getCommonParams() as any
  params.pageSize = page.pageSize
  params.pageNumber = page.pageNumber
  // if (page.searchType === 'contentTitle') {
  //   // 合并数组
  //   if (page.keywords && !page.keywordsTagList.includes(page.keywords)) {
  //     page.keywordsTagList.push(page.keywords)
  //     page.keywords = ''
  //   }
  //   params.contentTitles = page.keywordsTagList
  //   // params.contentTitle = page.keywords
  // } else if (page.searchType === 'contentAuthor') {
  //   params.contentAuthor = page.keywords
  // } else if (page.searchType === 'matchId') {
  //   params.matchIds = page.keywords ? page.keywords.split(',') : []
  // }
  page.analysisObj = {
    params
  }
  page.analysisDrawerVisible = true
}
const handleCloseAnalysis = () => {
  page.analysisObj = {}
  page.analysisDrawerVisible = false
}

// 查看详情
const handleToDetail = (item: any) => {
  page.detailObj = {
    contentId: item.matchId,
    platform: item.platform,
    publishTime: item.contentPublishTime
  }
  page.detailDrawerVisible = true
}
const handleCloseDetail = () => {
  page.detailObj = {}
  page.detailDrawerVisible = false
}

// 最近更新时间
const getLastTime = async () => {
  const params: any = {}
  contentOpinionLastTime(params).then((res) => {
    if (res) {
      page.updateTime = res
    }
  })
}

watch(
  () => contentFilterResult.brand,
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
    getFilterFromOuter()
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
.custom-table-content {
  display: flex;
  align-items: center;

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

// .common-content:deep(.#{$namespace}-tag) {
//   white-space: normal;
//   height: auto;
//   line-height: 16px;
//   // padding: 5px;
// }
.common-content ::v-deep.#{$namespace}-tag {
  white-space: normal;
  height: auto;
  line-height: 16px;
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
</style>
