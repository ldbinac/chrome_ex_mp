# Quick Start Guide

快速开始使用 Multi-Domain Password Manager Chrome 扩展。

## 前置要求

- Node.js 16+ 和 npm
- Chrome 浏览器（90+ 版本）

## 5 分钟快速开始

### 步骤 1: 安装依赖

```bash
cd chrome_ex_mp
npm install
```

### 步骤 2: 生成图标

1. 在浏览器中打开 `icon-generator.html`
2. 点击 "Generate Icons" 按钮
3. 右键点击每个图标，选择"另存为图片"
4. 保存为以下文件名到 `src/icons/` 目录：
   - 16x16 图标 → `icon16.png`
   - 48x48 图标 → `icon48.png`
   - 128x128 图标 → `icon128.png`

### 步骤 3: 构建扩展

```bash
npm run build
```

### 步骤 4: 加载到 Chrome

1. 打开 Chrome 浏览器
2. 在地址栏输入 `chrome://extensions/` 并回车
3. 开启右上角的"开发者模式"开关
4. 点击"加载已解压的扩展程序"按钮
5. 选择项目根目录下的 `dist` 文件夹
6. 扩展已成功加载！

### 步骤 5: 首次使用

1. 点击浏览器工具栏中的扩展图标（🔐）
2. 设置主密码（至少 12 个字符，包含大小写字母、数字和特殊字符）
3. 开始使用！

## 常用命令

```bash
# 开发模式（自动重新构建）
npm run dev

# 生产构建
npm run build

# 运行测试
npm test

# 测试覆盖率
npm run test:coverage

# 代码检查
npm run lint

# 自动修复代码问题
npm run lint:fix

# 清理构建文件
npm run clean

# 重新构建
npm run rebuild
```

## 基本使用

### 保存密码

**自动保存：**
1. 访问任何登录页面
2. 输入用户名和密码
3. 点击登录
4. 扩展会提示保存密码
5. 点击"保存"按钮

**手动保存：**
1. 点击扩展图标
2. 点击"添加密码"
3. 填写域名、用户名和密码
4. 点击"保存"

### 填充密码

**自动填充：**
- 访问已保存密码的网站
- 扩展会自动检测并填充密码

**手动填充：**
1. 右键点击密码输入框
2. 选择"填充密码"
3. 选择要使用的账号

**Popup 选择：**
1. 点击扩展图标
2. 查看当前站点的密码列表
3. 点击"复制"或直接使用

### 管理密码

1. 点击扩展图标
2. 点击设置图标（⚙️）
3. 在"密码"标签页中：
   - 搜索密码
   - 编辑密码
   - 删除密码
   - 查看使用统计

### 生成强密码

1. 打开选项页面
2. 进入"生成器"标签页
3. 调整密码选项：
   - 长度（8-32 位）
   - 字符类型（大小写、数字、符号）
4. 点击"生成密码"
5. 复制或直接使用

### 备份和恢复

**导出：**
1. 打开选项页面
2. 进入"备份"标签页
3. 点击"导出数据"
4. 下载 JSON 文件

**导入：**
1. 打开选项页面
2. 进入"备份"标签页
3. 点击"导入数据"
4. 粘贴之前导出的 JSON 数据
5. 点击"导入"

## 常见问题

### Q: 扩展无法加载？
A: 确保：
- 已运行 `npm run build`
- `dist` 文件夹包含所有必要文件
- Chrome 版本为 90 或更高

### Q: 密码无法自动填充？
A: 检查：
- 是否已解锁扩展（输入主密码）
- 网站是否在支持的列表中
- 表单字段是否被正确识别

### Q: 忘记主密码怎么办？
A: 很抱歉，无法恢复主密码。这是为了安全考虑。您需要：
- 删除扩展
- 重新安装
- 重新设置主密码
- 从备份恢复数据（如果有）

### Q: 如何在不同设备间同步？
A: 启用 Chrome 同步：
1. 在 Chrome 中登录您的 Google 账户
2. 启用 Chrome 同步
3. 扩展会自动同步加密数据

### Q: 数据安全吗？
A: 是的，数据非常安全：
- 所有密码使用 AES-256-GCM 加密
- 加密在您的设备上进行
- 主密码不存储，只存储哈希
- 数据不发送到外部服务器

## 开发者快速参考

### 项目结构

```
src/
├── services/      # 核心业务逻辑
├── background/    # 后台服务
├── content/       # 内容脚本
├── popup/         # 弹出界面
├── options/       # 选项页面
├── utils/         # 工具函数
└── __tests__/     # 测试文件
```

### 添加新功能

1. 在 `src/types/index.ts` 中定义类型
2. 在 `src/services/` 中实现服务逻辑
3. 在 `src/background/index.ts` 中添加消息处理
4. 在 UI 组件中添加界面
5. 编写测试
6. 运行 `npm run lint` 检查代码

### 调试

**后台脚本：**
- `chrome://extensions/` → 点击"Service worker"

**内容脚本：**
- 在任何页面右键 → 检查 → Sources → Content scripts

**Popup/Options：**
- 右键点击扩展界面 → 检查

## 获取帮助

- 📖 查看 [README.md](README.md) 了解详细信息
- 🛠️ 查看 [DEVELOPMENT.md](DEVELOPMENT.md) 了解开发指南
- 📋 查看 [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) 了解项目概述
- 🔒 查看 [PRIVACY.md](PRIVACY.md) 了解隐私政策

## 下一步

- 阅读完整文档：[README.md](README.md)
- 开始开发：[DEVELOPMENT.md](DEVELOPMENT.md)
- 准备发布：[RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md)

---

**享受安全的密码管理！** 🔐