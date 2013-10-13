(function(d) {
  var baseurl = 'https://api.github.com/', i;

  function querystring() {
    var href = window.location.href, kv;
    var params = href.slice(href.indexOf('?') + 1).split('&');
    var qs = [];

    for (i = 0; i < params.length; i++) {
      kv = params[i].split('=');
      qs.push(kv[0]);
      qs[kv[0]] = kv[1];
    }
    return qs;
  }

  var jsonpfunc = 'ghcard' + new Date().valueOf();

  function jsonp(url, callback) {
    window[jsonpfunc] = function(response) {
      callback(response);
    }
    var script = d.createElement('script');
    script.src = url + '?callback=' + jsonpfunc;
    d.body.appendChild(script);
  }

  function linky(card) {
    var links = card.getElementsByTagName('a');
    for (i = 0; i < links.length; i++) {
      (function(link) {
        link.onclick = function() {
          top.location.href = link.href;
        }
      })(links[i]);
    }
  }

  function userCard(user) {
    var url = baseurl + 'users/' + user;
    var template = '<div class="header">'
      + '<a class="avatar" href="https://github.com/#username">'
      + '<img src="#avatar">'
      + '<strong>#fullname</strong>'
      + '<span>@#username</span></a>'
      + '<a class="button" href="https://github.com/#username">Follow</a>'
      + '</div>'
      + '<ul class="status">'
      + '<li><a href="https://github.com/#username?tab=repositories"><strong>#repos</strong>Repos</a></li>'
      + '<li><a href="https://gist.github.com/#username"><strong>#gists</strong>Gists</a></li>'
      + '<li><a href="https://github.com/#username/followers"><strong>#followers</strong>Followers</a></li>'
      + '</ul>'
      + '<div class="footer">#footer</a></div>'
      + '</div>';
    jsonp(url, function(response) {
      var data = response.data;
      template = template.replace(/#username/g, data.login);
      template = template.replace('#avatar', data.avatar_url);
      template = template.replace('#fullname', data.name);
      template = template.replace('#repos', data.public_repos);
      template = template.replace('#gists', data.public_gists);
      template = template.replace('#followers', data.followers);
      var footer = 'Not available for hiring.';
      if (data.hireable) {
        var url = ''
        if (data.email) {
          url = 'mailto:' + data.email;
        } else if (data.blog) {
          url = data.blog;
        } else {
          url = data.html_url;
        }
        footer = '<a href="' + url + '">Available for hiring.</a>';
      }
      template = template.replace('#footer', footer);
      var card = d.createElement('div');
      card.className = 'github-card user-card';
      card.innerHTML = template;
      linky(card);
      d.body.appendChild(card);
    });
  }

  function repoCard(user, repo) {
    var url = baseurl + 'repos/' + user + '/' + repo;
    var template = '<div class="github-card repo-card">'
      + '<div class="header">'
      + '<a class="avatar" href="https://github.com/#username">'
      + '<img src="#avatar"></a>'
      + '<strong class="name">'
      + '<a href="https://github.com/#username/#repo">#repo</a>'
      + '<sup class="language">#language</sup></strong>'
      + '<span>#action by <a href="https://github.com/#username"">#username</a></span>'
      + '<a class="button" href="https://github.com/#username/#repo">Star</a>'
      + '</div>'
      + '<div class="content">'
      + '<p>#description#homepage</p>'
      + '</div>'
      + '<div class="footer">'
      + '<span class="status">'
      + '<strong>#forks</strong> Forks'
      + '</span>'
      + '<span class="status">'
      + '<strong>#stars</strong> Stars'
      + '</span></div></div>';
    jsonp(url, function(response) {
      var data = response.data;
      template = template.replace(/#username/g, user);
      template = template.replace(/#repo/g, repo);
      template = template.replace('#avatar', data.owner.avatar_url);
      template = template.replace('#language', data.language || '');
      template = template.replace('#forks', data.forks_count);
      template = template.replace('#stars', data.watchers_count);
      if (data.fork) {
        template = template.replace('#action', 'Forked');
      } else {
        template = template.replace('#action', 'Created');
      }
      var description = data.description;
      if (!description && data.source) {
        description = data.source.description;
      }
      template = template.replace('#description', description || 'No description.');
      var homepage = data.homepage;
      if (!homepage && data.source) {
        homepage = data.source.homepage;
      }
      if (homepage) {
        homepage = ' <a href="' + homepage + '">' + homepage.replace(/https?:\/\//, '') + '</a>';
      }
      template = template.replace('#homepage', homepage || '');

      var card = d.createElement('div');
      card.className = 'github-card repo-card';
      card.innerHTML = template;
      linky(card);
      d.body.appendChild(card);
    });
  }

  function errorCard() {
  }

  var qs = querystring();
  if (!qs.user) {
    errorCard();
  } else if (qs.repo) {
    repoCard(qs.user, qs.repo);
  } else {
    userCard(qs.user);
  }

})(document);