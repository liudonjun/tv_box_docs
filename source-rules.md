---
outline: deep
---

# 源编写规则

本文档介绍如何编写 TV Box 视频源的 JavaScript 代码。

## 概述

TV Box 源使用 JavaScript ES5 语法编写，运行在 Rhino JavaScript 引擎中。源文件必须实现以下核心函数：

**必需函数：**

- `search(keyword, page)` - 搜索视频
- `getDetail(id)` - 获取视频详情
- `getPlayUrl(episodeId)` - 获取播放地址

**可选函数：**

- `init()` - 初始化函数（推荐，用于域名检测等）
- `getCategories()` - 获取分类列表
- `getCategoryContent(categoryId, filters, page)` - 获取分类内容
- `getPlayUrlWithQualities(episodeId)` - 获取多清晰度播放地址

**辅助函数（推荐）：**

- `objectAssign()` - 对象复制辅助函数（ES5 版本的 Object.assign）
- `generateSign(params)` - 生成签名（如果 API 需要签名）
- `request(apiPath, params)` - 统一请求方法（封装 HTTP 请求）

## 源配置对象 (SOURCE)

每个源文件应该定义一个 `SOURCE` 配置对象，包含源的基本信息和配置：

```javascript
var SOURCE = {
  // ========== 基本信息 ==========
  name: "源名称",
  version: "1.0.0",
  type: "video",
  author: "作者名",
  description: "源描述",

  // ========== 源配置 ==========
  sourceType: "api", // 或 "web"
  searchable: true, // 是否支持搜索
  quickSearch: true, // 是否支持快速搜索

  // ========== 域名配置 ==========
  // 方式1: 单个域名
  host: "http://example.com",

  // 方式2: 多域名（推荐，支持自动切换）
  hosts: ["http://example.com", "http://backup.example.com"],
  host: "", // 当前使用的域名（多域名时会自动设置）

  // ========== API路径配置 ==========
  api: {
    home: "/api/home", // 首页/检测接口（多域名时使用）
    search: "/api/search",
    detail: "/api/detail",
    play: "/api/play",
    category: "/api/category", // 分类接口（可选）
  },

  // ========== 公共请求头 ==========
  headers: {
    "User-Agent": "Mozilla/5.0",
    Accept: "application/json",
  },

  // ========== 签名配置（可选）==========
  sign: {
    enabled: true,
    type: "md5_sha1", // 签名类型：md5, sha1, md5_sha1
    key: "签名密钥",
    deviceId: "设备ID（可选）",
  },

  // ========== 加密配置（可选）==========
  crypto: {
    enabled: true,
    type: "aes",
    key: "密钥",
    iv: "初始向量",
    mode: "CBC",
    padding: "Pkcs7",
  },

  // ========== 分类配置（可选）==========
  categories: [
    { id: "1", name: "电影" },
    { id: "2", name: "电视剧" },
    { id: "3", name: "综艺" },
    { id: "4", name: "动漫" },
  ],
};
```

## 辅助函数

### objectAssign(target, ...sources)

对象复制辅助函数（ES5 版本的 Object.assign）。

**参数：**

- `target` (object) - 目标对象
- `...sources` (object) - 源对象（可多个）

**返回值：**

- `object` - 目标对象

**示例：**

```javascript
function objectAssign(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    if (source) {
      for (var key in source) {
        if (source.hasOwnProperty(key)) {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
}

// 使用示例
var headers = objectAssign({}, SOURCE.headers, {
  "X-Custom": "value",
});
```

### init()

初始化函数，用于检测可用域名、加载配置等。推荐在源文件开头调用或在 `request` 函数中自动调用。

**示例：**

```javascript
function init() {
  // 如果已经初始化，直接返回
  if (SOURCE.host) {
    return;
  }

  log.i("Init", "开始检测可用域名...");

  // 先尝试从缓存读取
  var cachedHost = storage.get("source_host");
  if (cachedHost) {
    SOURCE.host = cachedHost;
    // 验证缓存域名是否仍然可用
    try {
      var testUrl = SOURCE.host + SOURCE.api.home;
      http.get(testUrl, SOURCE.headers);
      log.i("Init", "使用缓存域名: " + SOURCE.host);
      return;
    } catch (e) {
      log.w("Init", "缓存域名不可用");
    }
  }

  // 遍历检测可用域名
  for (var i = 0; i < SOURCE.hosts.length; i++) {
    var host = SOURCE.hosts[i];
    try {
      var testUrl = host + SOURCE.api.home;
      http.get(testUrl, SOURCE.headers);
      SOURCE.host = host;
      storage.set("source_host", host);
      log.i("Init", "✅ 找到可用域名: " + host);
      return;
    } catch (e) {
      log.w("Init", "❌ 域名不可用: " + host);
    }
  }

  // 所有域名都不可用，使用第一个
  SOURCE.host = SOURCE.hosts[0];
  log.e("Init", "所有域名都不可用，使用默认域名");
}
```

### generateSign(params)

生成签名函数（如果 API 需要签名验证）。

**参数：**

- `params` (string) - 请求参数字符串

