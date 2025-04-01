<script setup lang="ts">
import { z } from "zod";
import { useForm } from "@/composables/useForm";
import { onMounted } from "vue";

const aaSchema = z.object({
  zipCode: z
    .string()
    .min(1, "邮政编码不能为空")
    .regex(/^\d{6}$/, "邮政编码必须为6位数字"),
});

// 定义内部架构
const AddressSchema = z.object({
  street: z
    .string()
    .min(1, "街道地址不能为空")
    .min(5, "街道地址至少需要5个字符"),
  city: z.string().min(1, "城市名称不能为空").min(2, "城市名称至少需要2个字符"),
  aa: aaSchema,
});

// 定义枚举值和联合类型
const UserRole = z.enum(["admin", "editor", "viewer"]);
const PaymentMethod = z.union([
  z.literal("creditCard"),
  z.literal("bankTransfer"),
  z.literal("alipay"),
  z.literal("wechatPay"),
]);

// 主表单架构
const formSchema = z
  .object({
    // 基本信息
    fullName: z.string().min(2, "姓名至少需要2个字符"),

    // 枚举值
    role: UserRole,

    // 联合类型
    paymentMethod: PaymentMethod,

    // 数组
    interests: z.array(z.string()).min(1, "请至少选择一个兴趣爱好"),

    // 嵌套对象
    address: AddressSchema,

    // 条件验证：如果选择了信用卡，则需要信用卡信息
    creditCardNumber: z.string().optional(),

    // 自定义时间格式
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "出生日期格式应为YYYY-MM-DD")
      .refine((date) => {
        try {
          const parsedDate = new Date(date);
          const today = new Date();
          return !isNaN(parsedDate.getTime()) && parsedDate < today;
        } catch {
          return false;
        }
      }, "出生日期必须是有效的过去日期"),
  })
  .refine(
    (data) => {
      // 如果选择了信用卡支付方式，则需要提供信用卡号
      if (data.paymentMethod === "creditCard") {
        return (
          !!data.creditCardNumber && /^\d{16}$/.test(data.creditCardNumber)
        );
      }
      return true;
    },
    {
      message: "如果选择了信用卡支付，请提供16位有效的信用卡号",
      path: ["creditCardNumber"],
    }
  );

// 表单默认值
const defaultValues = {
  fullName: "",
  role: "viewer" as const,
  paymentMethod: "alipay" as const,
  interests: [],
  address: {
    street: "",
    city: "",
    aa: {
      zipCode: "",
    },
  },
  creditCardNumber: "",
  birthDate: "",
};

// 兴趣选项
const interestOptions = [
  { label: "阅读", value: "reading" },
  { label: "音乐", value: "music" },
  { label: "运动", value: "sports" },
  { label: "烹饪", value: "cooking" },
  { label: "旅行", value: "travel" },
  { label: "编程", value: "coding" },
];

// 角色选项
const roleOptions = [
  { label: "管理员", value: "admin" },
  { label: "编辑", value: "editor" },
  { label: "浏览者", value: "viewer" },
];

// 支付方式选项
const paymentOptions = [
  { label: "信用卡", value: "creditCard" },
  { label: "银行转账", value: "bankTransfer" },
  { label: "支付宝", value: "alipay" },
  { label: "微信支付", value: "wechatPay" },
];

// 使用自定义表单Hook
const { form, errors, isSubmitting, handleSubmit, validateField, validate } =
  useForm({
    schema: formSchema,
    defaultValues,
    enabled: { dynamicValid: true },
  });

watch(errors, (newVal) => {
  console.log(newVal);
});

// 添加组件挂载后的初始验证
onMounted(() => {
  // validate();
});

// 提交处理
const onSubmit = handleSubmit((values) => {
  console.log(values);
  alert("表单提交成功！数据：" + JSON.stringify(values, null, 2));
});

// 即时验证函数
const validateStreet = () => {
  validateField("address.street");
};

const validateCity = () => {
  validateField("address.city");
};

const validateZipCode = () => {
  validateField("address.zipCode");
};
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Zod高级表单验证示例</h1>
      <p class="text-gray-600 mt-2">
        展示更复杂的Zod验证场景，包括嵌套对象、数组、枚举和条件验证
      </p>
      <UButton to="/" variant="link" class="mt-2">返回基础示例</UButton>
    </div>

    <form @submit.prevent="onSubmit" class="space-y-6">
      <!-- 基本信息部分 -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h2 class="text-lg font-semibold mb-4">基本信息</h2>

        <UFormGroup label="姓名" :error="errors.fullName">
          <UInput v-model="form.fullName" placeholder="请输入姓名" />
        </UFormGroup>

        <UFormGroup label="出生日期" :error="errors.birthDate" class="mt-4">
          <UInput v-model="form.birthDate" type="date" />
        </UFormGroup>
      </div>

      <!-- 角色和权限部分 -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h2 class="text-lg font-semibold mb-4">角色和权限</h2>

        <UFormGroup label="用户角色" :error="errors.role">
          <URadioGroup v-model="form.role" :options="roleOptions" />
        </UFormGroup>

        <UFormGroup label="兴趣爱好" :error="errors.interests" class="mt-4">
          <UCheckbox
            v-for="option in interestOptions"
            :key="option.value"
            v-model="form.interests"
            :name="option.value"
            :label="option.label"
            :value="option.value"
          />
        </UFormGroup>
      </div>

      <!-- 地址信息部分 -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h2 class="text-lg font-semibold mb-4">地址信息</h2>

        <UFormGroup label="街道地址" :error="errors['address.street']">
          <UInput
            v-model="form.address.street"
            placeholder="请输入街道地址"
            @input="validateStreet"
          />
        </UFormGroup>

        <div class="grid grid-cols-2 gap-4 mt-4">
          <UFormGroup label="城市" :error="errors['address.city']">
            <UInput v-model="form.address.city" placeholder="请输入城市" />
          </UFormGroup>

          <UFormGroup label="邮政编码" :error="errors['address.aa.zipCode']">
            <UInput
              v-model="form.address.aa.zipCode"
              placeholder="请输入6位邮政编码"
            />
          </UFormGroup>
        </div>
      </div>

      <!-- 支付信息部分 -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h2 class="text-lg font-semibold mb-4">支付信息</h2>

        <UFormGroup label="支付方式" :error="errors.paymentMethod">
          <URadioGroup v-model="form.paymentMethod" :options="paymentOptions" />
        </UFormGroup>

        <!-- 条件显示：仅当选择信用卡时显示 -->
        <div v-if="form.paymentMethod === 'creditCard'" class="mt-4">
          <UFormGroup label="信用卡号" :error="errors.creditCardNumber">
            <UInput
              v-model="form.creditCardNumber"
              placeholder="请输入16位信用卡号"
              maxlength="16"
            />
          </UFormGroup>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div>
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
