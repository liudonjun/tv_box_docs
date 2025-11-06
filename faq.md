---
outline: deep
---

# 常见问题 FAQ

本文档整理了 TV Box 源开发和使用过程中的常见问题及解决方案。

## 源开发类问题

### Q1: 为什么我的源代码执行失败？

**可能原因：**

1. **使用了 ES6+ 语法**

   - ❌ 箭头函数 `() => {}`
   - ❌ 模板字符串 `` `${var}` ``
   - ❌ `const` / `let`
   - ✅ 使用 `var` 和字符串拼接

2. **函数参数缺少默认值处理**

   ```javascript
   // ❌ 错误
   function search(keyword, page = 1) {}

   // ✅ 正确
   function search(keyword, page) {
     if (typeof page === "undefined") {
       page = 1;
     }
   }
   ```

3. **JSON 解析错误**
   - 确保返回的是有效的 JSON 字符串
   - 使用 `JSON.parse()` 解析前检查字符串是否为空

**解决方案：**

- 检查代码是否使用 ES5 语法
- 在函数中手动处理默认参数
- 添加 try-catch 错误处理
- 使用 `log` 记录调试信息

### Q2: 如何调试源代码？

**方法：**

1. **使用日志函数**

   ```javascript
   log.i("Tag", "信息: " + value);
   log.e("Tag", "错误: " + error.message);
   ```

2. **检查返回值**

   - 确保函数返回正确的数据结构
   - 检查返回值的字段是否完整

3. **验证 API 响应**
   ```javascript
   var response = http.get(url, headers);
   log.i("Debug", "响应: " + response);
   var data = JSON.parse(response);
   log.i("Debug", "解析后: " + JSON.stringify(data));
   ```

### Q3: 如何处理 API 响应加密？

**示例：**

```javascript
function request(apiPath, params) {
  var response = http.get(url, headers);
  var data = JSON.parse(response);

  // 如果响应数据是加密的
  if (data.encrypted) {
    var encrypted = crypto.base64Decode(data.data);
    var decrypted = crypto.aesDecrypt(
      encrypted,
      SOURCE.crypto.key,
      SOURCE.crypto.iv
    );
    data = JSON.parse(decrypted);
  }

  return data;
}
```

### Q4: 如何实现签名验证？

**MD5 + SHA1 双重签名示例：**

```javascript
function generateSign(params) {
  var timestamp = new Date().getTime();
  var signString = params + "&key=" + SOURCE.sign.key + "&t=" + timestamp;

  // 先 MD5，再 SHA1
  var md5Hash = crypto.md5(signString);
  var sign = crypto.sha1(md5Hash);

  return {
    sign: sign,
    timestamp: timestamp,
  };
}
```

### Q5: 如何实现多域名自动切换？

**示例：**

```javascript
function init() {
  if (SOURCE.host) {
    return; // 已初始化
  }

  // 从缓存读取
  var cachedHost = storage.get("source_host");
  if (cachedHost) {
    SOURCE.host = cachedHost;
    return;
  }

  // 遍历检测可用域名
  for (var i = 0; i < SOURCE.hosts.length; i++) {
    var host = SOURCE.hosts[i];
    try {
      var testUrl = host + SOURCE.api.home;
      http.get(testUrl, SOURCE.headers);
      SOURCE.host = host;
      storage.set("source_host", host);
      return;
    } catch (e) {
      // 继续尝试下一个
    }
  }

  // 默认使用第一个
  SOURCE.host = SOURCE.hosts[0];
}
```

### Q6: 搜索返回空结果怎么办？

**检查清单：**

1. **检查 API 响应**

   ```javascript
   var response = request(SOURCE.api.search, params);
   log.i("Search", "响应: " + response);
   var data = JSON.parse(response);
   log.i("Search", "响应 code: " + data.code);
   ```

2. **检查数据格式**

   - 确认 API 返回的数据结构
   - 检查字段名是否正确（如 `vodId` vs `id`）

3. **检查请求参数**

   ```javascript
   var params = "keyword=" + keyword + "&page=" + page;
   log.i("Search", "请求参数: " + params);
   ```

4. **检查关键词编码**
   - 某些 API 需要原始关键词（不编码）
   - 某些 API 需要 URL 编码

### Q7: 获取播放地址失败怎么办？

**常见问题：**

1. **剧集 ID 格式错误**

   ```javascript
   // 确保 episodeId 格式正确
   var parts = episodeId.split("/");
   if (parts.length !== 3) {
     throw new Error("剧集ID格式错误");
   }
   ```

2. **请求参数错误**

   - 检查 API 需要的参数格式
   - 确认是否需要签名或特殊请求头

3. **播放地址为空**
   ```javascript
   if (!playData.url || playData.url === "") {
     throw new Error("播放地址为空");
   }
   ```

### Q8: 如何实现多清晰度播放？

