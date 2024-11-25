const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        document.getElementById('reset-password-btn').addEventListener('click', async () => {
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const errorMessage = document.getElementById('error-message');
            const successMessage = document.getElementById('success-message');

            // Reset messages
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';

            if (newPassword !== confirmPassword) {
                errorMessage.textContent = "Passwords do not match.";
                errorMessage.style.display = 'block';
                return;
            }

            try {
                // Send a POST request to reset the password
                const response = await fetch(`https://nealfeng.duckdns.org/reset_password/${token}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: newPassword })
                });

                const data = await response.json();

                if (response.ok) {
                    successMessage.textContent = "Your password has been updated!";
                    successMessage.style.display = 'block';
                } else {
                    errorMessage.textContent = data.error || "Failed to reset password.";
                    errorMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Error:', error);
                errorMessage.textContent = "An error occurred. Please try again.";
                errorMessage.style.display = 'block';
            }
        });