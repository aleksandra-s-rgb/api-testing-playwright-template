import { StatusCodes } from 'http-status-codes'
import { expect, test } from '@playwright/test'
import { AccountDTO } from '../../dto/AccountDTO'
import { DepositDTO } from '../../dto/DepositDTO'
import { TransferDTO } from '../../dto/TransferDTO'

const baseUrl = 'https://shop.tl-academy.ee'

const authHeader = {
  'X-API-KEY': 'my-api-key',
}

type createdAccountResp = {
  id: number
  owner: string
  currency: string
  balance: number
  createdAt: string
}

type createdAccountErrorResp = {
  error: string
}
test.describe('/api/accounts critical path', () => {
  test('TL-11-1 POST api/accounts with valid data without currency', async ({ request }) => {
    const account = new AccountDTO('Test Owner')
    const response = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: account,
    })

    const respBody: createdAccountResp = await response.json()
    console.log(account)
    console.log(respBody)
    expect(response.status()).not.toBe(StatusCodes.FORBIDDEN)
    expect(response.status()).toBe(StatusCodes.CREATED)
    expect(respBody.owner).toBe(account.owner)
  })

  const currencies = ['USD', 'EUR', 'GBP']

  test(`TL-11-3 POST api/accounts with valid data with all supported currencies: ${currencies}`, async ({
    request,
  }) => {
    for (const currency of currencies) {
      const account = new AccountDTO('Test Owner', currency)
      const response = await request.post(baseUrl + '/api/accounts', {
        headers: authHeader,
        data: account,
      })

      const respBody: createdAccountResp = await response.json()
      console.log(respBody)
      expect.soft(response.status(), `Tested ${currency} currency`).not.toBe(StatusCodes.FORBIDDEN)
      expect.soft(response.status(), `Tested ${currency} currency`).toBe(StatusCodes.CREATED)
      expect.soft(respBody.owner, `Tested ${currency} currency`).toBe(account.owner)
      expect.soft(respBody.currency, `Tested ${currency} currency`).toBe(account.currency)
    }
  })
})

test.describe('/api/accounts negative tests', () => {
  test('TL-11-2 POST api/accounts with invalid data', async ({ request }) => {
    const account = new AccountDTO('Test Owner', 'PLN')
    const response = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: account,
    })

    const respBody: createdAccountErrorResp = await response.json()
    console.log(respBody)
    expect.soft(response.status()).not.toBe(StatusCodes.FORBIDDEN)
    expect.soft(response.status()).toBe(StatusCodes.BAD_REQUEST)
    expect.soft(respBody.error).not.toBeUndefined()
    expect.soft(respBody.error.length).toBeGreaterThan(0)
  })
})

test.describe('GET /api/accounts', () => {
  test('TL-11-4 GET /api/accounts status code 200 OK', async ({ request }) => {
    const response = await request.get(baseUrl + '/api/accounts', {
      headers: authHeader,
    })
    const responseBody: createdAccountResp = await response.json()
    const statusCode = response.status()
    expect(statusCode).toBe(StatusCodes.OK)
    console.log(statusCode, responseBody)
  })
  test('TL-11-5 GET /api/accounts invalid X-API-KEY', async ({ request }) => {
    const invalidAuthHeader = {
      'X-API-KEY': 'wrong-api-key',
    }
    const response = await request.get(baseUrl + '/api/accounts', {
      headers: invalidAuthHeader,
    })
    const statusCode = response.status()
    expect(statusCode).toBe(StatusCodes.UNAUTHORIZED)
  })
  test('TL-11-6 GET /api/accounts missing X-API-KEY', async ({ request }) => {
    const invalidAuthHeader = {
      'X-API-KEY': '',
    }
    const response = await request.get(baseUrl + '/api/accounts', {
      headers: invalidAuthHeader,
    })
    const statusCode = response.status()
    const respBody: createdAccountErrorResp = await response.json()
    expect.soft(statusCode).toBe(StatusCodes.UNAUTHORIZED)
    console.log(respBody)
    expect.soft(respBody.error).not.toBeUndefined()
    expect.soft(respBody.error.length).toBeGreaterThan(0)
  })
})

