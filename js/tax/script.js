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
        basic: 11500.00,
        age_65_74: 11500.00,
        age_75_over: 11500.00,
        blind: 2320.00,
        thresholds: {
            age: 27700.00,
            taper: 100000.00,
        }
    },
    income: {
        rate_0: {
            start: 0.00,
            end: 11850.00,
            rate: 0.00,
        },
        rate_20: {
            start: 11850.00,
            end: 46350.00,
            rate: 0.20,
        },
        rate_40: {
            start: 46350.00,
            end: 150000.00,
            rate: 0.40,
        },
        rate_45: {
            start: 150000,
            end: -1,
            rate: 0.45,
        }
    },
    dividend: {
        rate_0: {
            start: 0.00,
            end: 2000.00,
            rate: 0.00,
        },
        rate_075: {
            start: 11850.00,
            end: 46350.00,
            rate: 0.075,
        },
        rate_325: {
            start: 46350.00,
            end: 150000,
            rate: 0.325,
        },
        rate_381: {
            start: 150000.00,
            end: -1,
            rate: 0.381,
        }
    },
    natInsurance: {
        pensionAge: 65,
        rate_0: {
            start: 0.00,
            end: 162.00,
            rate: 0.00,
        },
        rate_12: {
            start: 162.01,
            end: 892.00,
            rate: 0.12,
        },
        rate_2: {
            start: 892.00,
            end: -1,
            rate: 0.02,
        },
        rate_employer: {
            start: 162.01,
            end: -1,
            rate: 0.138,
        }
    },
    studentLoan: {
        plan_1: {
            threshold: 18330.00,
            rate: 0.09,
        },
        plan_2: {
            threshold: 25000.00,
            rate: 0.09,
        }
    }
};

var calculator = new Vue({
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
            return calcSalaryTax(this.salary);
        },
        employerNI: function () {
            return calcEmployerNI(this.salary);
        },
        salaryNI: function () {
            return calcSalaryNI(this.salary);
        },
        studentLoanContribution: function () {
            return calcStudentLoanRepayment(this.salary);
        },
        salaryAfterTax: function () {
            return this.salary - calcSalaryTax(this.salary) - calcSalaryNI(this.salary);
        },
        dividends: function () {
            return this.perYearNet;
        },
        dividendsTax: function () {
            return calcDividendsTax(this.salary, this.dividends);
        },
        dividendsTaxed: function () {
            return this.dividends - this.dividendsTax;
        }
    },
    methods: {
        //https://blog.tompawlak.org/number-currency-formatting-javascript
        numFormat: function (e) {
            return e.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
        }
    }
});

function calcSalaryTax(salary, dividends) {
    var taxOnSalary = 0;
    const tax = TAX.income;
    const income = salary + dividends;
    if (income > tax.rate_45.start) {
        taxOnSalary += (salary - tax.rate_45.start) * tax.rate_45.rate;
        taxOnSalary += (tax.rate_40.end - tax.rate_40.start) * tax.rate_40.rate;
        taxOnSalary += (tax.rate_20.end - tax.rate_20.start) * tax.rate_20.rate;
    } else if (income > tax.rate_40.start) {
        taxOnSalary += (salary - tax.rate_40.start) * tax.rate_40.rate;
        taxOnSalary += (tax.rate_20.end - tax.rate_20.start) * tax.rate_20.rate;
    } else if (income > tax.rate_20.start) {
        taxOnSalary += (salary - tax.rate_20.start) * tax.rate_20.rate;
    }
    return taxOnSalary;
}

function calcDividendsTax(salary, dividends) {
    var dividendsTax = 0;
    const income = salary + dividends;
    if (income > TAX.income.rate_40.start) {
        dividendsTax += (dividends - TAX.dividend.rate_0.start) * TAX.income.rate_45.rate;
        dividendsTax += (TAX.income.rate_40.end - TAX.income.rate_40.start) * TAX.income.rate_40.rate;
        dividendsTax += (TAX.income.rate_20.end - TAX.income.rate_20.start) * TAX.income.rate_20.rate;
    } else if (income > TAX.income.rate_40.start) {
        dividendsTax += (dividends - TAX.income.rate_40.start) * TAX.income.rate_40.rate;
        dividendsTax += (TAX.income.rate_20.end - TAX.income.rate_20.start) * TAX.income.rate_20.rate;
    } else if (income > TAX.income.rate_20.start) {
        dividendsTax += (dividends - TAX.income.rate_20.start) * TAX.income.rate_20.rate;
    }
    return dividendsTax;
}

function calcSalaryNI(salary) {
    var natInsurance = 0;
    if (salary > TAX.natInsurance.rate_2.start) {
        natInsurance += (salary - TAX.natInsurance.rate_2.start) * TAX.natInsurance.rate_2.rate;
        natInsurance += (TAX.natInsurance.rate_12.end - TAX.natInsurance.rate_12.start) * TAX.natInsurance.rate_12.rate;
    } else if (salary > TAX.natInsurance.rate_12.start) {
        natInsurance += (salary - TAX.natInsurance.rate_12.start) * TAX.natInsurance.rate_12.rate;
    }
    return natInsurance;
}

function calcEmployerNI(salary) {
    var natInsurance = 0;
    if (salary > TAX.natInsurance.rate_employer.start) {
        natInsurance += (salary - TAX.natInsurance.rate_employer.start) * TAX.natInsurance.rate_employer.rate;
    }
    return natInsurance;
}

function calcStudentLoanRepayment(salary, plan) {
    var studentLoan = 0;
    if (plan === 1 && salary > TAX.studentLoan.plan_1.threshold) {
        studentLoan += (salary - TAX.studentLoan.plan_1.threshold) * TAX.studentLoan.plan_1.rate;
    } else if (plan === 2 && salary > TAX.studentLoan.plan_2.threshold) {
        studentLoan += (salary - TAX.studentLoan.plan_2.threshold) * TAX.studentLoan.plan_2.rate;
    }
    return studentLoan;
}
