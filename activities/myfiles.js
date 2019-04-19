'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    let pagination = $.pagination(activity);
    let url = `/drive/v3/files?pageSize=${pagination.pageSize}`;
    if (pagination.nextpage) {
      url += `&pageToken=${pagination.nextpage}`;
    }
    api.initialize(activity);
    const response = await api(url);

    if ($.isErrorResponse(activity, response)) return;

    activity.Response.Data = api.convertResponse(response);

    if (response.body.nextPageToken) {
      activity.Response.Data._nextpage = response.body.nextPageToken;
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};