test.describe('GET /api/accounts/{id}', () => {
  test('TL-11-7 GET /api/accounts/{id} status code 200 OK', async ({ request }) => {
    const response = await request.get(baseUrl + '/api/accounts/1', {
      headers: authHeader,
    })
    const responseBody: createdAccountResp = await response.json()
    const statusCode = response.status()
    expect.soft(statusCode).toBe(StatusCodes.OK)
    console.log(statusCode, responseBody)
  })
  test('TL-11-8 GET /api/accounts/{id} incorrect id', async ({ request }) => {
    const response = await request.get(baseUrl + '/api/accounts/', {
      headers: authHeader,
    })
    const responseBody = await response.json()
    const lastAccountId: number = responseBody.length
    const responseWithIncorrectId = await request.get(
      baseUrl + '/api/accounts/' + lastAccountId + 1,
      {
        headers: authHeader,
      },
    )

    const statusCode = responseWithIncorrectId.status()
    const respBody: createdAccountErrorResp = await responseWithIncorrectId.json()
    expect.soft(statusCode).toBe(StatusCodes.NOT_FOUND)
    expect.soft(respBody.error).not.toBeUndefined()
    expect.soft(respBody.error.length).toBeGreaterThan(0)
    console.log(statusCode, respBody)
  })

  test('TL-11-9 GET /api/accounts/{id} invalid id', async ({ request }) => {
    const response = await request.get(baseUrl + '/api/accounts/0', {
      headers: authHeader,
    })

    const statusCode = response.status()
    const respBody: createdAccountErrorResp = await response.json()
    expect.soft(statusCode).toBe(StatusCodes.BAD_REQUEST)
    expect.soft(respBody.error).not.toBeUndefined()
    expect.soft(respBody.error.length).toBeGreaterThan(0)
    console.log(statusCode, respBody)
  })
})

