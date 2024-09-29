Vue.createApp({
    data() {
        return {
            products: [],
            search: '',
            productsSearched: [],
            username: ''
        }
    },
    mounted() {
        this.username = localStorage.getItem('username')
        console.log(this.username)
        // console.log(this.products)
        this.syncdata()
    },
    methods: {
        formatCurrency(val) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(val)
        },
        async syncdata() {
            try {
                const response = await fetch('/api/products', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                
                const result = await response.json()
                // console.log(result.data)
                
                if(result.ok) {
                    this.products = result.data
                } else {
                    this.products = []
                }
            } catch (error) {
                console.error('Error fetching products: ', error)
                alert('Error fetching products')
            }
        },
        searchProduct() {
            if(this.search) {
                this.productsSearched = this.products.filter(items => items.name.toLowerCase().includes(this.search.toLowerCase()))
            } else {
                this.productsSearched = []
            }
        },
        goToDetails(product) {
            window.location.href = `/product/${product.id}`
        },
        toCart() {
            !localStorage.getItem('username') ? alert('You must logged in to access cart page') : window.location.href = '/cart'
        }
    }
}).mount('#app')

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.querySelector('.logout')
    if(logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            localStorage.removeItem('username')
            await fetch('/auth/logout', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                }
            })
            alert('Logged out succesfully')
            window.location.reload()
        })
    }
})

if(localStorage.getItem('username')) {
}


function auth(type) {
    window.location.href = type === 'register' ? '/auth/register' : '/auth/login'
}