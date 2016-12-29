var express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    jwt = require('jwt-simple'),
    model = require('./model'),
    
    app = express();

app.use(express.static('./app'));
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.set('port', process.env.PORT || 8000);
app.set('jwtTokenSecret', '123456ABCDEF');

var tokens = []; // TODO make tokens being saved on server

// executed if an action requires authentication (logout, reset user changes)
function requiresAuthentication(request, response, next) {
    console.log(request.headers);
    if (request.headers.access_token) {
        var token = request.headers.access_token;
       // if (_.where(tokens, token).length > 0) {
            var decodedToken = jwt.decode(token, app.get('jwtTokenSecret'));
            if (new Date(decodedToken.expires) > new Date()) {
                next();
                return;
            } else {
                removeFromTokens();
                response.status(401).send('Your session is expired');
            }
       // }
    } 
    else {
      response.status(401).send('No access token found in the request');  
    }   
    
};

function removeFromTokens(token) {
    for (var counter = 0; counter < tokens.length; counter++) {
        if (tokens[counter] === token) {
            tokens.splice(counter, 1);
            break;
        }
    }
};

/*app.get('/', function(request, response) {
    response.sendfile('./app/map/map.template.html');
});*/

// login action handler provides very simplified validity check of given user credentials and access token generation
app.post('/api/login', function(request, response) {
    var username = request.body.username;
    var password = request.body.password;
    console.log(username,password);
    if (username === 'test' && password === 'test') {
        var expires = new Date();
        expires.setDate((new Date()).getDate() + 5);
        var token = jwt.encode({
            username: username,
            expires: expires
        }, app.get('jwtTokenSecret'));

        tokens.push(token);

        response.status(200).send({ access_token: token, username: username, dots: model });
    } 
    else {
        response.status(401).send('Invalid credentials');
    }
});

app.post('/api/logout', requiresAuthentication, function(request, response) {
    var token = request.headers.access_token;
    removeFromTokens(token);
    response.status(200).send();
});

app.post('/api/reset', requiresAuthentication, function(request, response) {
    var token = request.headers.access_token;
    response.status(200).send({ access_token: token, username: 'test', dots: model }); // TODO username
});

app.listen(8000, function () {
  console.log('Example app listening on port 8000!');
});