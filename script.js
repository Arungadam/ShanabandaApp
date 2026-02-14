// ===============================
// SECURITY UTILITIES
// ===============================

// Sanitize HTML to prevent XSS attacks
function sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===============================
// AUTHENTICATION SYSTEM
// ===============================

// Admin credentials - CHANGE THESE IMMEDIATELY BEFORE DEPLOYMENT
const ADMIN_CREDENTIALS = {
    //email: "admin@shanabanda.gov.in",
    //password: "gp123", // TODO: Change to strong password
    //secretCode: "A6644" // TODO: Change to random code
     email: "admin@demo.com",
    password: "Demo@123",
    secretCode: "DEMO2026"
};

// Global user state
let currentUser = null;
let currentUserType = null; // 'admin' or 'user'
let isAuthenticated = false;

// Initialize app on load
window.onload = function () {
    alert("శనబండ గ్రామ పంచాయతీ వెబ్‌సైట్‌కు స్వాగతం!");
    
    // Load user data from localStorage
    loadUserData();
    
    // Load posts
    loadPosts();
    
    // Setup complaint form
    const complaintForm = document.getElementById("complaintForm");
    if (complaintForm) {
        complaintForm.addEventListener("submit", function (e) {
            e.preventDefault();
            document.getElementById("formMessage").innerText = "మీ ఫిర్యాదు విజయవంతంగా సమర్పించబడింది!";
        });
    }
};

// ===============================
// AUTH MODAL FUNCTIONS
// ===============================

function showAdminLogin() {
    document.getElementById("authModal").style.display = "flex";
    document.getElementById("adminLoginForm").style.display = "block";
    document.getElementById("userLoginForm").style.display = "none";
    document.getElementById("userRegisterForm").style.display = "none";
    document.getElementById("adminRegisterForm").style.display = "none";
}

function showUserLogin() {
    document.getElementById("authModal").style.display = "flex";
    document.getElementById("userLoginForm").style.display = "block";
    document.getElementById("adminLoginForm").style.display = "none";
    document.getElementById("userRegisterForm").style.display = "none";
    document.getElementById("adminRegisterForm").style.display = "none";
    document.getElementById("loginMsg").innerText = "";
}

function showUserRegister() {
    document.getElementById("authModal").style.display = "flex";
    document.getElementById("userRegisterForm").style.display = "block";
    document.getElementById("userLoginForm").style.display = "none";
    document.getElementById("adminLoginForm").style.display = "none";
    document.getElementById("adminRegisterForm").style.display = "none";
    document.getElementById("regMsg").innerText = "";
}

function switchToUserLogin() {
    showUserLogin();
}

function switchToUserRegister() {
    showUserRegister();
}

function closeAuthModal() {
    document.getElementById("authModal").style.display = "none";
    document.getElementById("adminLoginMsg").innerText = "";
    document.getElementById("loginMsg").innerText = "";
    document.getElementById("regMsg").innerText = "";
}

// ===============================
// ADMIN AUTHENTICATION
// ===============================

function adminLoginHandler() {
    const email = document.getElementById("adminEmail").value.trim();
    let password = document.getElementById("adminPassword").value.trim();
    
    if (!email || !password) {
        document.getElementById("adminLoginMsg").innerText = "Please fill in all fields";
        return;
    }
    
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        currentUser = {
            email: email,
            name: "Sarpanch/Secretary"
        };
        currentUserType = "admin";
        isAuthenticated = true;
        
        // Save to localStorage
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        localStorage.setItem("currentUserType", currentUserType);
        
        document.getElementById("adminLoginMsg").innerText = "✓ Login Successful!";
        document.getElementById("adminLoginMsg").style.color = "green";
        
        setTimeout(() => {
            closeAuthModal();
            showMainContent();
        }, 1000);
    } else {
        document.getElementById("adminLoginMsg").innerText = "✗ Invalid email or password";
        document.getElementById("adminLoginMsg").style.color = "red";
    }
}

function registerAdmin() {
    const name = document.getElementById("adminName").value.trim();
    const email = document.getElementById("adminRegEmail").value.trim();
    const password = document.getElementById("adminRegPassword").value.trim();
    const confirmPassword = document.getElementById("adminRegConfirmPassword").value.trim();
    const secretCode = document.getElementById("adminSecretCode").value.trim();
    
    const msgElement = document.getElementById("adminRegMsg");
    
    if (!name || !email || !password || !confirmPassword || !secretCode) {
        msgElement.innerText = "Please fill in all fields";
        return;
    }
    
    if (password !== confirmPassword) {
        msgElement.innerText = "Passwords do not match";
        return;
    }
    
    if (password.length < 6) {
        msgElement.innerText = "Password must be at least 6 characters";
        return;
    }
    
    if (secretCode !== ADMIN_CREDENTIALS.secretCode) {
        msgElement.innerText = "Invalid Admin Secret Code";
        return;
    }
    
    // Registration successful
    msgElement.innerText = "✓ Admin registration successful! Please login.";
    msgElement.style.color = "green";
    
    setTimeout(() => {
        showAdminLogin();
    }, 1500);
}

