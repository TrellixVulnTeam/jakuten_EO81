var path = require('path');
var Router = require("router");
var opts = { mergeParams: true };
var router = Router(opts);

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var ejs = require('ejs');
var db = require('../common/db');

router.get("/", async function(req, res) {
    if(!req.session || !req.session.user || !req.session.user.id){
        res.statusCode = 302;
        res.setHeader("Location", '/');
        res.end();
        return;
    }
    var uid = req.params.uid ? Number(req.params.uid) :  req.session.user.id;
    var user = await db.get('SELECT id, email, family_name, first_name, family_name_kana, first_name_kana FROM users WHERE id = ' + uid + ';');
    if(!user){
        res.statusCode = 404;
        res.setHeader("Content-Type", 'text/html; utf-8');
        ejs.renderFile(path.join(__dirname, '../../resources/templates/_base.ejs'), {page: 'error', session: req.session}, function(err, output){
            res.end(output);  
        });
    }else{
        res.statusCode = 200;
        user.display_name = user.family_name + " " + user.first_name;
        req.session.user = user;
        res.setHeader("Content-Type", 'text/html; utf-8');
        ejs.renderFile(path.join(__dirname, '../../resources/templates/_base.ejs'), {page: 'profile', session: req.session}, function(err, output){
            res.end(output);  
        });
    }
});

module.exports = router;
