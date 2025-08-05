<template>
  <el-dialog
    v-model="state.visible"
    :title="state.modalTitle"
    width="500px"
    center
    append-to-body
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="节点名称" prop="title">
        <el-input v-model="formData.title" />
      </el-form-item>
      <el-form-item label="节点描述" prop="description">
        <el-input v-model="formData.description" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { RootDataItem } from '../graph/RootData';
import { FormInstance } from 'element-plus';

defineOptions({
  name: 'ModifyNodeDialog',
});

const emit = defineEmits<{
  (
    e: 'confirm',
    data: {
      id: string;
      title: string;
      description: string;
      isEdit: boolean;
    },
  ): void;
}>();

const state = reactive({
  visible: false,
  modalTitle: '',
  isEdit: false,
  currentData: {} as RootDataItem,
});

const formRef = ref<FormInstance>();

const formData = ref({
  title: '',
  description: '',
});

const rules = {
  title: [{ required: true, message: '请输入节点名称' }],
};

function open(options: { isEdit: boolean; data: RootDataItem }) {
  state.isEdit = options.isEdit;
  state.modalTitle = state.isEdit ? '编辑节点' : '添加子节点';
  state.currentData = options.data;

  if (state.isEdit) {
    Object.assign(formData.value, options.data);
  }

  state.visible = true;
}

async function handleConfirm() {
  const isValid = await formRef.value?.validate();

  if (!isValid) return;

  emit('confirm', {
    id: state.currentData.id,
    title: formData.value.title,
    description: formData.value.description,
    isEdit: state.isEdit,
  });

  state.visible = false;
}

function handleClose() {
  formRef.value?.resetFields();
  formData.value = {
    title: '',
    description: '',
  };
}

defineExpose({
  open,
});
</script>