// ===============================
// USER AUTHENTICATION
// ===============================

function registerUser() {
    const username = document.getElementById("regUsername").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const confirmPassword = document.getElementById("regConfirmPassword").value.trim();
    
    const msgElement = document.getElementById("regMsg");
    
    if (!username || !email || !password || !confirmPassword) {
        msgElement.innerText = "Please fill in all fields";
        msgElement.style.color = "red";
        return;
    }
    
    // Validate email format
    if (!validateEmail(email)) {
        msgElement.innerText = "Please enter a valid email address";
        msgElement.style.color = "red";
        return;
    }
    
    // Validate username length
    if (username.length < 3) {
        msgElement.innerText = "Username must be at least 3 characters";
        msgElement.style.color = "red";
        return;
    }
    
    if (password !== confirmPassword) {
        msgElement.innerText = "Passwords do not match";
        msgElement.style.color = "red";
        return;
    }
    
    if (password.length < 8) {
        msgElement.innerText = "Password must be at least 8 characters";
        msgElement.style.color = "red";
        return;
    }
    
    // Check if user already exists
    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        msgElement.innerText = "User with this email already exists";
        msgElement.style.color = "red";
        return;
    }
    
    // ⚠️ WARNING: This app lacks proper password hashing
    // For production, use a backend with bcrypt or similar
    // Register user
    users.push({
        username: sanitizeHTML(username),
        email: email.toLowerCase(),
        password: password // ⚠️ NEVER store plain text in production
    });
    
    localStorage.setItem("users", JSON.stringify(users));
    
    // Clear password from memory
    password = "";  // Overwrite with empty string
    confirmPassword = "";
    
    msgElement.innerText = "✓ Registration successful! Please login.";
    msgElement.style.color = "green";
    
    setTimeout(() => {
        showUserLogin();
    }, 1500);
}

function loginUser() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    
    const msgElement = document.getElementById("loginMsg");
    
    if (!email || !password) {
        msgElement.innerText = "Please fill in all fields";
        msgElement.style.color = "red";
        return;
    }
    
    // Get users from localStorage
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = {
            username: user.username,
            email: user.email
        };
        currentUserType = "user";
        isAuthenticated = true;
        
        // Save to localStorage
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        localStorage.setItem("currentUserType", currentUserType);
        
        msgElement.innerText = "✓ Login successful!";
        msgElement.style.color = "green";
        
        setTimeout(() => {
            closeAuthModal();
            showMainContent();
        }, 1000);
    } else {
        msgElement.innerText = "✗ Invalid email or password";
        msgElement.style.color = "red";
    }
}

function loadUserData() {
    const storedUser = localStorage.getItem("currentUser");
    const storedUserType = localStorage.getItem("currentUserType");
    
    if (storedUser && storedUserType) {
        currentUser = JSON.parse(storedUser);
        currentUserType = storedUserType;
        isAuthenticated = true;
        showMainContent();
    } else {
        document.getElementById("authPrompt").style.display = "block";
        document.getElementById("mainContent").style.display = "none";
        document.getElementById("mainNav").style.display = "none";
    }
}

function logout() {
    currentUser = null;
    currentUserType = null;
    isAuthenticated = false;
    
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserType");
    
    document.getElementById("authPrompt").style.display = "block";
    document.getElementById("mainContent").style.display = "none";
    document.getElementById("mainNav").style.display = "none";
    
    // Reset all sections
    hideAllSections();
    
    // Clear auth form inputs
    document.getElementById("adminEmail").value = "";
    document.getElementById("adminPassword").value = "";
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";
    document.getElementById("regUsername").value = "";
    document.getElementById("regEmail").value = "";
    document.getElementById("regPassword").value = "";
    document.getElementById("regConfirmPassword").value = "";
    
    closeAuthModal();
}

