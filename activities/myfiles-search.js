'use strict';
const api = require('./common/api');
const logger = require('@adenin/cf-logger');
const cfActivity = require('@adenin/cf-activity');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    let pagination = cfActivity.pagination(activity);
    let dateRange = cfActivity.dateRange(activity, "today");

    let url = `/drive/v3/files?q=name contains '${activity.Request.Query.query || ""}'` +
      ` AND modifiedTime>'${dateRange.startDate}' AND modifiedTime<'${dateRange.endDate}'` +
      `&pageSize=${pagination.pageSize}`;

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
    cfActivity.handleError(error, activity);
  }
};