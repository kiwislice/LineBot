
const axios = require('axios');
const graphql = require('graphql');
const gql = require('graphql-tag');

const DB_URL = "https://evident-lamprey-59.hasura.app/v1/graphql";

const GET_SUBSCRIBED_USER_ID = gql`
  query allSubscribedUserId($service_id: String!) {
    linebot_subscribed(where: {service_id: {_eq: $service_id}}) {
      user_id
    }
  }
`;

const CREATE_SUBSCRIBED_USER_ID = gql`
  mutation addSubscribedUserId($service_id: String!, $user_id: String!) {
    insert_linebot_subscribed_one(object: { service_id: $service_id, user_id: $user_id }) {
      service_id
    }
  }
`;

const DELETE_SUBSCRIBED_USER_ID = gql`
  mutation addSubscribedUserId($service_id: String!, $user_id: String!) {
    delete_linebot_subscribed_by_pk(service_id: $service_id, user_id: $user_id) {
      service_id
      user_id
    }
  }
`;

const GET_DISTINCT_SUBSCRIBED_USER_ID = gql`
  query distinctSubscribedUserId($distinct_on: [linebot_subscribed_select_column!] = user_id) {
    linebot_subscribed(distinct_on: $distinct_on) {
      user_id
    }
  }
`;

const GET_USER = gql`
  query allUser {
    user(order_by: {id: asc}) {
      id
      name
    }
  }
`;

const CREATE_USER = gql`
  mutation addUser($id: String!, $name: String = null) {
    insert_user_one(object: { id: $id, name: $name }) {
      id
    }
  }
`;

const GET_USER_BY_ID = gql`
  query getUserById($id: String!) {
    user_by_pk(id: $id) {
      id
      name
    }
  }
`;

const GET_ALL_STORE = gql`
  query allStore {
    store(order_by: {score: desc, id: desc}) {
      id
      name
      url
      score
    }
  }
`;



function postDb(queryConst, variable, resCallback) {
  return axios
    .post(DB_URL, {
      query: graphql.print(queryConst),
      variables: variable,
    })
    .then((response) => resCallback && resCallback(response));
}

// 洗牌
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

//=> [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ..., n]
function array0toN(n) {
  return Array.from(Array(n + 1).keys());
}

// 從權重陣列抽取n個位置，權重影響機率，回傳位置陣列，取後不放回，權重可負數
function random(weights, n) {
  if (n <= 0)
    return [];
  if (n >= weights.length)
    return array0toN(weights.length - 1);

  var shift = Math.abs(Math.min(...weights));
  var ar = weights.map(x => x + shift + 1);
  var total = ar.reduce((a, b) => a + b);
  var rtn = [];

  while (rtn.length < n) {
    var r = Math.random() * total;
    var sum = 0;
    for (var i = 0; i < ar.length; i++) {
      sum += ar[i];
      if (r <= sum) {
        rtn.push(i);
        ar[i] = 0;
        total -= ar[i];
        break;
      }
    }
  }
  return rtn;
}

module.exports = {
  getSubscribedUserId: function (obj, resCallback) {
    var o = { service_id: obj.service_id };
    postDb(GET_SUBSCRIBED_USER_ID, o, resCallback);
  },
  createSubscribedUserId: function (obj, resCallback) {
    var o = { service_id: obj.service_id, user_id: obj.user_id };
    postDb(CREATE_SUBSCRIBED_USER_ID, o, resCallback);
  },
  deleteSubscribedUserId: function (obj, resCallback) {
    var o = { service_id: obj.service_id, user_id: obj.user_id };
    postDb(DELETE_SUBSCRIBED_USER_ID, o, resCallback);
  },
  getDistinctSubscribedUserId: async function () {
    var rtn = [];
    await postDb(GET_DISTINCT_SUBSCRIBED_USER_ID, null, (response) => {
      rtn = response.data.data.linebot_subscribed.map(x => x.user_id);
    });
    return rtn;
  },
  getAllUser: function (resCallback) {
    postDb(GET_USER, null, resCallback);
  },
  createUser: function (obj, resCallback) {
    var o = { id: obj.id, name: obj.name };
    postDb(CREATE_USER, o, resCallback);
  },
  getUserById: async function (uid) {
    var user = null;
    await postDb(GET_USER_BY_ID, { id: uid }, (response) => {
      user = response.data.data.user_by_pk;
    });
    return user;
  },
  getAllStores: async function () {
    var stores = [];
    await postDb(GET_ALL_STORE, null, (response) => stores = response.data.data.store);
    return stores;
  },
  // 隨機抽n間店家，以分數為權重
  randomStores: async function (n) {
    var stores = await this.getAllStores();
    if (n <= 0)
      return [];
    if (n >= stores.length)
      return stores;

    var scores = stores.map(x => x.score);
    var index = random(scores, n);
    var rtn = [];
    index.forEach(i => rtn.push(stores[i]));
    return rtn;
  },

};


