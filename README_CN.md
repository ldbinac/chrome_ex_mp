# Multi-Domain Password Manager - Project Summary

[View English Version](./README.md)

## 项目概述

Multi-Domain Password Manager 是一款专为解决企业内部多二级域名系统密码管理冲突问题而设计的 Chrome 浏览器扩展。

### 核心问题

在企业环境中，存在多个采用不同二级域名部署的测试服务系统（如 a.abc.com、b.abc.com、c.abc.com 等），用户在不同系统中使用相同用户名（如 admin）但不同密码时，浏览器默认密码管理器会导致密码被覆盖，无法正确记住各系统的独立密码。

### 解决方案

本扩展实现了基于完整域名（包括二级域名）+ 用户名的多维度密码存储体系，确保不同子域名的密码即使用户名相同也能独立存储。

## 技术架构

### 前端技术栈
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Material-UI 5** - UI 组件库
- **Webpack 5** - 构建工具

### 核心技术
- **Web Crypto API** - 加密解密
- **Chrome Extension API** - 扩展功能
- **Chrome Storage API** - 数据持久化
- **Manifest V3** - 扩展规范

### 相关文档
- [Chrome 扩展开发指南](https://developer.chrome.com/docs/extensions/)（英文）
- [Chrome 扩展中文文档](https://developer.chrome.com/docs/extensions/reference/)（英文，可使用浏览器翻译）

### 安全特性
- **AES-256-GCM** - 加密算法
- **PBKDF2** - 密钥派生（100,000 次迭代）
- **零知识架构** - 无法访问明文密码
- **随机 IV** - 每次加密使用唯一初始化向量

### Web Crypto API 文档
- [MDN Web Docs - Web Crypto API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Crypto_API)（中文）

## 项目结构

```
chrome_ex_mp/
├── manifest.json              # Chrome 扩展清单
├── package.json               # 项目依赖和脚本
├── webpack.config.js          # Webpack 配置
├── tsconfig.json              # TypeScript 配置
├── jest.config.js             # Jest 测试配置
├── icon-generator.html        # 图标生成工具
├── README.md                  # 主文档
├── DEVELOPMENT.md             # 开发指南
├── CHANGELOG.md              # 变更日志
├── PRIVACY.md                # 隐私政策
├── LICENSE                   # MIT 许可证
├── RELEASE_CHECKLIST.md       # 发布检查清单
├── src/
│   ├── types/                 # TypeScript 类型定义
│   ├── services/              # 核心服务
│   │   ├── CryptoService.ts   # 加密/解密服务
│   │   ├── StorageService.ts  # 存储服务
│   │   ├── DomainService.ts   # 域名服务
│   │   └── PasswordGeneratorService.ts  # 密码生成器
│   ├── background/            # 后台服务工作者
│   ├── content/               # 内容脚本
│   ├── popup/                 # 弹出界面
│   ├── options/               # 选项页面
│   ├── utils/                 # 工具函数
│   ├── __tests__/             # 测试文件
│   └── icons/                 # 图标资源
└── dist/                      # 构建输出
```

### 存储 API 文档
- [Chrome Storage API 文档](https://developer.chrome.com/docs/extensions/reference/storage/)（英文，可使用浏览器翻译）

## 核心功能

### 1. 密码存储与区分
- ✅ 基于完整域名（含二级域名）的密码存储
- ✅ 多维度标识：域名 + 用户名 + 页面路径（可选）
- ✅ 密码元数据：创建时间、最后使用时间、使用次数、备注
- ✅ 分组管理：按顶级域名或自定义分组
- ✅ 标签系统：灵活的密码分类

### 2. 自动填充
- ✅ 智能表单检测
- ✅ 自动填充用户名和密码
- ✅ 多账号选择器
- ✅ 右键菜单快速填充
- ✅ 密码字段识别（支持动态表单）

### 3. 用户界面
- ✅ Popup 界面：当前站点密码列表
- ✅ Options 页面：完整密码管理界面
- ✅ 搜索过滤：按域名、用户名、标签搜索
- ✅ 密码可见性切换
- ✅ 一键复制密码
- ✅ 响应式设计

### 4. 密码管理
- ✅ 添加/编辑/删除密码
- ✅ 批量操作支持
- ✅ 导入/导出功能（加密格式）
- ✅ 使用统计追踪
- ✅ 备注和标签

### 5. 密码生成器
- ✅ 可自定义长度（8-32 位）
- ✅ 可选字符类型（大小写、数字、符号）
- ✅ 密码强度检测
- ✅ 强度建议

### 6. 安全功能
- ✅ 主密码保护
- ✅ AES-256-GCM 加密
- ✅ PBKDF2 密钥派生
- ✅ 自动锁定（可配置超时）
- ✅ 生物识别支持（可选）
- ✅ 零知识架构

### 7. 同步与备份
- ✅ Chrome Storage API 跨设备同步
- ✅ 本地加密存储
- ✅ 导入/导出备份
- ✅ 数据完整性验证

## 已完成功能清单

### 高优先级任务 ✅
- [x] 创建 Chrome 扩展项目基础结构
- [x] 配置开发环境（React + TypeScript + Webpack）
- [x] 创建基础 UI 框架（Popup、Options 页面）
- [x] 实现加密模块（Web Crypto API 封装）
- [x] 实现密码存储模块（Chrome Storage API）
- [x] 实现域名识别模块（完整域名解析）
- [x] 实现自动填充模块（表单检测和填充）
- [x] 实现 Content Script（页面内密码字段识别）
- [x] 实现 Background Service Worker（消息处理）

### 中优先级任务 ✅
- [x] 开发 Popup 界面（当前站点密码列表）
- [x] 开发 Options 页面（完整密码管理界面）
- [x] 实现右键菜单功能
- [x] 实现多账号支持
- [x] 实现搜索过滤功能
- [x] 实现跨设备同步
- [x] 性能优化和错误处理
- [x] 编写测试用例

### 低优先级任务 ✅
- [x] 实现密码生成器
- [x] 实现导入导出功能
- [x] 打包和发布准备

## 测试覆盖

### 单元测试
- ✅ CryptoService 测试（加密/解密、哈希、UUID 生成）
- ✅ DomainService 测试（域名解析、验证、规范化）
- ✅ PasswordGeneratorService 测试（密码生成、强度检测）
- ✅ Validator 测试（密码、域名、URL 验证）

### 测试框架
- ✅ Jest 配置
- ✅ Chrome API Mock
- ✅ 覆盖率目标：70%

## 文档

### 用户文档
- ✅ README.md - 项目介绍和使用说明
- ✅ PRIVACY.md - 隐私政策

### 开发文档
- ✅ DEVELOPMENT.md - 开发指南和架构说明
- ✅ 代码注释 - TypeScript 类型定义和 JSDoc

### 发布文档
- ✅ CHANGELOG.md - 变更日志
- ✅ RELEASE_CHECKLIST.md - 发布检查清单
- ✅ LICENSE - MIT 许可证

### 工具文档
- ✅ icon-generator.html - 图标生成工具
- ✅ src/icons/README.md - 图标生成说明

## 安全措施

### 数据加密
- 所有密码使用 AES-256-GCM 加密
- 每条记录使用随机 IV
- 密钥通过 PBKDF2 从主密码派生
- 主密码哈希存储，明文不存储

### 访问控制
- 主密码保护
- 自动锁定机制
- 可选生物识别
- 操作日志记录

### 浏览器安全
- Manifest V3 规范
- 最小权限原则
- 无远程代码执行
- 内容脚本隔离

## 性能优化

### 实现的优化
- ✅ 防抖（Debounce）和节流（Throttle）
- ✅ 缓存机制（Cache）
- ✅ 批处理（BatchProcessor）
- ✅ 性能监控（PerformanceMonitor）

### 性能指标
- Popup 打开：< 100ms
- 密码填充：< 50ms
- 密码搜索：< 200ms（1000 条记录）
- 内存占用：< 50MB（空闲状态）

## 浏览器兼容性

### 已支持
- ✅ Chrome 90+
- ✅ Edge 90+（Chromium 内核）

### 待适配
- ⏳ Firefox 88+（需要 Manifest V3 适配）
- ⏳ Safari 14+（需要适配）

## 使用说明

### 安装步骤

1. **生成图标**
   ```bash
   # 打开 icon-generator.html 在浏览器中
   # 点击 "Generate Icons"
   # 保存三个 PNG 文件到 src/icons/
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **构建扩展**
   ```bash
   npm run build
   ```

4. **加载到 Chrome**
   - 打开 `chrome://extensions/`
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 `dist` 文件夹

### 首次使用

1. 点击扩展图标
2. 设置主密码
3. 开始使用

### 保存密码

- **自动保存**：登录后扩展会提示保存
- **手动保存**：在选项页面点击"添加密码"

### 填充密码

- **自动填充**：扩展检测登录表单并建议密码
- **手动填充**：右键点击密码字段选择"填充密码"
- **Popup 选择**：点击扩展图标查看当前站点密码

## 未来增强功能

### 计划中
- [ ] 团队共享功能
- [ ] 双因素认证集成
- [ ] 密码泄露监控
- [ ] 云备份选项
- [ ] 移动应用伴侣
- [ ] 浏览器自动填充 API 集成

### 技术债务
- [ ] Firefox 适配
- [ ] Safari 适配
- [ ] 更多语言支持
- [ ] 高级搜索功能
- [ ] 密码历史记录

## 贡献指南

### 开发流程
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

### 代码规范
- 遵循 ESLint 规则
- 编写单元测试
- 更新文档
- 遵循 TypeScript 最佳实践

## 许可证

MIT License - 详见 LICENSE 文件

关于 MIT 许可证的更多信息，请访问 [MIT License 文档](https://opensource.org/licenses/MIT)（英文，可使用浏览器翻译）。

## 联系方式

- GitHub Issues: [项目仓库地址]
- Email: [联系邮箱]

---

**项目状态**: ✅ 开发完成，准备发布
**最后更新**: 2024-02-10
**版本**: 1.0.0