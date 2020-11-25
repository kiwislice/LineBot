

/**
 * 產生貼圖訊息物件
 * @param {string} packageId 
 * @param {string} stickerId 
 * @param {object} options 額外參數
 */
function mo_sticker(packageId, stickerId, options) {
  var o = {
    "type": "sticker",
    "packageId": packageId,
    "stickerId": stickerId,
  };
  Object.assign(o, options);
  return o;
}


/**
 * 產生圖片訊息物件
 * @param {string} url 
 * @param {object} options 額外參數
 */
function mo_image(url, options) {
  var o = {
    type: "image",
    originalContentUrl: url,
    previewImageUrl: url,
    // url: url,
  };
  Object.assign(o, options);
  return o;
}

/**
 * 產生圖片訊息物件
 * @param {string} url 
 * @param {object} options 額外參數
 */
function fmo_image(url, options) {
  var o = {
    type: "image",
    url: url,
    size: "full",
  };
  Object.assign(o, options);
  return o;
}

/**
 * 產生文字訊息物件
 * @param {string} text 
 * @param {object} options 額外參數
 */
function fmo_text(text, options) {
  var o = {
    type: "text",
    text: text,
    wrap: true,
  };
  Object.assign(o, options);
  return o;
}


/**
 * 產生button訊息物件
 * @param {object} action action物件
 * @param {object} options 額外參數
 */
function fmo_button(action, options) {
  var o = {
    type: "button",
    style: "link", // primary|secondary|link
    action: action,
  };
  Object.assign(o, options);
  return o;
}



/**
 * 產生flex bubble訊息(垂直)
 * @param {string} altText 替代文字 
 * @param {array} body box內容
 * @param {object} action action物件
 * @param {object} options 額外參數
 */
function flexBubble(altText, body, action, options) {
  var o = {
    "type": "flex",
    "altText": altText,
    "contents": {
      "action": action,
      "type": "bubble",
      "body": body,
    }
  };
  Object.assign(o, options);
  return o;
}

/**
 * 產生box容器
 * @param {array} contents 內容
 * @param {object} options 額外參數
 */
function box(contents = [], options) {
  var o = {
    "type": "box",
    "layout": true ? "vertical" : "horizontal",
    "contents": contents,
  };
  Object.assign(o, options);
  return o;
}

/**
 * Message action物件
 * @param {string} text 文字 
 */
function ao_message(text) {
  var o = {
    "type": "message",
    "label": text,
    "text": text
  };
  return o;
}



/**
 * URI action物件
 * @param {string} uri uri
 * @param {string} label 文字 
 */
function ao_uri(uri, label = "label") {
  var o = {
    "type": "uri",
    "label": label,
    "uri": uri,
  };
  return o;
}






/**
 * 可點擊的menu
 * @param {array} labels menu文字 
 * @param {number} cols column數
 */
function asMenu(labels = [], cols = 2) {
  // 轉button
  var btns = labels.map(s => fmo_button(ao_message(s), {
    color: '#754F44FF',
    height: 'sm',
    style: 'primary',
    margin: '2px',
  }));

  // 分裝grid
  var contents = [];
  for (var c = 0; c < cols; c++) {
    for (var r = 0; r < Math.ceil(labels.length / cols); r++) {
      if (contents[r] == undefined)
        contents[r] = [];
      if (btns[r * cols + c])
        contents[r].push(btns[r * cols + c]);
    }
  }
  // row轉box
  contents = contents.map(row => {
    return box(row, {
      layout: "horizontal",
      borderWidth: 'light',
      backgroundColor: '#FDD692FF',
    });
  });
  return flexBubble('menu', box(contents, {
    borderWidth: 'light',
    backgroundColor: '#FDD692FF',
  }));
}




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
  return fmo_text(text, {
    flex: 1,
    size: "lg",
    weight: "bold",
    color: "#666666",
  });
}

/**空氣品質card */
function getAqiCard(data) {
  const defineAction = ao_uri(`https://airtw.epa.gov.tw/CHT/Information/Standard/AirQualityIndicator.aspx`, `各項指標定義請按此`);
  const webAction = ao_uri(`https://airtw.epa.gov.tw/CHT/Default.aspx`);
  /**
 {
    "NO": "8.8",
    "NO2": "23.1",
    "NOx": "31.9",
    "Pollutant": "細懸浮微粒",
    "SO2": "3.6",
    "SO2_AVG": "4",
    "SiteId": "54",
    "WindDirec": "354",
    "WindSpeed": "2.2"
  }
 */

  var obj = flexBubble(`${data.SiteName}站空氣品質即時監測資料`,
    box([
      fmo_image("https://airtw.epa.gov.tw/images/logo.svg", {
        aspectRatio: "4:1",
      }),
      fmo_text(`${data.SiteName}站空氣品質\n即時監測資料`, {
        wrap: true,
        size: "xl",
        weight: "bold",
        align: "center",
        color: "#000000",
      }),
      fmo_text(`資料時間：\n${data.PublishTime}`, {
        wrap: true,
        size: "md",
        align: "center",
        color: "#000000",
      }),
      getAqiCardText(`空氣品質指標 AQI：${data.AQI}`),
      getAqiCardText(`${data.Status}`),
      getAqiCardText(`PM2.5小時濃度：${data['PM2.5']}`),
      getAqiCardText(`PM2.5移動平均：${data['PM2.5_AVG']}`),
      getAqiCardText(`PM10小時濃度：${data['PM10']}`),
      getAqiCardText(`PM10移動平均：${data['PM10_AVG']}`),
      getAqiCardText(`臭氧小時濃度：${data['O3']}`),
      getAqiCardText(`臭氧移動平均：${data['O3_8hr']}`),
      getAqiCardText(`CO小時濃度：${data['CO']}`),
      getAqiCardText(`CO移動平均：${data['CO_8hr']}`),
      fmo_button(defineAction),
    ])
    , webAction);

  return obj;
}



/**
 * 取得店家清單的flex訊息物件
 * @param {array} stores 店家清單
 * @param {string} msg 可選的副標題文字
 * @param {array} afterMsg 插入在副標題之後的json物件
 * @param {array} afterStore 插入在店家清單之後的json物件
 */
function getRestaurantButton(stores, msg, afterMsg = [], afterStore = []) {
  var obj = getRendomCard(msg);
  afterMsg.forEach((element, index) => {
    obj.contents.body.contents.push(element);
  });
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
  afterStore.forEach((element, index) => {
    obj.contents.body.contents.push(element);
  });
  return obj;
}




module.exports = {
  mo_sticker, mo_image, fmo_image, fmo_text,
  fmo_button, flexBubble, box,
  ao_message, ao_uri, getRendomCard,
  getAqiCardText, getAqiCard, getRestaurantButton, asMenu,
};

