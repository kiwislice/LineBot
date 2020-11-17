event.reply({
    type: "flex",
    altText: "Q1. Which is the API to create chatbot?",
    contents: {
      type: "carousel",
      contents: [
        {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: [
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "第1名",
                    align: "center",
                    size: "xxl",
                    weight: "bold",
                  },
                ],
              },
              {
                type: "separator",
              },
              {
                type: "box",
                layout: "vertical",
                margin: "lg",
                contents: [
                  {
                    type: "box",
                    layout: "baseline",
                    contents: [
                      // {
                      //   type: "text",
                      //   text: "1.",
                      //   flex: 1,
                      //   size: "lg",
                      //   weight: "bold",
                      //   color: "#666666",
                      // },
                      {
                        type: "text",
                        text: "餐廳名稱",
                        wrap: true,
                        flex: 9,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          footer: {
            type: "box",
            layout: "horizontal",
            spacing: "sm",
            contents: [
              {
                type: "button",
                style: "primary",
                action: {
                  type: "uri",
                  label: "請點我!",
                  uri: "https://example.com",
                },
              },
            ],
          },
        },
        {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: [
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "第2名",
                    align: "center",
                    size: "xxl",
                    weight: "bold",
                  },
                ],
              },
              {
                type: "separator",
              },
              {
                type: "box",
                layout: "vertical",
                margin: "lg",
                contents: [
                  {
                    type: "box",
                    layout: "baseline",
                    contents: [
                      // {
                      //   type: "text",
                      //   text: "1.",
                      //   flex: 1,
                      //   size: "lg",
                      //   weight: "bold",
                      //   color: "#666666",
                      // },
                      {
                        type: "text",
                        text: "餐廳名稱",
                        wrap: true,
                        flex: 9,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          footer: {
            type: "box",
            layout: "horizontal",
            spacing: "sm",
            contents: [
              {
                type: "button",
                style: "primary",
                action: {
                  type: "uri",
                  label: "請點我!",
                  uri: "https://example.com",
                },
              },
            ],
          },
        },
      ],
    },
  });