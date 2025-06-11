<template>
  <div>
    <el-drawer v-model="page.visible" title="字幕与配音" size="50%" :before-close="handleClose">
      <template #header>
        <div>
          <h4 class="title">字幕与配音</h4>
          <div class="no-custom-tabs"></div>
        </div>
      </template>

      <div class="custom-detail-content common-content pd20">
        <h4 class="custom-title-line">添加字幕内容</h4>
        <div class="mt15">
          <!-- <CaptionEditInput /> -->
          <el-input
            v-for="(item, index) in page.subtitleList"
            :key="index"
            v-model="item.content"
            style="width: 100%"
            :rows="2"
            type="textarea"
            placeholder="请输入字幕内容"
          />
          <div class="caption-button" @click="handleAddSubtitle">
            <svg-icon name="smc-add" className="mr5"></svg-icon>
            添加字幕
          </div>
        </div>

        <h4 class="mt20">视频设置</h4>
        <div class="card-box mt20">
          <div class="card-title">
            <h4>字幕设置</h4>
            <el-switch v-model="page.isOpenSettingSubtitle"></el-switch>
          </div>
          <div class="card-content" v-show="page.isOpenSettingSubtitle">
            <div class="flex-row">
              <span class="card-text">字体设置：</span>
              <div class="flex-row">
                <el-select
                  v-model="page.fontFamily"
                  placeholder="字体"
                  @change="handleFontFamily"
                  style="width: 100px; margin-right: 15px"
                >
                  <el-option
                    v-for="item in page.fontOptions"
                    :key="item.object_id"
                    :label="item.fontFamily"
                    :value="item.fontFamily"
                    :style="{ 'font-family': item.fontFamily }"
                  >
                  </el-option>
                </el-select>
                <el-input-number
                  v-model="num"
                  :min="1"
                  :max="10"
                  placeholder="字号"
                  @change="handleChange"
                  class="mr15"
                />
                <el-tooltip content="粗体" raw-content>
                  <div class="text-style">
                    <svg-icon name="smc-text-bold"></svg-icon>
                  </div>
                </el-tooltip>
                <el-tooltip content="斜体" raw-content>
                  <div class="text-style">
                    <svg-icon name="smc-text-italic"></svg-icon>
                  </div>
                </el-tooltip>
              </div>
            </div>
            <div class="flex-row" style="align-items: flex-start; margin-top: 20px">
              <span class="card-text">花字设置：</span>
              <div class="text-flower" style="flex: 1">
                <div class="text-flower-content" :class="{ full: page.isOpenFlowerMore }">
                  <div class="text-flower-list">
                    <div class="text-flower-list-item">
                      <!-- <img
                        class="h-[30px] w-[30px]"
                        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDMwIDMwIiBmaWxsPSJub25lIj4KICA8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTI3LjE5NjYgMTQuODc1OEMyNy4xOTY2IDguMDcwOSAyMS42ODAxIDIuNTU0NDEgMTQuODc1MSAyLjU1NDQxQzguMDcwMiAyLjU1NDQxIDIuNTUzNzEgOC4wNzA5IDIuNTUzNzEgMTQuODc1OEMyLjU1MzcxIDIxLjY4MDggOC4wNzAyIDI3LjE5NzMgMTQuODc1MSAyNy4xOTczQzIxLjY4MDEgMjcuMTk3MyAyNy4xOTY2IDIxLjY4MDggMjcuMTk2NiAxNC44NzU4WiIgc3Ryb2tlPSIjNzM3QTg3IiBzdHJva2Utd2lkdGg9IjIuNDY0MjkiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgogIDxwYXRoIGQ9Ik02Ljg2NTk3IDIyLjg4NDhMMjIuNTc1OCA3LjE3NDk0IiBzdHJva2U9IiM3MzdBODciIHN0cm9rZS13aWR0aD0iMi40NjQyOSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg=="
                      /> -->
                    </div>
                  </div>
                </div>
                <div class="text-flower-bottom" @click="handleOpenFlowerMore(true)" v-show="!page.isOpenFlowerMore">
                  <svg-icon name="smc-arrow-down-solid"></svg-icon>
                  <span>展开更多</span>
                </div>
                <div
                  class="text-flower-bottom actived"
                  @click="handleOpenFlowerMore(false)"
                  v-show="page.isOpenFlowerMore"
                >
                  <svg-icon name="smc-arrow-up-solid"></svg-icon>
                  <span>收起更多</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card-box mt20">
          <div class="card-title">
            <h4>配音设置</h4>
            <el-switch v-model="page.isOpenSettingSemi"></el-switch>
          </div>
          <div class="card-content" v-show="page.isOpenSettingSemi">
            <div class="flex-row">
              <span class="card-text">时间设置：</span>
              <div class="flex-row">
                <span>第</span>
                <el-input-number
                  v-model="page.semiTime"
                  :min="0"
                  :precision="1"
                  :step="0.1"
                  placeholder="时间"
                  class="ml10 mr10"
                />
                <span>秒</span>
              </div>
            </div>
            <div class="flex-row" style="align-items: flex-start; margin-top: 20px">
              <span class="card-text">音色选择：</span>
              <!-- <div
                class="semi-row-flex semi-row-flex-space-between semi-row-flex-middle"
                x-semi-prop="children"
                style="
                  width: 284px;
                  border-radius: 4px;
                  background: rgb(246, 248, 250);
                  border: 1px solid rgba(0, 0, 0, 0.05);
                  padding: 12px;
                "
              >
                <div class="semi-row-flex semi-row-flex-middle" x-semi-prop="children">
                  <img
                    alt=""
                    style="width: 37px; margin-right: 12px"
                    src="https://lf-iccloud-muse.volcmusecdn.com/obj/labcv-tob/muse/tts_photo_male_new_3.png"
                  />
                  <div class="tone-info" style="display: flex; flex-direction: column; gap: 2px">
                    <span
                      class="semi-typography semi-typography-primary semi-typography-normal"
                      style="color: rgb(115, 122, 135)"
                      ><strong>重庆小伙</strong></span
                    ><span
                      class="semi-typography semi-typography-primary semi-typography-normal"
                      style="color: rgb(115, 122, 135); font-size: 12px"
                    ></span>
                  </div>
                </div>
                <button
                  class="semi-button semi-button-tertiary semi-button-borderless semi-button-with-icon semi-button-with-icon-only"
                  type="button"
                  aria-disabled="false"
                >
                  <span class="semi-button-content"
                    ><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                      <g clip-path="url(#mix-cut-exchange_svg__a)">
                        <path
                          fill="#41464F"
                          fill-rule="evenodd"
                          d="M17.5 6.98a.417.417 0 0 0-.417-.417H7.885V4a.25.25 0 0 0-.403-.197L2.72 7.509a.4.4 0 0 0-.104.118.416.416 0 0 0 .299.706h14.168c.23 0 .417-.186.417-.416zm-.075 4.862a.42.42 0 0 0-.339-.175H2.917a.417.417 0 0 0-.416.416v.938c0 .23.186.417.416.417h9.198V16a.25.25 0 0 0 .403.197l4.763-3.706a.4.4 0 0 0 .104-.118.416.416 0 0 0 .04-.531"
                          clip-rule="evenodd"
                        ></path>
                      </g>
                      <defs>
                        <clipPath id="mix-cut-exchange_svg__a"><path fill="#fff" d="M0 20V0h20v20z"></path></clipPath>
                      </defs></svg
                  ></span>
                </button>
              </div> -->
            </div>
            <div class="flex-row" style="height: 40px; align-items: flex-start; margin-top: 30px">
              <span class="card-text">音量调整：</span>
              <el-slider
                v-model="page.semiVolume"
                :min="0.5"
                :max="2"
                :precision="1"
                :step="0.1"
                :marks="page.semiVolumeMarks"
                class="custom-slider-semi"
              />
            </div>
            <div class="flex-row" style="height: 40px; align-items: flex-start; margin-top: 20px">
              <span class="card-text">语速调整：</span>
              <el-slider
                v-model="page.semiSpeed"
                :min="0.5"
                :max="2"
                :precision="1"
                :step="0.1"
                :marks="page.semiSpeedMarks"
                class="custom-slider-semi"
              />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div style="flex: auto; margin-top: 10px">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  isShowDrawer: {
    type: Boolean,
    default: false
  },
  captionObj: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const emit = defineEmits(['clickClose', 'clickSubmit'])

