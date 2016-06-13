$(document).ready(function() {

    // hide the page in case there is an SSO session (to avoid flickering)
    document.body.style.display = 'none';

    // instantiate Lock
    var lock = new Auth0Lock('VieCbMZUuz0qSDy3q6LfAqMK1ALQKXfm', 'pushp2.auth0.com');

    function checkSSO() {

        // if the token is not in local storage, there is nothing to check (i.e. the user is already logged out)
        if (!localStorage.getItem('userToken')) return;

        lock.$auth0.getSSOData(function(err, data) {
        //if there is still a session, do nothing
        if (err || (data && data.sso)) return;
        // if we get here, it means there is no session on Auth0,
        // then remove the token and redirect to #login
        localStorage.removeItem('userToken');
        sessionStorage.removeItem('userToken');
        window.location.href = '/'

        });
        }

        setInterval(checkSSO, 5000);

        
        $('.btn-logout').click(function(e) {
          e.preventDefault();
          localStorage.removeItem('userToken');
          sessionStorage.removeItem('userToken');
          lock.logout({returnTo: location.href, client_id :'VieCbMZUuz0qSDy3q6LfAqMK1ALQKXfm'});
        });

    // sso requires redirect mode, hence we need to parse
    // the response from Auth0 that comes on location hash
    var hash = lock.parseHash(window.location.hash);
    if (hash && hash.id_token) {
      // the user came back from the login (either SSO or regular login),
      // save the token
      localStorage.setItem('userToken', hash.id_token);


      // redirect to "targetUrl" if any
      // This would go to a different route like
      // window.location.href = hash.state || '#home';
      // But in this case, we just hide and show things
      goToHomepage(hash.state, hash.id_token);
      return;
    }

    // Get the user token if we've saved it in localStorage before
    var idToken = localStorage.getItem('userToken');
    if (idToken) {
      // This would go to a different route like
      // window.location.href = '#home';
      // But in this case, we just hide and show things
      goToHomepage(getQueryParameter('targetUrl'), idToken);
      return;
    }

    // user is not logged, check whether there is an SSO session or not
    lock.$auth0.getSSOData(function(err, data) {
	console.log(data);
    console.log(err);
      if (!err && data.sso) {
        // there is! redirect to Auth0 for SSO
        lock.$auth0.signin({
          // If the user wanted to go to some other URL, you can track it with `state`
          callbackOnLocationHash: true,
          scope: 'openid name picture'
        });
      } else {
        // regular login
        document.body.style.display = 'inline';
      }
    });

    // Showing Login
    $('.btn-login').click(function(e) {
      e.preventDefault();
      lock.show({
        authParams: {
          scope: 'openid name picture'
        }
      });
    });


    // Sending token in header if available
    $.ajaxSetup({
      'beforeSend': function(xhr) {
        if (localStorage.getItem('userToken')) {
          xhr.setRequestHeader('Authorization',
                'Bearer ' + localStorage.getItem('userToken'));
        }
      }
    });

    $('.btn-api').click(function(e) {
        // Just call your API here. The header will be sent
    });



    function goToHomepage(state, token) {
      // Instead of redirect, we just show boxes
      document.body.style.display = 'inline';
      $('.login-box').hide();
      $('.logged-in-box').show();
      var profile = jwt_decode(token);
      $('.name').text(profile.name);
      if (state) {
        $('.url').show();
        $('.url span').text(state);
      }
    }

    function getQueryParameter(name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&]*)"),
          results = regex.exec(location.search);
      return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }




});
