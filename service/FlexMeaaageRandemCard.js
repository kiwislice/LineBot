function getRendomCard() {
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
            text: "今日午餐-餐廳推薦!",
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
function getRestaurantButton(msg) {
    var obj = getRendomCard();
    msg.forEach(element => 
        obj.contents.body.contents.push({
            type: "button",
            style: "primary",
            action: {
              type: "uri",
              label: element.name,
              uri: element.url,
            },
          })
    );
  return obj;
}
module.exports = {getRestaurantButton};
