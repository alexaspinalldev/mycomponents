// Close the modal when the user clicks outside of it
document.addEventListener('click', (event) => {
    const modal = document.getElementById('contactModal') as HTMLDialogElement
    if (event.target === modal) {
        modal.close()
    }
})

// Validate the form on submit
const submit = document.getElementById('contactSubmit') as HTMLButtonElement
submit.addEventListener('click', validateForm)

// Reset the field error when someone edits it
document.querySelectorAll('.formInput').forEach((el) => {
    el.addEventListener('input', (e) => {
        el.classList.remove('error')
        // If they edit the phone or email fields, remove the error from both
        if (el.querySelector('input[type="email"], input[type="tel"]')) {
            document
                .querySelectorAll('input[type="email"], input[type="tel"]')
                .forEach((el) => {
                    el.closest('.formInput')?.classList.remove('error')
                })
        }
    })
})

function validateForm() {
    // Reset all errors
    document.querySelectorAll('.formInput').forEach((el) => {
        el.classList.remove('error')
    })

    let hasErrors: boolean = false // Track validation failures
    let noEmail = false // Track if they've not provided any email details
    let noPhone = false // Track if they've not provided any phone details

    // Regex for email and phone number validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^(?:\+\d{1,4}[ -]?)?(?:\d{2,4}[ -]?)?\d{4,}$/

    document.querySelectorAll('.formInput').forEach((el) => {
        const input = el.querySelector('input')
        const textarea = el.querySelector('textarea')

        // Check if the email and phone number are valid, if present
        if (input?.type === 'email' || input?.type === 'tel') {
            if (input?.type === 'email') {
                if (!input?.value.trim()) {
                    // Mark if email is not present
                    noEmail = true
                } else if (!input.value.match(emailRegex)) {
                    el.classList.add('error')
                    hasErrors = true
                }
            }

            if (input?.type === 'tel') {
                if (!input?.value.trim()) {
                    // Mark if phone number is not present
                    noPhone = true
                } else if (!input.value.match(phoneRegex)) {
                    el.classList.add('error')
                    hasErrors = true
                }
            }
        } else if (
            // Check if the other inputs have a value at all
            (input && !input.value.trim()) ||
            (textarea && !textarea.value.trim())
        ) {
            el.classList.add('error')
            hasErrors = true // Mark form as invalid
        }
    })

    // If they've not provided any contact details, show the user specific field errors
    if (noEmail && noPhone) {
        document.querySelectorAll('input[type="email"], input[type="tel"]').forEach((el) => {
            el.closest('.formInput')?.classList.add('error')
        })
        hasErrors = true
    }

    // If no errors, submit form
    if (!hasErrors) {
        // Allow the form to update the DOM before submitting
        setTimeout(() => submitForm(), 0)
    }
}

function submitForm() {
    // Get the form and honeypot field
    const form = document.getElementById('form') as HTMLFormElement
    const email2 = document.getElementById('email2') as HTMLInputElement

    // Check the honeypot (bot detection)
    if (email2?.value.trim()) {
        alert('Error submitting form')
        return
    }

    // Convert FormData to a JSON object
    const formData = new FormData(form)
    const formObject = Object.fromEntries(formData.entries()) // Convert FormData to a plain object

    // Send the form data
    fetch('https://submit-form.com/GgNg0BrQ3', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify(formObject) // Send plain JSON, not wrapped in `{ message: formObject }`
    })
        .then((response) => {
            if (!response.ok) throw new Error('Network response was not ok')
            console.log('Success:', response)
            submit.innerText = `Thanks! I'll be in touch soon`
            submit.disabled = true
            submit.removeEventListener('click', validateForm)
        })
        .catch((error) => {
            console.error('Error:', error)
        })
}
