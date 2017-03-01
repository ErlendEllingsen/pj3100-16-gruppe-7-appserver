var uuid = require('uuid');


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


        router.get('/device/init', function(req, res) {

            var client = new config.classes['Client'](config);
            config.vars.clients.add(client);

            res.json(client);

            //var new_uuid = uuid.v4();
            //res.send(new_uuid);

            
            return;

            //end /device/init 
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
            if (clients.clients[header_uuid] == undefined) {
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

        router.get('/device/fetch', function(req, res){

            var client = config.vars.clients.clients[req.headers['dnbsmart-uuid']];
            res.json(client);

        });




        //end setupRouting
    }

    

    //end routes 
}