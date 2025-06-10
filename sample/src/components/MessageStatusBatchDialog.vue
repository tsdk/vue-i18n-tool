<template>
  <el-dialog
    :close-on-click-modal="false"
    title="批量修改跟进状态"
    v-model="form.showDialog"
    width="520px"
    @close="handleClose()"
  >
    <el-form class="mt20" ref="formRef" :model="form" :rules="formRules" label-width="82px">
      <el-form-item label="跟进状态:" prop="status">
        <el-select placeholder="请选择跟进状态" v-model="form.status" @change="handleChangeStatus">
          <el-option v-for="(value, index) in ALARM_MESSAGE_STATUS" :key="index" :value="value" :label="value" />
        </el-select>
      </el-form-item>
      <el-form-item
        label="备注信息:"
        prop="remark"
        :rules="
          form.status === '已维护'
            ? [
                {
                  required: true,
                  message: '请填写备注信息',
                  trigger: 'blur'
                }
              ]
            : []
        "
      >
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="4"
          placeholder="请填写备注信息"
          maxlength="500"
          show-word-limit
        />
        <p class="dialog-tips-small">选择状态为“已维护”时，必须填写备注信息</p>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button :loading="form.loading" @click="handleSubmitForm(formRef)" type="primary">保存</el-button>
        <el-button @click="handleClose()">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { useCurrentInstance } from '@/hooks'
import { ALARM_MESSAGE_STATUS } from '@/views/information/alarm/message/constant'
import { alarmRecordStatus } from '@/api/information/alarm'

const { globalProperties } = useCurrentInstance()

const props = defineProps({
  isShowDialog: {
    type: Boolean,
    required: true,
    default: false
  },
  itemObj: {
    type: Object,
    required: true,
    default: () => {}
  }
})
const emit = defineEmits(['clickClose'])

watch(
  () => props.isShowDialog,
  (newValue) => {
    form.showDialog = newValue
    if (newValue) {
      setFormValue()
    } else {
      form.loading = false
    }
  }
)

const form = reactive({
  // 弹出框
  showDialog: false as any,
  loading: false,
  // 表单
  status: '',
  remark: ''
})
// 编辑赋值
const setFormValue = () => {
  // 恢复默认
  form.status = props.itemObj.status || ALARM_MESSAGE_STATUS[0]
  form.remark = props.itemObj.info || ''
}

// 表单验证
const formRef = ref<FormInstance>()
const formRules = reactive<FormRules>({
  status: [{ required: true, message: '请选择跟进状态', trigger: 'change' }]
})

const handleChangeStatus = (val: string) => {
  if (val !== '已维护') {
    formRef.value?.clearValidate()
  }
}
const handleSubmitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      handleFormateFormData()
    } else {
      console.log('error submit!', fields)
    }
  })
}
const handleFormateFormData = async () => {
  form.loading = true

  const params: any = {
    ids: props.itemObj.ids,
    info: form.remark,
    status: form.status
  }
  const res = await alarmRecordStatus(params)
  if (res) {
    globalProperties.$message({
      message: '操作成功',
      type: 'success'
    })
    handleClose(true)
  }
}
const handleClose = (item = false) => {
  emit('clickClose', item)
}
</script>
<style lang="scss" scoped>
.dialog-tips-small {
  margin-top: 5px;
  font-size: 12px;
  line-height: 12px;
  color: $custom-color-text-placeholder;
}
</style>
