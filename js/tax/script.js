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
        basic: 11850.00,
        age_65_74: 11850.00,
        age_75_over: 11850.00,
        blind: 2320.00,
        thresholds: {
            age: 27700.00,
            taper: 100000.00
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
        allowance: 2000,
        rate_075: 0.075,
        rate_325: 0.325,
        rate_381: 0.381
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
            return calcStudentLoanRepayment(this.salary , 1);
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

function calcSalaryTax(salary) {
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
    return taxOnSalary;
}

console.info("salary for 30k: " + calcSalaryTax(30000, 0));
console.info("salary for 30k: " + calcSalaryTax(300000, 0) + " should be 120,600.00");

function calcDividendsTax(salary, dividends) {
    var tax = 0;
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

    return tax;
}

function calcSalaryNI(salary) {
    var natInsurance = 0;
    const ni = TAX.natInsurance;
    if (salary / 52 > ni.rate_2.start) {
        natInsurance += (salary / 52 - ni.rate_2.start) * ni.rate_2.rate;
        natInsurance += (ni.rate_12.end - ni.rate_12.start) * ni.rate_12.rate;
    } else if (salary / 52 > ni.rate_12.start) {
        natInsurance += (salary / 52 - ni.rate_12.start) * ni.rate_12.rate;
    }
    return natInsurance * 52;
}

function calcEmployerNI(salary) {
    var natInsurance = 0;
    if (salary > TAX.natInsurance.rate_employer.start) {
        natInsurance += (salary / 52 - TAX.natInsurance.rate_employer.start) * TAX.natInsurance.rate_employer.rate;
    }
    return natInsurance * 52;
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
