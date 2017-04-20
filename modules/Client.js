var uuid = require('uuid');
var Faker = require('faker2');
var moment = require('moment');
var colors = require('colors');

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
        savings: [],
        savings_activeAccount: 'Sparekonto' //Sparekonto is the default savings accounts.
    };

    //Transactions
    this.finance.transactions = {}; 

    //Budgets
    this.finance.budgets = {
        daily: 0
    };

    //EVENTS
    this.finance.events = [];

    // --- FUNCTIONS --- 
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

    //Motherfucking daily budget MASTER alien calculation algorithm 
    this.calculateEventSavings = function() {

        //(╯°□°）╯︵ ┻━┻ LETS GOOOOOO

        //Figure out which sums are needed by which date, start at the first upcoming event and process further.
        
        //DATA PREPARATION
        //Sort the events in the correct date. (Closest first)
        var sortedEventsArr = []; 

        sortedEventsArr = JSON.parse(JSON.stringify(self.finance.events));
        
        sortedEventsArr.sort(function(a, b){
            return a.date > b.date; //Moments can be subtracted(?)
        });


        /*

        ## ALGORITHM DESCRIPTION ##  //Alcohol level 10%

        - Let's talk about *Money in pool* (MIP) -
         How is it calculated?
         It is calculated based on the DB (Daily budget)
         DB is calculated on `money in account` divided on days left in month.

         DB = moneyInAcount / daysLeftInMonth

        - How does events use MIP? -

        Events will subtract their DAILY REQUIREMENT UNTIL EVENT (DR) from the MIP.
        E.g.
            before any events. DB: 500
                event 1: (50)  DB: 450
                event 2: (200) DB: 250
                event 3: (300) DB: -50 (CANT AFFORD - WARN)
    
        - What does this mean? - 
        Available sums are always taken from the daily budget. 
        If the user uses more than the daily budget the saving goals will just be expanded further.
        Calculations of daily budgets and saving goals are done continiously whenver the user is executing transactions.
        
        - And what the hell does that mean? xddddd xD :P also: fml a little -  //Alcohol level 40%
        This means that budgets are eXtReMeLy variating, at least in this version of the algorithm :P xD ^^
        But this might be a good thing, because the app is supposed to be extremely easy to use.
        */

        var a = moment().endOf('month');
        var b = moment().today;
        var days = a.diff(b, 'days');

        //CALCULATE DB
        //We've got what we need to calculate the DB
        var moneyInAcount = Number('' + self.finance.accounts.default + '');
        var daysLeftInMonth = days;
        var dailyBudget = Math.floor(moneyInAcount / daysLeftInMonth); //Floor the value because we don't want to overshoot 

        //Apply <krykker> here 


        var moneyInPool = dailyBudget; 
        console.log('Money before delegation: (DB) ' + moneyInPool);

        //CALCULATION START 
        for (var i = 0; i < sortedEventsArr.length; i++) {

            var event = sortedEventsArr[i];
            
            event.date = moment(event.date);

            //Calculate timespan (event_time - NOW )
            var a = event.date;
            var b = moment().today;
            var days = a.diff(b, 'days');

            var eventMoneyRequired = Number(event.sum);

            //We got the diff in days, calculate the buget per day
            
            if (days == 0) {
                //The event is today... we cant save money for today.
                event.impossible = true;
                event.impossibleReason = 'event_is_today';
                continue;
            }

            var dailyBudgetForEvent = (Math.ceil(eventMoneyRequired / days));

            //Calculate the sums 
            if (moneyInPool - dailyBudgetForEvent < 0) {
                console.log(colors.yellow(colors.bold('WARNING')) + ' - BUDGET OUT OF REACH!!!!');
            }

            moneyInPool -= dailyBudgetForEvent; //Subtract the money in pool 

            console.log('' +
                'Event ' + event.uuid +
                ' - days until event: ' + days +
                ' - daily budget: ' + dailyBudgetForEvent + 
                ' - pool rest: ' + moneyInPool);

            //end sortedEventsArr loop 
        }
        

        //end calculateEventSavings
    }

    this.moveSavingFunds = function() {
        //To be called after calculateEventSavings 

        //end moveSavingFunds
    }

    this.createTransaction = function() {
        
        var d = moment().format('DD.MM.YYYY');

        if (self.finance.transactions[d] == undefined) {

            //Date has changed. Perform saving actions. 
            

            self.finance.transactions[d] = {
                sum: 0,
                transactions: []
            };
        }

        //end createTransaction
    }

    this.prepareDate = function() {

        console.log('prepareDate for client');
        self.createTransaction();

        //end prepareDate
    }

    //--- Events --- 
    this.createEvent = function(title, desc, sum, date) {

        //Date is in format dd.mm.yy
        var m = moment(moment(date, "DD.MM.YYYY"));

        var event = {
            uuid: uuid.v4(),
            title: title,
            description: desc,
            sum: sum,
            date: m,
            date_human: date 
        };

        self.finance.events.push(event);

        //end createEvent 
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
