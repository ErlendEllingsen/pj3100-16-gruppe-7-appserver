var uuid = require('uuid');
var moment = require('moment');


module.exports = function(router, app_package, config) {

    var self = this; 

    this.getClient = function(req) {

        var client = config.vars.clients.storedClients[req.headers['dnbsmart-uuid']];
        
        var c = new config.classes['Client'](config);
        for (var prop in client) {
            c[prop] = client[prop];
        }
        client = c;
        
        return client;

        //end getClient
    }

    this.saveClient = function(req, client) {
        config.vars.clients.storedClients[req.headers['dnbsmart-uuid']] = client;
        //end saveClient 
    }

    this.setupRouting = function() {

        router.get('/', function(req, res){
            res.json({
                version: app_package.version,
                time: Date.now() / 1000,
                homan: new Date().toString()
            });
        });

        // --- OTHER --- 
        router.get('/misc/delete-all-clients', function(req, res){

            //Empty the storage.
            config.vars.clients.storedClients = {};
            config.vars.clients.writeClients();
            
            res.json({
                status: true
            });

        });


        // --- MIDDLEWARES ---
        router.post('/device/register', function(req, res) {

            var client = new config.classes['Client'](config);

            //Adjust client properties
            client.uuid = req.body.token;
            client.name_first = req.body.nameFirst;
            client.name_last = req.body.nameLast;

            //--- DEMO: Append email ---
            if (client.uuid == 'erlend') {
                client.email = 'erlend.ame@gmail.com'; //Set vars
            }

            config.vars.clients.add(client);

            res.json(client);

        });

        // --- CONTROL PANEL ACTIONS ---

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

        // --- DEVICE METHODS ---

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

            var client = self.getClient(req);

            client.prepareDate();

            //Add date
            client.currentDate = moment().format('DD.MM.YYYY');

            res.json(client);

        });

        // --- DEVICE: Update values ---
        router.post('/device/update/activeSavingsAccount', function(req, res){

        
            var client = self.getClient(req);

            //Validate input 
            if (req.body.account == undefined) {
                res.json({
                    status: false,
                    msg: 'Input invalid.'
                });
                return;
            }

            var newAccount = req.body.account; 

            //Validate account 
            if (client.finance.accounts.savings[newAccount] == undefined) {
                res.json({
                    status: false,
                    msg: 'Invalid account.'
                });
                return;
            }

            //Update client 
            client.finance.accounts.savings_activeAccount = newAccount; 
            //Store client
            self.saveClient(req, client);

            res.json({
                'status': true,
                'client': client
            });
        });

        // --- DEVICE: Events ---

        router.get('/device/event/test', function(req, res){
            var client = self.getClient(req);

            //Create budgets!
            client.createDailyBudget();
            client.calculateEventSavings();

            res.json(client);

        });

        router.get('/device/event/clear', function(req, res){
            var client = self.getClient(req);

            client.finance.events = []; //Clear the events 

            self.saveClient(req, client);
            res.json({
                'status': true,
                'client': client
            });

            console.log('cleared events for client ' + client.uuid);
        });

        router.get('/device/event/delete/:uuid', function(req, res){
            var eventUuid = req.params.uuid;

            var client = self.getClient(req);

            //Kødd
            var newEvts = []; 
            for (var i = 0; i < client.finance.events.length; i++) {

                var evt = client.finance.events[i];
                if (evt.uuid == eventUuid) {
                    //Found match
                    continue;
                }

                newEvts.push(evt);
            }

            //Overwrite existing events array 
            client.finance.events = newEvts;

            //Save changes 
            self.saveClient(req, client);

            //Output success
            res.json({
                'status': true,
                'client': client
            });

        });

        router.post('/device/event/new', function(req, res){

            var client = self.getClient(req);
            client.createEvent(req.body.title, req.body.desc, req.body.sum, req.body.date);
            self.saveClient(req, client);

            res.json({
                'status': true,
                'client': client
            });

        });

        //end setupRouting
    }

    

    //end routes 
}