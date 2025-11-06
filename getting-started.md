---
outline: deep
---

# 快速开始

本指南将帮助你快速创建一个简单的 TV Box 视频源。

## 创建源文件

创建一个新的 JavaScript 文件（例如 `my-source.js`），使用 ES5 语法编写。

## 基本结构

每个源文件包含两部分：

1. **SOURCE 配置对象** - 定义源的基本信息和 API 端点
2. **必需函数** - 实现搜索、详情、播放等功能

## 最小示例

以下是一个最简单的源文件示例：

```javascript
// 源配置
var SOURCE = {
  name: "我的视频源",
  host: "http://example.com",
  api: {
    search: "/api/search",
    detail: "/api/detail",
    play: "/api/play",
    category: "/api/category", // 分类接口
  },
  headers: {
    "User-Agent": "Mozilla/5.0",
  },
};

// 搜索函数
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

// 详情函数
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

// 播放地址函数
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

// 获取分类内容函数（可选，用于分类浏览）
function getCategoryContent(categoryId, filters, page) {
  try {
    filters = filters || {};
    page = page || 1;

    var url =
      SOURCE.host +
      SOURCE.api.category +
      "?categoryId=" +
      categoryId +
      "&page=" +
      page;

    // 添加筛选条件
    if (filters.year) {
      url += "&year=" + filters.year;
    }
    if (filters.area) {
      url += "&area=" + encodeURIComponent(filters.area);
    }

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

    return {
      list: list,
      hasMore: data.hasMore || false,
      currentPage: page,
    };
  } catch (e) {
    log.e("GetCategory", "获取分类内容失败: " + e.message);
    return { list: [], hasMore: false };
  }
}
```

## 测试源

1. 将源文件保存到 `assets/` 目录
2. 在应用的设置中添加源配置
3. 重启应用并测试搜索功能

## 常见问题

### 如何处理加密的 API？

如果 API 返回的数据是加密的，可以使用 `crypto.aesDecrypt` 解密：

```javascript
var encrypted = crypto.base64Decode(data.encrypted);
var decrypted = crypto.aesDecrypt(encrypted, "key", "iv");
var data = JSON.parse(decrypted);
```

### 如何生成签名？

通常使用 MD5 或 SHA1 生成签名：

```javascript
var timestamp = new Date().getTime();
var signStr = "参数" + timestamp + "密钥";
var sign = crypto.md5(signStr);
```

### 如何发送 POST 请求？

使用 `http.post` 方法：

```javascript
var url = SOURCE.host + "/api/endpoint";
var postData = JSON.stringify({ key: "value" });
var headers = {
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0",
};
var response = http.post(url, postData, headers);
```

## 下一步

- 阅读 [源编写规则](/source-rules) 了解详细的编写规范
- 查看 [API 参考](/api-reference) 了解所有可用的 API
- 参考示例代码学习最佳实践
