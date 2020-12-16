

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
    ...options
  };
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
    ...options
  };
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
    ...options
  };
  return o;
}

/**
 * 產生icon訊息物件
 * @param {string} url 
 * @param {object} options 額外參數
 */
function fmo_icon(url, options) {
  var o = {
    type: "icon",
    url: url,
    size: "lg",
    ...options
  };
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
    ...options
  };
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
    ...options
  };
  return o;
}



/**
 * 產生flex bubble訊息(垂直)
 * @param {string} altText 替代文字 
 * @param {object} body box內容
 * @param {object} contentsOptions contents額外參數
 * @param {object} flexOptions flex額外參數
 */
function flexBubble(altText, body, { contentsOptions, flexOptions } = {}) {
  var o = {
    "type": "flex",
    "altText": altText,
    "contents": {
      "type": "bubble",
      "body": body,
      ...contentsOptions
    },
    ...flexOptions
  };
  return o;
}

/**
 * 產生horizontal box容器
 * @param {array} contents 內容
 * @param {object} options 額外參數
 */
function hBox(contents = [], options) {
  var o = {
    "type": "box",
    "layout": "horizontal",
    "contents": contents,
    ...options
  };
  return o;
}

/**
 * vertical box容器
 * @param {array} contents 內容
 * @param {object} options 額外參數
 */
function vBox(contents = [], options) {
  var o = {
    "type": "box",
    "layout": "vertical",
    "contents": contents,
    ...options
  };
  return o;
}

/**
 * 產生grid排列的box容器
 * @param {array} contents 內容
 * @param {number} cols column數
 * @param {object} options 額外參數
 */
function gridBox(contents = [], cols = 2, options) {
  // 分裝grid
  var grid = [];
  for (var c = 0; c < cols; c++) {
    for (var r = 0; r < Math.ceil(contents.length / cols); r++) {
      if (grid[r] == undefined)
        grid[r] = [];
      if (contents[r * cols + c])
        grid[r].push(contents[r * cols + c]);
    }
  }
  // row轉box
  grid = grid.map(row => {
    return hBox(row, options);
  });
  return vBox(grid, options);
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
  return flexBubble('menu', gridBox(btns, cols, {
    borderWidth: 'light',
    backgroundColor: '#FDD692FF',
  }));
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
  // 定義Action
  const defineAction = ao_uri(`https://airtw.epa.gov.tw/CHT/Information/Standard/AirQualityIndicator.aspx`, `各項指標定義請按此`);
  const webAction = ao_uri(`https://airtw.epa.gov.tw/CHT/Default.aspx`);

  // FOOTER區
  var btns = ['雷達回波', '空氣品質', '氣象觀測', '天氣警特報'].map(s => fmo_button(ao_message(s), {
    color: '#7BA23FFF',
    height: 'sm',
    style: 'primary',
    margin: '2px',
  }));
  var footer = gridBox(btns, 2, {
    borderWidth: 'light',
    backgroundColor: '#FCFAF2FF',
  });
  footer.contents.unshift(fmo_text('以下為可點選的其他資訊', { align: 'center' }));

  const contentsOptions = { footer: footer };


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
    vBox([
      fmo_image("https://airtw.epa.gov.tw/images/logo.svg", {
        aspectRatio: "4:1",
        action: webAction,
      }),
      fmo_text(`${data.SiteName}站空氣品質\n即時監測資料`, {
        wrap: true,
        size: "xl",
        weight: "bold",
        align: "center",
        color: "#000000",
        action: webAction,
      }),
      fmo_text(`資料時間：\n${data.PublishTime}`, {
        wrap: true,
        size: "md",
        align: "center",
        color: "#000000",
        action: webAction,
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
      fmo_button(defineAction, {
        color: '#A5DEE4FF',
        height: 'sm',
        style: 'secondary',
        margin: '2px',
      }),
    ])
    , { contentsOptions: contentsOptions });

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
  // <a href='https://www.freepik.com/photos/food'>Food photo created by timolina - www.freepik.com</a>
  const bannerLink = "https://image.freepik.com/free-photo/chicken-wings-barbecue-sweetly-sour-sauce-picnic-summer-menu-tasty-food-top-view-flat-lay_2829-6470.jpg";
  var hero = fmo_image(bannerLink, { aspectRatio: '60:23' });
  const contentsOptions = { hero: hero };

  const uberIcon = "https://d3i4yxtzktqr9n.cloudfront.net/web-eats-v2/112ff5fdd1f8930464dcb71900faa42c.png";
  const pandaIcon = "https://assets.foodora.com/5e961f5/img/favicon/foodpanda/favicon-32x32.png?5e961f5";

  var storesObj = stores.map((store, index) => {
    var action = ao_uri(store.url, `${index + 1}. ${store.name}`);
    var text = fmo_text(`${index + 1}. ${store.name}`, {
      gravity: 'center',
      size: 'lg',
      wrap: false,
    });
    var iconUrl = store.url.includes('https://www.ubereats.com/') ? uberIcon : pandaIcon;
    var img = fmo_image(iconUrl,
      {
        aspectRatio: '1:1',
        size: '30px',
        flex: 0,
        gravity: 'center',
        margin: 'xs',
      });

    return hBox([img, text], {
      spacing: "xs",
      backgroundColor: '#f09c5aFF',
      cornerRadius: 'md',
      action: action,
      height: '50px',
    });
  });

  var obj = flexBubble(`今日UberPanda餐廳推薦!`,
    vBox([
      fmo_text(`UberPanda`, {
        wrap: true,
        size: "xl",
        weight: "bold",
        align: "center",
        color: "#000000",
      }),
      fmo_text(msg || `今日午餐-餐廳推薦!`, {
        wrap: true,
        size: "md",
        align: "center",
        color: "#000000",
      }),
      ...afterMsg,
      ...storesObj,
      ...afterStore,
    ], { spacing: "sm" }),
    {
      contentsOptions: contentsOptions,
      flexOptions: { /*size: 'nano'*/ },
    },
  );
  return obj;
}




module.exports = {
  mo_sticker, mo_image, fmo_image, fmo_text, fmo_icon,
  fmo_button, flexBubble, vBox, hBox,
  ao_message, ao_uri,
  getAqiCardText, getAqiCard, getRestaurantButton, asMenu,
};

