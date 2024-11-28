//This file was partially generated using chatGPT 4o
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const landingPage = document.getElementById('landing-page');
const loginButton = document.getElementById('login-btn');
const registerButton = document.getElementById('register-btn');
const logoutButton = document.getElementById('logout-btn');
const generateButton = document.getElementById('generate-btn');
const userInfo = document.getElementById('user-info');
const generatedResponse = document.getElementById('generated-response');
const showRegisterLink = document.getElementById('show-register-link');
const showLoginLink = document.getElementById('show-login-link');
const adminDashboard = document.getElementById('admin-dashboard');
const userList = document.getElementById('user-list');
const userStats = document.getElementById("user-stats");
const endpointStats = document.getElementById("endpoint-list");
const forgotPasswordForm = document.getElementById('forgot-password-form');
const forgotPasswordButton = document.getElementById('forgot-password-btn');
const showForgotPasswordLink = document.getElementById('show-forgot-password-link');
const showLoginLinkFromForgot = document.getElementById('show-login-link-from-forgot');

// Store JWT token in localStorage
const storeToken = (token) => {
    localStorage.setItem('jwt', token);
};

// Retrieve JWT token from localStorage
const getToken = () => localStorage.getItem('jwt');

// Clear JWT token on logout
const clearToken = () => localStorage.removeItem('jwt');

// Show login form and hide others
const showLoginForm = () => {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    landingPage.style.display = 'none';
};

// Show registration form and hide others
const showRegisterForm = () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    landingPage.style.display = 'none';
};

// Show landing page and hide others
const showLandingPage = () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    landingPage.style.display = 'block';
};

// Handle login button click 
loginButton.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('https://nealfeng.duckdns.org/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            storeToken(data.access_token);
            document.getElementById('prompt').value = '';
            
            showLandingPage();
            fetchUserInfo();
            
            if (data.is_admin) {
                showAdminDashboard();  
            }
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});

