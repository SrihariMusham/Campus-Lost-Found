const BASE_URL = "";

function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

async function apiFetch(path, options = {}) {
  const headers = options.headers instanceof Headers
    ? options.headers
    : authHeaders(options.headers || {});

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });
}

// ================= TOAST NOTIFICATION =================
function showToast(message, type = "success") {
  const existingToast = document.querySelector(".toast-notification");

  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = `toast-notification ${type}`;

  const icon = type === "success" ? "✓" : "✕";

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// ================= CHECK ADMIN =================
const role = localStorage.getItem("role");

if (role === "admin") {
  const adminLink = document.getElementById("adminLink");
  if (adminLink) adminLink.style.display = "block";
}

// ================= LOGIN =================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await apiFetch("/login", {
    method: "POST",
    headers: {
    "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
});

const data = await res.json();

const errorEl = document.getElementById("loginError");

if (data.token) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.role);
  window.location.href = "index.html";
} else {
  if (errorEl) errorEl.innerText = data.message;
}
  });
}

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

if (usernameInput && passwordInput) {
  usernameInput.addEventListener("input", () => {
    const err = document.getElementById("loginError");
    if (err) err.innerText = "";
  });

  passwordInput.addEventListener("input", () => {
    const err = document.getElementById("loginError");
    if (err) err.innerText = "";
  });
}

// ================= SIGNUP =================
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value;

    try {
      const res = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const text = await res.text();

      if (!res.ok) {
        showToast(text || "Registration failed");
        return;
      }

      showToast("Registration successful!");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);

    } catch (error) {
      console.error("Signup error:", error);
      showToast("Unable to connect to the server.");
    }
  });
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}

// ================= CHECK LOGIN =================
function checkAuth() {
  const token = localStorage.getItem("token");

  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  if (!token && !["login.html", "signup.html"].includes(currentPage)) {
    window.location.href = "login.html";
    return;
  }

  if (currentPage === "admin.html" && localStorage.getItem("role") !== "admin") {
    window.location.href = "index.html";
  }
}
checkAuth();

// ================= SEARCH =================
const searchInput = document.getElementById("searchInput");

if (searchInput) {
  searchInput.addEventListener("keyup", function () {
    const value = searchInput.value.toLowerCase();
    const boxes = document.querySelectorAll(".box");

    boxes.forEach(box => {
      box.style.display = box.innerText.toLowerCase().includes(value)
        ? ""
        : "none";
    });
  });
}

// ================= DATE & TIME `=================

function formatDateTime(dateString){

const d = new Date(dateString);

return d.toLocaleDateString(
'en-GB',
{
day:'2-digit',
month:'short',
year:'numeric'
}
) + ", " +

d.toLocaleTimeString(
'en-US',
{
hour:'numeric',
minute:'2-digit'
}
);

}
// ================= LOST FORM =================
const lostForm = document.getElementById("lostForm");

if (lostForm) {
  lostForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const item = {
      ownerName:document.getElementById("ownerName").value,
      name: document.getElementById("itemName").value,
      location: document.getElementById("location").value,
      date: document.getElementById("date").value,
      description: document.getElementById("description").value,
      email: document.getElementById("email").value,
       phone:document.getElementById("phone").value,
    
    };

    await apiFetch(`/lost`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(item)
    });

    lostForm.innerHTML = `
    <div style="text-align:center;padding:30px;">
<i class="fa-solid fa-circle-check"
style="
color:#22c55e;
font-size:60px;
margin-bottom:15px;">
</i>

<h2>Item Reported Successfully!</h2>

</div>`;
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);

  });
}

// ================= DISPLAY LOST =================
const lostContainer = document.getElementById("lostItemsContainer");

