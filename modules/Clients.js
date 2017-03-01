var fs = require('fs');
var colors = require('colors');

module.exports = function(config) {
    var self = this;

    /*
     * --- VARS ---
     */
     
    
    this.clients = [];

    this.saveInterval = null;

    /**
     * --- COMMON FUNCS --- 
     */

    this.init = function() {

        //Load clients 
        self.loadClients(); 

        //Setup saving 
        self.saveInterval = setInterval(self.writeClients, 30 * 1000);

        //end init 
    }

    this.add = function(client) {
        self.clients[client.uuid] = client; 
        console.log('[' + colors.green('Clients') + '] Client @ ' + client.uuid + ' added.');
    }
    

    /*
    * --- WRITE AND LOAD ---
    */

    this.loadClients = function() {
        
        var loaded_clients = [];
        
        try {
            loaded_clients = JSON.parse(fs.readFileSync('./db/clients.json'));
        } catch (err) {}

        self.clients = loaded_clients;
    
        console.log('[' + colors.yellow('Clients') + '] clients loaded from db..');
    

        //end loadClients
    }

    this.writeClients = function() {

        
        var writtenClients = '[]';
        try {
            writtenClients = JSON.stringify(self.clients);
        } catch (err)  {
            console.log(err);
        }

        fs.writeFileSync('./db/clients.json', writtenClients);

        console.log('[' + colors.yellow('Clients') + '] clients saved to db..');
        //end writeClients
    }



    //end Clients 
}