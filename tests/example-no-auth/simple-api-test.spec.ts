import { StatusCodes } from 'http-status-codes'
import { expect, test } from '@playwright/test'

test.describe('Get /product/{id}', () => {
  test('get product with correct id should receive code 200', async ({ request }) => {
    // Build and send a GET request to the server
    const response = await request.get('https://shop.tl-academy.ee/api/products/1')

    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status, body and headers
    console.log('response body:', responseBody)
    // Check if the response status is 200
    expect(statusCode).toBe(StatusCodes.OK)
  })

  test('get product with incorrect id should receive code - 404', async ({ request }) => {
    const allProductsResponse = await request.get('https://shop.tl-academy.ee/api/products')
    const allProductsBody = await allProductsResponse.json()
    const lastProductId: number = allProductsBody.length

    const oneProductResponse = await request.get(
      'https://shop.tl-academy.ee/api/products/' + (lastProductId + 1),
    )
    const oneProductBody = await oneProductResponse.json()
    console.log('https://shop.tl-academy.ee/api/products/' + (lastProductId + 1))
    const oneProductStatusCode = oneProductResponse.status()

    console.log('response body:', oneProductBody)
    expect(oneProductStatusCode).toBe(StatusCodes.NOT_FOUND)
  })

  test('get product with incorrect id should receive code 400', async ({ request }) => {
    const response = await request.get('https://shop.tl-academy.ee/api/products/q123hjkl45fhdjur')

    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('get product with negative id should receive code 400', async ({ request }) => {
    const response = await request.get('https://shop.tl-academy.ee/api/products/-1')

    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
  test('get product with incorrect id with number first should receive code 400', async ({
    request,
  }) => {
    const response = await request.get('https://shop.tl-academy.ee/api/products/1hjkdfsg')

    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

test.describe('Post /product', () => {
  test('post product with correct data should receive code 201', async ({ request }) => {
    const requestBody = {
      name: 'Orange',
      category: 'Fruit',
      price: 2.39,
      quantity: 10,
    }
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.CREATED)
    expect(typeof responseBody.name).toBe('string')
    expect(typeof responseBody.price).toBe('number')
  })

  test('post product with incorrect data (empty name) should receive code 400', async ({
    request,
  }) => {
    const requestBody = {
      name: '',
      category: 'Fruit',
      price: 13,
      quantity: 10,
    }
    // Send a POST request to the server
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status and body
    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
  test('post product with incorrect data (price is a string) should receive code 400', async ({
    request,
  }) => {
    // prepare request body
    const requestBody = {
      name: 'Apple',
      category: 'Fruit',
      price: '12',
      quantity: 10,
    }
    // Send a POST request to the server
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status and body
    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
  test('post product with incorrect data (with negative quantity) should receive code 400', async ({
    request,
  }) => {
    // prepare request body
    const requestBody = {
      name: 'Grape',
      category: 'Fruit',
      price: 9,
      quantity: -10,
      available: true,
    }
    // Send a POST request to the server
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status and body
    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
  test('post product with incorrect data (without category) should receive code 400', async ({
    request,
  }) => {
    const requestBody = {
      name: 'Banana',
      price: 9,
      quantity: 10,
      available: true,
    }
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
  test('post product with incorrect data (without name) should receive code 400', async ({
    request,
  }) => {
    const requestBody = {
      category: 'Fruit',
      price: 9,
      quantity: 10,
      available: true,
    }
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
  test('post product with incorrect data (without price) should receive code 400', async ({
    request,
  }) => {
    // prepare request body
    const requestBody = {
      name: 'Pineapple',
      category: 'Fruit',
      quantity: 10,
      available: true,
    }
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
  test.fail('post product with incorrect data (with negative price) should receive code 400', async ({
    request,
  }) => {
    // prepare request body
    const requestBody = {
      name: 'Peach',
      category: 'Fruit',
      price: -9,
      quantity: 10,
      available: true,
    }
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
  test.fail('post product with incorrect data (with no quantity and availability true) should receive code 400', async ({
    request,
  }) => {
    // prepare request body
    const requestBody = {
      name: 'Pear',
      category: 'Fruit',
      price: 9,
      available: true,
    }
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
  test.fail('post product with incorrect data (with quantity 0 and availability true) should receive code 400', async ({
    request,
  }) => {
    // prepare request body
    const requestBody = {
      name: 'Mango',
      category: 'Fruit',
      price: 2,
      quantity: 0,
      available: true,
    }
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})
