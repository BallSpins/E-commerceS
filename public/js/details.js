Vue.createApp({
    data() {
        return {
            product: {},
            quantity: 1,
            id: '',
            username: ''
        }
    },
    mounted() {
        this.username = localStorage.getItem('username')
        this.id = window.location.pathname.split('/').pop()
        this.getdata().then(() => console.log(this.product.name))
    },
    methods: {
        async getdata() {
            try {
                const response = await fetch(`/api/products/${this.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                const result = await response.json()
                console.log(result)

                if(result.ok) {
                    this.product = result.data
                } else {
                    alert(`Product with id: ${this.id} doesnt exist`)
                    window.location.href = '/'
                }
            } catch (error) {
                console.error('Error when fetching data: ', error)
                alert('Error when fetching data')
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
        async addToCart() {
            if(this.username) {
                console.log(this.id)
                try {
                    const response = await fetch('/api/cart/add', {
                        method: 'POST',
                        headers: {
                            'Content-Type' : 'application/json'
                        },
                        body: JSON.stringify({
                            username: this.username,
                            productId: this.id,
                            qty: this.quantity
                        })
                    })

                    const result = await response.json()

                    if(result.ok) {
                        alert(result.message)
                    } else {
                        alert(result.message)
                    }
                } catch (error) {
                    console.error('Error adding to cart: ', error)
                    alert('Error adding to cart')
                }
            } else {
                alert('You need to logged in to have this feature')
            }
        }
    },
    computed: {
        getTotal() {
            return this.product.price * this.quantity
        }
    }
}).mount('#app')

document.querySelector('.tombol').addEventListener('click', () => window.location.href = '/')