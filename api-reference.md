---
outline: deep
---

# API 参考文档

本文档介绍 TV Box 源中可以使用的所有内置 API。

## HTTP 请求

### http.get(url, headers)

发送 HTTP GET 请求。

**参数：**

- `url` (string) - 请求 URL
- `headers` (object, 可选) - 请求头对象

**返回值：**

- `string` - 响应内容

**示例：**

```javascript
var headers = {
  "User-Agent": "Mozilla/5.0",
  Accept: "application/json",
};
var response = http.get("http://example.com/api/data", headers);
var data = JSON.parse(response);
```

### http.post(url, data, headers)

发送 HTTP POST 请求。

**参数：**

- `url` (string) - 请求 URL
- `data` (string) - POST 数据（通常是 JSON 字符串或表单数据）
- `headers` (object, 可选) - 请求头对象

**返回值：**

- `string` - 响应内容

**示例：**

```javascript
var url = "http://example.com/api/submit";
var postData = JSON.stringify({ key: "value" });
var headers = {
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0",
};
var response = http.post(url, postData, headers);
var result = JSON.parse(response);
```

## 加密函数

### crypto.md5(str)

计算字符串的 MD5 哈希值。

**参数：**

- `str` (string) - 要加密的字符串

**返回值：**

- `string` - MD5 哈希值的十六进制字符串（小写）

**示例：**

```javascript
var hash = crypto.md5("hello world");
// 返回: "5eb63bbbe01eeed093cb22bb8f5acdc3"
```

### crypto.sha1(str)

计算字符串的 SHA1 哈希值。

**参数：**

- `str` (string) - 要加密的字符串

**返回值：**

- `string` - SHA1 哈希值的十六进制字符串（小写）

**示例：**

```javascript
var hash = crypto.sha1("hello world");
// 返回: "2aae6c35c94fcfb415dbe95f408b9ce91ee846ed"
```

### crypto.base64Encode(data)

Base64 编码。

**参数：**

- `data` (string | array) - 要编码的数据（字符串或字节数组）

**返回值：**

- `string` - Base64 编码后的字符串

**示例：**

```javascript
// 编码字符串
var encoded = crypto.base64Encode("hello world");
// 返回: "aGVsbG8gd29ybGQ="

// 编码字节数组
var bytes = crypto.aesEncrypt("text", "key", "iv");
var encoded = crypto.base64Encode(bytes);
```

### crypto.base64Decode(encoded)

Base64 解码。

**参数：**

- `encoded` (string) - Base64 编码的字符串

**返回值：**

- `array` - 解码后的字节数组（NativeArray）

**示例：**

```javascript
var encoded = "aGVsbG8gd29ybGQ=";
var bytes = crypto.base64Decode(encoded);
// 返回字节数组
```

### crypto.aesEncrypt(text, key, iv, options)

AES 加密。

**参数：**

- `text` (string) - 要加密的明文
- `key` (string) - 加密密钥（16/24/32 字节）
- `iv` (string) - 初始向量（16 字节）
- `options` (object, 可选) - 加密选项
  - `mode` (string) - 加密模式，默认 "CBC"
  - `padding` (string) - 填充方式，默认 "Pkcs7"

**返回值：**

- `array` - 加密后的字节数组（NativeArray）

**示例：**

```javascript
var text = "hello world";
var key = "VwsHxkCViDXEExWa"; // 16字节
var iv = "VwsHxkCViDXEExWa"; // 16字节
var encrypted = crypto.aesEncrypt(text, key, iv, {
  mode: "CBC",
  padding: "Pkcs7",
});

// 转换为 Base64
var base64 = crypto.base64Encode(encrypted);
```

### crypto.aesDecrypt(encrypted, key, iv, options)

AES 解密。

**参数：**

- `encrypted` (array | string) - 加密的数据（字节数组或字符串）
- `key` (string) - 解密密钥（16/24/32 字节）
- `iv` (string) - 初始向量（16 字节）
- `options` (object, 可选) - 解密选项
  - `mode` (string) - 解密模式，默认 "CBC"
  - `padding` (string) - 填充方式，默认 "Pkcs7"

**返回值：**

- `string` - 解密后的明文（UTF-8 字符串）

**示例：**

```javascript
// 从 Base64 解码
var encoded = "base64字符串";
var bytes = crypto.base64Decode(encoded);

// AES 解密
var key = "VwsHxkCViDXEExWa";
var iv = "VwsHxkCViDXEExWa";
var decrypted = crypto.aesDecrypt(bytes, key, iv, {
  mode: "CBC",
  padding: "Pkcs7",
});
// 返回: "hello world"
```

