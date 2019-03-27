'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    let pagination = Activity.pagination();
    let dateRange = Activity.dateRange("today");

    let url = `/drive/v3/files?q=name contains '${activity.Request.Query.query || ""}'` +
      ` AND modifiedTime>'${dateRange.startDate}' AND modifiedTime<'${dateRange.endDate}'` +
      `&pageSize=${pagination.pageSize}`;

    if (pagination.nextpage) {
      url += `&pageToken=${pagination.nextpage}`;
    }

    const response = await api(url);

    if (Activity.isErrorResponse(response)) return;

    activity.Response.Data = api.convertResponse(response);
    if (response.body.nextPageToken) {
      activity.Response.Data._nextpage = response.body.nextPageToken;
    }
  } catch (error) {
    Activity.handleError(error);
  }
};