function showMainContent() {
    document.getElementById("authPrompt").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
    document.getElementById("mainNav").style.display = "block";
    
    // Update user display
    const userDisplay = document.getElementById("userDisplay");
    const logoutBtn = document.getElementById("logoutBtn");
    const adminPostBox = document.getElementById("adminPostBox");
    
    if (userDisplay) {
        if (currentUserType === "admin") {
            userDisplay.innerHTML = `👤 Admin: ${currentUser.name}`;
        } else {
            userDisplay.innerHTML = `👤 ${currentUser.username}`;
        }
    }
    
    if (logoutBtn) {
        logoutBtn.style.display = "inline-block";
    }
    
    // Show admin post box if admin is logged in
    if (adminPostBox) {
        if (currentUserType === "admin") {
            adminPostBox.style.display = "block";
        } else {
            adminPostBox.style.display = "none";
        }
    }
    
    // Show home section
    home();
}

// ===============================
// SECTION CONTROL
// ===============================

function hideAllSections() {
    const sections = [
        "home",
        "about",
        "members",
        "development",
        "notices",
        "gallery",
        "documents",
        "complaint",
        "contact"
    ];

    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = "none";
        }
    });
}

function home() { hideAllSections(); document.getElementById("home").style.display = "block"; }
function about() { hideAllSections(); document.getElementById("about").style.display = "block"; }
function members() { hideAllSections(); document.getElementById("members").style.display = "block"; }
function development() { hideAllSections(); document.getElementById("development").style.display = "block"; }
function notices() { hideAllSections(); document.getElementById("notices").style.display = "block"; loadPosts(); }
function gallery() { hideAllSections(); document.getElementById("gallery").style.display = "block"; }
function documents() { hideAllSections(); document.getElementById("documents").style.display = "block"; }
function complaint() { hideAllSections(); document.getElementById("complaint").style.display = "block"; }
function contact() { hideAllSections(); document.getElementById("contact").style.display = "block"; }

// ===============================
// ADD POST (ADMIN ONLY)
// ===============================

function addPost() {
    if (currentUserType !== "admin") {
        alert("Only admins can post work updates");
        return;
    }

    const text = document.getElementById("workPost").value.trim();
    const imageInput = document.getElementById("workImage");
    const file = imageInput.files[0];

    if (text === "" && !file) {
        document.getElementById("postMsg").innerText = "Please enter work description or select an image";
        document.getElementById("postMsg").style.color = "red";
        return;
    }

    // Limit post length to prevent abuse
    if (text.length > 2000) {
        document.getElementById("postMsg").innerText = "Post must be less than 2000 characters";
        document.getElementById("postMsg").style.color = "red";
        return;
    }

    // Limit file size (5MB)
    if (file && file.size > 5 * 1024 * 1024) {
        document.getElementById("postMsg").innerText = "Image must be less than 5MB";
        document.getElementById("postMsg").style.color = "red";
        return;
    }

    if (!file) {
        // Save post without image
        let posts = JSON.parse(localStorage.getItem("gpPosts")) || [];
        posts.push({
            id: Date.now(),
            text: text,
            image: null,
            likes: 0,
            comments: [],
            author: currentUser.name || "Admin",
            date: new Date().toLocaleDateString()
        });
        
        localStorage.setItem("gpPosts", JSON.stringify(posts));
        
        document.getElementById("workPost").value = "";
        document.getElementById("workImage").value = "";
        document.getElementById("postMsg").innerText = "✓ Post published successfully!";
        document.getElementById("postMsg").style.color = "green";
        
        setTimeout(() => {
            document.getElementById("postMsg").innerText = "";
        }, 2000);
        
        loadPosts();
    } else {
        const reader = new FileReader();
        
        reader.onload = function (e) {
            let posts = JSON.parse(localStorage.getItem("gpPosts")) || [];
            posts.push({
                id: Date.now(),
                text: text,
                image: e.target.result,
                likes: 0,
                comments: [],
                author: currentUser.name || "Admin",
                date: new Date().toLocaleDateString()
            });
            
            localStorage.setItem("gpPosts", JSON.stringify(posts));
            
            document.getElementById("workPost").value = "";
            document.getElementById("workImage").value = "";
            document.getElementById("postMsg").innerText = "✓ Post published successfully!";
            document.getElementById("postMsg").style.color = "green";
            
            setTimeout(() => {
                document.getElementById("postMsg").innerText = "";
            }, 2000);
            
            loadPosts();
        };
        
        reader.onerror = function() {
            document.getElementById("postMsg").innerText = "Error reading file. Please try again.";
            document.getElementById("postMsg").style.color = "red";
        };
        
        reader.readAsDataURL(file);
    }
}

// ===============================
// LOAD POSTS
// ===============================