### crypto.urlEncode(str)

URL 编码。

**参数：**

- `str` (string) - 要编码的字符串

**返回值：**

- `string` - URL 编码后的字符串

**示例：**

```javascript
var encoded = crypto.urlEncode("hello world");
// 返回: "hello%20world"
```

## 存储函数

### storage.get(key)

从本地存储获取值。

**参数：**

- `key` (string) - 存储键名

**返回值：**

- `string` - 存储的值，如果不存在返回空字符串

**示例：**

```javascript
var value = storage.get("userToken");
if (value) {
  // 使用存储的值
}
```

### storage.set(key, value)

将值存储到本地存储。

**参数：**

- `key` (string) - 存储键名
- `value` (string) - 要存储的值

**返回值：**

- `boolean` - 始终返回 `true`

**示例：**

```javascript
storage.set("userToken", "abc123");
```

## 日志函数

### log.i(tag, message)

记录信息日志。

**参数：**

- `tag` (string) - 日志标签
- `message` (string) - 日志消息

**示例：**

```javascript
log.i("Search", "开始搜索: " + keyword);
```

### log.w(tag, message)

记录警告日志。

**参数：**

- `tag` (string) - 日志标签
- `message` (string) - 日志消息

**示例：**

```javascript
log.w("Search", "搜索结果为空");
```

### log.e(tag, message)

记录错误日志。

**参数：**

- `tag` (string) - 日志标签
- `message` (string) - 日志消息

**示例：**

```javascript
try {
  // 一些操作
} catch (e) {
  log.e("Search", "搜索失败: " + e.message);
}
```

## 工具函数

### JSON.parse(str)

解析 JSON 字符串。

**参数：**

- `str` (string) - JSON 字符串

**返回值：**

- `object` - 解析后的 JavaScript 对象

**示例：**

```javascript
var jsonStr = '{"name": "test", "value": 123}';
var obj = JSON.parse(jsonStr);
```

### JSON.stringify(obj)

将 JavaScript 对象序列化为 JSON 字符串。

**参数：**

- `obj` (object) - 要序列化的对象

**返回值：**

- `string` - JSON 字符串

**示例：**

```javascript
var obj = { name: "test", value: 123 };
var jsonStr = JSON.stringify(obj);
// 返回: '{"name":"test","value":123}'
```

### encodeURIComponent(str)

URL 编码组件。

**参数：**

- `str` (string) - 要编码的字符串

**返回值：**

- `string` - 编码后的字符串

**示例：**

```javascript
var encoded = encodeURIComponent("hello world");
// 返回: "hello%20world"
```

### new Date().getTime()

获取当前时间戳（毫秒）。

**返回值：**

- `number` - Unix 时间戳（毫秒）

**示例：**

```javascript
var timestamp = new Date().getTime();
// 返回: 1703123456789
```

## 完整示例

以下是一个完整的示例，展示如何使用这些 API：

```javascript
var SOURCE = {
  host: "http://example.com",
  api: {
    search: "/api/search",
  },
  headers: {
    "User-Agent": "Mozilla/5.0",
  },
};

function search(keyword, page) {
  if (typeof page === "undefined") {
    page = 1;
  }

  try {
    log.i("Search", "搜索: " + keyword + ", 页码: " + page);

    // 构建请求 URL
    var url =
      SOURCE.host +
      SOURCE.api.search +
      "?keyword=" +
      encodeURIComponent(keyword) +
      "&page=" +
      page;

    // 生成签名（如果需要）
    var timestamp = new Date().getTime();
    var signStr = "keyword=" + keyword + "&timestamp=" + timestamp;
    var sign = crypto.md5(signStr);

    // 添加签名到请求头
    var headers = {};
    for (var key in SOURCE.headers) {
      headers[key] = SOURCE.headers[key];
    }
    headers["X-Sign"] = sign;
    headers["X-Timestamp"] = timestamp.toString();

    // 发送请求
    var response = http.get(url, headers);
    log.i("Search", "响应长度: " + response.length);

    // 解析响应
    var data = JSON.parse(response);

    // 如果有加密，需要解密
    if (data.encrypted) {
      var decrypted = crypto.aesDecrypt(
        crypto.base64Decode(data.data),
        "key",
        "iv"
      );
      data = JSON.parse(decrypted);
    }

    // 转换为标准格式
    var list = [];
    if (data.list && data.list.length > 0) {
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

    log.i("Search", "找到 " + list.length + " 条结果");
    return { list: list };
  } catch (e) {
    log.e("Search", "搜索异常: " + e.message);
    return { list: [] };
  }
}
```
