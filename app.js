var Data = {
  rankings: {
    list: null,
    error: '',
    fetch: function() {
      m.request({
        method: 'GET',
        url: '/rankings.csv',
        deserialize: function(csv) {
          return Papa.parse(csv, { delimiter: ',', header: true, skipEmptyLines: true });
        },
      }).then(function(result) {
        if (result.errors.length > 0) {
          Data.rankings.error = 'Error: ' + result.errors[0].message;
          return;
        }
        Data.rankings.list = result.data;
      }).catch(function(error) {
        Data.rankings.error = error.message;
      });
    },
  }
};

function extractDomain(url) {
  var trimmedURL = url.replace(/^https?:\/\//, '');
  var pathIndex = trimmedURL.indexOf('/');
  if (pathIndex === -1) {
    return trimmedURL;
  } else {
    return trimmedURL.slice(0, pathIndex);
  }
}

var Rankings = {
  oninit: Data.rankings.fetch,
  view: function(vnode) {
    var content;

    if (Data.rankings.error) {
      content = m('tr', [
        m('td.error', {colspan: 9999}, Data.rankings.error)
      ]);
    } else if (Data.rankings.list) {
      content = Data.rankings.list.map(function(item) {
        return m('tr.ranking-row', [
          m('td.link', [
            m('a', {href: item.link, target: "_blank"}, item.title),
            ' ',
            m('span.light', extractDomain(item.link))
          ]),
          m('td.author', item.author),
          m('td.score', item.score),
          // m('td.desc', item.comment),
        ])
      });
    } else {
      content = m('.loading-icon');
    }
    return m('.Rankings', [
      m('table.rankings', [
        m('thead', [
          m('th.link', 'Title'),
          m('th.author', 'Author'),
          m('th.score', 'Score'),
          // m('th.desc', 'Description'),
        ]),
        m('tbody', content),
      ]),
    ]);
  }
};

var Layout = {
  view: function(vnode) {
    return m('.container#app', [
      m('.header', [
        m('h3', 'quality-ranked'),
      ]),
      m('.content', [
        vnode.children
      ])
    ]);
  }
}

m.route(document.body, '/', {
  '/': {
    render: function() { return m(Layout, m(Rankings)); },
  },
})
