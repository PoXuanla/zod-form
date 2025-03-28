# Nuxt3 + Zod 表单验证示例

这个项目是一个用于学习 Zod 表单验证的 Nuxt3 示例应用。

## 功能特点

- 使用 Nuxt3 框架
- 使用 Zod 进行表单验证
- 自定义 `useForm` composable
- 使用 Nuxt UI 组件
- 演示常见表单验证场景:
  - 必填字段
  - 字符串长度限制
  - 电子邮件验证
  - 数字范围验证
  - URL 验证
  - 密码确认验证

## 安装步骤

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 查看应用。

## Zod 学习要点

1. **基本类型验证**

   - `z.string()` - 验证字符串
   - `z.number()` - 验证数字
   - `z.boolean()` - 验证布尔值

2. **字符串验证**

   - `.min(n)` - 最小长度
   - `.max(n)` - 最大长度
   - `.email()` - 验证邮箱格式
   - `.url()` - 验证 URL 格式

3. **数字验证**

   - `.min(n)` - 最小值
   - `.max(n)` - 最大值
   - `{ coerce: true }` - 自动转换为数字

4. **可选字段**

   - `.optional()` - 字段可选
   - `.or(z.literal(''))` - 允许空字符串

5. **复杂验证**
   - `.refine()` - 自定义验证规则，例如密码确认

## 项目结构

- `/composables/useForm.ts` - 自定义表单处理 hook
- `/pages/index.vue` - 主页面，包含表单示例

## 参考资源

- [Zod 官方文档](https://zod.dev/)
- [Nuxt3 文档](https://nuxt.com/)
- [Nuxt UI 文档](https://ui.nuxt.com/)
# zod-form
# zod-form
