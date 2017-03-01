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

            //Validate uuid 
            //TODO: VALIDATE

            next();


            //end /device/*
        });




        //end setupRouting
    }

    

    //end routes 
}