// Handle register button click
registerButton.addEventListener('click', async () => {
    const firstName = document.getElementById('register-first-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch('https://nealfeng.duckdns.org/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ first_name: firstName, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful! You can now log in.');
            showLoginForm();
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});

// Fetch user info and display it on the landing page

const fetchUserInfo = async () => {
    const token = getToken();
    if (token) {
        try {
            const response = await fetch('https://nealfeng.duckdns.org/landing', {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${getToken()}` 
                }
            });
    
            const data = await response.json();
            if (response.ok) {
                userInfo.innerHTML = `
                    <strong>Name:</strong> ${data.first_name}<br>
                    <strong>Email:</strong> ${data.email}<br>
                    <strong>API Calls Left:</strong> ${data.api_calls_left}
                `;
                if (data.is_admin) {
                    showAdminDashboard();
                }
            } else {
                showLoginForm();
                clearToken();
                alert(data.error || 'Failed to fetch user info');
            }
        } catch (error) {
            console.error('Error:', error);
            showLoginForm();
            clearToken();
        }
    } else {
        showLoginForm();
    }
    
};

// Handle text generation
generateButton.addEventListener('click', async () => {
    const prompt = document.getElementById('prompt').value;

    try {
        const response = await fetch('https://nealfeng.duckdns.org/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();
        if (response.ok) {
            generatedResponse.textContent = data.response;

            await fetchUserInfo();
        } else {
            alert(data.error || 'Failed to generate text');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Handle logout button click
logoutButton.addEventListener('click', () => {
    adminDashboard.style.display = 'none';
    
    userList.innerHTML = '';
    endpointStats.innerHTML = '';
    userStats.innerHTML = '';
    clearToken();
    
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('prompt').value = '';
    showLoginForm();
    generatedResponse.textContent = '';
});

// Link for switching between login and registration forms
showRegisterLink.addEventListener('click', showRegisterForm);
showLoginLink.addEventListener('click', showLoginForm);

// Check if user is already logged in (JWT token exists)
document.addEventListener('DOMContentLoaded', () => {
    if (getToken()) {
        showLandingPage();
        fetchUserInfo();
    } else {
        showLoginForm();
    }
});

// Check if the user is an admin and show the admin dashboard if true
const showAdminDashboard = async () => {
    const response = await fetch('https://nealfeng.duckdns.org/admin/users', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    });

    const data = await response.json();
    console.log("Admin Dashboard Data:", data); //debugging purpose

    const statsResponse = await fetch('https://nealfeng.duckdns.org/admin/endpoint_stats', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    });
    const statsData = await statsResponse.json();
    console.log("All Stats:", statsData); //debugging purpose

    if (response.ok) {
        userList.innerHTML = '';
        endpointStats.innerHTML= '';
        userStats.innerHTML = '';

        const truncateToken = (token, maxLength = 20) => {
            if (token.length > maxLength) {
                return `${token.substring(0, maxLength)}...`;
            }
            return token;
        };

        data.forEach((user, index) => {
            const stat = statsData[index] || {};
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.first_name}</td>
                <td>${user.email}</td>
                <td>${user.api_calls}</td>
                <td>
                    <button onclick="resetApiUsage(${user.id})" class="btn btn-warning btn-sm">Reset API Usage</button>
                </td>
            `;
            userList.appendChild(row);
        });
        statsData.forEach((user, index) => {
            const stat = statsData[index] || {};
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stat.method || 'N/A'}</td>
                <td>${stat.requests || '0'}</td>
                <td>${stat.endpoint || 'N/A'}</td>
            `;
            endpointStats.appendChild(row);
        });
        data.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.first_name}</td>
                <td>${user.email}</td>
                <td>${truncateToken(user.token)}</td>
                <td>${user.api_calls}</td>
            `;
            userStats.appendChild(row);
        });
        adminDashboard.style.display = 'block';
    } else {
        alert(data.error || 'Failed to fetch user info');
    }
};

// Function to reset API usage for a specific user
const resetApiUsage = async (userId) => {
    const response = await fetch(`https://nealfeng.duckdns.org/admin/reset_api_usage/${userId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    });

    const data = await response.json();
    if (response.ok) {
        alert(data.message);
        showAdminDashboard();  // Refresh the dashboard
    } else {
        alert(data.error || 'Failed to reset API usage');
    }
};

// Show Forgot Password Form and hide others
const showForgotPasswordForm = () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    landingPage.style.display = 'none';
    forgotPasswordForm.style.display = 'block';
};

// Handle Forgot Password link click
showForgotPasswordLink.addEventListener('click', showForgotPasswordForm);
showLoginLinkFromForgot.addEventListener('click', showLoginForm);

// Handle Forgot Password button click
forgotPasswordButton.addEventListener('click', async () => {
    const email = document.getElementById('forgot-email').value;

    try {
        const response = await fetch('https://nealfeng.duckdns.org/request_reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            alert("A reset link has been sent to your email.");
            showLoginForm();  // Return to login form after sending reset link
            forgotPasswordForm.style.display = 'none';
        } else {
            alert(data.error || 'Failed to send reset link');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});

const fetchEndpointStats = async () => {
    try {
        const response = await fetch('https://nealfeng.duckdns.org/admin/endpoint_stats', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();
        console.log("Endpoint Stats Data:", data); // Debugging: Check the response

        if (response.ok) {
            const userList = document.getElementById("user-list");
            userList.innerHTML = ''; // Clear existing rows

            data.forEach(stat => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${stat.method}</td>
                    <td>${stat.endpoint}</td>
                    <td>${stat.requests}</td>
                `;
                userList.appendChild(row);
            });

            document.getElementById('admin-dashboard').style.display = 'block';
        } else {
            alert(data.error || 'Failed to fetch endpoint stats');
        }
    } catch (error) {
        console.error('Error fetching endpoint stats:', error);
        alert('An error occurred while fetching endpoint stats.');
    }
};
