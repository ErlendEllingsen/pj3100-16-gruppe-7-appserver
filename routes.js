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

            


            //end /device/init 
        });




        //end setupRouting
    }

    

    //end routes 
}