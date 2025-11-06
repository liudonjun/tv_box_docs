---
outline: deep
---

# 源订阅规则

本文档介绍如何配置和管理 TV Box 视频源的订阅列表。

## 概述

源订阅系统允许通过 JSON 配置文件管理多个视频源。应用支持从本地文件或远程 URL 加载源列表，并自动缓存到本地。

## source.json 文件格式

`source.json` 是一个 JSON 数组，包含多个源配置对象。

### 基本结构

```json
[
  {
    "name": "源名称",
    "sourceKey": "unique_source_key",
    "version": "1.0.0",
    "icon": "https://example.com/icon.jpg",
    "description": "源描述信息",
    "jsSourceUrl": "https://example.com/source.js"
  },
  {
    "name": "另一个源",
    "sourceKey": "another_source_key",
    "version": "2.0.0",
    "icon": "https://example.com/icon2.jpg",
    "description": "另一个源的描述",
    "jsSourceUrl": "https://example.com/source2.js"
  }
]
```

## 字段说明

### 必需字段

#### name (string)

源名称，显示在应用界面中。

**示例：**

```json
"name": "金牌影院"
```

#### sourceKey (string)

源的唯一标识符，用于区分不同的源。建议使用小写字母、数字和下划线。

**规则：**

- 必须唯一
- 建议格式：`snake_case`（如：`jinpai_yuanyuan`）
- 不可包含空格和特殊字符

**示例：**

```json
"sourceKey": "jinpai_yuanyuan"
```

#### version (string)

源版本号，遵循语义化版本规范（SemVer）。

**格式：** `主版本号.次版本号.修订号`

**示例：**

```json
"version": "2.0.0"
```

#### description (string)

源的描述信息，简要说明源的功能和特点。

**示例：**

```json
"description": "金牌影院 - 电影视频源，支持高清播放"
```

#### jsSourceUrl (string)

JavaScript 源文件的 URL 地址。应用会从此 URL 下载并执行源代码。

**要求：**

- 必须是有效的 HTTP/HTTPS URL
- 返回的内容必须是有效的 JavaScript 代码（ES5 语法）
- 建议使用 CDN 或稳定的文件托管服务

**示例：**

```json
"jsSourceUrl": "https://ldjun-nest.oss-cn-shenzhen.aliyuncs.com/demo.js"
```

### 可选字段

#### icon (string)

源的图标 URL 地址。显示在源列表中。

**要求：**

- 必须是有效的 HTTP/HTTPS URL
- 建议使用 PNG 或 JPG 格式
- 建议尺寸：64x64 或 128x128 像素

**示例：**

```json
"icon": "https://ygking.cn/logo.jpg"
```

#### config (object)

源的额外配置数据（可选）。

**结构：**

```json
{
  "config": {
    "baseUrl": "http://example.com",
    "signKey": "签名密钥",
    "deviceId": "设备ID"
  }
}
```

**字段说明：**

- `baseUrl` (string) - API 基础 URL
- `signKey` (string) - 签名密钥
- `deviceId` (string) - 设备 ID

## 完整示例

```json
[
  {
    "name": "金牌影院",
    "sourceKey": "jinpai_yuanyuan",
    "version": "2.0.0",
    "icon": "https://ygking.cn/logo.jpg",
    "description": "金牌影院 - 电影视频源，支持高清播放和多线路切换",
    "jsSourceUrl": "https://ldjun-nest.oss-cn-shenzhen.aliyuncs.com/demo.js"
  },
  {
    "name": "数字影视",
    "sourceKey": "shuzi_yingyu",
    "version": "1.0.0",
    "icon": "https://shuziyingyu.com/logo.jpg",
    "description": "数字影视 - 电影视频源",
    "jsSourceUrl": "https://ldjun-nest.oss-cn-shenzhen.aliyuncs.com/demo1.js"
  },
  {
    "name": "备用源",
    "sourceKey": "backup_source",
    "version": "1.0.0",
    "description": "备用视频源",
    "jsSourceUrl": "https://example.com/backup.js"
  }
]
```

## 订阅 URL

应用支持从远程 URL 加载源列表，实现源订阅功能。

### 默认订阅 URL

应用默认订阅地址：

```
https://ldjun-nest.oss-cn-shenzhen.aliyuncs.com/source.json
```

### 自定义订阅 URL

用户可以在设置中配置自定义订阅 URL，应用会从该 URL 加载源列表。

### 订阅流程

1. **应用启动时：**

   - 先从本地缓存加载源列表（快速启动）
   - 异步从网络加载最新源列表（后台更新）