**使用 `getPlayUrlWithQualities` 函数：**

```javascript
function getPlayUrlWithQualities(episodeId) {
  var response = request(SOURCE.api.play, params);
  var data = JSON.parse(response);

  var playList = data.data.list || [];
  var qualities = [];

  for (var i = 0; i < playList.length; i++) {
    qualities.push({
      quality: playList[i].resolutionName || "默认",
      url: playList[i].url,
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
}
```

## 订阅管理类问题

### Q9: 如何添加新源到订阅列表？

**步骤：**

1. 在 `source.json` 中添加新源配置：

   ```json
   {
     "name": "新源名称",
     "sourceKey": "new_source_key",
     "version": "1.0.0",
     "description": "源描述",
     "jsSourceUrl": "https://example.com/source.js"
   }
   ```

2. 确保 `sourceKey` 唯一
3. 确保 `jsSourceUrl` 可访问
4. 更新远程订阅文件（如果使用远程订阅）

### Q10: 源文件加载失败怎么办？

**排查步骤：**

1. **检查 URL 是否可访问**

   ```bash
   curl https://example.com/source.js
   ```

2. **检查 JavaScript 语法**

   - 确保使用 ES5 语法
   - 检查是否有语法错误

3. **检查网络连接**

   - 确保设备可以访问互联网
   - 检查是否有防火墙限制

4. **检查文件大小**
   - 建议文件小于 100KB
   - 过大文件可能导致加载超时

### Q11: 如何更新源版本？

**步骤：**

1. 更新 JavaScript 源文件
2. 更新 `source.json` 中的 `version` 字段
3. 如果使用远程订阅，更新远程文件
4. 应用会自动检测并加载新版本

### Q12: 如何创建自己的订阅服务？

**方法一：使用 GitHub Pages**

1. 创建 GitHub 仓库
2. 上传 `source.json` 文件
3. 启用 GitHub Pages
4. 订阅 URL：`https://username.github.io/repo/source.json`

**方法二：使用阿里云 OSS**

1. 创建 OSS 存储桶
2. 上传 `source.json` 文件
3. 设置文件为公共读
4. 订阅 URL：`https://bucket.oss-region.aliyuncs.com/source.json`

**方法三：使用 Nginx**

1. 配置 Nginx 服务器
2. 将文件放到网站目录
3. 确保返回正确的 Content-Type

### Q13: 订阅列表更新失败怎么办？

**可能原因：**

1. **订阅 URL 不可访问**

   - 检查 URL 是否正确
   - 检查服务器是否正常运行

2. **JSON 格式错误**

   - 使用 JSON 验证工具检查格式
   - 确保所有必需字段都存在

3. **网络问题**
   - 检查网络连接
   - 检查是否有代理设置

**解决方案：**

- 使用本地 `source.json` 作为备用
- 检查应用日志查看详细错误信息
- 尝试手动刷新订阅列表

## 功能使用类问题

### Q14: 如何切换源？

**方法：**

1. 打开应用设置页面
2. 找到"源管理"或"订阅源"选项
3. 选择要使用的源
4. 应用会自动加载新源

### Q15: 搜索功能不工作？

**检查：**

1. 确认源是否支持搜索

   ```javascript
   // 在 SOURCE 配置中
   searchable: true;
   ```

2. 检查是否实现了 `search` 函数
3. 检查 API 是否正常响应
4. 查看日志中的错误信息

### Q16: 视频无法播放？

**排查步骤：**

1. **检查播放地址获取**

   ```javascript
   var playInfo = getPlayUrl(episodeId);
   log.i("Play", "播放地址: " + playInfo.url);
   ```

2. **检查请求头**

   - 某些视频源需要特定的 Referer
   - 某些需要 User-Agent

3. **检查视频格式**

   - 确认播放器支持该格式（m3u8, mp4, flv 等）

4. **检查网络连接**
   - 确保设备可以访问视频服务器

### Q17: 如何查看分类内容？

**前提：**

1. 源实现了 `getCategories()` 函数
2. 源实现了 `getCategoryContent()` 函数

**检查：**

```javascript
// 获取分类列表
var categories = getCategories();
log.i("Categories", "分类数量: " + categories.categories.length);

// 获取分类内容
var content = getCategoryContent("1", null, 1);
log.i("Category", "内容数量: " + content.list.length);
```

## 技术问题

### Q18: 如何处理 HTTP 请求超时？

**当前实现：**

- HTTP 请求默认超时时间为 10 秒
- 可以通过请求头中的 `timeout` 字段设置（如果支持）

**建议：**

- 在请求函数中添加超时处理
- 使用 try-catch 捕获超时错误

### Q19: 如何存储临时数据？

**使用 storage API：**

```javascript
// 保存数据
storage.set("key", "value");

// 读取数据
var value = storage.get("key");
```

**用途：**

- 缓存域名
- 存储用户配置
- 临时数据存储

