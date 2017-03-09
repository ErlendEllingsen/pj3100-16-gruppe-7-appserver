var uuid = require('uuid');
var moment = require('moment');


module.exports = function(router, app_package, config) {

    this.setupRouting = function() {

        router.get('/', function(req, res){
            res.json({
                version: app_package.version,
                time: Date.now() / 1000,
                homan: new Date().toString()
            });
        });


        //MIDDLEWARES 
        router.post('/device/register', function(req, res) {

            var client = new config.classes['Client'](config);

            //Adjust client properties
            client.uuid = req.body.token;
            client.name_first = req.body.nameFirst;
            client.name_last = req.body.nameLast;

            config.vars.clients.add(client);

            res.json(client);

        });

        router.get('/device/init', function(req, res) {

            var client = new config.classes['Client'](config);
            config.vars.clients.add(client);

            //Add date
            client.currentDate = moment().format('DD.MM.YYYY');

            res.json(client);

            //var new_uuid = uuid.v4();
            //res.send(new_uuid);

            
            return;

            //end /device/init 
        });

        router.get('/control-panel/load', function(req, res){
            res.json(config.vars.clients.storedClients);
            console.log('Control panel /load command');
        });

        router.post('/control-panel/save', function(req, res){

            var clientData = JSON.parse(req.body.clientData);
            

            config.vars.clients.storedClients = clientData;
            config.vars.clients.writeClients();
            res.json({status: true});
            console.log('Control panel /save command');
        });

        router.use('/device/', function(req, res, next){

            //Check UUID
            if (req.headers['dnbsmart-uuid'] == undefined) {
                res.json({
                    status: false,
                    msg: 'missing uuid'
                });
                return;
            }

            var header_uuid = req.headers['dnbsmart-uuid'];

            //Validate uuid 
            var clients = config.vars.clients;
            if (clients.storedClients[header_uuid] == undefined) {
                res.json({
                    status: false,
                    msg: 'invalid uuid'
                });
                return;
            }


            //Next
            next();


            //end /device/*
        });

        router.get('/device/fetchAll', function(req, res){
            res.json(config.vars.clients.storedClients);
        });

        router.get('/device/fetch', function(req, res){

            var client = config.vars.clients.storedClients[req.headers['dnbsmart-uuid']];

            //Add date
            client.currentDate = moment().format('DD.MM.YYYY');

            res.json(client);

        });




        //end setupRouting
    }

    

    //end routes 
}