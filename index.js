const express = require('express')
const axios = require('axios')
const path = require('path')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

const apiUrl = process.env.API_URL
const apiKey = process.env.API_KEY

// app

app.get('/', (res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/auth/:auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'user-auth.html'))
})

app.get('/product/:id', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'details.html'))
})

app.get('/cart', (req, res) => {
    if(!req.cookies.username) {
        return res.redirect('/')
    }
    res.sendFile(path.join(__dirname, 'public', 'pages', 'cart.html'))
})

// server

// serve all product data
app.get('/api/products', async (req, res) => {
    try {
        const response = await axios.post(`${apiUrl}action/find`, {
            collection: 'products',
            database: process.env.DB_NAME,
            dataSource: process.env.CLUSTER_NAME
        }, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            }
        })
    
        const products = response.data.documents
    
        if(products) {
            res.json({ ok: true, data: products })
        } else {
            res.json({ ok: false, data: null })
        }
    } catch (error) {
        console.error('Error fetching products: ', error)
        res.status(500).json({ ok: false, message: 'Error fetching products' })
    }
})

//  serve product based by id
app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params

    try {
        const response = await axios.post(`${apiUrl}action/findOne`, {
            collection: 'products',
            database: process.env.DB_NAME,
            dataSource: process.env.CLUSTER_NAME,
            filter: { id }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            }
        })

        const product = response.data.document

        if(product) {
            res.json({ ok: true, data: product })
        } else {
            res.json({ ok: false, message: 'Product not found' })
        }
    } catch (error) {
        console.error('Error fetching products: ', error)
        res.status(500).json({ ok: false, message: 'Error fetching products' })
    }
})

// gets cart items
app.get('/api/cart/:username', async (req, res) => {
    const {username} = req.params
    console.log(username)

    try {
        const response = await axios.post(`${apiUrl}action/findOne`, {
            collection: 'users',
            database: process.env.DB_NAME,
            dataSource: process.env.CLUSTER_NAME,
            filter: { username }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            }
        })

        const user = response.data.document
        console.log(response)

        if(user) {
            res.json({ ok: true, data: user.cart })
        } else {
            res.json({ ok: false, data: null })
        }
    } catch (error) {
        console.error('Error fetching cart data: ', error)
        res.status(500).json({ ok: false, message: 'Error fetching cart data' })
    }
})

app.post('/api/cart/add', async (req, res) => {
    const { username, productId, qty } = req.body
    const qtyInt = parseInt(qty, 10)

    try {
        const productResponse = await axios.post(`${apiUrl}action/findOne`, {
            collection: 'products',
            database: process.env.DB_NAME,
            dataSource: process.env.CLUSTER_NAME,
            filter: { id: productId }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            }
        })

        const product = productResponse.data.document
        console.log(productResponse)

        if(!product) {
            return res.json({ ok: false, message: 'No product found' })
        }
        
        const userResponse = await axios.post(`${apiUrl}action/findOne`, {
            collection: 'users',
            database: process.env.DB_NAME,
            dataSource: process.env.CLUSTER_NAME,
            filter: { username }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            }
        })
        
        const user = userResponse.data.document

        if(!user) {
            return res.json({ ok: false, message: 'User not found' })
        }

        const userCart = user.cart || []
        const productInCart = userCart.find(item => item.productId === productId)

        if(productInCart) {
            productInCart.qty += qtyInt
        } else {
            userCart.push({
                productId: productId,
                name: product.name,
                price: product.price,
                qty: qtyInt
            })
        }

        const updateResponse = await axios.post(`${apiUrl}action/updateOne`, {
            collection: 'users',
            database: process.env.DB_NAME,
            dataSource: process.env.CLUSTER_NAME,
            filter: { username },
            update: {
                $set: { cart: userCart }
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            }
        })

        if(updateResponse.data.matchedCount === 1) {
            res.json({ ok: true, message: 'Product added to cart' })
        } else {
            res.json({ ok: false, message: 'Failed to update user cart' })
        }
    } catch (error) {
        console.error('Error adding to cart: ', error)
        res.status(500).json({ ok: false, message: 'Error adding to cart' })
    }
})

