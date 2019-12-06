'use strict';

const api = require('./common/api');

module.exports = async function (activity) {
  try {
    const pagination = $.pagination(activity);

    let url = `/drive/v3/files?fields=*&pageSize=${pagination.pageSize}`;

    if (pagination.nextpage) url += `&pageToken=${pagination.nextpage}`;

    api.initialize(activity);

    const response = await api(url);

    if ($.isErrorResponse(activity, response)) return;

    const items = api.convertResponse(response);

    let count = 0;
    let readDate = (new Date(new Date().setDate(new Date().getDate() - 30))).toISOString(); // default read date 30 days in the past

    if (activity.Request.Query.readDate) readDate = activity.Request.Query.readDate;

    readDate = new Date(readDate);

    for (let i = 0; i < items.length; i++) {
      if (items[i].date > readDate) {
        count++;
        items[i].isNew = true;
      }
    }

    activity.Response.Data.title = T(activity, 'Cloud Files');
    activity.Response.Data.items = items;

    if (parseInt(pagination.page) === 1 && count > 0) {
      const first = items[0];

      activity.Response.Data.link = 'https://drive.google.com/drive/my-drive';
      activity.Response.Data.linkLabel = T(activity, 'Go to Google Drive');
      activity.Response.Data.thumbnail = activity.Context.connector.host.connectorLogoUrl;
      activity.Response.Data.actionable = count > 0;
      activity.Response.Data.value = count;
      activity.Response.Data.description = count > 1 ? `You have ${count} new cloud files.` : 'You have 1 new cloud file.';
      activity.Response.Data.briefing = activity.Response.Data.description + ` The latest is '${first.title}'`;
    } else {
      activity.Response.Data.description = T(activity, 'You have no new cloud files.');
    }

    if (response.body.nextPageToken) activity.Response.Data._nextpage = response.body.nextPageToken;
  } catch (error) {
    $.handleError(activity, error);
  }
};