### Q20: 如何处理大数据量？

**建议：**

1. **分页加载**

   ```javascript
   function getCategoryContent(categoryId, filters, page) {
     page = page || 1;
     var params = "page=" + page + "&pageSize=30";
     // ...
   }
   ```

2. **延迟加载**

   - 只加载当前需要的数据
   - 使用分页机制

3. **数据过滤**
   - 在服务器端过滤数据
   - 减少返回的数据量

### Q21: 如何优化源性能？

**优化建议：**

1. **减少 HTTP 请求**

   - 合并多个请求
   - 使用缓存机制

2. **优化数据结构**

   - 只返回必要字段
   - 避免深层嵌套

3. **使用存储缓存**
   ```javascript
   var cached = storage.get("cache_key");
   if (cached) {
     return JSON.parse(cached);
   }
   // 获取新数据并缓存
   ```

### Q22: 如何处理特殊字符？

**URL 编码：**

```javascript
// 使用 encodeURIComponent
var encoded = encodeURIComponent("特殊字符");
var url = "http://example.com?q=" + encoded;

// 或者使用 crypto.urlEncode
var encoded = crypto.urlEncode("特殊字符");
```

**字符串处理：**

```javascript
// 替换特殊字符
var cleaned = str.replace(/[<>]/g, "");

// 转义 HTML
// 注意：ES5 中没有内置方法，需要手动实现
```

### Q23: 如何调试网络请求？

**日志记录：**

```javascript
function request(apiPath, params) {
  var url = SOURCE.host + apiPath + "?" + params;

  log.i("Request", "URL: " + url);
  log.i("Request", "参数: " + params);

  var headers = objectAssign({}, SOURCE.headers);
  log.i("Request", "请求头: " + JSON.stringify(headers));

  var response = http.get(url, headers);

  log.i("Request", "响应长度: " + response.length);
  log.i("Request", "响应预览: " + response.substring(0, 200));

  return response;
}
```

### Q24: 如何处理 API 变更？

**版本管理：**

1. 在 SOURCE 配置中设置版本号
2. 根据版本号使用不同的 API 路径
3. 提供向后兼容

**示例：**

```javascript
var SOURCE = {
  version: "2.0.0",
  api: {
    // 根据版本选择不同的 API
    search:
      SOURCE.version.indexOf("2") === 0 ? "/api/v2/search" : "/api/v1/search",
  },
};
```

## 错误排查

### Q25: 常见错误代码含义

**错误信息：**

- `函数 'xxx' 不存在或不是函数`

  - 原因：函数未定义或名称拼写错误
  - 解决：检查函数名称和定义

- `JavaScript 执行错误: missing )`

  - 原因：语法错误
  - 解决：检查代码语法，确保使用 ES5

- `Cleartext HTTP traffic not permitted`

  - 原因：Android 9+ 禁止 HTTP 流量
  - 解决：配置网络安全策略或使用 HTTPS

- `获取详情失败: 没有返回数据`
  - 原因：API 响应格式不符合预期
  - 解决：检查 API 响应结构和数据格式

### Q26: 如何获取详细的错误信息？

**方法：**

1. **使用日志**

   ```javascript
   try {
     // 代码
   } catch (e) {
     log.e("Error", "错误: " + e.message);
     log.e("Error", "堆栈: " + e.stack);
   }
   ```

2. **检查应用日志**

   - Android：使用 `adb logcat` 查看日志
   - 查找 `JsBridge` 标签的日志

3. **添加调试信息**
   ```javascript
   log.i("Debug", "变量值: " + JSON.stringify(variable));
   ```

## 最佳实践

### Q27: 源开发的最佳实践有哪些？

**建议：**

1. **代码结构**

   - 使用统一的请求方法
   - 实现错误处理
   - 添加日志记录

2. **性能优化**

   - 使用缓存机制
   - 实现分页加载
   - 减少 HTTP 请求

3. **兼容性**

   - 支持多域名切换
   - 处理 API 版本差异
   - 提供降级方案

4. **用户体验**
   - 提供清晰的错误提示
   - 优化加载速度
   - 支持多种清晰度

### Q28: 如何测试源功能？

**测试步骤：**

1. **本地测试**

   - 将源文件放到 `assets/` 目录
   - 在 `source.json` 中配置本地路径

2. **功能测试**

   - 测试搜索功能
   - 测试详情获取
   - 测试播放地址获取

3. **错误测试**

   - 测试网络错误
   - 测试数据格式错误
   - 测试边界情况

4. **性能测试**
   - 测试加载速度
   - 测试大数据量处理
   - 测试并发请求

## 获取帮助

如果以上问题无法解决，可以：

1. 查看 [源编写规则](/source-rules) 文档
2. 查看 [API 参考](/api-reference) 文档
3. 查看示例代码（`demo.js`, `demo1.js`）
4. 检查应用日志获取详细错误信息
