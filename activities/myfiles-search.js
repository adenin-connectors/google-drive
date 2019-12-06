'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    let pagination = $.pagination(activity);
    let dateRange = $.dateRange(activity, "today");

    let url = `/drive/v3/files?q=name contains '${activity.Request.Query.query || ""}'` +
      ` AND modifiedTime>'${dateRange.startDate}' AND modifiedTime<'${dateRange.endDate}'` +
      `&pageSize=${pagination.pageSize}`;

    if (pagination.nextpage) {
      url += `&pageToken=${pagination.nextpage}`;
    }
    api.initialize(activity);
    const response = await api(url);

    if ($.isErrorResponse(activity, response)) return;

    activity.Response.Data.items = api.convertResponse(response);
    if (response.body.nextPageToken) activity.Response.Data._nextpage = response.body.nextPageToken;
  } catch (error) {
    $.handleError(activity, error);
  }
};