if (lostContainer) {
  apiFetch(`/lost`)
    .then(res => res.json())
    .then(data => {
      if(data.length===0){
        lostContainer.innerHTML=`
        <div class="empty-state">
        <i class="fa-solid fa-magnifying-glass"></i>
        <h3>No Lost Items Reported</h3>
        <p>Nothing has been reported lost.</p>
      </div>
      `;
      return;
      }
      data.forEach(item => {
        const div = document.createElement("div");
        div.className = "box";

        div.innerHTML = `
          <div class="card-img">
            <span class="status-badge lost-badge">LOST</span>
          </div>
          <div class="card-content">
            <h3>${item.name}</h3>

            <p class="card-location"><i class="fa-solid fa-location-dot"></i>
          ${item.location}</p>
              <p class="card-date"><i class="fa-solid fa-calendar"></i>
          ${formatDateTime(item.date)}</p>
              <p class="card-email"><i class="fa-solid fa-envelope"></i>
          ${item.email}</p>
          <button class = "claim-btn" onclick="window.location.href=
          'return-claim.html?id=${item.id}&name=${encodeURIComponent(item.name)}'">
          Return Item
          </button>
          </div>
          `;

        lostContainer.appendChild(div);
      });
    });
}

// ================= FOUND FORM =================
const foundForm = document.getElementById("foundForm");

if (foundForm) {
  foundForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("ownerName", document.getElementById("ownerName").value);
    formData.append("itemName", document.getElementById("itemName").value);
    formData.append("location", document.getElementById("location").value);
    formData.append("date", document.getElementById("date").value);
    formData.append("description", document.getElementById("description").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("phone", document.getElementById("phone").value);

    const file = document.getElementById("image").files[0];
    if (file) {
      formData.append("image", file);
    }

    const res = await apiFetch(`/found`, {
      method: "POST",
      body: formData
    });

    const text = await res.text();
    console.log(text);

    foundForm.innerHTML = `
    <div style="text-align:center;padding:30px;">
    <i class="fa-solid fa-circle-check"
    style="
    color:#22c55e;
    font-size:60px;
    margin-bottom:15px;">
    </i>
    <h2>Item Reported Successfully!</h2>
    </div>`;

    setTimeout(() => {
      window.location.href = "index.html";
    }, 3000);

  });
}

// ================= DISPLAY FOUND =================
const foundContainer = document.getElementById("foundItemsContainer");

if (foundContainer) {
  apiFetch(`/found`)
    .then(res => res.json())
    .then(data => {

      if(data.length===0){
        foundContainer.innerHTML=`
        <div class="empty-state">
        <i class="fa-solid fa-box-open"></i>
        <h3>No Found Items Yet</h3>
        <p>No items have been reported found.</p>
        </div>
        `;
        return;
      }

      data.forEach(item=>{
        const div = document.createElement("div");
        div.className = "box";

        div.innerHTML = `
          <div class="card-img">
            <img src="${item.image ? `/uploads/${item.image}` : '/assets/default.svg'}" />
            <span class="status-badge">FOUND</span>
          </div>
          <div class="card-content">
            <h3>${item.name}</h3>
                <p class="card-location"><i class="fa-solid fa-location-dot"></i>
            ${item.location}</p>
                <p class="card-date"><i class="fa-solid fa-calendar-days"></i>
            ${formatDateTime(item.date)}</p>
                <p class="card-email"><i class="fa-solid fa-envelope"></i>
            ${item.email}</p>
            <button class="claim-btn"
            onclick="
            window.location.href=
            'claim.html?id=${item.id}&type=found&name=${encodeURIComponent(item.name)}'
            ">
            Claim Item
            </button>
            </div>
            `;
        foundContainer.appendChild(div);
      });
    });
}

// ================= CLAIM FORM =================
const claimForm = document.getElementById("claimForm");