const page = reactive({
  visible: false,
  subtitleList: [] as any[],
  textContent: '',
  isOpenSettingSubtitle: true,
  fontFamily: '',
  fontSize: '',
  fontOptions: [
    {
      object_id: '1c0c082e-a832-4e6d-9ed5-43cb26e30fff',
      name: '阿里巴巴普惠体',
      url: 'http://ocs-cn-south.qqer.me/market-ai/file_save/custom_font/202406/df10f7fa-902e-48ef-811e-3161156cd424.ttf',
      fontFamily: 'AlibabaPuHuiTi-3-55-Regular'
    },
    {
      object_id: 'e04d658f-2491-47b0-8674-9794d83ec3d2',
      name: 'QQ字体',
      url: 'http://ocs-cn-south.qqer.me/market-ai/file_save/custom_font/202404/82119670-d842-486c-9631-e6a7d17708d1.ttf',
      fontFamily: 'OPlusSans3-Regular'
    }
  ] as any[],
  fontSizeOptionsCopy: [],
  lineHeightOptionsCopy: [],
  fontSizeOptions: [
    {
      value: 10,
      label: '10'
    },
    {
      value: 11,
      label: '11'
    },
    {
      value: 12,
      label: '12'
    },
    {
      value: 14,
      label: '14'
    },
    {
      value: 16,
      label: '16'
    },
    {
      value: 18,
      label: '18'
    },
    {
      value: 20,
      label: '20'
    },
    {
      value: 24,
      label: '24'
    },
    {
      value: 30,
      label: '30'
    },
    {
      value: 36,
      label: '36'
    },
    {
      value: 48,
      label: '48'
    },
    {
      value: 50,
      label: '50'
    },
    {
      value: 64,
      label: '64'
    },
    {
      value: 80,
      label: '80'
    },
    {
      value: 100,
      label: '100'
    }
  ],
  textColor: '',
  textStyle: [] as any[],
  textDecoration: [] as any[],
  isOpenFlowerMore: false,
  // 配音
  isOpenSettingSemi: true,
  semiTime: 0.0,
  semiVolume: 1,
  semiVolumeMarks: {
    0.5: '0.5',
    0.8: '0.8',
    1.1: '1.1',
    1.4: '1.4',
    1.7: '1.7',
    2: '2'
  },
  semiSpeed: 1,
  semiSpeedMarks: {
    0.5: '0.5',
    0.8: '0.8',
    1.1: '1.1',
    1.4: '1.4',
    1.7: '1.7',
    2: '2'
  }
})