**返回值：**

```javascript
{
  sign: "签名值",
  timestamp: 1234567890123
}
```

**示例：**

```javascript
function generateSign(params) {
  var timestamp = new Date().getTime();

  // 构造签名字符串: params&key=xxx&t=timestamp
  var signString = params + "&key=" + SOURCE.sign.key + "&t=" + timestamp;

  // MD5 + SHA1 双重签名
  var md5Hash = crypto.md5(signString);
  var sign = crypto.sha1(md5Hash);

  return {
    sign: sign,
    timestamp: timestamp,
  };
}
```

### request(apiPath, params)

统一请求方法，封装 HTTP 请求、签名生成等逻辑。

**参数：**

- `apiPath` (string) - API 路径
- `params` (string) - 请求参数字符串

**返回值：**

- `string` - 响应内容

**示例：**

```javascript
function request(apiPath, params) {
  // 确保已初始化
  if (!SOURCE.host) {
    init();
  }

  // 生成签名
  var signData = generateSign(params);

  // 构造完整URL
  var url = SOURCE.host + apiPath + "?" + params;

  // 构造请求头
  var headers = objectAssign({}, SOURCE.headers, {
    deviceId: SOURCE.sign.deviceId,
    sign: signData.sign,
    t: signData.timestamp.toString(),
  });

  // 发送请求
  var response = http.get(url, headers);
  return response;
}
```

## 必需函数

### search(keyword, page)

搜索视频函数。

**参数：**

- `keyword` (string) - 搜索关键词
- `page` (number) - 页码，从 1 开始

**返回值：**

```javascript
{
  list: [
    {
      id: "视频ID",
      name: "视频名称",
      cover: "封面URL",
      description: "描述",
      year: "年份",
      category: "分类",
      area: "地区",
    },
  ];
}
```

**示例：**

```javascript
function search(keyword, page) {
  if (typeof page === "undefined") {
    page = 1;
  }

  try {
    var url =
      SOURCE.host +
      SOURCE.api.search +
      "?keyword=" +
      encodeURIComponent(keyword) +
      "&page=" +
      page;
    var response = http.get(url, SOURCE.headers);
    var data = JSON.parse(response);

    var list = [];
    if (data.list) {
      for (var i = 0; i < data.list.length; i++) {
        var item = data.list[i];
        list.push({
          id: item.id.toString(),
          name: item.name || "",
          cover: item.cover || "",
          description: item.description || "",
          year: item.year || "",
          category: item.category || "",
          area: item.area || "",
        });
      }
    }

    return { list: list };
  } catch (e) {
    log.e("Search", "搜索失败: " + e.message);
    return { list: [] };
  }
}
```

### getDetail(id)

获取视频详情函数。

**参数：**

- `id` (string) - 视频 ID

**返回值：**

```javascript
{
  id: "视频ID",
  name: "视频名称",
  cover: "封面URL",
  description: "详细描述",
  year: "年份",
  category: "分类",
  area: "地区",
  director: "导演",
  actors: ["演员1", "演员2"],
  playRoutes: [
    {
      name: "线路名称",
      episodes: [
        {
          id: "剧集ID",
          name: "第1集",
          index: 1
        }
      ]
    }
  ]
}
```

**示例：**

```javascript
function getDetail(id) {
  try {
    var url = SOURCE.host + SOURCE.api.detail + "?id=" + id;
    var response = http.get(url, SOURCE.headers);
    var data = JSON.parse(response);

    var playRoutes = [];
    if (data.playList) {
      for (var i = 0; i < data.playList.length; i++) {
        var route = data.playList[i];
        var episodes = [];

        for (var j = 0; j < route.episodes.length; j++) {
          episodes.push({
            id: id + "/" + route.id + "/" + j,
            name: route.episodes[j].name || "第" + (j + 1) + "集",
            index: j + 1,
          });
        }

        playRoutes.push({
          name: route.name || "线路" + (i + 1),
          episodes: episodes,
        });
      }
    }

    return {
      id: id,
      name: data.name || "",
      cover: data.cover || "",
      description: data.description || "",
      year: data.year || "",
      category: data.category || "",
      area: data.area || "",
      director: data.director || "",
      actors: data.actors ? data.actors.split(",") : [],
      playRoutes: playRoutes,
    };
  } catch (e) {
    log.e("GetDetail", "获取详情失败: " + e.message);
    return null;
  }
}
```

### getPlayUrl(episodeId)

获取播放地址函数。

**参数：**

- `episodeId` (string) - 剧集 ID，格式通常是 `videoId/routeId/episodeIndex`

**返回值：**

```javascript
{
  url: "播放地址",
  type: "m3u8",  // 或 "mp4", "flv" 等
  headers: {
    "Referer": "http://example.com",
    "User-Agent": "Mozilla/5.0"
  }
}
```

**示例：**

