<script setup lang="ts">
import { z } from "zod";
import { useForm } from "@/composables/useForm";
import { onMounted } from "vue";

// 定义表单架构
const userSchema = z.object({
  name: z
    .string()
    .min(1, "姓名不能为空")
    .min(2, "姓名至少需要2个字符")
    .max(50, "姓名不能超过50个字符"),
  email: z
    .string()
    .min(1, "电子邮件不能为空")
    .email("请输入有效的电子邮件地址"),
  age: z
    .number({ coerce: true })
    .min(18, "年龄必须至少为18岁")
    .max(120, "年龄不能超过120岁"),
  website: z.string().url("请输入有效的URL").optional().or(z.literal("")),
  password: z.string().min(1, "密码不能为空").min(8, "密码必须至少为8个字符"),
  confirmPassword: z.string().min(1, "确认密码不能为空"),
});

// 添加确认密码验证
const formSchema = userSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "两次输入的密码不匹配",
    path: ["confirmPassword"],
  }
);

// 表单默认值
const defaultValues = {
  name: "",
  email: "",
  age: 18,
  website: "",
  password: "",
  confirmPassword: "",
};

// 使用自定义表单Hook
const { form, errors, isSubmitting, handleSubmit, validateField, validate } =
  useForm({
    schema: formSchema,
    defaultValues,
  });

// 添加组件挂载后的初始验证
onMounted(() => {
  validate();
});

// 提交处理
const onSubmit = handleSubmit((values) => {
  console.log(values);
  alert("表单提交成功！数据：" + JSON.stringify(values, null, 2));
});

// 即时验证函数

</script>

<template>
  <div class="p-6 max-w-2xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Zod表单验证示例</h1>
      <UButton to="/advanced" color="primary" variant="soft"
        >查看高级示例</UButton
      >
    </div>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <!-- 姓名字段 -->
      <div>
        <UFormGroup label="姓名" :error="errors.name">
          <UInput
            v-model="form.name"
            placeholder="请输入姓名"
          />
        </UFormGroup>
      </div>

      <!-- 电子邮件字段 -->
      <div>
        <UFormGroup label="电子邮件" :error="errors.email">
          <UInput
            v-model="form.email"
            placeholder="请输入电子邮件"
          />
        </UFormGroup>
      </div>

      <!-- 年龄字段 -->
      <div>
        <UFormGroup label="年龄" :error="errors.age">
          <UInput
            v-model="form.age"
            type="number"
            placeholder="请输入年龄"
          />
        </UFormGroup>
      </div>

      <!-- 网站字段 -->
      <div>
        <UFormGroup label="网站 (可选)" :error="errors.website">
          <UInput
            v-model="form.website"
            placeholder="请输入网站URL"
          />
        </UFormGroup>
      </div>

      <!-- 密码字段 -->
      <div>
        <UFormGroup label="密码" :error="errors.password">
          <UInput
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
          />
        </UFormGroup>
      </div>

      <!-- 确认密码字段 -->
      <div>
        <UFormGroup label="确认密码" :error="errors.confirmPassword">
          <UInput
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
          />
        </UFormGroup>
      </div>

      <!-- 提交按钮 -->
      <div class="mt-6">
        <UButton type="submit" :loading="isSubmitting" color="primary" block>
          提交
        </UButton>
      </div>
    </form>

    <!-- 表单数据预览 -->
    <div class="mt-8 p-4 bg-gray-100 rounded">
      <h2 class="text-lg font-semibold mb-2">当前表单数据：</h2>
      <pre class="text-sm">{{ form }}</pre>
    </div>

    <!-- 错误信息预览 -->
    <div
      v-if="Object.keys(errors).length > 0"
      class="mt-4 p-4 bg-red-50 rounded"
    >
      <h2 class="text-lg font-semibold mb-2 text-red-700">验证错误：</h2>
      <pre class="text-sm text-red-600">{{ errors }}</pre>
    </div>
  </div>
</template>