if (claimForm) {

  const urlParams = new URLSearchParams(window.location.search);

  const itemIdFromUrl = urlParams.get("id");
  const typeFromUrl = urlParams.get("type");
  const itemNameFromUrl = urlParams.get("name");

  const itemIdInput = document.getElementById("itemId");
  if (itemIdInput && itemIdFromUrl) {
    itemIdInput.value = itemIdFromUrl;
  }

  const itemNameInput =
document.getElementById("itemName");

if(itemNameInput && itemNameFromUrl){
 itemNameInput.value = decodeURIComponent(itemNameFromUrl);
}

  // OPTIONAL: show type in UI if you have input
  const typeInput = document.getElementById("type");
  if (typeInput && typeFromUrl) {
    typeInput.value = typeFromUrl;
  }

  claimForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const claim = {
      item_id: itemIdFromUrl,
      type: typeFromUrl,
      email: document.getElementById("email").value,
      description: document.getElementById("description").value,
      name: document.getElementById("name").value
    };

    const res = await apiFetch(`/claim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(claim)
    });

    const text = await res.text();

    claimForm.innerHTML = 
    `<div style="text-align:center;padding:30px;">
    <i class="fa-solid fa-circle-check"
    style="
    color:#22c55e;
    font-size:60px;
    margin-bottom:15px;">
    </i>

    <h2>Return Request Submitted!</h2>

    <p>
    Your request has been sent for admin approval.
    </p>
    </div>
    `
    setTimeout(() => {
    window.location.href = "index.html";
    }, 3000);
  });
}

function showToast(message){

const toast=
document.getElementById("toast");

toast.innerText=message;
toast.classList.add("show");

setTimeout(()=>{
toast.classList.remove("show");
},2500);

}

// ================= ADMIN PANEL =================
const adminLost = document.getElementById("adminLost");
const adminFound = document.getElementById("adminFound");

// LOAD LOST ITEMS
if (adminLost) {
  apiFetch(`/lost`)
    .then(res => res.json())
    .then(data => {
      if(data.length===0){
        adminLost.innerHTML=`
        <div class="empty-state">
        <i class="fa-solid fa-magnifying-glass"></i>
        <h3>No Lost Items</h3>
        <p>No lost items reported yet.</p>
        </div>
        `;
        return;
        }
      data.forEach(item => {
        const div = document.createElement("div");
        div.className = "box";

        div.innerHTML = `
          <div class="card-content">
          <h3>${item.name}</h3>
          <p class="card-location"><i class="fa-solid fa-location-dot"></i>${item.location}</p>
          <p class="card-date"><i class="fa-solid fa-calendar-days"></i>${formatDateTime(item.date)}</p>
          <p class="card-email"><i class="fa-solid fa-envelope"></i>${item.email}</p>
          <p class="card-desc">📝 ${item.description || "No description"}</p>
          <div class="admin-actions">
          <button class="delete-btn" onclick="deleteLost(${item.id})">Delete</button>
          </div>
          </div>
          `;

        adminLost.appendChild(div);
      });
    });
}

// LOAD FOUND ITEMS
if (adminFound) {
  apiFetch(`/found`)
    .then(res => res.json())
    .then(data => {
      if(data.length===0){
        adminFound.innerHTML=`
        <div class="empty-state">
        <i class="fa-solid fa-box-open"></i>
        <h3>No Found Items</h3>
        <p>No found items available.</p>
        </div>
        `;
        return;
        }
      data.forEach(item => {
        const div = document.createElement("div");
        div.className = "box";

        div.innerHTML = `
          <div class="card-img">
            <img src="${item.image ? `/uploads/${item.image}` : '/assets/default.svg'}" />
            <span class="status-badge admin-badge">FOUND</span>
          </div>
          <div class="card-content">
          <h3>${item.name}</h3>
          <p class="card-location"><i class="fa-solid fa-location-dot"></i>${item.location}</p>
          <p class="card-date"><i class="fa-solid fa-calendar-days"></i>${formatDateTime(item.date)}</p>
          <p class="card-email"><i class="fa-solid fa-envelope"></i>${item.email}</p>
          <p class="card-desc">📝 ${item.description || "No description"}</p>
          <div class="admin-actions">
          <button class="delete-btn" onclick="deleteFound(${item.id})">Delete</button>
          </div>
          </div>
          `;

        adminFound.appendChild(div);
      });
    });
}

// DELETE FUNCTIONS
function deleteLost(id) {
  apiFetch(`/lost/${id}`, { method: "DELETE" })
    .then(() => location.reload());
}

function deleteFound(id) {
  apiFetch(`/found/${id}`, { method: "DELETE" })
    .then(() => location.reload());
}

// ================= DROPDOWN =================
function toggleDropdown() {
  const menu = document.getElementById("dropdownMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

window.onclick = function(e) {
  if (!e.target.closest(".account")) {
    const menu = document.getElementById("dropdownMenu");
    if (menu) menu.style.display = "none";
  }
};

// ================= LOAD CLAIMS (ADMIN) =================
const adminClaims = document.getElementById("adminClaims");

if (adminClaims) {
  apiFetch(`/claims`)
    .then(res => res.json())
    .then(data => {

      if(data.length===0){
        adminClaims.innerHTML=`
        <div class="empty-state">
        <i class="fa-solid fa-file-circle-xmark"></i>
        <h3>No Pending Claims</h3>
        <p>No claims submitted yet.</p>
        </div>
        `;
        return;
        }
      
      const pendingClaims=
        data.filter(c=>c.status==="pending");

        if(pendingClaims.length===0){
        adminClaims.innerHTML=`
        <div class="empty-state">
        <i class="fa-solid fa-circle-check"></i>
        <h3>No Pending Claims</h3>
        <p>All requests have been processed.</p>
        </div>
        `;
        return;
        }

      pendingClaims.forEach(c=>{

        if (c.status !== "pending") return;
        const div = document.createElement("div");
        div.className = "box";

        div.innerHTML = `
        <div class="card-content">
         <h3>Claim Request</h3>

          <p><b>Request Type:</b> ${c.type === 'lost'  ? 'Return Request'  : 'Claim Request'}</p>
          <p class="card-email">📧 ${c.user_email || 'User'}</p>
          <p class="claim-description"><b>Claim Details:</b><br>${c.description}</p>
          <p>Status: 
          <span style="color:${
            c.status === 'approved' ? 'green' :
            c.status === 'rejected' ? 'red' : 'orange'
            }">${c.status}
          </span>
          </p>

          <div class="admin-actions">
              <button class="approve-btn" onclick="approveClaim(${c.id})">Approve</button>
              <button class="reject-btn" onclick="rejectClaim(${c.id})">Reject</button>
          </div>
        </div>
        `;
        adminClaims.appendChild(div);
      });
    });
}

async function approveClaim(id){

await apiFetch(
`/claims/${id}/approve`,
{method:"POST"}
);

showToast("✅ Claim Approved");

setTimeout(()=>{
location.reload();
},1000);

}

function rejectClaim(id){

apiFetch(
`/claims/${id}/reject`,
{method:"POST"}
)
.then(()=>{
showToast("❌ Claim Rejected");

setTimeout(()=>{
location.reload();
},1000);

});

}

/* ========= RETURN ITEM PAGE ========= */

const returnClaimForm =
document.getElementById("returnClaimForm");

if(returnClaimForm){

 const params =
 new URLSearchParams(window.location.search);

 document.getElementById("itemId").value =
 params.get("id") || "";

 document.getElementById("itemName").value =
 params.get("name") || "";


 returnClaimForm.addEventListener(
 "submit",
 async function(e){

   e.preventDefault();

   const payload={
    name:
    document.getElementById("name").value,

     item_id:
      document.getElementById("itemId").value,

     type:"lost",

     email:
      document.getElementById("email").value,

     description:
      document.getElementById("description").value
   };


   await apiFetch(`/claim`,{
      method:"POST",
      headers:{
       "Content-Type":"application/json"
      },
      body:JSON.stringify(payload)
   });


   returnClaimForm.innerHTML=`
<div style="text-align:center;padding:30px;">
<i class="fa-solid fa-circle-check"
style="
color:#22c55e;
font-size:60px;
margin-bottom:15px;">
</i>

<h2>Return Request Submitted!</h2>

<p>
Your request has been sent for admin approval.
</p>
</div>
`;
   setTimeout(()=>{
      window.location.href="index.html";
   },3000);

 });

}

// ================= AUTO FILL ITEM ID =================
const urlParams = new URLSearchParams(window.location.search);
const itemIdFromUrl = urlParams.get("id");

const itemIdInput = document.getElementById("itemId");

if (itemIdInput && itemIdFromUrl) {
  itemIdInput.value = itemIdFromUrl;
}

//================== CONTACT ==================

function sendContact(e){
e.preventDefault();

document.getElementById("contactForm").innerHTML=
`
<div style="text-align:center;padding:40px;">
<i class="fa-solid fa-circle-check"
style="
font-size:60px;
color:#22c55e;">
</i>

<h2>Message Sent!</h2>
<p>We’ll get back to you soon.</p>
</div>
`;
}
