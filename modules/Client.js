var uuid = require('uuid');
var Faker = require('Faker2');

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

    this.finance.budgets = {};


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


    //--- RUN INIT LOGIC ---
    self.createSavingsAccounts();    

    //end Client 
}