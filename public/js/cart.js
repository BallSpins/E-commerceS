function back() {
    window.location.href = '/'
}

Vue.createApp({
    data() {
        return {
            cart: [],
            username: ''
        }
    },
    mounted() {
        this.username = localStorage.getItem('username')
        this.setTitle()
        this.syncdata().then(console.log(this.cart))
    },
    methods: {
        async syncdata() {
            try {
                const response = await fetch(`/api/cart/${this.username}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                const result = await response.json()
                console.log(result)

                if(result.ok) {
                    console.log('before: ', result.data)
                    this.cart = result.data.map(item => ({...item, checkout: false}))
                    console.log('After: ', this.cart)
                } else {
                    this.cart = []
                }
            } catch (error) {
                console.error('Error fetching cart data: ', error)
                alert('Error fetching cart data')
            }
        },
        async checkout() {
            const itemToCheckout = this.cart.filter(item => item.checkout)
            console.log(itemToCheckout)

            if(itemToCheckout.length === 0) {
                alert('Please select items to checkout')
                return
            }

            const items = itemToCheckout.map(item => ({
                id: item.productId, 
                qty: item.qty ,
                checkout: item.checkout
            }))
            console.log(items)

            try {
                const response = await fetch(`/api/cart/checkout/${this.username}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ items })
                })

                const result = await response.json()

                if(result.ok) {
                    alert(result.message)
                    this.syncdata()
                } else {
                    alert(result.message)
                }
            } catch (error) {
                console.error('Error during checkout: ', error)
                alert('Error during checkout')
            }
        },
        formatCurrency(val) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(val)
        },
        setTitle() {
            document.title = `${this.username}'s Cart`
        }
    },
    computed: {
        getAllPrice() {
            let total = 0
            let checkedOutItems = this.cart.filter(elem => elem.checkout)
            checkedOutItems.forEach(elem => {
                let sum = elem.qty * elem.price
                total += sum
            })
            return total
        }
    }
}).mount('#app')