function loadPosts() {
    const container = document.getElementById("postsContainer");
    if (!container) return;
    
    container.innerHTML = "";

    let posts = JSON.parse(localStorage.getItem("gpPosts")) || [];

    if (posts.length === 0) {
        container.innerHTML = "<p style='text-align: center; color: #666;'>No work updates yet</p>";
        return;
    }

    posts.slice().reverse().forEach(post => {
        let postDiv = document.createElement("div");
        postDiv.className = "post";

        // Create post header
        let headerDiv = document.createElement("div");
        headerDiv.className = "post-header";
        let authorStrong = document.createElement("strong");
        authorStrong.textContent = "Posted by: " + (post.author || "Admin");
        let dateSpan = document.createElement("span");
        dateSpan.className = "post-date";
        dateSpan.textContent = post.date || "";
        headerDiv.appendChild(authorStrong);
        headerDiv.appendChild(dateSpan);
        postDiv.appendChild(headerDiv);

        // Add image if exists
        if (post.image) {
            let img = document.createElement("img");
            img.className = "post-image";
            img.src = post.image;
            img.alt = "Work update image";
            postDiv.appendChild(img);
        }

        // Add post text (sanitized)
        let textP = document.createElement("p");
        textP.className = "post-text";
        textP.textContent = post.text; // Use textContent to prevent XSS
        postDiv.appendChild(textP);

        // Add post actions
        let actionsDiv = document.createElement("div");
        actionsDiv.className = "post-actions";
        
        let likeBtn = document.createElement("button");
        likeBtn.innerHTML = "❤️ Like (" + post.likes + ")";
        likeBtn.onclick = function() { likePost(post.id); };
        actionsDiv.appendChild(likeBtn);

        // Show delete button only for admin
        if (currentUserType === "admin") {
            let deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = "🗑️ Delete";
            deleteBtn.style.backgroundColor = "#d32f2f";
            deleteBtn.onclick = function() { deletePost(post.id); };
            actionsDiv.appendChild(deleteBtn);
        }

        postDiv.appendChild(actionsDiv);

        // Add comment box
        let commentBoxDiv = document.createElement("div");
        commentBoxDiv.className = "comment-box";
        let commentInput = document.createElement("input");
        commentInput.type = "text";
        commentInput.id = "comment-" + post.id;
        commentInput.placeholder = "Write comment...";
        commentInput.maxLength = "500"; // Limit comment length
        let commentBtn = document.createElement("button");
        commentBtn.textContent = "Comment";
        commentBtn.onclick = function() { addComment(post.id); };
        commentBoxDiv.appendChild(commentInput);
        commentBoxDiv.appendChild(commentBtn);
        postDiv.appendChild(commentBoxDiv);

        // Add comments section
        let commentsDiv = document.createElement("div");
        commentsDiv.id = "comments-" + post.id;
        commentsDiv.className = "comments-section";
        postDiv.appendChild(commentsDiv);

        container.appendChild(postDiv);

        // Load comments
        if (post.comments && post.comments.length > 0) {
            post.comments.forEach(c => {
                let commentDiv = document.createElement("div");
                commentDiv.className = "comment";
                commentDiv.textContent = c; // Use textContent to prevent XSS
                commentsDiv.appendChild(commentDiv);
            });
        }
    });
}

// ===============================
// LIKE POST
// ===============================

function likePost(id) {
    let posts = JSON.parse(localStorage.getItem("gpPosts")) || [];

    posts.forEach(post => {
        if (post.id === id) {
            post.likes++;
        }
    });

    localStorage.setItem("gpPosts", JSON.stringify(posts));
    loadPosts();
}

// ===============================
// ADD COMMENT
// ===============================

function addComment(id) {
    let posts = JSON.parse(localStorage.getItem("gpPosts")) || [];
    const input = document.getElementById(`comment-${id}`);

    if (!input) return;
    
    let commentText = input.value.trim();
    
    if (commentText === "") return;
    
    // Limit comment length to prevent abuse
    if (commentText.length > 500) {
        alert("Comment must be less than 500 characters");
        return;
    }

    posts.forEach(post => {
        if (post.id === id) {
            if (!post.comments) post.comments = [];
            // Store as plain text, will be rendered safely
            post.comments.push(commentText);
        }
    });

    localStorage.setItem("gpPosts", JSON.stringify(posts));
    input.value = ""; // Clear input
    loadPosts();
}

// ===============================
// DELETE POST (ADMIN ONLY)
// ===============================

function deletePost(id) {
    if (currentUserType !== "admin") {
        alert("Only admins can delete posts");
        return;
    }
    
    if (confirm("Are you sure you want to delete this post?")) {
        let posts = JSON.parse(localStorage.getItem("gpPosts")) || [];
        posts = posts.filter(post => post.id !== id);
        localStorage.setItem("gpPosts", JSON.stringify(posts));
        loadPosts();
    }
}