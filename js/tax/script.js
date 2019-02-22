'use strict';

var data = {
    dayRate: 600,
    dayExpense: 16,
    monthExpense: 175,
    weeksWorked: 48,
    year: "1819",
//    dividends: 10000,
    salary: 8424,
    scale: 1
};

var taxValues = {
    vat: 0.2,
    corpTax: 0.19
};

const TAX = {
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
        rate_0: {
            start: 0,
            end: 11850,
            rate: 0,
        },
        rate_20: {
            start: 11851,
            end: 46350,
            rate: 0.20,
        },
        rate_40: {
            start: 46351,
            end: 150000,
            rate: 0.40,
        },
        rate_45: {
            start: 150001,
            end: -1,
            rate: 0.45,
        }
    },
    dividend: {
        allowance: 2000,
        rate_075: 0.075,
        rate_325: 0.325,
        rate_381: 0.381
    },
    natInsurance: {
        pensionAge: 65,
        rate_0: {
            start: 0,
            end: 162 * 52,
            rate: 0,
        },
        rate_12: {
            start: 162 * 52,
            end: 892 * 52,
            rate: 0.12,
        },
        rate_2: {
            start: 892 * 52,
            end: -1,
            rate: 0.02,
        },
        rate_employer: {
            start: 162.00 * 52,
            end: -1,
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
    data: data,
    computed: {
        yearlyExpense: function () {
            return (this.dayExpense * this.weeksWorked * 5) + (this.monthExpense * 12) + this.salary;
        },
        yearlyIncome: function () {
            return this.weeksWorked * this.dayRate * 5
        },
        perYear: function () {
            return this.yearlyIncome;
        },
        perYearNet: function () {
            return (this.yearlyIncome - this.yearlyExpense) * (1 - taxValues.corpTax);
        },
        salaryTax: function () {
            return calcIncomeTax(this.salary);
        },
        employerNI: function () {
            return calcEmployerNI(this.salary);
        },
        salaryNI: function () {
            return calcSalaryNI(this.salary);
        },
        studentLoanContribution: function () {
            return calcStudentLoanRepayment(this.salary , 1);
        },
        salaryAfterTax: function () {
            return this.salary - calcIncomeTax(this.salary) - calcSalaryNI(this.salary);
        },
        dividends: function () {
            return this.perYearNet;
        },
        dividendsTax: function () {
            return calcDividendsTax(this.salary, this.dividends);
        },
        dividendsTaxed: function () {
            return this.dividends - this.dividendsTax;
        },
        incomeBeforeTax: function () {
            return this.dividends + this.salary;
        },
        incomeAfterTax: function () {
            return this.dividendsTaxed + this.salaryAfterTax;
        }
    },
    methods: {
        //https://blog.tompawlak.org/number-currency-formatting-javascript
        numFormat: function (e) {
            return e.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
        }
    }
});

function calcIncomeTax(salary) {
    let taxOnSalary = 0;
    const tax = TAX.income;
    if (salary > tax.rate_45.start) {
        taxOnSalary += (salary - tax.rate_45.start) * tax.rate_45.rate;
        taxOnSalary += (tax.rate_40.end - tax.rate_40.start) * tax.rate_40.rate;
        taxOnSalary += (tax.rate_20.end - tax.rate_20.start) * tax.rate_20.rate;

    } else if (salary > tax.rate_40.start) {
        taxOnSalary += (salary - tax.rate_40.start) * tax.rate_40.rate;
        taxOnSalary += (tax.rate_20.end - tax.rate_20.start) * tax.rate_20.rate;

    } else if (salary > tax.rate_20.start) {
        taxOnSalary += (salary - tax.rate_20.start) * tax.rate_20.rate;
    }
    return roundCurrency(taxOnSalary);
}