```javascript
function getPlayUrl(episodeId) {
  try {
    var parts = episodeId.split("/");
    if (parts.length < 3) {
      throw new Error("剧集ID格式错误");
    }

    var videoId = parts[0];
    var routeId = parts[1];
    var episodeIndex = parts[2];

    var url = SOURCE.host + SOURCE.api.play;
    var postData = JSON.stringify({
      videoId: videoId,
      routeId: routeId,
      episodeIndex: episodeIndex,
    });

    var headers = {};
    for (var key in SOURCE.headers) {
      headers[key] = SOURCE.headers[key];
    }
    headers["Content-Type"] = "application/json";

    var response = http.post(url, postData, headers);
    var data = JSON.parse(response);

    return {
      url: data.url || "",
      type: data.type || "m3u8",
      headers: {
        Referer: SOURCE.host,
        "User-Agent": SOURCE.headers["User-Agent"] || "Mozilla/5.0",
      },
    };
  } catch (e) {
    log.e("GetPlayUrl", "获取播放地址失败: " + e.message);
    return null;
  }
}
```

### getCategories() (可选)

获取分类列表函数。

**返回值：**

```javascript
{
  categories: [
    { id: "1", name: "电影" },
    { id: "2", name: "电视剧" },
    { id: "3", name: "综艺" },
  ];
}
```

**示例：**

```javascript
function getCategories() {
  // 可以从 SOURCE 配置中读取
  return {
    categories: SOURCE.categories || [
      { id: "1", name: "电影" },
      { id: "2", name: "电视剧" },
      { id: "3", name: "综艺" },
      { id: "4", name: "动漫" },
    ],
  };
}
```

### getPlayUrlWithQualities(episodeId) (可选)

获取多清晰度播放地址函数。

**参数：**

- `episodeId` (string) - 剧集 ID

**返回值：**

```javascript
{
  qualities: [
    {
      quality: "高清",
      url: "播放地址1"
    },
    {
      quality: "超清",
      url: "播放地址2"
    }
  ],
  defaultQuality: {
    quality: "高清",
    url: "播放地址1"
  },
  headers: {
    "Referer": "http://example.com",
    "User-Agent": "Mozilla/5.0"
  }
}
```

**示例：**

```javascript
function getPlayUrlWithQualities(episodeId) {
  try {
    var parts = episodeId.split("/");
    var videoId = parts[0];
    var routeId = parts[1];

    var params = "id=" + videoId + "&routeId=" + routeId;
    var response = request(SOURCE.api.play, params);
    var data = JSON.parse(response);

    var playList = data.list || [];
    var qualities = [];

    for (var i = 0; i < playList.length; i++) {
      var item = playList[i];
      qualities.push({
        quality: item.resolutionName || "默认",
        url: item.url,
      });
    }

    return {
      qualities: qualities,
      defaultQuality: qualities[0],
      headers: {
        Referer: SOURCE.host,
        "User-Agent": SOURCE.headers["User-Agent"],
      },
    };
  } catch (e) {
    log.e("GetPlayUrl", "获取播放地址失败: " + e.message);
    return null;
  }
}
```

### getCategoryContent(categoryId, filters, page) (可选)

获取分类内容函数。

**参数：**

- `categoryId` (string) - 分类 ID
- `filters` (object) - 筛选条件（可为 null）
- `page` (number) - 页码

**返回值：**

```javascript
{
  list: [
    {
      id: "视频ID",
      name: "视频名称",
      cover: "封面URL",
      description: "描述",
      year: "年份",
      category: "分类",
      area: "地区"
    }
  ],
  hasMore: true,
  currentPage: 1
}
```

## 语法限制

由于运行在 Rhino ES5 环境中，需要注意以下限制：

1. **不支持 ES6+ 语法**：

   - ❌ 箭头函数 `() => {}`
   - ❌ 模板字符串 `` `${var}` ``
   - ❌ `const` / `let`（使用 `var`）
   - ❌ 默认参数 `function(a = 1)`
   - ❌ 解构赋值

2. **使用 ES5 语法**：

   - ✅ `var` 声明变量
   - ✅ 字符串拼接 `"hello " + name`
   - ✅ 普通函数 `function() {}`
   - ✅ 手动处理默认参数

3. **JSON 处理**：
   - 使用 `JSON.parse()` 解析
   - 使用 `JSON.stringify()` 序列化

## 错误处理

建议在所有函数中使用 try-catch 包裹代码，并使用 `log` 对象记录错误：

```javascript
try {
  // 你的代码
} catch (e) {
  log.e("Tag", "错误信息: " + e.message);
  return null; // 或返回默认值
}
```

## 最佳实践

1. **始终处理默认参数**：

```javascript
function search(keyword, page) {
  if (typeof page === "undefined") {
    page = 1;
  }
  // ...
}
```

2. **使用日志记录重要操作**：

```javascript
log.i("Search", "搜索关键词: " + keyword);
log.e("Search", "搜索失败: " + error.message);
```

3. **验证数据存在性**：

```javascript
if (!data || !data.list) {
  return { list: [] };
}
```

4. **处理 URL 编码**：

```javascript
var encoded = encodeURIComponent(keyword);
```

5. **返回统一的数据格式**：
   确保返回对象的结构符合文档要求，缺失字段使用空字符串或默认值。
