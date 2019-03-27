export function convertAccount (json) {
  if (json.cards && json.cards.length > 0 &&
    json.cardAccounts && json.cardAccounts.length > 0) { // only loading card accounts
    const account = {
      id: json.accountId,
      type: 'card',
      title: json.description,
      instrument: json.cards[0].cardCurr,
      balance: Number.parseFloat(json.debtPayment !== null ? -json.debtPayment : json.avlBalance),
      syncID: [],
      productType: json.productType,
      creditLimit: Number.parseFloat(json.over !== null ? json.over : 0)
    }

    json.cardAccounts.forEach(function (el) {
      account.syncID.push(el.accountId)
      if (json.isOverdraft === true) {
        account.syncID.push(el.accountId + 'M')
      }
    })
    json.cards.forEach(function (el) {
      account.syncID.push(el.pan.slice(-4))
    })

    if (json.avlLimit) {
      account.creditLimit = Number.parseFloat(json.avlLimit)
    }

    if (!account.title) {
      account.title = '*' + account.syncID[0]
    }

    return account
  } else {
    return null
  }
}

export function convertTransaction (json, accounts) {
  const account = accounts.find(account => {
    return account.syncID.indexOf(json.accountId) !== -1
  })

  const transAmount = Number.parseFloat(json.transAmount)

  const transaction = {
    hold: json.status !== 'T',
    income: json.debitFlag === '1' ? transAmount : 0,
    incomeAccount: account.id,
    outcome: json.debitFlag === '0' ? transAmount : 0,
    outcomeAccount: account.id,
    date: getDate(json.transDate),
    payee: json.place
  }

  if (account.instrument !== json.curr) {
    const amount = Number.parseFloat(json.amount)

    if (json.debitFlag === '1') {
      transaction.opIncome = amount
      transaction.opIncomeInstrument = json.curr
    } else {
      transaction.opOutcome = amount
      transaction.opOutcomeInstrument = json.curr
    }
  }

  return transaction
}

function getDate (str) {
  const [year, month, day, hour, minute, second] = str.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/).slice(1)
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}+03:00`)
}
