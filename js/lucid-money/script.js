'use strict';

const defaultDayRate = 300;
const defaultSalary = 8632;

let formData = {
    dayRate: defaultDayRate,
    dayExpense: 10,
    monthExpense: 175,
    yearExpense: 0,
    weeksWorked: 48,
    year: "1920",
//    dividends: 10000,
    salary: defaultSalary,
    scale: 1,
    options: [
        {text: 'Yearly', value: '1'},
        {text: 'Monthly', value: '12'},
        {text: 'Weekly', value: '52'},
        {text: 'Daily', value: '365'}
    ],
    chartData: [],
    chartDataTemp: [],
};

const taxValues = {
    vat: 0.2,
    corpTax: 0.19
};

const TAX = {
    year: '2019/20',
    allowance: {
        basic: 12500,
        age_65_74: 12500,
        age_75_over: 12500,
        blind: 2320,
        thresholds: {
            age: 27700,
            taper: 100000
        }
    },
    income: {
        basic: {
            till: 37500,
            rate: 0.20,
        },
        higher: {
            till: 150000,
            rate: 0.40,
        },
        additional: {
            start: 150000,
            till: -1,
            rate: 0.45,
        }
    },
    dividend: {
        allowance: 2000,
        basic: 0.075,
        higher: 0.325,
        additional: 0.381
    },
    natInsurance: {
        pensionAge: 65,
        rate_0: {
            start: 0,
            till: 8632,
            rate: 0,
        },
        rate_12: {
            start: 8632,
            till: 50000,
            rate: 0.12,
        },
        rate_2: {
            start: 50000,
            till: -1,
            rate: 0.02,
        },
        rate_employer: {
            start: 166.00 * 52,
            till: -1,
            rate: 0.138,
        }
    },
    studentLoan: {
        plan_1: {
            threshold: 18330,
            rate: 0.09,
        },
        plan_2: {
            threshold: 25000,
            rate: 0.09,
        }
    }
};

const TAX_1819 = {
    year: '2018/19',
    allowance: {
        basic: 11850,
        age_65_74: 11850,
        age_75_over: 11850,
        blind: 2320,
        thresholds: {
            age: 27700,
            taper: 100000
        }
    },
    income: {
        basic: {
            till: 34500,
            rate: 0.20,
        },
        higher: {
            till: 150000,
            rate: 0.40,
        },
        additional: {
            start: 150000,
            till: -1,
            rate: 0.45,
        }
    },
    dividend: {
        allowance: 2000,
        basic: 0.075,
        higher: 0.325,
        additional: 0.381
    },
    natInsurance: {
        pensionAge: 65,
        rate_0: {
            start: 0,
            till: 162 * 52,
            rate: 0,
        },
        rate_12: {
            start: 162 * 52,
            till: 892 * 52,
            rate: 0.12,
        },
        rate_2: {
            start: 892 * 52,
            till: -1,
            rate: 0.02,
        },
        rate_employer: {
            start: 162.00 * 52,
            till: -1,
            rate: 0.138,
        }
    },
    studentLoan: {
        plan_1: {
            threshold: 18330,
            rate: 0.09,
        },
        plan_2: {
            threshold: 25000,
            rate: 0.09,
        }
    }
};

