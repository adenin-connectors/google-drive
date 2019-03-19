'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async function (activity) {

  try {
    api.initialize(activity);

    let pagination = cfActivity.pagination(activity);
    let url = `/drive/v3/files?pageSize=${pagination.pageSize}`;
    if (pagination.nextpage) {
      url += `&pageToken=${pagination.nextpage}`;
    }
    const response = await api(url);

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    activity.Response.Data = api.convertResponse(response);

    if (response.body.nextPageToken) {
      activity.Response.Data._nextpage = response.body.nextPageToken;
    }
  } catch (error) {
    cfActivity.handleError(activity, error);
  }
};