watch(
  () => props.isShowDrawer,
  (newValue) => {
    page.visible = newValue

    if (newValue) {
      console.log(props.captionObj, 'props.captionObj')
      page.semiTime = props.captionObj.dubbing.start || 0.0
      page.semiVolume = props.captionObj.dubbing.volume || 1
      page.semiSpeed = props.captionObj.dubbing.speed || 1

      if (props.captionObj.subtitleList && props.captionObj.subtitleList.length > 0) {
        page.subtitleList = props.captionObj.subtitleList
      } else {
        handleAddSubtitle()
      }
    } else {
      // 还原
      page.semiTime = 0.0
      page.semiVolume = 1
      page.semiSpeed = 1
      page.subtitleList = []
    }
  }
)

const handleAddSubtitle = () => {
  page.subtitleList.push({
    content: ''
  })
}

const handleOpenFlowerMore = (bool: boolean) => {
  page.isOpenFlowerMore = bool
}

const handleSubmit = () => {
  const item = {
    index: props.captionObj.index,
    dubbing: {
      ...props.captionObj.dubbing,
      start: page.semiTime,
      volume: page.semiVolume,
      speed: page.semiSpeed
    },
    subtitleList: page.subtitleList
  }
  emit('clickSubmit', item)
}

/**关闭弹框 */
const handleClose = () => {
  emit('clickClose')
}
</script>

<style lang="scss" scoped>
.custom-detail-content {
  position: relative;

  .caption-button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 32px;
    margin-top: 15px;
    background-color: $custom-color-bg-page;
    cursor: pointer;

    &:hover {
      color: $custom-color-primary;
      background-color: $custom-color-bg-light;
    }
  }

  .card-box {
    border: 1px solid $custom-color-border-light;

    .card-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      background-color: $custom-color-bg-page;
    }

    .card-content {
      padding: 20px;
      border-top: 1px solid $custom-color-border-light;

      .card-text {
        width: 70px;
        margin-right: 10px;
        flex-shrink: 0;
      }

      .text-style {
        width: 32px;
        height: 32px;
        text-align: center;
        line-height: 32px;
        background: #f6f7f9;
        margin-right: 15px;
        cursor: pointer;

        .svg-icon {
          width: 14px;
          height: 14px;
          color: #666;
        }
      }
      .text-style:hover,
      .text-style.active {
        background: #eee;
        cursor: pointer;

        .svg-icon {
          color: $custom-color-primary;
        }
      }

      .text-flower-content {
        max-height: 116px;
        overflow-y: auto;

        &.full {
          max-height: none;
          overflow-y: hidden;
        }
      }
      .text-flower-list {
        align-items: center;
        display: grid;
        gap: 8px;
        grid-template-columns: repeat(auto-fill, 54px);
        justify-content: space-between;
        width: 100%;
      }
      .text-flower-list-item {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 54px;
        width: 54px;
        border: 1px solid $custom-color-border-light;
        border-radius: 6px;
        cursor: pointer;

        &:hover {
          background-color: $custom-color-bg-page;
          border: 1px solid $custom-color-primary;
        }
      }

      .text-flower-bottom {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 20px;
        margin-top: 15px;
        cursor: pointer;

        .svg-icon {
          color: #666;
        }
      }

      .text-flower-bottom.actived {
        color: $custom-color-primary;

        .svg-icon {
          color: $custom-color-primary;
        }
      }
    }
  }
}

.custom-slider-semi {
  max-width: 600px;
  height: auto;
}
</style>