const calculator = new Vue({
    el: '#calculator',
    data: formData,
    mounted() {
        if (localStorage.getItem('dayRate')) {
            this.dayRate = localStorage.getItem('dayRate');
        }
        setInterval(() => {
            this.refreshChart();
        }, 50);
    },
    computed: {
        yearlyExpense: function () {
            return (this.dayExpense * this.weeksWorked * 5) + (this.monthExpense * 12) + this.yearExpense;
        },
        weeklyExpense: function () {
            return this.yearlyExpense / 52;
        },
        yearlyIncome: function () {
            return this.weeksWorked * this.dayRate * 5
        },
        perYear: function () {
            return this.yearlyIncome;
        },
        dailyIncome: function () {
            return roundCurrency(this.salary / 365);
        },
        weeklyIncome: function () {
            return roundCurrency(this.salary / 52);
        },
        monthlyIncome: function () {
            return roundCurrency(this.salary / 12);
        }
    },
    methods: {
        //https://blog.tompawlak.org/number-currency-formatting-javascript
        numFormat: function (e) {
            return e.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
        },
        resetDayRate() {
            localStorage.removeItem('dayRate');
            this.dayRate = defaultDayRate
        },
        saveDayRate() {
            localStorage.setItem('dayRate', this.dayRate);
        },
        resetSalary() {
            localStorage.removeItem('salary');
            this.salary = defaultSalary
        },
        refreshChart() {
            this.chartDataTemp = [
                this.monthlyIncome * 1,
                this.monthlyIncome * 2,
                this.monthlyIncome * 3,
                this.monthlyIncome * 4,
                this.monthlyIncome * 5,
                this.monthlyIncome * 6,
                this.monthlyIncome * 7,
                this.monthlyIncome * 8,
                this.monthlyIncome * 9,
                this.monthlyIncome * 10,
                this.monthlyIncome * 11,
                this.monthlyIncome * 12
            ];
            this.chartDataTemp2 = [
                this.weeklyExpense *52/12 * 1,
                this.weeklyExpense *52/12 * 2,
                this.weeklyExpense *52/12 * 3,
                this.weeklyExpense *52/12 * 4,
                this.weeklyExpense *52/12 * 5,
                this.weeklyExpense *52/12 * 6,
                this.weeklyExpense *52/12 * 7,
                this.weeklyExpense *52/12 * 8,
                this.weeklyExpense *52/12 * 9,
                this.weeklyExpense *52/12 * 10,
                this.weeklyExpense *52/12 * 11,
                this.weeklyExpense *52/12 * 12
            ];
            if (JSON.stringify(this.chartData) !== JSON.stringify(this.chartDataTemp) || JSON.stringify(this.chartData2) !== JSON.stringify(this.chartDataTemp2)) {
                this.chartData = this.chartDataTemp;
                this.chartData2 = this.chartDataTemp2;
                const ctx = document.getElementById('myChart');
                if (this.chart != null) {
                    this.chart.destroy();
                }
                this.chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: [
                            'January', 'February', 'March', 'April', 'May', 'June',"July", "August", "September", "November", "December"
                        ],
                        datasets: [
                            {
                                label: 'Income',
                                data: this.chartData,
                                backgroundColor: [
                                    'rgba(42,255,35,0.2)'
                                ],
                                borderColor: [
                                    'rgb(42,255,35)'
                                ],
                            },
                            {
                                label: 'Expenses',
                                data: this.chartData2,
                                backgroundColor: [
                                    'rgba(255,58,95, 0.2)',
                                ],
                                borderColor: [
                                    'rgb(255,58,95)',
                                ],
                                borderWidth: 1
                            }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                },
                                stacks: true
                            }]
                        },
                        animation: {
                            animate: false
                        }
                    }
                });
            }
        }
    }
});

function roundCurrency(x) {
    return Math.round(x * 100) / 100;
}

