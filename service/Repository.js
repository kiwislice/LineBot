
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



function postDb(queryConst, variable, resCallback) {
  axios
    .post(DB_URL, {
      query: graphql.print(queryConst),
      variables: variable,
    })
    .then((response) => resCallback && resCallback(response));
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
  getAllUser: function (resCallback) {
    postDb(GET_USER, null, resCallback);
  },
  createUser: function (obj, resCallback) {
    var o = { id: obj.id, name: obj.name };
    postDb(CREATE_USER, o, resCallback);
  },




};


