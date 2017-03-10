var uuid = require('uuid');
var Faker = require('faker2');
var moment = require('moment');

module.exports = function(config){

    var self = this; 

    //Client identification
    this.uuid = uuid.v4();

    //Client properties -- user details  
    this.name_first = Faker.Name.firstName();
    this.name_last = Faker.Name.lastName();
    this.email = Faker.Internet.email();

    //Client properties -- financials 
    this.finance = {};
    this.finance.accounts = {
        default: Math.floor((Math.random() * config.settings.sums.max) + config.settings.sums.min),
        savings: []
    };

    //Transactions
    this.finance.transactions = {}; 

    //Budgets
    this.finance.budgets = {
        daily: 0
    };


    this.createSavingsAccounts = function() {

        var userSavingsAccounts = {}; 

        var defaultSavingsAccounts = [{
            name: 'Sparekonto',
            min: 0,
            max: 50000,
            goal_min: 40000,
            goal_max: 60000
        },{
            name: 'Superspar',
            min: 0,
            max: 10000,
            goal_min: 8000,
            goal_max: 12000
        }];
        var alternativeSavingsAccount = [{
            name: 'Ferie',
            min: 0,
            max: 50000,
            goal_min: 35000,
            goal_max: 80000
        }, {
            name: 'Husleie',
            min: 15000,
            max: 80000,
            goal_min: 10000,
            goal_max: 120000
        }];

        //Add default  saving accounts
        for (var i = 0; i < defaultSavingsAccounts.length; i++) {
            var account = defaultSavingsAccounts[i];
            userSavingsAccounts[account.name] = {
                balance: Math.floor((Math.random() * account.max) + account.min),
                goal: Math.floor((Math.random() * account.goal_max) + account.goal_min),
            };
        }

        //Add alternative saving accounts
        for (var i = 0; i < alternativeSavingsAccount.length; i++) {
            if (Math.floor((Math.random() * 10) + 1) > 5) continue; //50% chance
            var account = alternativeSavingsAccount[i];
            userSavingsAccounts[account.name] = {
                balance: Math.floor((Math.random() * account.max) + account.min),
                goal: Math.floor((Math.random() * account.goal_max) + account.goal_min),
            };
        }
    
        self.finance.accounts.savings = userSavingsAccounts;

        //end createSavingsAccounts
    }

    this.createDailyBudget = function() {

        var a = moment().endOf('month');
        var b = moment().today;
        var days = a.diff(b, 'days');

        self.finance.budgets.daily = Math.floor(self.finance.accounts.default / days);

        //end createDailyBudget
    }

    this.createTransaction = function() {
        
        var d = moment().format('DD.MM.YYYY');

        if (self.finance.transactions[d] == undefined) {
            self.finance.transactions[d] = {
                sum: 0,
                transactions: []
            };
        }

    }

    this.prepareDate = function() {

        console.log('prepareDate for client');
        self.createTransaction();

        //end prepareDate
    }


    this.test = function() {
        console.log(self.uuid + ' -  test');
    }


    //--- RUN INIT LOGIC ---
    self.createSavingsAccounts();    
    self.createDailyBudget();
    self.createTransaction();

    //end Client 
}
