document.addEventListener("DOMContentLoaded", function () {
  // ===== Existing code (preserved) =====
  // ===== Scroll to Top Functionality =====
  const scrollTopButton = document.querySelector(".scroll-top");

  scrollTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  window.addEventListener("scroll", () => {
    scrollTopButton.style.display = window.pageYOffset > 300 ? "flex" : "none";
  });

  // Initialize with hidden scroll button
  scrollTopButton.style.display = "none";

  // ===== Mouse Pointer Effects =====
  const syncPointer = ({ x: pointerX, y: pointerY }) => {
    document.documentElement.style.setProperty("--x", pointerX.toFixed(2));
    document.documentElement.style.setProperty(
      "--xp",
      (pointerX / window.innerWidth).toFixed(2)
    );
    document.documentElement.style.setProperty("--y", pointerY.toFixed(2));
    document.documentElement.style.setProperty(
      "--yp",
      (pointerY / window.innerHeight).toFixed(2)
    );
  };

  document.body.addEventListener("pointermove", syncPointer);

  // ===== Login/Register Form Toggle =====
  const registerBtn = document.querySelector(".register-btn");
  const loginBtn = document.querySelector(".login-btn");
  const form = document.querySelector(".form-box");

  if (registerBtn && loginBtn && form) {
    registerBtn.addEventListener("click", () => {
      form.classList.toggle("change-form");
    });

    loginBtn.addEventListener("click", () => {
      form.classList.toggle("change-form");
    });
  }

  // ===== Search Functionality =====
  const searchContainer = document.querySelector(".search-container");

  if (searchContainer) {
    const searchInput = searchContainer.querySelector("input");
    const searchButton = searchContainer.querySelector("button");
    const posts = Array.from(document.querySelectorAll(".post"));

    // Add clear button dynamically
    const clearButton = document.createElement("button");
    clearButton.setAttribute("aria-label", "Clear search");
    clearButton.className = "clear-search"; // Apply the existing clear-search class
    clearButton.innerHTML = '<i class="fa fa-times"></i>'; // Add the icon

    // Hide clear button initially if input is empty
    if (!searchInput.value) {
      clearButton.style.display = "none";
    }

    // Responsive adjustment function
    function adjustSearchLayout() {
      const containerWidth = searchContainer.offsetWidth;
      const buttonWidth = searchButton.offsetWidth;

      // Set the input width dynamically based on container size
      searchInput.style.width = containerWidth - buttonWidth - 20 + "px";

      // Position the button appropriately
      searchButton.style.left = containerWidth - buttonWidth + 10 + "px";

      // Position clear button if visible
      if (clearButton.style.display !== "none") {
        clearButton.style.right = buttonWidth + 15 + "px";
      }
    }

    function performSearch() {
      const searchTerm = searchInput.value.toLowerCase().trim();

      if (searchTerm === "") {
        posts.forEach((post) => (post.style.display = "block"));
        clearButton.style.display = "none";
        return;
      }

      clearButton.style.display = "block";

      posts.forEach((post) => {
        const textContent = [
          post.querySelector(".post-title"),
          post.querySelector(".post-excerpt"),
          post.querySelector(".post-category"),
          post.querySelector(".post-author"),
        ]
          .map((el) => el?.textContent.toLowerCase() || "")
          .join(" ");

        post.style.display = textContent.includes(searchTerm)
          ? "block"
          : "none";
      });
    }

    function clearSearch() {
      searchInput.value = "";
      performSearch();
      searchInput.focus();
    }

    // Event listeners
    searchButton.addEventListener("click", performSearch);
    searchInput.addEventListener("keyup", function (e) {
      if (e.key === "Enter") performSearch();

      // Show/hide clear button based on input content
      clearButton.style.display = this.value ? "block" : "none";

      // Readjust layout after showing/hiding clear button
      adjustSearchLayout();
    });
    clearButton.addEventListener("click", clearSearch);

    // Call adjustment on load and resize
    adjustSearchLayout();
    window.addEventListener("resize", adjustSearchLayout);

    // Also adjust when the sidebar might change size
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      const resizeObserver = new ResizeObserver(adjustSearchLayout);
      resizeObserver.observe(sidebar);
    }
  }

  // ===== Track Recently Clicked Posts =====
  // Function to store post info in local storage
  function storeRecentlyViewedPost(postData) {
    // Get current list or initialize new one
    let recentPosts = JSON.parse(localStorage.getItem("recentPosts") || "[]");

    // Check if this post already exists in the list
    const existingIndex = recentPosts.findIndex(
      (post) => post.title === postData.title
    );
    if (existingIndex !== -1) {
      // Remove the existing entry
      recentPosts.splice(existingIndex, 1);
    }

    // Add new post at the beginning (most recent)
    recentPosts.unshift(postData);

    // Keep only the most recent 3 posts
    recentPosts = recentPosts.slice(0, 3);

    // Save to local storage
    localStorage.setItem("recentPosts", JSON.stringify(recentPosts));

    // Update the sidebar
    updateRecentPostsSidebar();
  }

  // Function to update the recent posts sidebar
  function updateRecentPostsSidebar() {
    const recentPostsList = document.querySelector(".recent-posts");
    if (!recentPostsList) return;

    const recentPosts = JSON.parse(localStorage.getItem("recentPosts") || "[]");

    // If we have recent posts, update the sidebar
    if (recentPosts.length > 0) {
      // Clear current list
      recentPostsList.innerHTML = "";

      // Add each recent post
      recentPosts.forEach((post) => {
        const listItem = document.createElement("ol");
        listItem.className = "recent-post";

        listItem.innerHTML = `
          <img src="${post.image}" alt="${post.title}" class="recent-post-image">
          <div class="recent-post-info">
            <h4 class="recent-post-title">
              <a href="${post.link}"><span>${post.title}</span></a>
            </h4>
            <span class="recent-post-date">${post.date}</span>
          </div>
        `;

        recentPostsList.appendChild(listItem);
      });
    }
  }

  // Add event listeners to all "READ MORE" buttons
  const readMoreButtons = document.querySelectorAll(".post button");
  readMoreButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Get the parent post
      const post = this.closest(".post");
      if (!post) return;

      // Extract post data
      const postData = {
        title: post.querySelector(".post-title").textContent.trim(),
        image: post.querySelector(".post-image").src,
        date: post.querySelector(".post-date").textContent.trim(),
        // Use the href from the button's link
        link: this.querySelector("a").getAttribute("href"),
      };

      // Store it
      storeRecentlyViewedPost(postData);
    });
  });

  // Initialize recent posts sidebar on page load
  updateRecentPostsSidebar();

  // ===== NEW FEATURE: Login/Logout Button Toggle =====
  function updateLoginButton() {
    const loginButton = document.querySelector("header button a span");
    if (!loginButton) return;

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    // Update button text based on login state
    loginButton.textContent = isLoggedIn ? "LOGOUT" : "LOGIN";

    // If we're on the index page, handle logout functionality
    const loginButtonParent = loginButton.closest("a");
    if (loginButtonParent) {
      // Remove any existing click event listeners by cloning and replacing the element
      const newLoginButton = loginButtonParent.cloneNode(true);
      loginButtonParent.parentNode.replaceChild(
        newLoginButton,
        loginButtonParent
      );

      // Add the appropriate event listener based on login state
      if (isLoggedIn) {
        // If logged in, handle logout on click
        newLoginButton.addEventListener("click", function (e) {
          e.preventDefault();
          localStorage.setItem("isLoggedIn", "false");
          localStorage.removeItem("userEmail");
          updateLoginButton(); // Update button text immediately
        });

        // Keep the button on the same page but update its href to ensure correct state if page is refreshed
        newLoginButton.setAttribute("href", "#");
      } else {
        // If not logged in, navigate to login page
        newLoginButton.setAttribute("href", "login.html");
      }
    }
  }

  // Call the function on page load
  updateLoginButton();
});
