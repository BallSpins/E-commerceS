export async function handleRegistration(event) {
    event.preventDefault()

    const username = document.getElementById('registerusername').value
    const email = document.getElementById('registeremail').value
    const password = document.getElementById('registerpassword').value
    const confirmpassword = document.getElementById('registerconfirmpassword').value

    if(password !== confirmpassword) {
        alert('Password do not match')
        return
    }

    const pattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
    if(!pattern.test(password)) {
        alert('Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character.');
        return;
    }

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, email })
        })

        const result = await response.json()
        
        if (response.ok) {
            alert(result.message)
        } else {
            alert(result.message) 
        }
    } catch (error) {
        alert('Error: ' + error.message)
    }
}
