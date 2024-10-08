export async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })

        const result = await response.json();
        if (response.ok) {
            alert(result.message)

            localStorage.setItem('username', username)
            window.location.href = '/'
        } else {
            alert(result.message)
        }
    } catch (error) {
        alert('Error: ' + error.message)
    }
}