test.describe('POST /api/accounts/{id}/deposit', () => {
  test('TL-11-10 POST api/accounts/{id}/deposit with valid data', async ({ request }) => {
    const amount = new DepositDTO(10)
    const response = await request.post(baseUrl + '/api/accounts/1/deposit', {
      headers: authHeader,
      data: amount,
    })

    const respBody: createdAccountResp = await response.json()
    console.log(response.status())
    console.log(amount)
    console.log(respBody)
    expect.soft(response.status(), 'tested status OK').toBe(StatusCodes.OK)
  })
  test('TL-11-11 POST api/accounts/{id}/deposit with invalid data', async ({ request }) => {
    const amount = new DepositDTO(0)
    const response = await request.post(baseUrl + '/api/accounts/1/deposit', {
      headers: authHeader,
      data: amount,
    })

    const respBody: createdAccountResp = await response.json()
    console.log(response.status())
    console.log(amount)
    console.log(respBody)
    expect.soft(response.status(), 'tested status BAD REQUEST').toBe(StatusCodes.BAD_REQUEST)
  })
  test('TL-11-12 POST api/accounts/{id}/deposit with not a number', async ({ request }) => {
    const amount = new DepositDTO('10')
    const response = await request.post(baseUrl + '/api/accounts/1/deposit', {
      headers: authHeader,
      data: amount,
    })

    const respBody: createdAccountResp = await response.json()
    console.log(response.status())
    console.log(amount)
    console.log(respBody)
    expect.soft(response.status(), 'tested status BAD REQUEST').toBe(StatusCodes.BAD_REQUEST)
  })
  test('TL-11-13 POST api/accounts/{id}/deposit with more than 2 decimals', async ({ request }) => {
    const amount = new DepositDTO(12.255)
    const response = await request.post(baseUrl + '/api/accounts/1/deposit', {
      headers: authHeader,
      data: amount,
    })

    const respBody: createdAccountResp = await response.json()
    console.log(response.status())
    console.log(amount)
    console.log(respBody)
    expect.soft(response.status(), 'tested status BAD REQUEST').toBe(StatusCodes.BAD_REQUEST)
  })
  test('TL-11-14 POST api/accounts/{id}/deposit with invalid id', async ({ request }) => {
    const response = await request.get(baseUrl + '/api/accounts/', {
      headers: authHeader,
    })
    const responseBody = await response.json()
    const lastAccountId: number = responseBody.length

    const amount = new DepositDTO(100)
    const responseWithIncorrectId = await request.post(
      baseUrl + '/api/accounts/' + lastAccountId + 1 + '/deposit',
      {
        headers: authHeader,
        data: amount,
      },
    )

    const respBody: createdAccountResp = await responseWithIncorrectId.json()
    console.log(responseWithIncorrectId.status())
    console.log(amount)
    console.log(respBody)
    expect
      .soft(responseWithIncorrectId.status(), 'tested status NOT FOUND')
      .toBe(StatusCodes.NOT_FOUND)
  })

  test.describe('POST /api/accounts/{id}/transfer', () => {
    test('TL-11-15 POST api/accounts/{id}/transfer with valid id', async ({ request }) => {
      const transfer = new TransferDTO(3, 100)
      const response = await request.post(baseUrl + '/api/accounts/1/transfer', {
        headers: authHeader,
        data: transfer,
      })
      const respBody: createdAccountResp = await response.json()
      console.log(response.status())
      console.log(respBody)
      expect(response.status(), 'tested status 200').toBe(StatusCodes.OK)
    })
    test('TL-11-16 POST api/accounts/{id}/transfer with insufficient funds', async ({
      request,
    }) => {
      const responseData = await request.get(baseUrl + '/api/accounts/1', {
        headers: authHeader,
      })

      const respBodyAccount: createdAccountResp = await responseData.json()
      expect(responseData.status()).toBe(StatusCodes.OK)
      const transfer = new TransferDTO(1, respBodyAccount.balance + 1)
      const response = await request.post(baseUrl + '/api/accounts/3/transfer', {
        headers: authHeader,
        data: transfer,
      })
      const respBody: createdAccountResp = await response.json()
      console.log(response.status())
      console.log(respBody)
      expect(response.status(), 'tested status CONFLICT').toBe(StatusCodes.CONFLICT)
    })
    test.fail('TL-11-17 POST api/accounts/{id}/transfer to the same id', async ({ request }) => {
      const transfer = new TransferDTO(1, 100)
      const response = await request.post(baseUrl + '/api/accounts/1/transfer', {
        headers: authHeader,
        data: transfer,
      })
      const respBody: createdAccountResp = await response.json()
      console.log(response.status())
      console.log(respBody)
      expect(response.status(), 'tested status 200').toBe(StatusCodes.BAD_REQUEST)
    })
    test.fail(
      'TL-11-18 POST api/accounts/{id}/transfer with different currencies',
      async ({ request }) => {
        const responseDataId1 = await request.get(baseUrl + '/api/accounts/1', {
          headers: authHeader,
        })
        const responseDataId2 = await request.get(baseUrl + '/api/accounts/2', {
          headers: authHeader,
        })

        const respBodyAccountId1: createdAccountResp = await responseDataId1.json()
        console.log(respBodyAccountId1.currency)
        expect(responseDataId1.status()).toBe(StatusCodes.OK)
        const respBodyAccountId2: createdAccountResp = await responseDataId2.json()
        console.log(respBodyAccountId2.currency)
        expect(responseDataId2.status()).toBe(StatusCodes.OK)
        expect(respBodyAccountId1.currency).not.toBe(respBodyAccountId2.currency)
        const transfer = new TransferDTO(1, 10)
        const response = await request.post(baseUrl + '/api/accounts/2/transfer', {
          headers: authHeader,
          data: transfer,
        })
        expect.soft(response.status(), 'tested status BAD REQUEST').toBe(StatusCodes.BAD_REQUEST)
      },
    )

    test('TL-11-19 POST api/accounts/{id}/transfer with invalid amount', async ({ request }) => {
      const transfer = new TransferDTO(3, 0)
      const response = await request.post(baseUrl + '/api/accounts/1/transfer', {
        headers: authHeader,
        data: transfer,
      })
      const respBody: createdAccountResp = await response.json()
      console.log(response.status())
      console.log(respBody)
      expect(response.status(), 'tested status BAD REQUEST').toBe(StatusCodes.BAD_REQUEST)
    })
    test('TL-11-20 POST api/accounts/{id}/transfer if recipient does not exist', async ({
      request,
    }) => {
      const responseAll = await request.get(baseUrl + '/api/accounts/', {
        headers: authHeader,
      })
      const responseBody = await responseAll.json()
      const lastAccountId: number = responseBody.length

      const transfer = new TransferDTO(lastAccountId + 1, 100)
      const response = await request.post(baseUrl + '/api/accounts/1/transfer', {
        headers: authHeader,
        data: transfer,
      })
      const respBody: createdAccountResp = await response.json()
      console.log(response.status())
      console.log(respBody)
      expect(response.status(), 'tested status NOT FOUND').toBe(StatusCodes.NOT_FOUND)
    })
  })
})