// for (const [k, v] of Object.entries({
//     '01': {salary: 5000, ni: 0, incomeTax: 0, employerNi: 0, dividend: 0, dividendTax: 0},
//     '02': {salary: 8424, ni: 0, incomeTax: 0, employerNi: 0, dividend: 0, dividendTax: 0},
//     '03': {salary: 15000, ni: 789.12, incomeTax: 630, employerNi: 907.49, dividend: 0, dividendTax: 0},
//     '04': {salary: 46350, ni: 4551.12, incomeTax: 6900, employerNi: 5233.79, dividend: 0, dividendTax: 0},
//     '05': {salary: 80000, ni: 5227.52, incomeTax: 20360, employerNi: 9877.49, dividend: 0, dividendTax: 0},
//     '06': {salary: 150000, ni: 6627.52, incomeTax: 53100, employerNi: 19537.49, dividend: 0, dividendTax: 0},
//     '07': {salary: 200000, ni: 7627.52, incomeTax: 75600, employerNi: 26437.49, dividend: 0, dividendTax: 0},
//
//     '11': {salary: 1000, ni: 0, incomeTax: 0, employerNi: 0, dividend: 2000, dividendTax: 0},
//     '14': {salary: 46350, ni: 4551.12, incomeTax: 6900, employerNi: 5233.79, dividend: 2000, dividendTax: 0},
//     '17': {salary: 200000, ni: 7627.52, incomeTax: 75600, employerNi: 26437.49, dividend: 2000, dividendTax: 0},
//
//     '21': {salary: 0, ni: 0, incomeTax: 0, employerNi: 0, dividend: 5000, dividendTax: 0},
//     '22': {salary: 0, ni: 0, incomeTax: 0, employerNi: 0, dividend: 10000, dividendTax: 0},
//     '23': {salary: 0, ni: 0, incomeTax: 0, employerNi: 0, dividend: 30000, dividendTax: 1211},
//     '24': {salary: 0, ni: 0, incomeTax: 0, employerNi: 0, dividend: 50000, dividendTax: 3624},
//     '25': {salary: 0, ni: 0, incomeTax: 0, employerNi: 0, dividend: 100000, dividendTax: 19874},
//     '26': {salary: 0, ni: 0, incomeTax: 0, employerNi: 0, dividend: 200000, dividendTax: 59025},
//
//     '31': {salary: 5000, ni: 0, incomeTax: 0, employerNi: 0, dividend: 10000, dividendTax: 86},
//     '32': {salary: 5000, ni: 0, incomeTax: 0, employerNi: 0, dividend: 30000, dividendTax: 1586},
//     '33': {salary: 8424, ni: 0, incomeTax: 0, employerNi: 0, dividend: 30000, dividendTax: 1843},
//     '34': {salary: 8424, ni: 0, incomeTax: 0, employerNi: 0, dividend: 100000, dividendTax: 23922},
//     '35': {salary: 8424, ni: 0, incomeTax: 0, employerNi: 0, dividend: 200000, dividendTax: 61603},
//
//     '36': {salary: 15000, ni: 789.12, incomeTax: 630, employerNi: 907.49, dividend: 50000, dividendTax: 8263},
//     '44': {salary: 46350, ni: 4551.12, incomeTax: 6900, employerNi: 5233.79, dividend: 50000, dividendTax: 15600},
//     '45': {salary: 80000, ni: 5227.52, incomeTax: 20360, employerNi: 9877.49, dividend: 50000, dividendTax: 15600},
//     '46': {salary: 150000, ni: 6627.52, incomeTax: 53100, employerNi: 19537.49, dividend: 50000, dividendTax: 19050},
//     '47': {salary: 200000, ni: 7627.52, incomeTax: 75600, employerNi: 26437.49, dividend: 50000, dividendTax: 38100},
// })) {
//     const actualNi = calcSalaryNI(v.salary);
//     test(actualNi === v.ni,
//         "TEST id=" + k + " - NI formula          - salary=" + v.salary + ", expected=" + v.ni + ", actual=" + actualNi);
//
//     const actualIncomeTax = calcIncomeTax(v.salary, v.dividend);
//     test(actualIncomeTax.totalTax === v.incomeTax,
//         "TEST id=" + k + " - incomeTax formula   - salary=" + v.salary + ", dividend=" + v.dividend + ", expected=" + v.incomeTax + ", actual=" + actualIncomeTax.totalTax +
//         ', FullResponse=' + JSON.stringify(actualIncomeTax));
//
//     const employerNi = calcEmployerNI(v.salary);
//     test(employerNi === v.employerNi,
//         "TEST id=" + k + " - employerNi formula  - salary=" + v.salary + ", expected=" + v.employerNi + ", actual=" + employerNi);
//
//     const dividendTax = calcSalaryAndDividendsTax(v.salary, v.dividend);
//     test(dividendTax.totalTax === v.dividendTax,
//         "TEST id=" + k + " - dividendTax formula - salary=" + v.salary + ", dividend=" + v.dividend + ", expected=" + v.dividendTax + ", actual=" + dividendTax.totalTax +
//         ', FullResponse=' + JSON.stringify(dividendTax));
// }

// for sync tests
function test(condition, message) {
    try {
        console.assert.apply(console, arguments);
        if (typeof message === 'string' && condition) {
            // console.log('\u2714 ' + message);
        }
    } catch (error) {
        test.exitCode = 1;
        console.error('\u2716 ' + error);
    }
}

// for async tests
test.async = function (fn, timeout) {
    let timer = setTimeout(
        function () {
            test(false, 'timeout ' + fn);
        },
        timeout || test.timeout
    );
    fn(function () {
        clearTimeout(timer);
    });
};

// default timeout
test.timeout = 10000;

// for node env only
try {
    process.on('exit', function () {
        process.exit(test.exitCode || 0);
    });
    module.exports = test;
} catch (browser) {
}
