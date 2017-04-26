var moment = require('moment');
var colors = require('colors');

module.exports = function() {

    var self = this; 

    //--- DEMO: DATE CONTROL ---
    //Instead of using the actual date we want it to be controllable.

    this.serverDate = {
        date: moment()
    };

    this.getDate = function() {
        return self.serverDate.date;
        //end getDate
    }

    this.getDateFormatted = function() {
        return moment(self.getDate()).format('DD.MM.YYYY');
        //end getDateFormatted
    }

    this.getPrevDateFormatted = function() {
        var m = new moment(self.serverDate.date);
        m.subtract(1, 'days');
        return m.format('DD.MM.YYYY');
    }

    this.nextDate = function() {
        self.serverDate.date.add(1, 'days'); 
        console.log('[' + colors.cyan('DateControl') + '] ' + 'Adjusted date to ' + colors.bold(self.getDateFormatted()));
        //end nextDate
    }

    

    this.classes = {
        Clients: null,
        Client: null
    };

    this.vars = {
        clients: null
    };

    //Settings
    this.settings = {
        sums: {
            min: 500,
            max: 25000
        }
    };

    //end Config 
}