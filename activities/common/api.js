'use strict';

const got = require('got');
const HttpAgent = require('agentkeepalive');
const HttpsAgent = HttpAgent.HttpsAgent;

let _activity = null;

function api(path, opts) {
  if (typeof path !== 'string') {
    return Promise.reject(new TypeError(`Expected \`path\` to be a string, got ${typeof path}`));
  }

  opts = Object.assign({
    json: true,
    token: _activity.Context.connector.token,
    endpoint: 'https://www.googleapis.com',
    agent: {
      http: new HttpAgent(),
      https: new HttpsAgent()
    }
  }, opts);

  opts.headers = Object.assign({
    accept: 'application/json',
    'user-agent': 'adenin Digital Assistant Connector, https://www.adenin.com/digital-assistant'
  }, opts.headers);

  if (opts.token) opts.headers.Authorization = `Bearer ${opts.token}`;

  const url = /^http(s)\:\/\/?/.test(path) && opts.endpoint ? path : opts.endpoint + path;

  if (opts.stream) return got.stream(url, opts);

  return got(url, opts).catch((err) => {
    throw err;
  });
}

//**maps response data*/
api.convertResponse = function (response) {
  const items = [];
  const files = response.body.files;

  for (let i = 0; i < files.length; i++) {
    const raw = files[i];

    const item = {
      id: raw.id,
      title: raw.name,
      description: raw.kind,
      link: raw.webViewLink ? raw.webViewLink : 'https://drive.google.com/drive/my-drive',
      date: new Date(raw.createdTime),
      thumbnail: raw.iconLink.replace('16', '128')
    };

    const modifiedTime = new Date(raw.modifiedTime);

    if (raw.modifiedTime > item.date) item.lastModified = modifiedTime;
    if (raw.viewedByMe) item.lastOpened = new Date(raw.viewedByMeTime);

    item.raw = raw;

    items.push(item);
  }

  return items;
};

const helpers = [
  'get',
  'post',
  'put',
  'patch',
  'head',
  'delete'
];

api.initialize = (activity) => {
  _activity = activity;
};

api.stream = (url, opts) => got(url, Object.assign({}, opts, {
  json: false,
  stream: true
}));

for (const x of helpers) {
  const method = x.toUpperCase();
  api[x] = (url, opts) => api(url, Object.assign({}, opts, {method}));
  api.stream[x] = (url, opts) => api.stream(url, Object.assign({}, opts, {method}));
}

module.exports = api;