app.post('/api/cart/checkout/:username', async (req, res) => {
    const { username } = req.params
    const { items } = req.body

    try {
        const response = await axios.post(`${apiUrl}action/findOne`, {
            collection: 'users',
            database: process.env.DB_NAME,
            dataSource: process.env.CLUSTER_NAME,
            filter: { username }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            }
        })

        const user = response.data.document

        const stockUpdates = []

        for(const itemToCheckout of items) {
            const productId = itemToCheckout.id
            const qty = parseInt(itemToCheckout.qty, 10)

            const productResponse = await axios.post(`${apiUrl}action/findOne`, {
                collection: 'products',
                database: process.env.DB_NAME,
                dataSource: process.env.CLUSTER_NAME,
                filter: { id: productId }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey
                }
            })

            const product = productResponse.data.document
            if (!product) {
                return res.json({ ok: false, message: `Product with ID ${productId} not found` });
            }

            if (product.stock < qty) {
                return res.json({ ok: false, message: `Not enough stock for ${product.name}` });
            }

            console.log(`Updating stock for product: ${product.name}. Current stock: ${product.stock}, Quantity to reduce: ${qty}`)
            product.stock -= qty

            stockUpdates.push({
                productId,
                newStock: product.stock
            })
        }

        for(const { productId, newStock } of stockUpdates) {
            await axios.post(`${apiUrl}action/updateOne`, {
                collection: 'products',
                database: process.env.DB_NAME,
                dataSource: process.env.CLUSTER_NAME,
                filter: { id: productId },
                update: { $set: { stock: newStock } }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey
                }
            })
        }

        const updatedCart = user.cart.filter(cartItem => {
            return !items.some(itemToCheckout => itemToCheckout.id === cartItem.productId && itemToCheckout.checkout)
        })

        await axios.post(`${apiUrl}action/updateOne`, {
            collection: 'users',
            database: process.env.DB_NAME,
            dataSource: process.env.CLUSTER_NAME,
            filter: { username },
            update: {
                $set: { cart: updatedCart }
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            }
        })

        res.json({ ok: true, message: 'Checkout successful' })
    } catch (error) {
        console.error('Error during checkout: ', error)
        res.status(500).json({ ok: false, message: 'Error during checkout'})
    }
})

// authorization
app.post('/auth/register', async (req, res) => {
    const { username, password, email } = req.body

    try {
        const existingUserResponse = await axios.post(`${apiUrl}action/findOne`, {
            collection: 'users',
            database: process.env.DB_NAME,
            dataSource: process.env.CLUSTER_NAME,
            filter: {username}    
        }, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            }
        })
        
        const existingUser = existingUserResponse.data.documents

        if(existingUser) {
            return res.status(409).json({ ok: false, message: 'Username already taken' })
        }

        const hashedPwd = await bcrypt.hash(password, 10)

        const response = await axios.post(`${apiUrl}action/insertOne`, {
            collection: 'users',
            database: process.env.DB_NAME,
            dataSource: process.env.CLUSTER_NAME,
            document: {
                username: username,
                email: email,
                password: hashedPwd,
                cart: []
            }    
        }, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            }
        })

        if(response.data.insertedId) {
            res.json({ ok: true, message: 'Registration successful!' })
        } else {
            res.status(500).json({ ok: false, message: 'Registration failed' })
        }
    } catch (error) {
        console.error('Error during registration: ', error)
        res.status(500).json({ ok: false, message: 'Error during registration' })
    }
})

app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body
    console.log(username)

    try {
        const response = await axios.post(`${apiUrl}action/findOne`, {
            collection: 'users',
            database: process.env.DB_NAME,
            dataSource: process.env.CLUSTER_NAME,
            filter: { username }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            }
        })

        const user = response.data.document
        console.log(response.data)

        if(!user) {
            return res.status(404).json({ ok: false, message: 'No user found with this username!' })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(isMatch) {
            res.cookie('username', username, { httpOnly: true, secure: true })
            return res.json({ ok: true, message: 'Login success', user: user })
        } else {
            return res.status(401).json({ ok: false, message: 'Incorrect password' })
        }
    } catch (error) {
        console.error('Error during login: ', error)
        return res.status(500).json({ ok: false, message: 'Error during login' })
    }
})

app.post('/auth/logout', (req, res) => {
    res.clearCookie('username')
    res.redirect('/')
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`)
})