2. **网络加载：**

   - 从订阅 URL 下载 `source.json`
   - 解析 JSON 数组
   - 保存到本地缓存

3. **源切换：**
   - 用户选择源后，应用会从 `jsSourceUrl` 下载并执行 JavaScript 代码
   - 源切换后会自动重新初始化

## 本地文件

### 位置

本地 `source.json` 文件位于：

```
assets/source.json
```

### 用途

- 作为默认源列表（首次启动时使用）
- 网络订阅失败时的备用源
- 开发测试时的本地源

### 更新

更新本地 `source.json` 需要重新编译应用。建议使用远程订阅 URL 来动态更新源列表。

## 最佳实践

### 1. 源文件托管

**推荐：**

- 使用 CDN 服务（如阿里云 OSS、七牛云、又拍云等）
- 使用 GitHub Raw 或 Gitee Raw
- 使用稳定的文件托管服务

**不推荐：**

- 使用个人服务器（可能不稳定）
- 使用需要认证的私有链接

### 2. 源文件大小

- 建议单个源文件小于 100KB
- 如果源文件较大，考虑压缩或拆分

### 3. 版本管理

- 每次更新源时，更新 `version` 版本号
- 遵循语义化版本规范

### 4. 错误处理

- 确保 JSON 格式正确
- 确保所有必需字段都存在
- 确保 URL 地址有效

### 5. 安全性

- 使用 HTTPS 协议
- 验证源文件的来源
- 定期检查源文件的有效性

## 常见问题

### Q: 如何添加新源？

A: 在 `source.json` 数组中添加新的源配置对象，确保 `sourceKey` 唯一。

### Q: 如何更新源？

A: 更新 `jsSourceUrl` 指向的 JavaScript 文件，并更新 `version` 版本号。

### Q: 源文件加载失败怎么办？

A: 检查：

1. `jsSourceUrl` 是否可访问
2. JavaScript 文件语法是否正确（ES5）
3. 网络连接是否正常

### Q: 如何创建订阅服务？

A:

1. 创建一个可公开访问的 HTTP/HTTPS 服务器
2. 将 `source.json` 文件部署到服务器
3. 在应用中配置订阅 URL

### Q: 支持多个订阅源吗？

A: 目前版本支持单个订阅 URL。可以在一个 JSON 文件中包含多个源配置。

## 技术实现

### 加载顺序

1. **本地缓存** → 如果存在，立即加载
2. **网络订阅** → 异步加载最新版本
3. **本地文件** → 如果以上都失败，使用 `assets/source.json`

### 缓存机制

- 源列表会缓存到本地 SharedPreferences
- 网络加载成功后自动更新缓存
- 网络加载失败时使用缓存数据

### 源切换

切换源时会：

1. 保存当前选中的 `sourceKey`
2. 下载并执行新的 JavaScript 源文件
3. 清除旧的 JavaScript 上下文
4. 重新初始化新源

## 示例：创建订阅服务

### 使用 GitHub Pages

1. 创建仓库并上传 `source.json`
2. 启用 GitHub Pages
3. 订阅 URL：`https://username.github.io/repo/source.json`

### 使用阿里云 OSS

1. 上传 `source.json` 到 OSS 存储桶
2. 设置文件为公共读
3. 订阅 URL：`https://bucket-name.oss-region.aliyuncs.com/source.json`

### 使用 Nginx

1. 配置 Nginx 服务器
2. 将 `source.json` 放到网站根目录
3. 确保返回正确的 Content-Type：`application/json`

```nginx
location /source.json {
    add_header Content-Type application/json;
    add_header Access-Control-Allow-Origin *;
}
```

## JSON Schema 验证

可以使用以下 JSON Schema 验证 `source.json` 格式：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["name", "sourceKey", "version", "description", "jsSourceUrl"],
    "properties": {
      "name": {
        "type": "string",
        "description": "源名称"
      },
      "sourceKey": {
        "type": "string",
        "description": "源的唯一标识符",
        "pattern": "^[a-z0-9_]+$"
      },
      "version": {
        "type": "string",
        "description": "版本号",
        "pattern": "^\\d+\\.\\d+\\.\\d+$"
      },
      "icon": {
        "type": "string",
        "format": "uri",
        "description": "图标 URL"
      },
      "description": {
        "type": "string",
        "description": "源描述"
      },
      "jsSourceUrl": {
        "type": "string",
        "format": "uri",
        "description": "JavaScript 源文件 URL"
      },
      "config": {
        "type": "object",
        "properties": {
          "baseUrl": {
            "type": "string"
          },
          "signKey": {
            "type": "string"
          },
          "deviceId": {
            "type": "string"
          }
        }
      }
    }
  }
}
```
