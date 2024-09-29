import { handleLogin } from './login.js'
import { handleRegistration } from './register.js'

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname
    const authType = path.split('/')[2]

    if (authType === 'register') {
        switchToRegister()
    } else {
        switchToLogin()
    }
})

function switchToRegister() {
    const outerWrap = document.querySelector("form")
    outerWrap.classList.add("swapped") // Add swapped class for animation

    setTimeout(() => {
        document.querySelector('.left-wrap').innerHTML = `
            <h3>Register</h3>
            <input type="text" id="registerusername" placeholder="Name *" required>
            <input type="email" id="registeremail" placeholder="Email *" required>
            <input type="password" id="registerpassword" placeholder="Password *" required>
            <input type="password" id="registerconfirmpassword" placeholder="Re-Type Password *" required>
            <p id="check"><input type="checkbox" required> I agree with the <a href="#" id="hyper">terms and conditions</a></p>
        `

        document.querySelector('.right-wrap').innerHTML = `
            <button type="submit" class="signup" id="signup">Signup</button>
            <button type="button" class="login"><i class="fa-brands fa-google"></i> Login with Google</button>
            <p>Found a bug? <a href="#">Report it here</a></p>
            <p>Already have an account? <a href="#" id="loginLink">Login here</a></p>
        `

        const signupButton = document.getElementById('signup')
        signupButton.removeEventListener("click", handleRegistration) 
        signupButton.addEventListener("click", handleRegistration)

        document.getElementById("loginLink").addEventListener("click", (e) => {
            e.preventDefault()
            switchToLogin()
        })
    }, 300)
}

function switchToLogin() {
    const outerWrap = document.querySelector("form")
    outerWrap.classList.remove("swapped") // Remove swapped class for animation

    setTimeout(() => {
        document.querySelector('.left-wrap').innerHTML = `
            <h3>Login</h3>
            <input type="text" id="username" placeholder="Name *" required>
            <input type="password" id="password" placeholder="Password *" required>
            <p id="check"><input type="checkbox"> Remember me</p>
        `

        document.querySelector('.right-wrap').innerHTML = `
            <button type="submit" class="signup" id="login">Login</button>
            <button type="button" class="login"><i class="fa-brands fa-google"></i> Login with Google</button>
            <p>Found a bug? <a href="#">Report it here</a></p>
            <p>Don't have an account? <a href="#" id="registerLink">Register here</a></p>
        `

        const loginButton = document.getElementById('login')
        loginButton.removeEventListener("click", handleLogin) 
        loginButton.addEventListener("click", handleLogin)

        document.getElementById("registerLink").addEventListener("click", (e) => {
            e.preventDefault()
            switchToRegister()
        })
    }, 300)
}