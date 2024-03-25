// reviews-widget.js

let reviews = []; // Declare reviews in the outer scope
let currentIndex = 0;

function initWidget(config) {
    const baseUrl = config.baseUrl;
    const entityId = config.entityId;

    fetchReviews(baseUrl, entityId)
        .then((fetchedReviews) => {
            reviews = fetchedReviews;
            displayNextReview();
        })
        .catch((error) => {
            console.error("Error fetching reviews:", error);
        });
}

function displayNextReview() {
    const carouselContainer = document.getElementById("review-carousel");
    carouselContainer.innerHTML = ""; // Clear carousel container

    if (!Array.isArray(reviews) || reviews.length === 0) {
        carouselContainer.textContent = "No reviews available.";
        return;
    }

    const review = reviews[currentIndex];
    const reviewElement = createReviewElement(review);
    carouselContainer.appendChild(reviewElement);

    currentIndex = (currentIndex + 1) % reviews.length; // Cycle through reviews

    setTimeout(displayNextReview, 5000); // Display next review after 5 seconds
}

function createReviewElement(review) {
    const reviewElement = document.createElement('div');
    reviewElement.classList.add('review');
    reviewElement.innerHTML = `
        <div class="review-details">
            <p><strong>Date:</strong> ${formatDate(review.reviewDate)}</p>
            <p><strong>Author:</strong> ${review.authorName}</p>
            <p><strong>Rating:</strong> ${getStarIcons(review.rating, review.publisher)}</p>
            ${review.content ? `<p><strong>Review:</strong> ${review.content}</p>` : ''}
        </div>
    `;
    return reviewElement;
}

function getStarIcons(rating, publisher) {
    // Function to get star icons based on rating
}

function formatDate(dateString) {
    // Function to format date
}

async function fetchReviews(baseUrl, entityId) {
    const apiUrl = `${baseUrl}entity/${entityId}/reviews`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch reviews: ${response.statusText}`);
        }

        const reviews = await response.json();

        // Check if the response or docs property is undefined or null
        const docs = reviews?.response?.docs;

        // If docs is undefined or null or an empty array, return an empty array
        return Array.isArray(docs) ? docs : [];
    } catch (error) {
        console.error('Error fetching reviews:', error);
        throw error;
    }
}