function calcDividendsTax(salary, dividends) {
    let tax = 0;
    const income = salary + dividends;
    let iTax = TAX.income;
    let dTax = TAX.dividend;

    dividends = dividends - dTax.allowance;
    if ((salary) < iTax.rate_20.start) {
        if (income > iTax.rate_45.start) {
            tax += (dividends - (iTax.rate_45.start - salary)) * dTax.rate_381;
            tax += ((iTax.rate_45.start - iTax.rate_40.start) - salary) * dTax.rate_325;
            tax += ((iTax.rate_40.start - iTax.rate_20.start) - salary) * dTax.rate_075;
        } else if (income > iTax.rate_40.start) {
            tax += (dividends - (iTax.rate_40.start - salary)) * dTax.rate_325;
            tax += ((iTax.rate_40.start - iTax.rate_20.start) - salary) * dTax.rate_075;
        } else if (income > iTax.rate_20.start) {
            tax += (dividends - (iTax.rate_20.start - salary)) * dTax.rate_075;
        }
    } else {
        if (income > iTax.rate_45.start) {
            tax += (dividends - (iTax.rate_45.start - salary)) * dTax.rate_381;
            tax += ((iTax.rate_45.start - iTax.rate_40.start) - salary) * dTax.rate_325;
            tax += ((iTax.rate_40.start - iTax.rate_20.start) - salary) * dTax.rate_075;
        } else if (income > iTax.rate_40.start) {
            tax += (dividends - (iTax.rate_40.start - salary)) * dTax.rate_325;
            tax += ((iTax.rate_40.start - iTax.rate_20.start) - salary) * dTax.rate_075;
        } else if (income > iTax.rate_20.start) {
            tax += (dividends - (iTax.rate_20.start - salary)) * dTax.rate_075;
        }
    }
    return roundCurrency(tax);
}

function roundCurrency(x) {
    return Math.round(x * 100) / 100;
}

function calcSalaryNI(salary) {
    let natInsurance = 0;
    const ni = TAX.natInsurance;
    const weeklyRate = salary;
    if (weeklyRate > ni.rate_12.end) {
        natInsurance += (weeklyRate - ni.rate_12.end) * ni.rate_2.rate;
        natInsurance += (ni.rate_12.end - ni.rate_0.end) * ni.rate_12.rate;
    } else if (weeklyRate > ni.rate_0.end) {
        natInsurance += (weeklyRate - ni.rate_0.end) * ni.rate_12.rate;
    }
    return roundCurrency(natInsurance);
}

function calcEmployerNI(salary) {
    let natInsurance = 0;
    if (salary > TAX.natInsurance.rate_employer.start) {
        natInsurance += (salary - TAX.natInsurance.rate_employer.start) * TAX.natInsurance.rate_employer.rate;
    }
    return roundCurrency(natInsurance);
}

function calcStudentLoanRepayment(salary, plan) {
    let studentLoan = 0;
    if (plan === 1 && salary > TAX.studentLoan.plan_1.threshold) {
        studentLoan += (salary - TAX.studentLoan.plan_1.threshold) * TAX.studentLoan.plan_1.rate;
    } else if (plan === 2 && salary > TAX.studentLoan.plan_2.threshold) {
        studentLoan += (salary - TAX.studentLoan.plan_2.threshold) * TAX.studentLoan.plan_2.rate;
    }
    return roundCurrency(studentLoan);
}


for (const [k, v] of Object.entries({
    1: {salary: 5000, ni: 0, incomeTax: 0},
    2: {salary: 8424, ni: 0, incomeTax: 0},
    3: {salary: 15000, ni: 789.12, incomeTax: 628.20},
    4: {salary: 46350, ni: 4551.12, incomeTax: 6898.20},
    5: {salary: 150000, ni: 6624.12, incomeTax: 53100},
})) {
    const actualNi = calcSalaryNI(v.salary);
    test(actualNi === v.ni, "NI calculation - v.salary=" + v.salary + ", expected=" + v.ni + ", actual=" + actualNi);

    const actualIncomeTax = calcIncomeTax(v.salary);
    test(actualIncomeTax === v.incomeTax, "incomeTax calculation - v.salary=" + v.salary + ", expected=" + v.incomeTax + ", actual=" + actualIncomeTax);
}

// 15_000
// your Income Tax is	£628.20
// your National Insurance is	£789.12
// in total you pay	£1,417.32

//46350
// \Your estimated take-home pay for 2018 to 2019 is
//
// £34,900.68 a year
//
// Based on the information you’ve given us:
//
// your Income Tax is	£6,898.20
// your National Insurance is	£4,551.12
// in total you pay	£11,449.32

// 150_000
// Your estimated take-home pay for 2018 to 2019 is
//
// £90,275.88 a year
//
// Based on the information you’ve given us:
//
//     your Income Tax is	£53,100
// your National Insurance is	£6,624.12
// in total you pay	£59,724.12

// for sync tests
function test(condition, message) {
    try {
        console.assert.apply(console, arguments);
        if (typeof message === 'string' && condition) {
            console.log('\u2714 ' + message);
        }
    } catch (error) {
        test.exitCode = 1;
        console.error('\u2716 ' + error);
    }
}

// for async tests
test.async = function (fn, timeout) {
    var timer = setTimeout(
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