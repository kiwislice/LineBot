
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


module.exports = {
  getSubscribedUserId: function (obj, resCallback) {
    var o = { service_id: obj.service_id };
    axios
      .post(DB_URL, {
        query: graphql.print(GET_SUBSCRIBED_USER_ID),
        variables: o,
      })
      .then((response) => resCallback && resCallback(response));
  },
  createSubscribedUserId: function (obj, resCallback) {
    var o = { service_id: obj.service_id, user_id: obj.user_id };
    console.log("createSubscribedUserId: %s", o);
    axios
      .post(DB_URL, {
        query: graphql.print(CREATE_SUBSCRIBED_USER_ID),
        variables: o,
      })
      .then((response) => resCallback && resCallback(response));
  },
  deleteSubscribedUserId: function (obj, resCallback) {
    var o = { service_id: obj.service_id, user_id: obj.user_id };
    console.log("deleteSubscribedUserId: %s", o);
    axios
      .post(DB_URL, {
        query: graphql.print(DELETE_SUBSCRIBED_USER_ID),
        variables: o,
      })
      .then((response) => resCallback && resCallback(response));
  },
};


