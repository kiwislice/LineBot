

function getRendomCard(msg) {
  var obj = {
    type: "flex",
    altText: "今日UberPanda餐廳推薦!",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          {
            type: "image",
            url:
              "https://vos.line-scdn.net/bot-designer-template-images/event/brown-card.png",
            size: "xl",
          },
          {
            type: "text",
            text: "UberPanda",
            wrap: true,
            size: "xl",
            weight: "bold",
            align: "center",
            color: "#000000",
          },
          {
            type: "text",
            text: msg || "今日午餐-餐廳推薦!",
            wrap: true,
            size: "md",
            align: "center",
            color: "#000000",
          },
        ],
      },
    },
  };
  return obj;
}

/**空氣品質card的一行資料 */
function getAqiCardText(text) {
  return {
    type: "text",
    text: text,
    flex: 1,
    size: "lg",
    weight: "bold",
    color: "#666666",
  };
}

/**空氣品質card */
function getAqiCard(data) {

  /**
 {
    "CO": "0.66",
    "CO_8hr": "0.5",
    "NO": "8.8",
    "NO2": "23.1",
    "NOx": "31.9",
    "O3": "7.2",
    "O3_8hr": "8",
    "Pollutant": "細懸浮微粒",
    "SO2": "3.6",
    "SO2_AVG": "4",
    "SiteId": "54",
    "WindDirec": "354",
    "WindSpeed": "2.2"
  }
 */

  var obj = {
    type: "flex",
    altText: `${data.SiteName}站空氣品質即時監測資料`,
    contents: {
      action: {
        type: "uri",
        label: "element.name",
        uri: "https://airtw.epa.gov.tw/CHT/Default.aspx",
      },
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          {
            type: "image",
            url: "https://airtw.epa.gov.tw/images/logo.svg",
            size: "full",
            aspectRatio: "4:1",
          },
          {
            type: "text",
            text: `${data.SiteName}站空氣品質\n即時監測資料`,
            wrap: true,
            size: "xl",
            weight: "bold",
            align: "center",
            color: "#000000",
          },
          {
            type: "text",
            text: `資料時間：\n${data.PublishTime}`,
            wrap: true,
            size: "md",
            align: "center",
            color: "#000000",
          },
          getAqiCardText(`空氣品質指標 AQI：${data.AQI}`),
          getAqiCardText(`${data.Status}`),
          getAqiCardText(`PM2.5：${data['PM2.5']}`),
          getAqiCardText(`PM2.5平均：${data['PM2.5_AVG']}`),
          getAqiCardText(`PM10：${data['PM10']}`),
          getAqiCardText(`PM10平均：${data['PM10_AVG']}`),
        ],
      },
    },
  };
  return obj;
}

/**
 * 取得店家清單的flex訊息物件
 * @param {array} stores 店家清單
 * @param {string} msg 可選的副標題文字
 */
function getRestaurantButton(stores, msg) {
  var obj = getRendomCard(msg);
  stores.forEach((element, index) =>
    obj.contents.body.contents.push({
      type: "button",
      style: "primary",
      action: {
        type: "uri",
        label: `${index + 1}. ${element.name}`,
        uri: element.url,
      },
    })
  );
  return obj;
}


module.exports = { getRestaurantButton, getAqiCard };
