import { ref, reactive } from "vue";
import { z } from "zod";

interface UseFormOptions<T extends z.ZodTypeAny> {
  schema: T;
  defaultValues: z.infer<T>;
  enabled?: {
    dynamicValid?: boolean;
  };
}

export function useForm<T extends z.ZodTypeAny>({
  schema,
  defaultValues,
  enabled,
}: UseFormOptions<T>) {
  // 表单数据
  const form = reactive({ ...defaultValues } as z.infer<T>);

  // 表单错误
  const errors = reactive<Record<string, string>>({});

  // 提交状态
  const isSubmitting = ref(false);

  // 表单验证
  const validate = () => {
    // 清除先前的错误
    Object.keys(errors).forEach((key) => delete errors[key]);

    // 尝试验证表单
    const result = schema.safeParse(form);

    if (!result.success) {
      // 处理验证错误
      const formattedErrors = result.error.format();

      // 递归处理错误，支持嵌套对象
      const processErrors = (errObj: any, parentPath = "") => {
        if (!errObj || typeof errObj !== "object") return;

        // 处理当前级别的错误
        if (
          "_errors" in errObj &&
          Array.isArray(errObj._errors) &&
          errObj._errors.length > 0
        ) {
          if (parentPath) {
            errors[parentPath] = errObj._errors[0];
          }
        }

        // 递归处理嵌套错误
        Object.entries(errObj).forEach(([key, value]) => {
          if (key !== "_errors" && value && typeof value === "object") {
            const newPath = parentPath ? `${parentPath}.${key}` : key;
            processErrors(value, newPath);
          }
        });
      };

      // 开始处理错误
      processErrors(formattedErrors);

      // 处理refine验证错误
      if (formattedErrors._errors && formattedErrors._errors.length > 0) {
        const issue = result.error.issues.find(
          (issue) => issue.path.length > 0
        );
        if (issue && issue.path.length > 0) {
          // 构建完整的错误路径
          const path = issue.path.join(".");
          errors[path] = formattedErrors._errors[0];
        }
      }

      return false;
    }

    return true;
  };

  // 添加单个字段验证函数
  const validateField = (path: string) => {
    // 使用schema直接验证整个表单
    const result = schema.safeParse(form);
    if (!result.success) {
      const formattedErrors = result.error.format();
      // 查找对应路径的错误
      const pathParts = path.split(".");
      let errorObj: any = formattedErrors;

      // 逐级查找嵌套路径中的错误
      for (const part of pathParts) {
        if (errorObj && typeof errorObj === "object" && part in errorObj) {
          errorObj = errorObj[part];
        } else {
          errorObj = null;
          break;
        }
      }

      // 如果找到错误，更新errors对象
      if (
        errorObj &&
        typeof errorObj === "object" &&
        "_errors" in errorObj &&
        Array.isArray(errorObj._errors) &&
        errorObj._errors.length > 0
      ) {
        errors[path] = errorObj._errors[0];
        return false;
      } else {
        // 没有为这个字段找到错误，清除之前可能存在的错误
        delete errors[path];
      }
    } else {
      // 验证通过，清除之前可能存在的错误
      delete errors[path];
    }

    return true;
  };

  // 提交处理函数
  const handleSubmit = (
    onSubmit: (values: z.infer<T>) => void | Promise<void>
  ) => {
    return async () => {
      // 验证表单
      const isValid = validate();

      if (!isValid) {
        return;
      }

      try {
        isSubmitting.value = true;
        await onSubmit({ ...form });
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        isSubmitting.value = false;
      }
    };
  };

  const bindDynamicValid = (values: any, parent = "") => {
    for (const key in values) {
      if (typeof values[key] === "object") {
        parent.length === 0
          ? bindDynamicValid(values[key], key)
          : bindDynamicValid(values[key], `${parent}.${key}`);
      } else {
        watch(
          () => values[key],
          () => {
            parent.length === 0
              ? validateField(key)
              : validateField(`${parent}.${key}`);
          }
        );
      }
    }
  };

  if (enabled && enabled.dynamicValid) bindDynamicValid(form);

  return {
    form,
    errors,
    isSubmitting,
    validate,
    validateField,
    handleSubmit,
  };
}
