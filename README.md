# Bot 功能


#### 訂閱午餐外送提醒

```javascript
開啟訂餐通知    // 訂閱此功能
關閉訂餐通知    // 取消訂閱此功能

// 在提醒出現後才有效的指令
+1             // 報名

// 在投票開始後才有效的指令
/1             // 投票
重抽           // 刷新投票店家，並清空投票紀錄
```



#### 點餐收集功能

```javascript
開始點餐    // 啟動功能
結束點餐    // 結束功能

// 在功能啟動時才有效的指令
清單       // 列出目前已收集的訂單
/餐點名稱   // 收集餐點
```



#### 每月IMS回報工時提醒功能

```javascript
啟動IMS回報    // 訂閱此功能
關閉IMS回報    // 取消訂閱此功能
```



#### 每日下班前空氣品質通知功能

```javascript
開啟空氣品質通知    // 訂閱此功能
關閉空氣品質通知    // 取消訂閱此功能

空氣品質           // 顯示最新空氣品質
```


#### 將助理踢出群組

```javascript
助理，你被開除了    // 踢出助理
```


#### 手動回覆訊息

```javascript
reply:目標訊息;要回覆的訊息    // 只紀錄最近5筆訊息
reply clear all              // 清除所有回覆訊息Map
reply clear xxx              // 清除指定回覆訊息Map
```


#### 測試用

```javascript
開啟排程測試通知
關閉排程測試通知
```


#### 顯示到昨天為止的已推送訊息數量

```javascript
pushCount
```

